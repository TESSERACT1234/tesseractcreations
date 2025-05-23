// File: src/components/AccountTransactions.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AccountTransactions.css";

const AccountTransactions = ({ accountName, onBack }) => {
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ amount: "", product: "", volume: "" });

  useEffect(() => {
    fetchTransactions();
  }, [accountName]);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/transactions/account/${accountName}`);
      setTransactions(res.data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const handleEdit = (txn) => {
    setEditingId(txn._id);
    setEditData({ amount: txn.amount, product: txn.product || "", volume: txn.volume || "" });
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`http://localhost:5001/transactions/${id}`, editData);
      setEditingId(null);
      fetchTransactions();
    } catch (err) {
      console.error("Error updating transaction:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await axios.delete(`http://localhost:5001/transactions/${id}`);
        fetchTransactions();
      } catch (err) {
        console.error("Error deleting transaction:", err);
      }
    }
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  return (
    <div className="account-transactions">
      <button className="back-button" onClick={onBack}>← Back to Accounts</button>
      <h2>Transactions for {accountName}</h2>

      {transactions.length === 0 ? (
        <p>No transactions found for this account.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Credit</th>
              <th>Debit</th>
              <th>Product</th>
              <th>Volume</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => {
              const isEditing = editingId === t._id;

              return (
                <tr key={t._id}>
                  <td>{new Date(t.date).toLocaleDateString()}</td>

                  {isEditing ? (
                    <>
                      <td colSpan={2}>
                        <input
                          type="number"
                          name="amount"
                          value={editData.amount}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="product"
                          value={editData.product}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="volume"
                          value={editData.volume}
                          onChange={handleChange}
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{t.transactionType === "Credit" ? t.amount.toFixed(2) : "-"}</td>
                      <td>{t.transactionType === "Debit" ? t.amount.toFixed(2) : "-"}</td>
                      <td>{t.product || "-"}</td>
                      <td>{t.volume !== null && t.volume !== undefined ? t.volume : "-"}</td>
                    </>
                  )}

                  <td>
                    {isEditing ? (
                      <>
                        <button onClick={() => handleSave(t._id)}>Save</button>
                        <button onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(t)}>Edit</button>
                        <button onClick={() => handleDelete(t._id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AccountTransactions;
