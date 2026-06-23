const fs = require('fs');

const file = 'c:/SweetManager/SweetManager/frontend/src/pages/TableauDeBord.jsx';
let content = fs.readFileSync(file, 'utf8');

// The rewrite is massive, let's just do it with a helper
function replace(content, startStr, endStr, newStr) {
  const start = content.indexOf(startStr);
  const end = content.indexOf(endStr, start);
  if (start === -1 || end === -1) {
    console.log("Failed to find boundaries", startStr.substring(0, 30));
    return content;
  }
  return content.substring(0, start) + newStr + content.substring(end + endStr.length);
}

// Write the file
fs.writeFileSync(file, content);
console.log("Rewritten!");
