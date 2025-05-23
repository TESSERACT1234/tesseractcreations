// client/src/components/ManageBanks.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManageBanks.css";
import BankStatement from "./BankStatement";


const ManageBanks = () => {
  const [showForm, setShowForm] = useState(false);
  const [bankData, setBankData] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState(null);

  const [showPrintOptions, setShowPrintOptions] = useState(false);
const [printRange, setPrintRange] = useState("15"); // default: last 15 days
const [customDates, setCustomDates] = useState({ start: "", end: "" });


  const [form, setForm] = useState({
    bankName: "",
    bankLogo: "",
    accountNumber: "",
    accountName: "",
    accountType: "",
  });

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    const res = await axios.get("http://localhost:5001/banks");
    setBankData(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5001/banks", form);
    fetchBanks();
    setForm({ bankName: "", bankLogo: "", accountNumber: "", accountName: "", accountType: "" });
    setShowForm(false);
  };

  return (
    <div className="manage-banks">
      <h2>Manage Bank Accounts</h2>
      <button className="add-bank-button" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Add New Bank"}
      </button>

      {showForm && (
        <form className="bank-form" onSubmit={handleSubmit}>
          <input type="text" name="bankName" placeholder="Bank Name" value={form.bankName} onChange={handleChange} required />
          <input type="url" name="bankLogo" placeholder="Bank Logo URL" value={form.bankLogo} onChange={handleChange} required />
          <input type="text" name="accountNumber" placeholder="Bank Account Number" value={form.accountNumber} onChange={handleChange} required />
          <input type="text" name="accountName" placeholder="Account Name" value={form.accountName} onChange={handleChange} required />
          <input type="text" name="accountType" placeholder="Account Type (e.g. Savings)" value={form.accountType} onChange={handleChange} required />
          <button type="submit">Save Bank</button>
        </form>
      )}

      <div className="bank-list">
        {bankData.map((bank) => (
          <div className="bank-card" key={bank._id} onClick={() => setSelectedBankId(bank._id)}>
            <img src={bank.bankLogo} alt="Logo" />
            <div>
              <h3>{bank.accountName}</h3>
              <p>{bank.bankName}</p>
              <p>****{bank.accountNumber.slice(-4)}</p>
            </div>
          </div>

        ))}
      </div>
      {selectedBankId && (
        
        <BankStatement
          bankId={selectedBankId}
          onClose={() => setSelectedBankId(null)}
        />
      )}

    </div>
  );
};

export default ManageBanks;
