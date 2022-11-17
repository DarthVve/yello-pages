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

export const businessSchema = Joi.object().keys({
  name: Joi.string().required(),
  services: Joi.array().items(Joi.string()).required(),
  rcNumber: Joi.string(),
  country_code: Joi.string(),
  company_type: Joi.string(),
  address: Joi.string().required(),
  email: Joi.string().email().required(),
  website: Joi.string(),
  socialMedia: Joi.object().keys({
    facebook: Joi.string(),
    twitter: Joi.string(),
    instagram: Joi.string(),
    linkedin: Joi.string(),
    youtube: Joi.string(),
    pinterest: Joi.string(),
    snapchat: Joi.string()
  }),
  logo: Joi.string(),
  phones: Joi.array().items(Joi.string().regex(/^[0-9]{11}$/)).required(),
  password: Joi.string().regex(/^[a-zA-Z0-9!@#$%^&*()]{3,30}$/).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  reps: Joi.array().items(Joi.string())
}).with('password', 'confirmPassword');

export const updateBusinessSchema = Joi.object().keys({
  name: Joi.string(),
  services: Joi.array().items(Joi.string()),
  rcNumber: Joi.string(),
  address: Joi.string(),
  email: Joi.string().email(),
  website: Joi.string(),
  socialMedia: Joi.object().keys({
    facebook: Joi.string(),
    twitter: Joi.string(),
    instagram: Joi.string(),
    linkedin: Joi.string(),
    youtube: Joi.string(),
    pinterest: Joi.string(),
    snapchat: Joi.string()
  }),
  logo: Joi.string(),
  phones: Joi.array().items(Joi.string().regex(/^[0-9]{11}$/)),
  reps: Joi.array().items(Joi.string())
});

export const issueSchema = Joi.object().keys({
  title: Joi.string().trim(),
  description: Joi.string().trim().required(),
  attachments: Joi.array().items(Joi.string()),
  status: Joi.string().valid('open', 'closed'),
  user: Joi.string().required(),
  business: Joi.string()
});

export const updateIssueSchema = Joi.object().keys({
  status: Joi.string().valid('open', 'closed'),
  attachments: Joi.array().items(Joi.string())
});

export const BusinessRating = Joi.object().keys({
  rating: Joi.number().min(0).max(100).required(),
});

export const changePhonesValidation = Joi.object().keys({
  phone: Joi.string().regex(/^[0-9]{11}$/).required(),
});

export const changeRepsValidation = Joi.object().keys({
  rep: Joi.string().required(),
});

export const changeServicesValidation = Joi.object().keys({
  service: Joi.string().required(),
});

export const changeSocialMediaValidation = Joi.object().keys({
  facebook: Joi.string(),
  twitter: Joi.string(),
  instagram: Joi.string(),
  linkedin: Joi.string(),
  youtube: Joi.string(),
  pinterest: Joi.string(),
  snapchat: Joi.string(),
  other: Joi.array().items(Joi.object({
    name: Joi.string(),
    link: Joi.string()
  }))
});

export const issueValidator = Joi.object().keys({
  title: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  attachments: Joi.array().items(Joi.string()),
  user: Joi.string().required(),
  business: Joi.string()
}); 


