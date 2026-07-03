var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/server.ts
var server_exports = {};
__export(server_exports, {
  formatToEdits: () => formatToEdits
});
module.exports = __toCommonJS(server_exports);

// ../../src/formatters/arrayObjectFormatter.ts
function findMatchingBracket(content, openPos) {
  let depth = 1;
  let i = openPos + 1;
  let inString = null;
  while (i < content.length) {
    const ch = content[i];
    if (inString) {
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === inString) inString = null;
    } else {
      if (ch === '"' || ch === "'" || ch === "`") inString = ch;
      else if (ch === "[") depth++;
      else if (ch === "]") {
        depth--;
        if (depth === 0) return i;
      }
    }
    i++;
  }
  return -1;
}
function extractObjectStrings(flattened) {
  const objects = [];
  let i = 0;
  while (i < flattened.length) {
    while (i < flattened.length && (flattened[i] === " " || flattened[i] === ",")) i++;
    if (i >= flattened.length) break;
    if (flattened[i] !== "{") return null;
    const start = i;
    let depth = 0;
    let inString = null;
    while (i < flattened.length) {
      const ch = flattened[i];
      if (inString) {
        if (ch === "\\") {
          i += 2;
          continue;
        }
        if (ch === inString) inString = null;
      } else {
        if (ch === '"' || ch === "'" || ch === "`") inString = ch;
        else if (ch === "{" || ch === "[" || ch === "(") depth++;
        else if (ch === "}" || ch === "]" || ch === ")") {
          depth--;
          if (depth === 0) {
            i++;
            break;
          }
        }
      }
      i++;
    }
    objects.push(flattened.slice(start, i).trim());
  }
  return objects.length > 0 ? objects : null;
}
function parseProperties(objStr) {
  const inner = objStr.slice(1, -1).trim();
  const props = [];
  let i = 0;
  while (i < inner.length) {
    while (i < inner.length && inner[i] === " ") i++;
    if (i >= inner.length) break;
    const keyStart = i;
    while (i < inner.length && inner[i] !== ":") i++;
    const key = inner.slice(keyStart, i).trim();
    i++;
    while (i < inner.length && inner[i] === " ") i++;
    const valStart = i;
    let depth = 0;
    let inString = null;
    while (i < inner.length) {
      const ch = inner[i];
      if (inString) {
        if (ch === "\\") {
          i += 2;
          continue;
        }
        if (ch === inString) inString = null;
      } else {
        if (ch === '"' || ch === "'" || ch === "`") inString = ch;
        else if (ch === "{" || ch === "[" || ch === "(") depth++;
        else if (ch === "}" || ch === "]" || ch === ")") depth--;
        else if (ch === "," && depth === 0) break;
      }
      i++;
    }
    props.push({ key, value: inner.slice(valStart, i).trim() });
    if (i < inner.length && inner[i] === ",") i++;
  }
  return props;
}
function reconstructArray(objects, indent) {
  const propIndent = indent + "	";
  const parts = objects.map(
    (props) => props.map((p, i) => `${propIndent}${p.key}: ${p.value}${i < props.length - 1 ? "," : ""}`).join("\n")
  );
  return `[{
${parts.join("\n" + indent + "}, {\n")}
${indent}}]`;
}
function formatArrayObjects(content) {
  const pattern = /^([ \t]*)(?:export[ \t]+)?(?:(?:const|let|var)[ \t]+)?[\w$][\w$]*[ \t]*=[ \t]*\[/gm;
  const matches = [...content.matchAll(pattern)];
  for (let m = matches.length - 1; m >= 0; m--) {
    const match = matches[m];
    const indent = match[1];
    const bracketPos = match.index + match[0].length - 1;
    const closingPos = findMatchingBracket(content, bracketPos);
    if (closingPos === -1) continue;
    const arrayContent = content.slice(bracketPos + 1, closingPos);
    const flattened = arrayContent.replace(/\s+/g, " ").trim();
    if (!flattened) continue;
    const objectStrings = extractObjectStrings(flattened);
    if (!objectStrings) continue;
    const objects = objectStrings.map(parseProperties);
    const formatted = reconstructArray(objects, indent);
    content = content.slice(0, bracketPos) + formatted + content.slice(closingPos + 1);
  }
  return content;
}

// ../../src/formatters/blockSorter.ts
function splitCamelCase(name) {
  return name.replace(/([A-Z]+)([A-Z][a-z])/g, "$1\n$2").replace(/([a-z])([A-Z])/g, "$1\n$2").toLowerCase().split("\n");
}
function compareCamelCase(a, b) {
  const wa = splitCamelCase(a);
  const wb = splitCamelCase(b);
  for (let i = 0; i < Math.min(wa.length, wb.length); i++) {
    const c = wa[i].localeCompare(wb[i]);
    if (c !== 0) return c;
  }
  return wa.length - wb.length;
}
function extractMemberKey(lines) {
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) continue;
    const match = trimmed.match(/^([A-Za-z_$][A-Za-z0-9_$]*)/);
    return match ? match[1] : trimmed;
  }
  return "";
}
function lastContentLine(lines) {
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim()) return lines[i];
  }
  return "";
}
function hasTrailingComma(lines) {
  return lastContentLine(lines).trim().endsWith(",");
}
function stripTrailingComma(line) {
  return line.replace(/,\s*$/, "");
}
function addTrailingComma(line) {
  const t = line.trimEnd();
  return t.endsWith(",") ? line : t + ",";
}
function parseMembers(body) {
  const lines = body.split("\n");
  const members = [];
  let currentLines = [];
  let inContent = false;
  let depth = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inContent) currentLines.push(line);
      continue;
    }
    const isComment = trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*") || trimmed.startsWith("*/");
    if (isComment) {
      currentLines.push(line);
      continue;
    }
    if (depth === 0) {
      if (inContent) {
        members.push({ lines: [...currentLines], key: extractMemberKey(currentLines), hasComma: hasTrailingComma(currentLines) });
        currentLines = [];
      }
      inContent = true;
    }
    currentLines.push(line);
    depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
  }
  if (inContent && currentLines.length > 0) {
    members.push({ lines: [...currentLines], key: extractMemberKey(currentLines), hasComma: hasTrailingComma(currentLines) });
  }
  return members;
}
function processNestedBlocks(lines) {
  const result = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;
    if (opens > closes) {
      result.push(line);
      const bodyLines = [];
      let depth = opens - closes;
      i++;
      while (i < lines.length) {
        const o = (lines[i].match(/\{/g) || []).length;
        const c = (lines[i].match(/\}/g) || []).length;
        depth += o - c;
        if (depth <= 0) {
          const sortedBody = sortAndRebuildBody(bodyLines.join("\n"), "interface");
          result.push(...processNestedBlocks(sortedBody.split("\n")));
          result.push(lines[i]);
          i++;
          break;
        } else {
          bodyLines.push(lines[i]);
          i++;
        }
      }
    } else {
      result.push(line);
      i++;
    }
  }
  return result;
}
function extractNumericValue(lines) {
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) continue;
    const match = trimmed.match(/^[A-Za-z_$][A-Za-z0-9_$?]*\s*=\s*(-?\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  }
  return null;
}
function sortAndRebuildBody(body, blockType) {
  const members = parseMembers(body);
  if (members.length <= 1) return body;
  let sorted;
  if (blockType === "enum") {
    const numericValues = members.map((m) => extractNumericValue(m.lines));
    const allNumeric = numericValues.every((v) => v !== null);
    sorted = allNumeric ? [...members].sort((a, b) => extractNumericValue(a.lines) - extractNumericValue(b.lines)) : [...members].sort((a, b) => compareCamelCase(a.key, b.key));
  } else {
    sorted = [...members].sort((a, b) => compareCamelCase(a.key, b.key));
  }
  if (blockType === "interface") {
    const resultParts2 = [];
    for (const member of sorted) {
      let memberLines = [...member.lines];
      while (memberLines.length > 0 && !memberLines[memberLines.length - 1].trim()) memberLines.pop();
      memberLines = processNestedBlocks(memberLines);
      resultParts2.push(memberLines.join("\n"));
    }
    return resultParts2.join("\n");
  }
  const lastHadComma = members[members.length - 1].hasComma;
  const resultParts = [];
  for (let i = 0; i < sorted.length; i++) {
    const member = sorted[i];
    const isLast = i === sorted.length - 1;
    const needsComma = isLast ? lastHadComma : true;
    const memberLines = [...member.lines];
    let lastContentIdx = -1;
    for (let j = memberLines.length - 1; j >= 0; j--) {
      if (memberLines[j].trim()) {
        lastContentIdx = j;
        break;
      }
    }
    if (lastContentIdx >= 0) {
      if (needsComma) {
        memberLines[lastContentIdx] = addTrailingComma(memberLines[lastContentIdx]);
      } else {
        memberLines[lastContentIdx] = stripTrailingComma(memberLines[lastContentIdx]);
      }
    }
    while (memberLines.length > 0 && !memberLines[memberLines.length - 1].trim()) memberLines.pop();
    resultParts.push(memberLines.join("\n"));
  }
  return resultParts.join("\n");
}
function sortInterfacesAndEnums(content) {
  const lines = content.split("\n");
  const result = [...lines];
  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trim();
    const blockMatch = trimmed.match(/^(?:export\s+)?(?:declare\s+)?((interface|enum))\s+\w[\w<>,\s]*\{(.*)$/);
    if (blockMatch) {
      const blockType = blockMatch[2];
      const openCount = (lines[i].match(/\{/g) || []).length;
      const closeCount = (lines[i].match(/\}/g) || []).length;
      if (openCount > closeCount) {
        const startLine = i;
        let depth = openCount - closeCount;
        let j = i + 1;
        while (j < lines.length && depth > 0) {
          depth += (lines[j].match(/\{/g) || []).length;
          depth -= (lines[j].match(/\}/g) || []).length;
          j++;
        }
        const endLine = j - 1;
        const bodyLines = lines.slice(startLine + 1, endLine);
        const sortedBody = sortAndRebuildBody(bodyLines.join("\n"), blockType);
        const sortedLines = sortedBody.split("\n");
        result.splice(startLine + 1, endLine - startLine - 1, ...sortedLines);
        i = startLine + 1 + sortedLines.length;
        continue;
      }
    }
    i++;
  }
  return result.join("\n");
}
function sortBlocks(content) {
  return sortInterfacesAndEnums(content);
}

