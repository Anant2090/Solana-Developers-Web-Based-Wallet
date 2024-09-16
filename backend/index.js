const express = require("express");
const { Connection, Keypair, Transaction, SystemProgram, sendAndConfirmTransaction, LAMPORTS_PER_SOL, PublicKey,solanaWeb3 } = require("@solana/web3.js");
const bip39 = require("bip39");
const { derivePath } = require("ed25519-hd-key");
const bs58 = require("bs58");
const cors = require("cors");
const app = express();


app.use(express.json());
app.use(cors());

// Connection to the Solana devnet
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Route 1: Generate a wallet (mnemonic and keypair)
app.post("/generateWallet", (req, res) => {
    try {
        // Generate a 12-word mnemonic
        const mnemonic = bip39.generateMnemonic();

        // Derive the seed from the mnemonic
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const derivationPath = "m/44'/501'/0'/0'";

        // Derive the private key using the seed
        const derivedSeed = derivePath(derivationPath, seed.toString("hex")).key;

        // Generate the keypair
        const keypair = Keypair.fromSeed(derivedSeed.slice(0, 32));

        // Get the public key (wallet address) and private key (Base58 format)
        const publicKey = keypair.publicKey.toBase58();
        const privateKey = bs58.encode(keypair.secretKey);

        // Send the mnemonic, public key (address), and private key as a response
        res.json({
            mnemonic: mnemonic,
            Address: publicKey,
            privateKey: privateKey
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route 2: Send a transaction (fund transfer)
app.post("/sendTransaction", async (req, res) => {
    try {
        const { mnemonic, recipient, amount } = req.body;

        if (!mnemonic || !recipient || !amount) {
            return res.status(400).json({ error: "Mnemonic, recipient public key, and amount are required." });
        }

        // Validate recipient public key
        try {
            new PublicKey(recipient); // This will throw an error if the recipient is not a valid public key
        } catch (error) {
            return res.status(400).json({ error: "Invalid recipient public key." });
        }

        // Convert amount to number and validate
        const amountInSol = parseFloat(amount);
        if (isNaN(amountInSol) || amountInSol <= 0) {
            return res.status(400).json({ error: "Invalid amount value. It should be a positive number." });
        }

        // Derive the keypair from the mnemonic
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const derivationPath = "m/44'/501'/0'/0'";
        const derivedSeed = derivePath(derivationPath, seed.toString("hex")).key;
        const keypair = Keypair.fromSeed(derivedSeed.slice(0, 32));

        // Create and send the transaction
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: keypair.publicKey,
                toPubkey: new PublicKey(recipient),
                lamports: amountInSol * LAMPORTS_PER_SOL,
            })
        );

        const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);

        res.json({
            success: true,
            signature: signature
        });
    } catch (error) {
        console.error('Error in transaction:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post("/ClaimFaucet", async function(req, res) {
    const { address, amount } = req.body;
    // Validate recipient public key
    try {
        new PublicKey(address); // This will throw an error if the recipient is not a valid public key
    } catch (error) {
        return res.status(400).json({ error: "Invalid recipient public key." });
    }

    const recipientPublicKey = new PublicKey(address);

    try {
        // Request the airdrop of SOL
        const airdropSignature = await connection.requestAirdrop(
            recipientPublicKey,
            amount * LAMPORTS_PER_SOL // The amount is converted to lamports
        );

        // Confirm the transaction
        await connection.confirmTransaction(airdropSignature, "confirmed");

        console.log(`Airdrop successful! Transaction: ${airdropSignature}`);
        
        // Send a success response to the client
        res.json({
            success: true,
            message: "Airdrop successful!",
            transactionSignature: airdropSignature
        });
    } catch (error) {
        console.error("Error during faucet airdrop:", error);
        res.status(500).json({
            success: false,
            error: "Airdrop failed"
        });
    }
});




// Start the server
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
