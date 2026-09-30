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

write("index.html", minifyHtml(read("index.html")));
write("x.css", minifyCss(read("x.css")));
write("x.js", encodeScript(read("x.js")));

console.log("Built protected public files from src/.");
