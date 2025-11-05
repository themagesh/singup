from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import enum
from datetime import datetime

class SlotStatus(str, enum.Enum):
    BUSY = "BUSY"
    SWAPPABLE = "SWAPPABLE"
    SWAP_PENDING = "SWAP_PENDING"

class SwapRequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    events = relationship("Event", back_populates="owner", foreign_keys="Event.user_id")
    
class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(Enum(SlotStatus), default=SlotStatus.BUSY, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="events", foreign_keys=[user_id])

class SwapRequest(Base):
    __tablename__ = "swap_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    requester_slot_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    target_slot_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(SwapRequestStatus), default=SwapRequestStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    requester_slot = relationship("Event", foreign_keys=[requester_slot_id])
    target_slot = relationship("Event", foreign_keys=[target_slot_id])
    requester = relationship("User", foreign_keys=[requester_id])
    target_user = relationship("User", foreign_keys=[target_user_id])
