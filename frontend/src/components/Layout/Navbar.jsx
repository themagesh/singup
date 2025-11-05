import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="navbar">
      <div className="navbar-content">
        <h1>SlotSwapper</h1>
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/requests">Requests</Link>
          <span style={{ color: 'white', marginLeft: '20px' }}>
            {user?.name}
          </span>
          <button onClick={logout}>Logout</button>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
