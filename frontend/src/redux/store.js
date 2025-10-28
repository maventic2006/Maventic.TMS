import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import uiSlice from "./slices/uiSlice";
import indentSlice from "./slices/indentSlice";
import rfqSlice from "./slices/rfqSlice";
import contractSlice from "./slices/contractSlice";
import trackingSlice from "./slices/trackingSlice";
import dashboardSlice from "./slices/dashboardSlice";
import transporterSlice from "./slices/transporterSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    indent: indentSlice,
    rfq: rfqSlice,
    contract: contractSlice,
    tracking: trackingSlice,
    dashboard: dashboardSlice,
    transporter: transporterSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export default store;
