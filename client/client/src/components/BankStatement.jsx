import React, { useEffect, useState } from "react";
import axios from "axios";
import "./BankStatement.css";

const BankStatement = ({ bankId, onClose }) => {
  const [statement, setStatement] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const calculateBalance = (txns) => {
    if (!txns || txns.length === 0) return 0;
    return txns.reduce((acc, txn) => {
      const amount = Number(txn.amount) || 0;
      if (txn.transactionType === "Credit") {
        return acc + amount;
      } else {
        return acc - amount;
      }
    }, 0);
  };

  const fetchStatement = async () => {
    try {
      const res = await axios.get(
        `https://tesseractcreations-1.onrender.com/banks/${bankId}/transactions?page=${page}&limit=${limit}`
      );
  
      const { accountName, bankName, transactions, totalPages, computedBalance } = res.data;
  
      setTransactions(transactions || []);
      setTotalPages(totalPages || 1);
  
      setStatement({
        accountName,
        bankName,
        computedBalance: computedBalance || 0,
      });
    } catch (error) {
      console.error("Error fetching bank statement:", error);
      alert("Error fetching bank statement");
    }
  };
  

  useEffect(() => {
    fetchStatement();
  }, [bankId, page]);

  if (!statement) return <div>Loading...</div>;

  const formattedBalance =
    typeof statement.computedBalance === "number"
      ? statement.computedBalance.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "0.00";

  return (
    <div className="bank-statement">
      <button className="close-btn" onClick={onClose}>
        Close
      </button>
      <h3>
        {statement.accountName} - {statement.bankName}
      </h3>
      <h4>Computed Balance: ₹{formattedBalance}</h4>

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
              <tr
                key={txn._id || `${txn.date}-${txn.amount}-${txn.accountHolder}`}
              >
                <td>{txn.date ? new Date(txn.date).toLocaleDateString() : "-"}</td>
                <td>{txn.accountHolder || "-"}</td>
                <td>{txn.transactionType || "-"}</td>
                <td
                  className={
                    txn.transactionType === "Credit" ? "credit" : "debit"
                  }
                >
                  ₹{Number(txn.amount ?? 0).toFixed(2)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No transactions found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          ⬅️ Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next ➡️
        </button>
      </div>
    </div>
  );
};

export default BankStatement;
