import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

const ROOT_ROUTES = ['/', '/resume', '/portfolio', '/tracker', '/login', '/dashboard'];

export function useAndroidBackButton() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handler = App.addListener('backButton', ({ canGoBack }) => {
      const pathname = window.location.pathname;
      if (canGoBack && !ROOT_ROUTES.includes(pathname)) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });

    return () => {
      handler.then((h) => h.remove());
    };
  }, []);
}
