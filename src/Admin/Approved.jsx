
import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";

function Approved() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getorderData();
  }, []);

  const getorderData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${BASE_URL}admin/getdatawhere/tbl_orders/order_stage/7`
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

  return (
    <>
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-file-text" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">All</p>
              <h1 className="h3 mb-1">Approved</h1>
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
                  <th>Order Code</th>
                  <th>Quotation</th>
                  <th>Remark</th>
                  <th>Request Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="text-center text-danger py-4">
                      {error}
                    </td>
                  </tr>
                ) : quotations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No quotations found for Stage 6.
                    </td>
                  </tr>
                ) : (
                  quotations.map((item, index) => (
                    <tr key={item.order_id || index} className="text-center">
                      <td className="fw-bold">{item.order_code || "N/A"}</td>

                      <td>
                        <a
                          href={`${BASE_URL}public/Uploads/${item.order_quotation}`}
                          className="text-danger fw-bold text-decoration-none"
                          style={{ cursor: "pointer", fontSize: "16px" }}
                          target="_blank"
                        >
                          View Quotations
                        </a>
                      </td>
                      <td>{item.order_remark || "N/A"}</td>

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
    </>
  );
}

export default Approved;
