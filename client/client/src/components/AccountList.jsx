import React, { useEffect, useState } from "react";
import axios from "axios";
import AccountTransactions from "./AccountTransactions";
import "./AccountList.css";

const AccountList = ({ type }) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    setSelectedAccount(null); // reset selected account when type changes
    const fetchAccounts = async () => {
      try {
        const res = await axios.get(`https://tesseractcreations-1.onrender.com/accounts/type/${type}`);
        setAccounts(res.data);
      } catch (err) {
        console.error("Error fetching accounts:", err);
      }
    };

    fetchAccounts();
  }, [type]);

  if (selectedAccount) {
    return (
      <AccountTransactions
        accountName={selectedAccount.name}
        onBack={() => setSelectedAccount(null)}
      />
    );
  }

  return (
    <div className="account-list">
      <h2>{type} Accounts</h2>
      <div className="account-grid">
        {accounts.length > 0 ? (
          accounts.map((acc) => (
            <div
              key={acc._id}
              className="account-card"
              onClick={() => setSelectedAccount(acc)}
              style={{ cursor: "pointer" }}
              title="Click to view transactions"
            >
              <h3>{acc.name}</h3>
              <p><strong>Contact:</strong> {acc.contact}</p>
              <p><strong>Address:</strong> {acc.address}</p>
            </div>
          ))
        ) : (
          <p>No {type.toLowerCase()} accounts found.</p>
        )}
      </div>
    </div>
  );
};

export default AccountList;
