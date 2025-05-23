// src/components/GlobalSearch.js
import React, { useState } from "react";
import axios from "axios";
import "./GlobalSearch.css";

const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ accounts: [], transactions: [], banks: [] });
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`https://tesseractcreations-1.onrender.com/search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (err) {
      console.error("Search error:", err);
      alert("Error performing search");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="global-search">
      <input
        type="text"
        placeholder="Search across all data..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />
      <button onClick={handleSearch}>🔍 Search</button>

      {loading && <p>Loading...</p>}

      {!loading && (
        <div className="search-results">
          <h3>Accounts</h3>
          <ul>
            {results.accounts.map((acc) => (
              <li key={acc._id}>
                <strong>{acc.name}</strong> ({acc.accountType}) - {acc.contact}
              </li>
            ))}
          </ul>

          <h3>Transactions</h3>
          <ul>
            {results.transactions.map((txn) => (
              <li key={txn._id}>
                {new Date(txn.date).toLocaleDateString()} - {txn.accountHolder} - {txn.transactionType} ₹{txn.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </li>
            ))}
          </ul>

          <h3>Banks</h3>
          <ul>
            {results.banks.map((bank) => (
              <li key={bank._id}>
                <strong>{bank.bankName}</strong> - {bank.accountName} - A/C: {bank.accountNumber}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
