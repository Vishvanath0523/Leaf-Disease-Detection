const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

// --- Configuration ---
const outputFileName = 'project.zip';
const sourceDir = '.';
const excludedPaths = [
  'node_modules',
  '.next',
  outputFileName,
  '.git', // Exclude git directory if present
];
// ---------------------

const output = fs.createWriteStream(path.join(__dirname, '..', outputFileName));
const archive = archiver('zip', {
  zlib: { level: 9 }, // Sets the compression level.
});

output.on('close', function () {
  console.log(`Project successfully packaged into ${outputFileName}`);
  console.log(archive.pointer() + ' total bytes');
});

archive.on('warning', function (err) {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    throw err;
  }
});

archive.on('error', function (err) {
  throw err;
});

archive.pipe(output);

console.log('Packaging project files...');

archive.glob('**/*', {
  cwd: sourceDir,
  ignore: excludedPaths.map(p => `${p}/**`).concat(excludedPaths),
  dot: true,
});

archive.finalize();
