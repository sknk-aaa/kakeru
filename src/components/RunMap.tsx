"use client";

import { useEffect, useRef } from "react";
import type { GpsPoint } from "@/lib/haversine";

interface Props {
  points: GpsPoint[];
}

export default function RunMap({ points }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const polylineRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      const map = L.map(mapRef.current!, {
        center: [35.6762, 139.6503],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || points.length === 0) return;
    import("leaflet").then((L) => {
      const map = mapInstanceRef.current as any;
      const latLngs = points.map((p) => [p.lat, p.lng] as [number, number]);

      if (polylineRef.current) {
        (polylineRef.current as any).setLatLngs(latLngs);
      } else {
        polylineRef.current = L.polyline(latLngs, {
          color: "#FF6B00",
          weight: 4,
          opacity: 0.9,
        }).addTo(map);
      }

      const last = points[points.length - 1];
      if (markerRef.current) {
        (markerRef.current as any).setLatLng([last.lat, last.lng]);
      } else {
        const icon = L.divIcon({
          html: '<div style="width:12px;height:12px;background:#FF6B00;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>',
          className: "",
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });
        markerRef.current = L.marker([last.lat, last.lng], { icon }).addTo(map);
      }

      map.setView([last.lat, last.lng], 16);
    });
  }, [points]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", background: "#F0F0F0" }}
    />
  );
}
