import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { LogOut, User } from "lucide-react";
import { Button } from "../ui/Button";
import { logoutUser } from "../../redux/slices/authSlice";
import { APP_NAME } from "../../utils/constants";

const Navbar = () => {
  const dispatch = useDispatch();
  const { user, role } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-[#0D1A33] text-white px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Logo and App Name */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TS</span>
          </div>
          <h1 className="text-xl font-semibold">{APP_NAME}</h1>
        </div>

        {/* User Section */}
        <div className="flex items-center space-x-4">
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="flex flex-col text-right">
              <span className="text-sm font-medium">
                {user?.name || "User"}
              </span>
              <span className="text-xs text-gray-300 capitalize">
                {role || "Role"}
              </span>
            </div>

            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm">{getUserInitials(user?.name)}</span>
              )}
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-white hover:bg-white/10 px-4 py-2 text-sm font-medium"
              title="Logout"
            >
              <LogOut className="h-6 w-6 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
