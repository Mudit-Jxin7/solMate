require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { generateKeypair, getBalance, sendSOL } = require("./solana");
const { getUser, createUser, deleteUser } = require("./db");
const { encrypt, decrypt } = require("./encryption");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// 🟢 /start Command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await getUser(msg.from.id);

  const welcomeMsg = `👋 Welcome to *SolMate*, ${
    msg.from.first_name || "friend"
  }!\n\nWhat would you like to do?`;

  bot.sendMessage(chatId, welcomeMsg, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🆕 Create Wallet", callback_data: "create_wallet" }],
        [{ text: "🪙 Buy", callback_data: "buy" }],
        [{ text: "📊 Balance", callback_data: "balance" }],
        [{ text: "💸 Send SOL", callback_data: "send" }],
        [{ text: "🔐 Withdraw Key", callback_data: "withdraw" }],
        [{ text: "🗑️ Delete Wallet", callback_data: "delete_wallet" }],
        [{ text: "🆘 Help", callback_data: "help" }],
      ],
    },
  });
});

// 🆘 /help Command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `
👋 *Welcome to SolMate Wallet Bot!*

Here’s what you can do:

🪙 *Buy* – View your public key  
🆕 *Create Wallet* – Generate a new Solana wallet  
📊 *Balance* – Check your current balance  
💸 *Send* – Send SOL to someone  
🔐 *Withdraw* – Show your private key  
🗑️ *Delete* – Remove your wallet from the bot

⚠️ You need at least *1 SOL* to send.  
Bot charges *0.1% fee* on every transaction.
`,
    { parse_mode: "Markdown" }
  );
});

// 🔁 Handle all button actions
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const action = query.data;

  const user = await getUser(userId);

  if (action === "create_wallet") {
    if (user) {
      return bot.answerCallbackQuery(query.id, {
        text: "❌ Wallet already exists.",
      });
    }
    const { publicKey, secretKey } = generateKeypair();
    await createUser(userId, publicKey, encrypt(secretKey));
    bot.sendMessage(
      chatId,
      `✅ Wallet created!\n\n🔑 Public Key:\n${publicKey}`
    );
    return bot.answerCallbackQuery(query.id);
  }

  if (action === "buy") {
    if (!user) {
      return bot.sendMessage(
        chatId,
        `❌ No wallet found. Click *Create Wallet* first.`,
        { parse_mode: "Markdown" }
      );
    }
    const username = query.from.username || "N/A";
    bot.sendMessage(
      chatId,
      `🪙 *Wallet Info*\n\n👤 *Username:* @${username}\n🔑 *Public Key:* \n${user.publicKey}`,
      {
        parse_mode: "Markdown",
      }
    );
    return bot.answerCallbackQuery(query.id);
  }

  if (action === "balance") {
    if (!user) {
      return bot.sendMessage(chatId, `❌ No wallet found. Create one first.`);
    }
    const bal = await getBalance(user.publicKey);
    bot.sendMessage(chatId, `💰 Your Balance: ${bal} SOL`);
    return bot.answerCallbackQuery(query.id);
  }

  if (action === "withdraw") {
    if (!user) {
      return bot.sendMessage(chatId, `❌ No wallet found.`);
    }
    const secretKey = decrypt(user.secretKey);
    bot.sendMessage(
      chatId,
      `🔐 Your Private Key (Base64):\n\n${secretKey}\n\n⚠️ Never share this publicly.`
    );
    return bot.answerCallbackQuery(query.id);
  }

  if (action === "delete_wallet") {
    if (!user) {
      return bot.sendMessage(chatId, `❌ No wallet found to delete.`);
    }
    await deleteUser(userId);
    bot.sendMessage(chatId, `🗑️ Your wallet has been deleted permanently.`);
    return bot.answerCallbackQuery(query.id);
  }

  if (action === "help") {
    bot.sendMessage(
      chatId,
      `
👋 *Welcome to SolMate Wallet Bot!*

🪙 Buy – View your public key  
🆕 Create Wallet – Generate a wallet  
📊 Balance – Check your SOL balance  
💸 Send – Send SOL to anyone  
🔐 Withdraw – Get your private key  
🗑️ Delete – Delete your wallet

⚠️ Transactions only work if you have ≥ 1 SOL.
A fee of 0.1% goes to the bot.
`,
      { parse_mode: "Markdown" }
    );
    return bot.answerCallbackQuery(query.id);
  }

  if (action === "send") {
    if (!user) {
      return bot.sendMessage(
        chatId,
        `❌ No wallet found. Please *Create Wallet* first.`,
        { parse_mode: "Markdown" }
      );
    }

    bot.sendMessage(
      chatId,
      "📤 Enter recipient address and amount (e.g. `address 0.5`)",
      {
        parse_mode: "Markdown",
      }
    );

    bot.once("message", async (res) => {
      try {
        const [to, amountStr] = res.text.split(" ");
        const amount = parseFloat(amountStr);
        const secretKey = decrypt(user.secretKey);

        const txUrl = await sendSOL(secretKey, to, amount);
        bot.sendMessage(chatId, `✅ Transaction Sent!\n🔗 ${txUrl}`);
      } catch (e) {
        bot.sendMessage(chatId, `❌ Transaction failed: ${e.message}`);
      }
    });

    return bot.answerCallbackQuery(query.id);
  }
});
