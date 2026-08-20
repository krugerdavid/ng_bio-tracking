interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __NG_DEFERRED_INSTALL?: BeforeInstallPromptEvent;
  }
}

function capture(event: Event) {
  event.preventDefault();
  window.__NG_DEFERRED_INSTALL = event as BeforeInstallPromptEvent;
}

/** Escucha beforeinstallprompt lo antes posible: Chrome a veces lo dispara al registrar el SW, antes de que React monte. */
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", capture);
}

export type { BeforeInstallPromptEvent };

export function getDeferredInstallPrompt(): BeforeInstallPromptEvent | null {
  return window.__NG_DEFERRED_INSTALL ?? null;
}

export function clearDeferredInstallPrompt() {
  window.__NG_DEFERRED_INSTALL = undefined;
}
