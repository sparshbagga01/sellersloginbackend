import bcrypt from "bcryptjs";

export const hashedPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);
    return hashedpassword;
  } catch (error) {
    return error;
  }
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};


export const generateOtp = (length = 6) => {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

const getBaseUrl = () => {
  return process.env.NODE_ENV === 'production'
    ? process.env.PROD_BASE_URL
    : process.env.DEV_BASE_URL;
};


// const pagal = await  hashedPassword("pankajverma")
// console.log("Hashed Password:", pagal);