// ../../src/formatters/cssSorter.ts
var CSS_ORDER = [
  "accent-color",
  "align-content",
  "align-items",
  "align-self",
  "all",
  "animation",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-timing-function",
  "aspect-ratio",
  "backdrop-filter",
  "backface-visibility",
  "background",
  "background-attachment",
  "background-blend-mode",
  "background-clip",
  "background-color",
  "background-image",
  "background-origin",
  "background-position",
  "background-position-x",
  "background-position-y",
  "background-repeat",
  "background-size",
  "block-size",
  "border",
  "border-block",
  "border-block-color",
  "border-block-end",
  "border-block-end-color",
  "border-block-end-style",
  "border-block-end-width",
  "border-block-start",
  "border-block-start-color",
  "border-block-start-style",
  "border-block-start-width",
  "border-block-style",
  "border-block-width",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-color",
  "border-image",
  "border-image-outset",
  "border-image-repeat",
  "border-image-slice",
  "border-image-source",
  "border-image-width",
  "border-inline",
  "border-inline-color",
  "border-inline-end-color",
  "border-inline-end-style",
  "border-inline-end-width",
  "border-inline-start-color",
  "border-inline-start-style",
  "border-inline-start-width",
  "border-inline-style",
  "border-inline-width",
  "border-left",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-radius",
  "border-right",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-style",
  "border-top",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-style",
  "border-top-width",
  "border-width",
  "bottom",
  "box-decoration-break",
  "box-reflect",
  "box-shadow",
  "box-sizing",
  "break-after",
  "break-before",
  "break-inside",
  "caption-side",
  "caret-color",
  "@charset",
  "clear",
  "clip",
  "color",
  "color-scheme",
  "column-count",
  "column-fill",
  "column-gap",
  "column-rule",
  "column-rule-color",
  "column-rule-style",
  "column-rule-width",
  "column-span",
  "column-width",
  "columns",
  "content",
  "counter-increment",
  "counter-reset",
  "cursor",
  "direction",
  "display",
  "empty-cells",
  "fill",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-flow",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "float",
  "font",
  "@font-face",
  "font-family",
  "font-feature-settings",
  "@font-feature-values",
  "font-kerning",
  "font-language-override",
  "font-size",
  "font-size-adjust",
  "font-stretch",
  "font-style",
  "font-synthesis",
  "font-variant",
  "font-variant-alternates",
  "font-variant-caps",
  "font-variant-east-asian",
  "font-variant-ligatures",
  "font-variant-numeric",
  "font-variant-position",
  "font-weight",
  "gap",
  "grid",
  "grid-area",
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-column",
  "grid-column-end",
  "grid-column-gap",
  "grid-column-start",
  "grid-gap",
  "grid-row",
  "grid-row-end",
  "grid-row-gap",
  "grid-row-start",
  "grid-template",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
  "hanging-punctuation",
  "height",
  "hyphens",
  "image-rendering",
  "@import",
  "inline-size",
  "inset",
  "inset-block",
  "inset-block-end",
  "inset-block-start",
  "inset-inline",
  "inset-inline-end",
  "inset-inline-start",
  "isolation",
  "justify-content",
  "justify-items",
  "justify-self",
  "@keyframes",
  "left",
  "letter-spacing",
  "line-break",
  "line-height",
  "list-style",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "margin",
  "margin-block",
  "margin-block-end",
  "margin-block-start",
  "margin-bottom",
  "margin-inline",
  "margin-inline-end",
  "margin-inline-start",
  "margin-left",
  "margin-right",
  "margin-top",
  "mask",
  "mask-clip",
  "mask-composite",
  "mask-image",
  "mask-mode",
  "mask-origin",
  "mask-position",
  "mask-repeat",
  "mask-size",
  "mask-type",
  "max-height",
  "max-width",
  "@media",
  "max-block-size",
  "max-inline-size",
  "min-block-size",
  "min-inline-size",
  "min-height",
  "min-width",
  "mix-blend-mode",
  "object-fit",
  "object-position",
  "offset",
  "offset-anchor",
  "offset-distance",
  "offset-path",
  "offset-rotate",
  "opacity",
  "order",
  "orphans",
  "outline",
  "outline-color",
  "outline-offset",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-anchor",
  "overflow-wrap",
  "overflow-x",
  "overflow-y",
  "overscroll-behavior",
  "overscroll-behavior-block",
  "overscroll-behavior-inline",
  "overscroll-behavior-x",
  "overscroll-behavior-y",
  "padding",
  "padding-block",
  "padding-block-end",
  "padding-block-start",
  "padding-bottom",
  "padding-inline",
  "padding-inline-end",
  "padding-inline-start",
  "padding-left",
  "padding-right",
  "padding-top",
  "page-break-after",
  "page-break-before",
  "page-break-inside",
  "paint-order",
  "perspective",
  "perspective-origin",
  "place-content",
  "place-items",
  "place-self",
  "pointer-events",
  "position",
  "quotes",
  "resize",
  "right",
  "rotate",
  "row-gap",
  "scale",
  "scroll-behavior",
  "scroll-margin",
  "scroll-margin-block",
  "scroll-margin-block-end",
  "scroll-margin-block-start",
  "scroll-margin-bottom",
  "scroll-margin-inline",
  "scroll-margin-inline-end",
  "scroll-margin-inline-start",
  "scroll-margin-left",
  "scroll-margin-right",
  "scroll-margin-top",
  "scroll-padding",
  "scroll-padding-block",
  "scroll-padding-block-end",
  "scroll-padding-block-start",
  "scroll-padding-bottom",
  "scroll-padding-inline",
  "scroll-padding-inline-end",
  "scroll-padding-inline-start",
  "scroll-padding-left",
  "scroll-padding-right",
  "scroll-padding-top",
  "scroll-snap-align",
  "scroll-snap-stop",
  "scroll-snap-type",
  "scrollbar-color",
  "tab-size",
  "table-layout",
  "text-align",
  "text-align-last",
  "text-combine-upright",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-style",
  "text-decoration-thickness",
  "text-emphasis",
  "text-indent",
  "text-justify",
  "text-orientation",
  "text-overflow",
  "text-shadow",
  "text-transform",
  "text-underline-position",
  "top",
  "transform",
  "transform-origin",
  "transform-style",
  "transition",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "translate",
  "unicode-bidi",
  "user-select",
  "vertical-align",
  "visibility",
  "white-space",
  "widows",
  "width",
  "word-break",
  "word-spacing",
  "word-wrap",
  "writing-mode",
  "z-index"
];
var CSS_ORDER_MAP = new Map(CSS_ORDER.map((prop, idx) => [prop, idx]));
function getPropertyOrder(prop) {
  const idx = CSS_ORDER_MAP.get(prop);
  if (idx !== void 0) return idx;
  return CSS_ORDER.length + 1;
}
function sortDeclarations(declarations) {
  return [...declarations].sort((a, b) => {
    const orderA = getPropertyOrder(a.property);
    const orderB = getPropertyOrder(b.property);
    return orderA - orderB;
  });
}
function sortRuleBody(body) {
  const startsWithNewline = body.startsWith("\n");
  const endsWithNewline = body.endsWith("\n");
  const trailingIndentMatch = !endsWithNewline ? body.match(/(\n\s*)$/) : null;
  const trailingIndent = trailingIndentMatch ? trailingIndentMatch[1] : "";
  const lines = body.split("\n");
  const declarations = [];
  const includeLines = [];
  const nestedBlocks = [];
  let i = 0;
  const resultLines = [];
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      resultLines.push(line);
      i++;
      continue;
    }
    if (trimmed.endsWith("{") || trimmed.includes("{") && !trimmed.includes(":")) {
      const selectorPrefix = [];
      while (resultLines.length > 0 && resultLines[resultLines.length - 1].trim().endsWith(",")) {
        selectorPrefix.unshift(resultLines.pop());
      }
      let depth = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      const blockLines = [...selectorPrefix, line];
      i++;
      while (i < lines.length && depth > 0) {
        depth += (lines[i].match(/\{/g) || []).length;
        depth -= (lines[i].match(/\}/g) || []).length;
        blockLines.push(lines[i]);
        i++;
      }
      const placeholder = `__NESTED_${nestedBlocks.length}__`;
      nestedBlocks.push({ placeholder, content: processCssContent(blockLines.join("\n")) });
      resultLines.push(placeholder);
      continue;
    }
    if (trimmed.startsWith("@include")) {
      let raw = line;
      while (!raw.trimEnd().endsWith(";") && !raw.trimEnd().endsWith("}") && i + 1 < lines.length) {
        i++;
        raw += "\n" + lines[i];
      }
      includeLines.push(raw);
      i++;
      continue;
    }
    const declMatch = trimmed.match(/^([a-zA-Z_$-][a-zA-Z0-9_$-]*)\s*:/);
    if (declMatch) {
      const indentMatch = line.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1] : "";
      const property = declMatch[1];
      let raw = line;
      while (!raw.trimEnd().endsWith(";") && i + 1 < lines.length) {
        i++;
        raw += "\n" + lines[i];
      }
      declarations.push({ property, value: "", raw, indent });
    } else {
      resultLines.push(line);
    }
    i++;
  }
  const sorted = sortDeclarations(declarations);
  const sortedLines = sorted.map((d) => d.raw);
  while (resultLines.length > 0 && !resultLines[0].trim()) resultLines.shift();
  while (resultLines.length > 0 && !resultLines[resultLines.length - 1].trim()) resultLines.pop();
  const parts = [];
  if (includeLines.length > 0) parts.push(includeLines.join("\n"));
  if (sortedLines.length > 0) parts.push(sortedLines.join("\n"));
  if (resultLines.length > 0) parts.push(resultLines.join("\n"));
  let output = parts.join("\n\n");
  for (const nb of nestedBlocks) {
    output = output.replace(nb.placeholder, nb.content);
  }
  if (startsWithNewline) output = "\n" + output;
  if (endsWithNewline) output = output + "\n";
  else if (trailingIndent) output = output + trailingIndent;
  return output;
}
function processCssContent(content) {
  const chars = content.split("");
  const result = [];
  let i = 0;
  while (i < chars.length) {
    if (chars[i] === "/" && chars[i + 1] === "*") {
      result.push(chars[i], chars[i + 1]);
      i += 2;
      while (i < chars.length) {
        if (chars[i] === "*" && chars[i + 1] === "/") {
          result.push(chars[i], chars[i + 1]);
          i += 2;
          break;
        }
        result.push(chars[i]);
        i++;
      }
      continue;
    }
    if (chars[i] === "/" && chars[i + 1] === "/") {
      while (i < chars.length && chars[i] !== "\n") {
        result.push(chars[i]);
        i++;
      }
      continue;
    }
    if (chars[i] === '"' || chars[i] === "'") {
      const quote = chars[i];
      result.push(chars[i]);
      i++;
      while (i < chars.length && chars[i] !== quote) {
        if (chars[i] === "\\") {
          result.push(chars[i]);
          i++;
        }
        result.push(chars[i]);
        i++;
      }
      result.push(chars[i] || "");
      i++;
      continue;
    }
    if (chars[i] === "{") {
      const bodyStart = i + 1;
      let depth = 1;
      let j = i + 1;
      while (j < chars.length && depth > 0) {
        if (chars[j] === "{") depth++;
        else if (chars[j] === "}") depth--;
        j++;
      }
      const body = chars.slice(bodyStart, j - 1).join("");
      const sortedBody = sortRuleBody(body);
      result.push("{");
      result.push(sortedBody);
      result.push("}");
      i = j;
      continue;
    }
    result.push(chars[i]);
    i++;
  }
  return result.join("");
}
function sortCss(content) {
  return processCssContent(content);
}

