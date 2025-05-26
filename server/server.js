// ====== IMPORT REQUIRED PACKAGES ======
const express = require("express"); // Web framework for Node.js
const mongoose = require("mongoose"); // MongoDB ODM
const cors = require("cors"); // Enable CORS
require("dotenv").config(); // Load env variables

// ====== INITIALIZE EXPRESS APP ======
const app = express();

// ====== MIDDLEWARE ======
app.use(cors());
app.use(express.json());

// ====== CONNECT TO MONGODB ======
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

// ====== Account Schema ====== //
const accountSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact: { type: String },
    address: { type: String },
    accountType: {
        type: String,
        enum: ["Customers", "Feedstock Vendors", "Regular", "Employees"],
        required: true,
    },
    createdAt: { type: Date, default: Date.now },
});
const Account = mongoose.model("Account", accountSchema);

// ====== Bank Schema ====== //
const bankSchema = new mongoose.Schema({
    bankName: { type: String, required: true },
    bankLogo: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true },
    accountType: { type: String, required: true },
    balance: { type: Number, default: 0 },
});
const Bank = mongoose.model("Bank", bankSchema);

// ====== Transaction Schema ====== //
const transactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["Customers", "Feedstock Vendors", "Regular", "Employees"],
        required: true,
    },
    accountHolder: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    transactionType: {
        type: String,
        enum: ["Credit", "Debit"],
        required: true,
    },
    product: { type: String, default: null },
    volume: { type: Number, default: null },
    bankId: { type: mongoose.Schema.Types.ObjectId, ref: "Bank", required: true },
    createdAt: { type: Date, default: Date.now },
});
const Transaction = mongoose.model("Transaction", transactionSchema);

// ===================================================== //
// ===================== ROUTES ======================== //
// ===================================================== //

// ====== BANK ROUTES ====== //
app.get("/banks", async (req, res) => {
    try {
        const banks = await Bank.find();
        res.json(banks);
    } catch {
        res.status(500).json({ error: "❌ Failed to fetch banks" });
    }
});
app.post("/banks", async (req, res) => {
    try {
        const newBank = new Bank(req.body);
        await newBank.save();
        res.status(201).json({ message: "✅ Bank saved successfully", newBank });
    } catch (err) {
        res.status(400).json({ error: "❌ Failed to save bank", details: err.message });
    }
});

// ====== ACCOUNT ROUTES ====== //
app.post("/accounts", async (req, res) => {
    try {
        const account = new Account(req.body);
        await account.save();
        res.status(201).json({ message: "✅ Account created successfully!", account });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
app.get("/accounts/type/:type", async (req, res) => {
    const validTypes = ["Customers", "Feedstock Vendors", "Regular", "Employees"];
    const { type } = req.params;
    if (!validTypes.includes(type)) {
        return res.status(400).json({ error: "Invalid account type" });
    }
    try {
        const accounts = await Account.find({ accountType: type });
        res.json(accounts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ====== TRANSACTION ROUTES ====== //
app.post("/transactions", async (req, res) => {
    try {
        const transaction = new Transaction(req.body);
        await transaction.save();

        const bank = await Bank.findById(req.body.bankId);
        if (!bank) return res.status(404).send("Bank not found");

        const amount = req.body.amount;
        req.body.transactionType === "Credit"
            ? (bank.balance += amount)
            : (bank.balance -= amount);

        await bank.save();
        res.status(201).json(transaction);
    } catch (err) {
        res.status(500).send("Error saving transaction");
    }
});
app.get("/transactions", async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get("/transactions/account/:accountHolder", async (req, res) => {
    try {
        const transactions = await Transaction.find({ accountHolder: req.params.accountHolder }).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get("/banks/:id/transactions", async (req, res) => {
    const { page = 1, limit = 15 } = req.query;
    const bankId = req.params.id;
  
    try {
      const bank = await Bank.findById(bankId);
      if (!bank) return res.status(404).send("Bank not found");
  
      const total = await Transaction.countDocuments({ bankId });
      const transactions = await Transaction.find({ bankId })
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
  
      // Calculate balance from all transactions for this bank (not just paginated ones)
      const allTransactions = await Transaction.find({ bankId });
      const computedBalance = allTransactions.reduce((acc, txn) => {
        if (txn.transactionType === "Credit") return acc + txn.amount;
        else return acc - txn.amount;
      }, 0);
  
      res.send({
        bankName: bank.bankName,
        accountName: bank.accountName,
        balance: bank.balance,  // existing field if you want
        transactions,
        totalPages: Math.ceil(total / limit),
        computedBalance,
      });
    } catch {
      res.status(500).send("Error fetching bank transactions");
    }
  });
  
app.put("/transactions/:id", async (req, res) => {
    try {
        const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: "Transaction not found" });
        res.json({ message: "✅ Transaction updated successfully", updated });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
app.delete("/transactions/:id", async (req, res) => {
    try {
        const deleted = await Transaction.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Transaction not found" });
        res.json({ message: "🗑️ Transaction deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
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

// ====== SEARCH ROUTE ====== //
app.get("/search", async (req, res) => {
    const query = req.query.q?.trim().toLowerCase();
    if (!query) return res.json({ accounts: [], transactions: [], banks: [] });

    const isNumeric = !isNaN(query);
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

// ====== DEFAULT ROUTE ====== //
app.get("/", (req, res) => {
    res.send("🚀 API is running");
});

// ====== START SERVER ====== //
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server started on http://localhost:${PORT}`);
});
