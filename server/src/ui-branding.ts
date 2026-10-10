const FAVICON_BLOCK_START = "<!-- PAPERCLIP_FAVICON_START -->";
const FAVICON_BLOCK_END = "<!-- PAPERCLIP_FAVICON_END -->";
const RUNTIME_BRANDING_BLOCK_START = "<!-- PAPERCLIP_RUNTIME_BRANDING_START -->";
const RUNTIME_BRANDING_BLOCK_END = "<!-- PAPERCLIP_RUNTIME_BRANDING_END -->";

const DEFAULT_FAVICON_LINKS = [
  '<link rel="icon" href="/favicon.ico" sizes="48x48" />',
  '<link rel="icon" href="/favicon.svg" type="image/svg+xml" />',
  '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />',
  '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />',
].join("\n");

export type WorktreeUiBranding = {
  enabled: boolean;
  name: string | null;
  color: string | null;
  textColor: string | null;
  faviconHref: string | null;
  /**
   * Runtime instance id for this worktree preview. Surfaced to the client so
   * the experimental "Run tasks in this worktree" card can fail closed when a
   * copied settings row was armed in a different instance. Null outside a
   * worktree or when the runtime id is unset.
   */
  instanceId: string | null;
};

function isTruthyEnvValue(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function nonEmpty(value: string | undefined): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeHexColor(value: string | undefined): string | null {
  const raw = nonEmpty(value);
  if (!raw) return null;
  const hex = raw.startsWith("#") ? raw.slice(1) : raw;
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    return `#${hex.split("").map((char) => `${char}${char}`).join("").toLowerCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return `#${hex.toLowerCase()}`;
  }
  return null;
}

function hslComponentToHex(n: number): string {
  return Math.round(Math.max(0, Math.min(255, n)))
    .toString(16)
    .padStart(2, "0");
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const s = Math.max(0, Math.min(100, saturation)) / 100;
  const l = Math.max(0, Math.min(100, lightness)) / 100;
  const c = (1 - Math.abs((2 * l) - 1)) * s;
  const h = ((hue % 360) + 360) % 360;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - (c / 2);

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return `#${hslComponentToHex((r + m) * 255)}${hslComponentToHex((g + m) * 255)}${hslComponentToHex((b + m) * 255)}`;
}

function deriveColorFromSeed(seed: string): string {
  let hash = 0;
  for (const char of seed) {
    hash = ((hash * 33) + char.charCodeAt(0)) >>> 0;
  }
  return hslToHex(hash % 360, 68, 56);
}

