"use client";
import styles from "../Auth.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../../validation/schemas.jsx";
import { toast } from "react-toastify";
import { useRole } from "@/app/components/RoleProvider";

import { useState, useEffect } from "react";

export default function Login() {
  const router = useRouter();
  const { role, setRole } = useRole();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (role === "Admin") {
      router.push("/user/admin/dashboard");
    } else if (role === "Student") {
      router.push("/user/student/dashboard");
    }
  }, [role]);

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
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="login-title">
        <header className={styles.header}>
          <span className={styles.brand} aria-hidden="true">
            <i className="bi bi-journal-check"></i>
          </span>
          <span className={styles.eyebrow}>Virtual Question Bank</span>
          <h1 id="login-title" className={styles.title}>Welcome back</h1>
          <p className={styles.description}>Sign in to continue to your learning space.</p>
        </header>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email <span className={styles.required} aria-hidden="true">*</span>
            </label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-required="true"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              {...register("email")}
              className={`${styles.input} ${errors.email ? styles.inputInvalid : ""}`}
            />
            {errors.email && (
              <span id="login-email-error" className={styles.error} role="alert">
                {errors.email.message}
              </span>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password <span className={styles.required} aria-hidden="true">*</span>
            </label>
            <div className={styles.passwordField}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                aria-required="true"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "login-password-error" : undefined}
                {...register("password")}
                className={`${styles.input} ${styles.passwordInput} ${errors.password ? styles.inputInvalid : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.visibilityButton}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true"></i>
              </button>
            </div>
            {errors.password && (
              <span id="login-password-error" className={styles.error} role="alert">
                {errors.password.message}
              </span>
            )}
          </div>
          <div className={styles.formOptions}>
            <Link href="/account/reset-password-link" className={styles.link}>
              Forgot password?
            </Link>
          </div>
          <button type="submit" className={styles.primaryButton}>
            Sign in
          </button>
        </form>
        <p className={styles.footer}>
          Don&apos;t have an account?
          <Link href="/account/Register" className={styles.link}>
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}
