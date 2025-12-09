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
 * - ONLY RUNS WHEN USER IS AUTHENTICATED
 * 
 * @param {number} inactivityTimeout - Timeout in milliseconds (default: 15 minutes)
 * @param {number} warningTime - Warning time before logout in milliseconds (default: 1 minute)
 * @param {boolean} isAuthenticated - Whether user is authenticated (REQUIRED)
 * @returns {Object} - { showWarning, secondsRemaining, resetTimer, extendSession }
 */
export const useInactivityTimeout = (
  inactivityTimeout = 15 * 60 * 1000, // 15 minutes
  warningTime = 60 * 1000, // 1 minute warning
  isAuthenticated = false // MUST pass authentication status
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
   * Handle logout due to inactivity
   */
  const handleLogout = useCallback(() => {
    console.log('� CRITICAL: handleLogout() called!');
    console.log('🕐 Time since page load:', (Date.now() - performance.timing.navigationStart)/1000, 'seconds');
    console.log('🔍 Call stack:', new Error().stack);
    console.log('👤 Auth state at logout:', isAuthenticated);
    console.log('📍 Current page:', window.location.href);
    console.log('⏰ Expected timeout duration:', inactivityTimeout / 1000 / 60, 'minutes');
    console.log('🔍 Was this premature?', (Date.now() - performance.timing.navigationStart) < 60000 ? 'YES - PREMATURE!' : 'No - Normal timeout');
    
    // 🚨 CRITICAL SAFETY CHECK: Prevent premature logout during navigation
    const timeSincePageLoad = Date.now() - performance.timing.navigationStart;
    if (timeSincePageLoad < 10000) { // Less than 10 seconds since navigation
      console.error('🛑 PREVENTED PREMATURE LOGOUT!');
      console.error('   Time since navigation:', timeSincePageLoad, 'ms');
      console.error('   This appears to be a navigation-related false trigger');
      console.error('   Skipping logout to prevent unexpected user logout');
      return; // Exit early - do not logout
    }
    
    // 🚨 ADDITIONAL SAFETY CHECK: Ensure user is still authenticated
    if (!isAuthenticated) {
      console.error('🛑 PREVENTED LOGOUT - User not authenticated');
      console.error('   This suggests auth state changed during navigation');
      console.error('   Skipping logout as user is already logged out');
      return; // Exit early - do not logout
    }
    
    console.log('🚪 PROCEEDING WITH INACTIVITY LOGOUT');
    console.log('⏰ Timeout Duration:', inactivityTimeout / 1000 / 60, 'minutes');
    console.log('⚠️ Warning Time:', warningTime / 1000, 'seconds');
    console.log('👤 Authentication Status:', isAuthenticated);
    console.log('📍 Current Page:', window.location.pathname);
    console.log('🕐 Current Time:', new Date().toLocaleTimeString());
    
    // Clear all timers
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      console.log('⏹️ Cleared main timeout timer');
    }
    if (warningTimeoutIdRef.current) {
      clearTimeout(warningTimeoutIdRef.current);
      console.log('⏹️ Cleared warning timeout timer');
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      console.log('⏹️ Cleared countdown interval');
    }
    if (tokenRefreshIntervalRef.current) {
      clearInterval(tokenRefreshIntervalRef.current);
      console.log('⏹️ Cleared token refresh interval');
    }

    // Dispatch logout action
    console.log('📞 Calling dispatch(logoutUser())...');
    dispatch(logoutUser());
    
    // Store logout reason in sessionStorage for displaying message on login page
    sessionStorage.setItem('logoutReason', 'Session expired due to inactivity');
    console.log('💾 Stored logout reason in sessionStorage');
  }, [dispatch, inactivityTimeout, warningTime, isAuthenticated]);

  /**
   * Reset the inactivity timer
   */
  const resetTimer = useCallback(() => {
    if (!isAuthenticated) {
      console.log('🔒 Not resetting timer - user not authenticated');
      return;
    }

    console.log('🔄 Resetting inactivity timer');
    console.log('📍 Current Page:', window.location.pathname);
    console.log('🕐 Reset Time:', new Date().toLocaleTimeString());
    
    // Clear existing timers
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      console.log('⏹️ Cleared existing timeout timer');
    }
    if (warningTimeoutIdRef.current) {
      clearTimeout(warningTimeoutIdRef.current);
      console.log('⏹️ Cleared existing warning timer');
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      console.log('⏹️ Cleared countdown interval');
    }

    // Hide warning if showing
    setShowWarning(false);

    // Update last activity time
    lastActivityRef.current = Date.now();
    sessionStorage.setItem('lastActivity', Date.now().toString());

    // Set warning timeout (show warning 1 minute before logout)
    warningTimeoutIdRef.current = setTimeout(() => {
      console.log('⚠️ SHOWING INACTIVITY WARNING - 1 minute until logout');
      console.log('📍 Warning shown on page:', window.location.pathname);
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
      console.log('💥 INACTIVITY TIMEOUT REACHED - Calling handleLogout()');
      console.log('📍 Logout triggered on page:', window.location.pathname);
      console.log('🕐 Time since navigation:', (Date.now() - performance.timing.navigationStart)/1000, 'seconds');
      
      // 🚨 ADDITIONAL SAFETY CHECK before calling handleLogout
      const timeSincePageLoad = Date.now() - performance.timing.navigationStart;
      if (timeSincePageLoad < 30000) { // Less than 30 seconds since navigation
        console.error('🛑 PREVENTED SUSPICIOUS TIMEOUT TRIGGER!');
        console.error('   Timeout triggered only', timeSincePageLoad, 'ms after navigation');
        console.error('   This is suspicious - expected timeout is 15 minutes');
        console.error('   Skipping handleLogout() call to prevent false logout');
        return; // Exit early - do not call handleLogout
      }
      
      handleLogout();
    }, inactivityTimeout);

    console.log(`✅ Timers set - Warning in ${(inactivityTimeout - warningTime)/1000/60} min, Logout in ${inactivityTimeout/1000/60} min`);
  }, [inactivityTimeout, warningTime, isAuthenticated, handleLogout]);



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
   * Setup activity event listeners - ONLY IF AUTHENTICATED
   */
  useEffect(() => {
    // ⚠️ CRITICAL: Only run inactivity tracking if user is authenticated
    if (!isAuthenticated) {
      console.log('🔒 User not authenticated, skipping inactivity timeout initialization');
      console.log('📍 Current Page:', window.location.pathname);
      console.log('🕐 Time since navigation:', (Date.now() - performance.timing.navigationStart)/1000, 'seconds');
      
      // Clear any existing timers if user becomes unauthenticated
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        console.log('⏹️ Cleared timeout timer (user not authenticated)');
      }
      if (warningTimeoutIdRef.current) {
        clearTimeout(warningTimeoutIdRef.current);
        console.log('⏹️ Cleared warning timer (user not authenticated)');
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        console.log('⏹️ Cleared countdown interval (user not authenticated)');
      }
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
        console.log('⏹️ Cleared token refresh interval (user not authenticated)');
      }
      return;
    }

    console.log('✅ Inactivity timeout initialized for authenticated user');
    console.log(`⏰ Timeout: ${inactivityTimeout/1000/60} minutes, Warning: ${warningTime/1000} seconds`);
    console.log('📍 Initialized on page:', window.location.pathname);
    console.log('🕐 Initialization time:', new Date().toLocaleTimeString());
    console.log('🕐 Time since navigation:', (Date.now() - performance.timing.navigationStart)/1000, 'seconds');
    
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timer setup
    console.log('🎬 Starting initial timer setup...');
    resetTimer();
    
    // Setup token refresh interval
    setupTokenRefresh();

    return () => {
      // Cleanup
      console.log('🧹 Cleaning up inactivity timeout');
      console.log('📍 Cleanup on page:', window.location.pathname);
      console.log('🕐 Cleanup time:', new Date().toLocaleTimeString());
      console.log('🕐 Time since navigation:', (Date.now() - performance.timing.navigationStart)/1000, 'seconds');
      
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        console.log('⏹️ Cleanup: Cleared timeout timer');
      }
      if (warningTimeoutIdRef.current) {
        clearTimeout(warningTimeoutIdRef.current);
        console.log('⏹️ Cleanup: Cleared warning timer');
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        console.log('⏹️ Cleanup: Cleared countdown interval');
      }
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
        console.log('⏹️ Cleanup: Cleared token refresh interval');
      }
    };
  }, [isAuthenticated, inactivityTimeout, warningTime, handleActivity, resetTimer, setupTokenRefresh]);

  // 🔍 MONITOR AUTHENTICATION STATE CHANGES
  useEffect(() => {
    console.log('🔄 AUTH STATE CHANGE detected in useInactivityTimeout');
    console.log('   New isAuthenticated value:', isAuthenticated);
    console.log('   Current page:', window.location.pathname);
    console.log('   Time since navigation:', (Date.now() - performance.timing.navigationStart)/1000, 'seconds');
    console.log('   Timestamp:', new Date().toLocaleTimeString());
    
    // Check if this is a premature auth state change during navigation
    const timeSincePageLoad = Date.now() - performance.timing.navigationStart;
    if (timeSincePageLoad < 10000 && !isAuthenticated) {
      console.warn('⚠️ SUSPICIOUS: Auth state became false shortly after navigation');
      console.warn('   This might be causing premature logout trigger');
      console.warn('   Time since navigation:', timeSincePageLoad, 'ms');
    }
  }, [isAuthenticated]);

  return {
    showWarning,
    secondsRemaining,
    resetTimer,
    extendSession,
  };
};

export default useInactivityTimeout;