// ../../src/formatters/importSorter.ts
function parseImportStatement(raw) {
  const text = raw.replace(/\s+/g, " ").trim();
  const sideEffectMatch = text.match(/^import\s+['"]([^'"]+)['"]\s*;?$/);
  if (sideEffectMatch) {
    return { kind: "sideEffect", items: [], source: sideEffectMatch[1], raw };
  }
  const typeMatch = text.match(/^import\s+type\s+([\s\S]+?)\s+from\s+['"]([^'"]+)['"]\s*;?$/);
  if (typeMatch) {
    const spec = typeMatch[1].trim();
    if (spec.startsWith("{")) {
      const items = parseDestructuredItems(spec.replace(/^\{|\}$/g, ""));
      return { kind: "type", items, source: typeMatch[2], raw };
    } else {
      return { kind: "type-default", items: [{ name: spec }], source: typeMatch[2], raw };
    }
  }
  const namespaceMatch = text.match(/^import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?$/);
  if (namespaceMatch) {
    return { kind: "namespace", items: [{ name: namespaceMatch[1] }], source: namespaceMatch[2], raw };
  }
  const destructuredMatch = text.match(/^import\s+\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?$/);
  if (destructuredMatch) {
    const items = parseDestructuredItems(destructuredMatch[1]);
    return { kind: "destructured", items, source: destructuredMatch[2], raw };
  }
  const defaultMatch = text.match(/^import\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?$/);
  if (defaultMatch) {
    return { kind: "default", items: [{ name: defaultMatch[1] }], source: defaultMatch[2], raw };
  }
  return null;
}
function parseDestructuredItems(text) {
  return text.split(",").map((s) => s.trim()).filter(Boolean).map(parseItemAlias);
}
function parseItemAlias(itemText) {
  const asMatch = itemText.match(/^(\S+)\s+as\s+(\S+)$/);
  if (asMatch) return { name: asMatch[1], alias: asMatch[2] };
  return { name: itemText };
}
function itemToString(item) {
  return item.alias ? `${item.name} as ${item.alias}` : item.name;
}
function splitCamelCase2(name) {
  return name.replace(/([A-Z]+)([A-Z][a-z])/g, "$1\n$2").replace(/([a-z])([A-Z])/g, "$1\n$2").toLowerCase().split("\n");
}
function compareCamelCase2(a, b) {
  const wa = splitCamelCase2(a);
  const wb = splitCamelCase2(b);
  for (let i = 0; i < Math.min(wa.length, wb.length); i++) {
    const c = wa[i].localeCompare(wb[i]);
    if (c !== 0) return c;
  }
  return wa.length - wb.length;
}
function sortItems(items) {
  return [...items].sort((a, b) => compareCamelCase2(a.name, b.name));
}
function getGroupFirstName(imp) {
  if (imp.items.length === 0) return "";
  if (imp.kind === "type-default" || imp.kind === "default" || imp.kind === "namespace") {
    return imp.items[0].name;
  }
  return sortItems(imp.items)[0].name;
}
function formatImport(imp) {
  const LINE_LENGTH_LIMIT = 90;
  if (imp.kind === "sideEffect") {
    return `import '${imp.source}';`;
  }
  if (imp.kind === "namespace") {
    return `import * as ${imp.items[0].name} from '${imp.source}';`;
  }
  if (imp.kind === "default") {
    return `import ${imp.items[0].name} from '${imp.source}';`;
  }
  if (imp.kind === "type-default") {
    return `import type ${imp.items[0].name} from '${imp.source}';`;
  }
  const sorted = sortItems(imp.items);
  const prefix = imp.kind === "type" ? "import type " : "import ";
  const itemsStr = sorted.map(itemToString).join(", ");
  const singleLine = `${prefix}{${itemsStr}} from '${imp.source}';`;
  if (singleLine.length <= LINE_LENGTH_LIMIT) {
    return singleLine;
  }
  const itemLines = sorted.map(
    (item, idx) => idx < sorted.length - 1 ? `	${itemToString(item)},` : `	${itemToString(item)}`
  ).join("\n");
  return `${prefix}{
${itemLines}
} from '${imp.source}';`;
}
function mergeImports(imports) {
  const map = /* @__PURE__ */ new Map();
  for (const imp of imports) {
    if (imp.kind === "sideEffect" || imp.kind === "type-default" || imp.kind === "default" || imp.kind === "namespace") {
      const key2 = `${imp.kind}:${imp.source}:${imp.items[0]?.name}`;
      map.set(key2, imp);
      continue;
    }
    const key = `${imp.kind}:${imp.source}`;
    if (map.has(key)) {
      const existing = map.get(key);
      map.set(key, { ...existing, items: [...existing.items, ...imp.items] });
    } else {
      map.set(key, { ...imp });
    }
  }
  return Array.from(map.values());
}
function isBracesComplete(line) {
  const open = (line.match(/\{/g) || []).length;
  const close = (line.match(/\}/g) || []).length;
  return open === close;
}
function extractStatementBlocks(content, startPredicate) {
  const lines = content.split("\n");
  const results = [];
  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trimStart();
    if (startPredicate(trimmed)) {
      const startLine = i;
      const stmtLines = [lines[i]];
      if (isBracesComplete(lines[i])) {
        results.push({ raw: stmtLines.join("\n"), lineStart: startLine, lineEnd: i });
      } else {
        let found = false;
        i++;
        while (i < lines.length) {
          stmtLines.push(lines[i]);
          const fullSoFar = stmtLines.join("\n");
          const open = (fullSoFar.match(/\{/g) || []).length;
          const close = (fullSoFar.match(/\}/g) || []).length;
          if (open === close && fullSoFar.includes(";")) {
            results.push({ raw: fullSoFar, lineStart: startLine, lineEnd: i });
            found = true;
            break;
          }
          i++;
        }
        if (!found) i--;
      }
    }
    i++;
  }
  return results;
}
function extractImportBlocks(content) {
  return extractStatementBlocks(content, (t) => t.startsWith("import ") || t === "import");
}
function extractExportBlocks(content) {
  return extractStatementBlocks(
    content,
    (t) => t.startsWith("export {") || t.startsWith("export * ") || t.startsWith("export *;") || t.startsWith("export type {")
  );
}
function parseExportStatement(raw) {
  const text = raw.replace(/\s+/g, " ").trim();
  const starMatch = text.match(/^export\s+\*\s+from\s+['"]([^'"]+)['"]\s*;?$/);
  if (starMatch) {
    return { kind: "sideEffect", items: [], source: starMatch[1], raw };
  }
  const namespaceMatch = text.match(/^export\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?$/);
  if (namespaceMatch) {
    return { kind: "namespace", items: [{ name: namespaceMatch[1] }], source: namespaceMatch[2], raw };
  }
  const typeMatch = text.match(/^export\s+type\s+\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?$/);
  if (typeMatch) {
    const items = parseDestructuredItems(typeMatch[1]);
    return { kind: "type", items, source: typeMatch[2], raw };
  }
  const destructuredMatch = text.match(/^export\s+\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]\s*;?$/);
  if (destructuredMatch) {
    const items = parseDestructuredItems(destructuredMatch[1]);
    return { kind: "destructured", items, source: destructuredMatch[2], raw };
  }
  return null;
}
function formatExport(imp) {
  const LINE_LENGTH_LIMIT = 90;
  if (imp.kind === "sideEffect") {
    return `export * from '${imp.source}';`;
  }
  if (imp.kind === "namespace") {
    return `export * as ${imp.items[0].name} from '${imp.source}';`;
  }
  const sorted = sortItems(imp.items);
  const prefix = imp.kind === "type" ? "export type " : "export ";
  const itemsStr = sorted.map(itemToString).join(", ");
  const singleLine = `${prefix}{${itemsStr}} from '${imp.source}';`;
  if (singleLine.length <= LINE_LENGTH_LIMIT) {
    return singleLine;
  }
  const itemLines = sorted.map(
    (item, idx) => idx < sorted.length - 1 ? `	${itemToString(item)},` : `	${itemToString(item)}`
  ).join("\n");
  return `${prefix}{
${itemLines}
} from '${imp.source}';`;
}
function sortExports(content) {
  const blocks = extractExportBlocks(content);
  if (blocks.length === 0) return content;
  const parsed = [];
  for (const block of blocks) {
    const exp = parseExportStatement(block.raw);
    if (exp) parsed.push(exp);
  }
  if (parsed.length === 0) return content;
  const destructured = mergeImports(parsed.filter((i) => i.kind === "destructured"));
  const namespaces = mergeImports(parsed.filter((i) => i.kind === "namespace"));
  const types = mergeImports(parsed.filter((i) => i.kind === "type"));
  const stars = parsed.filter((i) => i.kind === "sideEffect");
  const sortByKey = (arr) => [...arr].sort((a, b) => compareCamelCase2(getGroupFirstName(a), getGroupFirstName(b)));
  const sortedStars = [...stars].sort((a, b) => {
    const nameA = a.source.split("/").pop() ?? a.source;
    const nameB = b.source.split("/").pop() ?? b.source;
    return compareCamelCase2(nameA, nameB);
  });
  const sorted = [
    ...sortByKey(destructured),
    ...sortByKey(namespaces),
    ...sortByKey(types),
    ...sortedStars
  ];
  const newExportBlock = sorted.map(formatExport).join("\n");
  const firstLine = blocks[0].lineStart;
  const lastLine = blocks[blocks.length - 1].lineEnd;
  const lines = content.split("\n");
  const before = lines.slice(0, firstLine).join("\n");
  const after = lines.slice(lastLine + 1).join("\n");
  const parts = [];
  if (firstLine > 0) parts.push(before);
  parts.push(newExportBlock);
  if (lastLine < lines.length - 1) parts.push(after);
  return parts.join("\n");
}
function sortImports(content) {
  const blocks = extractImportBlocks(content);
  if (blocks.length === 0) return content;
  const parsed = [];
  for (const block of blocks) {
    const imp = parseImportStatement(block.raw);
    if (imp) parsed.push(imp);
  }
  if (parsed.length === 0) return content;
  const destructured = mergeImports(parsed.filter((i) => i.kind === "destructured"));
  const defaults = mergeImports(parsed.filter((i) => i.kind === "default"));
  const namespaces = mergeImports(parsed.filter((i) => i.kind === "namespace"));
  const types = mergeImports(parsed.filter((i) => i.kind === "type" || i.kind === "type-default"));
  const sideEffects = parsed.filter((i) => i.kind === "sideEffect");
  const sortByKey = (arr) => [...arr].sort((a, b) => compareCamelCase2(getGroupFirstName(a), getGroupFirstName(b)));
  const sorted = [
    ...sortByKey(destructured),
    ...sortByKey(defaults),
    ...sortByKey(namespaces),
    ...sortByKey(types),
    ...sideEffects
  ];
  const newImportBlock = sorted.map(formatImport).join("\n");
  const firstLine = blocks[0].lineStart;
  const lastLine = blocks[blocks.length - 1].lineEnd;
  const lines = content.split("\n");
  const before = lines.slice(0, firstLine).join("\n");
  const after = lines.slice(lastLine + 1).join("\n");
  const parts = [];
  if (firstLine > 0) parts.push(before);
  parts.push(newImportBlock);
  if (lastLine < lines.length - 1) parts.push(after);
  return parts.join("\n");
}

