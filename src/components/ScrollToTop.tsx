import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();
  const prevPathRef = useRef<string>('');

  useEffect(() => {
    // Check if we're going back (using browser back button or navigation)
    // We detect this by checking if the new path is a parent of the previous path
    const isGoingBack = prevPathRef.current.startsWith(pathname) && prevPathRef.current !== pathname;
    
    // Only scroll to top if NOT going back
    if (!isGoingBack) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' as ScrollBehavior,
      });
    }

    // Update previous path
    prevPathRef.current = pathname;
  }, [pathname]);

  return null;
};
