const editorPath = require('path');

class EditorManager {
    constructor() {
        this.currentFilePath = null;
        this.markdownManager = null;
        this.isModified = false;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('renameFileBtn').addEventListener('click', () => this.handleFileRename());
        document.getElementById('deleteFileBtn').addEventListener('click', () => this.handleFileDelete());
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    updateFileName(filePath) {
        const fileName = editorPath.basename(filePath);
        const fileNameElement = document.getElementById('current-file-name');
        fileNameElement.textContent = fileName;
    }

    setMarkdownManager(markdownManager) {
        this.markdownManager = markdownManager;
    }

    async openFile(filePath) {
        try {
            if (this.currentFilePath && this.isModified) {
                const editor = document.getElementById('editor');
                const saveIndicator = document.getElementById('saveIndicator');
                await this.saveFile(this.currentFilePath, editor.value, saveIndicator);
                this.isModified = false;
            }

            const content = await fs.readFile(filePath, 'utf-8');
            
            const welcomeContainer = document.querySelector('.welcome-container');
            const fileContent = document.getElementById('file-content');
            const saveIndicator = document.getElementById('saveIndicator');
            
            welcomeContainer.style.display = 'none';
            fileContent.style.display = 'block';

            this.currentFilePath = filePath;
            this.updateFileName(filePath);

            const editor = document.getElementById('editor');
            editor.value = content;
            this.isModified = false;
            
            editor.replaceWith(editor.cloneNode(true));
            const newEditor = document.getElementById('editor');
            
            const debouncedSave = this.debounce(async () => {
                await this.saveFile(this.currentFilePath, newEditor.value, saveIndicator);
                this.isModified = false;
            }, 1000);

            const debouncedMarkdown = this.debounce(() => {
                if (this.markdownManager) {
                    this.markdownManager.updatePreview();
                }
            }, 300);
            
            newEditor.addEventListener('input', () => {
                this.isModified = true;
                debouncedSave();
                debouncedMarkdown();
            });

            const fileExtension = editorPath.extname(filePath).toLowerCase();
            if ((fileExtension === '.md' || fileExtension === '.markdown') && this.markdownManager) {
                if (!this.markdownManager.isMarkdownMode) {
                    this.markdownManager.toggleMarkdownMode();
                }
            }
        } catch (error) {
            console.error('Erreur lors de la lecture du fichier:', error);
        }
    }

    async saveFile(filePath, content, saveIndicator) {
        try {
            saveIndicator.textContent = 'Sauvegarde...';
            saveIndicator.classList.remove('saved');
            saveIndicator.classList.add('saving');
            
            await require('electron').ipcRenderer.invoke('save-file', filePath, content);
            
            saveIndicator.textContent = 'Sauvegardé';
            saveIndicator.classList.remove('saving');
            saveIndicator.classList.add('saved');
            
            setTimeout(() => {
                saveIndicator.classList.remove('saved');
            }, 2000);
            
            console.log('Fichier sauvegardé avec succès');
        } catch (error) {
            saveIndicator.textContent = 'Erreur de sauvegarde';
            saveIndicator.style.backgroundColor = '#ff4444';
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }

    async handleFileRename() {
        if (!this.currentFilePath) return;
        
        const oldPath = this.currentFilePath;
        const oldName = editorPath.basename(oldPath);
        const dirPath = editorPath.dirname(oldPath);
        
        const newName = await modalManager.show({
            title: 'Renommer le fichier',
            defaultValue: oldName,
            placeholder: 'Nouveau nom du fichier'
        });
        
        if (newName && newName !== oldName) {
            try {
                const newPath = editorPath.join(dirPath, newName);
                await require('electron').ipcRenderer.invoke('rename-item', oldPath, newPath);
                this.currentFilePath = newPath;
                this.updateFileName(newPath);
                await window.fileManager.listFiles(window.fileManager.DATA_DIR);
            } catch (error) {
                console.error('Erreur lors du renommage:', error);
            }
        }
    }

    async handleFileDelete() {
        if (!this.currentFilePath) return;
        
        const fileName = editorPath.basename(this.currentFilePath);
        const confirmed = await modalManager.show({
            title: `Voulez-vous vraiment supprimer "${fileName}" ?`,
            type: 'confirm'
        });
        
        if (confirmed) {
            try {
                await require('electron').ipcRenderer.invoke('delete-item', this.currentFilePath);
                document.querySelector('.welcome-container').style.display = 'flex';
                document.getElementById('file-content').style.display = 'none';
                this.currentFilePath = null;
                await window.fileManager.listFiles(window.fileManager.DATA_DIR);
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
            }
        }
    }
}