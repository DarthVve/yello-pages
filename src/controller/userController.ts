import { Request, Response, NextFunction } from "express";
import { signUpValidation, loginValidation, generateToken, options, updateUserSchema } from '../utility/utils';
import User from '../model/user';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import Business from '../model/business';
const APP_ID = process.env.IDENTITY_PASS_APP_ID as string;
const API_KEY = process.env.IDENTITY_PASS_API_KEY as string;
const BASE_URL = process.env.IDENTITY_PASS_BASE_URL as string;


//Create a new user
export async function signupUser(req: Request, res: Response) {
  try {
    const validation = signUpValidation.validate(req.body, options);
    if (validation.error) {
      return res.status(400).json({ Error: validation.error.details[0].message });
    }

    const usedUsername = await User.findOne({ username: req.body.username });
    if (usedUsername) {
      return res.status(409).json({ msg: "Username taken" });
    }

    const usedEmail = await User.findOne({ email: req.body.email });
    if (usedEmail) {
      return res.status(409).json({ msg: "Email has been used" });
    }

    const usedPhoneNo = await User.findOne({ email: req.body.phoneNo });
    if (usedPhoneNo) {
      return res.status(409).json({ msg: "Phonenumber has been used" });
    }

    const hashPassword = await bcrypt.hash(req.body.password, 8);
    const entry = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      email: req.body.email,
      phoneNo: req.body.phoneNo,
      role: 'user',
      password: hashPassword
    });

    return res.status(201).json({
      msg: `User created successfully. Welcome ${req.body.username}`,
      id: entry._id
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Couldn't Sign Up User ", route: '/user/register' })
  };
};


//Resends verification mail if user failed to verify at the alloted time
/*export async function resendVerificationEmail(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await User.findOne({ where: { id } });
    if (user) {
      const email = user.email;
      const passwordHash = user.password;
      const verifyContext = await bcrypt.hash(passwordHash, 8);
      const verifyToken = generateToken({ reset: verifyContext }, '1d');
      const html = emailVerificationView(id, verifyToken)

      await mailer.sendEmail(APP_EMAIL, email, "please verify your email", html);
      return res.status(200).json({ msg: 'Verification email sent' })
    }
    else {
      return res.status(404).json({ msg: 'User not found' });
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'failed to resend verification email', route: '/user/resendVerification' });
  }
};


//Verify User
export async function verifyUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await User.findOne({ where: { id: id } });

    if (user) {
      const updateVerified = await user.update({ verified: true });
      if (updateVerified) {
        return res.status(200).redirect(`${APP_URL}/login`);
      } else {
        throw new Error('failed to update user')
      }
    } else {
      return res.status(404).json({ msg: 'Verification failed: User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'failed to verify', route: '/user/verify/id' });
  }
};*/


//Login a user
export async function loginUser(req: Request, res: Response) {
  try {
    const validation = loginValidation.validate(req.body, options);
    if (validation.error) {
      return res.status(400).json({ Error: validation.error.details[0].message });
    }

    const user = await User.findOne({ email: req.body.email });
    const business = await Business.findOne({ email: req.body.email });
    if (!user && !business) { return res.status(404).json({ msg: 'User not found' }) };

    if (user) {
      const validPass = await bcrypt.compare(req.body.password, user.password);

      if (!validPass) {
        res.status(401).json({ msg: "Invalid email or password" });
      } else {
        if (user.verified == false) {
          return res.status(401).json({ msg: 'Your account has not been verified' });
        }

        const userInfo = {
          id: user._id,
          email: user.email,
          firstname: user.firstName,
          lastname: user.lastName,
          username: user.username,
          phoneNo: user.phoneNo,
          role: user.role,
          kyc: user.kyc
        };

        const token = generateToken({ id: user._id });
        const production = process.env.NODE_ENV === "production";

        return res.status(200).cookie("token", token, {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: production,
          sameSite: production ? "none" : "lax"
        }).json({
          msg: `Welcome to Yello Pages ${user.username}`,
          userInfo
        })
      };

    } else if (business) {
      const validPass = await bcrypt.compare(req.body.password, business.password);

      if (!validPass) {
        res.status(401).json({ msg: "Invalid email or password" });
      } else {
        if (business.verified == false) {
          return res.status(401).json({ msg: 'Your account has not been verified' });
        }

        const businessInfo = {
          id: business._id,
          logo: business.logo,
          name: business.name,
          email: business.email,
          website: business.website,
          address: business.address,
          phoneNo: business.phones,
          socialMedia: business.socialMedia,
          services: business.services,
          rating: business.rating,
          noOfRatings: business.noOfRatings,
          verified: business.verified,
          cacVerified: business.cacVerified,
        };

        const token = generateToken({ id: business._id });
        const production = process.env.NODE_ENV === "production";

        return res.status(200).cookie("token", token, {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: production,
          sameSite: production ? "none" : "lax"
        }).json({
          msg: `Welcome to Yello Pages ${business.name}`,
          businessInfo
        })
      };
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ msg: "Failed to Login", route: '/login' })
  }
};


