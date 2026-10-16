"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

interface OfficeMapPickerProps {
  lat: number;
  lng: number;
  radius: number;
  onChange: (lat: number, lng: number) => void;
}

export default function OfficeMapPicker({
  lat,
  lng,
  radius,
  onChange,
}: OfficeMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;
      if (!isMounted || !mapContainerRef.current) return;

      // Custom modern OpenStreetMap SVG pin icon
      const pinIcon = L.divIcon({
        className: "custom-office-pin",
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #0284c7, #0369a1);
            border: 2px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 12px rgba(2, 132, 199, 0.45);
          ">
            <svg style="transform: rotate(45deg); width: 18px; height: 18px; color: white;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const initialLat = Number.isFinite(lat) && lat !== 0 ? lat : 37.7749;
      const initialLng = Number.isFinite(lng) && lng !== 0 ? lng : -122.4194;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: true,
      });

      // Official OpenStreetMap tile layer
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Marker
      const marker = L.marker([initialLat, initialLng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      // Radius Circle
      const circle = L.circle([initialLat, initialLng], {
        radius: radius || 200,
        color: "#0284c7",
        fillColor: "#38bdf8",
        fillOpacity: 0.2,
        weight: 2,
        dashArray: "4, 6",
      }).addTo(map);

      marker.on("dragend", (e: any) => {
        const position = e.target.getLatLng();
        onChange(Number(position.lat.toFixed(6)), Number(position.lng.toFixed(6)));
      });

      map.on("click", (e: any) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        marker.setLatLng([clickLat, clickLng]);
        circle.setLatLng([clickLat, clickLng]);
        onChange(Number(clickLat.toFixed(6)), Number(clickLng.toFixed(6)));
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map when external lat/lng changes
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && circleRef.current) {
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const currentPos = markerRef.current.getLatLng();
        if (Math.abs(currentPos.lat - lat) > 0.0001 || Math.abs(currentPos.lng - lng) > 0.0001) {
          markerRef.current.setLatLng([lat, lng]);
          circleRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());
        }
      }
    }
  }, [lat, lng]);

  // Update circle radius when radius prop changes
  useEffect(() => {
    if (circleRef.current && Number.isFinite(radius)) {
      circleRef.current.setRadius(radius);
    }
  }, [radius]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const userLat = Number(pos.coords.latitude.toFixed(6));
        const userLng = Number(pos.coords.longitude.toFixed(6));
        onChange(userLat, userLng);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([userLat, userLng], 16);
        }
      },
      (err) => {
        setIsLocating(false);
        setGpsError(err.message || "Failed to retrieve your current location");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#0284c7",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              padding: "2px 6px",
              borderRadius: "4px",
            }}
          >
            OpenStreetMap
          </span>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
            Click or drag marker to set coordinates
          </span>
        </div>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#0284c7",
            padding: "5px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <svg style={{ width: "13px", height: "13px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {isLocating ? "Locating..." : "Use Current GPS"}
        </button>
      </div>

      {gpsError && (
        <div style={{ fontSize: "12px", color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", padding: "6px 10px", borderRadius: "6px" }}>
          {gpsError}
        </div>
      )}

      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "240px",
          borderRadius: "10px",
          overflow: "hidden",
          border: "1px solid #cbd5e1",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          position: "relative",
          zIndex: 1,
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b" }}>
        <span style={{ fontFamily: "monospace", color: "#0284c7", fontWeight: 600 }}>
          Pin: [{lat.toFixed(5)}, {lng.toFixed(5)}]
        </span>
        <span>Geofence: {radius}m radius</span>
      </div>
    </div>
  );
}
