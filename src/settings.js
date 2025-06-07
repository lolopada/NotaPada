const path = require('path');

const settings = {
    DATA_DIR: path.join(process.cwd(), 'NOTES'), // <-- modifier le chemin ici 
};

module.exports = settings;