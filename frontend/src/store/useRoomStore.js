import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

const generateSlug = (name = "") => {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "room";
};

<<<<<<< HEAD
export const useRoomStore = create((set) => ({
  currentRoom: null,
  myRooms: [],
  isCreating: false,
  isJoining: false,
  isFetchingRoom: false,
=======
 const useRoomStore = create((set) => ({
  currentRoom: null,
  myRooms: null,
  isFetchingMyRooms: false,
  isCreating: false,
  isJoining: false,
  isFetchingRoom: false,
  room: null,
  members: [],
  activeFile: null,
  openFiles: [],
  fileTree: [],
  messages: [],
  isLoadingRoom: false,
  roomError: null,
  setRoom: (room) => set({ room }),
  setMembers: (members) => set({ members }),
  setFileTree: (fileTree) => set({ fileTree }),
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  setActiveFile: (filePath) => set({ activeFile: filePath }),

  openFile: (filePath) =>
    set((state) => ({
      openFiles: state.openFiles.includes(filePath)
        ? state.openFiles
        : [...state.openFiles, filePath],
      activeFile: filePath,
    })),

  closeFile: (filePath) =>
    set((state) => {
      const remaining = state.openFiles.filter((f) => f !== filePath);
      return {
        openFiles: remaining,
        activeFile:
          state.activeFile === filePath
            ? remaining[remaining.length - 1] || null
            : state.activeFile,
      };
    }),
    setIsLoadingRoom: (v) => set({ isLoadingRoom: v }),
  setRoomError: (e) => set({ roomError: e }),

  clearRoom: () =>
    set({
      room: null,
      members: [],
      activeFile: null,
      openFiles: [],
      fileTree: [],
      messages: [],
    }),
>>>>>>> a4a12d9 (full project implementation)

  createRoom: async (data) => {
    set({ isCreating: true });
    try {
      const res = await axiosInstance.post("/rooms/create", {
        name: data.name,
        language: data.language,
        maxMembers: data.maxUsers,
        description: data.description || "",
      });

      const room = res.data.room;
      set({ currentRoom: room });

      const slug = generateSlug(room.name);
      toast.success("Room created successfully");

      return { roomId: room.roomId, slug };

    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create room");
      return null;
    } finally {
      set({ isCreating: false });
    }
  },

  joinRoom: async (roomId) => {
    set({ isJoining: true });
    try {
      const normalizedId = roomId.trim().toLowerCase();

      const res = await axiosInstance.post("/rooms/join", {
        roomId: normalizedId,
      });

      const room = res.data.room;
      set({ currentRoom: room });

      const slug = generateSlug(room.name);
      toast.success(res.data.message || "Joined room successfully");

      return { roomId: room.roomId, slug };

    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to join room");
      return null;
    } finally {
      set({ isJoining: false });
    }
  },

  getRoom: async (roomId) => {
    set({ isFetchingRoom: true });
    try {
      const res = await axiosInstance.get(`/rooms/${roomId}`);
      set({ currentRoom: res.data.room });
      return res.data.room;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Room not found");
      return null;
    } finally {
      set({ isFetchingRoom: false });
    }
  },

  getMyRooms: async () => {
<<<<<<< HEAD
=======
    set({ isFetchingMyRooms: true });
>>>>>>> a4a12d9 (full project implementation)
    try {
      const res = await axiosInstance.get("/rooms/my-rooms");
      set({ myRooms: res.data.rooms });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch rooms"
      );
<<<<<<< HEAD
    }
  },

  clearCurrentRoom: () => set({ currentRoom: null }),
}));
=======
      set({ myRooms: [] });
    } finally {
      set({ isFetchingMyRooms: false });
    }
  },

  // clearCurrentRoom
  clearCurrentRoom: () => set({ currentRoom: null }),
}));
export default useRoomStore;
>>>>>>> a4a12d9 (full project implementation)
