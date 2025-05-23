import React from "react";

const PrintComponent = React.forwardRef(({ transactions, banksMap, selectedAccount, selectedType }, ref) => (
  <div ref={ref} className="print-section">
    <div className="print-header">
      <img src="/logo.png" alt="Company Logo" className="print-logo" />
      <div className="company-info">
        <div className="address">Tesseract Flex Fuel Pvt Ltd<br/>Ahmedabad, Gujarat, India</div>
        <div>Email: info@tesseractfuel.com</div>
        <div>Contact: +91-9876543210</div>
      </div>
    </div>

    <h2 className="print-title">Transaction Report</h2>
    <p className="print-subtitle">
      Account Holder: <strong>{selectedAccount}</strong> | Type: <strong>{selectedType}</strong>
    </p>

    <table className="print-table">
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
        {transactions.map((tx) => (
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
  </div>
));

export default PrintComponent;
