const fs = require("fs");
const dir = "dist/assets";
const f = fs.readdirSync(dir).find((x) => x.endsWith(".css"));
const c = fs.readFileSync(dir + "/" + f, "utf8");
const keys = ["max-w-md", "max-w-lg", "max-w-container-max", ".w-full", ".flex-1", "min-w-0", ".flex", "ml-\\[280px\\]", "h-dvh", "w-screen"];
for (const k of keys) {
  const re = new RegExp(k);
  console.log(k.padEnd(24), re.test(c) ? "FOUND" : "MISSING");
}
