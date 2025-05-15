import { useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useSessionTimeout = (
  user: User | null,
  logout: () => Promise<void>,
  logInactivityEvent: () => Promise<void>,
  sessionInactivityTimeout: string,
  enableInactivityTracking: boolean,
  logSessionRefreshEvent: () => Promise<void>,
  sessionTimeout: string
) => {
  // Set up inactivity tracking
  useEffect(() => {
    if (!user || !enableInactivityTracking) return;

    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);

      inactivityTimer = setTimeout(async () => {
        console.log("User inactive, logging out...");

        // Log inactivity timeout event and then logout
        try {
          await logInactivityEvent();
          logout();
        } catch (error) {
          console.error("Error in inactivity timeout:", error);
          logout();
        }
      }, parseInt(sessionInactivityTimeout) * 1000);
    };

    // Set initial timer
    resetInactivityTimer();

    // Reset timer on user activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    activityEvents.forEach((event) => {
      document.addEventListener(event, resetInactivityTimer);
    });

    // Cleanup
    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      activityEvents.forEach((event) => {
        document.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [
    user,
    enableInactivityTracking,
    sessionInactivityTimeout,
    logout,
    logInactivityEvent,
  ]);

  // Set up session timeout and refresh
  useEffect(() => {
    if (!user) return;

    // Get session expiry from Supabase (falls back to configuration if not available)
    const checkAndRefreshSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;

      // If session is close to expiring (within 5 minutes), refresh it
      const expiresAt = data.session.expires_at;
      if (expiresAt) {
        const expiryTime = new Date(expiresAt * 1000);
        const now = new Date();
        const timeUntilExpiry = expiryTime.getTime() - now.getTime();

        // If less than 5 minutes until expiry, refresh the session
        if (timeUntilExpiry < 300000) {
          console.log("Session close to expiry, refreshing...");

          // Log session refresh event
          await logSessionRefreshEvent();
          await supabase.auth.refreshSession();
        }
      }
    };

    // Check session status periodically
    const sessionCheckTimer = setInterval(checkAndRefreshSession, 60000); // Every minute

    return () => {
      clearInterval(sessionCheckTimer);
    };
  }, [user, sessionTimeout, logSessionRefreshEvent]);
};
