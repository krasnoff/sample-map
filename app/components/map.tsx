"use client";

import { useRef, useEffect, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./map.css";
import { MapType } from "./map-types";

export type Location = {
  longitude: number;
  latitude: number;
};

type MapProps = {
  location: Location;
  showMarker?: boolean;
  mapType?: MapType;
};

export default function Map({ location, showMarker = false, mapType = MapType.STREETS }: MapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const { longitude, latitude } = location;
  const [zoom] = useState(9.79);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
    if (!apiKey) return;
    maptilersdk.config.apiKey = apiKey;

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle[mapType],
      center: [longitude, latitude],
      zoom,
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [longitude, latitude, zoom, mapType]);

  useEffect(() => {
    if (!showMarker || !map.current) return;

    const marker = new maptilersdk.Marker()
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    return () => {
      marker.remove();
    };
  }, [showMarker, longitude, latitude, mapType]);

  return (
    <div style={{ display: "flex", width: "100%" }}>
      <div className="map-container">
        <div ref={mapContainer} id="map" className="map" />
      </div>
    </div>
  );
}
