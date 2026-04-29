"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { Map, Polyline, Marker, Circle } from "leaflet";
import type { GpsPoint } from "@/lib/haversine";

interface Props {
  points: GpsPoint[];
  currentPosition?: GpsPoint | null;
}

export default function RunMap({ points, currentPosition }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const polylineRef = useRef<Polyline | null>(null);
  const polylineBorderRef = useRef<Polyline | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const accuracyCircleRef = useRef<Circle | null>(null);
  const [mapVersion, setMapVersion] = useState(0);

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;
    let map: Map | null = null;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current) return;

      map = L.map(mapRef.current, {
        center: [35.6762, 139.6503],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution: "© OpenStreetMap © CARTO",
          maxZoom: 19,
          subdomains: "abcd",
        }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;
      setMapVersion((v) => v + 1);
      setTimeout(() => { if (!cancelled) map?.invalidateSize(); }, 100);
    });

    return () => {
      cancelled = true;
      if (map) {
        map.remove();
        mapInstanceRef.current = null;
        polylineRef.current = null;
        polylineBorderRef.current = null;
        markerRef.current = null;
        accuracyCircleRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      if (points.length === 0) {
        if (polylineBorderRef.current) {
          map.removeLayer(polylineBorderRef.current);
          polylineBorderRef.current = null;
        }
        if (polylineRef.current) {
          map.removeLayer(polylineRef.current);
          polylineRef.current = null;
        }
      } else {
        const latLngs = points.map((p) => [p.lat, p.lng] as [number, number]);

        if (polylineBorderRef.current) {
          polylineBorderRef.current.setLatLngs(latLngs);
          polylineRef.current?.setLatLngs(latLngs);
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
      }

      const last = currentPosition ?? points[points.length - 1];
      if (!last) return;
      const latlng: [number, number] = [last.lat, last.lng];

      if (last.accuracy) {
        if (accuracyCircleRef.current) {
          accuracyCircleRef.current.setLatLng(latlng).setRadius(last.accuracy);
        } else {
          accuracyCircleRef.current = L.circle(latlng, {
            radius: last.accuracy,
            color: "#22C55E",
            fillColor: "#22C55E",
            fillOpacity: 0.08,
            weight: 1,
            opacity: 0.4,
          }).addTo(map);
        }
      } else if (accuracyCircleRef.current) {
        map.removeLayer(accuracyCircleRef.current);
        accuracyCircleRef.current = null;
      }

      if (markerRef.current) {
        markerRef.current.setLatLng(latlng);
      } else {
        const icon = L.divIcon({
          html: '<div class="gmap-marker"><div class="gmap-pulse"></div><div class="gmap-dot"></div></div>',
          className: "",
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        markerRef.current = L.marker(latlng, { icon }).addTo(map);
      }

      map.setView(latlng, map.getZoom());
    });
  }, [points, currentPosition, mapVersion]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", background: "#e8e4dc" }}
    />
  );
}
