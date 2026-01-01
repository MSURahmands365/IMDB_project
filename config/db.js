const mongoose=require('mongoose');
const connectDB= async()=>{
  try{
    const conn= await mongoose.connect(process.env.MONGO_URL);
    console.log(`mongoose connected ${conn.connection.host}`);

  }catch(error){
    console.error("Mongo Connection Error",error)
    process.exit(1)
  }
}
module.export= connectDB;