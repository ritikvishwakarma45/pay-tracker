const pdf = require('pdf-parse');

function parseGroqJSON(rawText) {
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
    console.error('Failed to parse Groq output as JSON. Raw text:', rawText);
    throw new Error('Could not parse response from Groq AI. Please try again.');
  }
}

const analyzeReceipt = async (fileBuffer, mimeType) => {
  const apiKey = process.env.GROQ_API_KEY;
  const baseUrl = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1/chat/completions';

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured on the server');
  }

  let payload;

  if (mimeType === 'application/pdf') {
    console.log('PDF statement detected. Extracting text for Groq model...');
    let textContent = '';
    try {
      const pdfData = await pdf(fileBuffer);
      textContent = pdfData.text || '';
    } catch (pdfErr) {
      console.error('PDF text extraction failed:', pdfErr);
      throw new Error('Failed to parse PDF document.');
    }

    if (!textContent.trim()) {
      throw new Error('The PDF document appears to be empty or contains no extractable text.');
    }

    payload = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert financial assistant that extracts payment and transaction details from raw text. Always respond with a valid, minified JSON object matching the requested structure.'
        },
        {
          role: 'user',
          content: `Analyze this statement/receipt text:\n\n${textContent}\n\nExtract the total transaction amount, merchant or receiver name, payment date, and infer the category (Food, Bills, Education, Entertainment, Shopping, Others) and payment mode. Return ONLY a valid, minified JSON object matching this structure: { amount: number, merchantName: string, date: string (YYYY-MM-DD), category: string, paymentMode: string }. Do not include markdown tags or any other conversational text.`
        }
      ],
      temperature: 0.1,
      max_tokens: 1024,
      response_format: { type: 'json_object' }
    };
  } else {
    // Treat as image (JPG, PNG) using vision model
    console.log(`Sending image (${mimeType}, size: ${fileBuffer.length} bytes) to Groq vision model...`);
    const base64Image = fileBuffer.toString('base64');
    
    payload = {
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this payment screenshot or bank statement. Extract the total transaction amount, merchant or receiver name, payment date, and infer the category (Food, Bills, Education, Entertainment, Shopping, Others) and payment mode. Return ONLY a valid, minified JSON object matching this structure: { amount: number, merchantName: string, date: string (YYYY-MM-DD), category: string, paymentMode: string }. Do not include markdown tags.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 1024,
      response_format: { type: 'json_object' }
    };
  }

  let response;
  let retries = 3;
  let delay = 1000;

  while (retries > 0) {
    try {
      response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 429 && retries > 1) {
          console.warn(`Rate limited (429) by Groq. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries--;
          delay *= 2; // Exponential backoff
          continue; // Try again
        } else {
          const errorText = await response.text();
          console.error('Groq API Error:', errorText);
          throw new Error(`Error communicating with Groq API (HTTP ${response.status})`);
        }
      }
      break; // Success, exit retry loop
    } catch (err) {
      if (retries <= 1) {
        throw err;
      }
      console.warn(`Request failed: ${err.message}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      retries--;
      delay *= 2;
    }
  }

  const data = await response.json();
  
  if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
    throw new Error('Groq AI returned an empty response.');
  }

  const responseText = data.choices[0].message.content;
  console.log('Groq API Response received:', responseText);

  return parseGroqJSON(responseText);
};

module.exports = { analyzeReceipt };
