import logger from "#config/logger.js"
import { signupSchema } from "../validations/auth.validation";

export const signup = async (req, res, next) => {
    try {
        const validationResult = signupSchema.safeParse(req.body);
        if(!validationResult) {
            return 
        }
    } catch (error) {
        logger.error("Signup error ", error);
        if(error.message === "User with this email already exists") {
            return res.status(409).json({
                error: "Email already exists"
            });
        }
        next(error);
    }
}