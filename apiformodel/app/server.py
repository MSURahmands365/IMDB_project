from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import tensorflow as tf
from tensorflow.keras.utils import pad_sequences
import numpy as np
import os
import re
import pickle
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer


nltk.download('stopwords')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


MODEL_PATH = os.path.join(BASE_DIR, "..", "..", "models", "imdb_sentiment_model.keras")
TOKENIZER_PATH = os.path.join(BASE_DIR, "..", "..", "models", "tokenizer.pickle")

# --- Loading Assets ---
model = tf.keras.models.load_model(MODEL_PATH)


with open(TOKENIZER_PATH, "rb") as handle:
    tokenizer = pickle.load(handle)

maxlen = 500
ps = PorterStemmer()
stop_words = set(stopwords.words('english'))

app = FastAPI()

class ReviewRequest(BaseModel):
    review: str
def clean_text(text):
    text = re.sub('[^a-zA-Z]', ' ', text).lower().split()
    text = [ps.stem(word) for word in text if word not in stop_words]
    return " ".join(text)

@app.get('/')
def welcome():
    return {'message': 'Welcome to our Page: Thank You for trusting us!'}

@app.post('/predict')
def predict_input(request: ReviewRequest): 
    try:
        user_review = request.review[:100] if len(request.review) > 100 else request.review
        
        # 1. Preprocess
        cleaned = clean_text(user_review)
        
        # 2. Tokenize & Pad
        sequence = tokenizer.texts_to_sequences([cleaned])
        padded = pad_sequences(sequence, maxlen=maxlen)
        
        # 3. Predict
        prediction = model.predict(padded)[0][0]
        
        # 4. Determine Result
        label = "POSITIVE" if prediction >= 0.5 else "NEGATIVE"
        confidence = prediction if prediction >= 0.5 else (1 - prediction)
        
        return {
            "sentiment": label,
            "confidence": f"{float(confidence) * 100:.2f}%",
            "processed_text": cleaned
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    