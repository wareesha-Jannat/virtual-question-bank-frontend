import * as Yup from 'yup'

//Register Schema
export const registerSchema = Yup.object({
  name : Yup.string().required("Name is required").min(2, 'Name must be at least 2 characters long'),
  email: Yup.string().required("Email is required").email("Invalid email format"),
  password:  Yup.string().required("Password is required").min(5, 'Password must be at least 5 characters long'),
  passwordConfirmation :  Yup.string().required("Confirm password is required").oneOf([Yup.ref("password")],"Passwords must match "),
})

//Login Schema
export const loginSchema = Yup.object({
    email: Yup.string().required("Email is required").email("Invalid email format"),
    password:  Yup.string().required("Password is required"),
})

//Reset Password Link Schema
export const resetPasswordLinkSchema = Yup.object({
    email: Yup.string().required("Email is required").email("Invalid email format"),
})

//Reset Password Confirm Schema
export const resetPasswordConfirmSchema = Yup.object({
    password:  Yup.string().required("Password is required").min(5, 'Password must be at least 5 characters long'),
    passwordConfirmation :  Yup.string().required("Confirm password is required").oneOf([Yup.ref("password")],"Passwords must match ")
})

//Change Password Schema
export const changePasswordSchema = Yup.object({
    
    oldPassword:  Yup.string().required("Old Password is required"),
    newPassword :  Yup.string().required("New password is required").notOneOf([Yup.ref("oldPassword")],"New Password must be different from old password "),
    passwordConfirmation :  Yup.string().required("Confirm password is required").oneOf([Yup.ref("newPassword")],"Password and confirm password must match ")
})
