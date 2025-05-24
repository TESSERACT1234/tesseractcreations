import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AddTransaction.css";

const AddTransaction = () => {
  const [accountTypes, setAccountTypes] = useState([
    "Customers",
    "Feedstock Vendors",
    "Regular",
    "Employees",
  ]);
  const [selectedType, setSelectedType] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [amount, setAmount] = useState("");
  const [credit, setCredit] = useState(true);
  const [product, setProduct] = useState("");
  const [volume, setVolume] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (selectedType) {
      axios
        .get(`https://tesseractcreations-1.onrender.com/accounts/type/${selectedType}`)
        .then((res) => setAccounts(res.data))
        .catch(() => setAccounts([]));
    } else {
      setAccounts([]);
    }
    setSelectedAccount("");
  }, [selectedType]);

  useEffect(() => {
    axios
      .get("https://tesseractcreations-1.onrender.com/banks")
      .then((res) => setBanks(res.data))
      .catch(() => setBanks([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      type: selectedType,
      accountHolder: selectedAccount,
      date,
      amount: parseFloat(amount),
      transactionType: credit ? "Credit" : "Debit",
      bankId: selectedBank,
      ...(["Customers", "Feedstock Vendors"].includes(selectedType) && {
        product,
        volume: parseFloat(volume),
      }),
    };

    try {
      await axios.post("https://tesseractcreations-1.onrender.com/transactions", data);
      alert("Transaction added successfully!");
      setSelectedType("");
      setAccounts([]);
      setSelectedAccount("");
      setSelectedBank("");
      setAmount("");
      setCredit(true);
      setProduct("");
      setVolume("");
      setDate(new Date().toISOString().slice(0, 10));
    } catch {
      alert("Failed to add transaction");
    }
  };

  return (
    <div className="add-transaction">
      <h2>Add Transaction</h2>
      <form onSubmit={handleSubmit}>
        <label>Account Type</label>
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} required>
          <option value="">Select Type</option>
          {accountTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <label>Account Holder</label>
        <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} required disabled={!accounts.length}>
          <option value="">Select Account</option>
          {accounts.map((acc) => (
            <option key={acc._id} value={acc.name}>{acc.name}</option>
          ))}
        </select>

        <label>Bank</label>
        <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} required>
          <option value="">Select Bank</option>
          {banks.map((bank) => (
            <option key={bank._id} value={bank._id}>{bank.bankName} ({bank.accountNumber})</option>
          ))}
        </select>

        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

        <label>Amount</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />

        <label>Transaction Type</label>
        <div className="switch-container">
          <span>Debit</span>
          <label className="switch">
            <input type="checkbox" checked={credit} onChange={() => setCredit(!credit)} />
            <span className="slider round"></span>
          </label>
          <span>Credit</span>
        </div>

        {["Customers", "Feedstock Vendors"].includes(selectedType) && (
          <>
            <label>Product</label>
            <input type="text" value={product} onChange={(e) => setProduct(e.target.value)} required />
            <label>Volume</label>
            <input type="number" value={volume} onChange={(e) => setVolume(e.target.value)} required />
          </>
        )}

        <button type="submit">Add Transaction</button>
      </form>
    </div>
  );
};

export default AddTransaction;
