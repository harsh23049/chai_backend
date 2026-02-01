import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
//ye user schema hai
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true,lowercase:true,index:true },
    email: { type: String, required: true, unique: true,trim:true,lowercase:true },
    fullname:{ type: String, required: true, trim: true ,  index:true},
    avatarUrl: { type: String, default: "" },  //using cloudinary for image hosting
    coverimageUrl: { type: String, default: "" },
    watchhistory: { type:Schema.Types.ObjectId, ref: "Video", default: [] },
    password: { type: String, required: [true, 'Password is required'] },
    createdAt: { type: Date, default: Date.now }    
}, {
    timestamps: true
});
// password ko hash krne k liye ye pre save hook hai
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
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
        _id: this._id,
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
export const User = mongoose.model("User", userSchema);