// ../../src/formatters/jsonSorter.ts
function compareJsonKeys(a, b) {
  const la = a.toLowerCase();
  const lb = b.toLowerCase();
  for (let i = 0; i < Math.min(la.length, lb.length); i++) {
    const ca = la.charCodeAt(i);
    const cb = lb.charCodeAt(i);
    if (ca === cb) continue;
    const aIsAlphaNum = ca >= 97 && ca <= 122 || ca >= 48 && ca <= 57;
    const bIsAlphaNum = cb >= 97 && cb <= 122 || cb >= 48 && cb <= 57;
    if (aIsAlphaNum && !bIsAlphaNum) return 1;
    if (!aIsAlphaNum && bIsAlphaNum) return -1;
    return ca - cb;
  }
  return la.length - lb.length;
}
function sortJsonValue(value) {
  if (Array.isArray(value)) {
    return value.map(sortJsonValue);
  }
  if (value !== null && typeof value === "object") {
    const obj = value;
    const sorted = {};
    for (const key of Object.keys(obj).sort(compareJsonKeys)) {
      sorted[key] = sortJsonValue(obj[key]);
    }
    return sorted;
  }
  return value;
}
var PACKAGE_JSON_SORT_KEYS = ["dependencies", "devDependencies", "peerDependencies"];
function sortPackageJson(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }
  const obj = value;
  const result = {};
  for (const key of Object.keys(obj)) {
    const child = obj[key];
    const isSortable = child !== null && typeof child === "object" && !Array.isArray(child);
    if (PACKAGE_JSON_SORT_KEYS.includes(key) && isSortable) {
      result[key] = sortJsonValue(child);
    } else {
      result[key] = child;
    }
  }
  return result;
}
function detectIndent(content) {
  const match = content.match(/\{\s*\n([ \t]+)/);
  if (!match) return "	";
  const indent = match[1];
  if (indent[0] === "	") return "	";
  return indent.length;
}
function sortJson(content, fileName) {
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    return content;
  }
  const isPackageJson = fileName !== void 0 && fileName.replace(/\\/g, "/").split("/").pop() === "package.json";
  const indent = detectIndent(content);
  const sorted = isPackageJson ? sortPackageJson(parsed) : sortJsonValue(parsed);
  const result = JSON.stringify(sorted, null, indent);
  return content.endsWith("\n") ? result + "\n" : result;
}

