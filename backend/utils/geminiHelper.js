const { GoogleGenerativeAI } = require('@google/generative-ai');

function parseGeminiJSON(rawText) {
  let cleaned = rawText.trim();
  
  // Strip markdown ```json code block if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```$/, '');
  }
  
  try {
    const parsed = JSON.parse(cleaned.trim());
    
    // Normalize properties to prevent mongoose validation issues
    const normalized = {
      amount: Number(parsed.amount) || 0,
      merchantName: parsed.merchantName || 'Unknown Merchant',
      date: parsed.date ? new Date(parsed.date) : new Date(),
      category: ['Food', 'Bills', 'Education', 'Entertainment', 'Shopping', 'Others'].includes(parsed.category)
        ? parsed.category
        : 'Others',
      paymentMode: ['UPI', 'Credit Card', 'Debit Card', 'Cash'].includes(parsed.paymentMode)
        ? parsed.paymentMode
        : 'UPI',
      isAIGenerated: true
    };

    // If date is invalid, fallback to current date
    if (isNaN(normalized.date.getTime())) {
      normalized.date = new Date();
    }

    return normalized;
  } catch (error) {
    console.error('Failed to parse Gemini output as JSON. Raw text:', rawText);
    throw new Error('Could not parse response from Gemini. Please try again.');
  }
}

const analyzeReceipt = async (fileBuffer, mimeType) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables.');
  }

  // Initialize Generative AI
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Prepare content parts for Gemini
  const filePart = {
    inlineData: {
      data: fileBuffer.toString('base64'),
      mimeType: mimeType
    }
  };

  const prompt = "Analyze this payment screenshot or bank statement. Extract the total transaction amount, merchant or receiver name, payment date, and infer the category (Food, Bills, Education, Entertainment, Shopping, Others) and payment mode. Return ONLY a valid, minified JSON object matching this structure: { amount: number, merchantName: string, date: string (YYYY-MM-DD), category: string, paymentMode: string }. Do not include markdown tags.";

  console.log(`Sending file (${mimeType}, size: ${fileBuffer.length} bytes) to Gemini API...`);
  const result = await model.generateContent([prompt, filePart]);
  const responseText = result.response.text();
  console.log('Gemini API Response received:', responseText);

  // Clean and Parse JSON
  return parseGeminiJSON(responseText);
};

module.exports = { analyzeReceipt };
