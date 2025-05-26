import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AccountTransactions.css";

const AccountTransactions = ({ accountName, onBack }) => {
  const [transactions, setTransactions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ amount: "", product: "", volume: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  useEffect(() => {
    fetchTransactions();
  }, [accountName]);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`https://tesseractcreations-1.onrender.com/transactions/account/${accountName}`);
      setTransactions(res.data);
      setCurrentPage(1); // Reset to first page on fetch
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
      await axios.put(`https://tesseractcreations-1.onrender.com/transactions/${id}`, editData);
      setEditingId(null);
      fetchTransactions();
    } catch (err) {
      console.error("Error updating transaction:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await axios.delete(`https://tesseractcreations-1.onrender.com/transactions/${id}`);
        fetchTransactions();
      } catch (err) {
        console.error("Error deleting transaction:", err);
      }
    }
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // Pagination logic
  const indexOfLast = currentPage * transactionsPerPage;
  const indexOfFirst = indexOfLast - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  // Calculate total credit and debit
  const totalCredit = transactions
    .filter((t) => t.transactionType === "Credit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebit = transactions
    .filter((t) => t.transactionType === "Debit")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="account-transactions">
      <button className="back-button" onClick={onBack}>← Back to Accounts</button>
      <h2>Transactions for {accountName}</h2>

      <div className="totals">
        <strong>Total Credit: ₹{totalCredit.toFixed(2)}</strong> |{" "}
        <strong>Total Debit: ₹{totalDebit.toFixed(2)}</strong>
      </div>

      {transactions.length === 0 ? (
        <p>No transactions found for this account.</p>
      ) : (
        <>
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
              {currentTransactions.map((t) => {
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

          {/* Pagination Controls */}
          <div className="pagination">
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountTransactions;
