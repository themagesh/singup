from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db
from auth import get_current_user

router = APIRouter()

@router.get("/swappable-slots", response_model=List[schemas.EventWithOwner])
def get_swappable_slots(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all swappable slots from other users."""
    slots = db.query(models.Event).join(models.User).filter(
        models.Event.status == models.SlotStatus.SWAPPABLE,
        models.Event.user_id != current_user.id
    ).order_by(models.Event.start_time).all()
    
    # Add owner information
    result = []
    for slot in slots:
        slot_dict = schemas.EventResponse.from_orm(slot).dict()
        slot_dict['owner_name'] = slot.owner.name
        slot_dict['owner_email'] = slot.owner.email
        result.append(schemas.EventWithOwner(**slot_dict))
    
    return result

@router.post("/swap-request", response_model=schemas.SwapRequestResponse, status_code=status.HTTP_201_CREATED)
def create_swap_request(
    swap_data: schemas.SwapRequestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new swap request."""
    
    # Get the requester's slot (my_slot_id)
    my_slot = db.query(models.Event).filter(
        models.Event.id == swap_data.my_slot_id,
        models.Event.user_id == current_user.id
    ).first()
    
    if not my_slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Your slot not found"
        )
    
    if my_slot.status != models.SlotStatus.SWAPPABLE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your slot must be SWAPPABLE to create a swap request"
        )
    
    # Get the target slot (their_slot_id)
    their_slot = db.query(models.Event).filter(
        models.Event.id == swap_data.their_slot_id
    ).first()
    
    if not their_slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target slot not found"
        )
    
    if their_slot.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot swap with your own slot"
        )
    
    if their_slot.status != models.SlotStatus.SWAPPABLE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target slot must be SWAPPABLE"
        )
    
    # Create swap request
    swap_request = models.SwapRequest(
        requester_slot_id=my_slot.id,
        target_slot_id=their_slot.id,
        requester_id=current_user.id,
        target_user_id=their_slot.user_id,
        status=models.SwapRequestStatus.PENDING
    )
    
    # Update both slots to SWAP_PENDING
    my_slot.status = models.SlotStatus.SWAP_PENDING
    their_slot.status = models.SlotStatus.SWAP_PENDING
    
    db.add(swap_request)
    db.commit()
    db.refresh(swap_request)
    
    # Build response with details
    response = schemas.SwapRequestResponse(
        id=swap_request.id,
        requester_slot_id=swap_request.requester_slot_id,
        target_slot_id=swap_request.target_slot_id,
        requester_id=swap_request.requester_id,
        target_user_id=swap_request.target_user_id,
        status=swap_request.status,
        created_at=swap_request.created_at,
        updated_at=swap_request.updated_at,
        requester_slot_title=my_slot.title,
        requester_slot_start=my_slot.start_time,
        requester_slot_end=my_slot.end_time,
        target_slot_title=their_slot.title,
        target_slot_start=their_slot.start_time,
        target_slot_end=their_slot.end_time,
        requester_name=current_user.name,
        target_user_name=their_slot.owner.name
    )
    
    return response

