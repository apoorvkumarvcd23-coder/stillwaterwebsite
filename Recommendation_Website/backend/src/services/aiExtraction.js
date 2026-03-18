const OpenAI = require("openai");

const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL || process.env.OPENROUTER_BASE_URL;
const model =
  process.env.OPENAI_MODEL || process.env.OPENROUTER_MODEL || "gpt-3.5-turbo";

const clientOptions = {
  apiKey: apiKey || "dummy_key",
};

if (baseURL) {
  clientOptions.baseURL = baseURL;
}

if (process.env.OPENROUTER_SITE_URL || process.env.OPENROUTER_APP_NAME) {
  clientOptions.defaultHeaders = {
    ...(process.env.OPENROUTER_SITE_URL
      ? { "HTTP-Referer": process.env.OPENROUTER_SITE_URL }
      : {}),
    ...(process.env.OPENROUTER_APP_NAME
      ? { "X-Title": process.env.OPENROUTER_APP_NAME }
      : {}),
  };
}

const openai = new OpenAI(clientOptions);

/**
 * Extracts health signals (symptoms and conditions) from free-form text.
 * @param {string} text
 * @returns {Promise<{symptoms: string[], conditions: string[]}>}
 */
async function extractHealthSignals(text) {
  try {
    if (!apiKey) {
      console.warn("No AI API key provided. Returning empty extraction.");
      return { symptoms: [], conditions: [] };
    }

    const prompt = `
      Extract the health symptoms and conditions from the following user input.
      Return the output strictly as a JSON object with two arrays: 'symptoms' and 'conditions'.
      
      Example:
      User input: "My eyes hurt after long coding sessions"
      Output: {"symptoms": ["eye strain"], "conditions": []}

      User input: "${text}"
    `;

    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return {
      symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : [],
      conditions: Array.isArray(parsed.conditions) ? parsed.conditions : [],
    };
  } catch (error) {
    console.error("Failed to extract health signals via AI provider:", error);
    return { symptoms: [], conditions: [] };
  }
}

module.exports = { extractHealthSignals };
