import fs from "fs";
import path from "path";

const root = path.join(process.cwd(), "src");

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (/\.tsx?$/.test(name)) {
      const text = fs.readFileSync(full, "utf8");
      if (text.includes("motionless")) {
        fs.writeFileSync(full, text.replaceAll("motionless", "div"));
        console.log("fixed:", full);
      }
    }
  }
}

walk(root);
