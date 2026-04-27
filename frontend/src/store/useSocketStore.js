import { create } from "zustand";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  currentRoomId: null,

  setCurrentRoomId: (roomId) => set({ currentRoomId: roomId }),
  clearCurrentRoomId: () => set({ currentRoomId: null }),

  connectSocket: () => {
    const { socket } = get();

    if (socket?.connected) return;

    if (socket && socket.disconnected) {
      socket.removeAllListeners();
      socket.disconnect();
    }

    const newSocket = io(SOCKET_URL, {
      withCredentials: true,  // send httpOnly JWT cookie
      transports: ["websocket", "polling"],
      reconnection:        true,
      reconnectionAttempts: 10,
      reconnectionDelay:   1000,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      set({ isConnected: true });
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      set({ isConnected: false });
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket, currentRoomId } = get();
    if (socket) {
      if (currentRoomId) {
        socket.emit("leave-room", currentRoomId);
      }
      socket.removeAllListeners();
      socket.disconnect();
      set({ socket: null, isConnected: false, currentRoomId: null });
    }
  },
}));