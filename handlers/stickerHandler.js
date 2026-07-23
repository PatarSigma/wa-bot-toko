const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

async function makeSticker(sock, msg, mediaMsg) {
  const chatId = msg.key.remoteJid;

  try {
    const buffer = await downloadMediaMessage(
      { message: mediaMsg, key: msg.key },
      'buffer',
      {},
      { logger: console }
    );

    const sticker = new Sticker(buffer, {
      pack: 'Bot Toko',
      author: 'WA Bot',
      type: StickerTypes.FULL,
      quality: 70,
    });

    const stickerBuffer = await sticker.toBuffer();
    await sock.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg });
  } catch (err) {
    console.error('[STICKER] Error:', err.message);
    await sock.sendMessage(chatId, { text: '⚠️ Gagal membuat stiker. Pastikan kirim/reply foto atau video pendek.' }, { quoted: msg });
  }
}

module.exports = { makeSticker };
