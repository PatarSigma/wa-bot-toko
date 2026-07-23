const fs = require('fs');
const path = require('path');
const config = require('../config');

const IMAGES_DIR = path.join(__dirname, '..', 'products', 'images');

async function sendStoreMenu(sock, chatId, msg) {
  const rows = Object.entries(config.categories).map(([key, cat]) => ({
    title: `${key}. ${cat.name}`,
    description: `${cat.products.length} produk tersedia`,
    rowId: `toko_kategori_${key}`,
  }));

  const listMessage = {
    text: `🛒 *${config.storeName}*\n\nSilakan pilih kategori game di bawah ini:`,
    footer: 'Ketik nomor kategori juga bisa, contoh: 1',
    title: 'Menu Toko',
    buttonText: 'Lihat Kategori',
    sections: [
      {
        title: 'Kategori Produk',
        rows,
      },
    ],
  };

  try {
    await sock.sendMessage(chatId, listMessage, { quoted: msg });
  } catch (err) {
    let text = `🛒 *${config.storeName}*\n\nBalas dengan nomor kategori:\n\n`;
    for (const [key, cat] of Object.entries(config.categories)) {
      text += `*${key}.* ${cat.name}\n`;
    }
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
}

async function sendCategoryProducts(sock, chatId, categoryKey, msg) {
  const category = config.categories[categoryKey];
  if (!category) {
    await sock.sendMessage(chatId, { text: '⚠️ Kategori tidak ditemukan. Ketik *.toko* untuk lihat menu lagi.' }, { quoted: msg });
    return;
  }

  await sock.sendMessage(chatId, { text: `📦 *${category.name}*\nBerikut daftar produk yang tersedia:` }, { quoted: msg });

  for (const product of category.products) {
    const imagePath = path.join(IMAGES_DIR, product.image);
    const caption = `*${product.name}*\n💰 ${product.price}\n\n${product.desc}\n\nKetik *.beli ${product.id}* untuk pesan produk ini.`;

    if (fs.existsSync(imagePath)) {
      await sock.sendMessage(chatId, {
        image: fs.readFileSync(imagePath),
        caption,
      });
    } else {
      await sock.sendMessage(chatId, { text: `${caption}\n\n(gambar belum tersedia)` });
    }
  }
}

async function handleBuy(sock, chatId, productId, msg) {
  let found = null;
  for (const cat of Object.values(config.categories)) {
    const p = cat.products.find((x) => x.id === productId);
    if (p) found = p;
  }

  if (!found) {
    await sock.sendMessage(chatId, { text: '⚠️ Produk tidak ditemukan. Ketik *.toko* untuk lihat daftar produk.' }, { quoted: msg });
    return;
  }

  const text =
    `✅ *Pesanan diterima*\n\n` +
    `Produk: ${found.name}\n` +
    `Harga: ${found.price}\n\n` +
    `Silakan kirim:\n1. ID akun game kamu\n2. Bukti transfer\n\n` +
    `Admin akan segera memproses pesananmu. Terima kasih! 🙏`;

  await sock.sendMessage(chatId, { text }, { quoted: msg });
}

module.exports = { sendStoreMenu, sendCategoryProducts, handleBuy };
