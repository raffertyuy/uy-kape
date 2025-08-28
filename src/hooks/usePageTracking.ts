import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackClarityEvent, trackPageView } from "@/utils/analytics";

/**
 * Hook to automatically track page views with Google Analytics
 * when the route changes in React Router
 */
export const usePageTracking = (): void => {
  const location = useLocation();

  useEffect(() => {
    // Get page title from document
    const pageTitle = document.title;

    // Track the page view in Google Analytics
    trackPageView(location.pathname + location.search, pageTitle);

    // Track the page view in Microsoft Clarity
    trackClarityEvent("page_view", {
      path: location.pathname + location.search,
      title: pageTitle,
    });
  }, [location]);
};
