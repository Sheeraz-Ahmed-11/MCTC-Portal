import fs from "fs";
import path from "path";

const replacements = [
  ["text-[var(--muted)]", "text-muted-foreground"],
  ["border-[var(--border)]", "border-border"],
  ["bg-[var(--surface)]", "bg-card"],
  ["bg-[var(--surface-hover)]", "bg-muted"],
  ["hover:bg-[var(--surface-hover)]", "hover:bg-muted"],
  ["text-[var(--accent)]", "text-primary"],
  ["bg-[var(--accent-muted)]", "bg-primary/15"],
  ["text-[var(--gold)]", "text-mctc-gold"],
  ["border border-[var(--border)] bg-[var(--surface)]", "border border-border bg-card"],
];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (/\.tsx$/.test(name)) {
      let text = fs.readFileSync(full, "utf8");
      let changed = false;
      for (const [from, to] of replacements) {
        if (text.includes(from)) {
          text = text.split(from).join(to);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(full, text);
        console.log("updated:", full);
      }
    }
  }
}

walk(path.join(process.cwd(), "src"));
