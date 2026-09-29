import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";

function Approved() {
  const [quotations, setQuotations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [assignRemark, setAssignRemark] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    getorderData();
    getSuppliers();
  }, []);


  const getorderData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${BASE_URL}admin/getdatawhere/tbl_orders/order_stage/8`
      );

      console.log("Approved Orders:", response.data);

      if (response.data.status) {
        setQuotations(
          Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data]
        );
      } else {
        setQuotations([]);
      }
    } catch (err) {
      console.error("Order error:", err);

      setError("Failed to fetch data.");
      toast.error("Failed to load data!");
    } finally {
      setLoading(false);
    }
  };


  const getSuppliers = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}admin/getdata/tbl_suppliers`
      );

      console.log("Suppliers:", response.data);

      if (response.data.status) {
        setSuppliers(
          Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data]
        );
      } else {
        setSuppliers([]);
      }
    } catch (err) {
      console.error("Supplier error:", err);

      toast.error("Failed to load suppliers!");
    }
  };

  const getSupplierName = (supplierId) => {
    if (!supplierId) {
      return "N/A";
    }

    const supplier = suppliers.find(
      (item) =>
        String(item.supp_id) === String(supplierId)
    );

    if (!supplier) {
      return "N/A";
    }

    return (
      supplier.supp_contact_person ||
      supplier.supp_company_name ||
      supplier.supp_code ||
      "Unnamed Supplier"
    );
  };

  const handleOpenAssignModal = (order) => {
    console.log("Selected Order:", order);

    setSelectedOrder(order);

    setAssignRemark(order.assigned_remark || "");

    setShowAssignModal(true);
  };

  const handleCloseAssignModal = () => {
    if (assignLoading) return;

    setSelectedOrder(null);
    setAssignRemark("");
    setShowAssignModal(false);
  };


  const handleAssignSupplier = async () => {
    if (!selectedOrder?.order_id) {
      toast.error("Order not selected!");
      return;
    }

    // quote_supplier = Supplier ID
    const supplierId =
      // selectedOrder.assigned_supplier ||
      // selectedOrder.quote_supplier;
      selectedOrder?.assigned_supplier &&
        selectedOrder.assigned_supplier !== "0"
        ? selectedOrder.assigned_supplier
        : selectedOrder?.quote_supplier;

    if (!supplierId) {
      toast.error("Supplier ID not found!");
      console.log("Selected Order:", selectedOrder);
      return;
    }

    setAssignLoading(true);

    try {
      const payload = {
        assigned_supplier: supplierId,
        assigned_remark: assignRemark,
        order_stage: 8,
      };

      console.log("Assign Payload:", payload);

      const response = await axios.post(
        `${BASE_URL}admin/updatedata/tbl_orders/order_id/${selectedOrder.order_id}`,
        payload
      );

      console.log("Assign Response:", response.data);

      if (response.data.status) {
        toast.success("Supplier assigned successfully!");

        handleCloseAssignModal();

        // Refresh latest data
        getorderData();
      } else {
        toast.error(
          response.data.message ||
          "Failed to assign supplier!"
        );
      }
    } catch (err) {
      console.error("Assign Supplier Error:", err);

      console.error(
        "API Error Response:",
        err.response?.data
      );

      toast.error(
        err.response?.data?.message ||
        "Failed to assign supplier!"
      );
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <>
      <div className="container-fluid px-3 px-lg-4 py-4">

        {/* =========================
            PAGE HEADING
        ========================= */}
        <div className="page-heading">

          <div className="page-heading-copy">

            <span className="page-icon">
              <i
                className="bi bi-file-text"
                aria-hidden="true"
              ></i>
            </span>

            <div>
              <p className="eyebrow mb-1">
                All
              </p>

              <h1 className="h3 mb-1">
                Approved
              </h1>
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

                  {/* <th>
                    Action
                  </th> */}

                  <th>
                    Order Code
                  </th>

                  <th>
                    Quotation
                  </th>

                  <th>
                    Remark
                  </th>

                  {/* <th>
                    Request Date & Time
                  </th> */}

                </tr>

              </thead>

              <tbody className="activity-date-time">

                {loading ? (

                  <tr>

                    <td
                      colSpan="5"
                      className="text-center py-4"
                    >
                      Loading...
                    </td>

                  </tr>

                ) : error ? (



                  <tr>

                    <td
                      colSpan="5"
                      className="text-center text-danger py-4"
                    >
                      {error}
                    </td>

                  </tr>

                ) : quotations.length === 0 ? (



                  <tr>

                    <td
                      colSpan="5"
                      className="text-center py-4"
                    >
                      No quotations found for Stage 8.
                    </td>

                  </tr>

                ) : (



                  quotations.map((item, index) => (

                    <tr
                      key={
                        item.order_id || index
                      }
                      className="text-center"
                    >

                      {/* ACTION */}
                      <td>

                        <button
                          type="button"
                          className="btn border-danger text-danger"
                          onClick={() =>
                            handleOpenAssignModal(item)
                          }
                        >
                          Assign Supplier
                        </button>

                      </td>

                      {/* ORDER CODE */}
                      <td className="fw-bold">

                        {item.order_code ||
                          "N/A"}

                      </td>

                      {/* QUOTATION */}
                      <td>

                        <a
                          href={`${BASE_URL}public/Uploads/${item.order_quotation}`}
                          className="text-danger fw-bold text-decoration-none"
                          style={{
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Quotations
                        </a>

                      </td>

                      {/* REMARK */}
                      <td>

                        {item.order_remark ||
                          "N/A"}

                      </td>

                      {/* DATE */}
                      {/* <td>

                        {item.order_request_date}{" "}

                        {item.order_request_time}

                      </td> */}

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </section>




        {showAssignModal && (

          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{
              backgroundColor:
                "rgba(0,0,0,0.5)",
            }}
          >

            <div className="modal-dialog modal-dialog-centered">

              <div className="modal-content">

                {/*            
                <div className="modal-header"   style={{ backgroundColor: "linear-gradient(135deg, #e00404, #661a1a),color: "#fff"" }}>

                  <h5 className="modal-title">
                    Assign Supplier
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={
                      handleCloseAssignModal
                    }
                    disabled={assignLoading}
                  ></button>

                </div> */}
                <div
                  className="modal-header"
                  style={{
                    background: "linear-gradient(135deg, #e00404, #661a1a)",
                    color: "#fff"
                  }}
                >
                  <h5 className="modal-title">Assign Supplier</h5>

                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={handleCloseAssignModal}
                    disabled={assignLoading}
                  ></button>
                </div>
                <div className="modal-body">

                  {/* SUPPLIER NAME */}
                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Supplier Quote
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      // value={getSupplierName(
                      //   selectedOrder?.assigned_supplier ||
                      //   selectedOrder?.quote_supplier
                      // )}
                      value={getSupplierName(
                        selectedOrder?.assigned_supplier &&
                          selectedOrder.assigned_supplier !== "0"
                          ? selectedOrder.assigned_supplier
                          : selectedOrder?.quote_supplier
                      )}
                      readOnly
                    />

                  </div>

                  {/* REMARK */}
                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Assign Remark
                    </label>

                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Enter remark"
                      value={assignRemark}
                      onChange={(e) =>
                        setAssignRemark(
                          e.target.value
                        )
                      }
                    ></textarea>

                  </div>

                </div>

                {/* <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={
                      handleCloseAssignModal
                    }
                    disabled={assignLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={
                      handleAssignSupplier
                    }
                    disabled={assignLoading}
                  >

                    {assignLoading
                      ? "Assigning..."
                      : "Assign Supplier"}

                  </button>

                </div> */}
                <div
                  className="modal-footer"
                  style={{ justifyContent: "space-between" }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseAssignModal}
                    disabled={assignLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleAssignSupplier}
                    disabled={assignLoading}
                  >
                    {assignLoading ? "Assigning..." : "Assign Supplier"}
                  </button>
                </div>

              </div>

            </div>

          </div>

        )}

      </div>
    </>
  );
}

export default Approved;