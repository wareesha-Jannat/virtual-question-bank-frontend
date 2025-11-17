"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { changePasswordSchema } from "../../../validation/schemas.jsx";
import { toast } from "react-toastify";
import { useState } from "react";

export const ChangePassword = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/changePassword`,
        {
          method: "POST",
          credentials: "include",
          headers: { "content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        setLoading(false);
        reset();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("server error");
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row justify-content-center">
        <h2 className="heading">Change Password</h2>
        <div className="col-10 ">
          <div className="card p-4 shadow-sm mt-3">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3 position-relative">
                <label htmlFor="oldPassword" className="form-label">
                  Old Password
                </label>
                <div>
                  <input
                    type={showOldPassword ? "text" : "password"}
                    id="oldPassword"
                    {...register("oldPassword")}
                    className={`form-control ${
                      errors.oldPassword ? "is-invalid" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="position-absolute top-50 border-0 bg-transparent"
                    style={{ right: "0px" }}
                  >
                    <i
                      className={`bi ${
                        showOldPassword ? "bi-eye-slash" : "bi-eye"
                      }`}
                    ></i>
                  </button>
                </div>
                {errors.oldPassword && (
                  <span className="text-danger">
                    {errors.oldPassword.message}
                  </span>
                )}
              </div>

              <div className="mb-3 position-relative">
                <label htmlFor="password" className="form-label">
                  New Password
                </label>
                <div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    {...register("newPassword")}
                    className={`form-control ${
                      errors.newPassword ? "is-invalid" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="position-absolute top-50 border-0 bg-transparent"
                    style={{ right: "0px" }}
                  >
                    <i
                      className={`bi ${
                        showNewPassword ? "bi-eye-slash" : "bi-eye"
                      }`}
                    ></i>
                  </button>
                </div>
                {errors.newPassword && (
                  <span className="text-danger">
                    {errors.newPassword.message}
                  </span>
                )}
              </div>

              <div className="mb-3 position-relative">
                <label htmlFor="password" className="form-label">
                  Confirm New Password
                </label>
                <div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="passwordConfirmation"
                    {...register("passwordConfirmation")}
                    className={`form-control ${
                      errors.passwordConfirmation ? "is-invalid" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="position-absolute top-50 border-0 bg-transparent"
                    style={{ right: "0px" }}
                  >
                    <i
                      className={`bi ${
                        showConfirmPassword ? "bi-eye-slash" : "bi-eye"
                      }`}
                    ></i>
                  </button>
                </div>
                {errors.passwordConfirmation && (
                  <span className="text-danger">
                    {errors.passwordConfirmation.message}
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
