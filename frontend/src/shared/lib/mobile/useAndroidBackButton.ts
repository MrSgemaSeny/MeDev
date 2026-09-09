import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

const ROOT_ROUTES = ['/', '/resume', '/portfolio', '/tracker'];

export function useAndroidBackButton() {
  let navigate: ReturnType<typeof useNavigate> | null = null;
  let location: ReturnType<typeof useLocation> | null = null;

  try {
    navigate = useNavigate();
    location = useLocation();
  } catch {
    // Graceful fallback when invoked outside RouterProvider context
  }

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handler = App.addListener('backButton', ({ canGoBack }) => {
      const currentPath = location?.pathname || window.location.pathname;
      if (canGoBack && !ROOT_ROUTES.includes(currentPath)) {
        if (navigate) {
          navigate(-1);
        } else {
          window.history.back();
        }
      } else {
        App.exitApp();
      }
    });

    return () => {
      handler.then((h) => h.remove());
    };
  }, [location?.pathname, navigate]);
}
