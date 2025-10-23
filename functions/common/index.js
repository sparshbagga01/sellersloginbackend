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