import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stats: {
    totalIndents: 0,
    activeRFQs: 0,
    ongoingDeliveries: 0,
    completedDeliveries: 0,
  },
  recentActivity: [],
  tiles: [],
  isLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setRecentActivity: (state, action) => {
      state.recentActivity = action.payload;
    },
    setTiles: (state, action) => {
      state.tiles = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setStats, setRecentActivity, setTiles, setLoading, setError } =
  dashboardSlice.actions;
export default dashboardSlice.reducer;
