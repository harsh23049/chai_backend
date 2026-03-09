import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
//ye user schema hai
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true,lowercase:true,index:true },
    email: { type: String, required: true, unique: true,trim:true,lowercase:true },
    fullname:{ type: String, required: true, trim: true ,  index:true},
    avatar: { type: String, default: "" },  //using cloudinary for image hosting
    coverImage: { type: String, default: "" },
    watchhistory: [{type:Schema.Types.ObjectId,ref: "Video", default: []}],
    password: { type: String, required: [true, 'Password is required'] },
    createdAt: { type: Date, default: Date.now },
    refreshToken: { type: String, default: "" }    
}, {
    timestamps: true
});
// password ko hash krne k liye ye pre save hook hai
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});
// password check krne k liye ye method hai
userSchema.methods.isPasswordcorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};
// ye methods JWT token generate krne k liye hain
// aur payload me user ki kuch info store krte hain
// jo hum authentication k liye use karenge
userSchema.methods.generateAccessToken = function() {
    return jwt.sign({
        _id: this._id, //id hamare database me har user ka unique id hota hai jo ki automatically generate hota hai jab hum naya user create karte hain
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY  
    })
}
// ye methosd refresh token generate krne k liye hai
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign({
    _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY  
    })
}
//User and user diff hai kyonki user hamara model hai aur User hamara collection hai database me
// User is liye banaya hai taki ham apne database me user collection create kar sake aur usme user ke details store kar sake
export const User = mongoose.model("User", userSchema);