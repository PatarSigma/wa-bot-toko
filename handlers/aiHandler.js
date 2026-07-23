const axios = require('axios');
const config = require('../config');

async function askAI(question) {
  if (!config.ai.apiKey) {
    return '⚠️ Fitur AI belum aktif. Owner bot belum mengisi AI_API_KEY di file .env';
  }

  try {
    const response = await axios.post(
      config.ai.apiUrl,
      {
        model: config.ai.model,
        messages: [
          { role: 'system', content: 'Kamu adalah asisten AI ramah di bot WhatsApp. Jawab singkat, jelas, dan sopan berbahasa Indonesia.' },
          { role: 'user', content: question },
        ],
        max_tokens: 512,
      },
      {
        headers: {
          Authorization: `Bearer ${config.ai.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const answer = response.data?.choices?.[0]?.message?.content;
    return answer ? answer.trim() : 'Maaf, AI tidak memberikan jawaban.';
  } catch (err) {
    console.error('[AI] Error:', err.response?.data || err.message);
    return '⚠️ Terjadi kesalahan saat menghubungi AI. Coba lagi beberapa saat.';
  }
}

module.exports = { askAI };
