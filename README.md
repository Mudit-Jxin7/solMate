# 🧠 SolMate – Your Pocket Solana Wallet in Telegram

> 💬 “Because managing crypto should be as easy as chatting!”

SolMate is a Telegram bot that gives users a simple, secure way to create, view, and manage Solana wallets — all within Telegram.

---

## 🚀 Features

- 🔐 **Create Wallet** – Instantly generates a new Solana wallet with secure private key storage.
- 🪙 **Buy (View Public Key)** – Displays your public wallet address for receiving SOL.
- 📊 **Check Balance** – View current SOL balance in real time.
- 💸 **Send SOL** – Transfer SOL to any wallet (requires ≥1 SOL balance, 0.1% fee applies).
- 🔐 **Withdraw Key** – View your private key (Base64 format) to import in other wallets.
- 🗑️ **Delete Wallet** – Permanently removes your wallet from the bot.
- 🆘 **Help** – Shows usage instructions and features.

---

## 🛠️ Tech Stack

- **Node.js** + **Telegram Bot API**
- **Solana Web3.js**
- **MongoDB** for user data
- **dotenv** for env vars
- **Custom AES encryption** for securely storing private keys

---

## 🧪 Local Setup

1. **Clone the repo**

```bash
git clone https://github.com/Mudit-Jxin7/solMate.git
cd solMate
````

2. **Install dependencies**

```bash
npm install
```

3. **Set up `.env`**

```env
TELEGRAM_TOKEN=your_telegram_bot_token
MONGODB_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net
BOT_WALLET=your_bot_fee_wallet_public_key
ENCRYPTION_SECRET=this_should_be_32_chars_long!
```

4. **Run the bot**

```bash
node index.js
```

Or with hot-reloading:

```bash
nodemon index.js
```

---

## 📸 Screenshots

![Screenshot_2025-06-30-23-08-42](https://github.com/user-attachments/assets/27db1357-75d7-4197-bd01-662fe54b20bb)

---

## 🛡️ Security Notice

* Your private keys are encrypted in the database using AES-256.
* Only the user who created the wallet can access their private key.
* Never share your key or bot token publicly.

---

## 📬 Contact

Built by [@Mudit-Jxin7](https://github.com/yourhandle). PRs welcome!

