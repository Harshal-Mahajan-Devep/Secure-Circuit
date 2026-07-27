import {
  BrowserRouter,
  useLocation,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

/* ================= ADMIN ================= */
import Sidebar from "./Admin/Sidebar";
import Header from "./Admin/Header";
import Footer from "./Admin/Footer";
import Login from "./Admin/Login";
import Dashboard from "./Admin/Dashboard";
import Customers from "./Admin/Customers";
import Staff from "./Admin/Staff";
import Orders from "./Admin/Orders";
import Delivered from "./Admin/Delivered";
import Dispatches from "./Admin/Dispatches";
import Quotations from "./Admin/Quotations";
import Setting from "./Admin/Setting";
import Profile from "./Admin/Profile";
import Approved from "./Admin/Approved";
import Suppliers from "./Admin/Suppliers";

/* ================= USERS ================= */
import Pdf from "./Users/Pdf";
import Home from "./Users/Home";
import About from "./Users/About";
import Contact from "./Users/Contact";
import Header_home from "./Users/Header"
import Header_footer from "./Users/Footer"
import Whychoose from "./Users/Why_choose";
import Services from "./Users/Services";
import CustLogin from "./Users/Login";
import GerberUpload from "./Users/GerberUpload2";
import Cart from "./Users/Cart"

/* ================= CUSTUMER ================= */
import CustSidebar from "./Customer/Sidebar";
import CustHeader from "./Customer/Header";
import CustFooter from "./Customer/Footer";
import CustResetpass from "./Customer/Resetpass";
import CustProfile from "./Customer/Profile";
import CustDashboard from "./Customer/Dashboard";
import CustOrders from "./Customer/Orders";
import CustDispatches from "./Customer/Dispatches";
import CustQuotations from "./Customer/Quotations";
import CustSaveqQuote from "./Customer/Saved";


/* ================= SUPPLIER ================= */
import SuppSidebar from "./Supplier/Sidebar";
import SuppHeader from "./Supplier/Header";
import SuppFooter from "./Supplier/Footer";
import SuppLogin from "./Supplier/Login";
import SuppResetpass from "./Supplier/Resetpass";
import SuppDashboard from "./Supplier/Dashboard";
import SuppOrders from "./Supplier/Orders";
import SuppQuotations from "./Supplier/Quotations";
import SuppDispatches from "./Supplier/Dispatches";
import SuppProfile from "./Supplier/Profile";


/* ================= ADMIN LAYOUT ================= */
const AdminLayout = () => (
  <div className="admin-shell">
    <Sidebar />
    <div className="admin-main">
      <Header />
      <main className="dashboard-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  </div>
);

const CustomerLayout = () => (
  <div className="admin-shell">
    <CustSidebar />
    <div className="admin-main">
      <CustHeader />
      <main className="dashboard-content">
        <Outlet />
      </main>
      <CustFooter />
    </div>
  </div>
);

const SupplierLayout = () => (
  <div className="admin-shell">
    <SuppSidebar />
    <div className="admin-main">
      <SuppHeader />
      <main className="dashboard-content">
        <Outlet />
      </main>
      <SuppFooter />
    </div>
  </div>
);

const UsesLayout = () => (
  <>
    <Header_home />
    <Outlet />
    <Header_footer />
  </>

);

function MainApp() {
  return (
    <>
      <Routes>

        <Route path="pdf" element={<Pdf />} />

        {/* User */}
        <Route element={<UsesLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/order-now" element={<GerberUpload />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/why-choose" element={<Whychoose />} />
          <Route path="/services/:service" element={<Services />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<CustLogin />} />
        </Route>

        {/* Admin Login */}
        <Route path="backend" element={<Login />} />

        {/* Admin */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/approved" element={<Approved />} />
          <Route path="/delivered" element={<Delivered />} />
          <Route path="/quotations" element={<Quotations />} />
          <Route path="/dispatches" element={<Dispatches />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/suppliers" element={<Suppliers />} />
        </Route>

        {/* Customer Login */}

        <Route path="customer/reset-password" element={<CustResetpass />} />

        {/* Customer */}
        <Route element={<CustomerLayout />}>
          <Route path="/customer/dashboard" element={<CustDashboard />} />
          <Route path="/customer/profile" element={<CustProfile />} />
          <Route path="/customer/orders" element={<CustOrders />} />
          <Route path="/customer/quotations" element={<CustQuotations />} />
          <Route path="/customer/dispatches" element={<CustDispatches />} />
          <Route path="/customer/saved-cart" element={<CustSaveqQuote />} />
        </Route>

        {/* Supplier Login */}
        <Route path="supplier/login" element={<SuppLogin />} />
        <Route path="supplier/reset-password" element={<SuppResetpass />} />


        {/* Supplier */}
        <Route element={<SupplierLayout />}>
          <Route path="/supplier/dashboard" element={<SuppDashboard />} />
          <Route path="/supplier/profile" element={<SuppProfile />} />
          <Route path="/supplier/orders" element={<SuppOrders />} />
          <Route path="/supplier/quotations" element={<SuppQuotations />} />
          <Route path="/supplier/dispatches" element={<SuppDispatches />} />
        </Route>
      </Routes>
    </>
  );
}

/* ================= MAIN APP ================= */
function App() {
  return (
    <>
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          duration: 2000,
          style: {
            background: "#1f2937",
            color: "#fff",
            borderRadius: "12px",
            padding: "14px 50px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          },
        }}
      />

      <BrowserRouter basename="/">
        <MainApp />
      </BrowserRouter>
    </>
  );
}

export default App;
