import { User } from "../models/user.models.js"
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from "../utils/asyncHandler.js";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()

    await user.save({ validateBeforeSave: false })

    return { accessToken }


  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access token")
  }
}

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  console.log(email, password)

  if (!email) {
    throw new ApiError(400, "email is required")
  }

  const user = await User.findOne({
    $or: [{ email }]
  })

  if (!user) {
    throw new ApiError(404, "User does not exist")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
  }

  const { accessToken } = await generateAccessAndRefereshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, accessToken
        },
        "User logged In Successfully"
      )
    )

})

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body

  if (
    [fullName, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required")
  }

  const existedUser = await User.findOne({
    $or: [{ email }]
  })

  if (existedUser) {
    throw new ApiError(409, "User with email already exists")
  }

  const user = await User.create({
    fullName,
    email,
    password,
  })

  const createdUser = await User.findById(user._id).select(
    "-password"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }


  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered Successfully")
  )
})


export {
  registerUser,
  loginUser
}

