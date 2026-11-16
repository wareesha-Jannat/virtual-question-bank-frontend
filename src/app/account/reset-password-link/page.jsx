"use client";
import Link from "next/link";
import styles from "../Auth.module.css";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { resetPasswordLinkSchema } from "../../validation/schemas.jsx";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation.js";
import { useRole } from "@/app/components/RoleProvider.jsx";

export default function ResetPasswordLink() {
  const [loading, setLoading] = useState();
  const router = useRouter();
  const {role} = useRole();

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
    resolver: yupResolver(resetPasswordLinkSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/password-resets`,
        {
          method: "POST",
          headers: { "content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      const result = await res.json();
      setLoading(false);
      if (res.ok) {
        toast.success(result.message);
        reset();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      setLoading(false);
      toast.error("server error");
    }
  };
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="reset-link-title">
        <header className={styles.header}>
          <span className={styles.brand} aria-hidden="true">
            <i className="bi bi-envelope-check"></i>
          </span>
          <span className={styles.eyebrow}>Account recovery</span>
          <h1 id="reset-link-title" className={styles.title}>Reset your password</h1>
          <p className={styles.description}>
            Enter the email address linked to your account. We&apos;ll send you a link to choose a new password.
          </p>
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
              aria-describedby={errors.email ? "reset-email-error" : undefined}
              {...register("email")}
              className={`${styles.input} ${errors.email ? styles.inputInvalid : ""}`}
            />
            {errors.email && (
              <span id="reset-email-error" className={styles.error} role="alert">
                {errors.email.message}
              </span>
            )}
          </div>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <span aria-live="polite">Sending email...</span>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>
        <p className={styles.footer}>
          Remembered your password?
          <Link href="/account/Login" className={styles.link}>Sign in</Link>
        </p>
      </section>
    </main>
  );
}
