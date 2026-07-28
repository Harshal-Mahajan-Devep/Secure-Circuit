import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";
import Delete from "../Config/Delete";
import * as Yup from "yup";
import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import TableLoader from "../Config/TableLoader";
import StageDrawer from "./StageDrawer";

function Orders() {
  const [orderData, setorderData] = useState([]);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [showStageDrawer, setShowStageDrawer] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const supplier = JSON.parse(localStorage.getItem("supplier"));
  const SuppId = supplier?.supp_id;

  useEffect(() => {
    getorderData();
  }, []);

  useEffect(() => {
    if (showQueryModal) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    }
  }, [messages, showQueryModal]);

  const getMessages = async (orderId) => {

    const res = await axios.get(
      `${BASE_URL}supplier/getdatawhere/tbl_query/que_order_id/${orderId}`
    );

    if (res.data.status) {
      setMessages(res.data.data);
    }
  }

  const sendMessage = async () => {

    if (message.trim() === "") return;

    await axios.post(
      `${BASE_URL}supplier/insert/tbl_query`,
      {
        que_order_id: selectedOrder.order_id,
        que_cust_id: selectedOrder.order_cust_id,
        que_supp_id: SuppId,
        que_send: "supplier",
        que_message: message,
        que_cust_read: 0,
        que_supp_read: 1
      }
    );

    setMessage("");

    getMessages(selectedOrder.order_id);
  }

  const markSupplierRead = async (orderId) => {

    try {
      await axios.post(
        `${BASE_URL}supplier/markSupplierRead`,
        {
          order_id: orderId
        }
      );

      getorderData();

    } catch (err) {
      console.log(err);
    }

  };

  // Order All Data Get Function
  const getorderData = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${BASE_URL}supplier/getSupplierOrders/${SuppId}`
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

  return (
    <>
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-people text-primary" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1 text-primary">All</p>
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
                  <th>action</th>
                  <th>Order Detail</th>
                  <th>Stag</th>
                  <th>Activity</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableLoader rows={6} columns={5} />
                ) : orderData.length > 0 ? (
                  orderData.map((order) => (
                    <tr key={order.order_id}>
                      <td className="text-center">
                        <div className="position-relative d-inline-block">

                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowQueryModal(true);
                              getMessages(order.order_id);
                              markSupplierRead(order.order_id);
                            }}
                              disabled={Number(order.order_stage) <= 7}
                          >
                            <i className="fa-regular fa-circle-question"></i>
                            {" "}
                            Query
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
                      </td>
                      <td className="text-start">
                        <span className="fw-semibold">Customer:</span>{" "}
                        <b style={{ fontSize: "14px" }}> {order.cust_code}</b>
                        <br />
                        <span className="fw-semibold">Order No:</span>{" "}
                        <b
                          style={{
                            fontSize: "14px",
                            cursor: "pointer",
                            color: "#1192b9",
                            textDecoration: "underline"
                          }}
                          onClick={() => handleOrderClick(order)}
                          title="Click to view Order Details"
                        >
                          {order.order_code}
                        </b>
                      </td>

                      <td className="text-center">
                        <button
                          className="btn btn-outline-primary btn-sm"
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


      {showModal && (
        <div className="model-add-edit-modal-overlay">
          <div className="model-add-edit-modal-dialog model-size-sm">
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header-primary">
                <h5 className="model-add-edit-modal-title">
                  Add Order
                </h5>

                <button
                  type="button"
                  className="model-add-edit-modal-close"
                  onClick={resetForm}
                >
                  ✕
                </button>
              </div>

              <div className="model-add-edit-modal-body">
                <div className="row g-3">

                  <div className="col-md-12">
                    <label className="order-form-label">
                      Upload PDF/ ZIP <span className="text-danger">*</span>
                    </label>

                    <input
                      type="file"
                      name="order_uploaded_requirement"
                      className={`order-file-input ${formik.touched.order_uploaded_requirement &&
                        formik.errors.order_uploaded_requirement
                        ? "is-invalid"
                        : ""
                        }`}
                      accept=".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed"
                      onChange={(e) => {
                        formik.setFieldTouched("order_uploaded_requirement", true);
                        uploadImage(e);
                      }}
                    />

                    <div className="invalid-feedback d-block">
                      {formik.touched.order_uploaded_requirement &&
                        formik.errors.order_uploaded_requirement}
                    </div>

                    {uploading && (
                      <div className="upload-progress-box mt-2">
                        <div className="upload-progress-bar">
                          <div
                            className="upload-progress-fill"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>

                        <div className="mt-1 text-center fw-semibold">
                          Uploading... {uploadProgress}%
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-md-12">
                    <label className="order-form-label mt-3">
                      Requirement <span className="text-danger">*</span>
                    </label>

                    <textarea
                      rows={4}
                      name="order_requirement_text"
                      placeholder="Enter requirement..."
                      className={`order-textarea ${formik.touched.order_requirement_text &&
                        formik.errors.order_requirement_text
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.order_requirement_text}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />

                    <div className="invalid-feedback">
                      {formik.touched.order_requirement_text &&
                        formik.errors.order_requirement_text}
                    </div>
                  </div>

                  <div className="model-add-edit-modal-footer d-flex justify-content-between">
                    <button
                      className="model-add-edit-btn model-add-edit-btn-cancel"
                      onClick={resetForm}
                    >
                      Close
                    </button>

                    <button
                      type="button"
                      className="model-add-edit-btn model-add-edit-btn-save-primary"
                      onClick={formik.handleSubmit}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQueryModal && (
        <div className="model-add-edit-modal-overlay">
          <div className="model-add-edit-modal-dialog model-size-md">
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header-primary">
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
                  {messages
                    .filter(
                      (msg) =>
                        msg.que_send === "supplier" ||
                        (msg.que_send === "customer" && msg.que_status == 1)
                    )
                    .map((msg) => (
                      <div
                        key={msg.que_id}
                        className={`chat-message ${msg.que_send === "supplier" ? "right" : "left"
                          }`}
                      >
                        <div
                          className={`chat-bubble ${msg.que_send === "supplier" ? "sent" : "received"
                            }`}
                        >
                          {msg.que_send === "customer"
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
                    ))}

                  <div ref={messagesEndRef}></div>
                </div>

                {/* Bottom Input */}
                <div className="chat-footer">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />

                  <button
                    className="chat-send-btn"
                    onClick={sendMessage}
                  >
                    <i className="fa-solid fa-paper-plane"></i>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {showDescriptionModal && (
        <div className="model-add-edit-modal-overlay">
          <div
            className="model-add-edit-modal-dialog"
            style={{ maxWidth: "400px" }}
          >
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header-primary">
                <h5 className="model-add-edit-modal-title">
                  <i className="bi bi-card-text me-2"></i>
                  Order Description
                </h5>

                <button
                  type="button"
                  className="model-add-edit-modal-close"
                  onClick={() => setShowDescriptionModal(false)}
                >
                  {" "}
                  ✕
                </button>
              </div>

              <div className="model-add-edit-modal-body">
                <p
                  style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.8",
                    marginBottom: 0,
                  }}
                >
                  {selectedDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}


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
