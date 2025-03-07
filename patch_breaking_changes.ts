import config from './sandstone.config';
import * as fs from 'fs';
import * as archiver from 'archiver';
import * as path from 'path';

const FOLDER_RENAME_PATTERNS = [
    { search: 'advancements', replacement: 'advancement' },
    { search: 'functions', replacement: 'function' }
  ];

const CONTENT_PATCHES = [
  {
    files: [
      'data/$name$/function/place_crumbs/execute_as.mcfunction', 
      'data/$name$/function/do_accident/execute_as.mcfunction'
    ],
    regex: /Count:(.+)/,
    replacement: 'count:$1'
  },
  {
    files: [
      'data/$name$/function/place_crumbs/execute_as.mcfunction',
      'data/$name$/function/do_accident/execute_as.mcfunction'
    ],
    regex: /tag:{CustomModelData:(\d+)}/,
    replacement: "components:{'minecraft:custom_model_data':$1}"
  }
]

function renameFolders(dirPath: string) {
    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
  
      for (const item of items) {
        var fullPath = path.join(dirPath, item.name);
  
        if (item.isDirectory()) {
          let newName = item.name;
  
          // Apply all patterns
          for (const { search, replacement } of FOLDER_RENAME_PATTERNS) {
            if (newName.includes(search)) {
              newName = newName.replace(search, replacement);
            }
          }
  
          if (newName !== item.name) {
            const newPath = path.join(dirPath, newName);
            fs.renameSync(fullPath, newPath);
            console.log(`Renamed: ${fullPath} ➡️ ${newPath}`);
            fullPath = newPath; // Update path for recursive call
          }
  
          // Recurse into folder (even if renamed)
          renameFolders(fullPath);
        }
      }
    } catch (err) {
      console.error(`Error processing directory: ${dirPath}`, err);
    }
  }

function patchContent(dirPath: string, packName: string) {
  for (const { files, regex, replacement } of CONTENT_PATCHES) {
    for (const file of files) {
      const fileWithPackName = file.replace('$name$', packName);
      const filePath = path.join(dirPath, fileWithPackName);
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(regex, replacement);
      fs.writeFileSync(filePath, content);
      console.log(`Processed: ${regex} in ${fileWithPackName}`);
    }
  }
}


console.log('⌛ Patching breaking changes...');

if (!config.saveOptions.path) {
    console.error('❌ No save path specified in sandstone.config.js');
    process.exit(1);
}

const targetDir = path.resolve(config.saveOptions.path);
const dataPackDir = path.join(targetDir, config.name);


console.log('📁 Renaming directories...');
renameFolders(dataPackDir);
console.log('🔧 Patching files...');
patchContent(dataPackDir, config.name);

console.log('✅ Datapack contents patched!');