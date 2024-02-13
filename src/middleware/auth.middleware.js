import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"


export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    // console.log(token);
    if (!token) {
      throw new ApiError(401, "Unauthorized request")
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id).select("-password")

    if (!user) {
      throw new ApiError(401, "Invalid Access Token")
    }

    req.user = user;
    next()
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")
  }

})

export const isAdmin = asyncHandler(async (req, res, next) => {
  try {
    // Ensure authentication middleware precedes this middleware
    if (!req.user) {
      throw new ApiError(401, "Unauthorized request: Access token required");
    }

    // Check for a dedicated "isAdmin" field in the user object
    if (req.user.userType !== 'ADMIN') {
      throw new ApiError(403, "Forbidden: Only admins can create orders");
    }

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access")
  }
});