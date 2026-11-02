import assert from "node:assert/strict";
import test from "node:test";
import { createLocationTool, createMarkerVisibilityTool, createListMapTypesTool, createSetMapTypeTool } from "../app/location-tool.ts";

test("every listed map type can be selected", async () => {
  const result = await createListMapTypesTool().execute();
  const { mapTypes } = JSON.parse(result.content[0].text);
  assert.ok(mapTypes.includes("STREETS"));
  assert.ok(mapTypes.includes("SATELLITE"));
  const updates = [];
  const tool = createSetMapTypeTool((mapType) => updates.push(mapType));
  assert.deepEqual(mapTypes, tool.inputSchema.properties.mapType.enum);
  for (const mapType of mapTypes) {
    assert.equal((await tool.execute({ mapType })).isError, undefined);
  }
  assert.deepEqual(updates, mapTypes);
});

test("rejects invalid map types without changing the display", async () => {
  const tool = createSetMapTypeTool(() => assert.fail("Invalid input changed map type"));
  for (const input of [null, {}, "SATELLITE", { mapType: "unknown" },
    { mapType: "toString" }, { mapType: "__proto__" }, { mapType: 1 },
    { mapType: "STREETS", extra: true }]) {
    assert.equal((await tool.execute(input)).isError, true);
  }
});

test("shows and hides the marker", async () => {
  const updates = [];
  const tool = createMarkerVisibilityTool((visible) => updates.push(visible));
  for (const visible of [true, false, true]) {
    assert.equal((await tool.execute({ visible })).isError, undefined);
  }
  assert.deepEqual(updates, [true, false, true]);
});

test("rejects invalid visibility input without changing the marker", async () => {
  const tool = createMarkerVisibilityTool(() => assert.fail("Invalid input changed visibility"));
  for (const input of [null, {}, true, { visible: "false" }, { visible: 0 },
    { visible: false, extra: true }]) {
    assert.equal((await tool.execute(input)).isError, true);
  }
});

test("updates the location for valid coordinates, including boundaries", async () => {
  const updates = [];
  const tool = createLocationTool((location) => updates.push(location));
  for (const location of [
    { longitude: 0, latitude: 0 },
    { longitude: -180, latitude: -90 },
    { longitude: 180, latitude: 90 },
    { longitude: 34.8532, latitude: 32.3215 },
  ]) {
    assert.equal((await tool.execute(location)).isError, undefined);
    assert.deepEqual(updates.at(-1), location);
  }
});

test("rejects invalid coordinates without changing the location", async () => {
  const tool = createLocationTool(() => assert.fail("Invalid input changed location"));
  for (const input of [null, {}, "location", { longitude: 0 },
    { longitude: "0", latitude: 0 }, { longitude: 181, latitude: 0 },
    { longitude: 0, latitude: -91 }, { longitude: NaN, latitude: 0 },
    { longitude: 0, latitude: Infinity }, { longitude: 0, latitude: 0, extra: true },
  ]) {
    assert.equal((await tool.execute(input)).isError, true);
  }
});
