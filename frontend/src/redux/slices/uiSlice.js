import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarOpen: false,
  activeTab: "dashboard",
  theme: "light",
  toasts: [],
  modals: {
    createIndent: false,
    editIndent: false,
    createRFQ: false,
    editRFQ: false,
    createContract: false,
    editContract: false,
  },
  loading: {
    global: false,
    indent: false,
    rfq: false,
    contract: false,
    tracking: false,
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    addToast: (state, action) => {
      const toast = {
        id: Date.now(),
        type: action.payload.type || "info",
        message: action.payload.message,
        details: action.payload.details || null,
        duration: action.payload.duration || 5000,
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(
        (toast) => toast.id !== action.payload
      );
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key] = false;
      });
    },
    setLoading: (state, action) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setActiveTab,
  setTheme,
  addToast,
  removeToast,
  clearToasts,
  openModal,
  closeModal,
  closeAllModals,
  setLoading,
  setGlobalLoading,
} = uiSlice.actions;

// Alias addToast as showToast for backward compatibility
export const showToast = addToast;

export default uiSlice.reducer;
