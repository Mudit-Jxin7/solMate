require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const {
  generateKeypair,
  getBalance,
  sendSOL,
  getPrivateKey,
} = require("./solana");
const { getUser, createUser } = require("./db");
const { encrypt, decrypt } = require("./encryption");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// 🏁 /start Command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `👋 Welcome to Solana Wallet Bot!\nWhat would you like to do?`,
    {
      reply_markup: {
        keyboard: [
          ["🪙 Buy", "📊 Balance"],
          ["💸 Send", "🔐 Withdraw"],
        ],
        resize_keyboard: true,
      },
    },
  );
});

// 🪙 Buy
bot.onText(/🪙 Buy/, async (msg) => {
  const chatId = msg.chat.id;
  let user = await getUser(chatId);

  if (user) {
    return bot.sendMessage(
      chatId,
      `You already have a wallet:\n🔑 ${user.publicKey}`,
    );
  }

  const { publicKey, secretKey } = generateKeypair();
  const encrypted = encrypt(secretKey);
  await createUser(chatId, publicKey, encrypted);

  bot.sendMessage(
    chatId,
    `✅ Wallet created!\nYour public key:\n🔑 ${publicKey}`,
  );
});

// 📊 Balance
bot.onText(/📊 Balance/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await getUser(chatId);

  if (!user)
    return bot.sendMessage(
      chatId,
      `❌ No wallet found. Use 🪙 Buy to create one.`,
    );

  const balance = await getBalance(user.publicKey);
  bot.sendMessage(chatId, `💰 Your balance: ${balance} SOL`);
});

// 💸 Send
bot.onText(/💸 Send/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Enter recipient address and amount in this format:\n`address amount`",
    {
      parse_mode: "Markdown",
    },
  );

  bot.once("message", async (res) => {
    const user = await getUser(chatId);
    if (!user) return bot.sendMessage(chatId, `❌ No wallet found.`);

    const [to, amountStr] = res.text.split(" ");
    const amount = parseFloat(amountStr);

    const secretKey = decrypt(user.secretKey);
    const result = await sendSOL(secretKey, to, amount);

    bot.sendMessage(chatId, `✅ Transaction Sent!\n🔗 ${result}`);
  });
});

// 🔐 Withdraw
bot.onText(/🔐 Withdraw/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await getUser(chatId);
  if (!user) return bot.sendMessage(chatId, `❌ No wallet found.`);

  const secretKey = decrypt(user.secretKey);
  bot.sendMessage(
    chatId,
    `⚠️ Here's your private key (Base64). Keep it safe:\n\n${secretKey}`,
  );
});
