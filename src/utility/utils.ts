import Joi from 'joi';
import jwt from 'jsonwebtoken';


//Joi validation options
export const options = {
  abortEarly: false,
  errors: {
    wrap: {
      label: '',
    },
  },
};


//Token Generator function for login sessions
export const generateToken = (user: { [key: string]: unknown }, time: string = '7d'): unknown => {
  const pass = `${process.env.JWT_SECRET}` as string;
  return jwt.sign(user, pass, { expiresIn: time });
};


/* SCHEMAS */
//User Sign Up Schema
export const signUpValidation = Joi.object().keys({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneNo: Joi.string().regex(/^[0-9]{11}$/).required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
}).with('password', 'confirmPassword');


//User Sign In Schema
export const loginValidation = Joi.object().keys({
  email: Joi.string().trim().required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()
});


//update User profile
export const updateUserSchema = Joi.object().keys({
  firstName: Joi.string(),
  lastName: Joi.string(),
  phoneNo: Joi.string().regex(/^[a-zA-Z0-9]{11}$/),
  avatar: Joi.string()
});
