import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";

function Quotations() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Approval Modal साठी State
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Remark Modal साठी नवीन State
  const [selectedRemark, setSelectedRemark] = useState("");
  const [showRemarkModal, setShowRemarkModal] = useState(false);

  const customer = JSON.parse(localStorage.getItem("customer"));
  const CustId = customer?.cust_id;

  useEffect(() => {
    getorderData();
  }, []);

  const getorderData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${BASE_URL}customer/checkwhere/tbl_orders`,
        {
          params: {
            order_cust_id: CustId,
            order_stage: "6",
          },
        }
      );

      if (response.data.status) {
        setQuotations(response.data.data);
      } else {
        setQuotations([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data.");
      toast.error("Failed to load data!");
    } finally {
      setLoading(false);
    }
  };

  // Approval Modal Functions
  const handleOpenModal = (orderID) => {
    setSelectedOrderId(orderID);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedOrderId(null);
    setShowModal(false);
  };

  // Remark Modal Functions
  const handleOpenRemarkModal = (remark) => {
    if (!remark || remark === "N/A") return;
    setSelectedRemark(remark);
    setShowRemarkModal(true);
  };

  const handleCloseRemarkModal = () => {
    setSelectedRemark("");
    setShowRemarkModal(false);
  };

  // Confirmation नंतर चा प्रत्यक्ष Approve Call
  const confirmApprove = async () => {
    if (!selectedOrderId) return;
    setIsApproving(true);

    try {
      const res = await axios.post(
        `${BASE_URL}admin/updatedata/tbl_orders/order_id/${selectedOrderId}`,
        {
          order_stage: "7",
        }
      );

      if (res.data.status) {
        toast.success("Quotation Approved Successfully!");
        getorderData();
        handleCloseModal();
      } else {
        toast.error("Failed to approve quotation!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <>
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-file-text text-success" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1 text-success">All</p>
              <h1 className="h3 mb-1">Quotations</h1>
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
                  <th>Order Code</th>
                  <th>Quotation</th>
                  <th>Remark</th>
                  <th>Request Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="text-center text-danger py-4">
                      {error}
                    </td>
                  </tr>
                ) : quotations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-3 text-danger">
                      No quotations found.
                    </td>
                  </tr>
                ) : (
                  quotations.map((item, index) => (
                    <tr key={item.order_id || index} className="text-center">
                      <td>
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleOpenModal(item.order_id)}
                        >
                          Approve
                        </button>
                      </td>
                      <td className="fw-semibold">{item.order_code || "N/A"}</td>
                      <td>
                        <a
                          href={`${BASE_URL}public/Uploads/${item.order_quotation}`}
                          className="text-success fw-semibold text-decoration-none"
                          style={{ cursor: "pointer", fontSize: "15px" }}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Quotation
                        </a>
                      </td>
                      <td>
                        {item.order_remark && item.order_remark !== "N/A" ? (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleOpenRemarkModal(item.order_remark)}
                          >
                            View full remark
                          </button>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                      <td>
                        {item.order_request_date} {item.order_request_time}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="model-add-edit-modal-overlay">
          <div
            className="model-add-edit-modal-dialog"
            style={{ maxWidth: "400px" }}
          >
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header-success">
                <h5 className="model-add-edit-modal-title">Confirm Approval</h5>
                <button
                  type="button"
                  className="model-add-edit-modal-close"
                  onClick={handleCloseModal}
                  disabled={isApproving}
                >
                  ✕
                </button>
              </div>
              <div className="model-add-edit-modal-body p-3">
                <p className="mb-0">
                  Are you sure you want to <strong>approve</strong> this
                  quotation?
                </p>
              </div>
              <div className="model-add-edit-modal-footer d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCloseModal}
                  disabled={isApproving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={confirmApprove}
                  disabled={isApproving}
                >
                  {isApproving ? "Approving..." : "Yes, Approve"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remark Display Modal */}
      {showRemarkModal && (
        <div className="model-add-edit-modal-overlay">
          <div
            className="model-add-edit-modal-dialog"
            style={{ maxWidth: "450px" }}
          >
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header-success">
                <h5 className="model-add-edit-modal-title">Order Remark</h5>
                <button
                  type="button"
                  className="model-add-edit-modal-close"
                  onClick={handleCloseRemarkModal}
                >
                  ✕
                </button>
              </div>
              <div className="model-add-edit-modal-body p-3">
                <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                  {selectedRemark}
                </p>
              </div>
              <div className="model-add-edit-modal-footer text-end">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseRemarkModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Quotations;