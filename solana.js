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

function generateKeypair() {
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toBase58();
  const secretKey = Buffer.from(keypair.secretKey).toString("base64");
  return { publicKey, secretKey };
}

async function getBalance(publicKeyStr) {
  const publicKey = new PublicKey(publicKeyStr);
  const lamports = await connection.getBalance(publicKey);
  return (lamports / LAMPORTS_PER_SOL).toFixed(4);
}

async function sendSOL(secretKeyBase64, toAddress, amount) {
  const secretKey = Uint8Array.from(Buffer.from(secretKeyBase64, "base64"));
  const from = Keypair.fromSecretKey(secretKey);

  const senderBalanceLamports = await connection.getBalance(from.publicKey);
  const senderBalance = senderBalanceLamports / LAMPORTS_PER_SOL;

  if (senderBalance < 1) {
    throw new Error(
      "Insufficient balance. Minimum 1 SOL required to transact."
    );
  }

  const recipient = new PublicKey(toAddress);
  const botWallet = new PublicKey(process.env.BOT_WALLET);

  const amountLamports = amount * LAMPORTS_PER_SOL;
  const fee = Math.floor(amountLamports * 0.001);
  const sendAmount = amountLamports - fee;

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: recipient,
      lamports: sendAmount,
    }),
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: botWallet,
      lamports: fee,
    })
  );

  const sig = await sendAndConfirmTransaction(connection, tx, [from]);
  return `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
}
module.exports = { generateKeypair, getBalance, sendSOL };
