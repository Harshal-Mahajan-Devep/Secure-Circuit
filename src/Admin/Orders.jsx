import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";
import Delete from "../Config/Delete";
import React, { useEffect, useRef, useState } from "react";
import TableLoader from "../Config/TableLoader";
import * as bootstrap from "bootstrap";
import StageDrawer from "./StageDrawer";

function Orders() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const adminrole = admin?.staff_role;

  const [orderData, setorderData] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [customerData, setCustomerData] = useState([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editMessageId, setEditMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const [showStageDrawer, setShowStageDrawer] = useState(false);

  // Expanded Row आणि Cart Data Fetching साठी States
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [cartDetails, setCartDetails] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // order_cart_id वरून Cart/Product चा डेटा API मधून फेच करणे
  const fetchCartDetails = async (cartId) => {
    setDetailLoading(true);
    try {
      // इथे तुमच्या बॅकएंड API नुसार URL सेट केले आहे (tbl_cart मधील cart_id वरून डेटा आणण्यासाठी)
      const response = await axios.get(
        `${BASE_URL}admin/getdatawhere/tbl_cart/cart_id/${cartId}`
      );

      if (response.data.status) {
        setCartDetails(
          Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data]
        );
      } else {
        setCartDetails([]);
      }
    } catch (error) {
      console.log("Cart data fetch error:", error);
      setCartDetails([]);
    } finally {
      setDetailLoading(false);
    }
  };

  // Toggle Row आणि Click झाल्यावर API कॉल करणे
  const toggleExpandRow = (order) => {
    if (expandedOrderId === order.order_id) {
      setExpandedOrderId(null);
      setCartDetails([]);
    } else {
      setExpandedOrderId(order.order_id);

      // order ऑब्जेक्ट मधून cart id मिळवणे
      const cartId = order.order_cart_id || order.cart_id;

      if (cartId) {
        fetchCartDetails(cartId);
      } else {
        // जर थेट ऑर्डर्समध्येच डेटा असेल तर फॉलबॅक
        setCartDetails([order]);
      }
    }
  };

  // Initialize Bootstrap popovers whenever orderData changes
  useEffect(() => {
    const popoverTriggerList = document.querySelectorAll(
      '[data-bs-toggle="popover"]'
    );

    popoverTriggerList.forEach((el) => {
      bootstrap.Popover.getOrCreateInstance(el);
    });
  }, [orderData]);

  // Fetch Suppliers Data
  const getSupplierData = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}admin/getdata/tbl_suppliers`
      );

      if (response.data.status) {
        setSupplierData(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getorderData();
    getSupplierData();
    getCustomerData();
  }, []);

  // Auto-scroll chat area to bottom when messages update or query modal opens
  useEffect(() => {
    if (showQueryModal) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    }
  }, [messages, showQueryModal]);

  // Fetch messages for selected order query
  const getMessages = async (orderId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}admin/getdatawhere/tbl_query/que_order_id/${orderId}`
      );

      if (res.data.status) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Send or update chat message
  const sendMessage = async () => {
    if (message.trim() === "") return;

    try {
      if (editMessageId) {
        await axios.post(
          `${BASE_URL}admin/updatedata/tbl_query/que_id/${editMessageId}`,
          {
            que_edit_message: message,
          }
        );

        toast.success("Message Updated");
        setEditMessageId(null);
      } else {
        await axios.post(`${BASE_URL}admin/insert/tbl_query`, {
          que_order_id: selectedOrder.order_id,
          que_cust_id: selectedOrder.order_cust_id,
          que_send: "admin",
          que_message: message,
          que_admin_read: 1,
          que_cust_read: 0,
          que_supp_read: 0,
        });

        toast.success("Message Sent");
      }

      setMessage("");
      getMessages(selectedOrder.order_id);
    } catch (err) {
      toast.error("Failed");
    }
  };

  // Toggle query message status
  const changeStatus = async (id, status) => {
    try {
      const res = await axios.post(
        `${BASE_URL}admin/updatedata/tbl_query/que_id/${id}`,
        {
          que_status: status,
        }
      );

      if (res.data.status) {
        toast.success("Status Updated");
        getMessages(selectedOrder.order_id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Prepare message for editing
  const editMessage = (msg) => {
    setEditMessageId(msg.que_id);
    setMessage(msg.que_message);
  };

  // Fetch Customer list
  const getCustomerData = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}admin/getdata/tbl_customers`
      );

      if (response.data.status) {
        setCustomerData(response.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Fetch all orders
  const getorderData = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${BASE_URL}admin/getAdminOrders`);

      if (response.data.status) {
        setorderData(response.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Mark order query as read by admin
  const markAdminRead = async (orderId) => {
    try {
      await axios.post(`${BASE_URL}admin/markAdminRead`, {
        order_id: orderId,
      });

      getorderData();
    } catch (error) {
      console.log(error);
    }
  };

  // Delete Order
  const confirmDelete = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}admin/deletedata/tbl_orders/order_id/${deleteId}`
      );

      if (response.data.status) {
        toast.success("Successfully Deleted");

        setShowDelete(false);
        setDeleteId(null);

        getorderData();
      }
    } catch (error) {
      toast.error("Delete Failed");
    }
  };

  // Toggle supplier selection
  const handleSupplierSelect = (id) => {
    if (selectedSuppliers.includes(id)) {
      setSelectedSuppliers(selectedSuppliers.filter((item) => item !== id));
    } else {
      setSelectedSuppliers([...selectedSuppliers, id]);
    }
  };

  // Save selected suppliers for order
  const saveSuppliers = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}admin/updatedata/tbl_orders/order_id/${selectedOrderId}`,
        {
          order_transfer_supplier: selectedSuppliers.join(","),
          order_stage: "3",
        }
      );

      if (response.data.status) {
        toast.success("Suppliers Assigned Successfully");

        setShowSupplierModal(false);
        setSelectedSuppliers([]);

        getorderData();
      }
    } catch (error) {
      toast.error("Failed");
    }
  };

  return (
    <>
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-people" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">All</p>
              <h1 className="h3 mb-1">Orders</h1>
            </div>
          </div>
        </div>

        <section className="panel">
          <div className="table-responsive">
            <table
              className="table align-middle mb-0"
              id="ordersTable"
              data-searchable-table
            >
              <thead>
                <tr className="text-center">
                  <th>Action</th>
                  <th>Customer Detail</th>
                  {["1", "2", "3"].includes(adminrole) && <th>Stage</th>}
                  <th>Activity</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableLoader rows={6} columns={4} />
                ) : orderData.length > 0 ? (
                  orderData.map((order) => {
                    const isExpanded = expandedOrderId === order.order_id;

                    return (
                      <React.Fragment key={order.order_id}>
                        <tr>
                          <td className="text-center">
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => {
                                  setSelectedOrderId(order.order_id);
                                  setSelectedSuppliers(
                                    order.order_transfer_supplier
                                      ? order.order_transfer_supplier
                                        .split(",")
                                        .map(Number)
                                      : []
                                  );
                                  setShowSupplierModal(true);
                                }}
                              >
                                <i className="bi bi-building me-1"></i>
                                RFQ
                              </button>
                            </div>

                            <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
                              <div className="position-relative d-inline-block">
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowQueryModal(true);
                                    getMessages(order.order_id);
                                    markAdminRead(order.order_id);
                                  }}
                                  disabled={Number(order.order_stage) <= 7}
                                >
                                  <i className="fa-regular fa-circle-question"></i>
                                  Query
                                </button>

                                {parseInt(order.unread_count) > 0 && (
                                  <span
                                    className="position-absolute rounded-circle bg-danger"
                                    style={{
                                      width: "12px",
                                      height: "12px",
                                      right: "-2px",
                                      top: "-2px",
                                      zIndex: 9999,
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          </td>

                          <td>
                            {/* Order Number आणि त्याच्या पुढे circular + / - Icon */}
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <div className="dropdown">
                                <span className="fw-semibold">Order No:</span>{" "}
                                <button
                                  className="btn text-decoration-none fw-semibold p-0 dropdown-toggle border-0"
                                  type="button"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  <b style={{ fontSize: "16px" }}>{order.order_code}</b>
                                </button>
                                <ul className="dropdown-menu">
                                  <li>
                                    <button
                                      className="dropdown-item text-danger"
                                      onClick={() => {
                                        setDeleteId(order.order_id);
                                        setShowDelete(true);
                                      }}
                                    >
                                      <i className="bi bi-trash me-2"></i>
                                      Delete
                                    </button>
                                  </li>
                                </ul>
                              </div>

                              {/* Circular + / - Button */}
                              <button
                                className={`btn btn-sm rounded-circle ${isExpanded ? "btn-danger" : "btn-outline-danger"
                                  }`}
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  padding: "0",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                                onClick={() => toggleExpandRow(order)}
                                title={isExpanded ? "Close Details" : "View Products"}
                              >
                                <i
                                  className={`bi ${isExpanded ? "bi-dash-lg" : "bi-plus-lg"
                                    }`}
                                  style={{ fontSize: "12px" }}
                                ></i>
                              </button>
                            </div>

                            <div>
                              <span className="fw-semibold">Customer ID:</span>{" "}
                              <span
                                className="text-primary fw-bold"
                                style={{ cursor: "pointer", fontSize: "16px" }}
                                data-bs-toggle="popover"
                                data-bs-trigger="hover"
                                data-bs-html="true"
                                data-bs-placement="right"
                                data-bs-title="Customer Details"
                                data-bs-content={`
                                  <b>Name:</b> ${order.cust_contact_person || "N/A"} <br/>
                                  <b>Company:</b> ${order.cust_company_name || "N/A"} <br/>
                                  <b>Email:</b> ${order.cust_email || "N/A"} <br/>
                                  <b>Phone:</b> ${order.cust_mobile || "N/A"} <br/>
                                `}
                              >
                                {order.cust_code}
                              </span>
                            </div>
                          </td>

                          {["1", "2", "3"].includes(adminrole) && (
                            <td className="text-center">
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowStageDrawer(true);
                                }}
                              >
                                <i className="fas fa-route me-2"></i>
                                Tracking
                              </button>
                            </td>
                          )}

                          <td className="text-start">
                            <span className="fw-semibold">Created Date:</span>{" "}
                            {order.order_request_date} <br />{" "}
                            <span className="fw-semibold">Created Time:</span>{" "}
                            {new Date(
                              `1970-01-01T${order.order_request_time}`
                            ).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </td>
                        </tr>

                        {/* Expandable Order Details Row */}
                        {isExpanded && (
                          <tr>
                            <td
                              colSpan={["1", "2", "3"].includes(adminrole) ? 4 : 3}
                              className="bg-light p-2"
                            >
                              {/* Custom Isolated Scroll Container */}
                              <div
                                className="custom-expanded-scroll"
                                style={{
                                  width: "970px",
                                  overflowX: "auto",
                                  overflowY: "hidden",
                                  whiteSpace: "nowrap",
                                  cursor: "grab",
                                  scrollbarWidth: "none", /* Firefox */
                                  msOverflowStyle: "none", /* IE/Edge */
                                  /* टेक्स्ट सिलेक्ट होऊ नये म्हणून (Disable Text Selection) */
                                  userSelect: "none",
                                  WebkitUserSelect: "none",
                                  MozUserSelect: "none",
                                  msUserSelect: "none",
                                }}
                                onMouseDown={(e) => {
                                  const slider = e.currentTarget;
                                  let isDown = true;
                                  let startX = e.pageX - slider.offsetLeft;
                                  let scrollLeft = slider.scrollLeft;

                                  slider.style.cursor = "grabbing";

                                  const onMouseMove = (e) => {
                                    if (!isDown) return;
                                    e.preventDefault();
                                    const x = e.pageX - slider.offsetLeft;
                                    const walk = (x - startX) * 2;
                                    slider.scrollLeft = scrollLeft - walk;
                                  };

                                  const onMouseUp = () => {
                                    isDown = false;
                                    slider.style.cursor = "grab";
                                    window.removeEventListener("mousemove", onMouseMove);
                                    window.removeEventListener("mouseup", onMouseUp);
                                  };

                                  window.addEventListener("mousemove", onMouseMove);
                                  window.addEventListener("mouseup", onMouseUp);
                                }}
                              >
                                <style>
                                  {`
                                    .custom-expanded-scroll::-webkit-scrollbar {
                                      display: none;
                                    }
                                  `}
                                </style>

                                {detailLoading ? (
                                  <div className="text-center py-3">
                                    <div
                                      className="spinner-border spinner-border-sm text-primary me-2"
                                      role="status"
                                    ></div>
                                    <span>Loading details...</span>
                                  </div>
                                ) : cartDetails.length > 0 ? (
                                  <table
                                    className="table table-sm table-bordered table-hover bg-white mb-0 text-center align-middle shadow-sm"
                                    style={{
                                      fontSize: "12px",
                                      width: "max-content",
                                      tableLayout: "auto",
                                    }}
                                  >
                                    <tbody>
                                      {cartDetails.map((item, index) => (
                                        <tr key={index}>
                                          <td
                                            title="Base Material"
                                            style={{ whiteSpace: "nowrap", padding: "8px 12px" }}
                                          >
                                            {item.cart_base_material || "N/A"}
                                          </td>

                                          <td
                                            title="Layer"
                                            style={{ whiteSpace: "nowrap", padding: "8px 12px" }}
                                          >
                                            {item.cart_pcb_layer || "N/A"}
                                          </td>

                                          <td
                                            title="Width x Height"
                                            style={{ whiteSpace: "nowrap", padding: "8px 12px" }}
                                          >
                                            {item.cart_pcb_width && item.cart_pcb_height
                                              ? `${item.cart_pcb_width} x ${item.cart_pcb_height}`
                                              : "N/A"}
                                          </td>

                                          <td
                                            title="Qty"
                                            style={{ whiteSpace: "nowrap", padding: "8px 12px" }}
                                          >
                                            {item.cart_selected_qty || "N/A"}
                                          </td>

                                          <td
                                            title="Product Type"
                                            className="fw-semibold text-start"
                                            style={{ whiteSpace: "nowrap", padding: "8px 12px" }}
                                          >
                                            {item.cart_product_type || "N/A"}
                                          </td>

                                          <td
                                            title="Thickness"
                                            style={{ whiteSpace: "nowrap", padding: "8px 12px" }}
                                          >
                                            {item.cart_pcb_thickness || "N/A"}
                                          </td>

                                          <td
                                            title="Color"
                                            style={{ whiteSpace: "nowrap", padding: "8px 12px" }}
                                          >
                                            {item.cart_pcb_color || "N/A"}
                                          </td>

                                          <td
                                            title="Silkscreen"
                                            style={{ whiteSpace: "nowrap", padding: "8px 12px" }}
                                          >
                                            {item.cart_silkscreen || "N/A"}
                                          </td>

                                          <td
                                            title="Material Type"
                                            style={{ whiteSpace: "nowrap", padding: "8px 12px" }}
                                          >
                                            {item.cart_material_type || "N/A"}
                                          </td>

                                          <td
                                            title="Surface Finish"
                                            style={{ whiteSpace: "nowrap", padding: "8px 12px" }}
                                          >
                                            {item.cart_surface_finish || "N/A"}
                                          </td>

                                          <td
                                            title="Outer Copper"
                                            style={{ whiteSpace: "nowrap", padding: "8px 12px" }}
                                          >
                                            {item.cart_outer_copper_weight || "N/A"}
                                          </td>

                                          <td
                                            title="Via Covering"
                                            style={{ whiteSpace: "nowrap", padding: "8px 12px" }}
                                          >
                                            {item.cart_via_covering || "N/A"}
                                          </td>

                                          <td
                                            title="Min Via Hole"
                                            style={{ whiteSpace: "nowrap", padding: "8px 12px" }}
                                          >
                                            {item.cart_min_via_hole || "N/A"}
                                          </td>

                                          <td
                                            title="Electrical Test"
                                            style={{ whiteSpace: "nowrap", padding: "8px 12px" }}
                                          >
                                            {item.cart_electrical_test || "N/A"}
                                          </td>

                                          <td
                                            title="Remark"
                                            className="text-start"
                                            style={{ whiteSpace: "nowrap", padding: "8px 12px" }}
                                          >
                                            {item.cart_pcb_remark || "N/A"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <div className="text-center py-2 text-danger">
                                    No details found for this cart ID.
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-danger">
                      No order Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <Delete
        show={showDelete}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDelete(false);
          setDeleteId(null);
        }}
      />

      {/* Supplier Modal Selection */}
      {showSupplierModal && (
        <div className="model-add-edit-modal-overlay">
          <div
            className="model-add-edit-modal-dialog"
            style={{ maxWidth: "500px" }}
          >
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header">
                <h5 className="model-add-edit-modal-title">
                  <i className="bi bi-building me-2"></i>
                  Select Suppliers
                </h5>

                <button
                  type="button"
                  className="model-add-edit-modal-close"
                  onClick={() => setShowSupplierModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="d-flex flex-wrap gap-2 p-3">
                {supplierData.map((supplier) => (
                  <div
                    key={supplier.supp_id}
                    className={`supplier-tag ${selectedSuppliers.includes(Number(supplier.supp_id))
                      ? "active"
                      : ""
                      }`}
                    onClick={() =>
                      handleSupplierSelect(Number(supplier.supp_id))
                    }
                  >
                    <div>
                      <strong>{supplier.supp_company_name}</strong>
                      <small>{supplier.supp_contact_person}</small>
                    </div>

                    {selectedSuppliers.includes(
                      Number(supplier.supp_id)
                    ) && (
                        <i className="bi bi-check-circle-fill text-success"></i>
                      )}
                  </div>
                ))}
              </div>
              <div className="model-add-edit-modal-footer d-flex justify-content-between">
                <span className="fw-semibold">
                  Selected: {selectedSuppliers.length}
                </span>

                <button
                  className="btn btn-outline-danger"
                  onClick={saveSuppliers}
                >
                  Assigned
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Query Modal */}
      {showQueryModal && (
        <div className="model-add-edit-modal-overlay">
          <div className="model-add-edit-modal-dialog model-size-md">
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header">
                <h5 className="model-add-edit-modal-title">
                  Query - Order ID- {selectedOrder?.order_code}
                </h5>

                <button
                  type="button"
                  className="model-add-edit-modal-close"
                  onClick={() => {
                    setShowQueryModal(false);
                    setMessage("");
                    setEditMessageId(null);
                  }}
                >
                  ✕
                </button>
              </div>

              <div className="model-add-edit-modal-body p-0">
                <div className="chat-container">
                  {messages.length === 0 ? (
                    <div className="empty-chat-container">
                      <div className="empty-chat-icon-wrapper">
                        <i className="fa-solid fa-comments-nolock fa-lock"></i>
                      </div>

                      <h6 className="empty-chat-title">No Active Query</h6>

                      <p className="empty-chat-description">
                        No query has been received from the{" "}
                        <strong>Secure Circuit team</strong> for this order yet.
                      </p>

                      <span className="empty-chat-status-badge">
                        <i className="fa-solid fa-circle-info me-1"></i>{" "}
                        Messaging will unlock once the team reaches out.
                      </span>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.que_id}
                        className={`chat-message ${msg.que_send === "customer" ? "right" : "left"
                          }`}
                      >
                        <div
                          className={`chat-bubble ${msg.que_send === "customer" ? "sent" : "received"
                            }`}
                        >
                          <div className="chat-menu">
                            <button
                              className="chat-menu-btn"
                              data-bs-toggle="dropdown"
                            >
                              <i className="fa-solid fa-ellipsis-vertical"></i>
                            </button>

                            <ul className="dropdown-menu">
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => editMessage(msg)}
                                >
                                  <i className="fa-solid fa-pen me-2"></i>
                                  Edit
                                </button>
                              </li>

                              {msg.que_status === 0 ? (
                                <li>
                                  <button
                                    className="dropdown-item text-success"
                                    onClick={() =>
                                      changeStatus(msg.que_id, 1)
                                    }
                                  >
                                    <i className="fa-solid fa-eye me-2"></i>
                                    Forward
                                  </button>
                                </li>
                              ) : (
                                <li>
                                  <button
                                    className="dropdown-item text-danger"
                                    onClick={() =>
                                      changeStatus(msg.que_id, 0)
                                    }
                                  >
                                    <i className="fa-solid fa-eye-slash me-2"></i>
                                    Inforward
                                  </button>
                                </li>
                              )}
                            </ul>
                          </div>

                          <div>
                            {msg.que_edit_message || msg.que_message}
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                                marginTop: "4px",
                              }}
                            >
                              {msg.que_edit_message && (
                                <small
                                  style={{
                                    fontSize: "10px",
                                    color: "#0d6efd",
                                    fontWeight: "600",
                                  }}
                                >
                                  Edited
                                </small>
                              )}

                              <small
                                style={{
                                  fontSize: "10px",
                                  color:
                                    msg.que_status === 1
                                      ? "#198754"
                                      : "#dc3545",
                                  fontWeight: "600",
                                }}
                              >
                                {msg.que_status === 1
                                  ? "Forward"
                                  : "Inforward"}
                              </small>
                            </div>
                          </div>

                          <span className="chat-time">
                            {new Date(
                              `1970-01-01T${msg.que_created_time}`
                            ).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}

                  <div ref={messagesEndRef}></div>
                </div>

                <div className="chat-footer">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder={
                      editMessageId
                        ? "Edit message..."
                        : "Type a message..."
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />

                  <button className="chat-send-btn" onClick={sendMessage}>
                    {editMessageId ? (
                      <i className="fa-solid fa-floppy-disk"></i>
                    ) : (
                      <i className="fa-solid fa-paper-plane"></i>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded File Preview Modal */}
      {showDocumentModal && (
        <div className="model-add-edit-modal-overlay">
          <div
            className="model-add-edit-modal-dialog"
            style={{ maxWidth: "900px" }}
          >
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header">
                <h5 className="text-white">Uploaded Document</h5>

                <button
                  className="model-add-edit-modal-close"
                  onClick={() => setShowDocumentModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="model-add-edit-modal-body text-center">
                <iframe
                  src={`${BASE_URL}public/Uploads/${selectedDocument}`}
                  width="100%"
                  height="500px"
                  title="Document Preview"
                  style={{
                    border: "none",
                    borderRadius: "10px",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stage Drawer Component */}
      <StageDrawer
        open={showStageDrawer}
        onClose={() => setShowStageDrawer(false)}
        order={selectedOrder}
      />
    </>
  );
}

export default Orders;