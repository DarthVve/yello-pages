import User from "../model/user";

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
  seed.save().then(() =>
    console.log('Admin seeded')
  );
}

export async function confirmSeed() {
  const admin = await User.findOne({ email: ROOT_ADMIN_EMAIL });
  if (!admin) {
    seedAdmin();
  }
}
