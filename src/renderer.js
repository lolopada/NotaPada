// Initialisation des gestionnaires
window.fileManager = new FileManager(window.DATA_DIR);
window.editorManager = new EditorManager();
window.markdownManager = new MarkdownManager();

window.editorManager.setMarkdownManager(window.markdownManager);

const { ipcRenderer } = require('electron');

ipcRenderer.on('force-save', async () => {
    if (window.editorManager.currentFilePath && window.editorManager.isModified) {
        const editor = document.getElementById('editor');
        const saveIndicator = document.getElementById('saveIndicator');
        await window.editorManager.saveFile(
            window.editorManager.currentFilePath, 
            editor.value, 
            saveIndicator
        );
    }
});

window.fileManager.listFiles(window.DATA_DIR);