import { useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { logoutUser, setCredentials } from "../redux/slices/authSlice";

/**
 * Custom hook to synchronize authentication state across multiple browser tabs
 *
 * Features:
 * - Counts active tabs
 * - Logs out when all tabs are closed
 * - Syncs token refreshes across tabs
 * - Broadcasts logout to all tabs
 *
 * Uses BroadcastChannel API for modern browsers, falls back to localStorage events
 */
export const useTabSync = () => {
  const dispatch = useDispatch();
  const tabIdRef = useRef(null);
  const channelRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const isRefreshingRef = useRef(false);

  /**
   * Generate unique tab ID
   */
  const generateTabId = useCallback(() => {
    return `tab-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  /**
   * Get active tabs from sessionStorage
   */
  const getActiveTabs = useCallback(() => {
    try {
      const tabs = sessionStorage.getItem("activeTabs");
      return tabs ? JSON.parse(tabs) : {};
    } catch (error) {
      console.error("Error reading active tabs:", error);
      return {};
    }
  }, []);

  /**
   * Update active tabs in sessionStorage
   */
  const updateActiveTabs = useCallback((tabs) => {
    try {
      sessionStorage.setItem("activeTabs", JSON.stringify(tabs));
    } catch (error) {
      console.error("Error updating active tabs:", error);
    }
  }, []);

  /**
   * Register this tab as active
   */
  const registerTab = useCallback(() => {
    const tabs = getActiveTabs();
    tabs[tabIdRef.current] = {
      id: tabIdRef.current,
      timestamp: Date.now(),
    };
    updateActiveTabs(tabs);
  }, [getActiveTabs, updateActiveTabs]);

  /**
   * Unregister this tab
   */
  const unregisterTab = useCallback(() => {
    // Don't unregister if it's just a page refresh
    if (isRefreshingRef.current) {
      console.log("Page refresh detected, keeping session active");
      return;
    }

    const tabs = getActiveTabs();
    delete tabs[tabIdRef.current];
    updateActiveTabs(tabs);

    // Check if this was the last tab
    if (Object.keys(tabs).length === 0) {
      console.log("Last tab closing, logging out...");
      sessionStorage.setItem("logoutReason", "All browser tabs closed");
      dispatch(logoutUser());
    }
  }, [dispatch, getActiveTabs, updateActiveTabs]);

  /**
   * Clean up stale tabs (tabs that haven't sent heartbeat in 10 seconds)
   */
  const cleanupStaleTabs = useCallback(() => {
    const tabs = getActiveTabs();
    const now = Date.now();
    let changed = false;

    Object.keys(tabs).forEach((tabId) => {
      if (now - tabs[tabId].timestamp > 10000) {
        delete tabs[tabId];
        changed = true;
      }
    });

    if (changed) {
      updateActiveTabs(tabs);
    }
  }, [getActiveTabs, updateActiveTabs]);

  /**
   * Send heartbeat to mark this tab as active
   */
  const sendHeartbeat = useCallback(() => {
    cleanupStaleTabs();
    registerTab();
  }, [cleanupStaleTabs, registerTab]);

  /**
   * Handle messages from other tabs
   */
  const handleMessage = useCallback(
    (event) => {
      const { type, data } = event.data || event;

      switch (type) {
        case "TOKEN_REFRESHED":
          // Update token in current tab when another tab refreshes it
          if (data.user && data.token) {
            dispatch(setCredentials({ user: data.user, token: data.token }));
            console.log("Token updated from another tab");
          }
          break;

        case "LOGOUT":
          // Logout this tab when another tab logs out
          dispatch(logoutUser());
          console.log("Logged out due to logout in another tab");
          break;

        case "TAB_HEARTBEAT":
          // Another tab is alive
          break;

        default:
          break;
      }
    },
    [dispatch]
  );

  /**
   * Broadcast message to all tabs
   */
  const broadcastMessage = useCallback((type, data = {}) => {
    try {
      if (channelRef.current) {
        channelRef.current.postMessage({ type, data });
      }

      // Fallback to localStorage for browsers without BroadcastChannel
      const message = { type, data, timestamp: Date.now() };
      localStorage.setItem("tabMessage", JSON.stringify(message));
      localStorage.removeItem("tabMessage"); // Trigger storage event
    } catch (error) {
      console.error("Error broadcasting message:", error);
    }
  }, []);

  /**
   * Handle storage events (fallback for browsers without BroadcastChannel)
   */
  const handleStorageEvent = useCallback(
    (e) => {
      if (e.key === "tabMessage" && e.newValue) {
        try {
          const message = JSON.parse(e.newValue);
          handleMessage(message);
        } catch (error) {
          console.error("Error parsing storage message:", error);
        }
      }
    },
    [handleMessage]
  );

  /**
   * Setup tab synchronization
   */
  useEffect(() => {
    // Generate unique tab ID
    tabIdRef.current = generateTabId();
    console.log(`Tab ID: ${tabIdRef.current}`);

    // Register this tab
    registerTab();

    // Setup BroadcastChannel if available
    if (typeof BroadcastChannel !== "undefined") {
      channelRef.current = new BroadcastChannel("tms-auth-channel");
      channelRef.current.addEventListener("message", handleMessage);
      console.log("BroadcastChannel initialized");
    } else {
      // Fallback to localStorage events
      window.addEventListener("storage", handleStorageEvent);
      console.log("Using localStorage fallback for tab sync");
    }

    // Send heartbeat every 5 seconds
    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat();
      broadcastMessage("TAB_HEARTBEAT", { tabId: tabIdRef.current });
    }, 5000);

    // Cleanup on unmount
    return () => {
      // Clear heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      // Unregister tab
      unregisterTab();

      // Cleanup BroadcastChannel or storage listener
      if (channelRef.current) {
        channelRef.current.removeEventListener("message", handleMessage);
        channelRef.current.close();
      } else {
        window.removeEventListener("storage", handleStorageEvent);
      }
    };
  }, [
    generateTabId,
    registerTab,
    unregisterTab,
    handleMessage,
    handleStorageEvent,
    sendHeartbeat,
    broadcastMessage,
  ]);

  // Handle pagehide (tab/window closing) - more reliable than beforeunload
  useEffect(() => {
    let isNavigating = false;

    const handlePageHide = (event) => {
      // Only unregister if the page is being permanently discarded
      // persisted=true means page will be cached (bfcache), persisted=false means discarded
      // Also check if we detected a navigation/refresh
      if (!event.persisted && !isNavigating) {
        console.log("Tab closing, unregistering...");
        unregisterTab();
      } else {
        console.log(
          "Page cached or navigating, keeping session:",
          event.persisted ? "cached" : "navigating"
        );
      }
    };

    // Detect page visibility changes (refresh detection)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Page hidden - might be refresh or tab switch
        // Wait 100ms to see if page unloads
        setTimeout(() => {
          if (document.visibilityState === "visible") {
            // Page became visible again - it was just a tab switch
            isNavigating = false;
          } else {
            // Still hidden after 100ms - likely navigating away or refreshing
            isNavigating = true;
          }
        }, 100);
      }
    };

    // Modern way to detect page refresh
    const handleBeforeUnload = () => {
      // If the page is still visible when beforeunload fires, it's likely a refresh
      if (document.visibilityState === "visible") {
        isNavigating = true;
        isRefreshingRef.current = true;
        console.log("Page refresh detected");
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [unregisterTab]);

  return {
    tabId: tabIdRef.current,
    broadcastMessage,
  };
};

export default useTabSync;
