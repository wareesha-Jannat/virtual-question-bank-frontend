'use client'

import { useForm } from "react-hook-form";
import { useParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import {yupResolver} from '@hookform/resolvers/yup';
import {resetPasswordConfirmSchema} from '../../../../validation/schemas.jsx'
import { toast } from "react-toastify";

export default function ResetPasswordConfirm(){
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
      } = useForm({
        resolver: yupResolver(resetPasswordConfirmSchema),
      });
      const router = useRouter();
      const { id, token } =useParams()
     
      const onSubmit = async (data) => {
       try{
       
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/reset-password/${id}/${token}`, {
          method: "POST",
          headers: { "content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (res.ok) {
          toast.success(result.message)
          router.push('/account/Login');
          reset();
        } else {
          toast.error(result.message)
        }
      }catch(err){
        toast.error("server error")
      }
      };
  return (
    <div className= "formContainer">
      <div className= "formBox">
        <h2 className="text-center mb-4">Reset Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-3">
            <label htmlFor="password" className="form-label">
             New Password
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
              Confirm New Password
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
              Save
            </button>
        </form>
        
      </div>
    </div>
  );
};

