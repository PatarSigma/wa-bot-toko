const { Sticker, StickerTypes } = require('wa-sticker-formatter');

function buildSvg(text) {
  const width = 512;
  const height = 512;
  const padding = 36;
  const usableWidth = width - padding * 2;

  const cleanText = text.trim().replace(/\s+/g, ' ');
  const totalChars = cleanText.length;

  let fontSize;
  if (totalChars <= 15) fontSize = 72;
  else if (totalChars <= 30) fontSize = 58;
  else if (totalChars <= 50) fontSize = 46;
  else if (totalChars <= 80) fontSize = 36;
  else if (totalChars <= 120) fontSize = 28;
  else fontSize = 22;

  const avgCharWidth = fontSize * 0.56;
  const maxCharsPerLine = Math.max(1, Math.floor(usableWidth / avgCharWidth));

  const words = cleanText.split(' ');
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

  const limitedLines = lines.slice(0, 12);
  const lineHeight = fontSize * 1.15;
  const startY = height / 2 - ((limitedLines.length - 1) * lineHeight) / 2;

  const escapeXml = (str) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const tspans = limitedLines
    .map((line, i) => `<tspan x="${padding}" y="${startY + i * lineHeight}">${escapeXml(line)}</tspan>`)
    .join('');

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#ffffff"/>
      <text
        font-family="DejaVu Sans, Arial, sans-serif"
        font-weight="bold"
        font-size="${fontSize}"
        fill="#000000"
        text-anchor="start"
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
