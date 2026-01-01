const bcrypt = require("bcryptjs")

exports.doHash=async (value,saltValue)=>{
  const result=bcrypt.hash(value, saltValue)
  return result;
};

exports.doHashValidation=async (value,hashedValue)=>{
  const result= bcrypt.compare(value,hashedValue);
  return result;
};    