// ../../src/formatters/vueComponentsSorter.ts
function sortVueComponents(content) {
  return content.replace(
    /(components\s*:\s*\{)([^}]*?)(\})/g,
    (match, open, body, close) => {
      const items = body.split(",").map((s) => s.trim()).filter(Boolean);
      if (items.length <= 1) return match;
      const sorted = [...items].sort(
        (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())
      );
      const firstItem = body.match(/(\n\s*)\S/);
      if (firstItem) {
        const indent = firstItem[1];
        const sortedStr = sorted.map((item) => `${indent}${item}`).join(",");
        const closingIndent = body.match(/\n(\s*)\s*$/) ? body.match(/\n(\s*)$/)[0] : "\n		";
        return `${open}${sortedStr},${closingIndent}${close}`;
      }
      return `${open} ${sorted.join(", ")} ${close}`;
    }
  );
}

// ../../src/formatters/vueAttrSorter.ts
function getAttrCategory(name) {
  if (name === "is" || name === "v-is" || name === ":is" || name === "v-bind:is") return 1;
  if (name === "v-for") return 2;
  if (["v-if", "v-else-if", "v-else", "v-show", "v-cloak"].includes(name)) return 3;
  if (name === "v-pre" || name === "v-once") return 4;
  if (name === "id") return 5;
  if (["ref", ":ref", "v-bind:ref", "key", ":key", "v-bind:key"].includes(name)) return 6;
  if (name === "v-model" || name.startsWith("v-model:")) return 7;
  if (name === "v-html" || name === "v-text") return 11;
  if (name.startsWith("@") || name.startsWith("v-on:")) return 10;
  if (["test-id", ":test-id", "class", ":class", "style", ":style"].includes(name)) return 9;
  return 8;
}
var TEST_AND_STYLES_ORDER = ["test-id", ":test-id", "class", ":class", "style", ":style"];
function sortAttrs(attrs) {
  return attrs.map((attr, idx) => ({ attr, idx })).sort((a, b) => {
    const catA = getAttrCategory(a.attr.name);
    const catB = getAttrCategory(b.attr.name);
    if (catA !== catB) return catA - catB;
    if (catA === 8) return a.idx - b.idx;
    if (catA === 9) {
      return TEST_AND_STYLES_ORDER.indexOf(a.attr.name) - TEST_AND_STYLES_ORDER.indexOf(b.attr.name);
    }
    return 0;
  }).map(({ attr }) => attr);
}
function getLineIndent(result) {
  const lastNewline = result.lastIndexOf("\n");
  const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
  const match = result.slice(lineStart).match(/^([ \t]*)/);
  return match ? match[1] : "";
}
function sortVueTemplateAttrs(template) {
  let result = "";
  let i = 0;
  while (i < template.length) {
    if (template[i] !== "<") {
      result += template[i++];
      continue;
    }
    if (template.startsWith("<!--", i)) {
      const end = template.indexOf("-->", i + 4);
      if (end === -1) {
        result += template.slice(i);
        break;
      }
      result += template.slice(i, end + 3);
      i = end + 3;
      continue;
    }
    if (template[i + 1] === "/" || template[i + 1] === "!") {
      result += template[i++];
      continue;
    }
    const tagStart = i;
    i++;
    let tagName = "";
    while (i < template.length && !/[ \t\n\r>\/]/.test(template[i])) {
      tagName += template[i++];
    }
    if (!tagName) {
      result += "<";
      continue;
    }
    const attrs = [];
    let trailingWs = "";
    let selfClosing = false;
    let parseOk = true;
    while (i < template.length) {
      let leading = "";
      while (i < template.length && /[ \t\n\r]/.test(template[i])) {
        leading += template[i++];
      }
      if (i >= template.length) {
        parseOk = false;
        break;
      }
      if (template[i] === ">") {
        trailingWs = leading;
        i++;
        break;
      }
      if (template[i] === "/" && i + 1 < template.length && template[i + 1] === ">") {
        trailingWs = leading;
        selfClosing = true;
        i += 2;
        break;
      }
      let attrName = "";
      while (i < template.length && template[i] !== "=" && !/[ \t\n\r>\/]/.test(template[i])) {
        attrName += template[i++];
      }
      if (!attrName) {
        parseOk = false;
        break;
      }
      let attrRaw = attrName;
      if (i < template.length && template[i] === "=") {
        attrRaw += "=";
        i++;
        if (i < template.length && (template[i] === '"' || template[i] === "'")) {
          const q = template[i];
          attrRaw += q;
          i++;
          while (i < template.length && template[i] !== q) {
            if (template[i] === "\\") attrRaw += template[i++];
            if (i < template.length) attrRaw += template[i++];
          }
          if (i < template.length) {
            attrRaw += template[i++];
          }
        } else {
          while (i < template.length && !/[ \t\n\r>]/.test(template[i])) {
            attrRaw += template[i++];
          }
        }
      }
      attrs.push({ name: attrName, raw: attrRaw, leading });
    }
    if (!parseOk) {
      result += template.slice(tagStart, i);
      continue;
    }
    const sorted = sortAttrs(attrs);
    const tagIndent = getLineIndent(result);
    const multiLineAttr = attrs.find((a) => a.leading.includes("\n"));
    const attrIndent = multiLineAttr ? multiLineAttr.leading.replace(/^[\n\r]+/, "") : tagIndent + "	";
    result += "<" + tagName;
    if (sorted.length === 0) {
      result += trailingWs + (selfClosing ? "/>" : ">");
    } else if (sorted.length === 1) {
      result += " " + sorted[0].raw + (selfClosing ? " />" : ">");
    } else {
      for (const attr of sorted) {
        result += "\n" + attrIndent + attr.raw;
      }
      result += "\n" + tagIndent + (selfClosing ? "/>" : ">");
    }
  }
  result = result.replace(
    /\n([\t ]*)>([^\n<\/][^\n]*)(<\/[\w:-]+>)/g,
    (_match, indent, content, closing) => {
      const trimmed = content.trim();
      if (!trimmed) {
        return `
${indent}>${closing}`;
      }
      return `
${indent}>
${indent}	${trimmed}
${indent}${closing}`;
    }
  );
  result = result.replace(
    /^([\t ]*)(<[\w:-]+\s[^>]*>)([^\n<\/][^\n]*)(<\/[\w:-]+>)$/gm,
    (_match, indent, openTag, content, closing) => {
      const trimmed = content.trim();
      if (!trimmed) {
        return _match;
      }
      return `${indent}${openTag}
${indent}	${trimmed}
${indent}${closing}`;
    }
  );
  return result;
}

