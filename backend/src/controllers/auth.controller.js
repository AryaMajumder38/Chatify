
import bcrypt from "bcryptjs"
import User from "../models/User.js";
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import "dotenv/config"
export const signup= async (req,res)=>{

    const {email, password, fullName} = req.body;

    try{

    if( !email || !password || !fullName){
        return res.status(400).json({message: "All feild are required"});
    }

    if(password.length < 6){
        return res.status(400).json({message: "Password must be more than 6 letters"});
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(email)){
        return res.status(400).json({message: "Invalid email"});
    }

    const user= await User.findOne({email});
    if(user) return res.status(400).json({message:"Email already exist"})

    const salt= await bcrypt.genSalt(10);
    const hashedPassword= await bcrypt.hash(password,salt);

    const newUser= new User({
        fullName,
        email,
        password: hashedPassword
    })

    if(newUser){
        //generateToken(newUser, res);
        // await newUser.save();


        //Persit user first and then issue auth cookie
        const savedUser = await newUser.save();
        generateToken(savedUser._id, res);

        res.status(201).json({
            user: {
                id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                profilePic: newUser.profilePic
            }
        })


        try {
            await sendWelcomeEmail(savedUser.email,savedUser.fullName,process.env.CLIENT_URL)
        }
        catch(error){
            console.error("Failed to send welcome email")
        }
    }
    else{
        res.status(400).json({message: "User registration failed"})
    }


} catch(error){
    res.status(500).json({message: "Internal server error"})
    console.log("error in signup controller:",error);
}


   
};