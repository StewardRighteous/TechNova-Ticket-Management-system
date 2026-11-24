import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parsers } from "prettier/plugins/typescript";

const root = fileURLToPath(new URL("../src/", import.meta.url));
const uiRoot = path.join(root, "ui");
const layers = ["atoms", "molecules", "groups", "sections"];
const uiElements = new Set([
  "a", "button", "datalist", "dialog", "input", "label", "option", "textarea",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "table", "caption", "col", "colgroup", "thead", "tbody", "tfoot", "tr", "td", "th",
]);
const interactiveRoles = new Set(["alertdialog", "button", "combobox", "dialog", "switch"]);

function walk(node, visit) {
  if (!node || typeof node !== "object") return;
  if (typeof node.type === "string") visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (key === "loc" || key === "range" || key === "tokens" || key === "comments") continue;
    if (Array.isArray(value)) value.forEach((child) => walk(child, visit));
    else walk(value, visit);
  }
}

const violations = [];
const entries = await readdir(root, { recursive: true, withFileTypes: true });
for (const entry of entries) {
  if (!entry.isFile() || !/\.[jt]sx?$/.test(entry.name)) continue;
  const file = path.join(entry.parentPath, entry.name);
  const relative = path.relative(root, file);
  const [directory, layer] = relative.split(path.sep);
  const inUI = directory === "ui";
  const layerIndex = layers.indexOf(layer);
  const ast = await parsers.typescript.parse(await readFile(file, "utf8"));

  const report = (node, message) => violations.push(`src/${relative.replaceAll(path.sep, "/")}:${node.loc.start.line} ${message}`);
  walk(ast, (node) => {
    if (node.type === "JSXOpeningElement" && node.name.type === "JSXIdentifier") {
      const name = node.name.name;
      if (name === "select") report(node, "Use SelectDropdown or ComboboxFilter for selection controls.");
      else if (!inUI && uiElements.has(name)) report(node, `Render <${name}> in src/ui and compose it here.`);
      else if (!inUI && /^[a-z]/.test(name)) {
        const role = node.attributes.find((attribute) => attribute.name?.name === "role")?.value?.value;
        if (interactiveRoles.has(role)) report(node, `Define the ${role} in src/ui and compose it here.`);
      }
    }

    if (!inUI || !node.source?.value?.startsWith(".")) return;
    const target = path.resolve(path.dirname(file), node.source.value);
    const [targetDirectory, targetLayer] = path.relative(root, target).split(path.sep);
    if (["components", "store", "App", "App.tsx", "main", "main.tsx"].includes(targetDirectory)) {
      report(node, "Pass feature data and actions to UI components through props.");
    } else if (layerIndex !== -1 && targetDirectory === "ui" && (
      target.startsWith(path.join(uiRoot, "barrel")) || layers.indexOf(targetLayer) > layerIndex
    )) {
      report(node, "Import UI dependencies directly from the same or a lower layer.");
    }
  });
}

if (violations.length) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log("UI architecture check passed.");
}