@router.post("/swap-response/{request_id}", response_model=schemas.SwapRequestResponse)
def respond_to_swap_request(
    request_id: int,
    response: schemas.SwapResponse,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Accept or reject a swap request."""
    
    # Get the swap request
    swap_request = db.query(models.SwapRequest).filter(
        models.SwapRequest.id == request_id
    ).first()
    
    if not swap_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Swap request not found"
        )
    
    # Verify the current user is the target user
    if swap_request.target_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to respond to this swap request"
        )
    
    # Check if request is still pending
    if swap_request.status != models.SwapRequestStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Swap request is already {swap_request.status.value}"
        )
    
    # Get both slots
    requester_slot = swap_request.requester_slot
    target_slot = swap_request.target_slot
    
    if response.accepted:
        # ACCEPTED: Exchange slot owners and set both to BUSY
        swap_request.status = models.SwapRequestStatus.ACCEPTED
        
        # Swap the owners
        temp_user_id = requester_slot.user_id
        requester_slot.user_id = target_slot.user_id
        target_slot.user_id = temp_user_id
        
        # Set both slots back to BUSY
        requester_slot.status = models.SlotStatus.BUSY
        target_slot.status = models.SlotStatus.BUSY
    else:
        # REJECTED: Set request to REJECTED and both slots back to SWAPPABLE
        swap_request.status = models.SwapRequestStatus.REJECTED
        requester_slot.status = models.SlotStatus.SWAPPABLE
        target_slot.status = models.SlotStatus.SWAPPABLE
    
    db.commit()
    db.refresh(swap_request)
    
    # Build response
    response_data = schemas.SwapRequestResponse(
        id=swap_request.id,
        requester_slot_id=swap_request.requester_slot_id,
        target_slot_id=swap_request.target_slot_id,
        requester_id=swap_request.requester_id,
        target_user_id=swap_request.target_user_id,
        status=swap_request.status,
        created_at=swap_request.created_at,
        updated_at=swap_request.updated_at,
        requester_slot_title=requester_slot.title,
        requester_slot_start=requester_slot.start_time,
        requester_slot_end=requester_slot.end_time,
        target_slot_title=target_slot.title,
        target_slot_start=target_slot.start_time,
        target_slot_end=target_slot.end_time,
        requester_name=swap_request.requester.name,
        target_user_name=current_user.name
    )
    
    return response_data

@router.get("/swap-requests/incoming", response_model=List[schemas.SwapRequestResponse])
def get_incoming_swap_requests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all incoming swap requests for the current user."""
    
    swap_requests = db.query(models.SwapRequest).filter(
        models.SwapRequest.target_user_id == current_user.id
    ).order_by(models.SwapRequest.created_at.desc()).all()
    
    result = []
    for sr in swap_requests:
        result.append(schemas.SwapRequestResponse(
            id=sr.id,
            requester_slot_id=sr.requester_slot_id,
            target_slot_id=sr.target_slot_id,
            requester_id=sr.requester_id,
            target_user_id=sr.target_user_id,
            status=sr.status,
            created_at=sr.created_at,
            updated_at=sr.updated_at,
            requester_slot_title=sr.requester_slot.title,
            requester_slot_start=sr.requester_slot.start_time,
            requester_slot_end=sr.requester_slot.end_time,
            target_slot_title=sr.target_slot.title,
            target_slot_start=sr.target_slot.start_time,
            target_slot_end=sr.target_slot.end_time,
            requester_name=sr.requester.name,
            target_user_name=current_user.name
        ))
    
    return result

@router.get("/swap-requests/outgoing", response_model=List[schemas.SwapRequestResponse])
def get_outgoing_swap_requests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all outgoing swap requests from the current user."""
    
    swap_requests = db.query(models.SwapRequest).filter(
        models.SwapRequest.requester_id == current_user.id
    ).order_by(models.SwapRequest.created_at.desc()).all()
    
    result = []
    for sr in swap_requests:
        result.append(schemas.SwapRequestResponse(
            id=sr.id,
            requester_slot_id=sr.requester_slot_id,
            target_slot_id=sr.target_slot_id,
            requester_id=sr.requester_id,
            target_user_id=sr.target_user_id,
            status=sr.status,
            created_at=sr.created_at,
            updated_at=sr.updated_at,
            requester_slot_title=sr.requester_slot.title,
            requester_slot_start=sr.requester_slot.start_time,
            requester_slot_end=sr.requester_slot.end_time,
            target_slot_title=sr.target_slot.title,
            target_slot_start=sr.target_slot.start_time,
            target_slot_end=sr.target_slot.end_time,
            requester_name=current_user.name,
            target_user_name=sr.target_user.name
        ))
    
    return result
