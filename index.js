const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');
const config = require('./config');

const { setupAntiCall } = require('./handlers/callHandler');
const { askAI } = require('./handlers/aiHandler');
const { makeSticker } = require('./handlers/stickerHandler');
const { downloadTiktok, downloadInstagram } = require('./handlers/downloaderHandler');
const { sendStoreMenu, sendCategoryProducts, handleBuy } = require('./handlers/storeHandler');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

const MENU_TEXT = `👋 *Halo, Selamat datang!*

Ketik perintah di bawah ini (pakai titik di depan):

🤖 *.ai <pertanyaan>* — Ngobrol dengan AI
🖼️ *.sticker* — Kirim/reply foto lalu ketik .sticker
🎵 *.tiktok <link>* — Download video TikTok tanpa watermark
📸 *.ig <link>* — Download foto/video Instagram
🛒 *.toko* — Buka menu toko & lihat produk
❓ *.menu* — Tampilkan menu ini lagi

_Bot aktif 24 jam, fast response, dan tidak menerima panggilan telepon._`;

let isRestarting = false;

async function startBot() {
  // Pakai path dari environment variable kalau ada (misal saat deploy di Railway
  // dengan volume di /app/session), kalau tidak ada pakai folder lokal ./session
  const sessionPath = process.env.SESSION_PATH || './session';
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['Bot Toko', 'Chrome', '1.0.0'],
  });

  // === Login pakai Pairing Code (tidak perlu scan QR) ===
  if (!sock.authState.creds.registered) {
    const phoneNumber = config.botNumber || (await question('Masukkan nomor WA bot (contoh 6281234567890): '));
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, ''); // buang spasi/tanda + dll

    // Tunggu sebentar dulu sebelum minta kode pairing, supaya koneksi socket
    // ke server WhatsApp benar-benar siap (penting saat deploy di server cloud
    // seperti Railway, kalau tidak sering muncul error 428 Precondition Required)
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(cleanNumber);
        console.log(`\n=== KODE PAIRING KAMU: ${code} ===`);
        console.log('Buka WhatsApp di HP -> Perangkat Tertaut -> Tautkan dengan nomor telepon -> masukkan kode di atas.\n');
      } catch (err) {
        console.error('[PAIRING] Gagal minta kode pairing:', err.message);
      }
    }, 3000);
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Koneksi terputus.', shouldReconnect ? 'Menyambung ulang...' : 'Logout, hapus folder session lalu jalankan ulang.');
      if (shouldReconnect && !isRestarting) {
        isRestarting = true;
        setTimeout(() => {
          isRestarting = false;
          startBot();
        }, 3000);
      }
    } else if (connection === 'open') {
      console.log('✅ Bot berhasil terhubung ke WhatsApp!');
    }
  });

  // Aktifkan fitur anti-call
  setupAntiCall(sock);

  // === Router pesan masuk ===
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const chatId = msg.key.remoteJid;
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      '';

    const prefix = config.prefix;
    const isCommand = body.startsWith(prefix);
    const command = isCommand ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : '';
    const args = body.trim().split(/\s+/).slice(1).join(' ');

    try {
      // Respon list message toko (waktu user klik salah satu kategori)
      const listReply = msg.message.listResponseMessage?.singleSelectReply?.selectedRowId;
      if (listReply && listReply.startsWith('toko_kategori_')) {
        const key = listReply.replace('toko_kategori_', '');
        await sendCategoryProducts(sock, chatId, key, msg);
        return;
      }

      if (!isCommand) return;

      switch (command) {
        case 'menu':
        case 'start':
        case 'help':
          await sock.sendMessage(chatId, { text: MENU_TEXT }, { quoted: msg });
          break;

        case 'ai': {
          if (!args) {
            await sock.sendMessage(chatId, { text: 'Contoh: *.ai jelaskan apa itu fotosintesis*' }, { quoted: msg });
            break;
          }
          await sock.sendMessage(chatId, { text: '🤔 Sedang berpikir...' }, { quoted: msg });
          const answer = await askAI(args);
          await sock.sendMessage(chatId, { text: answer }, { quoted: msg });
          break;
        }

        case 'sticker':
        case 's': {
          const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
          const mediaMsg = quoted || msg.message;
          const hasMedia = mediaMsg.imageMessage || mediaMsg.videoMessage;
          if (!hasMedia) {
            await sock.sendMessage(chatId, { text: 'Kirim foto/video lalu caption *.sticker*, atau reply foto/video dengan *.sticker*' }, { quoted: msg });
            break;
          }
          await makeSticker(sock, msg, mediaMsg);
          break;
        }

        case 'tiktok':
        case 'tt': {
          if (!args) {
            await sock.sendMessage(chatId, { text: 'Contoh: *.tiktok https://vt.tiktok.com/xxxxx*' }, { quoted: msg });
            break;
          }
          await sock.sendMessage(chatId, { text: '⏳ Sedang download video TikTok...' }, { quoted: msg });
          const result = await downloadTiktok(args);
          if (!result) {
            await sock.sendMessage(chatId, { text: '⚠️ Gagal download. Pastikan link TikTok valid.' }, { quoted: msg });
            break;
          }
          await sock.sendMessage(chatId, { video: { url: result.videoUrl }, caption: result.title }, { quoted: msg });
          break;
        }

        case 'ig':
        case 'instagram': {
          if (!args) {
            await sock.sendMessage(chatId, { text: 'Contoh: *.ig https://www.instagram.com/p/xxxxx*' }, { quoted: msg });
            break;
          }
          await sock.sendMessage(chatId, { text: '⏳ Sedang download dari Instagram...' }, { quoted: msg });
          const urls = await downloadInstagram(args);
          if (!urls) {
            await sock.sendMessage(chatId, { text: '⚠️ Gagal download. Link tidak valid atau API sedang bermasalah.' }, { quoted: msg });
            break;
          }
          for (const u of urls) {
            const isVideo = u.includes('.mp4');
            await sock.sendMessage(chatId, isVideo ? { video: { url: u } } : { image: { url: u } });
          }
          break;
        }

        case 'toko':
        case 'store':
          await sendStoreMenu(sock, chatId, msg);
          break;

        case 'beli':
        case 'buy':
          if (!args) {
            await sock.sendMessage(chatId, { text: 'Contoh: *.beli ml1*' }, { quoted: msg });
            break;
          }
          await handleBuy(sock, chatId, args.trim(), msg);
          break;

        default:
          // angka langsung dianggap pilihan kategori toko (fallback non-list)
          if (config.categories[command]) {
            await sendCategoryProducts(sock, chatId, command, msg);
          }
          break;
      }
    } catch (err) {
      console.error('[ROUTER] Error:', err.message);
      await sock.sendMessage(chatId, { text: '⚠️ Terjadi kesalahan, coba lagi ya.' }, { quoted: msg }).catch(() => {});
    }
  });
}

startBot();
