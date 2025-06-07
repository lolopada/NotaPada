const fs = require('fs').promises;
const path = require('path');
const { ipcRenderer } = require('electron');

let currentFilePath = null;

function debounce(func, wait) {
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

async function listFiles(directoryPath) {
    try {
        const files = await fs.readdir(directoryPath);
        const fileList = document.getElementById('fileList');
        
        const openFolders = [];
        fileList.querySelectorAll('ul.open').forEach(ul => {
            const folderPath = ul.previousSibling.querySelector('span').dataset.path;
            if (folderPath) {
                openFolders.push(folderPath);
            }
        });
        
        fileList.innerHTML = '';
        
        for (const file of files) {
            const fullPath = path.join(directoryPath, file);
            const stats = await fs.stat(fullPath);
            
            const li = document.createElement('li');
            const fileSpan = document.createElement('span');
            fileSpan.textContent = file;
            li.appendChild(fileSpan);
            
            if (stats.isDirectory()) {
                const subList = document.createElement('ul');
                
                const fileItemHeader = document.createElement('div');
                fileItemHeader.className = 'file-item-header';
                
                fileItemHeader.appendChild(fileSpan);
                fileSpan.dataset.type = 'directory';
                fileSpan.dataset.path = fullPath;
                
                const actionDiv = document.createElement('div');
                actionDiv.className = 'file-actions';
                
                const renameBtn = document.createElement('button');
                renameBtn.className = 'action-btn';
                renameBtn.innerHTML = '<svg class="svg-rename-btn" xmlns="http://www.w3.org/2000/svg" width="1536" height="1536" viewBox="0 0 1536 1536"><path fill="currentColor" d="m363 1408l91-91l-235-235l-91 91v107h128v128zm523-928q0-22-22-22q-10 0-17 7l-542 542q-7 7-7 17q0 22 22 22q10 0 17-7l542-542q7-7 7-17m-54-192l416 416l-832 832H0v-416zm683 96q0 53-37 90l-166 166l-416-416l166-165q36-38 90-38q53 0 91 38l235 234q37 39 37 91"/></svg>';
                renameBtn.title = 'Renommer';
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'action-btn';
                deleteBtn.innerHTML = '<svg class="svg-delete-btn" xmlns="http://www.w3.org/2000/svg" width="1408" height="1536" viewBox="0 0 1408 1536"><path fill="currentColor" d="M512 1248V544q0-14-9-23t-23-9h-64q-14 0-23 9t-9 23v704q0 14 9 23t23 9h64q14 0 23-9t9-23m256 0V544q0-14-9-23t-23-9h-64q-14 0-23 9t-9 23v704q0 14 9 23t23 9h64q14 0 23-9t9-23m256 0V544q0-14-9-23t-23-9h-64q-14 0-23 9t-9 23v704q0 14 9 23t23 9h64q14 0 23-9t9-23M480 256h448l-48-117q-7-9-17-11H546q-10 2-17 11zm928 32v64q0 14-9 23t-23 9h-96v948q0 83-47 143.5t-113 60.5H288q-66 0-113-58.5T128 1336V384H32q-14 0-23-9t-9-23v-64q0-14 9-23t23-9h309l70-167q15-37 54-63t79-26h320q40 0 79 26t54 63l70 167h309q14 0 23 9t9 23"/></svg>';
                deleteBtn.title = 'Supprimer';
                
                const addFileBtn = document.createElement('button');
                addFileBtn.className = 'action-btn';
                addFileBtn.innerHTML = '<svg class="svg-add-btn" xmlns="http://www.w3.org/2000/svg" width="1536" height="1792" viewBox="0 0 1536 1792"><path fill="currentColor" d="M1024 512V40q22 14 36 28l408 408q14 14 28 36zm-128 32q0 40 28 68t68 28h544v1056q0 40-28 68t-68 28H96q-40 0-68-28t-28-68V96q0-40 28-68T96 0h800z"/></svg>';
                addFileBtn.title = 'Nouveau fichier';
                
                actionDiv.appendChild(renameBtn);
                actionDiv.appendChild(deleteBtn);
                actionDiv.appendChild(addFileBtn);
                fileItemHeader.appendChild(actionDiv);
                li.appendChild(fileItemHeader);
                li.appendChild(subList);
                
                renameBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    await renameItem(file, fullPath, directoryPath);
                });
                
                deleteBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    await deleteItem(file, fullPath, directoryPath);
                });
                
                addFileBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    await createNewFile(fullPath, subList);
                });
                
                fileSpan.addEventListener('click', async (event) => {
                    await toggleDirectory(fileSpan, subList, fullPath);
                });
            }
            
            fileList.appendChild(li);
        }

        for (const folderPath of openFolders) {
            const folderSpan = fileList.querySelector(`span[data-path="${folderPath}"]`);
            if (folderSpan) {
                const subList = folderSpan.closest('li').querySelector('ul');
                subList.classList.add('open');
                folderSpan.classList.add('open');
                await showSubDirectory(folderPath, subList);
            }
        }
    } catch (error) {
        console.error('Erreur lors de la lecture du dossier:', error);
    }
}

