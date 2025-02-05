import {apierror} from "../utils/apierror"
import {asyncHandler} from "../utils/asyncHandler"
import {Users} from ".."




const verifyJWT = asyncHandler(async(req,res,next) => {

    try {
        const token = req.cookie.token || req.header("Authorization")?.replace("Bearer: ", "")
    
        if(!token){
            throw new apierror(401, "Unauthorized Request");
        }
    
        const decodedTokwn = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await Users.findById(decodedTokwn?._id).select("-password", "-refreshToken");
    
        if(!user){
            throw new apierror(401, "Invalid Acc ess Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new apierror(401, error?.message || "Invalid access")
    }

})