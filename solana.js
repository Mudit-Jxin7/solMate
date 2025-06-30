const {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} = require("@solana/web3.js");

const connection = new Connection(clusterApiUrl("devnet"));

// 🧪 Generate Wallet
function generateKeypair() {
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toBase58();
  const secretKey = Buffer.from(keypair.secretKey).toString("base64");
  return { publicKey, secretKey };
}

// 💰 Balance
async function getBalance(publicKeyStr) {
  const publicKey = new PublicKey(publicKeyStr);
  const lamports = await connection.getBalance(publicKey);
  return (lamports / LAMPORTS_PER_SOL).toFixed(4);
}

// 💸 Send
async function sendSOL(secretKeyBase64, toAddress, amount) {
  const secretKey = Uint8Array.from(Buffer.from(secretKeyBase64, "base64"));
  const from = Keypair.fromSecretKey(secretKey);

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: new PublicKey(toAddress),
      lamports: amount * LAMPORTS_PER_SOL,
    }),
  );

  const signature = await sendAndConfirmTransaction(connection, tx, [from]);
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

module.exports = { generateKeypair, getBalance, sendSOL };
