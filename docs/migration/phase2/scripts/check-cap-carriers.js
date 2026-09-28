/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const own = fs.readFileSync(
    path.join(path.resolve(__dirname, "../../../.."), "docs/migration/phase2/ownership-map.md"),
    "utf8",
);

function capTokens(i) {
    return [`CAP-${i}`, `CAP-${String(i).padStart(2, "0")}`];
}

const missing = [];
for (let i = 1; i <= 22; i++) {
    const tokens = capTokens(i);
    let found = false;
    for (const line of own.split("\n")) {
        if (!line.startsWith("| `")) continue;
        const parts = line.split("|").map((s) => s.trim());
        if (parts.length < 8) continue;
        const cls = parts[2];
        if (!["R", "F+", "FX"].includes(cls)) continue;
        if (tokens.some((t) => parts[4].includes(t))) {
            found = true;
            break;
        }
    }
    if (!found) missing.push(`CAP-${i}`);
}
console.log(JSON.stringify({ missing }, null, 2));
