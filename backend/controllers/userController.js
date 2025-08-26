import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken" //create authentication
import bcrypt from "bcrypt"
import validator from "validator"


//login user

const loginUser = async (req,res) => {
    const {email,password} = req.body;
    try{
    const user = await userModel.findOne({email});

    if(!user){
        return res.json({success:false,message:"User Doesn't Exist"})
    }

    const isMatch =await bcrypt.compare(password,user.password);

    if(!isMatch){
        return res.json({success:false,message:"Invalid credentials"})
    }
    const token = createToken(user._id);
    res.json({success:true,token})

}
    catch(error){
        console.log(error);
        res.json({success:false,message:"Error"})
    }
    // const createToken = (id) => {
    //     return jwt.sign({id},process.env.JWT_SECET)
    // }
}

const createToken = (id) => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        console.error("❌ JWT_SECRET is undefined. Please check your .env file and dotenv config.");
        throw new Error("JWT_SECRET not configured");
    }

    console.log("✅ JWT_SECRET is loaded");
    return jwt.sign({ id }, secret);
}

//register user
const registerUser = async (req,res) => {
    const {name,password,email} = req.body;
    try{
        console.log("Received registration request:", req.body);

        //checking if user exists
        const exists = await userModel.findOne({email})
        if (exists) {
            console.log("User already exists");
            return res.json({success:false,message:"User already exists"})
        }

        //validating email format and strong password
        if(!validator.isEmail(email)){
            console.log("Invalid email format");
            return res.json({success:false,message:"Please enter a valid email"})
        }
        if(password.length<8){
            console.log("Password too short");
            return res.json({success:false,message:"Please enter a strong password"})
        }

        //Hashing User PASSWORD
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        console.log("Password hashed");

        const newUser = new userModel({
            name:name,
            email:email,
            password:hashedPassword
        })

        const user =  await newUser.save()
        console.log("User saved in DB:", user);

        const token = createToken(user._id)
        return res.json({success:true,token});
    }
    catch(error){
        console.log("Registration error:", error);
        return res.json({success:false,message:"Error"})
    }
}

export {loginUser,registerUser}