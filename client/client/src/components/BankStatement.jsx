import React, { useEffect, useState } from "react";
import axios from "axios";
import "./BankStatement.css";

const BankStatement = ({ bankId, onClose }) => {
  const [statement, setStatement] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchStatement = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/banks/${bankId}/transactions?page=${page}&limit=${limit}`
      );

      const { accountName, bankName, transactions, totalPages } = res.data;

      setStatement({
        accountName,
        bankName,
      });

      setTransactions(transactions || []);
      setTotalPages(totalPages || 1);
    } catch (error) {
      console.error("Error fetching bank statement:", error);
      alert("Error fetching bank statement");
    }
  };

  useEffect(() => {
    fetchStatement();
  }, [bankId, page]);

  // Calculate dynamic balance
  const totalCredits = transactions
    .filter(txn => txn.transactionType === "Credit")
    .reduce((sum, txn) => sum + Number(txn.amount), 0);

  const totalDebits = transactions
    .filter(txn => txn.transactionType === "Debit")
    .reduce((sum, txn) => sum + Number(txn.amount), 0);

  const computedBalance = totalCredits - totalDebits;

  if (!statement) return <div>Loading...</div>;

  return (
    <div className="bank-statement">
      <button className="close-btn" onClick={onClose}>Close</button>
      <h3>{statement.accountName} - {statement.bankName}</h3>
      <h4>
        Computed Balance: ₹{computedBalance.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </h4>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>From/To</th>
            <th>Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((txn) => (
              <tr key={txn._id || `${txn.date}-${txn.amount}-${txn.accountHolder}`}>
                <td>{new Date(txn.date).toLocaleDateString()}</td>
                <td>{txn.accountHolder}</td>
                <td>{txn.transactionType}</td>
                <td className={txn.transactionType === "Credit" ? "credit" : "debit"}>
                  ₹{Number(txn.amount).toFixed(2)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>No transactions found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          ⬅️ Prev
        </button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
          Next ➡️
        </button>
      </div>
    </div>
  );
};

export default BankStatement;
