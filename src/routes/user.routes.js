//is file ko ham isliye banayenge taki user se related saare routes ko is file me define kar sakein aur phir is file ko ham apne main app.js file me import karke use kar sakein
import { Router } from "express";
import {
    loginUser, registerUser, logOutuser, refreshAccessToken,
    changecurrentpassword, getCurrentUserDetails, updateAccountDetails,
    updateuserAvatar, updateusercoverImage, getUserchannelProfile,
    getWatchHistory
}
    from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([       // ye multer middleware hai jo file uploads ko handle karega aur avatar aur cover image ke liye alag alag fields define karega
        { name: "avatar", maxCount: 1 },// aur ye fields ke naam hai jo frontend se aayenge aur maxCount se hum ye define kar rahe hain ki ek field me maximum kitni files upload ho sakti hain
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logOutuser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changecurrentpassword);
router.route("/me").get(verifyJWT, getCurrentUserDetails);
router.route("/update-account").put(verifyJWT, updateAccountDetails);

router.route("/update-avatar").put(verifyJWT, upload.single("avatar"), updateuserAvatar);
router.route("/update-cover").put(verifyJWT, upload.single("coverImage"), updateusercoverImage);

router.route("/channel/:username").get(getUserchannelProfile);
router.route("/watch-history").get(verifyJWT, getWatchHistory);

export default router