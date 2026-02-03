import multer from 'multer';

//ye multer middleware hai jo file uploads ko handle karega
//aur file ko temporary location pe store karega jahan se hum usko cloudinary pe upload karenge
//diskStorage ka use karke hum file ko local storage pe store kar rahe hain
const storage = multer.diskStorage({
    destination: function (req, file, cb) {  //cb is callback function aur ye function file ko store karne ke liye location define karta hai
        cb(null, './public/temp/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname)   // ye file ka unique name generate karta hai jisme timestamp aur random number hota hai taaki file name unique ho jaye aur original file name bhi maintain ho jaye
    }
})
// ye upload middleware hai jo multer ko use karke file uploads ko handle karega aur export karega taaki hum isko apne routes me use kar sakein
export const upload = multer({
    storage,
})