import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import VideoDetail from './pages/VideoDetail';
import { getCurrentUser, signOut } from './utils/api';

// Define the PrivateRoute component to handle authentication checks
const PrivateRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/signin" />;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to check the current authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userInfo = await getCurrentUser();
        setIsAuthenticated(!!userInfo);
      } catch (error) {
        console.error('User is not authenticated:', error.message);
      }
    };

    checkAuthStatus();
  }, []);

  // Sign out function
  const handleSignOut = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <div className="App">
      <Header onSignOut={handleSignOut} />
      <Routes>
        <Route path="/login" element={<button onClick={LoginWithReplit}>Log in with Replit</button>} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<PrivateRoute isAuthenticated={isAuthenticated}><Home /></PrivateRoute>} />
        <Route path="/video/:id" element={<PrivateRoute isAuthenticated={isAuthenticated}><VideoDetail /></PrivateRoute>} />
      </Routes>
    </div>
  );
};

export default App;