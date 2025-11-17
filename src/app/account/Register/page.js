"use client";
import styles from "./Register.module.css";
import Link from "next/link"
import { useForm } from "react-hook-form";
import {yupResolver} from '@hookform/resolvers/yup';
import { toast } from "react-toastify";
import {registerSchema} from '../../validation/schemas.jsx'

export default function Register() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });
 
  const onSubmit = async (data) => {
   try{
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/register`, {
      method: "POST",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
         toast.success(result.message)
      reset();
    } else {
      toast.error(result.message)
    }
  }catch(err){
    toast.error("server error, please try again")
  }
  };
  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerBox}>
        <h2 className="text-center mb-4">Register</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            />
           {errors.name && <span className="text-danger">{errors.name.message}</span>}
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email 
            </label>
            <input
               type="email"
               id="email"
               {...register('email')}
               className={`form-control ${errors.email ? 'is-invalid' : ''}`}
             />
             {errors.email && <span className="text-danger">{errors.email.message}</span>}
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
               type="password"
               id="password"
               {...register('password')}
               className={`form-control ${errors.password ? 'is-invalid' : ''}`}
             />
             {errors.password && <span className="text-danger">{errors.password.message}</span>}
          </div>

          <div className="mb-3">
            <label htmlFor="passwordConfirmation" className="form-label">
              Confirm password
            </label>
            <input
               type="password"
               id="passwordConfirmation"
               {...register('passwordConfirmation')}
               className={`form-control ${errors.passwordConfirmation ? 'is-invalid' : ''}`}
             />
             {errors.passwordConfirmation && <span className="text-danger">{errors.passwordConfirmation.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Register
          </button>
        </form>
        <div className="mt-3 text-center">
          <p>
            Already have an account?{" "}
            <Link href="/account/Login" className={styles.loginLink}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
