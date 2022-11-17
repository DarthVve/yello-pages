import { Request, Response } from "express";
import { Types } from "mongoose";
import Business from "../model/business";
import Rating from "../model/ratings";
import User from "../model/user";
import { BusinessRating, businessSchema, changePhonesValidation, changeRepsValidation, changeServicesValidation, changeSocialMediaValidation, options, updateBusinessSchema } from "../utility/utils";
import bcrypt from 'bcryptjs';
import axios from 'axios';
const APP_ID = process.env.IDENTITY_PASS_APP_ID as string;
const API_KEY = process.env.IDENTITY_PASS_API_KEY as string;
const BASE_URL = process.env.IDENTITY_PASS_BASE_URL as string;


//search
export async function searchBusinesses(
  req: Request,
  res: Response
) {
  try {
    const { page, size } = req.query;
    const { name, services, location } = req.body;
    let limit = 10, offset = 0;
    if (page && size) {
      limit = parseInt(size as string) || 10;
      offset = ((parseInt(page as string) - 1) * limit)|| 0;
    }
    let query: any = {};
    if (name) {
      query = {
        name: { $regex: name, $options: "i" }
      }
    }
    if (services) {
      query = {
        services: { $in: services }
      }
    }
    if (location) {
      query = {
        address: { $regex: location, $options: "i" }
      };
    }
    const data = await Business.find(query).sort({ createdAt: 1 }).limit(limit).skip(offset);
    return res.status(200).json({
      message: "Businesses found",
      data
    });
  } catch (error) {
    res.status(500).json({
      message: "Unexpected error: Failed to get businesses",
    });
  }
}


//get one
export async function getBusiness(
  req: Request,
  res: Response
) {
  try {
    const { searchBy, name, phone, socialMedia, country_code } = req.body;
    let data;
    switch (searchBy) {
      case "name":
        data = await Business.findOne({ name: { $regex: name, $options: "i" } });
        if (data) {
          return res.status(200).json({
            message: "Business found",
            data
          });
        }
        break;
      case "phone":
        data = await Business.findOne({ phones: phone });
        if (data) {
          return res.status(200).json({
            message: "Business found",
            data
          });
        }
        break;
      case "social":
        const key = "socialMedia." + Object.keys(socialMedia)[0];
        const val = Object.values(socialMedia)[0];
        data = await Business.findOne({ [key]: { $regex: val } });
        if (data) {
          return res.status(200).json({
            message: "Business found",
            data
          });
        }
        break;
      default:
        data = await Business.findById(req.params.id);
        if (data) {
          return res.status(200).json({
            message: "Business found",
            data
          });
        }
    }

    //search IdentityPass api for business name
    const url = `${BASE_URL}/api/v2/biometrics/merchant/data/verification/global/company/search`
    const body = {
      "company_name": name,
      "country_code": country_code || "ng",
    }
    const idpasssearch = await axios.post(url, body, {
      headers: {
        'x-api-key': API_KEY,
        'app-id': APP_ID
      }
    })

    if (idpasssearch.data && idpasssearch.data.length) {
      return res.status(200).json({
        message: "Business found",
        data: idpasssearch.data[0]
      });
    }

    return res.status(404).json({
      message: "Business not found",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unexpected error: Failed to get business",
    });
  }
}


//create one
export async function registerBusiness(
  req: Request,
  res: Response
) {
  try {
    const validationResult = businessSchema.validate(req.body, options);
    if (validationResult.error) {
      return res.status(400).json({
        message: validationResult.error.details[0].message,
      });
    }

    const { name, email, rcNumber, website } = req.body;
    const duplicate = await Business.findOne({
      $or: [
        { name: name },
        { email: email },
        { rcNumber: rcNumber },
        { website: website }
      ]
    });

    if (duplicate) {
      return res.status(400).json({
        message: "The business name, email, rcNumber, or website is already in use",
      });
    }

    const hash = await bcrypt.hash(req.body.password, 8);
    const newBusiness = new Business({
      ...req.body,
      password: hash
    });

    const data = await newBusiness.save();
    return res.status(201).json({
      message: "Business successfully added",
      data,
    });
  } catch (err) {
    res.status(500).json({
      message: "Unexpected error: Failed to register business",
    });
  }
}


