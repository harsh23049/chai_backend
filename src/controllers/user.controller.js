import { asyncHandler } from '../utils/asyncHandler.js';
import { APIerror } from '../utils/APIerror.js';
import { User } from '../models/user.model.js';
import { uploadImage } from '../utils/cloudinary.js';
import { APIResponse } from '../utils/APIresponse.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import jwt from 'jsonwebtoken';

// import { use } from 'react';
// const registerUser = asyncHandler(async(req, res) => {
//     return res.status(200).json({
//         message: "ok"
//     })
// })



const generateAccessAndRefreshToken = async (userId) => {
    try {
        console.log("STEP 1: userId =", userId)

        const user = await User.findById(userId)
        console.log("STEP 2: user =", user)

        if (!user) {
            throw new APIerror(404, "User not found")
        }

        const accessToken = user.generateAccessToken()
        console.log("STEP 3: access token generated")

        const refreshToken = user.generateRefreshToken()
        console.log("STEP 4: refresh token generated")

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        console.log("STEP 5: user saved")

        return { accessToken, refreshToken }

    } catch (error) {
        console.error("❌ REAL ERROR:", error)
        throw new APIerror(500, "something went wrong while generating access and refresh token")
    }
};
const registerUser = asyncHandler(async (req, res) => {
    //1st step: get user details from frontend(postman)
    const { username, email, fullname, password } = req.body
    // console.log("email:", email); // ye check karne ke liye ki frontend se email field sahi se aa rahi hai ya nahi aur req.body me store ho rahi hai ya nahi
    // console.log("username:", username); // ye check karne ke liye ki frontend se username field sahi se aa rahi hai ya nahi aur req.body me store ho rahi hai ya nahi
    // console.log("fullname:", fullname); // ye check karne ke liye ki frontend se fullname field sahi se aa rahi hai ya nahi aur req.body me store ho rahi hai ya nahi
    // console.log("password:", password); // ye check karne ke liye ki frontend se password field sahi se aa rahi hai ya nahi aur req.body me store ho rahi hai ya nahi


    //2nd step: validate the user details
    if (!username || !email || !fullname || !password) {
        throw new APIerror(400, "All fields are required")
    }


    //3rd step: check if user already exists in database(using email or username)
    const existedUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existedUser) {
        throw new APIerror(400, "User already exists with this email or username")
    }
    console.log(req.files); // ye check karne ke liye ki multer middleware sahi se kaam kar raha hai ya nahi aur files ko req.files me store kar raha hai ya nahi

    //4th step: check for avatar and cover image
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath) {
        throw new APIerror(400, "Avatar is required")
    }


    //5th step: upload the url to cloudinary and get the url of the uploaded image
    const avatar = await uploadImage(avatarLocalPath)
    const coverImage = await uploadImage(coverImageLocalPath)
    // ye check karne ke liye ki cloudinary me image sahi se upload ho rahi hai ya nahi aur hame url mil raha hai ya nahi
    if (!avatar || !coverImage) {
        throw new APIerror(500, "Error uploading images to cloudinary")
    }


    //6th step: create user object and save to database
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullname,
        password,
        avatar: avatar.secure_url,
        coverImage: coverImage.secure_url || ""
    })




    //8th step: reomve password and refresh token feild from the response
    const createdUser = await User.findById(user._id).select("-password -refreshtoken")

    //7th step: send response to frontend
    // res.status(201).json(new APIResponse(201, "User registered successfully", {
    //     user: createdUser
    // }))

    //9th step: check for the user creation and 
    if (!createdUser) {
        throw new APIerror(500, "Error creating user")
    }


    //10th step:send appropriate response to frontend
    return res.status(201).json(new APIResponse(201, "User registered successfully", {
        user: createdUser
    }))
});

