"use client";

import { useRef, useEffect, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./map.css";
import Box from "@mui/material/Box";

export default function Map() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const center = { lng: -157.9253, lat: 21.4732 };
  const [zoom] = useState(9.79);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
    if (!apiKey) return;
    maptilersdk.config.apiKey = apiKey;

    map.current = new maptilersdk.Map({
      container: mapContainer.current,
      style: maptilersdk.MapStyle.STREETS,
      center: [center.lng, center.lat],
      zoom,
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [center.lng, center.lat, zoom]);

  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      <div className="map-container">
        <div ref={mapContainer} id="map" className="map" />
      </div>
    </Box>
  );
}
