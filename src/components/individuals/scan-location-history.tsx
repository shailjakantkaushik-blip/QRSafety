"use client";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { useMemo, useEffect, useState } from "react";
import { reverseGeocode } from "@/lib/reverse-geocode";

const ScanLocationMap = dynamic(() => import("@/components/individuals/scan-location-map"), { ssr: false });

export default function ScanLocationHistory({ scanHistory }: { scanHistory: any[] }) {
  const hasHistory = Array.isArray(scanHistory) && scanHistory.length > 0;
  const sortedHistory = useMemo(() =>
    hasHistory ? [...scanHistory].sort((a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime()).slice(0, 5) : [],
    [scanHistory, hasHistory]
  );

  // Address state for each scan (indexed by idx)
  const [addresses, setAddresses] = useState<{ [idx: number]: string | null }>({});

  useEffect(() => {
    if (!hasHistory) return;
    let cancelled = false;
    const fetchAddresses = async () => {
      const newAddresses: { [idx: number]: string | null } = {};
      await Promise.all(sortedHistory.map(async (scan, idx) => {
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
    // Only rerun if sortedHistory changes
  }, [hasHistory, sortedHistory]);
  // Helper for consistent client-side date formatting
  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return "—";
    }
  };
  return (
    <Card className="p-6 md:col-span-2">
      <div className="font-semibold mb-2">QR Scan Location History</div>
      {hasHistory ? (
        <>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full text-xs">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">Scanned At</th>
                  <th className="px-2 py-1 text-left">Latitude</th>
                  <th className="px-2 py-1 text-left">Longitude</th>
                  <th className="px-2 py-1 text-left">Accuracy</th>
                  <th className="px-2 py-1 text-left">Address</th>
                </tr>
              </thead>
              <tbody>
                {sortedHistory.map((scan, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-2 py-1">{scan.scanned_at ? formatDate(scan.scanned_at) : "—"}</td>
                    <td className="px-2 py-1">{scan.latitude ?? "—"}</td>
                    <td className="px-2 py-1">{scan.longitude ?? "—"}</td>
                    <td className="px-2 py-1">{scan.accuracy ? `${scan.accuracy} m` : "—"}</td>
                    <td className="px-2 py-1">
                      {scan.latitude && scan.longitude
                        ? (addresses[idx] === undefined
                            ? <span className="text-gray-400">Loading…</span>
                            : addresses[idx] || <span className="text-gray-400">Not found</span>
                          )
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ScanLocationMap scanHistory={sortedHistory} />
        </>
      ) : (
        <div className="text-sm text-muted-foreground">No scan history available.</div>
      )}
    </Card>
  );
}
