let folder = __dirname;

const getRootPath = () => {
  return folder;
};

const setRootPath = (newFolder) => {
  folder = newFolder;
};

module.exports = { getRootPath, setRootPath };
