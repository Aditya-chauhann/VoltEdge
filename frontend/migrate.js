const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['app', 'components'];

const REPLACEMENTS = [
  // Backgrounds
  { regex: /(?<!dark:)\bbg-gray-950\b/g, replacement: 'bg-gray-50 dark:bg-gray-950' },
  { regex: /(?<!dark:)\bbg-gray-900\b/g, replacement: 'bg-white dark:bg-gray-900' },
  { regex: /(?<!dark:)\bbg-gray-800\b/g, replacement: 'bg-gray-100 dark:bg-gray-800' },
  // Borders
  { regex: /(?<!dark:)\bborder-gray-800\b/g, replacement: 'border-gray-200 dark:border-gray-800' },
  { regex: /(?<!dark:)\bborder-gray-700\b/g, replacement: 'border-gray-300 dark:border-gray-700' },
  // Text
  { regex: /(?<!dark:)\btext-white\b/g, replacement: 'text-gray-900 dark:text-white' },
  { regex: /(?<!dark:)\btext-gray-400\b/g, replacement: 'text-gray-600 dark:text-gray-400' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      for (const { regex, replacement } of REPLACEMENTS) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

DIRECTORIES.forEach(dir => {
  const fullDirPath = path.join(__dirname, dir);
  if (fs.existsSync(fullDirPath)) {
    processDirectory(fullDirPath);
  }
});

console.log('Migration completed.');
