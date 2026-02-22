import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { reverseGeocode } from "@/lib/reverse-geocode";

// Fix default icon issue in Leaflet with React
if (typeof window !== "undefined" && L && L.Icon && L.Icon.Default) {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });
}

export default function ScanLocationMap({ scanHistory }: { scanHistory: any[] }) {
  const [mounted, setMounted] = useState(false);
  // Center map on the most recent scan, or fallback to a default location
  const latest = scanHistory && scanHistory.length > 0 ? scanHistory[0] : null;
  const center: LatLngExpression = latest && latest.latitude && latest.longitude
    ? [latest.latitude, latest.longitude]
    : [20.5937, 78.9629]; // Default: India

  // Address state for each marker
  const [addresses, setAddresses] = useState<{ [idx: number]: string | null }>({});

  useEffect(() => {
    let cancelled = false;
    const fetchAddresses = async () => {
      const newAddresses: { [idx: number]: string | null } = {};
      await Promise.all((scanHistory || []).map(async (scan, idx) => {
        if (scan.latitude && scan.longitude) {
          const addr = await reverseGeocode(scan.latitude, scan.longitude);
          newAddresses[idx] = addr;
        } else {
          newAddresses[idx] = null;
        }
      }));
      if (!cancelled) setAddresses(newAddresses);
    };
    fetchAddresses();
    return () => { cancelled = true; };
  }, [scanHistory]);

  useEffect(() => {
    setMounted(true);
    // Ensure map resizes correctly
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 500);
  }, []);

  if (!mounted || typeof window === "undefined") {
    return <div style={{ height: 350, width: "100%" }} />;
  }

  return (
    <div style={{ height: 350, width: "100%" }}>
      <MapContainer center={center} zoom={5} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {scanHistory && scanHistory.map((scan, idx) => (
          scan.latitude && scan.longitude && (
            <Marker key={idx} position={[scan.latitude, scan.longitude]}>
              <Popup>
                <div>
                  <div><b>Scanned at:</b> {scan.scanned_at ? new Date(scan.scanned_at).toLocaleString() : "—"}</div>
                  <div><b>Accuracy:</b> {scan.accuracy ? `${scan.accuracy} m` : "—"}</div>
                  <div><b>Address:</b> {addresses[idx] === undefined ? <span className="text-gray-400">Loading…</span> : (addresses[idx] || <span className="text-gray-400">Not found</span>)}</div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}