// ../../src/formatDocument.ts
var path = __toESM(require("path"));
function formatVue(src) {
  const templateMatch = src.match(/(<template[^>]*>)([\s\S]*)(<\/template>)/);
  if (templateMatch) {
    const sortedTemplate = sortVueTemplateAttrs(templateMatch[2]);
    src = src.replace(templateMatch[0], `${templateMatch[1]}${sortedTemplate}${templateMatch[3]}`);
  }
  const scriptMatch = src.match(/(<script[^>]*>)([\s\S]*?)(<\/script>)/);
  if (scriptMatch) {
    let scriptContent = scriptMatch[2];
    scriptContent = sortImports(scriptContent);
    scriptContent = sortExports(scriptContent);
    scriptContent = sortBlocks(scriptContent);
    scriptContent = sortVueComponents(scriptContent);
    scriptContent = formatArrayObjects(scriptContent);
    src = src.replace(scriptMatch[0], `${scriptMatch[1]}${scriptContent}${scriptMatch[3]}`);
  }
  const styleMatch = src.match(/(<style[^>]*>)([\s\S]*?)(<\/style>)/);
  if (styleMatch) {
    const sortedStyle = sortCss(styleMatch[2]);
    src = src.replace(styleMatch[0], `${styleMatch[1]}${sortedStyle}${styleMatch[3]}`);
  }
  src = src.replace(/(<\/template>)\s*\n\s*(<script)/g, "$1\n\n$2");
  src = src.replace(/(<script[^>]*\/>)\s*\n\s*(<style)/g, "$1\n$2");
  src = src.replace(/(<\/script>)\s*\n\s*(<style)/g, "$1\n$2");
  return src;
}
function formatTs(src) {
  src = sortImports(src);
  src = sortExports(src);
  src = sortBlocks(src);
  src = formatArrayObjects(src);
  return src;
}
function formatCss(src) {
  return sortCss(src);
}
function normalizeToTabs(content) {
  const lines = content.split("\n");
  let indentSize = 0;
  for (const line of lines) {
    const match = line.match(/^( +)\S/);
    if (match) {
      const count = match[1].length;
      if (indentSize === 0 || count < indentSize) indentSize = count;
    }
  }
  if (indentSize === 0) return content;
  return lines.map((line) => {
    const match = line.match(/^( +)/);
    if (!match) return line;
    const count = match[1].length;
    const tabCount = Math.floor(count / indentSize);
    const remainder = count % indentSize;
    return "	".repeat(tabCount) + " ".repeat(remainder) + line.slice(count);
  }).join("\n");
}
function formatDocument(text, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  let result;
  switch (ext) {
    case ".vue":
      result = formatVue(text);
      break;
    case ".ts":
    case ".js":
      result = formatTs(text);
      break;
    case ".css":
    case ".scss":
      result = formatCss(text);
      break;
    case ".json":
      result = sortJson(text, filePath);
      break;
    default:
      result = text;
  }
  return normalizeToTabs(result);
}

