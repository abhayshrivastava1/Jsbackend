import { asyncHandler } from "../utils/asynchandler.js";
import { Users } from "../models/user.models.js";
import { apierror } from "../utils/apierror.js";
import { uploadatCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiresponse.js";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await Users.findById(userId);
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new apierror(500, "Some error occured!!");
  }
};

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

const registerUser = asyncHandler(async (req, res) => {
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
  const avatarPathLocal = req.files?.avatar?.[0]?.path; // another way of writing above if else code

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
});

// Steps for login a user

// Check for id, password
// find the user
// If correct then give the access to user else diplay error message
// take data from req body
// give them refresh token and access token
// if times up check for refresh token and give new access token
// send cookies

// const loginUser = asyncHandler(async (req,res) => {

//   console.log(" Login function hit!");

//   const {username,email,password} = req.body;

//   console.log("Login request received for:", { username, email });

//   if (!username && !email) {
//     throw new apierror(400, "Username or email not found!!");
//   }

//   const user = await Users.findOne({
//     $or: [{username}, {email}]
//   })

//   if(!user){
//     throw new apierror(404, "User not found!!")
//   }

//   const isPasswordVaild = await user.isPasswordCorrect(password)

//   if (!isPasswordVaild) {
//     throw new apierror(401, "Password not correct!!");
//   }

//   const {accessToken,refreshToken} = await generateAccessandRefreshToken(user._id)

//   const loggedUser = await Users.findById(user._id).select(
//     "-password -refreshToken"
//   );

//   const options = {
//     httpOnly: true,
//     secure: true

//   }

//   return res
//   .status(200)
//   .cookie("accessToken", accessToken, options)
//   .cookie("refreshToken", refreshToken, options)
//   .json(
//     new ApiResponse(
//       200,
//       {
//         user: loggedUser, accessToken,refreshToken
//       },
//       "User logged in successfully"
//     )
//   )

// })

const loginUser = asyncHandler(async (req, res) => {
  console.log("Login function hit!"); // Check if function is being called
  console.log("Request Body:", req.body); // Debug request data

  const { username, email, password } = req.body;

  if (!username && !email) {
    console.log("Username or Email missing!");
    throw new apierror(400, "Username or email not found!!");
  }

  // Here is an alternative of above code based on logic in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")

  // }

  const user = await Users.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    console.log("User not found!");
    throw new apierror(404, "User not found!!");
  }

  console.log("User found:", user);

  const isPasswordValid = await user.isPasswordCorrect(password);
  console.log("Password Validity:", isPasswordValid);

  if (!isPasswordValid) {
    console.log("Incorrect password");
    throw new apierror(401, "Password not correct!!");
  }

  console.log("Generating tokens...");
  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    user._id
  );

  console.log("Login successful, sending response...");
  return res.status(200).json({
    user: {
      username: user.username,
      email: user.email,
    },
    accessToken,
    refreshToken,
    message: "Login successful",
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  await Users.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new apierror(401, "Unauthorized access");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await Users.findById(decodedToken?._id);

    if (!user) {
      throw new apierror(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new apierror(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessandRefreshToken(isSecureContext._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new apierror(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldpassword, newpassword } = req.body;

  const user = await Users.findById(req.user?._id);

  const isPasswordCorrect = await Users.isPasswordCorrect(oldpassword);

  if (!isPasswordCorrect) {
    throw new apierror(400, "Wrong password");
  }

  user.password = newpassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Changed password successfully"));
});

const getCurrUser = asyncHandler(async (req, res) => {
  return res.status(200).json(200, req.user, "User data fetched");
});

const accountUpdate = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new apierror(400, "Every field required");
  }

  const user = Users.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res.status(200).json(new apierror(200, user, "Details Updated"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarPathLocal = req.file?.path;

  if (!avatarPathLocal) {
    throw new apierror(400, "avatar is missing");
  }

  const avatar = await uploadatCloudinary(avatarPathLocal);

  if (!avatar) {
    throw new apierror(400, "Error while uploading on avatar");
  }

  const user = await Users.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar changes successfully"));
});

const updateCover = asyncHandler(async (req, res) => {
  const coverPathLocal = req.file?.path;

  if (!coverPathLocal) {
    throw new apierror(400, "cover image is missing");
  }

  const coverImage = await uploadatCloudinary(coverPathLocal);

  if (!coverImage) {
    throw new apierror(400, "Error while uploading cover image");
  }

  const user = await Users.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "image changed successfully!!"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrUser,
  accountUpdate,
  updateAvatar,
  updateCover, 
};
