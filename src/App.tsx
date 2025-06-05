import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';

// Firebase
import { auth } from './firebase/config';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Messages from './pages/Messages';
import PostDetail from './pages/PostDetail';
import NotFound from './pages/NotFound';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

// Components
import Layout from './components/layout/Layout';
import Loading from './components/ui/Loading';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Translations
import en from './translations/en.json';
import tr from './translations/tr.json';

// Context
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

const messages: Record<string, Record<string, string>> = {
  'en': en,
  'tr': tr
};

function App() {
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState('en');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check saved locale
    const savedLocale = localStorage.getItem('locale') || 'en';
    setLocale(savedLocale);

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      <ThemeProvider>
        {loading ? (
          <Loading />
        ) : (
          <AuthProvider>
            <Router>
              <Toaster position="top-center" />
              <Routes>
                <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
                <Route path="/reset-password" element={user ? <Navigate to="/" /> : <ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
                <Route path="/profile/:id" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Layout><Settings setLocale={setLocale} /></Layout></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} />
                <Route path="/messages/:id" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} />
                <Route path="/post/:id" element={<ProtectedRoute><Layout><PostDetail /></Layout></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </AuthProvider>
        )}
      </ThemeProvider>
    </IntlProvider>
  );
}

export default App;