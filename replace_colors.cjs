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

  // Replace exact Tailwind arbitrary values with primary
  content = content.replace(/\[oklch\(66%_0\.18_75\)\]/g, 'primary');
  content = content.replace(/\[oklch\(66%_0\.18_75\/0\.3\)\]/g, 'primary/30');
  content = content.replace(/\[oklch\(66%_0\.18_75\/0\.12\)\]/g, 'primary/10');
  
  // Replace bare oklch values used in inline styles or strings
  content = content.replace(/oklch\(66% 0\.18 75\)/g, 'var(--primary)');
  content = content.replace(/oklch\(80% 0\.13 80\)/g, 'var(--gold-300)');
  content = content.replace(/oklch\(48% 0\.13 70\)/g, 'var(--gold-700)');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
  }
});

console.log(`Updated ${changedCount} files.`);
