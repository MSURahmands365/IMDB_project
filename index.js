require("dotenv").config();   

const express = require("express");
const helmet= require('helmet');
const cors=require('cors');
const cookieParser= require('cookie-parser');
const mongoose=require('mongoose');
const authRouter= require('./routers/authRouter');
const activityLogger = require("./middlewares/logger.middleware");
const authMiddleware = require("./middlewares/authMiddleware");
const axios = require('axios');
const app = express();

app.use(cors());
app.use(helmet());
app.use(cookieParser());

app.use(express.json());      
app.use(express.urlencoded({extended:true}))
//app.use(activityLogger);         



mongoose.connect(process.env.MONGO_URL).then(()=>{
console.log("Database Connected");
}).catch((err)=>{
  console.log("Database not connected ", err)
});
app.use('/api/auth',authRouter)
app.use('/api/profile', authRouter);
app.get("/", (req, res) => {
  
  res.json({ message: "Hello from the server" });
});


app.post('/api/get-prediction', async (req, res) => {
    try {

        const fastApiResponse = await axios.post('http://127.0.0.1:8000/predict', {
            review: req.body.review 
        });

     
        const sentiment = fastApiResponse.data.sentiment;
        const confidence = fastApiResponse.data.confidence;

        console.log('Model Prediction:', sentiment);
        console.log('Confidence:', confidence);

     
      res.json({ 
            success: true, 
            prediction: sentiment, 
            confidence: confidence,
            processedText: fastApiResponse.data.processed_text
        });

    } catch (error) {
        console.error("Error communicating with FastAPI:", error.message);
        
        res.status(500).json({ 
            success: false, 
            error: "Model service is offline or returned an error" 
        });
    }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
