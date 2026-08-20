import { useEffect, useState, useCallback } from "react";
import {
  getDeferredInstallPrompt,
  clearDeferredInstallPrompt,
  type BeforeInstallPromptEvent,
} from "@/pwa/deferredInstall";

function isStandaloneDisplay(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIosDevice(): boolean {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/**
 * Captura beforeinstallprompt (Chrome/Android) y detecta iOS para un banner de
 * "Agregar a inicio". El evento se guarda en window apenas llega, porque Chrome
 * suele dispararlo al registrar el SW, antes del useEffect de React.
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() =>
    typeof window === "undefined" ? null : getDeferredInstallPrompt()
  );
  const [standalone, setStandalone] = useState(() => (typeof window === "undefined" ? false : isStandaloneDisplay()));
  const [ios] = useState(() => (typeof window === "undefined" ? false : isIosDevice()));

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const onInstalled = () => {
      clearDeferredInstallPrompt();
      setDeferredPrompt(null);
      setStandalone(true);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    clearDeferredInstallPrompt();
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  return {
    canInstall: !standalone && deferredPrompt !== null,
    showIosHint: !standalone && ios,
    promptInstall,
  };
}
