import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express()


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true 
}))


app.use(express.json({limit: "16kb"}))// ki kitna data aayega usje liye
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")) // public assets jinko kbhi bhi access kr skta hai
app.use(cookieParser())// cookies ko access or set krne ke liye



// routes import

import userRouter from "./routes/users.routes.js"


// routes declaration 

app.use("/api/v1/users", userRouter)

// http://localhost:8000/api/v1/users/register


app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} - Body:`, req.body);
  next();
});



export { app }