async function renameItem(file, fullPath, directoryPath) {
    const newName = await modalManager.show({
        title: 'Renommer le dossier',
        defaultValue: file,
        placeholder: 'Nouveau nom du dossier'
    });
    
    if (newName && newName !== file) {
        try {
            const newPath = path.join(directoryPath, newName);
            await ipcRenderer.invoke('rename-item', fullPath, newPath);
            await listFiles(directoryPath);
        } catch (error) {
            console.error('Erreur lors du renommage:', error);
        }
    }
}

async function deleteItem(file, fullPath, directoryPath) {
    const confirmed = await modalManager.show({
        title: `Voulez-vous vraiment supprimer "${file}" ?`,
        type: 'confirm'
    });
    
    if (confirmed) {
        try {
            await ipcRenderer.invoke('delete-item', fullPath);
            await listFiles(directoryPath);
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    }
}

async function createNewFile(fullPath, subList) {
    const fileName = await modalManager.show({
        title: 'Créer un nouveau fichier',
        placeholder: 'Nom du fichier'
    });
    
    if (fileName) {
        try {
            const newFilePath = path.join(fullPath, fileName);
            await ipcRenderer.invoke('create-file', newFilePath);
            if (subList.classList.contains('open')) {
                await showSubDirectory(fullPath, subList);
            }
        } catch (error) {
            console.error('Erreur lors de la création du fichier:', error);
        }
    }
}

async function toggleDirectory(fileSpan, subList, fullPath) {
    const isHidden = !subList.classList.contains('open');
    
    if (isHidden) {
        subList.classList.add('open');
        fileSpan.classList.add('open');
        
        if (subList.children.length === 0) {
            await showSubDirectory(fullPath, subList);
        }
    } else {
        subList.classList.remove('open');
        fileSpan.classList.remove('open');
    }
}

async function showSubDirectory(dirPath, subList) {
    try {
        const wasOpen = subList.classList.contains('open');
        subList.innerHTML = '';
        const files = await fs.readdir(dirPath);
        
        for (const file of files) {
            const fullPath = path.join(dirPath, file);
            const stats = await fs.stat(fullPath);
            
            const li = document.createElement('li');
            const fileSpan = document.createElement('span');
            fileSpan.textContent = file;
            li.appendChild(fileSpan);
            
            if (stats.isFile()) {
                fileSpan.dataset.type = 'file';
                fileSpan.addEventListener('click', () => openFile(fullPath));
            }
            
            subList.appendChild(li);
        }

        if (wasOpen) {
            subList.classList.add('open');
            const parentFileSpan = subList.previousSibling.querySelector('span');
            if (parentFileSpan) {
                parentFileSpan.classList.add('open');
            }
        }
    } catch (error) {
        console.error('Erreur lors de la lecture du sous-dossier:', error);
    }
}

function updateFileName(filePath) {
    const fileName = path.basename(filePath);
    const fileNameElement = document.getElementById('current-file-name');
    fileNameElement.textContent = fileName;
}

async function handleFileRename() {
    if (!currentFilePath) return;
    
    const oldPath = currentFilePath;
    const oldName = path.basename(oldPath);
    const dirPath = path.dirname(oldPath);
    
    const newName = await modalManager.show({
        title: 'Renommer le fichier',
        defaultValue: oldName,
        placeholder: 'Nouveau nom du fichier'
    });
    
    if (newName && newName !== oldName) {
        try {
            const newPath = path.join(dirPath, newName);
            await ipcRenderer.invoke('rename-item', oldPath, newPath);
            currentFilePath = newPath;
            updateFileName(newPath);
            await listFiles('./NOTES/');
        } catch (error) {
            console.error('Erreur lors du renommage:', error);
        }
    }
}

async function handleFileDelete() {
    if (!currentFilePath) return;
    
    const fileName = path.basename(currentFilePath);
    const confirmed = await modalManager.show({
        title: `Voulez-vous vraiment supprimer "${fileName}" ?`,
        type: 'confirm'
    });
    
    if (confirmed) {
        try {
            await ipcRenderer.invoke('delete-item', currentFilePath);
            document.querySelector('.welcome-container').style.display = 'flex';
            document.getElementById('file-content').style.display = 'none';
            currentFilePath = null;
            await listFiles('./NOTES/');
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    }
}

async function openFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        
        const welcomeContainer = document.querySelector('.welcome-container');
        const fileContent = document.getElementById('file-content');
        const saveIndicator = document.getElementById('saveIndicator');
        
        welcomeContainer.style.display = 'none';
        fileContent.style.display = 'block';

        currentFilePath = filePath;
        updateFileName(filePath);

        const editor = document.getElementById('editor');
        editor.value = content;
        
        editor.replaceWith(editor.cloneNode(true));
        const newEditor = document.getElementById('editor');
        
        newEditor.addEventListener('input', debounce(async () => {
            await saveFile(currentFilePath, newEditor.value, saveIndicator);
        }, 1000));
    } catch (error) {
        console.error('Erreur lors de la lecture du fichier:', error);
    }
}

async function saveFile(filePath, content, saveIndicator) {
    try {
        saveIndicator.textContent = 'Sauvegarde...';
        saveIndicator.classList.remove('saved');
        saveIndicator.classList.add('saving');
        
        await ipcRenderer.invoke('save-file', filePath, content);
        
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

listFiles('./NOTES/');
document.getElementById('renameFileBtn').addEventListener('click', handleFileRename);
document.getElementById('deleteFileBtn').addEventListener('click', handleFileDelete);

