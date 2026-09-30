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

const [showDesignModal, setShowDesignModal] = useState(false);
const [selectedOrder, setSelectedOrder] = useState(null);

const [selectedStatus, setSelectedStatus] = useState("");
const [selectedFile, setSelectedFile] = useState(null);
const [saving, setSaving] = useState(false);

/* =========================
OPEN MODAL
========================= */
const openDesignModal = (order) => {
setSelectedOrder(order);
setSelectedStatus("");
setSelectedFile(null);
setShowDesignModal(true);
};

/* =========================
CLOSE MODAL
========================= */
const closeDesignModal = () => {
if (saving) return;

setShowDesignModal(false); 
setSelectedOrder(null); 
setSelectedStatus(""); 
setSelectedFile(null); 

};

/* =========================
GET ORDER DATA
========================= */
useEffect(() => {
getorderData();
}, []);

const getorderData = async () => {
setLoading(true);
setError(null);

try { 
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

    const quoteData = quoteResponse.data.status 
      ? Array.isArray(quoteResponse.data.data) 
        ? quoteResponse.data.data 
        : [quoteResponse.data.data] 
      : []; 

    /* ========================= 
       ONLY STAGE 8 TO 13 
    ========================= */ 
    const filteredData = orderData 
      .filter((item) => { 
        const stage = Number(item.order_stage); 

        return stage >= 8 && stage <= 13; 
      }) 
      .map((order) => { 
        const supplierQuote = quoteData.find( 
          (quote) => 
            Number(quote.sq_order_id) === Number(order.order_id) 
        ); 

        return { 
          ...order, 

          sq_quote: supplierQuote?.sq_quote || "", 
          sq_remark: supplierQuote?.sq_remark || "", 

          cart_confirm_production_file: 
            supplierQuote?.cart_confirm_production_file || 
            order.cart_confirm_production_file || 
            "", 
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

/* =========================
STATUS CHANGE
========================= */
const handleStatusChange = (e) => {
setSelectedStatus(e.target.value);
};

/* =========================
FILE CHANGE
========================= */
const handleFileChange = (e) => {
const file = e.target.files?.[0];

if (!file) { 
  setSelectedFile(null); 
  return; 
} 

const allowedTypes = [ 
  "application/pdf", 
  "image/jpeg", 
  "image/png", 
  "application/zip", 
  "application/x-zip-compressed", 
]; 

const allowedExtensions = [ 
  ".pdf", 
  ".jpg", 
  ".jpeg", 
  ".png", 
  ".zip", 
]; 

const fileName = file.name.toLowerCase(); 

const validExtension = allowedExtensions.some((ext) => 
  fileName.endsWith(ext) 
); 

if (!validExtension && !allowedTypes.includes(file.type)) { 
  toast.error("Only PDF, JPG, PNG or ZIP files are allowed."); 
  e.target.value = ""; 
  setSelectedFile(null); 
  return; 
} 

setSelectedFile(file); 

};

/* =========================
SAVE STATUS
========================= */
const handleSave = async () => {
if (!selectedOrder) {
toast.error("Order not selected.");
return;
}

let newStage = ""; 

/* ========================= 
   PRODUCT ORDER = YES 
   DISPATCH QUALITY CHECK 
========================= */ 

if ( 
  selectedOrder.cart_confirm_production_file === "Yes" 
) { 
  if (!selectedStatus) { 
    toast.error("Please select status."); 
    return; 
  } 

  if (selectedStatus === "quality_check") { 
    newStage = 12; 
  } 

  if (selectedStatus === "dispatch") { 
    newStage = 13; 
  } 
} 

/* ========================= 
   PRODUCT ORDER = NO 
   UPLOAD DESIGN 
========================= */ 

if ( 
  selectedOrder.cart_confirm_production_file === "No" 
) { 
  if (!selectedFile) { 
    toast.error("Please upload design."); 
    return; 
  } 

  /* 
    Product Order = No 
    Upload Design required. 

    Current stage remains 11 
    after design upload. 
  */ 

  newStage = 11; 
} 

if (!newStage) { 
  toast.error("Invalid action."); 
  return; 
} 

setSaving(true); 

try { 
  /* ========================= 
     UPDATE ORDER STAGE 
  ========================= */ 

  const response = await axios.post( 
    `${BASE_URL}admin/update/tbl_orders/${selectedOrder.order_id}`, 
    { 
      order_stage: newStage, 
    } 
  ); 

  console.log("Stage Update Response:", response.data); 

  if (response.data.status) { 
    toast.success( 
      selectedOrder.cart_confirm_production_file === "No" 
        ? "Design uploaded successfully." 
        : "Status updated successfully." 
    ); 

    closeDesignModal(); 

    /* Refresh table */ 
    getorderData(); 
  } else { 
    toast.error( 
      response.data.message || "Failed to update." 
    ); 
  } 
} catch (error) { 
  console.error("Stage update error:", error); 

  toast.error("Failed to update."); 
} finally { 
  setSaving(false); 
} 

};

return (
<>
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

  {/* ========================= 
      TABLE 
  ========================= */} 

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
                {/* ========================= 
                    ACTION 
                ========================= */} 

                <td> 
                  
                  <button 
                    type="button" 
                    className="btn btn-outline-primary" 
                    onClick={() => 
                      openDesignModal(item) 
                    } 
                  > 
                    {/* <i className="bi bi-pencil-square me-1"></i>  */}

                    {item.cart_confirm_production_file === 
                    "Yes" 
                      ? " Quality Check" 
                      : "Upload Design"} 
                  </button> 
                </td> 

                {/* ========================= 
                    SUPPLIER QUOTATION 
                ========================= */} 

                <td> 
                  <span className="fw-bold"> 
                    Order Code: 
                  </span>{" "} 
                  {item.order_code || "N/A"} 

                  <br /> 

                  <span className="fw-bold"> 
                    Send Quote: 
                  </span>{" "} 

                  {item.sq_quote ? ( 
                    <a 
                      href={`${BASE_URL}public/Uploads/${item.sq_quote}`} 
                      className="text-primary fw-bold text-decoration-none" 
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

                {/* ========================= 
                    REMARK 
                ========================= */} 

                <td> 
                  {item.sq_remark || "N/A"} 
                </td> 

                {/* ========================= 
                    STATUS 
                ========================= */} 

                <td> 
                  {Number(item.order_stage) === 12 ? ( 
                    <span className="badge bg-warning text-dark"> 
                      Quality Check 
                    </span> 
                  ) : Number(item.order_stage) === 13 ? ( 
                    <span className="badge bg-success"> 
                      Dispatch 
                    </span> 
                  ) : Number(item.order_stage) === 11 ? ( 
                    <span className="badge bg-primary"> 
                      Proceed for Production 
                    </span> 
                  ) : item.cart_confirm_production_file === 
                    "Yes" ? ( 
                    <span className="badge bg-success"> 
                      Production 
                    </span> 
                  ) : item.cart_confirm_production_file === 
                    "No" ? ( 
                    <span className="badge bg-warning text-dark"> 
                      Design Pending 
                    </span> 
                  ) : ( 
                    <span className="badge bg-secondary"> 
                      Pending 
                    </span> 
                  )} 
                </td> 

                {/* ========================= 
                    DATE 
                ========================= */} 

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

  {/* ================================================== 
      DESIGN / DISPATCH MODAL 
  ================================================== */} 

  {showDesignModal && selectedOrder && ( 
    <> 
      {/* Overlay */} 

      <div 
        className="modal-backdrop fade show" 
        onClick={closeDesignModal} 
      ></div> 

      {/* Modal */} 

      <div 
        className="modal fade show d-block" 
        tabIndex="-1" 
        role="dialog" 
      > 
        <div 
          className="modal-dialog modal-dialog-centered" 
          role="document" 
        > 
          <div className="modal-content"> 

            {/* ========================= 
                HEADER 
            ========================= */} 

            <div className="design-modal-header"> 
              <div> 
                <h4> 
                  {/* <i className="bi bi-truck me-2"></i>  */}

                  {selectedOrder.cart_confirm_production_file === 
                  "Yes" 
                    ? "Dispatch Quality Check" 
                    : "Upload Design"} 
                </h4> 

                {/* <div className="staff-name"> 
                  Order Code:{" "} 
                  <strong> 
                    {selectedOrder.order_code || 
                      "N/A"} 
                  </strong> 
                </div>  */}
              </div> 

              <button 
                type="button" 
                className="design-modal-close" 
                onClick={closeDesignModal} 
                disabled={saving} 
              > 
                <i className="bi bi-x-lg"></i> 
              </button> 
            </div> 

            {/* ========================= 
                BODY 
            ========================= */} 

            <div className="design-modal-body"> 

              {/* ================================================== 
                  PRODUCT ORDER = YES 
                  DISPATCH QUALITY CHECK 
              ================================================== */} 

              {selectedOrder.cart_confirm_production_file === 
              "Yes" && ( 
                <> 
                  <div className="design-form-group"> 
                    <label> 
                      Status <span>*</span> 
                    </label> 

                    <select 
                      className="form-select design-form-control" 
                      value={selectedStatus} 
                      onChange={handleStatusChange} 
                    > 
                      <option value=""> 
                        Select Status 
                      </option> 

                      <option value="quality_check"> 
                        Quality Check 
                      </option> 

                      <option value="dispatch"> 
                        Dispatch 
                      </option> 
                    </select> 
                  </div> 

                  {/* Upload */} 

                  <div className="design-form-group"> 
                    <label> 
                      Upload <span>*</span> 
                    </label> 

                    <input 
                      type="file" 
                      className="form-control design-form-control" 
                      accept=".pdf,.jpg,.jpeg,.png,.zip" 
                      onChange={handleFileChange} 
                    /> 

                    <small> 
                      PDF, JPG, PNG or ZIP allowed 
                    </small> 
                  </div> 
                </> 
              )} 

              {/* ================================================== 
                  PRODUCT ORDER = NO 
                  UPLOAD DESIGN 
              ================================================== */} 

              {selectedOrder.cart_confirm_production_file === 
              "No" && ( 
                <> 
                  <div className="design-form-group"> 
                    <label> 
                      Upload Design <span>*</span> 
                    </label> 

                    <input 
                      type="file" 
                      className="form-control design-form-control" 
                      accept=".pdf,.jpg,.jpeg,.png,.zip" 
                      onChange={handleFileChange} 
                    /> 

                    <small> 
                      PDF, JPG, PNG or ZIP allowed 
                    </small> 
                  </div> 
                </> 
              )} 
            </div> 

            {/* ========================= 
                FOOTER 
            ========================= */} 

            <div className="design-modal-footer"> 
              <button 
                type="button" 
                className="btn design-close-btn" 
                onClick={closeDesignModal} 
                disabled={saving} 
              > 
                Close 
              </button> 

              <button 
                type="button" 
                className="btn design-save-btn" 
                onClick={handleSave} 
                disabled={saving} 
              > 
                {saving ? ( 
                  <> 
                    <span 
                      className="spinner-border spinner-border-sm me-1" 
                      role="status" 
                      aria-hidden="true" 
                    ></span> 

                    Saving... 
                  </> 
                ) : ( 
                  <> 
                    <i className="bi bi-check2-circle me-1"></i> 

                    {selectedOrder.cart_confirm_production_file === 
                    "No" 
                      ? "Upload Design" 
                      : "Save"} 
                  </> 
                )} 
              </button> 
            </div> 

          </div> 
        </div> 
      </div> 
    </> 
  )} 
</> 

);
}

export default Approved;      
