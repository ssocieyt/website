import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, Moon, Sun, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Header: React.FC = () => {
  const { user, userProfile, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-md`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            ssocieyt
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="relative">
              <input 
                type="text"
                placeholder="Search users..."
                className={`pl-10 pr-4 py-2 rounded-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            
            <nav className="flex items-center space-x-6">
              <Link to="/" className="hover:text-purple-500 transition">
                Home
              </Link>
              <Link to="/messages" className="hover:text-purple-500 transition">
                Messages
              </Link>
              <button className="hover:text-purple-500 transition">
                <Bell size={20} />
              </button>
              
              <button 
                onClick={toggleTheme} 
                className="hover:text-purple-500 transition"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <div className="relative">
                <button 
                  className="flex items-center space-x-2"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center">
                    {userProfile?.photoURL ? (
                      <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={18} className="text-white" />
                    )}
                  </div>
                </button>
                
                {isMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${darkMode ? 'bg-gray-700' : 'bg-white'} ring-1 ring-black ring-opacity-5`}>
                    <Link 
                      to={`/profile/${user?.uid}`} 
                      className={`block px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link 
                      to="/settings" 
                      className={`block px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
          
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden">
          <div className={`px-4 py-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center">
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-white" />
                )}
              </div>
              <div>
                <div className="font-medium">{userProfile?.displayName}</div>
                <div className="text-sm text-gray-500">@{userProfile?.username}</div>
              </div>
            </div>
            
            <div className="relative mb-4">
              <input 
                type="text"
                placeholder="Search users..."
                className={`w-full pl-10 pr-4 py-2 rounded-full ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            
            <nav className="space-y-3">
              <Link 
                to="/" 
                className="block py-2 hover:text-purple-500 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/messages" 
                className="block py-2 hover:text-purple-500 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Messages
              </Link>
              <Link 
                to={`/profile/${user?.uid}`}
                className="block py-2 hover:text-purple-500 transition" 
                onClick={() => setIsMenuOpen(false)}
              >
                Your Profile
              </Link>
              <Link 
                to="/settings"
                className="block py-2 hover:text-purple-500 transition" 
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
              <button 
                className="flex items-center py-2 hover:text-purple-500 transition"
                onClick={toggleTheme}
              >
                {darkMode ? (
                  <>
                    <Sun size={18} className="mr-2" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon size={18} className="mr-2" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
              <button 
                className="flex items-center py-2 text-red-500 hover:text-red-600 transition"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut size={18} className="mr-2" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;