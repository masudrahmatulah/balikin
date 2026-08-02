"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getMapConfig, getLocationTypeColor, type MapMarker } from "@/lib/map-utils";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface LeafletMapProps {
  regionId: string;
  reports: Array<{
    id: string;
    locationName: string;
    locationType: string;
    cityName: string;
    lostItemType: string;
  }>;
}

export function LeafletMap({ regionId, reports }: LeafletMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [containerId] = useState(`map-${Date.now()}`);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize map
    const mapConfig = getMapConfig(regionId);
    const mapInstance = L.map(containerId).setView(mapConfig.center, mapConfig.zoom);

    // Add tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapInstance);

    setMap(mapInstance);

    // Cleanup
    return () => {
      mapInstance.remove();
    };
  }, [containerId, regionId]);

  // Update markers when reports change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        layer.remove();
      }
    });

    // Add markers for each report
    // Note: In a production app, you'd want to geocode the city/location names
    // For now, we'll use a simplified approach with random offsets around the region center
    const mapConfig = getMapConfig(regionId);

    reports.forEach((report, index) => {
      // Create a pseudo-random position based on the report ID and index
      // This is just for demo - in production you'd store actual coordinates
      const offsetLat = (Math.sin(index * 123.456) * 0.1);
      const offsetLng = (Math.cos(index * 789.012) * 0.1);
      const lat = mapConfig.center[0] + offsetLat;
      const lng = mapConfig.center[1] + offsetLng;

      const color = getLocationTypeColor(report.locationType);

      // Create custom marker with color
      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Add popup
      marker.bindPopup(`
        <div class="text-sm">
          <strong>${report.locationName}</strong><br/>
          <span style="color: ${color}">${report.locationType}</span><br/>
          ${report.cityName}<br/>
          <em>Rawan: ${report.lostItemType}</em>
        </div>
      `);
    });

    // Fit bounds if there are markers
    if (reports.length > 0) {
      const bounds = L.latLngBounds(
        reports.map((_, index) => {
          const offsetLat = (Math.sin(index * 123.456) * 0.1);
          const offsetLng = (Math.cos(index * 789.012) * 0.1);
          return [mapConfig.center[0] + offsetLat, mapConfig.center[1] + offsetLng];
        })
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, reports, regionId]);

  return <div id={containerId} className="h-80 w-full rounded-lg" />;
}
