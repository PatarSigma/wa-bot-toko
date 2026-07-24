const tttGames = new Map();
const mathGames = new Map();

const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board) {
  for (const [a, b, c] of WIN_COMBOS) {
    if (board[a] !== null && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  if (board.every((cell) => cell !== null)) return 'draw';
  return null;
}

function renderBoard(board) {
  const symbols = board.map((cell, i) => (cell === null ? `${i + 1}️⃣` : cell === 'X' ? '❌' : '⭕'));
  return (
    `${symbols[0]} ${symbols[1]} ${symbols[2]}\n` +
    `${symbols[3]} ${symbols[4]} ${symbols[5]}\n` +
    `${symbols[6]} ${symbols[7]} ${symbols[8]}`
  );
}

function botMove(board) {
  const empty = board.map((c, i) => (c === null ? i : null)).filter((i) => i !== null);

  for (const i of empty) {
    const copy = [...board];
    copy[i] = 'O';
    if (checkWinner(copy) === 'O') return i;
  }
  for (const i of empty) {
    const copy = [...board];
    copy[i] = 'X';
    if (checkWinner(copy) === 'X') return i;
  }
  if (board[4] === null) return 4;
  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  return empty[Math.floor(Math.random() * empty.length)];
}

async function startTicTacToe(sock, chatId, msg) {
  const board = Array(9).fill(null);
  tttGames.set(chatId, { board });

  await sock.sendMessage(
    chatId,
    {
      text:
        `🎮 *Tic Tac Toe* dimulai! Kamu ❌, Bot ⭕\n\n` +
        `${renderBoard(board)}\n\n` +
        `Ketik *.ttt <nomor>* untuk jalan, contoh: *.ttt 5*`,
    },
    { quoted: msg }
  );
}

async function moveTicTacToe(sock, chatId, msg, posText) {
  const game = tttGames.get(chatId);
  if (!game) {
    await sock.sendMessage(
      chatId,
      { text: 'Belum ada game jalan. Ketik *.ttt* untuk mulai.' },
      { quoted: msg }
    );
    return;
  }

  const pos = parseInt(posText, 10) - 1;
  if (isNaN(pos) || pos < 0 || pos > 8) {
    await sock.sendMessage(chatId, { text: 'Nomor harus 1-9. Contoh: *.ttt 5*' }, { quoted: msg });
    return;
  }
  if (game.board[pos] !== null) {
    await sock.sendMessage(chatId, { text: 'Kotak itu sudah diisi, pilih yang lain.' }, { quoted: msg });
    return;
  }

  game.board[pos] = 'X';
  let winner = checkWinner(game.board);

  if (!winner) {
    const botPos = botMove(game.board);
    game.board[botPos] = 'O';
    winner = checkWinner(game.board);
  }

  let resultText = '';
  if (winner === 'X') resultText = '\n\n🎉 *Kamu menang!*';
  else if (winner === 'O') resultText = '\n\n🤖 *Bot menang!*';
  else if (winner === 'draw') resultText = '\n\n🤝 *Seri!*';

  await sock.sendMessage(
    chatId,
    { text: `${renderBoard(game.board)}${resultText}` },
    { quoted: msg }
  );

  if (winner) tttGames.delete(chatId);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMathQuestion() {
  const operators = ['+', '-', '×'];
  const op = operators[Math.floor(Math.random() * operators.length)];
  let a = randomInt(1, 50);
  let b = randomInt(1, 50);

  let answer;
  if (op === '+') answer = a + b;
  else if (op === '-') answer = a - b;
  else answer = a * b;

  return { soal: `${a} ${op} ${b}`, jawaban: answer };
}

async function startMath(sock, chatId, msg) {
  const existing = mathGames.get(chatId);
  if (existing) clearTimeout(existing.timeoutHandle);

  const { soal, jawaban } = generateMathQuestion();
  const timeoutHandle = setTimeout(async () => {
    if (mathGames.get(chatId)?.jawaban === jawaban) {
      mathGames.delete(chatId);
      await sock.sendMessage(chatId, {
        text: `⏰ Waktu habis! Jawaban yang benar: *${jawaban}*`,
      });
    }
  }, 30000);

  mathGames.set(chatId, { soal, jawaban, timeoutHandle });

  await sock.sendMessage(
    chatId,
    {
      text: `🧮 *Tebak Matematika*\n\nBerapa hasil dari: *${soal}*?\n\nJawab dengan *.jawab <angka>* (30 detik)`,
    },
    { quoted: msg }
  );
}

async function answerMath(sock, chatId, msg, answerText) {
  const game = mathGames.get(chatId);
  if (!game) {
    await sock.sendMessage(
      chatId,
      { text: 'Belum ada soal aktif. Ketik *.math* untuk mulai.' },
      { quoted: msg }
    );
    return;
  }

  const userAnswer = parseInt(answerText, 10);
  if (isNaN(userAnswer)) {
    await sock.sendMessage(chatId, { text: 'Jawab pakai angka ya. Contoh: *.jawab 42*' }, { quoted: msg });
    return;
  }

  clearTimeout(game.timeoutHandle);
  mathGames.delete(chatId);

  if (userAnswer === game.jawaban) {
    await sock.sendMessage(chatId, { text: `✅ *Benar!* ${game.soal} = ${game.jawaban}` }, { quoted: msg });
  } else {
    await sock.sendMessage(
      chatId,
      { text: `❌ *Salah!* Jawaban yang benar: ${game.jawaban}` },
      { quoted: msg }
    );
  }
}

module.exports = {
  startTicTacToe,
  moveTicTacToe,
  startMath,
  answerMath,
};
