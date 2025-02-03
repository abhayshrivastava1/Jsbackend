import { v2 as cloudinary } from "cloudinary";

import fs from "fs";




cloudinary.config({
  cloud_name: process.env.CLODINARY_CLOUD_NAME,
  api_key: process.env.CLODINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, 
});


const uploadatCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath,
          {
            resource_type: "auto"
          });
        
        console.log("file uploaded!!",response.url);
        // fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove locally save temporary files
        return null;
    }
}


// import { v2 as cloudinary } from 'cloudinary';

// (async function() {

//     // Configuration
//     cloudinary.config({
//       cloud_name: "",
//       api_key: "",
//       api_secret: "", // Click 'View API Keys' above to copy your API secret
//     });

//   })


export {uploadatCloudinary}