const loginUser = asyncHandler(async (req, res) => {
    //todos in this loginUser controller:
    //1st step: get user details from frontend(postman)
    const { email, username, password } = req.body

    //2nd step: validate the user details
    if (!email && !username) {
        throw new APIerror(400, "Email or username is required")
    }
    if (!password) {
        throw new APIerror(400, "Password is required")
    }

    //3rd step: check if user exists in database(using email or username)
    const user = await User.findOne({ $or: [{ email }, { username }] })
    if (!user) {
        throw new APIerror(404, "User not found with this email or username")
    }

    //4th step: check if password is correct
    const isPasswordvalid = await user.isPasswordcorrect(password)
    if (!isPasswordvalid) {
        throw new APIerror(401, "Invalid password")
    }

    //5th step: generate access token and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    //6th step: save refresh token in database
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    //7th step: send response to frontend(with access token and refresh token)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")  // ye check karne ke liye ki password aur refresh token response me nahi aa rahe hain kyonki ye dono sensitive information hain aur hame inhe response me nahi bhejna chahiye security reasons ke liye


    const options={
        httpOnly:true, // ye isliye kiya hai taki client side javascript in cookies ko access na kar sake security reasons ke liye
        secure:true,
        sameSite:"none", // ye isliye kiya hai taki cross site requests me bhi cookies send ho sake kyonki hamara frontend aur backend alag alag domains me hain isliye sameSite none use kiya hai
    }
    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new APIResponse(
                200,
                {
                    user: loggedInUser,accessToken ,
                    refreshToken
                },
                "user logged in successfully"
            )
        )
});

const logOutuser = asyncHandler(async(req,res)=>{
    User.findByIdAndUpdate(
        req.user._id, 
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        })
    res.clearCookie("refreshToken")
    res.clearCookie("accessToken")
    return res.status(200).json(new APIResponse(200, null, "User logged out successfully"))
});

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken||req.body.refreshToken

    if(!incomingRefreshToken){
        throw new APIerror(401,"unauthorized, refresh token not found")
    }
try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new APIerror(401,"invalid refresh token")
        }
        if(incomingRefreshToken!==user?.refreshToken){
            throw new APIerror(401,"refresh token is expired or used")
        }
        const { accessToken, newrefreshToken } = await generateAccessAndRefreshToken(user._id)
    
        return res
            .status(200)
            .cookie("refreshToken", newrefreshToken)
            .cookie("accessToken", accessToken)
            .json(
                new APIResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newrefreshToken
                    },
                    "Access token refreshed successfully"
                )
            )
} catch (error) {
    throw new APIerror(401,error?.message||"invalid refresh token")
}
});

const changecurrentpassword = asyncHandler(async(req,res)=>{
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordcorrect = await user.isPasswordcorrect(oldPassword)
    if(!isPasswordcorrect){
        throw new APIerror(401,"old password is incorrect")
    }
    user.password=newPassword
    await user.save({ validateBeforeSave: false })
    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                {},
                "Password changed successfully"
            )
        )
});

const getCurrentUserDetails = asyncHandler(async(req,res)=>{
    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                {
                    user: req.user
                },
                "Current user details fetched successfully"
            )
        )   
});

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullname, email} = req.body

    if(!fullname || !email){
        throw new APIerror(400, "fullname and email are required")
    }
    const user = await User.findByIdAndUpdate(requser?._id,
        {
            $set:{
                fullname:fullname,
                email:email
            }
        },
        {new:true}
    ).select("-password ")
    return res
        .status(200)
        .json(
            new APIResponse(
                200,
                {
                    user
                },
                "Account details updated successfully"
            )
        )
});

const updateuserAvatar = asynchandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path
    if(!avatarLocalPath){
        throw new APIerror(400,"Avatar image is required")
    }

    const avatar = await uploadImage(avatarLocalPath)
    if(!avatar){
        throw new APIerror(500, "error while uploading avatar on cloudinary")
    }

    const user = await user.findByIdAndUpdate(req.user?._id
        ,{
            $set:{
                avatar:avatar.url
            }
        },
        {new :true}
    ).select("-password")

    return res
        .status(200)
        .json(
            new APIResponse(
                200, user, "user avatar updated succesfully"
            )
        )
})


const updateusercoverImage = asynchandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path
    if(!coverImageLocalPath){
        throw new APIerror(400,"Cover image is missing")
    }

    const coverImage = await uploadImage(coverImageLocalPath)
    if(!coverImage){
        throw new APIerror(500, "error while uploading cover image on cloudinary")
    }

    const user = await user.findByIdAndUpdate(req.user?._id
        ,{
            $set:{
                coverImage:coverImage.url
            }
        },
        {new :true}
    ).select("-password")

    return res
        .status(200)
        .json(
            new APIResponse(
                200, user, "user cover image updated succesfully"
            )
        )
})


export {
    registerUser,
    loginUser,
    logOutuser,
    refreshAccessToken,
    changecurrentpassword,
    getCurrentUserDetails,
    updateAccountDetails,
    updateuserAvatar,
    updateusercoverImage
};