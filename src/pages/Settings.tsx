import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Save, Globe, Moon, Sun, ArrowLeft, LogOut, Mail, Key, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useIntl } from 'react-intl';
import { doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

interface SettingsProps {
  setLocale: (locale: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ setLocale }) => {
  const { user, userProfile, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const intl = useIntl();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [isPrivate, setIsPrivate] = useState(userProfile?.isPrivate || false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState(userProfile?.photoURL || '');
  
  // Game IDs
  const [valorantId, setValorantId] = useState(userProfile?.gameIds?.valorant || '');
  const [csgoId, setCsgoId] = useState(userProfile?.gameIds?.csgo || '');
  const [leagueId, setLeagueId] = useState(userProfile?.gameIds?.leagueoflegends || '');
  
  // Social Links
  const [twitchLink, setTwitchLink] = useState(userProfile?.socialLinks?.twitch || '');
  const [youtubeLink, setYoutubeLink] = useState(userProfile?.socialLinks?.youtube || '');
  const [twitterLink, setTwitterLink] = useState(userProfile?.socialLinks?.twitter || '');
  const [instagramLink, setInstagramLink] = useState(userProfile?.socialLinks?.instagram || '');
  
  const [saving, setSaving] = useState(false);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      let photoURL = userProfile?.photoURL || '';
      
      if (profileImage) {
        const storage = getStorage();
        const storageRef = ref(storage, `profile/${user.uid}`);
        await uploadBytes(storageRef, profileImage);
        photoURL = await getDownloadURL(storageRef);
      }
      
      const userData = {
        displayName,
        bio,
        isPrivate,
        photoURL,
        gameIds: {
          valorant: valorantId,
          csgo: csgoId,
          leagueoflegends: leagueId
        },
        socialLinks: {
          twitch: twitchLink,
          youtube: youtubeLink,
          twitter: twitterLink,
          instagram: instagramLink
        }
      };
      
      await updateDoc(doc(db, 'users', user.uid), userData);
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const changeLanguage = (locale: string) => {
    setLocale(locale);
    localStorage.setItem('locale', locale);
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-purple-500 hover:text-purple-700 transition"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back
        </button>
      </div>
      
      <div className={`rounded-xl shadow-md overflow-hidden ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <div className="sm:flex">
          {/* Sidebar */}
          <div className={`sm:w-64 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4 sm:p-6 space-y-1`}>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                activeTab === 'profile' 
                  ? `${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow` 
                  : `${darkMode ? 'hover:bg-gray-800' : 'hover:bg-white'}`
              }`}
            >
              Profile Settings
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                activeTab === 'privacy' 
                  ? `${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow` 
                  : `${darkMode ? 'hover:bg-gray-800' : 'hover:bg-white'}`
              }`}
            >
              Privacy
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                activeTab === 'account' 
                  ? `${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow` 
                  : `${darkMode ? 'hover:bg-gray-800' : 'hover:bg-white'}`
              }`}
            >
              Account
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                activeTab === 'appearance' 
                  ? `${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow` 
                  : `${darkMode ? 'hover:bg-gray-800' : 'hover:bg-white'}`
              }`}
            >
              Appearance
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-4 sm:p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
                
                {/* Profile Picture */}
                <div className="flex flex-col items-center sm:items-start sm:flex-row sm:space-x-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center">
                      {profileImagePreview ? (
                        <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={40} className="text-white" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center cursor-pointer shadow-md">
                      <Camera size={16} />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 w-full sm:max-w-md">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Bio
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                          darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                        }`}
                        placeholder="Tell us about yourself..."
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                {/* Game IDs */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Game IDs</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Valorant
                      </label>
                      <input
                        type="text"
                        value={valorantId}
                        onChange={(e) => setValorantId(e.target.value)}
                        placeholder="Riot ID (e.g., Username#Tag)"
                        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        CS2 / CS:GO
                      </label>
                      <input
                        type="text"
                        value={csgoId}
                        onChange={(e) => setCsgoId(e.target.value)}
                        placeholder="Steam Username"
                        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        League of Legends
                      </label>
                      <input
                        type="text"
                        value={leagueId}
                        onChange={(e) => setLeagueId(e.target.value)}
                        placeholder="Summoner Name"
                        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Social Links */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Social Links</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Twitch
                      </label>
                      <input
                        type="text"
                        value={twitchLink}
                        onChange={(e) => setTwitchLink(e.target.value)}
                        placeholder="https://twitch.tv/username"
                        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        YouTube
                      </label>
                      <input
                        type="text"
                        value={youtubeLink}
                        onChange={(e) => setYoutubeLink(e.target.value)}
                        placeholder="https://youtube.com/c/username"
                        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Twitter/X
                      </label>
                      <input
                        type="text"
                        value={twitterLink}
                        onChange={(e) => setTwitterLink(e.target.value)}
                        placeholder="https://twitter.com/username"
                        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Instagram
                      </label>
                      <input
                        type="text"
                        value={instagramLink}
                        onChange={(e) => setInstagramLink(e.target.value)}
                        placeholder="https://instagram.com/username"
                        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center transition"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Save size={18} className="mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6">Privacy Settings</h2>
                
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="private-account"
                          type="checkbox"
                          checked={isPrivate}
                          onChange={() => setIsPrivate(!isPrivate)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                      </div>
                      <label htmlFor="private-account" className="ml-3 text-sm">
                        <span className="font-medium">Private Account</span>
                        <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Only your followers can see your posts, likes, and game activity. Your profile will still be visible.
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center transition"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Save size={18} className="mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6">Account Settings</h2>
                
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Mail size={20} className="mr-3 text-gray-500" />
                        <div>
                          <h3 className="font-medium">Email</h3>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Key size={20} className="mr-3 text-gray-500" />
                        <div>
                          <h3 className="font-medium">Password</h3>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Change your password
                          </p>
                        </div>
                      </div>
                      <button className="px-3 py-1 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 text-sm font-medium transition">
                        Reset
                      </button>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700 text-red-400' : 'bg-gray-100 text-red-500'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <LogOut size={20} className="mr-3" />
                        <div>
                          <h3 className="font-medium">Sign out</h3>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Log out of your account
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-sm font-medium transition"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6">Appearance</h2>
                
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {darkMode ? (
                          <Moon size={20} className="mr-3 text-purple-400" />
                        ) : (
                          <Sun size={20} className="mr-3 text-yellow-500" />
                        )}
                        <div>
                          <h3 className="font-medium">Theme</h3>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {darkMode ? 'Dark Mode' : 'Light Mode'} is currently active
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={toggleTheme} 
                        className={`px-3 py-1 rounded-lg ${
                          darkMode 
                            ? 'bg-gray-600 hover:bg-gray-500' 
                            : 'bg-gray-200 hover:bg-gray-300'
                        } text-sm font-medium transition`}
                      >
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                      </button>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Globe size={20} className="mr-3 text-gray-500" />
                        <div>
                          <h3 className="font-medium">Language</h3>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {intl.locale === 'en' ? 'English' : 'Türkçe'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => changeLanguage('en')}
                          className={`px-3 py-1 rounded-lg ${
                            intl.locale === 'en'
                              ? 'bg-purple-500 text-white'
                              : darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                          } text-sm font-medium transition`}
                        >
                          English
                        </button>
                        <button 
                          onClick={() => changeLanguage('tr')}
                          className={`px-3 py-1 rounded-lg ${
                            intl.locale === 'tr'
                              ? 'bg-purple-500 text-white'
                              : darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                          } text-sm font-medium transition`}
                        >
                          Türkçe
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;