const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const src = path.join(root, "src");

function read(file) {
  return fs.readFileSync(path.join(src, file), "utf8");
}

function write(file, content) {
  fs.writeFileSync(path.join(root, file), content, "utf8");
}

function minifyHtml(input) {
  return input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .replace(/\s*=\s*/g, "=")
    .trim();
}

function minifyCss(input) {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>+~()])\s*/g, "$1")
    .replace(/;}/g, "}")
    .replace(/\b0(px|em|rem|%)\b/g, "0")
    .trim();
}

function encodeScript(input) {
  const payload = Buffer.from(input, "utf8").toString("base64");
  return `(()=>{const q="${payload}";(0,eval)(new TextDecoder().decode(Uint8Array.from(atob(q),c=>c.charCodeAt(0))))})();`;
}

function decodeSourceScript(input) {
  const payload = input.match(/const q="([^"]+)"/);
  return payload ? Buffer.from(payload[1], "base64").toString("utf8") : input;
}

function collectImageFiles(folder) {
  const imageDirectory = path.join(root, folder);
  if (!fs.existsSync(imageDirectory)) {
    return [];
  }

  return fs
    .readdirSync(imageDirectory, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() && /\.(png|webp|jpe?g)$/i.test(entry.name),
    )
    .map((entry) => entry.name)
    .sort((first, second) =>
      first.localeCompare(second, undefined, { numeric: true }),
    );
}

function usePortfolioFiles(input) {
  const original = [
    "function numberNames(prefix, count) {",
    "  return Array.from({ length: count }, (_, index) => {",
    '    return `${prefix}-${String(index + 1).padStart(2, "0")}`;',
    "  });",
    "}",
  ].join("\n");
  const replacement = [
    "function numberNames(prefix, count) {",
    "  const files = {",
    "    banner: window.portfolioBannerFiles,",
    "    logo: window.portfolioLogoFiles,",
    "    bot: window.portfolioBotFiles,",
    "  }[prefix];",
    "  if (files) {",
    '    return files.map((fileName) => fileName.replace(/\\.[^.]+$/, ""));',
    "  }",
    "  return Array.from({ length: count }, (_, index) => {",
    '    return `${prefix}-${String(index + 1).padStart(2, "0")}`;',
    "  });",
    "}",
  ].join("\n");

  if (!input.includes(original)) {
    throw new Error("Could not locate the portfolio filename helper.");
  }

  return input.replace(original, replacement);
}

function createPortfolioFileList() {
  const galleries = {
    banner: collectImageFiles("banners"),
    logo: collectImageFiles("logos"),
    bot: collectImageFiles("bots"),
    gfx: collectImageFiles("gfx"),
  };

  return Object.entries(galleries)
    .map(([gallery, files]) => {
      const variableName = `portfolio${gallery[0].toUpperCase()}${gallery.slice(1)}Files`;
      return `window.${variableName} = ${JSON.stringify(files)};`;
    })
    .join("\n");
}

const runtimeScript = usePortfolioFiles(
  decodeSourceScript(read("x.js")).replaceAll("assets/", ""),
);

write("index.html", minifyHtml(read("index.html")));
write("x.css", minifyCss(read("x.css")));
write("x.js", encodeScript(runtimeScript));
write("gfx.js", read("gfx.js"));
write("portfolio-files.js", createPortfolioFileList());

console.log("Built protected public files from src/.");
