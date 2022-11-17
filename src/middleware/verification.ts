import { Request, Response, NextFunction } from "express";
import axios from 'axios';
const APP_ID = process.env.IDENTITY_PASS_APP_ID as string;
const API_KEY = process.env.IDENTITY_PASS_API_KEY as string;
const BASE_URL = process.env.IDENTITY_PASS_BASE_URL as string;


//verify name
export async function verifyRCNoWithName(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { rcNumber, name, country_code, company_type } = req.body;
  let url = `${BASE_URL}/api/v2/biometrics/merchant/data/verification/global/company/search`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      "app-id": APP_ID,
      "x-api-key": API_KEY,
    },
    params: {}
  };
  try {
    if (!rcNumber) {
      const response = await axios.post(
        url,
        {
          company_name: name,
          country_code: country_code || "NG",
        },
        config
      );
      if (response.data.data) {
        return res.status(400).json({
          status: "error",
          message: "Please provide your RC Number",
        });
      } else {
        return next();
      }
    }
    url = `${BASE_URL}/api/v2/biometrics/merchant/data/verification/cac`
    const response = await axios.post(
      url,
      {
        rc_number: rcNumber,
        company_type: company_type || "RC",
      },
      config
    );
    if (response.data.data) {
      if (String(response.data.data.company_name).toLowerCase() !== name.toLowerCase()) {
        return res.status(400).json({
          status: "error",
          message: "RC Number and Company Name do not match",
        });
      } else {
        return next();
      }
    } else {
      return res.status(400).json({
        status: "error",
        message: "RC Number not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: error,
    });
  }
}

//verify phones or phone
export async function verifyPhones(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { phone, phones } = req.body;
  const url = `${BASE_URL}/api/v2/biometrics/merchant/data/verification/phone_number/advance`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      "app-id": APP_ID,
      "x-api-key": API_KEY,
    },
  };
  try {
    if (phones) {
      phones.forEach(async (phone: string) => {
        const response = await axios.post(
          url,
          {
            number: phone,
          },
          config
        );
        if (!response.data.data) {
          return res.status(400).json({
            status: "error",
            message: "At least one phone number provided is invalid",
          });
        }
      });
    } else if (phone) {
      const response = await axios.post(
        url,
        {
          number: phone,
        },
        config
      );
      if (!response.data.data) {
        return res.status(400).json({
          status: "error",
          message: "Phone number provided is invalid",
        });
      }
    }
    next();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: error,
    });
  }
}

//verify email
export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email } = req.body;
  const url = `${BASE_URL}/api/v2/biometrics/merchant/data/verification/emailage`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      "app-id": APP_ID,
      "x-api-key": API_KEY,
    },
  };
  try {
    const response = await axios.post(
      url,
      {
        email: email,
      },
      config
    );
    if (!response.data.data) {
      return res.status(400).json({
        status: "error",
        message: "Email provided is invalid",
      });
    }
    return next();
  }
  catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: error,
    });
  }
}
