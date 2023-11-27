const fs = require('fs');
const config = require('./resources.config.json');
const archiver = require('archiver')
const path = require('path');

console.log('⌛ Bundling resources...')

const targetDir = path.join(__dirname, config.outputPath)
if (!fs.existsSync(targetDir)){
    fs.mkdirSync(targetDir, { recursive: true });
}

const targetPath = path.join(targetDir, config.name + '.zip')
const output = fs.createWriteStream(targetPath)
const archive = archiver("zip")

output.on('close', () => {
    console.log(`✅ Resources successfully packaged! (${archive.pointer()} bytes)`);
    console.log(targetPath)
});

archive.on('error', function(err){
    throw err;
});

archive.pipe(output);

archive.directory(config.resources, false);

archive.finalize();
