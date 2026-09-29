
import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";
import Delete from "../Config/Delete";
import * as Yup from "yup";
import { useFormik } from "formik";

function Dispatches() {
  const [showModal, setShowModal] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);

  const openDispatchModal = (dispatch) => {
    setSelectedDispatch(dispatch);
    setShowModal(true);
  };

  const closeDispatchModal = () => {
    setShowModal(false);
    setSelectedDispatch(null);
  };

  const formik = useFormik({
    initialValues: {
      status: "",
      upload: null,
      comment: "",
    },

    validationSchema: Yup.object({
      status: Yup.string().required("Status is required"),
      upload: Yup.mixed().required("File is required"),
      comment: Yup.string().required("Comment is required"),
    }),

    onSubmit: async (values, { resetForm }) => {
      try {
        const formData = new FormData();

        formData.append("status", values.status);
        formData.append("comment", values.comment);

        if (values.upload) {
          formData.append("upload", values.upload);
        }

        // Backend API असल्यास इथे call करा
        // await axios.post(`${BASE_URL}admin/dispatch/update`, formData);

        console.log("Dispatch Data:", {
          status: values.status,
          upload: values.upload,
          comment: values.comment,
        });

        toast.success("Dispatch updated successfully");

        resetForm();
        closeDispatchModal();
      } catch (error) {
        console.error("Dispatch Update Error:", error);
        toast.error("Something went wrong");
      }
    },
  });

  return (
    <>
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i
                className="bi bi-people text-primary"
                aria-hidden="true"
              ></i>
            </span>

            <div>
              <p className="eyebrow mb-1 text-primary">All</p>
              <h1 className="h3 mb-1">Dispatches</h1>
            </div>
          </div>
        </div>

        <section className="panel">
          <div className="panel-header d-flex flex-wrap align-items-center justify-content-end gap-2">
            <button
              className="btn btn-outline-primary"
              type="button"
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
                  <th className="w-25">Action</th>
                  <th className="w-25">Staff</th>
                  <th>Staff Detail</th>
                  <th>Image</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  {/* Action */}
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() =>
                        openDispatchModal({
                          id: 1,
                          staff: "Staff Name",
                        })
                      }
                    >
                      <i className="bi bi-pencil-square me-1"></i>
                      Update
                    </button>
                  </td>

                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ================= DISPATCH POPUP ================= */}
      {showModal && (
        <>
          {/* Overlay */}
          <div
            className="modal-backdrop fade show"
            onClick={closeDispatchModal}
          ></div>

          {/* Modal */}
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">

                {/* Header */}
                <div className="modal-header bg-primary text-white">
                  <div>
                    <h5 className="modal-title mb-1">
                      <i className="bi bi-truck me-2"></i>
                      Update Dispatch
                    </h5>

                    {selectedDispatch?.staff && (
                      <small>
                        {selectedDispatch.staff}
                      </small>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeDispatchModal}
                  ></button>
                </div>

                {/* Form */}
                <form onSubmit={formik.handleSubmit}>
                  <div className="modal-body">

                    {/* Status */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Status <span className="text-danger">*</span>
                      </label>

                      <select
                        name="status"
                        className={`form-select ${
                          formik.touched.status &&
                          formik.errors.status
                            ? "is-invalid"
                            : ""
                        }`}
                        value={formik.values.status}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      >
                        <option value="">
                          Select Status
                        </option>

                        <option value="Packed">
                          Packed
                        </option>

                        <option value="Dispatched">
                          Dispatched
                        </option>

                        <option value="In Transit">
                          In Transit
                        </option>

                        <option value="Out for Delivery">
                          Out for Delivery
                        </option>

                        <option value="Delivered">
                          Delivered
                        </option>
                      </select>

                      {formik.touched.status &&
                        formik.errors.status && (
                          <div className="invalid-feedback">
                            {formik.errors.status}
                          </div>
                        )}
                    </div>

                    {/* Upload */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Upload{" "}
                        <span className="text-danger">*</span>
                      </label>

                      <input
                        type="file"
                        name="upload"
                        className={`form-control ${
                          formik.touched.upload &&
                          formik.errors.upload
                            ? "is-invalid"
                            : ""
                        }`}
                        accept=".pdf,.jpg,.jpeg,.png,.zip"
                        onChange={(event) => {
                          formik.setFieldValue(
                            "upload",
                            event.currentTarget.files[0]
                          );
                        }}
                        onBlur={formik.handleBlur}
                      />

                      <div className="form-text">
                        PDF, JPG, PNG or ZIP allowed
                      </div>

                      {formik.touched.upload &&
                        formik.errors.upload && (
                          <div className="invalid-feedback">
                            {formik.errors.upload}
                          </div>
                        )}
                    </div>

                    {/* Comment */}
                    <div className="mb-2">
                      <label className="form-label fw-semibold">
                        Comment{" "}
                        <span className="text-danger">*</span>
                      </label>

                      <textarea
                        name="comment"
                        rows="4"
                        className={`form-control ${
                          formik.touched.comment &&
                          formik.errors.comment
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter comment..."
                        value={formik.values.comment}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      ></textarea>

                      {formik.touched.comment &&
                        formik.errors.comment && (
                          <div className="invalid-feedback">
                            {formik.errors.comment}
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeDispatchModal}
                    >
                      Close
                    </button>

                    <button
                      type="submit"
                      className="btn btn-outline-primary"
                    >
                      <i className="bi bi-check2-circle me-1"></i>
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Dispatches;

