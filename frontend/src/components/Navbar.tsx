import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-nhsBlue text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Kidney Compass</Link>
        <ul className="flex space-x-4 items-center">
          <li>
            <Link to="/" className="hover:underline">Home</Link>
          </li>
          <li>
            <Link to="/calculator" className="hover:underline">Calculator</Link>
          </li>
          
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/history" className="hover:underline">History</Link>
              </li>
              <li className="text-sm">
                <span className="opacity-75 mr-2">
                  {user?.email}
                </span>
              </li>
              <li>
                <button 
                  onClick={logout} 
                  className="bg-white text-nhsBlue px-3 py-1 rounded hover:bg-gray-100"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/about" className="hover:underline">About</Link>
              </li>
              <li>
                <Link to="/login" className="hover:underline">Login</Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className="bg-white text-nhsBlue px-3 py-1 rounded hover:bg-gray-100"
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 