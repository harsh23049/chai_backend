import { asyncHandler } from "../utils/asyncHandler.js";
import { APIerror } from "../utils/APIerror.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"; 
//summary in this file: ye middleware hai jo hamare protected routes ko protect karega aur 
// ensure karega ki sirf authenticated users hi un routes ko access kar sakein 
// ye middleware har request ke sath chalega aur check karega ki kya request me valid JWT token hai ya nahi
export const verifyJWT = asyncHandler(async(req,res, next)=>{
    try {
        const token = req.cookies?.accessToken || req.headers(authorization)?.replace("Bearer", "")
    
        if(!token){
            throw new APIerror(401, "Unauthorized, token not found")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // decoded token me user ki kuch information hoti hai jo hamne token 
        // generate karte waqt payload me store ki thi jaise 
        // ki user id, email, username, fullname etc
        // ab ham decoded token me se user id nikal ke database me check
        //  karenge ki kya aisa user exist karta hai ya nahi
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
        if(!user){
            // discuss about frontend 
            throw new APIerror(404, "User not found/invalid access token")
        }
        req.user = user
        next()
    } catch (error) {
        throw new APIerror(402, " error?.message || Invalid token")
    }
});