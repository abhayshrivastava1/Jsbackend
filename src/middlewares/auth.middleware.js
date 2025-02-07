import {apierror} from "../utils/apierror.js"
import {asyncHandler} from "../utils/asynchandler.js"
import { Users } from "../models/user.models.js";
import  jwt from "jsonwebtoken"




const verifyJWT = asyncHandler(async(req,res,next) => {

    try {
        const token = req.cookie.token || req.header("Authorization")?.replace("Bearer: ", "")
    
        if(!token){
            throw new apierror(401, "Unauthorized Request");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await Users.findById(decodedToken?._id).select("-password", "-refreshToken");
    
        if(!user){
            throw new apierror(401, "Invalid Acc ess Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new apierror(401, error?.message || "Invalid access")
    }

})

export { verifyJWT }