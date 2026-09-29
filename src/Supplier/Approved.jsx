import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";

function Approved() {
  const [quotations, setQuotations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const supplier = JSON.parse(localStorage.getItem("supplier"));
  const SuppId = supplier?.supp_id;

  useEffect(() => {
    getorderData();
  }, []);

  const getorderData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get Orders + Supplier Quotes
      const [orderResponse, quoteResponse] = await Promise.all([
        axios.get(
          `${BASE_URL}admin/getdatawhere/tbl_orders/order_quote_supplier/${SuppId}`
        ),

        axios.get(
          `${BASE_URL}admin/getdatawhere/tbl_supplier_quotes/sq_supp_id/${SuppId}`
        ),
      ]);

      console.log("Approved Orders:", orderResponse.data);
      console.log("Supplier Quotes:", quoteResponse.data);

      if (orderResponse.data.status) {
        const orderData = Array.isArray(orderResponse.data.data)
          ? orderResponse.data.data
          : [orderResponse.data.data];

        const quoteData =
          quoteResponse.data.status
            ? Array.isArray(quoteResponse.data.data)
              ? quoteResponse.data.data
              : [quoteResponse.data.data]
            : [];

        // Only order_stage 8 to 12
        const filteredData = orderData
          .filter((item) => {
            const stage = Number(item.order_stage);

            return stage >= 8 && stage <= 12;
          })
          .map((order) => {
            // Find quote belonging to this order
            const supplierQuote = quoteData.find(
              (quote) =>
                Number(quote.sq_order_id) === Number(order.order_id)
            );

            return {
              ...order,

              // Supplier quotation
              sq_quote: supplierQuote?.sq_quote || "",

              // Supplier remark
              sq_remark: supplierQuote?.sq_remark || "",

              cart_confirm_production_file:
                supplierQuote?.cart_confirm_production_file || "",
            };
          });

        setQuotations(filteredData);
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
                className="bi bi-file-text text-primary"
                aria-hidden="true"
              ></i>
            </span>

            <div>
              <p className="eyebrow mb-1 text-primary">
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

                  <th>
                    Action
                  </th>

                  <th>
                    Quotation
                  </th>

                  <th>
                    Remark
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Request Date & Time
                  </th>

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
                      No Approved found.
                    </td>
                  </tr>

                ) : (

                  quotations.map((item, index) => (

                    <tr
                      key={item.order_id || index}
                      className="text-center"
                    >

                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          disabled={item.cart_confirm_production_file === "Yes"}
                          onClick={() => {
                            // Upload Design logic here
                          }}
                        >
                          Upload Design
                        </button>
                      </td>

                      {/* SUPPLIER QUOTATION */}
                      <td>
                        <span className="fw-bold">Order Code: </span>{item.order_code || "N/A"}
                        <br />
                        <span className="fw-bold">Send Quote: </span>
                        {item.sq_quote ? (

                          <a
                            href={`${BASE_URL}public/Uploads/${item.sq_quote}`}
                            className="text-primary fw-bold text-decoration-none"
                            style={{
                              cursor: "pointer",
                              fontSize: "16px",
                            }}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Quotation
                          </a>

                        ) : (

                          <span className="text-muted">
                            No Quotation
                          </span>

                        )}

                      </td>


                      {/* SUPPLIER REMARK */}
                      <td>

                        {item.sq_remark || "N/A"}

                      </td>

                      <td>
                        {item.cart_confirm_production_file === "Yes" ? (
                          <span className="badge bg-success">
                            Production
                          </span>
                        ) : item.cart_confirm_production_file === "No" ? (
                          <span className="badge bg-warning text-dark">
                            Design Pending
                          </span>
                        ) : (
                          <span className="badge bg-secondary">
                            Pending
                          </span>
                        )}
                      </td>


                      {/* DATE */}
                      <td>

                        {item.order_request_date}{" "}

                        {item.order_request_time}

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </section>

      </div>
    </>
  );
}

export default Approved;