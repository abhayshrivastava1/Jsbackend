// require('dotenv').config({path: './env'})


import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

// const mongoose = require("mongoose");
// mongoose.connect("mongodb://127.0.0.1:27017/test");



dotenv.config({
    path: './.env'
})


connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log(error);
        throw error
    })
    app.listen(process.env.PORT || 8000, () => {
    console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
  });
})
.catch((error) => {
    console.log("MONGO db connection failed !!! ", error);
});






// ( async () => {
//     try {
//       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//       app.on("error", (error) => {
//         console.log("ERRR: ", error);
//         throw error;
//       });

//       app.listen(process.env.PORT, () => {
//         console.log(`App is listening on port ${process.env.PORT}`);
//       });
//     } catch (error) {
//       console.error("ERROR: ", error);
//       throw error;
//     }
// })();





// try catch mein wrap kro 
// database is always in another continent 
// always use try catch and async await 