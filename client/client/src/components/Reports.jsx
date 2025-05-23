import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./Reports.css";

const Reports = () => {
  const accountTypes = ["Customers", "Feedstock Vendors", "Regular", "Employees"];

  const [selectedType, setSelectedType] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [banksMap, setBanksMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";
  const printRef = useRef();

  useEffect(() => {
    if (!selectedType) {
      setAccounts([]);
      setSelectedAccount("");
      setTransactions([]);
      return;
    }

    const fetchAccounts = async () => {
      try {
        const res = await axios.get(`${backendUrl}/accounts/type/${selectedType}`);
        setAccounts(res.data);
        setSelectedAccount("");
        setTransactions([]);
      } catch (error) {
        console.error("❌ Failed to fetch accounts:", error);
      }
    };

    fetchAccounts();
  }, [selectedType, backendUrl]);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await axios.get(`${backendUrl}/banks`);
        const map = {};
        res.data.forEach(bank => {
          map[bank._id] = {
            name: bank.bankName,
            accountNumber: bank.accountNumber || ""
          };
        });
        setBanksMap(map);
      } catch (error) {
        console.error("❌ Failed to fetch banks:", error);
      }
    };
    fetchBanks();
  }, [backendUrl]);

  const fetchTransactions = async () => {
    setCurrentPage(1);

    if (!selectedAccount) {
      alert("Please select an account");
      return;
    }

    setLoading(true);
    try {
      let url = `${backendUrl}/report/transactions?accountHolder=${selectedAccount}`;
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await axios.get(url);
      setTransactions(res.data);
    } catch (error) {
      console.error("❌ Failed to fetch transactions:", error);
      alert("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const allTransactionsHtml = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: black;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: center;
            }
            th {
              background-color: #f0f0f0;
            }
            img {
              height: 60px;
              display: block;
              margin: 0 auto;
            }
            h3, p {
              text-align: center;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <img src="./newlogo.png" alt="Company Logo" />
          <h3>Transaction Report</h3>
          <p>Account Holder: <strong>${selectedAccount}</strong> | Type: <strong>${selectedType}</strong></p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Transaction</th>
                <th>Bank</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(tx => `
                <tr>
                  <td>${new Date(tx.date).toLocaleDateString()}</td>
                  <td>${tx.type}</td>
                  <td>${tx.amount}</td>
                  <td>${tx.transactionType}</td>
                  <td>
                    ${banksMap[tx.bankId]
                      ? `${banksMap[tx.bankId].name} • ${banksMap[tx.bankId].accountNumber.slice(-4)}`
                      : tx.bankId}
                  </td>
                </tr>`).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(allTransactionsHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="report-container">
      <h2>📊 Transaction Reports</h2>

      <div className="filters">
        <label>Account Type:</label>
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          <option value="">Select</option>
          {accountTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <label>Account:</label>
        <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} disabled={!accounts.length}>
          <option value="">Select</option>
          {accounts.map((acc) => (
            <option key={acc._id} value={acc.name}>{acc.name}</option>
          ))}
        </select>

        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

        <label>End Date:</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

        <div className="buttons">
          <button onClick={fetchTransactions}>🔍 Fetch Transactions</button>
          {transactions.length > 0 && <button onClick={handlePrint}>🖨️ Print</button>}
        </div>
      </div>

      {loading ? (
        <p>Loading transactions...</p>
      ) : (
        <div ref={printRef} className="transaction-table">
          {transactions.length === 0 ? (
            <p>No transactions found</p>
          ) : (
            <>
              <div className="print-header">
                <center><img src="./newlogo.png" alt="Company Logo" style={{ height: "60px" }} /></center>
                <h3 style={{ textAlign: "center", margin: "20px 0" }}>Transaction Report</h3>
                <p style={{ textAlign: "center" }}>
                  Account Holder: <strong>{selectedAccount}</strong> | Type: <strong>{selectedType}</strong>
                </p>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Transaction</th>
                    <th>Bank</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .slice((currentPage - 1) * transactionsPerPage, currentPage * transactionsPerPage)
                    .map((tx) => (
                      <tr key={tx._id}>
                        <td>{new Date(tx.date).toLocaleDateString()}</td>
                        <td>{tx.type}</td>
                        <td>{tx.amount}</td>
                        <td>{tx.transactionType}</td>
                        <td>
                          {banksMap[tx.bankId]
                            ? `${banksMap[tx.bankId].name} • ${banksMap[tx.bankId].accountNumber.slice(-4)}`
                            : tx.bankId}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              <div className="pagination-controls">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ◀️ Previous
                </button>

                <span style={{ margin: "0 10px" }}>
                  Page {currentPage} of {Math.ceil(transactions.length / transactionsPerPage)}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      prev < Math.ceil(transactions.length / transactionsPerPage) ? prev + 1 : prev
                    )
                  }
                  disabled={currentPage === Math.ceil(transactions.length / transactionsPerPage)}
                >
                  Next ▶️
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
