/** Shared Monaco theme/options for main + workspace editors */

export const MONACO_THEME = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "6e7681", fontStyle: "italic" },
    { token: "keyword", foreground: "ff7b72" },
    { token: "string", foreground: "a5d6ff" },
    { token: "number", foreground: "79c0ff" },
    { token: "function", foreground: "d2a8ff" },
    { token: "type", foreground: "ffa657" },
  ],
  colors: {
    "editor.background": "#0d1117",
    "editor.foreground": "#e6edf3",
    "editor.lineHighlightBackground": "#161b22",
    "editor.selectionBackground": "#1f3a5f",
    "editor.inactiveSelectionBackground": "#1f3a5f88",
    "editorLineNumber.foreground": "#3d4450",
    "editorLineNumber.activeForeground": "#6e7681",
    "editorCursor.foreground": "#22d3ee",
    "editorIndentGuide.background": "#21262d",
    "editorBracketMatch.border": "#22d3ee",
    "scrollbarSlider.background": "#30363d88",
    "minimap.background": "#0d1117",
  },
};

export const EDITOR_OPTIONS = {
  fontSize: 13,
  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  fontLigatures: true,
  lineHeight: 22,
  wordWrap: "on",
  minimap: { enabled: true, scale: 1 },
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  cursorBlinking: "smooth",
  cursorSmoothCaretAnimation: "on",
  bracketPairColorization: { enabled: true },
  guides: { bracketPairs: true, indentation: true },
  formatOnPaste: true,
  tabSize: 2,
  insertSpaces: true,
  folding: true,
  renderLineHighlight: "gutter",
  scrollbar: { vertical: "auto", horizontal: "auto", verticalScrollbarSize: 8 },
  padding: { top: 12, bottom: 12 },
  mouseWheelZoom: true,
};

const LANG_MAP = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  rs: "rust",
  go: "go",
  java: "java",
  cpp: "cpp",
  c: "c",
  rb: "ruby",
  kt: "kotlin",
  swift: "swift",
  css: "css",
  scss: "scss",
  html: "html",
  json: "json",
  md: "markdown",
  yaml: "yaml",
  yml: "yaml",
  sh: "shell",
  sql: "sql",
  xml: "xml",
  txt: "plaintext",
};

export function getMonacoLanguage(filename) {
  return LANG_MAP[filename?.split(".").pop()?.toLowerCase()] || "plaintext";
}
