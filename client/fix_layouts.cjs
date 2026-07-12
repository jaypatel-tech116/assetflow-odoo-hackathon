const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      processDir(full);
    } else if (full.endsWith('.jsx')) {
      let content = fs.readFileSync(full, 'utf8');
      
      // Remove Topbar/Sidebar imports
      content = content.replace(/import Topbar from [^;]+;\n?/g, '');
      content = content.replace(/import Sidebar from [^;]+;\n?/g, '');
      
      // Remove Dashboard.css import if not in Dashboard folder
      if (!full.includes('Dashboard')) {
        content = content.replace(/import ["'].*Dashboard\.css["'];\n?/g, '');
      }

      // Remove <Topbar /> and <Sidebar /> elements
      content = content.replace(/<Topbar[^>]*>\s*<\/Topbar>/g, '');
      content = content.replace(/<Topbar[^>]*\/>/g, '');
      content = content.replace(/<Sidebar[^>]*>\s*<\/Sidebar>/g, '');
      content = content.replace(/<Sidebar[^>]*\/>/g, '');
      
      fs.writeFileSync(full, content);
    }
  }
}

processDir(path.join(__dirname, 'src', 'pages'));
console.log('Fixed layouts');
