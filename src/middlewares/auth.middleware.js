import { asyncHandler } from "../utils/asyncHandler";
import { APIerror } from "../utils/APIerror";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken"; 

export const verifyJWT = asyncHandler(async(req,res, next)=>{
    try {
        const token = req.cookies?.accessToken || req.headers(authorization)?.replace("Bearer", "")
    
        if(!token){
            throw new APIerror(401, "Unauthorized, token not found")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
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