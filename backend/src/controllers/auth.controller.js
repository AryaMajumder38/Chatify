
import bcrypt from "bcryptjs"
import User from "../models/User.js";
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import "dotenv/config"
import cloudinary from "../lib/cloudinary.js";
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


export const login= async (req,res)=>{
    const {email, password}= req.body;

    try{
        const user= await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid email or password"});
        }

        const passwordMatch= await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            return res.status(400).json({message: "Invalid email or password"});
        }

        generateToken(user._id, res);
        res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                profilePic: user.profilePic
            }
        });
    }
    catch(error){
        console.log("error in login controller:",error);
        res.status(500).json({message: "Internal server error"});
    }
}


export const logout =  (_,res) => {
    res.cookie("jwt", "",{maxAge:0})
    res.status(200).json({message: "Logged out successfully"});
}

export const updateProfile= async (req, res) =>{
try{

    const {profilePic} = req.body;
    if(!profilePic){
        return res.status(400).json({message: "Profile picture is required"});
    }

         // Validate profilePic exists
        const userId = req.user._id;

        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(profilePic)
    
        // Update user in database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {profilePic: uploadResponse.secure_url},
            {new: true}
        )

        res.status(200).json({
            user: {
                id: updatedUser._id,
                email: updatedUser.email,
                fullName: updatedUser.fullName,
                profilePic: updatedUser.profilePic
            }
        });
    
}
catch(error){
    console.log("error in updateProfile controller:",error);
    res.status(500).json({message: "Internal server error"});
}

};