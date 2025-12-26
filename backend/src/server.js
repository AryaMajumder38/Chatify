 import express from "express";
 import dotenv from "dotenv";
 import path from "path";
 import { connectDB } from "./lib/db.js";

 import authRoutes from "./routes/auth.route.js"


 const app = express();

 const __dirname=path.resolve();



 dotenv.config();

 app.use(express.json());

 const PORT =process.env.PORT || 3000 ; 

 app.get("/hello", (req,res)=> {
    res.send("Hello World");
 });

 app.use("/api/auth",authRoutes);



 //make ready for the deployement
 if (process.env.NODE_ENV === "production"){
   app.use(express.static(path.join(__dirname, "../frontend/dist")))

   app.get("*", (req,res)=> {
      res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
   })
 }


 app.listen(PORT , () => {

   console.log(`running on port ${PORT}`)
   connectDB();
 }
)