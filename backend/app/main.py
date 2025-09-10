from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import chat
from app.api import auth

app = FastAPI(
    title="ChatterBox API",
    version="1.0.0",
    description="Backend for real-time chat app with FastAPI"
)

# Set to local machine currently
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")

def root():
    return { "message" : "Welcome to Chatterbox API" }

app.include_router(auth.router)
app.include_router(chat.router)