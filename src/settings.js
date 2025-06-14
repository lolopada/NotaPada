const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'NOTES');

// Make DATA_DIR globally available
window.DATA_DIR = DATA_DIR;