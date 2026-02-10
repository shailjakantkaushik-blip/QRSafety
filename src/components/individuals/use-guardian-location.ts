import { useEffect, useState } from "react";

export function useGuardianLocation() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        setLocation(null);
      }
    );
  }, []);

  return location;
}
