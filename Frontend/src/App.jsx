import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { v1 as uuidv1 } from 'uuid';
import { MyContext } from './MyContext.jsx';
import Sidebar from './Sidebar.jsx';
import ChatWindow from './ChatWindow.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';

// Protected route — redirects to /login if not authenticated
function ProtectedRoute({ user, children }) {
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

// Auth route — redirects to / if already logged in
function AuthRoute({ user, children }) {
    if (user) return <Navigate to="/" replace />;
    return children;
}

function App() {
    const [prompt, setPrompt] = useState('');
    const [reply, setReply] = useState(null);
    const [currThreadId, setCurrThreadId] = useState(uuidv1());
    const [prevChats, setPrevChats] = useState([]);
    const [newChat, setNewChat] = useState(true);
    const [allThreads, setAllThreads] = useState([]);

    // Auth state — hydrate from localStorage on load
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);

    // Keep localStorage in sync whenever token/user changes
    useEffect(() => {
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
    }, [token]);

    useEffect(() => {
        if (user) localStorage.setItem('user', JSON.stringify(user));
        else localStorage.removeItem('user');
    }, [user]);

    const logout = () => {
        setUser(null);
        setToken(null);
        setAllThreads([]);
        setPrevChats([]);
        setNewChat(true);
        setCurrThreadId(uuidv1());
        setPrompt('');
        setReply(null);
    };

    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    const providerValues = {
        prompt, setPrompt,
        reply, setReply,
        currThreadId, setCurrThreadId,
        newChat, setNewChat,
        prevChats, setPrevChats,
        allThreads, setAllThreads,
        user, setUser,
        token, setToken,
        logout,
        sidebarOpen, toggleSidebar
    };

    return (
        <MyContext.Provider value={providerValues}>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <AuthRoute user={user}>
                                <Login />
                            </AuthRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <AuthRoute user={user}>
                                <Register />
                            </AuthRoute>
                        }
                    />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute user={user}>
                                <div className={`app ${sidebarOpen ? "sidebar-visible" : "sidebar-hidden"}`}>
                                    <Sidebar />
                                    <ChatWindow />
                                </div>
                            </ProtectedRoute>
                        }
                    />
                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </MyContext.Provider>
    );
}

export default App;
