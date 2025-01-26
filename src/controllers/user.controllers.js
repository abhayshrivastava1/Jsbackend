import { asyncHandler } from '../utils/asynchandler.js'
import { Users } from "../models/user.models.js";
import { apierror } from "../utils/apierror.js";
import { uploadatCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiresponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const registerUser = asyncHandler( async(req,res) => {
  //  res.status(200).json({
  //     message: "first step done"
  // })




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




  

  const { fullname, email, username, password } = req.body;
  console.log("email: ", email);

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new apierror(400, "Please fill all fields")
  }

  const existedUser = await Users.findOne({
    $or: [{ username }, { email }],
  })

  if (existedUser) {
    throw new apierror(409, "User existed")
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

  const avatarPathLocal = req.files?.avatar[0]?.path; // another way of writing above if else code

  // const coverImagePathLocal = req?.files.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarPathLocal) {
    console.log("Avatar not provided:", req.files);
    throw new apierror(400, "Avatar is compulsory");
  }

  const avatar = await uploadatCloudinary(avatarPathLocal);
  const coverImage = await uploadatCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new apierror(400, "Avatar is compulsory");
  }

  const user = await Users.create({
    fullname,
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

  return res.status(201).json(
    new ApiResponse(200, createdUser, "Successfull registraion")
  )


})
/* other two are err,next*/

export {registerUser}




 
