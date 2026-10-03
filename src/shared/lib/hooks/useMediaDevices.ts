import { useCallback, useEffect, useState } from "react";

export const useMediaDevices = () => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const refresh = useCallback(async () => {
    setDevices(await navigator.mediaDevices.enumerateDevices());
  }, []);

  useEffect(() => {
    void refresh();

    navigator.mediaDevices.addEventListener("devicechange", refresh);
    return () =>
      navigator.mediaDevices.removeEventListener("devicechange", refresh);
  }, [refresh]);

  // До разрешения на микрофон label у всех устройств пустой.
  const hasPermission = devices.some((device) => device.label !== "");

  const requestPermission = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    await refresh();
  }, [refresh]);

  return {
    inputDevices: devices.filter((d) => d.kind === "audioinput"),
    outputDevices: devices.filter((d) => d.kind === "audiooutput"),
    videoDevices: devices.filter((d) => d.kind === "videoinput"),
    hasPermission,
    requestPermission,
  };
};
