const fs = require('fs');
const path = require('path');

const cssVarsMap = [
  { match: /#6c3ce0/gi, replace: 'var(--primary)' },
  { match: /#5b2cc4/gi, replace: 'var(--primary-hover)' },
  { match: /#4f22b3/gi, replace: 'var(--primary-hover)' },
  { match: /#7c4ce8/gi, replace: 'var(--primary-light)' },
  { match: /#a78bfa/gi, replace: 'var(--primary-light)' },
  { match: /#0f1120/gi, replace: 'var(--bg-main)' },
  { match: /#161a2e/gi, replace: 'var(--bg-surface)' },
  { match: /#fff/gi, replace: 'var(--text-primary)' },
  { match: /rgba\(108, 60, 224, 0.3\)/gi, replace: 'var(--primary-light)' },
  { match: /rgba\(108, 60, 224, 0.25\)/gi, replace: 'var(--primary-light)' },
  { match: /rgba\(255, 255, 255, 0.06\)/gi, replace: 'var(--border)' },
  { match: /rgba\(255, 255, 255, 0.55\)/gi, replace: 'var(--text-muted)' },
  { match: /rgba\(255, 255, 255, 0.85\)/gi, replace: 'var(--text-primary)' },
  { match: /rgba\(255, 255, 255, 0.05\)/gi, replace: 'var(--glass-bg)' },
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.css') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const mapping of cssVarsMap) {
        if (mapping.match.test(content)) {
          content = content.replace(mapping.match, mapping.replace);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src'));
console.log('Finished updating colors.');
