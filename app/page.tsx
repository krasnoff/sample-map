"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.scss";
import Map, { type Location } from './components/map';
import { MapType } from './components/map-types';
import { createLocationTool, createMarkerVisibilityTool, createListMapTypesTool, createSetMapTypeTool, type ModelContext } from "./location-tool";

export default function Home() {
  const [location, setLocation] = useState<Location>({ longitude: 34.8532, latitude: 32.3215 });
  const [showMarker, setShowMarker] = useState(true);
  const [mapType, setMapType] = useState<MapType>(MapType.STREETS);

  useEffect(() => {
    const { modelContext } = document as Document & { modelContext?: ModelContext };
    if (!modelContext) return;

    const controller = new AbortController();
    void (async () => {
      try {
        await modelContext.registerTool(createLocationTool(setLocation), { signal: controller.signal });
        await modelContext.registerTool(createMarkerVisibilityTool(setShowMarker), { signal: controller.signal });
        await modelContext.registerTool(createListMapTypesTool(), { signal: controller.signal });
        await modelContext.registerTool(createSetMapTypeTool(setMapType), { signal: controller.signal });
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Could not register the map tools.", error);
        }
      }
    })();

    return () => controller.abort();
  }, []);

  return (
    <div className={styles.page}>
      <Map location={location} showMarker={showMarker} mapType={mapType} />
    </div>
  );
}
