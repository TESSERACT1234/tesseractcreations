// ====== IMPORT REQUIRED PACKAGES ======
const express = require("express"); // Web framework for Node.js
const mongoose = require("mongoose"); // MongoDB ODM (Object Data Modeling)
const cors = require("cors"); // Enables Cross-Origin Resource Sharing
require("dotenv").config(); // Load environment variables from .env file

// ====== INITIALIZE EXPRESS APP ======
const app = express();

// ====== MIDDLEWARE ======
app.use(cors()); // Allow requests from any origin
app.use(express.json()); // Parse incoming JSON requests

// ====== CONNECT TO MONGODB DATABASE ======
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===================================================== //
// ===================== SCHEMAS ======================= //
// ===================================================== //

// ====== ACCOUNT SCHEMA ====== //
const accountSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact: { type: String },
    address: { type: String },
    accountType: {
        type: String,
        enum: ["Customers", "Feedstock Vendors", "Regular", "Employees"], // Only allow these types
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const Account = mongoose.model("Account", accountSchema); // Create Account model

// ====== TRANSACTION SCHEMA ====== //
const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["Customers", "Feedstock Vendors", "Regular", "Employees"], // Related to account type
        required: true,
    },
    accountHolder: { type: String, required: true }, // Name of person/organization
    date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 }, // Cannot be negative
    transactionType: {
        type: String,
        enum: ["Credit", "Debit"], // Either credit or debit
        required: true,
    },
    product: { type: String, default: null }, // Optional product name
    volume: { type: Number, default: null }, // Optional volume
    bankId: { type: mongoose.Schema.Types.ObjectId, ref: "Bank", required: true }, // Reference to Bank
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const Transaction = mongoose.model("Transaction", transactionSchema); // Create Transaction model

// ====== BANK SCHEMA ====== //
const bankSchema = new mongoose.Schema({
    bankName: { type: String, required: true },
    bankLogo: { type: String, required: true }, // URL to logo
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true },
    accountType: { type: String, required: true },
    balance: { type: Number, default: 0 }, // Initial balance
});
const Bank = mongoose.model("Bank", bankSchema); // Create Bank model

// ===================================================== //
// ==================== BANK ROUTES ==================== //
// ===================================================== //

// Get all banks
app.get("/banks", async (req, res) => {
    try {
        const banks = await Bank.find();
        res.json(banks);
    } catch (err) {
        res.status(500).json({ error: "❌ Failed to fetch banks" });
    }
});

// Add a new bank
app.post("/banks", async (req, res) => {
    try {
        const newBank = new Bank(req.body);
        await newBank.save();
        res.status(201).json({ message: "✅ Bank saved successfully", newBank });
    } catch (err) {
        res.status(400).json({ error: "❌ Failed to save bank", details: err.message });
    }
});

// ===================================================== //
// ================== ACCOUNT ROUTES =================== //
// ===================================================== //

// Create a new account
app.post("/accounts", async (req, res) => {
    try {
        const account = new Account(req.body);
        await account.save();
        res.status(201).json({ message: "✅ Account created successfully!", account });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all accounts by account type
app.get("/accounts/type/:type", async (req, res) => {
    try {
        const { type } = req.params;
        const validTypes = ["Customers", "Feedstock Vendors", "Regular", "Employees"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: "Invalid account type" });
        }
        const accounts = await Account.find({ accountType: type });
        res.json(accounts);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch accounts", details: err.message });
    }
});

// ===================================================== //
// ================ TRANSACTION ROUTES ================= //
// ===================================================== //

// Add a transaction (with balance update)
app.post("/transactions", async (req, res) => {
    try {
        const transaction = new Transaction(req.body);
        await transaction.save();

        const bank = await Bank.findById(req.body.bankId);
        if (!bank) return res.status(404).send("Bank not found");

        // Adjust bank balance
        const amount = req.body.amount;
        if (req.body.transactionType === "Credit") {
            bank.balance += amount;
        } else {
            bank.balance -= amount;
        }
        await bank.save();

        res.status(201).send(transaction);
    } catch (err) {
        res.status(500).send("Error saving transaction");
    }
});

// Get all transactions
app.get("/transactions", async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get transactions for a specific account holder
app.get("/transactions/account/:accountHolder", async (req, res) => {
    try {
        const { accountHolder } = req.params;
        const transactions = await Transaction.find({ accountHolder }).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get transactions by bank with pagination
app.get("/banks/:id/transactions", async (req, res) => {
    try {
        const { page = 1, limit = 15 } = req.query;
        const bankId = req.params.id;

        const bank = await Bank.findById(bankId);
        if (!bank) return res.status(404).send("Bank not found");

        const total = await Transaction.countDocuments({ bankId });
        const transactions = await Transaction.find({ bankId })
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.send({
            bankName: bank.bankName,
            accountName: bank.accountName,
            balance: bank.balance,
            transactions,
            totalPages: Math.ceil(total / limit),
        });
    } catch {
        res.status(500).send("Error fetching bank transactions");
    }
});

// Update an existing transaction
app.put("/transactions/:id", async (req, res) => {
    try {
        const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: "Transaction not found" });
        res.json({ message: "✅ Transaction updated successfully", updated });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a transaction
app.delete("/transactions/:id", async (req, res) => {
    try {
        const deleted = await Transaction.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Transaction not found" });
        res.json({ message: "🗑️ Transaction deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Generate a filtered report of transactions
app.get("/report/transactions", async (req, res) => {
    try {
        const { accountHolder, startDate, endDate } = req.query;

        if (!accountHolder) {
            return res.status(400).json({ error: "Account holder is required" });
        }

        const query = { accountHolder };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const transactions = await Transaction.find(query).sort({ date: 1 });

        res.status(200).json(transactions);
    } catch (err) {
        res.status(500).json({ error: "❌ Error fetching report transactions", details: err.message });
    }
});

// ===================================================== //
// =================== SEARCH ROUTE ==================== //
// ===================================================== //

// Search for any keyword across accounts, transactions, and banks
app.get("/search", async (req, res) => {
    const query = req.query.q?.trim().toLowerCase();
    if (!query) return res.json({ accounts: [], transactions: [], banks: [] });

    const isNumeric = !isNaN(query); // Check if query is a number

    try {
        const accounts = await Account.find({
            $or: [
                { name: new RegExp(query, "i") },
                { contact: new RegExp(query, "i") },
                { accountType: new RegExp(query, "i") },
            ],
        });

        const transactions = await Transaction.find({
            $or: [
                { accountHolder: new RegExp(query, "i") },
                { transactionType: new RegExp(query, "i") },
                ...(isNumeric ? [{ amount: Number(query) }] : []),
            ],
        });

        const banks = await Bank.find({
            $or: [
                { bankName: new RegExp(query, "i") },
                { accountName: new RegExp(query, "i") },
                { accountNumber: new RegExp(query, "i") },
                ...(isNumeric ? [{ balance: Number(query) }] : []),
            ],
        });

        res.json({ accounts, transactions, banks });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// ===================================================== //
// =================== DEFAULT ROUTE =================== //
// ===================================================== //

// Health check/default route
app.get("/", (req, res) => {
    res.send("🚀 API is running");
});

// ===================================================== //
// ==================== START SERVER =================== //
// ===================================================== //
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
