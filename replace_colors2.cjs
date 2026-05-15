const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./client/src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // 1. standard tailwind classes with alpha: bg-[oklch(.../0.1)] -> bg-primary/10
  content = content.replace(/([a-z:-]+)-\[oklch\(66%_0\.18_75\/([0-9.]+)\)\]/g, (match, prefix, alpha) => {
    const pct = Math.round(parseFloat(alpha) * 100);
    return `${prefix}-primary/${pct}`;
  });

  // 2. inline styles or complex tailwind arbitrary values with alpha
  content = content.replace(/oklch\(66% 0\.18 75 \/ ([0-9.]+)\)/g, (match, alpha) => {
    const pct = Math.round(parseFloat(alpha) * 100);
    return `color-mix(in srgb, var(--primary) ${pct}%, transparent)`;
  });

  content = content.replace(/oklch\(66%_0\.18_75\/([0-9.]+)\)/g, (match, alpha) => {
    const pct = Math.round(parseFloat(alpha) * 100);
    // For tailwind arbitrary properties without spaces
    return `color-mix(in_srgb,var(--primary)_${pct}%,transparent)`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
  }
});

console.log(`Updated ${changedCount} files.`);
