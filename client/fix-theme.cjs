const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'src'), (filePath) => {
  if (filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Fix background: var(--text-primary) to background: var(--bg-surface)
    content = content.replace(/background:\s*var\(--text-primary\)/g, 'background: var(--bg-surface)');
    
    // Fix weird color replacements
    content = content.replace(/var\(--bg-surface\)7ed/g, '#fff7ed');
    content = content.replace(/var\(--bg-surface\)8f8/g, '#f0fdf4');
    content = content.replace(/var\(--text-primary\)7ed/g, '#fff7ed');
    content = content.replace(/var\(--text-primary\)8f8/g, '#f0fdf4');
    
    // Fix other hardcoded colors to variables for a perfect theme
    content = content.replace(/color:\s*#1e1e2f/g, 'color: var(--text-primary)');
    content = content.replace(/color:\s*#6b7280/g, 'color: var(--text-secondary)');
    content = content.replace(/color:\s*#9ca3af/g, 'color: var(--text-muted)');
    content = content.replace(/border-color:\s*#e5e7eb/g, 'border-color: var(--border)');
    content = content.replace(/border:\s*([0-9.]+)px solid #e5e7eb/g, 'border: $1px solid var(--border)');
    content = content.replace(/border-bottom:\s*([0-9.]+)px solid #f3f4f6/g, 'border-bottom: $1px solid var(--border-light)');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', filePath);
    }
  }
});
