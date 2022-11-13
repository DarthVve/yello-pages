import User from "../model/user";
import Business from "../model/business";
import Issue from "../model/issue";
import { Types } from "mongoose";

const ROOT_ADMIN_EMAIL = process.env.ROOT_ADMIN_EMAIL as string;
const ROOT_ADMIN_PASSWORD = process.env.ROOT_ADMIN_PASSWORD as string;
const ROOT_ADMIN_FIRST_NAME = process.env.ROOT_ADMIN_FIRST_NAME as string;
const ROOT_ADMIN_LAST_NAME = process.env.ROOT_ADMIN_LAST_NAME as string;
const ROOT_ADMIN_PHONE = process.env.ROOT_ADMIN_PHONE as string;

export async function seedAdmin() {
  const seed = new User({
    firstName: ROOT_ADMIN_FIRST_NAME,
    lastName: ROOT_ADMIN_LAST_NAME,
    email: ROOT_ADMIN_EMAIL,
    password: ROOT_ADMIN_PASSWORD,
    phoneNo: ROOT_ADMIN_PHONE,
    role: "admin",
    isVerified: true,
  });

  seed.save().then(() => {
    console.log('Admin seeded')
  }).catch((err) => {
    console.log(err)
  });
}

export async function seedBusiness(user: Types.ObjectId) {
  try {
    const seed = await Business.create({
      name: 'FooLimited',
      services: ['bar'],
      rcNumber: 'QWERTY123',
      address: '123 Foo Street',
      email: 'example@foo.org',
      website: 'https://foo.org',
      socialMedia:
      {
        facebook: 'https://facebook.com/foo',
        twitter: 'https://twitter.com/foo',
        instagram: 'https://instagram.com/foo',
        linkedin: 'https://linkedin.com/foo',
        youtube: 'https://youtube.com/foo'
      },
      phones: ['+2341234567890', '+2341234567891'],
      verified: true,
      rep: user
    });
    console.log('Business seeded')
    await seedIssue(user, seed._id);
  } catch (err) {
    console.log(err);
  }
}

export async function seedIssue(user?: Types.ObjectId, business?: Types.ObjectId) {
  const seed = new Issue({
    title: "Test",
    description: "this is a test",
    attachments: "https://google.com",
    status: "open",
    user: user,
    business: business
  });
  await seed.save()
  console.log('Issue seeded')
}

export async function confirmSeed() {
  const admin = await User.findOne({ email: ROOT_ADMIN_EMAIL });
  if (!admin) {
    try {
      // await User.init();
      seedAdmin();
    } catch (err) {
      console.log(err);
    }
  }
  if (admin?.id) {
    try {
      // await Issue.init();
      // await Business.init();
      seedBusiness(admin.id);
    } catch (err) {
      console.log(err);
    }
  }
}
