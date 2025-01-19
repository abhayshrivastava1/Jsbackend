import { v2 as cloudinary } from "cloudinary";

import fs from "fs";




cloudinary.config({
  cloud_name: "dlgubtlb2",
  api_key: "735326977713414",
  api_secret: "hht-k_WDDhuvb_6OlAkJRbbNSPg", // Click 'View API Keys' above to copy your API secret
});


const uploadatCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath,
          {
            resource_type: "auto"
          });
        
        console.log("file uploaded!!"),
        response.url();
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove locally save te,porary files
        return null;
    }
}


export {uploadatCloudinary}