import { asyncHandler } from '../utils/asynchandler.js'
import { Users } from "../models/user.models.js";
import { apierror } from "../utils/apierror.js";
import { uploadatCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiresponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";



const generateAccessandRefreshToken = async(userId) => {

  try {
    
    const user = await Users.findById(userId)
    const refreshToken = user.generateRefreshToken()
    const accesstoken = user.generateAccessToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return {refreshToken, accesstoken};

  } catch (error) {
    
    throw new apierror(500, "Some error occured!!")
  }

}


// Steps for registering user

// take input
// put validation - not empty
// checking for already existing users: email, username
// check for images and avatar
// store it in cloudinary
// successfully checking on cloudinary
// create user object - create entry in db
// remove password
// check for user creation
// return response



const registerUser = asyncHandler( async(req,res) => {
  /* other two are err,next*/

  //  res.status(200).json({
  //     message: "first step done"
  // })

  const { fullName, email, username, password } = req.body;
  console.log("email: ", email);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new apierror(400, "Please fill all fields");
  }

  const existedUser = await Users.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new apierror(409, "User existed");
  }

  // checking for avatar

  // let path = "";
  // if (
  //   req.files &&
  //   req.files.avatar &&
  //   req.files.avatar[0] &&
  //   req.files.avatar[0].path
  // ) {
  //   path = req.files.avatar[0].path;
  // }

  // const avatarPathLocal = req.files?.avatar[0]?.path; 
  const avatarPathLocal = req.files?.avatar?.[0]?.path;// another way of writing above if else code

  // const coverImagePathLocal = req?.files.coverImage[0]?.path;

  // let coverImageLocalPath;
  // if (
  //   req.files &&
  //   Array.isArray(req.files.coverImage) &&
  //   req.files.coverImage.length > 0
  // ) {
  //   coverImageLocalPath = req.files.coverImage[0].path;
  // }


  let coverImageLocalPath;
  if (req.files?.coverImage?.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // Debugging log
  // console.log("Uploaded files:", req.files);

  if (!avatarPathLocal) {
    // console.log("Avatar not provided:", req.files);
    throw new apierror(400, "Avatar is compulsory");
  }

  const avatar = await uploadatCloudinary(avatarPathLocal);
  const coverImage = await uploadatCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new apierror(400, "Avatar is compulsory");
  }

  const user = await Users.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await Users.findById(user._id).select(
    "-password -refreshToken "
  );

  if (!createdUser) {
    throw new apierror(500, "Registration not successful");
  }

  // return res
  //   .status(201)
  //   .json(new ApiResponse(200, createdUser, "Successfull registraion")
  // );


  return res.status(201).json(
    new ApiResponse(
      201, // Correct status code
      createdUser, // Pass user data in `data`
      "Successful registration" // Correct message
    )
  );


})



// Steps for login a user 

// Check for id, password
// find the user
// If correct then give the access to user else diplay error message
// take data from req body 
// give them refresh token and access token 
// if times up check for refresh token and give new access token
// send cookies



const loginUser = asyncHandler(async (req,res) => {

  const {username,email,password} = req.body


  if (!username || !email) {
    throw new apierror(400, "Username or email not found!!");
  }

  const user = await Users.findOne({
    $or: [{username}, {email}]
  })
  

  if(!user){
    throw new apierror(404, "User not found!!")
  }


  const isPasswordVaild = await user.isPasswordCorrect(password)

  if (!isPasswordVaild) {
    throw new apierror(401, "Password not correct!!");
  }

})


export {registerUser}




 
