const mongoose=require('mongoose');
const userSchema=mongoose.Schema({
  email:{
    type:String,
    required:[true,'Email is required'],
    trim:true,
    unique:[true,'Email must be uniques'],
    minLength:[10,'email must be fill complete'],
    lowercase:true,
  },
password:{
  type:String,
  required:[true,'Password must be required'],
  trim:true,
  select:false,
},
verified:{
  type:Boolean,
  default:false,
},
verificationCode:{
  type:String,
  select:false,           
},
verificationCodeValidation:{
  type:Number,
  select:false,           
},
forgetPasswordCode:{
  type:String,
  select:false,           
},
forgetPasswordCodeValidation:{
  type:Number,
  select:false,           
}


},
{
  timestamps:true
});

module.exports=mongoose.model("User",userSchema)