//update one
export async function updateBusiness(
  req: Request,
  res: Response
) {
  try {
    const validationResult = updateBusinessSchema.validate(req.body, options);
    if (validationResult.error) {
      return res.status(400).json({
        message: validationResult.error.details[0].message,
      });
    }

    if (req.business !== req.params.id) {
      return res.status(403).json({
        message: "Not authorized to update this business"
      })
    }

    const { name, email, rcNumber, website } = req.body;
    const duplicate = await Business.findOne({
      $or: [
        { name: name },
        { email: email },
        { rcNumber: rcNumber },
        { website: website }
      ]
    });

    if (duplicate) {
      return res.status(400).json({
        message: "The business name, email, rcNumber, or website is already in use",
      });
    }

    const data = await Business.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (data) {
      return res.status(200).json({
        message: "Business successfully updated",
        data,
      });
    } else {
      return res.status(404).json({
        message: "Business not found"
      })
    }
  } catch (err) {
    res.status(500).json({
      message: "Unexpected error: Failed to update business",
      id: req.params.id
    });
  }
}


//delete one
export async function deleteBusiness(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const record = await Business.findById(id);
    if (!record) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    if (req.business !== id) {
      return res.status(403).json({
        message: "Not authorized to delete this business",
      });
    }

    const data = await Business.deleteOne({ _id: id });
    return res.status(200).json({
      message: "Business successfully deleted",
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unexpected error: Failed to delete business",
      id: req.params.id,
    });
  }
}

//rate
export async function rateBusiness(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const record = await Business.findById(id);

    const validationResult = BusinessRating.validate(req.body, options);
    if (validationResult.error) {
      return res.status(400).json({
        message: validationResult.error.details[0].message,
      });
    }

    if (!record) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    let total, newAvg;
    const previousRating = await Rating.findOne({
      business: id,
      user: req.user
    })

    if (!previousRating) {
      const newRating = new Rating({
        business: id,
        user: req.user,
        rating
      })
      await newRating.save();
      total = record.rating * record.noOfRatings;
      newAvg = (total + rating) / (record.noOfRatings + 1);
      record.rating = newAvg;
      record.noOfRatings++;
    }
    else {
      await Rating.updateOne({
        business: id,
        user: req.user
      }, {
        rating
      })
      total = record.rating * record.noOfRatings - previousRating.rating;
      newAvg = (total + rating) / record.noOfRatings;
      record.rating = newAvg;
    }
    await record.save();
    return res.status(200).json({
      message: "Business successfully rated",
    });

  } catch (error) {
    res.status(500).json({
      message: "Unexpected error: Failed to rate business",
      id: req.params.id,
    });
  }
}

//verify business
export async function verifyBusiness(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const record = await Business.findById(id);
    if (!record) {
      return res.status(404).json({
        message: "Business not found",
      });
    }
    record.verified = true;
    await record.save();
    return res.status(200).json({
      message: "Business successfully verified",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unexpected error: Failed to verify business",
      id: req.params.id,
    });
  }
}

//add rep
export async function addRep(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const { rep } = req.body;

    const validationResult = changeRepsValidation.validate(req.body, options);
    if (validationResult.error) {
      return res.status(400).json({
        message: validationResult.error.details[0].message,
      });
    }

    if(req.business !== id) {
      return res.status(403).json({
        message: "Not authorized to add rep to this business"
      })
    }

    const record = await Business.findById(id);
    const newRep = await User.findById(rep);
    if (!record){
      return res.status(404).json({
        message: "Business not found",
      });
    }
    if (!newRep) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    record.reps.push(new Types.ObjectId(rep));
    await record.save();
    return res.status(200).json({
      message: "Rep successfully added",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unexpected error: Failed to add rep",
    });
  }
}

//remove rep
export async function removeRep(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const { rep } = req.body;

    const validationResult = changeRepsValidation.validate(req.body, options);
    if (validationResult.error) {
      return res.status(400).json({
        message: validationResult.error.details[0].message,
      });
    }

    if(req.business !== id) {
      return res.status(403).json({
        message: "Not authorized to remove rep from this business"
      })
    }

    const record = await Business.findById(id);
    if (!record){
      return res.status(404).json({
        message: "Business not found",
      });
    }
    record.reps.forEach((user, i) => {
      if(String(user) === rep) {
        record.reps.splice(i, 1);
      }
    })
    await record.save();
    return res.status(200).json({
      message: "Rep successfully removed",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unexpected error: Failed to remove rep",
    });
  }
}

