import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";
import Delete from "../Config/Delete";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useNavigate, Link } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import TableLoader from "../Config/TableLoader";
import Select from "react-select";
import StageDrawer from "./StageDrawer";

function Orders() {
  const [orderData, setorderData] = useState([]);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Query Modal States
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [saveList, setSaveList] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showPdf, setShowPdf] = useState(false);
  const [showStageDrawer, setShowStageDrawer] = useState(false);

  // Cart Details Modal States
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  const customer = JSON.parse(localStorage.getItem("customer"));
  const CustId = customer?.cust_id;

  const custSchema = Yup.object({
    order_uploaded_requirement: Yup.string()
      .required("Please upload PDF or ZIP file"),

    order_requirement_text: Yup.string()
      .trim()
      .required("Requirement is required")
      .min(10, "Requirement must be at least 10 characters")
      .max(1000, "Requirement cannot exceed 1000 characters"),
  });

  useEffect(() => {
    getorderData();
  }, []);

  const getSavequote = async () => {
    try {
      const res = await axios.get(`${BASE_URL}customer/getdatawhere/tbl_save_quote/save_cust_id/${CustId}`);

      if (res.data.status) {
        const activeQuotes = res.data.data.filter(
          item => Number(item.save_status) === 1
        );
        setSaveList(activeQuotes);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Auto-scroll for messages in Query Modal
  useEffect(() => {
    if (showQueryModal) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    }
  }, [messages, showQueryModal]);

  // Check if supplier has sent at least one active message
  const isSupplierResponded = messages.some(
    (msg) => msg.que_send === "supplier" && msg.que_status == 1
  );

  // Messages API Call With Loading
  const getMessages = async (orderId) => {
    setMessagesLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}customer/getdatawhere/tbl_query/que_order_id/${orderId}`
      );

      if (res.data.status) {
        setMessages(res.data.data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async () => {
    if (message.trim() === "" || !isSupplierResponded) return;

    try {
      await axios.post(
        `${BASE_URL}customer/insert/tbl_query`,
        {
          que_order_id: selectedOrder.order_id,
          que_cust_id: CustId,
          que_supp_id: selectedOrder.order_transfer_supplier,
          que_send: "customer",
          que_message: message,
          que_cust_read: 1,
          que_supp_read: 0,
        }
      );

      setMessage("");
      getMessages(selectedOrder.order_id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    }
  };

  const markCustomerRead = async (orderId) => {
    try {
      await axios.post(
        `${BASE_URL}customer/markCustomerRead`,
        {
          order_id: orderId
        }
      );
      getorderData();
    } catch (err) {
      console.log(err);
    }
  };

  const formik = useFormik({
    initialValues: {
      order_uploaded_requirement: "",
      order_requirement_text: "",
    },

    validationSchema: custSchema,

    onSubmit: async (values) => {
      if (uploading) {
        toast.error("Please wait until file upload completes.");
        return;
      }
      saveOrder(values);
    },
  });

  // Order All Data Get Function
  const getorderData = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${BASE_URL}customer/getCustomerOrders/${CustId}`
      );

      if (response.data.status) {
        setorderData(response.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Order Click -> Fetch Cart Items and Show Modal
  const handleOrderClick = async (order) => {
    setSelectedOrder(order);
    setShowCartModal(true);
    setCartLoading(true);

    try {
      const cartIds = order.order_cart_id;

      if (cartIds) {
        const res = await axios.post(`${BASE_URL}customer/getCartDetails`, {
          cart_ids: cartIds
        });

        if (res.data.status) {
          setCartItems(res.data.data);
        } else {
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error("Cart details fetching error:", err);
      toast.error("Failed to load cart details");
    } finally {
      setCartLoading(false);
    }
  };

  // Order Insert/Save function
  const saveOrder = async (values) => {
    try {
      const payload = {
        order_cust_id: CustId,
        order_uploaded_requirement: values.order_uploaded_requirement,
        order_requirement_text: values.order_requirement_text,
      };

      const response = await axios.post(
        `${BASE_URL}customer/insert/tbl_orders`,
        payload
      );

      if (response.data.status) {
        toast.success(response.data.message);
        resetForm();
        getorderData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  // Order Add/Edit Form Reset Function
  const resetForm = () => {
    formik.resetForm();
    setSelectedQuote(null);
    setUploadProgress(0);
    setUploading(false);
    setShowModal(false);
  };

  return (
    <>
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-people text-success" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1 text-success">All</p>
              <h1 className="h3 mb-1">Orders</h1>
            </div>
          </div>
        </div>

        <section className="panel">
          <div className="panel-header d-flex flex-wrap align-items-center justify-content-end gap-2">
            <Link to="/cart" className="btn btn-outline-success">
              <i className="bi bi-plus"></i> Add{" "}
            </Link>
          </div>
          <div className="table-responsive">
            <table
              className="table align-middle mb-0"
              id="ordersTable"
              data-searchable-table
            >
              <thead>
                <tr className="text-center">
                  <th>Action</th>
                  <th>Order Detail</th>
                  <th>Stage</th>
                  <th>Activity</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableLoader rows={6} columns={5} />
                ) : orderData.length > 0 ? (
                  orderData.map((order) => (
                    <tr key={order.order_id}>
                      <td className="text-center fw-semibold">
                        <div className="position-relative d-inline-block">
                          <div
                            className="position-relative d-inline-block"
                            style={{ overflow: "visible" }}
                          >
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowQueryModal(true);
                                markCustomerRead(order.order_id);
                                getMessages(order.order_id);
                              }}
                            >
                              <i className="fa-regular fa-circle-question"></i> Query
                            </button>

                            {parseInt(order.unread_count) > 0 && (
                              <span
                                className="position-absolute rounded-circle bg-primary"
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
                      <td className="text-center">
                        <b
                          style={{
                            fontSize: "14px",
                            cursor: "pointer",
                            color: "#198754",
                            textDecoration: "underline"
                          }}
                          onClick={() => handleOrderClick(order)}
                          title="Click to view Order Details"
                        >
                          {order.order_code}
                        </b>
                        <br />
                      </td>

                      <td className="text-center">
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowStageDrawer(true);
                          }}
                        >
                          <i className="fas fa-route me-2"></i>
                          Tracking
                        </button>
                      </td>

                      <td className="text-start">
                        <span className="fw-semibold">Created Date:</span>{" "}
                        {order.order_request_date} <br />{" "}
                        <span className="fw-semibold">Created Time:</span>{" "}
                        {new Date(`1970-01-01T${order.order_request_time}`).toLocaleTimeString(
                          "en-IN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-danger fw-semibold">
                      No Order Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Cart Modal */}
      {showCartModal && (
        <div
          className="sc-cartmodal-overlay"
          onClick={() => setShowCartModal(false)}
        >
          <div
            className="sc-cartmodal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sc-cartmodal-content">
              {cartLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success" role="status"></div>
                  <p className="mt-2 text-muted">Loading Details...</p>
                </div>
              ) : cartItems.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-bordered table-striped align-middle sc-cart-table m-0">
                    <thead>
                      <tr>
                        <th>Basic Information</th>
                        <th>PCB Specifications</th>
                        <th>High Specs & Options</th>
                        <th>Gerber Preview</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item, index) => (
                        <React.Fragment key={item.cart_id || index}>
                          <tr>
                            <td colSpan={4} className="text-center py-2">
                              <h4>Order Number: {selectedOrder?.order_code}</h4>
                            </td>
                          </tr>
                          <tr>
                            {/* Basic Info */}
                            <td>
                              <div className="sc-tbl-row"><strong>Base Material:</strong> {item.cart_base_material || "N/A"}</div>
                              <div className="sc-tbl-row"><strong>Layers:</strong> {item.cart_pcb_layer || "N/A"} Layer(s)</div>
                              <div className="sc-tbl-row">
                                <strong>Dimensions:</strong>{" "}
                                {item.cart_pcb_width && item.cart_pcb_height
                                  ? `${item.cart_pcb_width} × ${item.cart_pcb_height} mm`
                                  : "N/A"}
                              </div>
                              <div className="sc-tbl-row">
                                <strong>Qty:</strong> <span className="badge bg-success">{item.cart_selected_qty || 0} Pcs</span>
                              </div>
                              <div className="sc-tbl-row"><strong>Product Type:</strong> {item.cart_product_type || "N/A"}</div>
                            </td>

                            {/* Specifications */}
                            <td>
                              <div className="sc-tbl-row"><strong>Diff Design:</strong> {item.cart_different_design || "1"}</div>
                              <div className="sc-tbl-row"><strong>Format:</strong> {item.cart_delivery_format || "N/A"}</div>
                              <div className="sc-tbl-row"><strong>Thickness:</strong> {item.cart_pcb_thickness || "N/A"} mm</div>
                              <div className="sc-tbl-row"><strong>Color:</strong> {item.cart_pcb_color || "N/A"}</div>
                              <div className="sc-tbl-row"><strong>Silkscreen:</strong> {item.cart_silkscreen || "N/A"}</div>
                              <div className="sc-tbl-row"><strong>Material:</strong> {item.cart_material_type || "N/A"}</div>
                              <div className="sc-tbl-row"><strong>Surface Finish:</strong> {item.cart_surface_finish || "N/A"}</div>
                            </td>

                            {/* High Specs */}
                            <td>
                              <div className="sc-tbl-row"><strong>Outer Copper:</strong> {item.cart_outer_copper_weight || "N/A"}</div>
                              <div className="sc-tbl-row"><strong>Via Covering:</strong> {item.cart_via_covering || "N/A"}</div>
                              <div className="sc-tbl-row"><strong>Via Plating:</strong> {item.cart_via_plating || "Not Specified"}</div>
                              <div className="sc-tbl-row"><strong>Min Via Hole:</strong> {item.cart_min_via_hole || "N/A"}</div>
                              <div className="sc-tbl-row"><strong>Outline Tol:</strong> {item.cart_outline_tolerance || "N/A"}</div>
                              <div className="sc-tbl-row"><strong>Confirm File:</strong> {item.cart_confirm_production_file || "No"}</div>
                              <div className="sc-tbl-row"><strong>Mark on PCB:</strong> {item.cart_mark_on_pcb || "N/A"}</div>
                              <div className="sc-tbl-row"><strong>Electrical Test:</strong> {item.cart_electrical_test || "N/A"}</div>
                            </td>

                            {/* Gerber Preview */}
                            <td className="text-center">
                              <div className="d-flex gap-1 justify-content-center flex-wrap">
                                {item.cart_gerber_top_img && (
                                  <img
                                    src={item.cart_gerber_top_img}
                                    alt="Top Gerber"
                                    className="sc-tbl-gerber-img me-3"
                                    title="Top Gerber"
                                  />
                                )}
                                {item.cart_gerber_bottom_img && (
                                  <img
                                    src={item.cart_gerber_bottom_img}
                                    alt="Bottom Gerber"
                                    className="sc-tbl-gerber-img"
                                    title="Bottom Gerber"
                                  />
                                )}
                                {!item.cart_gerber_top_img && !item.cart_gerber_bottom_img && (
                                  <span className="text-muted small">No Image</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-danger my-4 fw-semibold p-4">
                  No cart items found for this order.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Query Chat Modal */}
      {showQueryModal && (
        <div className="model-add-edit-modal-overlay">
          <div className="model-add-edit-modal-dialog model-size-md">
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header-success">
                <h5 className="model-add-edit-modal-title">
                  Query - Order ID- {selectedOrder?.order_code}
                </h5>

                <button
                  type="button"
                  className="model-add-edit-modal-close"
                  onClick={() => setShowQueryModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="model-add-edit-modal-body p-0">

                {/* Chat Area */}
                <div className="chat-container">
                  {messagesLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-success" role="status"></div>
                      <p className="mt-2 text-muted">Loading messages...</p>
                    </div>
                  ) : (() => {
                    const filteredMessages = messages.filter(
                      (msg) =>
                        msg.que_send === "customer" ||
                        (msg.que_send === "supplier" && msg.que_status == 1)
                    );

                    if (filteredMessages.length === 0) {
                      return (
                        <div className="empty-chat-container">
                          <div className="empty-chat-icon-wrapper">
                            <i className="fa-solid fa-comments-nolock fa-lock"></i>
                          </div>

                          <h6 className="empty-chat-title">No Active Query</h6>

                          <p className="empty-chat-description">
                            No query has been received from the <strong>Secure Circuit team</strong> for this order yet.
                          </p>

                          <span className="empty-chat-status-badge">
                            <i className="fa-solid fa-circle-info me-1"></i> Messaging will unlock once the team reaches out.
                          </span>
                        </div>
                      );
                    }

                    return filteredMessages.map((msg) => (
                      <div
                        key={msg.que_id}
                        className={`chat-message ${msg.que_send === "customer" ? "right" : "left"}`}
                      >
                        <div
                          className={`chat-bubble ${msg.que_send === "customer" ? "sent" : "received"}`}
                        >
                          {msg.que_send === "supplier"
                            ? (msg.que_edit_message || msg.que_message)
                            : msg.que_message}
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
                    ));
                  })()}

                  <div ref={messagesEndRef}></div>
                </div>

                {/* Bottom Input - Disabled if supplier hasn't responded */}
                {/* Bottom Input - Disabled if supplier hasn't responded */}
                <div className="chat-footer">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder={
                      isSupplierResponded
                        ? "Type a message..."
                        : "Waiting for Secure Circuit team to send a query..."
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={!isSupplierResponded || messagesLoading}
                  />

                  <button
                    className="chat-send-btn"
                    onClick={sendMessage}
                    disabled={!isSupplierResponded || messagesLoading}
                    title={!isSupplierResponded ? "Messaging is locked until team responds" : "Send message"}
                  >
                    <i className={`fa-solid ${isSupplierResponded ? "fa-paper-plane" : "fa-lock"}`}></i>
                  </button>
                </div>

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