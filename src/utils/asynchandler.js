// const asyncHandler = () => {}
 

// const asyncHandler = (requestHandler) => {

//     (req,res,next) => {
//         Promise.resolve(requestHandler(req,res,next)).catch(error) => next(error)
//     }

// }

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch(next);
    };
};




export {asyncHandler}



// try catch wala
// const  asyncHandler = (fn) => { () => {} } another way of representing this
// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }