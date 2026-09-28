/* eslint-disable no-console */
/**
 * Merchant settings ID reference scan for phase 2.
 * Run: node docs/migration/phase2/scripts/scan-settings-refs.js
 */
const fs = require("fs");
const path = require("path");
const { parse } = require(path.join(path.resolve(__dirname, "../../../.."), "node_modules/jsonc-parser"));

const root = path.resolve(__dirname, "../../../..");

function collectSettingIds(obj, out) {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
        obj.forEach((v) => collectSettingIds(v, out));
        return;
    }
    for (const [k, v] of Object.entries(obj)) {
        if (k === "settings" && v && typeof v === "object" && !Array.isArray(v)) {
            Object.keys(v).forEach((id) => out.add(id));
        }
        collectSettingIds(v, out);
    }
}

function loadJsonc(filePath) {
    return parse(fs.readFileSync(filePath, "utf8"));
}

const referenced = new Set();
const sources = [];

const settingsData = loadJsonc(path.join(root, "config/settings_data.json"));
function collectThemeCurrent(obj) {
    if (!obj || typeof obj !== "object") return;
    for (const [k, v] of Object.entries(obj)) {
        if (k === "sections") {
            collectSettingIds(v, referenced);
            continue;
        }
        if (k === "content_for_index" || k === "blocks") continue;
        referenced.add(k);
    }
}
if (settingsData.current) {
    collectThemeCurrent(settingsData.current);
    sources.push("config/settings_data.json (current top-level + section settings)");
}
if (settingsData.presets && typeof settingsData.presets === "object") {
    for (const [name, preset] of Object.entries(settingsData.presets)) {
        collectThemeCurrent(preset);
        sources.push(`config/settings_data.json (presets.${name})`);
    }
}

for (const name of fs.readdirSync(path.join(root, "templates"))) {
    if (!name.endsWith(".json")) continue;
    const p = path.join("templates", name);
    collectSettingIds(loadJsonc(path.join(root, p)), referenced);
    sources.push(p);
}

for (const name of fs.readdirSync(path.join(root, "sections"))) {
    if (!name.endsWith("-group.json")) continue;
    const p = path.join("sections", name);
    collectSettingIds(loadJsonc(path.join(root, p)), referenced);
    sources.push(p);
}

const check = ["reveal_behavior", "toast_position", "type_header_font", "color_schemes"];
console.log(
    JSON.stringify(
        {
            referencedCount: referenced.size,
            sources: sources.length,
            checks: Object.fromEntries(check.map((id) => [id, referenced.has(id)])),
            ids: [...referenced].sort(),
        },
        null,
        2,
    ),
);
