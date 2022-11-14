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
      username: req.body.username,
      email: req.body.email,
      phoneNo: req.body.phonenumber,
      role: 'user',
      password: hashPassword
    });

    return res.status(201).json({
      msg: `User created successfully. Welcome ${req.body.username}`,
      entry
    })
  } catch (err) { res.status(500).json({ msg: "Couldn't Sign Up User ", route: '/user/register' }) };
};


//Login a user
export async function loginUser(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = loginValidation.validate(req.body, options);
    if (validation.error) {
      return res.status(400).json({ Error: validation.error.details[0].message });
    }

    const user = await User.findOne({ where: { email: req.body.email }/*, include: [{ model: business, as: 'BUSINESSES' }]*/ }) as unknown as { [key: string]: string };

    if (!user) { return res.status(404).json({ msg: 'User not found' }) };

    const validPass = await bcrypt.compare(req.body.password, user.password);

    if (!validPass) {
      res.status(401).json({ msg: "Invalid email or password" });
    } else {
      if (user.verified == "false") {
        return res.status(401).json({ msg: 'Your account has not been verified' });
      }

      const id = user._id;
      const firstName = user.firstName;
      const lastName = user.lastNname;
      const email = user.email;
      const phoneNo = user.phoneNo;
      const role = user.role;
      const userInfo = { id, email, firstName, lastName, phoneNo, role };

      const token = generateToken({ id: user._id });
      const production = process.env.NODE_ENV === "production";

      return res.status(200).cookie("token", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: production,
        sameSite: production ? "none" : "lax"
      }).json({
        msg: 'You have successfully logged in',
        userInfo
      });
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Failed to Login", route: '/login' })
  }
};


//User password update
export async function resetPassword(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { password } = req.body
    const user = await User.findOne({ where: { id: id } })
    if (user) {
      const passwordHash = await bcrypt.hash(password, 8)
      let updatePassword = await user.update({ password: passwordHash });

      if (updatePassword) {
        return res.status(200).json({ msg: "password updated successfully" });
      } else {
        return res.status(400).json({ msg: "failed to update password" });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to reset password', route: '/user/resetPassword' });
  }
};


//User Profile Update
export async function updateUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const validationResult = updateUserSchema.validate(req.body, options);
    if (validationResult.error) {
      return res.status(400).json({ msg: validationResult.error.details[0].message });
    }

    const { id } = req.params
    const record = await User.findOne({ where: { id } })
    if (!record || id !== req.user) {
      return res.status(404).json({ msg: "User not found" })
    }

    let avatar: string | undefined = undefined, temp: string = '';
    if (req.body.avatar) {
      const previousValue = record.avatar;

      if (!!previousValue) { temp = previousValue };

      //avatar = await uploadImg(req.body.avatar) as string;
      if (!avatar) { throw new Error('Avatar failed to upload') };
    }

    const { firstname, lastname, phonenumber } = req.body;
    await record.update({
      firstname,
      lastname,
      phonenumber,
      avatar
    });

    //if (temp) { await deleteImg(temp) };

    return res.status(200).json({
      msg: "You have successfully updated your profile",
      firstname,
      lastname,
      phonenumber,
      avatar: record.avatar
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "failed to update", route: "/user/update/:id" });
  }
};


//Logout User
export async function logoutUser(req: Request, res: Response, next: NextFunction) {
  try {
    res.clearCookie('token');
    res.clearCookie('sessionCode')
    res.status(200).json({ msg: 'You have successfully logged out' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'failed to logout', route: '/user/logout' });
  }
};
