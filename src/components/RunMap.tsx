"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { GpsPoint } from "@/lib/haversine";

interface Props {
  points: GpsPoint[];
}

export default function RunMap({ points }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const polylineBorderRef = useRef<any>(null);
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

      // CartoDB Voyager: Googleマップに近いクリーンなデザイン
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CartoDB",
        maxZoom: 19,
      }).addTo(map);

      // ズームコントロールを右下に
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;
      setTimeout(() => { if (!cancelled) map.invalidateSize(); }, 100);
    });

    return () => {
      cancelled = true;
      if (map) {
        map.remove();
        mapInstanceRef.current = null;
        polylineRef.current = null;
        polylineBorderRef.current = null;
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

      // 白縁（下レイヤー）+ オレンジ線（上レイヤー）でナビ線っぽく
      if (polylineBorderRef.current) {
        polylineBorderRef.current.setLatLngs(latLngs);
        polylineRef.current.setLatLngs(latLngs);
      } else {
        polylineBorderRef.current = L.polyline(latLngs, {
          color: "white",
          weight: 8,
          opacity: 0.9,
        }).addTo(map);
        polylineRef.current = L.polyline(latLngs, {
          color: "#FF6B00",
          weight: 5,
          opacity: 1,
        }).addTo(map);
      }

      const last = points[points.length - 1];
      if (markerRef.current) {
        markerRef.current.setLatLng([last.lat, last.lng]);
      } else {
        // Googleマップ風の青いパルスドット
        const icon = L.divIcon({
          html: '<div class="gmap-marker"><div class="gmap-pulse"></div><div class="gmap-dot"></div></div>',
          className: "",
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        markerRef.current = L.marker([last.lat, last.lng], { icon }).addTo(map);
      }

      map.setView([last.lat, last.lng], map.getZoom());
    });
  }, [points]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", background: "#e8e0d8" }}
    />
  );
}
