import { Request, Response } from "express";
import Issue from "../model/issue";
import User from "../model/user";
import { issueValidator, options } from "../utility/utils";

//get issues
export const getIssues = async (req: Request, res: Response) => {
  try {
    let issues: typeof Issue[] = [];
    if (req.business) {
      issues = await Issue.find({ business: req.business });
    } else if (req.user) { 
      const user = await User.findById(req.user);
      if (!user) {
        return res.status(403).json({
          message: "Not authorized to view issues",
        });

      }
      if (user.role === "admin") {
        issues = await Issue.find();
      } else {
        issues = await Issue.find({ user: req.user });
      }
    }
    return res.status(200).json({
      message: "Issues retrieved successfully",
      issues,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//get issue
export const getIssue = async (req: Request, res: Response) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    if (req.business && issue.business.toString() !== req.business) {
      return res.status(403).json({
        message: "Not authorized to view issue",
      });
    }

    const user = await User.findById(req.user);
    if ((!user || user.role !== "admin") && issue.user.toString() !== req.user) {
      return res.status(403).json({
        message: "Not authorized to view issue",
      });
    }

    return res.status(200).json({
      message: "Issue retrieved successfully",
      issue,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


//create issue
export async function openIssue(
  req: Request,
  res: Response
) {
  try {
    const validationResult = issueValidator.validate(req.body, options);
    if (validationResult.error) {
      return res.status(400).json({
        message: validationResult.error.details[0].message,
      });
    }
    
    const { title, description, attachments, business } = req.body;
    const user = req.user;
    const issue = await Issue.create({
      title,
      description,
      attachments,
      user,
      business
    });
    
    if (!issue) {
      return res.status(400).json({
        message: "Issue not created",
      });
    }

    return res.status(201).json({
      message: "Issue created successfully",
      issue
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}


//update issue
export async function updateIssue(
  req: Request,
  res: Response
) {
  try {
    const { status, attachments } = req.body;
    const issue = await Issue.findByIdAndUpdate(req.params.id, {
      status,
      attachments
    }, { new: true });
    
    if (!issue) {
      return res.status(400).json({
        message: "Issue not updated",
      });
    }

    return res.status(200).json({
      message: "Issue updated successfully",
      issue
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
