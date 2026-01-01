require("dotenv").config();   

const { signupSchema, signinSchema } = require("../middlewares/validator");
const jwt=require('jsonwebtoken');
const User = require("../models/userModel");
const { doHash, doHashValidation } = require("../utils/hashing");
const transport = require("../middlewares/sendMail");
const logActivity = require('../utils/logActivity');
exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { error, value } = signupSchema.validate({ email, password });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User already exists!" });
    }

    const hashedPassword = await doHash(password, 12);
    const newUser = new User({
      email,
      password: hashedPassword,
    });
    const result = await newUser.save();
    result.password = undefined;
    req.userId = result._id;
    logActivity(req, res, result._id, 'completed signup');
    res.status(201).json({
      success: true,
      message: "your account has been created",
      result,
    });
  } catch (error) {
    console.log(error);
  }
};


exports.signin=async(req,res)=>{
  const {email,password}=req.body;
  try {
    const{error,value}= signinSchema.validate({email,password})
    if (error){
      return res.status(401).json({success:false, message:error.details[0].message});
    }
    
    const existingUser= await User.findOne({email}).select('+password');
    if(!existingUser){
      return res.status(401).json({
        success:false,message:"User Does not exist"
      });

    }
    const result=await doHashValidation(password,existingUser.password);
    if(!result){
      return res.status(401).json({success:false,message:'invalid credentials'});
    }
    req.userId = existingUser._id;


    const token=jwt.sign({
      userId:existingUser._id,
      email:existingUser.email,
      verified:existingUser.verified,
    },
  process.env.TOKEN_SECRET,
  {
    expiresIn:'8h',
  }
);
logActivity(req, res, existingUser._id, 'completed signin');

res.cookie('Authorization', 'Bearer '+ token, {expires:new Date(Date.now()+8*3600000),httpOnly:process.env.NODE_ENV==='production', secure:process.env.NODE_ENV==='production'}).status(200).json({
  success:true,
  token,
  message:'logged in successfully',
})
  } catch (error) {
    console.log(error);
  }
};




exports.signout=async(req,res)=>{
  res.clearCookie('Authorization').status(200).json({
    success:true, message:"logged out successfully"
  });

};
          
exports.getProfile = async (req, res) => {
    try {
        
        const userId = req.user.id;

        
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Return the profile data (which contains _id and email, and possibly 'verified')
        res.status(200).json(user);

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching profile.' });
    }
};