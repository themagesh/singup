# SlotSwapper - Peer-to-Peer Time Slot Scheduling

SlotSwapper is a full-stack web application that enables users to swap time slots with each other. Users can mark their busy calendar slots as "swappable" and exchange them with other users' swappable slots.

## Features

- 🔐 **User Authentication**: Secure signup/login with JWT tokens
- 📅 **Calendar Management**: Create, view, update, and delete events
- 🔄 **Slot Swapping**: Mark slots as swappable and exchange them with other users
- 🔔 **Swap Requests**: Send and receive swap requests with accept/reject functionality
- 🛍️ **Marketplace**: Browse all available swappable slots from other users
- ⚡ **Real-time Updates**: Dynamic state management without manual page refreshes

## Tech Stack

### Backend
- **Python 3.8+**
- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **SQLite** - Database
- **JWT** - Authentication
- **Pydantic** - Data validation
- **Passlib & Bcrypt** - Password hashing

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Vite** - Build tool
- **date-fns** - Date formatting

## Project Structure

```
slotswapper/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # Authentication utilities
│   ├── requirements.txt     # Python dependencies
│   └── routers/
│       ├── __init__.py
│       ├── auth.py          # Auth endpoints
│       ├── events.py        # Event CRUD endpoints
│       └── swaps.py         # Swap logic endpoints
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── services/
        │   └── api.js       # API client
        ├── contexts/
        │   └── AuthContext.jsx
        └── components/
            ├── PrivateRoute.jsx
            ├── Auth/
            │   ├── Login.jsx
            │   └── Signup.jsx
            ├── Layout/
            │   └── Navbar.jsx
            ├── Dashboard/
            │   ├── Dashboard.jsx
            │   ├── EventForm.jsx
            │   └── EventCard.jsx
            ├── Marketplace/
            │   ├── Marketplace.jsx
            │   └── SwapModal.jsx
            └── Requests/
                ├── Requests.jsx
                └── SwapRequestCard.jsx
```

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```powershell
cd backend
```

2. Create a virtual environment:
```powershell
python -m venv venv
```

3. Activate the virtual environment:
```powershell
.\venv\Scripts\Activate.ps1
```

4. Install dependencies:
```powershell
pip install -r requirements.txt
```

5. Start the FastAPI server:
```powershell
uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`

API documentation (Swagger UI): `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```powershell
cd frontend
```

2. Install dependencies:
```powershell
npm install
```

3. Start the development server:
```powershell
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

### 1. Sign Up / Login
- Create a new account or login with existing credentials
- Authentication uses JWT tokens stored in localStorage

### 2. Create Events
- Go to Dashboard
- Click "Create Event"
- Fill in event title, start time, and end time
- Events are created with "BUSY" status by default

### 3. Make Slots Swappable
- In Dashboard, find an event with "BUSY" status
- Click "Make Swappable" to allow others to request swaps
- Click "Make Busy" to remove from marketplace

### 4. Browse Marketplace
- Go to Marketplace to see all swappable slots from other users
- Click "Request Swap" on any available slot

### 5. Request a Swap
- Select one of your own swappable slots to offer
- Submit the swap request
- Both slots are marked as "SWAP_PENDING" until the request is resolved

### 6. Manage Requests
- Go to Requests to see incoming and outgoing swap requests
- **Incoming**: Accept or reject requests from other users
- **Outgoing**: View status of your sent requests
- When accepted: Slot owners are exchanged, both slots return to "BUSY"
- When rejected: Both slots return to "SWAPPABLE"

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Events
- `GET /api/events` - Get all events for current user
- `POST /api/events` - Create new event
- `GET /api/events/{id}` - Get specific event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

### Swaps
- `GET /api/swappable-slots` - Get all swappable slots from other users
- `POST /api/swap-request` - Create swap request
- `POST /api/swap-response/{requestId}` - Accept or reject swap request
- `GET /api/swap-requests/incoming` - Get incoming swap requests
- `GET /api/swap-requests/outgoing` - Get outgoing swap requests

## Database Schema

### Users Table
- `id` (Primary Key)
- `name`
- `email` (Unique)
- `hashed_password`
- `created_at`

### Events Table
- `id` (Primary Key)
- `title`
- `start_time`
- `end_time`
- `status` (BUSY, SWAPPABLE, SWAP_PENDING)
- `user_id` (Foreign Key)
- `created_at`

### SwapRequests Table
- `id` (Primary Key)
- `requester_slot_id` (Foreign Key)
- `target_slot_id` (Foreign Key)
- `requester_id` (Foreign Key)
- `target_user_id` (Foreign Key)
- `status` (PENDING, ACCEPTED, REJECTED)
- `created_at`
- `updated_at`

## Security Notes

⚠️ **Important for Production:**

1. Change the `SECRET_KEY` in `backend/auth.py` to a secure random key
2. Use environment variables for sensitive configuration
3. Enable HTTPS in production
4. Add rate limiting to prevent abuse
5. Implement proper CORS configuration
6. Use a production-grade database (PostgreSQL, MySQL)

## Development Tips

- The SQLite database file `slotswapper.db` is created automatically on first run
- Use the Swagger UI at `/docs` to test API endpoints
- Frontend proxy is configured to forward `/api/*` requests to backend
- State updates automatically after successful operations

## Troubleshooting

### Backend issues:
- Ensure virtual environment is activated
- Check if port 8000 is available
- Verify all dependencies are installed

### Frontend issues:
- Clear browser cache and localStorage
- Check if port 3000 is available
- Ensure backend is running before starting frontend
- Check browser console for errors

### Database issues:
- Delete `slotswapper.db` to reset the database
- Check file permissions in the backend directory

## Future Enhancements

- Email notifications for swap requests
- Calendar integration (Google Calendar, Outlook)
- Recurring events support
- Advanced filtering and search
- User profiles and ratings
- Mobile responsive design improvements
- WebSocket support for real-time notifications

## License

This project is open source and available for educational purposes.

## Contributors

Built as a demonstration of full-stack development with FastAPI and React.
