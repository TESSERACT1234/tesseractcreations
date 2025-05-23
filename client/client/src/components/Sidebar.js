import React, { useState } from "react";
import "./Sidebar.css";
import logo from "../components/newlogo.png";

const Sidebar = ({ active, setActive, onSearchInputChange }) => {
  const [input, setInput] = useState("");

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    onSearchInputChange(val);
  };

  const menuItems = [
    "Add Transaction",
    "Customers",
    "Feedstock Vendors",
    "Regular",
    "Employees",
    "Reports",
    "Manage Banks",
    "Create Account",
    "Docs & Releases",
  ];

  return (
    <div className="sidebar">
      <img src={logo} alt="logo" className="logo" />
      <input
        type="text"
        placeholder="Search..."
        value={input}
        onChange={handleInputChange}
        style={{ marginBottom: "20px", padding: "8px", width: "90%" }}
      />
      {menuItems.map((item, index) => (
        <div
          key={index}
          className={`menu-item ${active === item ? "active" : ""}`}
          onClick={() => setActive(item)}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
