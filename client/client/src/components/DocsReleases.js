import React, { useState } from "react";
import "./DocsReleases.css"; // Create this file for styling
import logo from "./newlogo.png"; // Use your company logo

const DocsReleases = () => {
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [formData, setFormData] = useState({
    accountType: "",
    accountHolder: "",
    date: "",
    amount: "",
    pan: "",
    din: "",
    paymentMode: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const content = `
      <html>
      <head>
        <style>
          @page {
            margin: 0;
            size: auto;
          }
  
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            margin: 0;
          }
  
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
          }
          .left-block {
            max-width: 65%;
            font-size: 14px;
            margin-top: 35px;
          }
          .logo {
            max-width: 30%;
            text-align: right;
          }
          .logo img {
            max-width: 100%;
            height: auto;
          }
          .section {
            margin-top: 30px;
            font-size: 14px;
          }
          .footer {
            margin-top: 80px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="left-block">
            <strong>Tesseract Flex Fuel Pvt. Ltd.</strong><br/>
            Registered Office: 144 Gandhi Chowk, Gangardi, Garbada, Dahod, Gujarat.<br/>
            Factory: 44B Suncity Industrial Park, Haripura, Savli, Vadodara, Gujarat.<br/><br/>
            Date: ${formData.date}<br/>
            CIN: U12345MH2022PTC123456
          </div>
          <div class="logo">
            <img src="${logo}" alt="Logo" />
          </div>
        </div>
  
        <div class="section">
          <strong>Account Holder:</strong> ${formData.accountHolder} (${formData.accountType})<br/>
          <strong>PAN:</strong> ${formData.pan}<br/>
          <strong>DIN:</strong> ${formData.din}
        </div>
  
        <div class="section">
          We hereby acknowledge the receipt of a sum of ₹${parseFloat(formData.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })} from <strong>${formData.accountHolder}</strong> as per the terms mutually agreed upon, towards dues payable to Tesseract Flex Fuel Pvt. Ltd. This payment has been received via <strong>${formData.paymentMode || "[Cash / Cheque / Bank Transfer / UPI / Other]"}</strong> and will be duly recorded in our financial books.
        </div>
  
        <div class="section">
          This receipt serves as an official confirmation of payment made and accepted by the company for the stated amount.
        </div>
  
        <div class="footer">
          For Tesseract Flex Fuel Pvt. Ltd.<br/><br/><br/>
          ____________________________<br/>
          Arya Nimeshkumar Shah<br/>
          Director
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };
  





  return (
    <div className="docs-releases">
      <h2>Docs & Releases</h2>
      <div className="doc-sections">
        <div className="doc-card" onClick={() => setShowReceiptForm(true)}>Receipts</div>
        <div className="doc-card disabled">Press Releases</div>
        <div className="doc-card disabled">Notices</div>
      </div>

      {showReceiptForm && (
        <div className="popup">
          <div className="popup-inner">
            <h3>Generate Receipt</h3>
            <input name="accountType" placeholder="Account Holder Type" onChange={handleChange} />
            <input name="accountHolder" placeholder="Account Holder Name" onChange={handleChange} />
            <input type="date" name="date" onChange={handleChange} />
            <input name="amount" placeholder="Amount" onChange={handleChange} />
            <select name="paymentMode" onChange={handleChange}>
              <option value="">Select Payment Mode</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="Other">Other</option>
            </select>
            <input name="pan" placeholder="PAN" onChange={handleChange} />
            <input name="din" placeholder="DIN" onChange={handleChange} />
            <button onClick={handlePrint}>🖨️ Print Document</button>
            <button onClick={() => setShowReceiptForm(false)}>❌ Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocsReleases;
