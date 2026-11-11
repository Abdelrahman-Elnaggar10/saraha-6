import crypto from "node:crypto";
import bcrypt from "bcrypt";

export const generateOtp = () => {
    return crypto.randomInt(0, 1000000).toString().padStart(6, "0");
};

export const hashOtp = (otp) => bcrypt.hash(otp, 10);

export const compareOtp = (otp, hashedOtp) => bcrypt.compare(otp, hashedOtp);
