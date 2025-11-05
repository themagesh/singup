from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db
from auth import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new event for the current user."""
    new_event = models.Event(
        title=event.title,
        start_time=event.start_time,
        end_time=event.end_time,
        status=models.SlotStatus.BUSY,
        user_id=current_user.id
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@router.get("/", response_model=List[schemas.EventResponse])
def get_my_events(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all events for the current user."""
    events = db.query(models.Event).filter(
        models.Event.user_id == current_user.id
    ).order_by(models.Event.start_time).all()
    return events

@router.get("/{event_id}", response_model=schemas.EventResponse)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get a specific event by ID."""
    event = db.query(models.Event).filter(
        models.Event.id == event_id,
        models.Event.user_id == current_user.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    return event

@router.put("/{event_id}", response_model=schemas.EventResponse)
def update_event(
    event_id: int,
    event_update: schemas.EventUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update an event."""
    event = db.query(models.Event).filter(
        models.Event.id == event_id,
        models.Event.user_id == current_user.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if event is in SWAP_PENDING status
    if event.status == models.SlotStatus.SWAP_PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update event with pending swap request"
        )
    
    # Update fields
    update_data = event_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
    
    db.commit()
    db.refresh(event)
    return event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete an event."""
    event = db.query(models.Event).filter(
        models.Event.id == event_id,
        models.Event.user_id == current_user.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if event is in SWAP_PENDING status
    if event.status == models.SlotStatus.SWAP_PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete event with pending swap request"
        )
    
    db.delete(event)
    db.commit()
    return None
