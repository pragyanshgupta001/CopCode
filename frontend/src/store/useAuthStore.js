import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  authUser:       null,
  isCheckingAuth: true,
  isLoggingIn:    false,
  isSigningUp:    false,
  isUpdating:     false,

  //checkAuth
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data.user });
    } catch {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // signup
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data.user });
      toast.success("Account created successfully");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed");
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  // login
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.user });
      toast.success("Logged in successfully");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // logout
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  },

  // updateProfile
  updateProfile: async (data) => {
    set({ isUpdating: true });
    try {
      const res = await axiosInstance.put("/auth/profile", data);
      set({ authUser: res.data.user });
      toast.success("Profile updated");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
      return false;
    } finally {
      set({ isUpdating: false });
    }
  },

  // uploadProfilePic
  uploadProfilePic: async (file) => {
    set({ isUpdating: true });
    try {
      const image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      const res = await axiosInstance.post("/auth/profile/picture", { image });
      set({ authUser: res.data.user });
      toast.success("Profile picture updated");
      return res.data.profilePic;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Upload failed");
      return null;
    } finally {
      set({ isUpdating: false });
    }
  },

  // changePassword
  changePassword: async (oldPassword, newPassword) => {
    try {
      await axiosInstance.put("/auth/password", { oldPassword, newPassword });
      toast.success("Password changed successfully");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Password change failed");
      return false;
    }
  },

  // forgotPassword
  forgotPassword: async ({ email, dob, newPassword }) => {
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email, dob, newPassword });
      toast.success(res.data.message);
      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Request failed");
      return null;
    }
  },

  // resetPassword
  resetPassword: async (token, newPassword) => {
    try {
      await axiosInstance.post(`/auth/reset-password/${token}`, { newPassword });
      toast.success("Password reset successfully");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Reset failed");
      return false;
    }
  },
}));
