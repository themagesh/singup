from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, events, swaps

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SlotSwapper API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(swaps.router, prefix="/api", tags=["Swaps"])

@app.get("/")
def read_root():
    return {"message": "Welcome to SlotSwapper API"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
