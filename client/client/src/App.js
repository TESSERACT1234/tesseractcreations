import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Sidebar from "./components/Sidebar";
import CreateAccount from "./components/CreateAccount";
import AccountList from "./components/AccountList";
import AddTransaction from "./components/AddTransaction";
import ManageBanks from "./components/ManageBanks";
import Reports from "./components/Reports";
import DocsReleases from "./components/DocsReleases";
import Login from "./components/Login";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("Create Account");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isAccountType = ["Customers", "Feedstock Vendors", "Regular", "Employees"].includes(active);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Let this control login state
    });
    return () => unsub();
  }, []);
  
  

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setShowPopup(false);
      return;
    }

    setIsLoading(true);

    const fetchResults = async () => {
      try {
        const res = await fetch(`http://localhost:5001/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
        setShowPopup(true);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults(null);
        setShowPopup(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery]);

  const handleSearchInputChange = (val) => setSearchQuery(val);

  const handleResultClick = (type, item) => {
    if (type === "account") setActive(item.accountType);
    else if (type === "transaction") setActive("Add Transaction");
    else if (type === "bank") setActive("Manage Banks");
    setShowPopup(false);
    setSearchQuery("");
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (!user) return <Login onLogin={(u) => setUser(u)} />;

  return (
    <div className="app" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active={active} setActive={setActive} onSearchInputChange={handleSearchInputChange} />

      <div className="main-content" style={{ flex: 1, position: "relative", padding: "10px" }}>
        <div style={{ textAlign: "right", marginBottom: "10px" }}>
          <span>Welcome, <strong>{user.email}</strong> </span>
          <button onClick={handleLogout} style={{ marginLeft: "10px" }}>Logout</button>
        </div>

        {/* Dynamic content */}
        {active === "Create Account" && <CreateAccount />}
        {active === "Add Transaction" && <AddTransaction />}
        {active === "Manage Banks" && <ManageBanks />}
        {active === "Reports" && <Reports />}
        {active === "Docs & Releases" && <DocsReleases />}
        {isAccountType && <AccountList type={active} />}

        {/* Search popup */}
        {showPopup && (
          <div style={{
            position: "absolute",
            top: 60,
            left: 20,
            right: 20,
            backgroundColor: "white",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            maxHeight: "350px",
            overflowY: "auto",
            zIndex: 1000,
            borderRadius: "6px",
            padding: "15px",
          }}>
            {isLoading && <p>Loading...</p>}

            {!isLoading && searchResults && (
              <>
                {/* Accounts */}
                <div>
                  <h4 style={{ marginBottom: 5, borderBottom: "1px solid #ddd" }}>Accounts</h4>
                  {searchResults.accounts.length ? (
                    <ul>
                      {searchResults.accounts.map((acc) => (
                        <li key={acc._id} style={{ cursor: "pointer", padding: "4px 0" }} onClick={() => handleResultClick("account", acc)}>
                          {acc.name} <em>({acc.accountType})</em>
                        </li>
                      ))}
                    </ul>
                  ) : <p style={{ color: "#888" }}>No accounts found</p>}
                </div>

                {/* Transactions */}
                <div style={{ marginTop: 10 }}>
                  <h4 style={{ marginBottom: 5, borderBottom: "1px solid #ddd" }}>Transactions</h4>
                  {searchResults.transactions.length ? (
                    <ul>
                      {searchResults.transactions.map((txn) => (
                        <li key={txn._id} style={{ cursor: "pointer", padding: "4px 0" }} onClick={() => handleResultClick("transaction", txn)}>
                          {txn.accountHolder} - ₹{txn.amount}
                        </li>
                      ))}
                    </ul>
                  ) : <p style={{ color: "#888" }}>No transactions found</p>}
                </div>

                {/* Banks */}
                <div style={{ marginTop: 10 }}>
                  <h4 style={{ marginBottom: 5, borderBottom: "1px solid #ddd" }}>Banks</h4>
                  {searchResults.banks.length ? (
                    <ul>
                      {searchResults.banks.map((bank) => (
                        <li key={bank._id} style={{ cursor: "pointer", padding: "4px 0" }} onClick={() => handleResultClick("bank", bank)}>
                          {bank.bankName} - {bank.accountName}
                        </li>
                      ))}
                    </ul>
                  ) : <p style={{ color: "#888" }}>No banks found</p>}
                </div>
              </>
            )}
          </div>
        )}

        
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
