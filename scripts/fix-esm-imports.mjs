import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');

async function findJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findJavaScriptFiles(entryPath)));
    } else if (entry.name.endsWith('.js')) {
      files.push(entryPath);
    }
  }

  return files;
}

for (const filePath of await findJavaScriptFiles(distDir)) {
  const source = await readFile(filePath, 'utf8');
  const rewritten = source.replace(/(['"])#\/([^'"]+)\1/g, (_match, quote, importPath) => {
    let targetPath = path.join(distDir, importPath);

    if (!importPath.endsWith('.js')) {
      const indexPath = path.join(targetPath, 'index.js');
      if (existsSync(indexPath)) {
        targetPath = indexPath;
      } else {
        targetPath = `${targetPath}.js`;
      }
    }

    let relativePath = path.relative(path.dirname(filePath), targetPath).replaceAll('\\', '/');

    if (!relativePath.startsWith('.')) {
      relativePath = `./${relativePath}`;
    }

    return `${quote}${relativePath}${quote}`;
  });

  if (rewritten !== source) {
    await writeFile(filePath, rewritten);
  }
}
