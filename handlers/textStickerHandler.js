const { Sticker, StickerTypes } = require('wa-sticker-formatter');

function buildSvg(text) {
  const width = 512;
  const height = 512;
  const maxCharsPerLine = 18;
  const words = text.trim().split(/\s+/);

  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  const limitedLines = lines.slice(0, 10);

  const fontSize = limitedLines.length <= 3 ? 56 : limitedLines.length <= 6 ? 40 : 30;
  const lineHeight = fontSize * 1.3;
  const startY = height / 2 - ((limitedLines.length - 1) * lineHeight) / 2;

  const escapeXml = (str) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const tspans = limitedLines
    .map((line, i) => `<tspan x="50%" y="${startY + i * lineHeight}">${escapeXml(line)}</tspan>`)
    .join('');

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#ffffff"/>
      <text
        font-family="Arial, sans-serif"
        font-weight="bold"
        font-size="${fontSize}"
        fill="#000000"
        text-anchor="middle"
        dominant-baseline="middle"
      >${tspans}</text>
    </svg>
  `;
}

async function makeTextSticker(sock, msg, text) {
  const chatId = msg.key.remoteJid;

  if (!text || !text.trim()) {
    await sock.sendMessage(
      chatId,
      { text: 'Contoh: *.teks Halo Dunia*' },
      { quoted: msg }
    );
    return;
  }

  try {
    const sharp = require('sharp');

    const svg = buildSvg(text);
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

    const sticker = new Sticker(pngBuffer, {
      pack: 'Bot Toko',
      author: 'WA Bot',
      type: StickerTypes.FULL,
      quality: 90,
    });

    const stickerBuffer = await sticker.toBuffer();
    await sock.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg });
  } catch (err) {
    console.error('[TEXT-STICKER] Error:', err.message);
    await sock.sendMessage(
      chatId,
      { text: '⚠️ Gagal membuat stiker teks. Fitur ini mungkin sedang tidak tersedia di server.' },
      { quoted: msg }
    );
  }
}

module.exports = { makeTextSticker };