// src/server.ts
var import_url = require("url");
var documents = /* @__PURE__ */ new Map();
function formatToEdits(text, filePath) {
  const formatted = formatDocument(text, filePath);
  if (formatted === text) return [];
  const lines = text.split("\n");
  const end = {
    line: lines.length - 1,
    character: lines[lines.length - 1].length
  };
  return [{
    range: { start: { line: 0, character: 0 }, end },
    newText: formatted
  }];
}
function send(message) {
  const json = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(json, "utf8")}\r
\r
${json}`);
}
function reply(id, result) {
  send({ jsonrpc: "2.0", id, result });
}
function handle(message) {
  const params = message.params ?? {};
  switch (message.method) {
    case "initialize":
      reply(message.id, { capabilities: { textDocumentSync: 1, documentFormattingProvider: true } });
      break;
    case "textDocument/didOpen":
      documents.set(params.textDocument.uri, params.textDocument.text);
      break;
    case "textDocument/didChange": {
      const changes = params.contentChanges;
      documents.set(params.textDocument.uri, changes[changes.length - 1].text);
      break;
    }
    case "textDocument/didClose":
      documents.delete(params.textDocument.uri);
      break;
    case "textDocument/formatting": {
      const uri = params.textDocument.uri;
      const text = documents.get(uri) ?? "";
      reply(message.id, formatToEdits(text, (0, import_url.fileURLToPath)(uri)));
      break;
    }
    case "shutdown":
      reply(message.id, void 0);
      break;
    case "exit":
      process.exit(0);
      break;
    default:
      if (message.id !== void 0) reply(message.id, void 0);
  }
}
var buffer = Buffer.alloc(0);
process.stdin.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  while (true) {
    const headerEnd = buffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) return;
    const header = buffer.slice(0, headerEnd).toString("ascii");
    const match = header.match(/Content-Length: (\d+)/i);
    if (!match) {
      buffer = buffer.slice(headerEnd + 4);
      continue;
    }
    const length = parseInt(match[1], 10);
    const bodyStart = headerEnd + 4;
    if (buffer.length < bodyStart + length) return;
    const body = buffer.slice(bodyStart, bodyStart + length).toString("utf8");
    buffer = buffer.slice(bodyStart + length);
    try {
      handle(JSON.parse(body));
    } catch {
    }
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  formatToEdits
});
