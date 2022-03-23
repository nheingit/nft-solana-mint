import {
  Keypair,
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  setAuthority,
  transfer,
} from "@solana/spl-token";

(async () => {
  // Connect to cluster
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Generate a new wallet keypair and airdrop SOL
  const fromWallet = Keypair.generate();
  const fromAirdropSignature = await connection.requestAirdrop(
    fromWallet.publicKey,
    LAMPORTS_PER_SOL
  );
  //wait for airdrop confirmation
  await connection.confirmTransaction(fromAirdropSignature);

  //create new token mint
  let mint = await createMint(
    connection,
    fromWallet,
    fromWallet.publicKey,
    null,
    0
  );

  //get the token account of the fromWallet Solana address, if it does not exist, create it
  let fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    fromWallet,
    mint,
    fromWallet.publicKey
  );

  // Generate a new wallet to receive newly minted token
  const toWallet = Keypair.generate();

  //get the token account of the toWallet Solana address, if it does not exist, create it
  const toTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    fromWallet,
    mint,
    toWallet.publicKey
  );

  //minting 1 new token to the "fromTokenAccount" account we just returned/created
  let signature = await mintTo(
    connection,
    fromWallet,
    mint,
    fromTokenAccount.address, //who it goes to
    fromWallet.publicKey, // minting authority
    10 // how many
  );

  await setAuthority(
    connection,
    fromWallet,
    mint,
    fromWallet.publicKey,
    0,
    null
  );

  signature = await transfer(
    connection,
    fromWallet,
    fromTokenAccount.address,
    toTokenAccount.address,
    fromWallet.publicKey,
    1
  );
  console.log("SIGNATURE", signature);
})();
