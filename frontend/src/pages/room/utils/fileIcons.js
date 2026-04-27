const EXT_MAP = {
  js:    { icon: "JS",  color: "#f7df1e" },
  jsx:   { icon: "⬡",  color: "#61dafb" },
  ts:    { icon: "TS",  color: "#3178c6" },
  tsx:   { icon: "⬡",  color: "#3178c6" },
  py:    { icon: "PY",  color: "#3572A5" },
  rs:    { icon: "RS",  color: "#dea584" },
  go:    { icon: "GO",  color: "#00ADD8" },
  java:  { icon: "J",   color: "#b07219" },
  cpp:   { icon: "C++", color: "#f34b7d" },
  rb:    { icon: "RB",  color: "#701516" },
  kt:    { icon: "KT",  color: "#A97BFF" },
  swift: { icon: "SW",  color: "#F05138" },
  css:   { icon: "~",   color: "#38bdf8" },
  html:  { icon: "<>",  color: "#e34c26" },
  json:  { icon: "{}",  color: "#4ade80" },
  md:    { icon: "MD",  color: "#e6edf3" },
  txt:   { icon: "T",   color: "#8b949e" },
  env:   { icon: ".E",  color: "#ecc94b" },
  yml:   { icon: "Y",   color: "#cb171e" },
  yaml:  { icon: "Y",   color: "#cb171e" },
};

export function getFileIcon(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  return EXT_MAP[ext]?.icon || "F";
}

export function getFileIconColor(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  return EXT_MAP[ext]?.color || "#8b949e";
}
