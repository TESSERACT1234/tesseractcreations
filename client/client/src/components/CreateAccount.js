import React, { useState } from "react";
import axios from "axios";
import "./CreateAccount.css";

const CreateAccount = () => {
  const [form, setForm] = useState({
    name: "",
    contact: "",
    address: "",
    accountType: "Customers"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("https://tesseractcreations-1.onrender.com/accounts", form);
    alert("Account Created Successfully");
    setForm({ name: "", contact: "", address: "", accountType: "Customers" });
  };

  return (
    <div className="create-account">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Account Holder Name" value={form.name} onChange={handleChange} required />
        <input name="contact" placeholder="Contact Number" value={form.contact} onChange={handleChange} required />
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
        <select name="accountType" value={form.accountType} onChange={handleChange}>
          <option>Customers</option>
          <option>Feedstock Vendors</option>
          <option>Regular</option>
          <option>Employees</option>
        </select>
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreateAccount;
