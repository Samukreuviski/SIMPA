const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/samue/OneDrive/Área de Trabalho/SFS1/SIMPA/frontend_dashboard/js/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  let changed = false;
  
  if (content.includes('background:#F6F6F6')) {
    content = content.replace(/background:#F6F6F6/g, 'background:var(--bg-card)');
    changed = true;
  }
  if (content.includes('color:#003D61')) {
    content = content.replace(/color:#003D61/g, 'color:var(--text-main)');
    changed = true;
  }
  if (content.includes('color:#404040')) {
    content = content.replace(/color:#404040/g, 'color:var(--text-strong)');
    changed = true;
  }
  if (content.includes('background:#3FA9F5; color:#ffffff;')) {
    content = content.replace(/background:#3FA9F5; color:#ffffff;/g, 'background:var(--blue-primary); color:var(--bg-page);');
    changed = true;
  }
  if (content.includes('background:#004D7B')) {
    content = content.replace(/background:#004D7B/g, 'background:var(--blue-deep)');
    changed = true;
  }
  if (content.includes('background:#003D61')) {
    content = content.replace(/background:#003D61/g, 'background:var(--blue-sidebar)');
    changed = true;
  }
  if (content.includes('border:1px solid #E3E3E3')) {
    content = content.replace(/border:1px solid #E3E3E3/g, 'border:1px solid var(--border-color)');
    changed = true;
  }
  if (content.includes('#E3E3E3')) {
    content = content.replace(/#E3E3E3/g, 'var(--bg-page)');
    changed = true;
  }
  if (content.includes('#FFFFFF')) {
    content = content.replace(/#FFFFFF/g, 'var(--bg-card)');
    changed = true;
  }
  if (content.includes('fill="#404040"')) {
    content = content.replace(/fill="#404040"/g, 'fill="currentColor"');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(path.join(dir, file), content);
    console.log('Fixed ' + file);
  }
}
