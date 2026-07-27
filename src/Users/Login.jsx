import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import logo from "../../public/assets/images/secure-circuit-logo.png";
import toast from "react-hot-toast";
import "../Users/Login.css";

function Login() {
  // Tabs State: 'login' | 'register' | 'forgot'
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto Redirection if Logged In
  const customer = JSON.parse(localStorage.getItem("customer"));
  useEffect(() => {
    if (customer) {
      navigate("/customer/dashboard");
    }
  }, [customer, navigate]);

  // Combined Form States
  const [formData, setFormData] = useState({
    cust_contact_person: "",
    cust_email: "",
    cust_mobile: "",
    cust_password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper for Pending Cart Order
  const handlePendingOrderInsertion = async (custData) => {
    const pendingCartIds = localStorage.getItem("pending_order_cart_ids");
    const customerId = custData?.cust_id || custData?.id;

    if (pendingCartIds && customerId) {
      try {
        const payload = {
          order_cust_id: customerId,
          order_cart_id: pendingCartIds,
          order_stage: 2
        };

        const response = await axios.post(`${BASE_URL}customer/insert/tbl_orders`, payload);

        if (response.data && response.data.status) {
          localStorage.removeItem("pending_order_cart_ids");
          toast.success("Order placed successfully!");
          navigate("/customer/order");
          return;
        }
      } catch (error) {
        console.error("Cart insertion error:", error);
      }
    }

    toast.success("Login Successful!");
    navigate("/customer/dashboard");
  };

  // 1. Submit Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.cust_email || !formData.cust_password) {
      toast.error("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}customer/login`, {
        cust_email: formData.cust_email,
        cust_password: formData.cust_password,
      });

      if (res.data.status) {
        localStorage.setItem("customer", JSON.stringify(res.data.customer));
        await handlePendingOrderInsertion(res.data.customer);
      } else {
        toast.error(res.data.message || "Invalid credentials.");
      }
    } catch (err) {
      toast.error("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.cust_contact_person || !formData.cust_email || !formData.cust_password) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}customer/register`, formData);

      if (res.data.status) {
        toast.success("Account created! You can now login.");
        localStorage.setItem("customer", JSON.stringify(res.data.customer));
        await handlePendingOrderInsertion(res.data.customer);
      } else {
        toast.error(res.data.message || "Registration failed.");
      }
    } catch (err) {
      toast.error("Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Forgot Password
  const handleForgot = async (e) => {
    e.preventDefault();
    if (!formData.cust_email) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}customer/forgot-password`, {
        cust_email: formData.cust_email,
      });

      if (res.data.status) {
        toast.success(res.data.message || "Reset link sent!");
        setActiveTab("login");
      } else {
        toast.error(res.data.message || "Email not registered.");
      }
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-auth-wrapper">
      <div className="px-auth-card">
        {/* Header Branding */}
        <div className="px-auth-brand">
          {/* <img src={logo} alt="Brand Logo" className="px-auth-logo" /> */}
          <p className="px-auth-desc">
            {activeTab === "login" && "Access your account and manage orders"}
            {activeTab === "register" && "Join us to simplify your PCB ordering"}
            {activeTab === "forgot" && "Recover your account credentials"}
          </p>
        </div>

        {/* Top Tab Bar Switcher */}
        <div className="px-tab-bar">
          <button
            type="button"
            className={`px-tab-btn ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            SIGN IN
          </button>
          <button
            type="button"
            className={`px-tab-btn ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            REGISTER
          </button>
        </div>

        {/* Dynamic Forms Container */}
        <div className="px-form-fade" key={activeTab}>
          {/* LOGIN FORM */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin}>
              <div className="px-field-group">
                <label>EMAIL</label>
                <input
                  type="email"
                  name="cust_email"
                  placeholder="name@domain.com"
                  value={formData.cust_email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="px-field-group">
                <label>PASSWORD</label>
                <input
                  type="password"
                  name="cust_password"
                  placeholder="••••••••"
                  value={formData.cust_password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="px-submit-btn" disabled={loading}>
                {loading ? <><span className="px-spinner"></span> LOGGING IN...</> : "LOG IN"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  className="px-action-link"
                  onClick={() => setActiveTab("forgot")}
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister}>
              <div className="px-field-group">
                <label>FULL NAME</label>
                <input
                  type="text"
                  name="cust_contact_person"
                  placeholder="John Doe"
                  value={formData.cust_contact_person}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="px-field-group">
                <label>PHONE NUMBER</label>
                <input
                  type="tel"
                  name="cust_mobile"
                  maxLength="10"
                  minLength="10"
                  placeholder="+91 9876543210"
                  value={formData.cust_mobile}
                  onChange={handleChange}
                />
              </div>

              <div className="px-field-group">
                <label>EMAIL</label>
                <input
                  type="email"
                  name="cust_email"
                  placeholder="name@domain.com"
                  value={formData.cust_email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="px-field-group">
                <label>PASSWORD</label>
                <input
                  type="password"
                  name="cust_password"
                  placeholder="••••••••"
                  value={formData.cust_password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="px-submit-btn" disabled={loading}>
                {loading ? <><span className="px-spinner"></span> CREATING...</> : "CREATE ACCOUNT"}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {activeTab === "forgot" && (
            <form onSubmit={handleForgot}>
              <div className="px-field-group">
                <label>REGISTERED EMAIL</label>
                <input
                  type="email"
                  name="cust_email"
                  placeholder="name@domain.com"
                  value={formData.cust_email}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="px-submit-btn" disabled={loading}>
                {loading ? <><span className="px-spinner"></span> SENDING...</> : "SEND RESET LINK"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  className="px-action-link"
                  onClick={() => setActiveTab("login")}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;