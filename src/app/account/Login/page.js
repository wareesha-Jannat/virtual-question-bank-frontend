"use client";
import styles from "./Login.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../../validation/schemas.jsx";
import { toast } from "react-toastify";
import { useRole } from "@/app/components/RoleProvider";

import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const { role, setRole } = useRole();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/login`,
        {
          method: "POST",
          credentials: "include", //required to set cookies
          headers: { "content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        reset();

        setRole(result.user.role);
    
        // Redirect based on the user's role
        if (result.user.role === "Admin") {
          router.push("/user/admin/dashboard");
        } else if (result.user.role === "Student") {
          router.push("/user/student/dashboard");
        }
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("server error");
    }
  };
  return (
    <div className="formContainer">
      <div className="formBox">
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
            />
            {errors.email && (
              <span className="text-danger">{errors.email.message}</span>
            )}
          </div>
          <div className="mb-3 position-relative">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                {...register("password")}
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="position-absolute top-50 border-0 bg-transparent"
                style={{ right: "0px" }}
              >
               <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>
            {errors.password && (
              <span className="text-danger">{errors.password.message}</span>
            )}
          </div>
          <Link
            href="/account/reset-password-link"
            className={styles.forgotPassword}
          >
            Forgot Password?
          </Link>
          <br />
          <br />
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
        <div className="mt-3 text-center">
          Don't have an Account?
          <Link href="/account/Register" className={styles.forgotPassword}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
