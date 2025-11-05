from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional
from models import SlotStatus, SwapRequestStatus

# User Schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Event Schemas
class EventCreate(BaseModel):
    title: str
    start_time: datetime
    end_time: datetime
    
    @validator('end_time')
    def end_time_must_be_after_start_time(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v

class EventUpdate(BaseModel):
    title: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[SlotStatus] = None
    
    @validator('end_time')
    def end_time_must_be_after_start_time(cls, v, values):
        if v is not None and 'start_time' in values and values['start_time'] is not None:
            if v <= values['start_time']:
                raise ValueError('end_time must be after start_time')
        return v

class EventResponse(BaseModel):
    id: int
    title: str
    start_time: datetime
    end_time: datetime
    status: SlotStatus
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class EventWithOwner(EventResponse):
    owner_name: str
    owner_email: str

# Swap Schemas
class SwapRequestCreate(BaseModel):
    my_slot_id: int
    their_slot_id: int

class SwapResponse(BaseModel):
    accepted: bool

class SwapRequestResponse(BaseModel):
    id: int
    requester_slot_id: int
    target_slot_id: int
    requester_id: int
    target_user_id: int
    status: SwapRequestStatus
    created_at: datetime
    updated_at: datetime
    
    # Additional details
    requester_slot_title: str
    requester_slot_start: datetime
    requester_slot_end: datetime
    target_slot_title: str
    target_slot_start: datetime
    target_slot_end: datetime
    requester_name: str
    target_user_name: str
    
    class Config:
        from_attributes = True