function hexToRgb(color: string): { r: number; g: number; b: number } {
  const normalized = normalizeHexColor(color) ?? "#000000";
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

function relativeLuminanceChannel(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(color: string): number {
  const { r, g, b } = hexToRgb(color);
  return (
    (0.2126 * relativeLuminanceChannel(r)) +
    (0.7152 * relativeLuminanceChannel(g)) +
    (0.0722 * relativeLuminanceChannel(b))
  );
}

function pickReadableTextColor(background: string): string {
  const backgroundLuminance = relativeLuminance(background);
  const whiteContrast = 1.05 / (backgroundLuminance + 0.05);
  const blackContrast = (backgroundLuminance + 0.05) / 0.05;
  return whiteContrast >= blackContrast ? "#f8fafc" : "#111827";
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function createFaviconDataUrl(background: string, foreground: string): string {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">',
    `<rect width="24" height="24" rx="6" fill="${background}"/>`,
    `<g transform="translate(2 8.25) scale(0.02222)"><path fill="${foreground}" fill-rule="evenodd" d="M150 4 C220 4 270 30 310 70 C330 90 335 100 352 105 C388 116 435 62 468 55 C496 49 528 88 556 96 C584 104 628 52 662 45 C700 38 750 88 795 128 C843 148 882 190 905 250 C922 294 898 336 852 345 C818 351 786 344 758 336 C704 320 660 306 618 309 C580 312 554 320 518 318 C480 316 450 302 410 305 C364 308 330 317 298 324 C266 331 230 341 190 343 C140 346 94 340 60 316 C26 292 4 247 3 202 C2 130 56 6 150 4 Z M214 164 Q151.42 151.46 87.60 152.86 A40 40 0 0 0 102.94 225.37 Q161.86 200.81 214 164 Z M255 171 A9 9 0 1 0 237 171 A9 9 0 1 0 255 171 Z M255 167 L844 167 L844 239 L836 239 L836 175 L255 175 Z M881 275 A36 36 0 1 0 809 275 A36 36 0 1 0 881 275 Z"/></g>`,
    "</svg>",
  ].join("");
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function isWorktreeUiBrandingEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return isTruthyEnvValue(env.PAPERCLIP_IN_WORKTREE);
}

export function getWorktreeUiBranding(env: NodeJS.ProcessEnv = process.env): WorktreeUiBranding {
  if (!isWorktreeUiBrandingEnabled(env)) {
    return {
      enabled: false,
      name: null,
      color: null,
      textColor: null,
      faviconHref: null,
      instanceId: null,
    };
  }

  const name = nonEmpty(env.PAPERCLIP_WORKTREE_NAME) ?? nonEmpty(env.PAPERCLIP_INSTANCE_ID) ?? "worktree";
  const color = normalizeHexColor(env.PAPERCLIP_WORKTREE_COLOR) ?? deriveColorFromSeed(name);
  const textColor = pickReadableTextColor(color);

  return {
    enabled: true,
    name,
    color,
    textColor,
    faviconHref: createFaviconDataUrl(color, textColor),
    instanceId: nonEmpty(env.PAPERCLIP_INSTANCE_ID),
  };
}

export function renderFaviconLinks(branding: WorktreeUiBranding): string {
  if (!branding.enabled || !branding.faviconHref) return DEFAULT_FAVICON_LINKS;

  const href = escapeHtmlAttribute(branding.faviconHref);
  return [
    `<link rel="icon" href="${href}" type="image/svg+xml" sizes="any" />`,
    `<link rel="shortcut icon" href="${href}" type="image/svg+xml" />`,
  ].join("\n");
}

export function renderRuntimeBrandingMeta(branding: WorktreeUiBranding): string {
  if (!branding.enabled || !branding.name || !branding.color || !branding.textColor) return "";

  const tags = [
    '<meta name="paperclip-worktree-enabled" content="true" />',
    `<meta name="paperclip-worktree-name" content="${escapeHtmlAttribute(branding.name)}" />`,
    `<meta name="paperclip-worktree-color" content="${escapeHtmlAttribute(branding.color)}" />`,
    `<meta name="paperclip-worktree-text-color" content="${escapeHtmlAttribute(branding.textColor)}" />`,
  ];
  if (branding.instanceId) {
    tags.push(`<meta name="paperclip-instance-id" content="${escapeHtmlAttribute(branding.instanceId)}" />`);
  }
  return tags.join("\n");
}

function replaceMarkedBlock(html: string, startMarker: string, endMarker: string, content: string): string {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) return html;

  const before = html.slice(0, start + startMarker.length);
  const after = html.slice(end);
  const indentedContent = content
    ? `\n${content
      .split("\n")
      .map((line) => `    ${line}`)
      .join("\n")}\n    `
    : "\n    ";
  return `${before}${indentedContent}${after}`;
}

export function applyUiBranding(html: string, env: NodeJS.ProcessEnv = process.env): string {
  const branding = getWorktreeUiBranding(env);
  const withFavicon = replaceMarkedBlock(html, FAVICON_BLOCK_START, FAVICON_BLOCK_END, renderFaviconLinks(branding));
  return replaceMarkedBlock(
    withFavicon,
    RUNTIME_BRANDING_BLOCK_START,
    RUNTIME_BRANDING_BLOCK_END,
    renderRuntimeBrandingMeta(branding),
  );
}
