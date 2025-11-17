'use client'
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import {yupResolver} from '@hookform/resolvers/yup';
import {resetPasswordLinkSchema} from '../../validation/schemas.jsx'
import { useState } from "react";

export default function ResetPasswordLink(){
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
      } = useForm({
        resolver: yupResolver(resetPasswordLinkSchema),
      });
      const [loading, setLoading] = useState()
     
      const onSubmit = async (data) => {
       try{
        setLoading(true)
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/reset-password-link`, {
          method: "POST",
          headers: { "content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        setLoading(false)
        if (res.ok) {
          toast.success(result.message);
          reset();
        } else {
          toast.error(result.message);
        }
      }catch(err){
        toast.error("server error");
      }
      };
  return (
    <div className="formContainer">
      <div className="formBox">
        <h2 className="text-center mb-4">Reset Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
    
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Sending email....": "Send"}
            </button>
        </form>
        
      </div>
    </div>
  );
};

