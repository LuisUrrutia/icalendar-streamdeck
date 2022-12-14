import { existsSync } from "fs";
import { readFileSync, writeFileSync } from "jsonfile";
import * as path from "path";
import { manifestNs } from "./manifest";

const version = process.argv[2];
if (version === undefined) {
  console.error("\nā Usage: yarn set-plugin-version <VERSION>\n");
  process.exit();
}

let manifestPath: string = path.join(__dirname, "../../dist/" + manifestNs + ".sdPlugin/manifest.json");
if (!existsSync(manifestPath)) {
  manifestPath = path.join(__dirname, "../../dist/dev." + manifestNs + ".sdPlugin/manifest.json");
}

if (!existsSync(manifestPath)) {
  console.error("ā could not find manifest.json in prod OR dev dist directories");
  process.exit(1);
}

console.info("š¦ setting version to " + version + " ...");
let json = readFileSync(manifestPath);
json.Version = version;
writeFileSync(manifestPath, json, { spaces: 2 });

json = readFileSync(manifestPath);
if (json.Version !== version) {
  console.error("ā unknown error on writing version to file " + manifestPath);
  process.exit(1);
}
console.info("ā version set in file " + path.relative(process.cwd(), manifestPath));
