import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

/**
 * Следит, смотрит ли пользователь на приложение прямо сейчас.
 * На десктопе это фокус окна, на Android свёрнутое приложение видно
 * по visibilityState. Возвращает функцию отписки.
 */
export const trackWindowFocus = (onChange: (isFocused: boolean) => void) => {
  let hasWindowFocus = document.hasFocus();

  const emit = () =>
    onChange(hasWindowFocus && document.visibilityState === "visible");

  const handleVisibility = () => emit();
  const handleFocus = () => {
    hasWindowFocus = true;
    emit();
  };
  const handleBlur = () => {
    hasWindowFocus = false;
    emit();
  };

  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("focus", handleFocus);
  window.addEventListener("blur", handleBlur);

  let unlistenTauri: (() => void) | undefined;
  let isDisposed = false;

  if (isTauri()) {
    const appWindow = getCurrentWindow();

    void appWindow
      .isFocused()
      .then((focused) => {
        if (isDisposed) return;
        hasWindowFocus = focused;
        emit();
      })
      .catch(() => {});

    void appWindow
      .onFocusChanged(({ payload: focused }) => {
        hasWindowFocus = focused;
        emit();
      })
      .then((unlisten) => {
        if (isDisposed) unlisten();
        else unlistenTauri = unlisten;
      })
      .catch(() => {});
  }

  emit();

  return () => {
    isDisposed = true;
    document.removeEventListener("visibilitychange", handleVisibility);
    window.removeEventListener("focus", handleFocus);
    window.removeEventListener("blur", handleBlur);
    unlistenTauri?.();
  };
};
