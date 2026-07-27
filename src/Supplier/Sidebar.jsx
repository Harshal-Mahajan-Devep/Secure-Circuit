import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";

import logoLight from "../../public/assets/images/logo-light.png";
import logoDark from "../../public/assets/images/logo-dark.png";

import logoTextLight from "../../public/assets/images/dash-text-light.png";
import logoTextDark from "../../public/assets/images/dash-text-dark.png";

function Sidebar() {
  const supplier = JSON.parse(localStorage.getItem("supplier"));
  const SuppId = supplier?.supp_id;
  const menuAccess = supplier?.supp_menu || [];
  const isSupplier = supplier?.supp_role == 1;

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [counts, setCounts] = useState({
    orders: 0,
    quotations: 0,
    dispatches: 0,
  });

  useEffect(() => {
    const updateTheme = () => {
      setTheme(localStorage.getItem("theme") || "light");
    };

    window.addEventListener("themeChanged", updateTheme);

    return () => {
      window.removeEventListener("themeChanged", updateTheme);
    };
  }, []);

  useEffect(() => {
    getCounts();
    getMenus();
  }, []);

  const getMenus = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${BASE_URL}supplier/getdata/tbl_menus`);

      if (response.data.status) {
        setMenus(response.data.data);
      }
    } catch (error) {
      console.log("Menu Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };


  const getCounts = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}supplier/getdata/tbl_orders`
      );

      const orders = res.data.data || [];

      const supplierOrders = orders.filter((item) => {
        if (!item.order_transfer_supplier) return false;

        return item.order_transfer_supplier
          .split(",")
          .map((id) => id.trim())
          .includes(String(SuppId));
      });

      setCounts({
        orders: supplierOrders.length,
        quotations: 0,
        dispatches: 0,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getCardCount = (route) => {
    switch (route) {
      case "orders":
        return counts.orders;

      case "quotations":
        return counts.quotations;

      case "dispatches":
        return counts.dispatches;

      default:
        return 0;
    }
  };

  return (
    <>
      <div className="sidebar-backdrop" data-sidebar-close></div>

      <aside
        className="admin-sidebar"
        id="adminSidebar"
        aria-label="Main navigation"
      >
        <div className="sidebar-header">
          <Link className="brand-mark" to="/supplier/dashboard">
            <span>
              <img
                src={theme === "dark" ? logoDark : logoLight}
                alt="Logo"
                style={{ width: "50px" }}
              />
            </span>

            <span className="brand-copy text-center">
              <img
                src={theme === "dark" ? logoTextDark : logoTextLight}
                alt="Logo Text"
                style={{ width: "70px" }}
              />
            </span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div className="sidebar-skeleton" key={index}>
                <div className="sidebar-skeleton-icon"></div>
                <div className="sidebar-skeleton-text"></div>
                <div className="sidebar-skeleton-count"></div>
              </div>
            ))
          ) : (menus
            .filter((menu) => {
              if (menu.menu_status != 1) return false;

              // Admin la sarv menu
              if (isSupplier) return true;

              // Staff la assigned menu
              return menuAccess.includes(String(menu.menu_id));
            })
            .sort((a, b) => Number(a.menu_order) - Number(b.menu_order))
            .map((menu) => (
              <NavLink
                key={menu.menu_id}
                to={`/supplier/${menu.menu_routes}`}
                className={({ isActive }) =>
                  isActive ? "nav-link active-primary" : "nav-link"
                }
              >
                <span className="nav-icon text-primary">
                  <i className={menu.menu_icon}></i>
                </span>

                <span className="nav-text">{menu.menu_name}</span>

                {menu.menu_routes !== "dashboard" && (
                  <span className="ms-auto badge rounded-pill bg-primary">
                    {getCardCount(menu.menu_routes)}
                  </span>
                )}
              </NavLink>
            ))
          )}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
