"use client";
import { useEffect, useState } from "react";

export default function QrScanLocationCapture({ individualId }: { individualId: string }) {
  const [status, setStatus] = useState<string>("");
  useEffect(() => {
    if (!individualId) return;
    if (!navigator.geolocation) {
      setStatus("Geolocation not supported");
      return;
    }
    setStatus("Requesting location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus("Location captured. Sending...");
        fetch("/api/qr-scan-location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            individual_id: individualId,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) setStatus("Scan location saved");
            else setStatus("Failed to save location");
          })
          .catch(() => setStatus("Failed to send location"));
      },
      (err) => {
        setStatus("Location permission denied or unavailable");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [individualId]);
  return <div style={{ display: "none" }}>{status}</div>; // Hidden, but can be shown for debugging
}
