import { readFileSync, existsSync } from 'node:fs';
import { createRequire, Module } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInThisContext } from 'node:vm';
import ts from 'typescript';

const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url));
const cache = new Map();

// Render the actual client components in Node without a browser or a new test
// dependency. Resolve Next's source alias locally rather than patching Node.
export function loadSource(sourcePath) {
  const base = resolve(sourceRoot, sourcePath);
  const filename = [base, `${base}.ts`, `${base}.tsx`].find(path => existsSync(path));
  if (!filename) throw new Error(`Source module not found: ${base}`);
  if (cache.has(filename)) return cache.get(filename).exports;
  const sourceModule = { exports: {} };
  cache.set(filename, sourceModule);
  const nodeRequire = createRequire(filename);
  const require = request => request.startsWith('@/')
    ? loadSource(request.slice(2))
    : request.startsWith('.')
      ? loadSource(resolve(dirname(filename), request))
      : nodeRequire(request);
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  runInThisContext(Module.wrap(outputText), { filename })(sourceModule.exports, require, sourceModule, filename, dirname(filename));
  return sourceModule.exports;
}
