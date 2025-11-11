import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { refreshToken as refreshTokenAction, logoutUser } from '../redux/slices/authSlice';

/**
 * Custom hook to track user inactivity and auto-logout after timeout
 * 
 * Features:
 * - Tracks user activity (mouse, keyboard, clicks, scroll, touch)
 * - Shows warning modal 1 minute before logout
 * - Auto-refreshes token every 10 minutes if user is active
 * - Logs out user after 15 minutes of inactivity
 * - Syncs across all browser tabs
 * 
 * @param {number} inactivityTimeout - Timeout in milliseconds (default: 15 minutes)
 * @param {number} warningTime - Warning time before logout in milliseconds (default: 1 minute)
 * @returns {Object} - { showWarning, secondsRemaining, resetTimer, extendSession }
 */
export const useInactivityTimeout = (
  inactivityTimeout = 15 * 60 * 1000, // 15 minutes
  warningTime = 60 * 1000 // 1 minute warning
) => {
  const dispatch = useDispatch();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  
  const timeoutIdRef = useRef(null);
  const warningTimeoutIdRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const tokenRefreshIntervalRef = useRef(null);

  /**
   * Reset the inactivity timer
   */
  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    if (warningTimeoutIdRef.current) {
      clearTimeout(warningTimeoutIdRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Hide warning if showing
    setShowWarning(false);

    // Update last activity time
    lastActivityRef.current = Date.now();
    sessionStorage.setItem('lastActivity', Date.now().toString());

    // Set warning timeout (show warning 1 minute before logout)
    warningTimeoutIdRef.current = setTimeout(() => {
      setShowWarning(true);
      
      // Start countdown
      let remaining = warningTime / 1000;
      setSecondsRemaining(remaining);
      
      countdownIntervalRef.current = setInterval(() => {
        remaining -= 1;
        setSecondsRemaining(remaining);
        
        if (remaining <= 0) {
          clearInterval(countdownIntervalRef.current);
        }
      }, 1000);
    }, inactivityTimeout - warningTime);

    // Set logout timeout
    timeoutIdRef.current = setTimeout(() => {
      handleLogout();
    }, inactivityTimeout);
  }, [inactivityTimeout, warningTime]);

  /**
   * Handle logout due to inactivity
   */
  const handleLogout = useCallback(() => {
    // Clear all timers
    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    if (warningTimeoutIdRef.current) clearTimeout(warningTimeoutIdRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (tokenRefreshIntervalRef.current) clearInterval(tokenRefreshIntervalRef.current);

    // Dispatch logout action
    dispatch(logoutUser());
    
    // Store logout reason in sessionStorage for displaying message on login page
    sessionStorage.setItem('logoutReason', 'Session expired due to inactivity');
  }, [dispatch]);

  /**
   * Extend session when user clicks "Stay Logged In"
   */
  const extendSession = useCallback(async () => {
    try {
      // Refresh the token
      await dispatch(refreshTokenAction()).unwrap();
      
      // Reset the timer
      resetTimer();
    } catch (error) {
      console.error('Failed to extend session:', error);
      // If refresh fails, logout
      handleLogout();
    }
  }, [dispatch, resetTimer, handleLogout]);

  /**
   * Refresh token periodically (every 10 minutes if user is active)
   */
  const setupTokenRefresh = useCallback(() => {
    // Clear existing interval
    if (tokenRefreshIntervalRef.current) {
      clearInterval(tokenRefreshIntervalRef.current);
    }

    // Refresh token every 10 minutes
    tokenRefreshIntervalRef.current = setInterval(async () => {
      const lastActivity = parseInt(sessionStorage.getItem('lastActivity') || '0');
      const timeSinceActivity = Date.now() - lastActivity;
      
      // Only refresh if user has been active in the last 10 minutes
      if (timeSinceActivity < 10 * 60 * 1000) {
        try {
          await dispatch(refreshTokenAction()).unwrap();
          console.log(' Token refreshed automatically');
        } catch (error) {
          console.error('Failed to refresh token:', error);
        }
      }
    }, 10 * 60 * 1000); // 10 minutes
  }, [dispatch]);

  /**
   * Activity event handler
   */
  const handleActivity = useCallback(() => {
    const now = Date.now();
    const lastActivity = lastActivityRef.current;
    
    // Throttle activity updates (only reset if more than 1 second since last activity)
    if (now - lastActivity > 1000) {
      resetTimer();
    }
  }, [resetTimer]);

  /**
   * Listen to storage events from other tabs
   */
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'lastActivity') {
        // Another tab had activity, reset our timer
        const otherTabActivity = parseInt(e.newValue || '0');
        const timeSinceOtherTabActivity = Date.now() - otherTabActivity;
        
        if (timeSinceOtherTabActivity < 1000) {
          resetTimer();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [resetTimer]);

  /**
   * Setup activity event listeners
   */
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timer setup
    resetTimer();
    
    // Setup token refresh interval
    setupTokenRefresh();

    return () => {
      // Cleanup
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (warningTimeoutIdRef.current) clearTimeout(warningTimeoutIdRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (tokenRefreshIntervalRef.current) clearInterval(tokenRefreshIntervalRef.current);
    };
  }, [handleActivity, resetTimer, setupTokenRefresh]);

  return {
    showWarning,
    secondsRemaining,
    resetTimer,
    extendSession,
  };
};

export default useInactivityTimeout;
