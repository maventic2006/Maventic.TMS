import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  FileSignature,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { setActiveTab } from "../../redux/slices/uiSlice";
import { NAVIGATION_TABS, USER_ROLES } from "../../utils/constants";

const TabNavigation = () => {
  const dispatch = useDispatch();
  const { activeTab } = useSelector((state) => state.ui);
  const { role } = useSelector((state) => state.auth);

  const tabs = [
    {
      id: NAVIGATION_TABS.DASHBOARD,
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: [
        USER_ROLES.ADMIN,
        USER_ROLES.CONSIGNOR,
        USER_ROLES.TRANSPORTER,
        USER_ROLES.DRIVER,
      ],
    },
    {
      id: NAVIGATION_TABS.INDENT,
      label: "Indent",
      icon: FileText,
      roles: [USER_ROLES.ADMIN, USER_ROLES.CONSIGNOR],
    },
    {
      id: NAVIGATION_TABS.RFQ,
      label: "RFQ",
      icon: MessageSquare,
      roles: [USER_ROLES.ADMIN, USER_ROLES.CONSIGNOR, USER_ROLES.TRANSPORTER],
    },
    {
      id: NAVIGATION_TABS.CONTRACT,
      label: "Contract",
      icon: FileSignature,
      roles: [USER_ROLES.ADMIN, USER_ROLES.CONSIGNOR, USER_ROLES.TRANSPORTER],
    },
    {
      id: NAVIGATION_TABS.TRACKING,
      label: "Tracking",
      icon: MapPin,
      roles: [
        USER_ROLES.ADMIN,
        USER_ROLES.CONSIGNOR,
        USER_ROLES.TRANSPORTER,
        USER_ROLES.DRIVER,
      ],
    },
    {
      id: NAVIGATION_TABS.EPOD,
      label: "e-POD",
      icon: CheckCircle,
      roles: [
        USER_ROLES.ADMIN,
        USER_ROLES.CONSIGNOR,
        USER_ROLES.TRANSPORTER,
        USER_ROLES.DRIVER,
      ],
    },
  ];

  const handleTabClick = (tabId) => {
    dispatch(setActiveTab(tabId));
  };

  const visibleTabs = tabs.filter((tab) => tab.roles.includes(role));

  return (
    <div className="bg-[#0D1A33] px-6">
      <div className="flex space-x-1">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={clsx(
                "relative flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#0D1A33]",
                isActive
                  ? "bg-white text-[#0D1A33] rounded-t-xl"
                  : "text-white hover:bg-white/10 rounded-t-xl"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation;
