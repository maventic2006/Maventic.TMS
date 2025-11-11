import React from "react";
import { APP_NAME, APP_VERSION } from "../../utils/constants";

const Footer = () => {
  return (
    <footer className="bg-card py-4 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <p>&copy; 2025 {APP_NAME}. All rights reserved.</p>
          <span className="text-xs">v{APP_VERSION}</span>
        </div>
        <div className="flex items-center space-x-4">
          <a href="#" className="hover:text-foreground transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
