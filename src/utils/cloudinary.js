import { v2 as cloudinary } from 'cloudinary';
import { response } from 'express';
import fs from 'fs';

// ye confing degi file ko cloudinary se connect krne k liye
// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dzz6h3f4o',
    api_key: process.env.CLOUDINARY_API_KEY || '585577422242557',
    api_secret: process.env.CLOUDINARY_API_SECRET || '<your_api_secret>' // Click 'View API Keys' above to copy your API secret
});

//ye test upload hai
cloudinary.v2.uploader.upload("https://example.com/image.jpg", function(error, result) {
  console.log(result, error);
});

// ye function image upload krne k liye hai
export const uploadImage = async (filePath) => {
    try {
        const response = await cloudinary.uploader.upload(filePath, {
          resource_type: 'auto',
        });
        console.log('Uploading to Cloudinary...',response.url);
        ///file upoload ho chuki hai
        // upload ke baad local file delete kr denge
        return response; // return the URL of the uploaded image
    } catch (error) {
        fs.unlinkSync(filePath); // delete the local file in case of error
        console.error('Error uploading image to Cloudinary:', error);
        throw error;
    }
};

// ye function image delete krne k liye hai
export const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
    }
};      


export { uploadImage, deleteImage };