require('dotenv').config();

module.exports = {
  botNumber: process.env.BOT_NUMBER || '',
  ownerNumber: process.env.OWNER_NUMBER || '',
  storeName: process.env.STORE_NAME || 'Tarz Store',

  ai: {
    apiKey: process.env.AI_API_KEY || '',
    apiUrl: process.env.AI_API_URL || 'https://api.groq.com/openai/v1/chat/completions',
    model: process.env.AI_MODEL || 'llama-3.1-8b-instant',
  },

  // Prefix command, contoh: .menu / .ai / .sticker
  prefix: '.',

  // === DAFTAR PRODUK TOKO ===
  // "image" = nama file gambar yang taruh di folder products/images/
  // Tambah / edit / hapus produk cukup ubah array ini, tidak perlu sentuh kode lain
  categories: {
    '1': {
      name: 'Mobile Legends - Starlight',
      products: [
        { id: 'sl1', name: 'StarLight Card',         price: 'Rp 25.000', image: 'starlight_card.jpg',         desc: 'StarLight Card Mobile Legends, 1 item. Proses instan.' },
        { id: 'sl2', name: 'Premium StarLight Card', price: 'Rp 50.000', image: 'premium_starlight_card.jpg', desc: 'Premium StarLight Card Mobile Legends, 1 item. Proses instan.' },
      ],
    },
    '2': {
      name: 'Roblox',
      products: [
        { id: 'rbx1', name: 'Robux 140', price: 'Rp 10.000', image: 'robux.jpg', desc: 'Top up 140 Robux, proses instan.' },
      ],
    },
  },
};
