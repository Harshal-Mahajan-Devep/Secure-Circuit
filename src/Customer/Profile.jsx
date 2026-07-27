import banner from "../../public/assets/images/profile-banner.png";
import defaultProfile from "../../public/assets/images/defaultProfile.jpeg";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";

function Profile() {
  const customer = JSON.parse(localStorage.getItem("customer"));

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showProfileConfirmModal, setShowProfileConfirmModal] = useState(false);

  const [profile, setProfile] = useState({
    cust_contact_person: "",
    cust_email: "",
    cust_mobile: "",
    cust_image: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    setPageLoading(true);

    try {
      const res = await axios.get(
        `${BASE_URL}customer/getdatawhere/tbl_customers/cust_id/${customer.cust_id}`,
      );

      if (res.data.status) {
        setProfile(res.data.data[0]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const updateProfile = (e) => {
    e.preventDefault();

    const companyFilled =
      profile.cust_company_name?.trim() !== "";

    const gstFilled =
      profile.cust_gstno?.trim() !== "";

    if (
      profile.cust_profile_update == 0 &&
      companyFilled &&
      gstFilled
    ) {
      setShowProfileConfirmModal(true);
      return;
    }

    // Ek jari field empty asel tar direct update
    saveProfile();
  }


  const saveProfile = async () => {
    setLoading(true);

    const companyFilled =
      profile.cust_company_name?.trim() !== "";

    const gstFilled =
      profile.cust_gstno?.trim() !== "";

    try {
      const updateData = {
        cust_contact_person: profile.cust_contact_person,
        cust_email: profile.cust_email,
        cust_mobile: profile.cust_mobile,
        cust_company_name: profile.cust_company_name,
        cust_gstno: profile.cust_gstno,
        cust_billing_address: profile.cust_billing_address,
        cust_shipping_address: profile.cust_shipping_address,
        cust_image: profile.cust_image,

        cust_profile_update:
          profile.cust_profile_update == 0 &&
            companyFilled &&
            gstFilled
            ? 1
            : profile.cust_profile_update,
      };

      const res = await axios.post(
        `${BASE_URL}customer/updatedata/tbl_customers/cust_id/${customer.cust_id}`,
        updateData
      );

      if (res.data.status) {
        setProfile((prev) => ({
          ...prev,
          cust_profile_update:
            profile.cust_profile_update == 0 &&
              companyFilled &&
              gstFilled
              ? 1
              : prev.cust_profile_update,
        }));

        localStorage.setItem(
          "customer",
          JSON.stringify({
            ...customer,
            ...updateData,
          })
        );

        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error("Update failed");
    }

    setLoading(false);
  };

  const confirmProfileUpdate = () => {
    setShowProfileConfirmModal(false);
    saveProfile();
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("cust_image", file);

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
        setProfile((prev) => ({
          ...prev,
          cust_image: upload.data.files.cust_image,
        }));

        toast.success("Profile image uploaded");
      }

      setUploadProgress(100);

    } catch (err) {
      console.log(err);
      toast.error("Image upload failed");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 700);
    }
  };


  const changePassword = async () => {
    if (
      !passwordData.current_password ||
      !passwordData.new_password ||
      !passwordData.confirm_password
    ) {
      return toast.error("All fields are required");
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      return toast.error("New Password and Confirm Password do not match");
    }

    try {
      const res = await axios.post(
        `${BASE_URL}customer/changepassword`,
        {
          cust_id: customer.cust_id,
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }
      );

      if (res.data.status) {
        toast.success(res.data.message);

        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });

        setShowModal(false);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Password change failed");
    }
  };

  const resetForm = () => {
    resetForm();
    setShowModal(false);
  };



  // Testimonial modal handlers
  const [testimonialData, setTestimonialData] = useState({
    test_id: "",
    test_rating: 0,
    test_text: "",
  });

  const handleRating = (rating) => {
    setTestimonialData((prev) => ({
      ...prev,
      test_rating: rating,
    }));
  };

  const handleTestimonialChange = (e) => {
    setTestimonialData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getTestimonial = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}customer/gettestimonial/${customer.cust_id}`
      );

      if (res.data.status) {
        setTestimonialData({
          test_id: res.data.data.test_id,
          test_rating: res.data.data.test_rating,
          test_text: res.data.data.test_text,
        });
      } else {
        setTestimonialData({
          test_id: "",
          test_rating: 0,
          test_text: "",
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const saveTestimonial = async () => {

    if (testimonialData.test_rating === 0) {
      return toast.error("Please select rating");
    }

    if (!testimonialData.test_text.trim()) {
      return toast.error("Please enter testimonial");
    }

    try {

      const res = await axios.post(
        `${BASE_URL}customer/savetestimonial`,
        {
          test_cust_id: customer.cust_id,
          test_rating: testimonialData.test_rating,
          test_text: testimonialData.test_text,
        }
      );

      if (res.data.status) {
        toast.success(res.data.message);
        setShowTestimonialModal(false);
        getTestimonial();

      } else {
        toast.error(res.data.message);
      }

    } catch (err) {
      toast.error("Something went wrong");
    }

  };

  return (
    <>
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-person-badge text-success" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1 text-success">Account</p>
              <h1 className="h3 mb-1">Profile</h1>
            </div>
          </div>
        </div>

        <section className="row g-3">
          {pageLoading ? (
            <>
              <div className="col-12 col-xl-4">
                <div className="panel h-100 text-center profile-card p-4">

                  <div className="profile-skeleton profile-avatar"></div>

                  <div className="profile-skeleton profile-title"></div>

                  <div className="mt-4">
                    <div className="profile-skeleton profile-text"></div>
                    <div className="profile-skeleton profile-text"></div>
                    <div className="profile-skeleton profile-text"></div>
                    <div className="profile-skeleton profile-text"></div>
                  </div>

                </div>
              </div>

              <div className="col-12 col-xl-8">
                <div className="panel p-4">

                  <div className="row g-3">

                    <div className="col-md-1">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-md-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div
                      className="col-md-6 d-flex justify-content-end align-items-end"
                      style={{ minHeight: "10px" }}
                    >
                      <div className="profile-skeleton profile-input-button"></div>
                    </div>

                    <div className="col-md-4 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-md-4 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-md-4 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-md-4 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-md-4 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div
                      className="col-md-4 d-flex justify-content-center align-items-center mt-5"
                      style={{ minHeight: "10px" }}
                    >
                      <div className="profile-skeleton profile-input-file"></div>
                    </div>

                    <div className="col-md-6 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-md-6 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-12 d-flex justify-content-center mt-4">
                      <div className="profile-skeleton profile-button"></div>
                    </div>

                  </div>

                </div>
              </div>
            </>
          ) : (

            <>
              <div className="col-12 col-xl-4">
                <div className="panel h-100 text-center profile-card">
                  <img
                    className="avatar-img avatar-xl profile-photo mt-2 d-block mx-auto"
                    src={
                      profile.cust_image
                        ? `${BASE_URL}public/Uploads/${profile.cust_image}`
                        : defaultProfile
                    }
                    alt={profile.cust_contact_person}
                  />
                  <h2 className="h5 mt-3 mb-1 fw-bold">{profile.cust_contact_person}</h2>

                  <div className="info-list mt-4 text-start">
                    <div>
                      <span>Email</span>
                      <strong>{profile.cust_email?.slice(0, 20)}</strong>
                    </div>

                    <div>
                      <span>Mobile</span>
                      <strong>+91 {profile.cust_mobile}</strong>
                    </div>
                    <div>
                      <span>Company</span>
                      <strong>{profile.cust_company_name?.slice(0, 15)} </strong>
                    </div>
                    <button
                      className="btn btn-outline-success"
                      type="button"
                      onClick={() => {
                        setShowModal(true);
                      }}>Change Password</button>
                  </div>
                </div>
              </div>
              <div className="col-12 col-xl-8">
                <form
                  onSubmit={updateProfile}
                  className="panel needs-validation"
                  noValidate
                >
                  <div className="panel-header">
                    <div>
                      <h2 className="h5 mb-1 section-title">
                        <i className="bi bi-person-gear text-success" aria-hidden="true"></i>
                        <span>Profile Settings</span>
                      </h2>
                      <p className="text-muted mb-0">
                        Update your account profile and contact details.
                      </p>
                    </div>
                    <button
                      className="btn btn-outline-success"
                      type="button"
                      onClick={() => {
                        getTestimonial();
                        setShowTestimonialModal(true);
                      }}
                    >
                      Testimonial
                    </button>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label" htmlFor="profileName">
                        Fullname
                      </label>
                      <input
                        className="model-add-edit-input"
                        id="profileName"
                        placeholder="Full Name"
                        type="text"
                        name="cust_contact_person"
                        value={profile.cust_contact_person}
                        onChange={handleChange}
                        readOnly
                        disabled
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label" htmlFor="profileEmail">
                        Email
                      </label>
                      <input
                        className="model-add-edit-input"
                        type="email"
                        placeholder="Email"
                        name="cust_email"
                        value={profile.cust_email}
                        onChange={handleChange}
                        readOnly
                        disabled
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label" htmlFor="profileMobile">
                        Moble
                      </label>
                      <input
                        className="model-add-edit-input"
                        type="tel"
                        placeholder="Mobile"
                        name="cust_mobile"
                        maxLength={10}
                        value={profile.cust_mobile}
                        onChange={handleChange}
                        readOnly
                        disabled
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label" htmlFor="profileEmail">
                        Company Name
                      </label>
                      <input
                        className="model-add-edit-input"
                        type="text"
                        placeholder="Company Name"
                        name="cust_company_name"
                        value={profile.cust_company_name}
                        onChange={handleChange}
                        disabled={profile.cust_profile_update == 1}

                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label" htmlFor="profileEmail">
                        GST No
                      </label>
                      <input
                        className="model-add-edit-input"
                        type="text"
                        placeholder="GST Number"
                        name="cust_gstno"
                        value={profile.cust_gstno}
                        onChange={handleChange}
                        disabled={profile.cust_profile_update == 1}

                      />
                    </div>
                    <div className="col-md-4 text-center pt-2">
                      <input
                        type="file"
                        className="d-none"
                        id="profileImage"
                        accept="image/*"
                        onChange={uploadImage}
                      />

                      <label
                        htmlFor="profileImage"
                        className="btn btn-outline-success btn-sm rounded-pill mt-4 px-3 py-2"
                      >
                        <i className="fas fa-image me-2"></i>
                        Choose Profile Image
                      </label>
                      {uploading && (
                        <div className="profile-upload-progress mt-3">
                          <div className="profile-upload-progress-bar">
                            <div
                              className="profile-upload-progress-fill"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>

                          <small className="fw-semibold">
                            Uploading... {uploadProgress}%
                          </small>
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="profileEmail">
                        Billing Address
                      </label>
                      <textarea
                        className="model-add-edit-input"
                        rows={3}
                        name="cust_billing_address"
                        placeholder="Billing address"
                        value={profile.cust_billing_address}
                        onChange={handleChange}
                      >
                      </textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="profileEmail">
                        Shipping Address
                      </label>
                      <textarea
                        className="model-add-edit-input"
                        rows={3}
                        placeholder="Shipping Address"
                        name="cust_shipping_address"
                        value={profile.cust_shipping_address}
                        onChange={handleChange}
                      >
                      </textarea>
                    </div>


                  </div>
                  <div className="d-flex justify-content-center mt-4">
                    <button
                      className="btn btn-outline-success"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Profile"}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </section >
      </div >

      {showModal && (
        <div className="model-add-edit-modal-overlay">
          <div className="model-add-edit-modal-dialog model-size-sm">
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header-success">
                <h5 className="model-add-edit-modal-title">
                  Change Password
                </h5>

                <button
                  type="button"
                  className="model-add-edit-modal-close"
                  onClick={() => setShowModal(false)}                >
                  ✕
                </button>
              </div>

              <div className="model-add-edit-modal-body">
                <div className="row g-3">

                  <div className="col-md-12">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="model-add-edit-input"
                      placeholder="Current Password"
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="model-add-edit-input"
                      placeholder="New Pasword"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="model-add-edit-input"
                      placeholder="Confirm Password"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div className="model-add-edit-modal-footer d-flex justify-content-between">
                    <button
                      className="model-add-edit-btn model-add-edit-btn-cancel"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>

                    <button
                      type="button"
                      className="model-add-edit-btn model-add-edit-btn-save-success"
                      onClick={changePassword}
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTestimonialModal && (
        <div className="model-add-edit-modal-overlay">
          <div className="model-add-edit-modal-dialog model-size-sm">
            <div className="model-add-edit-modal-content">

              <div className="model-add-edit-modal-header-success">
                <h5 className="model-add-edit-modal-title">
                  {testimonialData.test_id
                    ? "Update Testimonial"
                    : "Add Testimonial"}
                </h5>

                <button
                  className="model-add-edit-modal-close"
                  onClick={() => setShowTestimonialModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="model-add-edit-modal-body">
                <div className="row">
                  <div className="mb-3 text-center">
                    <label className="form-label fw-semibold">
                      Rating
                    </label>

                    <div className="fs-2">

                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          onClick={() => handleRating(star)}
                          style={{
                            cursor: "pointer",
                            color:
                              star <= testimonialData.test_rating
                                ? "#ffc107"
                                : "#d3d3d3",
                            margin: "0 5px",
                          }}
                        >
                          ★
                        </span>
                      ))}

                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Description
                    </label>

                    <textarea
                      rows={5}
                      className="model-add-edit-textarea"
                      placeholder="Write your testimonial..."
                      name="test_text"
                      value={testimonialData.test_text}
                      onChange={handleTestimonialChange}
                    />
                  </div>

                  <div className="model-add-edit-modal-footer d-flex justify-content-between">

                    <button
                      className="model-add-edit-btn model-add-edit-btn-cancel"
                      onClick={() => {
                        setShowTestimonialModal(false);

                        setTestimonialData({
                          test_id: "",
                          test_rating: 0,
                          test_text: "",
                        });
                      }}
                    >
                      Close
                    </button>

                    <button
                      className="model-add-edit-btn model-add-edit-btn-save-success"
                      onClick={saveTestimonial}
                    >
                      {testimonialData.test_id ? "Update" : "Save"}
                    </button>

                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}


      {showProfileConfirmModal && (
        <div className="model-add-edit-modal-overlay">
          <div className="model-add-edit-modal-dialog model-size-sm">
            <div className="model-add-edit-modal-content">

              <div className="model-add-edit-modal-header-success">
                <h5 className="model-add-edit-modal-title">
                  One Time Profile Update
                </h5>

                <button
                  type="button"
                  className="model-add-edit-modal-close"
                  onClick={() => setShowProfileConfirmModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="model-add-edit-modal-body">
                <div className="row">

                  <div className="text-center mb-3">
                    <i
                      className="fas fa-exclamation-circle text-warning"
                      style={{ fontSize: "50px" }}
                    ></i>
                  </div>

                  <h5 className="text-center fw-bold mb-3">
                    One-Time Profile Update
                  </h5>

                  <p className="text-center mb-3">
                    These details can be updated <span className="text-danger fw-bold">only once</span>.
                    Please verify that the information entered is accurate before proceeding.
                  </p>

                  <div className="alert alert-warning mb-4">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Important:</strong> Once this update is submitted, the
                    <strong> Company Name</strong> and <strong>GST Number</strong> cannot be modified again.
                    Other profile details, such as your address and profile image, can still be updated in the future.
                  </div>

                  <div className="model-add-edit-modal-footer d-flex justify-content-between">
                    <button
                      className="model-add-edit-btn model-add-edit-btn-cancel"
                      onClick={() => setShowProfileConfirmModal(false)}
                    >
                      Cancel
                    </button>

                    <button
                      className="model-add-edit-btn model-add-edit-btn-save-success"
                      onClick={confirmProfileUpdate}
                    >
                      Yes, Continue
                    </button>

                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;
