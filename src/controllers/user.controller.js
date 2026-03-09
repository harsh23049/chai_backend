import { asyncHandler } from '../utils/asyncHandler.js';
import { APIerror } from '../utils/APIerror.js';
import { User } from '../models/user.model.js';
import { uploadImage } from '../utils/cloudinary.js';
import { APIResponse } from '../utils/APIresponse.js';
import { use } from 'react';
// const registerUser = asyncHandler(async(req, res) => {
//     return res.status(200).json({
//         message: "ok"
//     })
// })

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false }) // ye isliye kiya hai taki user save karte time password ko dobara hash na kare kyonki password hamare user model me pre save hook me hash ho raha hai aur agar hum user.save() karenge to password dobara hash ho jayega aur user ke login hone me problem aayegi isliye validateBeforeSave=false use kiya hai taki pre save hook skip ho jaye aur password dobara hash na ho
        return { accessToken, refreshToken }
    }
    catch (error) {
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
    
});


export {
    registerUser,
    loginUser,
    logOutuser
};