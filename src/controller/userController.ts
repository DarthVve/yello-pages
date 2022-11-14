import { Request, Response, NextFunction } from "express";
import { signUpValidation, loginValidation, generateToken, options, updateUserSchema } from '../utility/utils';
import User from '../model/user';
import bcrypt from 'bcryptjs';

//Create a new user
export async function signupUser(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = signUpValidation.validate(req.body, options);
    if (validation.error) {
      return res.status(400).json({ Error: validation.error.details[0].message });
    }

    const usedUsername = await User.findOne({ where: { username: req.body.username } });
    if (usedUsername) {
      return res.status(409).json({ msg: "Username taken" });
    }

    const usedEmail = await User.findOne({ where: { email: req.body.email } });
    if (usedEmail) {
      return res.status(409).json({ msg: "email has been used" });
    }

    const hashPassword = await bcrypt.hash(req.body.password, 8);
    const entry = await User.create({
      firstName: req.body.fullname,
      lastName: req.body.lastname,
      email: req.body.email,
      phoneNo: req.body.phonenumber,
      role: 'user',
      password: hashPassword
    })

    return res.status(201).json({
      msg: `User created successfully. Welcome ${req.body.username}`,
      entry
    })
  } catch (err) { res.status(500).json({ msg: "Couldn't Sign Up User ", route: '/user/register' }) };
};
