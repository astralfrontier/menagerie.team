const fs = require("fs-extra");
const Walk = require("@root/walk");
const path = require("path");
const slugify = require("slugify");

const records = [];

Walk.walk("./art", identifyFiles).then(() => {
  records.sort((a, b) => b.pathLength - a.pathLength);
  console.dir(records);
  for (let record of records) {
    if (record.oldName !== record.newName) {
      try {
        fs.moveSync(record.oldName, record.newName);
      } catch (e) {
        console.dir(record);
      }
    }
  }
  console.log("Done");
});

function identifyFiles(err, pathname, dirent) {
  if (err) {
    console.warn("fs stat error for %s: %s", pathname, err.message);
    return Promise.resolve();
  }

  // Skip dot folders
  if (dirent.isDirectory() && dirent.name.startsWith(".")) {
    return Promise.resolve(false);
  }

  const isFile = dirent.isFile();
  if (isFile) {
    const ext = path.extname(dirent.name);
    const newName = path.join(
      path.dirname(pathname),
      `${slugify(path.basename(dirent.name, ext))}${ext}`
    );
    records.push({
      pathLength: pathname.split(path.sep).length,
      isFile,
      oldName: pathname,
      newName,
    });
  } else {
    const newName = path.join(
      path.dirname(pathname),
      slugify(path.basename(dirent.name))
    );
    records.push({
      pathLength: pathname.split(path.sep).length,
      isFile,
      oldName: pathname,
      newName,
    });
  }

  return Promise.resolve();
}
