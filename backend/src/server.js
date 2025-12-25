 import express from "express";
 import dotenv from "dotenv";
 import path from "path";


 const app = express();

 const __dirname=path.resolve();

 dotenv.config();

 const PORT =process.env.PORT || 3000 ; 

 app.get("/hello", (req,res)=> {
    res.send("Hello World");
 });


 //make ready for the deployement
 if (process.env.NODE_ENV === "production"){
   app.use(express.static(path.join(__dirname, "../frontend/dist")))

   app.get("*", (req,res)=> {
      res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
   })
 }


 app.listen(PORT , () => console.log(`running on port ${PORT}`))