//add phone
export async function addPhone(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const { phone } = req.body;

    const validationResult = changePhonesValidation.validate(req.body, options);
    if (validationResult.error) {
      return res.status(400).json({
        message: validationResult.error.details[0].message,
      });
    }

    if(req.business !== id) {
      return res.status(403).json({
        message: "Not authorized to add phone no. to this business"
      })
    }


    const record = await Business.findById(id);
    if (!record){
      return res.status(404).json({
        message: "Business not found",
      });
    }

    record.phones.push(phone);
    await record.save();
    return res.status(200).json({
      message: "Phone successfully added",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unexpected error: Failed to add phone",
    });
  }
}

//remove phone
export async function removePhone(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const { phone } = req.body;

    const validationResult = changePhonesValidation.validate(req.body, options);
    if (validationResult.error) {
      return res.status(400).json({
        message: validationResult.error.details[0].message,
      });
    }

    if(req.business !== id) {
      return res.status(403).json({
        message: "Not authorized to remove phone no. from this business"
      })
    }

    const record = await Business.findById(id);
    if (!record){
      return res.status(404).json({
        message: "Business not found",
      });
    }

    record.phones.forEach((num, i) => {
      if(phone === num) {
        record.reps.splice(i, 1);
      }
    })
    if(!record.phones.length) {
      return res.status(400).json({
        message: "Business must have at least one phone number",
      });
    }

    await record.save();

    return res.status(200).json({
      message: "Phone successfully removed",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unexpected error: Failed to remove phone",
    });
  }
}

//add service
export async function addService(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const { service } = req.body;

    const validationResult = changeServicesValidation.validate(req.body, options);
    if (validationResult.error) {
      return res.status(400).json({
        message: validationResult.error.details[0].message,
      });
    }

    if(req.business !== id) {
      return res.status(403).json({
        message: "Not authorized to add service to this business"
      })
    }

    const record = await Business.findById(id);
    if (!record){
      return res.status(404).json({
        message: "Business not found",
      });
    }

    record.services.push(service);
    await record.save();
    return res.status(200).json({
      message: "Service successfully added",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unexpected error: Failed to add service",
    });
  }
}

//remove service
export async function removeService(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const { service } = req.body;

    const validationResult = changeServicesValidation.validate(req.body, options);
    if (validationResult.error) {
      return res.status(400).json({
        message: validationResult.error.details[0].message,
      });
    }

    if(req.business !== id) {
      return res.status(403).json({
        message: "Not authorized to remove service from this business"
      })
    }

    const record = await Business.findById(id);
    if (!record){
      return res.status(404).json({
        message: "Business not found",
      });
    }

    record.services.forEach((serv, i) => {
      if(service === serv) {
        record.services.splice(i, 1);
      }
    })
    if(!record.services.length) {
      return res.status(400).json({
        message: "Business must have at least one service",
      });
    }

    await record.save();

    return res.status(200).json({
      message: "Service successfully removed",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unexpected error: Failed to remove service",
    });
  }
}

//add social media
export async function addSocialMedia(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const { socialMedia } = req.body;

    const validationResult = changeSocialMediaValidation.validate(req.body, options);
    if (validationResult.error) {
      return res.status(400).json({
        message: validationResult.error.details[0].message,
      });
    }

    if(req.business !== id) {
      return res.status(403).json({
        message: "Not authorized to add social media to this business"
      })
    }

    const record = await Business.findById(id)

    if (!record){
      return res.status(404).json({
        message: "Business not found",
      });
    }

    type socialPlatforms = keyof typeof record.socialMedia;
    Object.keys(socialMedia).forEach((key) => {
      record.socialMedia[key as socialPlatforms] = socialMedia[key as socialPlatforms];
    })

    await record.save();
    return res.status(200).json({
      message: "Social media successfully added",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unexpected error: Failed to add social media",
    });
  }
}

//remove social media
export async function removeSocialMedia(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;
    const { socialMedia } = req.body;

    const validationResult = changeSocialMediaValidation.validate(req.body, options);
    if (validationResult.error) {
      return res.status(400).json({
        message: validationResult.error.details[0].message,
      });
    }

    if(req.business !== id) {
      return res.status(403).json({
        message: "Not authorized to remove social media from this business"
      })
    }

    const record = await Business.findById(id)
    if (!record){
      return res.status(404).json({
        message: "Business not found",
      });
    }

    type socialPlatforms = keyof typeof record.socialMedia;
    Object.keys(socialMedia).forEach((key) => {
      delete record.socialMedia[key as socialPlatforms];
    })

    await record.save();

    return res.status(200).json({
      message: "Social media successfully removed",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unexpected error: Failed to remove social media",
    });
  }
}
