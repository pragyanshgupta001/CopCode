<<<<<<< HEAD
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Blog from "./pages/Blog";
import About from "./pages/About";
import ContactPage from "./pages/ContactPage"
import CreateRoomPage from "./components/CreateRoomPage";
import JoinRoomPage from "./components/JoinRoomPage";
import AboutPage from "./components/AboutPage";
import BlogsPage from "./components/BlogPage";
import { useLocation } from "react-router-dom";
import RoomPage from "./pages/RoomPage";



function App() {
  return (
    <div className="bg-[#0D1117] text-white min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
         <Route path="/blogs" element={<BlogsPage />} />
         <Route path="/contact" element={<ContactPage />} />
         <Route path="/create-room" element={<CreateRoomPage />} />
         <Route path="/room/:slug" element={<RoomPage />} />
         <Route path="/join-room" element={<JoinRoomPage />} />
        <Route path="/login" element={<Login />} />
       
        
=======
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "./store/useAuthStore";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AboutPage from "./components/AboutPage";
import BlogsPage from "./components/BlogPage";
import ContactPage from "./pages/ContactPage";
import CreateRoomPage from "./components/CreateRoomPage";
import JoinRoomPage from "./components/JoinRoomPage";
import RoomPage from "./pages/room/RoomPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";
import MyRoomsPage from "./pages/MyRoomsPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

export default function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  useEffect(() => { checkAuth(); }, []);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-cyan-400 animate-spin" />
          <p className="font-mono text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0D1117] text-white min-h-screen">
      <Routes>
        {/* public */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={authUser ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* protected */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/my-rooms" element={<ProtectedRoute><MyRoomsPage /></ProtectedRoute>} />
        <Route path="/create-room" element={<ProtectedRoute><CreateRoomPage /></ProtectedRoute>} />
        <Route path="/join-room" element={<ProtectedRoute><JoinRoomPage /></ProtectedRoute>} />
        <Route path="/room/:slug" element={<ProtectedRoute><RoomPage /></ProtectedRoute>} />
>>>>>>> a4a12d9 (full project implementation)
      </Routes>
    </div>
  );
}
<<<<<<< HEAD

export default App;
=======
>>>>>>> a4a12d9 (full project implementation)
