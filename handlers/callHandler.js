function setupAntiCall(sock) {
  sock.ev.on('call', async (calls) => {
    for (const call of calls) {
      if (call.status === 'offer') {
        try {
          await sock.rejectCall(call.id, call.from);

          await sock.sendMessage(call.from, {
            text: '📵 Maaf, nomor ini adalah *Bot Otomatis* dan tidak menerima panggilan telepon/video call.\n\nSilakan chat teks saja ya, ketik *.menu* untuk melihat semua fitur.',
          });

          console.log(`[ANTI-CALL] Panggilan dari ${call.from} ditolak otomatis.`);
        } catch (err) {
          console.error('[ANTI-CALL] Gagal menolak panggilan:', err.message);
        }
      }
    }
  });
}

module.exports = { setupAntiCall };