//Password Reset, Sends an email
/*export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body
    const user = await User.findOne({ where: { email: email } }) as unknown as { [key: string]: string } as any

    if (user) {
      const id = user.getDataValue('id');
      const resetContext = await bcrypt.hash(user.getDataValue('password'), 8);
      const resetToken = generateToken({ reset: resetContext }, '10m');
      const html = passwordMailTemplate(id, resetToken);
      await mailer.sendEmail(APP_EMAIL, email, "New Account Password", html);
      return res.status(200).json({ msg: "email for password reset sent" });
    } else {
      return res.status(404).json({ msg: "Invalid Email Address, User Not Found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to send password', route: '/user/forgetPassword' });
  }
};


//Creates a token for authentication, redirects to reset form
export async function setResetToken(req: Request, res: Response) {
  try {
    const { token } = req.body;
    const { id } = req.params;
    const production = process.env.NODE_ENV === "production";
    res.cookie('reset', token, {
      maxAge: 10 * 60 * 1000,
      httpOnly: true,
      secure: production,
      sameSite: production ? "none" : "lax"
    }).redirect(`${APP_URL}/forgotPassword/update/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to set reset token', route: '/user/resetPassword' });
  }
};*/


//User password update
export async function resetPassword(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { password } = req.body
    const user = await User.findOne({ id: id })
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
export async function updateUsers(req: Request, res: Response) {
  try {
    const validationResult = updateUserSchema.validate(req.body, options);
    if (validationResult.error) {
      return res.status(400).json({ msg: validationResult.error.details[0].message });
    }

    const { id } = req.params
    const record = await User.findOne({ _id: id });
    if (!record || id !== req.user) {
      return res.status(404).json({ msg: "User not found" })
    }

    let avatar: string | undefined = undefined, temp: string = '';
    if (req.body.avatar) {
      const previousValue = record.avatar;

      if (!!previousValue) { temp = previousValue };
      avatar = req.body.avatar;
      //avatar = await uploadImg(req.body.avatar) as string;
      if (!avatar) { throw new Error('Avatar failed to upload') };
    }

    const { firstName, lastName, phoneNo } = req.body;

    const usedPhoneNo = await User.findOne({ phoneNo: phoneNo });
    if (usedPhoneNo) {
      return res.status(400).json({ msg: 'Phone number already in use' });
    }

    await record.updateOne({
      firstName,
      lastName,
      phoneNo,
      avatar
    });

    //if (temp) { await deleteImg(temp) };

    return res.status(200).json({
      msg: "You have successfully updated your profile",
      firstName,
      lastName,
      phoneNo,
      avatar: record.avatar
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "failed to update", route: "/user/update/:id" });
  }
};


//Logout User
export async function logoutUser(req: Request, res: Response) {
  try {
    res.clearCookie('token');
    res.clearCookie('sessionCode')
    res.status(200).json({ msg: 'You have successfully logged out' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'failed to logout', route: '/user/logout' });
  }
};


//User Verification, KYC
export async function verifyUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id });
    if (!user) { return res.status(404).json({ msg: 'User not found' }) };
    const { BVN, NIN, DLNo, IPNo } = req.body;

    if (BVN) {
      const data = { number: "54651333604" };
      const bvnVerify = await axios.post(`${BASE_URL}/api/v2/biometrics/merchant/data/verification/bvn`, data, {
        headers: {
          'x-api-key': API_KEY,
          'app-id': APP_ID
        }
      })

      if (bvnVerify.data.status === true && bvnVerify.data.detail === 'Verification Successful') {
        await user.updateOne({
          kyc: true
        });
        return res.status(200).json({ msg: 'BVN Verifcation Successful, User is now Verified' });
      } else {
        return res.status(406).json({ msg: 'BVN Verification Failed' });
      }
    };

    if (NIN) {
      const testImage = "https://asset.cloudinary.com/dh3i1wodq/089761016db6dab086ca450bf2465898"
      const data = { image: testImage };
      const ninVerify = await axios.post(`${BASE_URL}/api/v2/biometrics/merchant/data/verification/nin/image`, data, {
        headers: {
          'x-api-key': API_KEY,
          'app-id': APP_ID
        }
      })

      if (ninVerify.data.status === true && ninVerify.data.detail === 'Verification Successful') {
        await user.updateOne({
          kyc: true
        });
        return res.status(200).json({ msg: 'NIN Verifcation Successful, User is now Verified' });
      } else {
        return res.status(406).json({ msg: 'NIN Verification Failed' });
      }
    };

    if (DLNo) {
      const data = { number: 'AAD23208212298', dob: '1999-12-21' };
      const dlVerify = await axios.post(`${BASE_URL}/api/v1/biometrics/merchant/data/verification/drivers_license`, data, {
        headers: {
          'x-api-key': API_KEY,
          'app-id': APP_ID
        }
      })

      if (dlVerify.data.status === true && dlVerify.data.detail === 'DL Verification Successful') {
        await user.updateOne({
          kyc: true
        });
        return res.status(200).json({ msg: 'Drivers License Verifcation Successful, User is now Verified' });
      } else {
        res.status(406).json({ msg: 'Drivers License Verification Failed' });
      }
    };

    if (IPNo) {
      const data = { number: 'A00400000', first_name: "test", last_name: 'test', dob: '1999-12-21' };
      const ipVerify = await axios.post(`${BASE_URL}/api/v1/biometrics/merchant/data/verification/national_passport`, data, {
        headers: {
          'x-api-key': API_KEY,
          'app-id': APP_ID
        }
      })

      if (ipVerify.data.status === true && ipVerify.data.detail === 'Verification Successfull') {
        await user.updateOne({
          kyc: true
        });
        return res.status(200).json({ msg: 'International Passport Verifcation Successful, User is now Verified' });
      } else {
        res.status(406).json({ msg: 'International Passport Verification Failed' });
      }

    };
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'failed to verify user', route: '/user/verify' });
  }
};
