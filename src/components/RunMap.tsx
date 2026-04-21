"use client";

import { useEffect, useRef } from "react";
import type { GpsPoint } from "@/lib/haversine";

interface Props {
  points: GpsPoint[];
}

export default function RunMap({ points }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;
    let map: any = null;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current) return;

      map = L.map(mapRef.current, {
        center: [35.6762, 139.6503],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      mapInstanceRef.current = map;

      // flex-1コンテナのレイアウト確定後にサイズ再計算
      setTimeout(() => { if (!cancelled) map.invalidateSize(); }, 100);
    });

    return () => {
      cancelled = true;
      if (map) {
        map.remove();
        mapInstanceRef.current = null;
        polylineRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || points.length === 0) return;
    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;
      const latLngs = points.map((p) => [p.lat, p.lng] as [number, number]);

      if (polylineRef.current) {
        polylineRef.current.setLatLngs(latLngs);
      } else {
        polylineRef.current = L.polyline(latLngs, {
          color: "#FF6B00",
          weight: 4,
          opacity: 0.9,
        }).addTo(map);
      }

      const last = points[points.length - 1];
      if (markerRef.current) {
        markerRef.current.setLatLng([last.lat, last.lng]);
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
