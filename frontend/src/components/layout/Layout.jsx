import React from "react";
import { useSelector } from "react-redux";
import Navbar from "./Navbar";
import TabNavigation from "./TabNavigation";
import Footer from "./Footer";
import Toast from "../ui/Toast";

const Layout = ({ children }) => {
  const { toasts } = useSelector((state) => state.ui);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      {/* <Navbar /> */}
      <TabNavigation />

      {/* Main Content */}
      <main className="flex-1 p-0">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </div>
  );
};

export default Layout;
