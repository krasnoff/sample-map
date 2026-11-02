import type { Location } from "./components/map";
import { MapType } from "./components/map-types.ts";

type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

export type ModelContext = {
  registerTool: (
    tool: ReturnType<typeof createLocationTool> | ReturnType<typeof createMarkerVisibilityTool>
      | ReturnType<typeof createListMapTypesTool> | ReturnType<typeof createSetMapTypeTool>,
    options: { signal: AbortSignal },
  ) => void | Promise<unknown>;
};

export function createLocationTool(setLocation: (location: Location) => void) {
  return {
    name: "set_location",
    description: "Set the map's location and move its marker, when visible, to the specified coordinates.",
    inputSchema: {
      type: "object",
      properties: {
        longitude: { type: "number", minimum: -180, maximum: 180 },
        latitude: { type: "number", minimum: -90, maximum: 90 },
      },
      required: ["longitude", "latitude"],
      additionalProperties: false,
    },
    async execute(input: unknown): Promise<ToolResult> {
      if (typeof input !== "object" || input === null) {
        return errorResult();
      }

      const { longitude, latitude } = input as Record<string, unknown>;
      if (
        typeof longitude !== "number" || !Number.isFinite(longitude) ||
        longitude < -180 || longitude > 180 ||
        typeof latitude !== "number" || !Number.isFinite(latitude) ||
        latitude < -90 || latitude > 90 ||
        Object.keys(input).some((key) => key !== "longitude" && key !== "latitude")
      ) {
        return errorResult();
      }

      setLocation({ longitude, latitude });
      return {
        content: [{ type: "text", text: `Map location set to longitude ${longitude}, latitude ${latitude}.` }],
      };
    },
  };
}

export function createMarkerVisibilityTool(setShowMarker: (visible: boolean) => void) {
  return {
    name: "set_marker_visibility",
    description: "Show or hide the marker at the map's current location.",
    inputSchema: {
      type: "object",
      properties: {
        visible: { type: "boolean" },
      },
      required: ["visible"],
      additionalProperties: false,
    },
    async execute(input: unknown): Promise<ToolResult> {
      if (
        typeof input !== "object" || input === null ||
        !("visible" in input) || typeof input.visible !== "boolean" ||
        Object.keys(input).some((key) => key !== "visible")
      ) {
        return {
          isError: true,
          content: [{ type: "text", text: "Provide only visible as a boolean: true to show the marker, false to hide it." }],
        };
      }

      setShowMarker(input.visible);
      return {
        content: [{ type: "text", text: input.visible ? "Map marker shown." : "Map marker hidden." }],
      };
    },
  };
}

export function createListMapTypesTool() {
  return {
    name: "list_map_types",
    description: "List the available map types that can be used to change the map display.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    async execute(): Promise<ToolResult> {
      return {
        content: [{ type: "text", text: JSON.stringify({ mapTypes: Object.values(MapType) }) }],
      };
    },
    annotations: { readOnlyHint: true },
  };
}

export function createSetMapTypeTool(setMapType: (mapType: MapType) => void) {
  return {
    name: "set_map_type",
    description: "Switch the map display to an available map type. Use list_map_types to discover choices.",
    inputSchema: {
      type: "object",
      properties: { mapType: { type: "string", enum: Object.values(MapType) } },
      required: ["mapType"],
      additionalProperties: false,
    },
    async execute(input: unknown): Promise<ToolResult> {
      if (
        typeof input !== "object" || input === null ||
        !("mapType" in input) || typeof input.mapType !== "string" ||
        !Object.hasOwn(MapType, input.mapType) ||
        Object.keys(input).some((key) => key !== "mapType")
      ) {
        return {
          isError: true,
          content: [{ type: "text", text: "Provide only mapType using a value returned by list_map_types." }],
        };
      }

      const mapType = MapType[input.mapType as keyof typeof MapType];
      setMapType(mapType);
      return { content: [{ type: "text", text: `Map type set to ${mapType}.` }] };
    },
  };
}

function errorResult(): ToolResult {
  return {
    isError: true,
    content: [{ type: "text", text: "Provide only longitude (-180 to 180) and latitude (-90 to 90) as finite numbers." }],
  };
}
