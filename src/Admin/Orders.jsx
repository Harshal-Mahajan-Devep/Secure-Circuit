import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";
import Delete from "../Config/Delete";
import * as Yup from "yup";
import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import TableLoader from "../Config/TableLoader";
import * as bootstrap from "bootstrap";


function Orders() {
  const [orderData, setorderData] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [customerData, setCustomerData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editMessageId, setEditMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const [quoteData, setQuoteData] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);

  useEffect(() => {
    const popoverTriggerList = document.querySelectorAll(
      '[data-bs-toggle="popover"]'
    );

    popoverTriggerList.forEach((el) => {
      bootstrap.Popover.getOrCreateInstance(el);
    });
  }, [orderData]);


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
      `${BASE_URL}admin/getdatawhere/tbl_query/que_order_id/${orderId}`
    );

    if (res.data.status) {
      setMessages(res.data.data);
    }

  }

  const sendMessage = async () => {

    if (message.trim() == "") return;

    try {

      if (editMessageId) {

        await axios.post(
          `${BASE_URL}admin/updatedata/tbl_query/que_id/${editMessageId}`,
          {
            que_edit_message: message
          }
        );

        toast.success("Message Updated");

        setEditMessageId(null);

      } else {

        await axios.post(
          `${BASE_URL}admin/insert/tbl_query`,
          {
            que_order_id: selectedOrder.order_id,
            que_cust_id: selectedOrder.order_cust_id,
            que_send: "admin",
            que_message: message,
            que_admin_read: 1,
            que_cust_read: 0,
            que_supp_read: 0
          }
        );

        toast.success("Message Sent");

      }

      setMessage("");

      getMessages(selectedOrder.order_id);

    } catch (err) {

      toast.error("Failed");

    }

  }


  const changeStatus = async (id, status) => {

    const res = await axios.post(
      `${BASE_URL}admin/updatedata/tbl_query/que_id/${id}`,
      {
        que_status: status
      }
    );

    if (res.data.status) {
      toast.success("Status Updated");
      getMessages(selectedOrder.order_id);
    }
  }

  const editMessage = (msg) => {
    setEditMessageId(msg.que_id);
    setMessage(msg.que_message);
  }


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

  // orderomer All Data Get Function
  const getorderData = async () => {

    setLoading(true);

    try {
      const response = await axios.get(
        `${BASE_URL}admin/getAdminOrders`
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

  const markAdminRead = async (orderId) => {

    await axios.post(
      `${BASE_URL}admin/markAdminRead`,
      {
        order_id: orderId
      }
    );

    getorderData();
  };

  // Delete Function
  const confirmDelete = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}admin/deletedata/tbl_orders/order_id/${deleteId}`,
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

  const handleSupplierSelect = (id) => {
    if (selectedSuppliers.includes(id)) {
      setSelectedSuppliers(
        selectedSuppliers.filter((item) => item !== id)
      );
    } else {
      setSelectedSuppliers([...selectedSuppliers, id]);
    }
  };

  const saveSuppliers = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}admin/updatedata/tbl_orders/order_id/${selectedOrderId}`,
        {
          order_transfer_supplier: selectedSuppliers.join(",")
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

  // Customer Insert/Save function
  const saveOrder = async (values) => {
    try {
      let response;

      const payload = {
        order_cust_id: values.cust_id,
        order_save_id: values.save_quote_id,
        order_uploaded_requirement: values.order_uploaded_requirement,
        order_requirement_text: values.order_requirement_text,
      };

      if (editId) {
        response = await axios.post(
          `${BASE_URL}admin/updatedata/tbl_orders/order_id/${editId}`,
          payload,
        );
      } else {
        response = await axios.post(
          `${BASE_URL}admin/insert/tbl_orders`,
          payload,
        );
      }

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

  const formik = useFormik({
    initialValues: {
      cust_id: "",
      save_quote_id: "",
      order_uploaded_requirement: "",
      order_requirement_text: "",
    },

    validationSchema: Yup.object({
      cust_id: Yup.string().required("Customer is required"),
      order_uploaded_requirement: Yup.string().required("File is required"),
      order_requirement_text: Yup.string().required("Requirement is required"),
    }),

    onSubmit: saveOrder,
  });

  // Customer Edit Function
  const editOrder = async (orderId) => {
    try {

      const response = await axios.get(
        `${BASE_URL}admin/getdatawhere/tbl_orders/order_id/${orderId}`
      );

      if (response.data.status) {

        const order = response.data.data[0];

        // Customer che quotes load kara
        const quotes = await axios.get(
          `${BASE_URL}admin/getdatawhere/tbl_save_quote/save_cust_id/${order.order_cust_id}`
        );

        if (quotes.data.status) {

          setQuoteData(quotes.data.data);

          const selected = quotes.data.data.find(
            q => q.save_id == order.order_save_id
          );

          if (selected) {
            setSelectedQuote(selected);
          }
        }

        formik.setValues({
          cust_id: order.order_cust_id,
          save_quote_id: order.order_save_id || "",
          order_uploaded_requirement: order.order_uploaded_requirement || "",
          order_requirement_text: order.order_requirement_text || "",
        });

        setEditId(orderId);
        setShowModal(true);
      }

    } catch (error) {
      console.log(error);
      toast.error("Failed to load order");
    }
  };

  const getCustomerQuotes = async (custId) => {
    try {

      const res = await axios.get(
        `${BASE_URL}admin/getdatawhere/tbl_save_quote/save_cust_id/${custId}`
      );

      if (res.data.status) {

        setQuoteData(res.data.data);

        const selected = res.data.data.find(
          q => q.save_id == order.order_save_id
        );

        if (selected) {
          setSelectedQuote(selected);
        }

      } else {
        setQuoteData([]);
      }

    } catch (err) {
      console.log(err);
    }
  }


  const uploadImage = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("order_uploaded_requirement", file);

    setUploading(true);
    setUploadProgress(0);

    try {
      const upload = await axios.post(
        `${BASE_URL}customer/fileupload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },

          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );

            setUploadProgress(percent);
          },
        }
      );

      if (upload.data.status) {
        formik.setFieldValue(
          "order_uploaded_requirement",
          upload.data.files.order_uploaded_requirement
        );

        toast.success("File Upload Successfully");
      }

      setUploadProgress(100);

    } catch (err) {
      console.log(err);
      toast.error("File Upload Failed");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 800);
    }
  };


  // Order Add/Edit Form Reset Function
  const resetForm = () => {
    setEditId(null);

    formik.resetForm({
      values: {
        cust_id: "",
        order_uploaded_requirement: "",
        order_requirement_text: "",
      },
    });

    setShowModal(false);
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
          <div className="panel-header d-flex flex-wrap align-items-center justify-content-end gap-2">
            <button
              className="btn btn-outline-danger"
              type="button"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <i className="bi bi-plus"></i> Add{" "}
            </button>
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
                  <th>orderomer Detail</th>
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
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              setSelectedOrderId(order.order_id);

                              setSelectedSuppliers(
                                order.order_transfer_supplier
                                  ? order.order_transfer_supplier.split(",").map(Number)
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
                                  zIndex: 9999
                                }}
                              />
                            )}

                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="dropdown">
                          <span className="fw-semibold">Order No:</span>{" "}
                          <button
                            className="btn text-decoration-none fw-semibold p-0 dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <b style={{ fontSize: "16px" }}> {order.order_code}</b>
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => editOrder(order.order_id)}
                              >
                                <i className="bi bi-pencil-square me-2"></i>
                                Edit
                              </button>
                            </li>

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
                        <br />
                        <span className="fw-semibold">Email:</span>{" "}
                        {order.cust_email}
                        <br />
                        <span className="fw-semibold">Phone:</span>{" "}
                        {order.cust_mobile}
                        <br />
                        <span className="fw-semibold">Company:</span>{" "}
                        {order.cust_company_name ? (
                          order.cust_company_name
                        ) : (
                          <span
                            className="text-danger fw-semibold"
                            style={{ fontSize: "14px" }}
                          >
                            N/A
                          </span>
                        )}
                      </td>

                      <td className="text-start">
                        <div className="d-flex flex-column gap-2">
                          <div className="d-flex align-items-left justify-content-left gap-2">
                            <span className="fw-semibold">Document:</span>

                            {order.order_uploaded_requirement ? (
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() =>
                                  window.open(
                                    `${BASE_URL}public/Uploads/${order.order_uploaded_requirement}`,
                                  )
                                }
                              >
                                <i className="bi bi-file-earmark-pdf me-1"></i>
                                Open PDF
                              </button>
                            ) : (
                              <span className="text-danger">N/A</span>
                            )}
                          </div>

                          <div className="d-flex align-items-left justify-content-left gap-2">
                            <span className="fw-semibold">Message:</span>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                setSelectedDescription(
                                  order.order_requirement_text ||
                                  "No Description Available",
                                );
                                setShowDescriptionModal(true);
                              }}
                            >
                              <i className="bi bi-chat-left-text me-1"></i>
                              View Message
                            </button>
                          </div>
                        </div>
                      </td>

                      <td></td>
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
                    <td colSpan="6" className="text-center text-danger">
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

      {showModal && (
        <div className="model-add-edit-modal-overlay">
          <div className="model-add-edit-modal-dialog model-size-sm">
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header">
                <h5 className="model-add-edit-modal-title">
                  {editId ? "Edit Order" : "Add Order"}
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
                      Customer <span className="text-danger">*</span>
                    </label>

                    <Select
                      placeholder="Search Customer..."
                      options={customerData.map((cust) => ({
                        value: cust.cust_id,
                        label: `${cust.cust_contact_person} (${cust.cust_company_name})`,
                        search: `${cust.cust_contact_person} ${cust.cust_company_name}`
                      }))}

                      filterOption={(option, input) =>
                        option.data.search
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      value={
                        customerData
                          .map((cust) => ({
                            value: cust.cust_id,
                            label: `${cust.cust_contact_person} (${cust.cust_company_name})`
                          }))
                          .find(
                            (option) =>
                              option.value == formik.values.cust_id
                          ) || null
                      }
                      onChange={(selected) => {

                        const id = selected ? selected.value : "";

                        formik.setFieldValue("cust_id", id);

                        formik.setFieldValue("save_quote_id", "");

                        setSelectedQuote(null);

                        if (id) {
                          getCustomerQuotes(id);
                        } else {
                          setQuoteData([]);
                        }

                      }}
                      isSearchable
                    />
                  </div>

                  <div className="col-md-12">

                    <label className="order-form-label">
                      Saved Quote
                    </label>

                    <Select

                      placeholder="Select Quote..."

                      options={quoteData.map(q => ({

                        value: q.save_id,
                        label: q.save_quote_name

                      }))}

                      value={
                        quoteData
                          .map(q => ({
                            value: q.save_id,
                            label: q.save_quote_name
                          }))
                          .find(
                            x => x.value == formik.values.save_quote_id
                          ) || null
                      }

                      onChange={(selected) => {

                        const quote = quoteData.find(
                          x => x.save_id == selected.value
                        );

                        formik.setFieldValue(
                          "save_quote_id",
                          quote.save_id
                        );

                        formik.setFieldValue(
                          "order_uploaded_requirement",
                          quote.save_quote_pdf
                        );

                        setSelectedQuote(quote);

                      }}

                      isSearchable

                    />

                  </div>

                  {selectedQuote && (
                    <div className="mt-3">

                      <label className="order-form-label">
                        Selected Quote PDF
                      </label>

                      <button
                        type="button"
                        className="btn btn-outline-success w-100"
                        onClick={() =>
                          window.open(
                            `${BASE_URL}public/Uploads/${selectedQuote.save_quote_pdf}`,
                          )
                        }
                      >
                        <i className="bi bi-file-earmark-pdf me-2"></i>

                        PDF - {selectedQuote.save_quote_name}
                      </button>

                    </div>
                  )}

                  {editId && formik.values.order_uploaded_requirement && (
                    <div className="col-md-12">
                      <label className="order-form-label">Current Document</label>

                      <button
                        type="button"
                        className="btn btn-outline-danger w-100"
                        onClick={() => {
                          setSelectedDocument(formik.values.order_uploaded_requirement);
                          setShowDocumentModal(true);
                        }}
                      >
                        <i className="bi bi-file-earmark-pdf me-2"></i>
                        View Uploaded Document
                      </button>
                    </div>
                  )}

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
                      {formik.errors.order_requirement_text}
                    </div>
                  </div>
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
                  className="model-add-edit-btn model-add-edit-btn-save"
                  onClick={formik.handleSubmit}
                >
                  Save
                </button>
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
              <div className="model-add-edit-modal-header">
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

      {/* All Supplier with Slete */}
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

              <div className="d-flex flex-wrap gap-2">
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

                    {selectedSuppliers.includes(Number(supplier.supp_id)) && (
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

                {/* Chat Area */}

                <div className="chat-container">

                  {messages.length === 0 ? (

                    <div className="text-center text-muted py-5">
                      <i className="fa-regular fa-comments fs-1"></i>

                      <h5 className="mt-3">No Query Found</h5>

                      <small>No messages available.</small>
                    </div>

                  ) : (

                    messages.map((msg) => (

                      <div
                        key={msg.que_id}
                        className={`chat-message ${msg.que_send === "customer"
                          ? "right"
                          : "left"
                          }`}
                      >

                        <div
                          className={`chat-bubble ${msg.que_send === "customer"
                            ? "sent"
                            : "received"
                            }`}
                        >

                          {/* 3 Dot */}

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

                              {msg.que_status == 0 ? (

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

                          {/* Message */}

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
                                  color: msg.que_status == 1 ? "#198754" : "#dc3545",
                                  fontWeight: "600",
                                }}
                              >
                                {msg.que_status == 1 ? "Forward" : "Inforward"}
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

                {/* Footer */}

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

                  <button
                    className="chat-send-btn"
                    onClick={sendMessage}
                  >
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

      {/* Uploaded File preview */}
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
    </>
  );
}

export default Orders;
