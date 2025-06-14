const fs = require('fs').promises;
const nodePath = require('path');

class FileManager {
    constructor(dataDir) {
        this.DATA_DIR = dataDir;
    }

    async listFiles(directoryPath) {
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
                const fullPath = nodePath.join(directoryPath, file);
                const stats = await fs.stat(fullPath);

                const li = document.createElement('li');
                const fileSpan = document.createElement('span');
                fileSpan.textContent = file;
                li.appendChild(fileSpan);

                if (stats.isDirectory()) {
                    this.createDirectoryElement(li, fileSpan, fullPath, directoryPath);
                }

                fileList.appendChild(li);
            }

            for (const folderPath of openFolders) {
                const folderSpan = fileList.querySelector(`span[data-path="${folderPath}"]`);
                if (folderSpan) {
                    const subList = folderSpan.closest('li').querySelector('ul');
                    subList.classList.add('open');
                    folderSpan.classList.add('open');
                    await this.showSubDirectory(folderPath, subList);
                }
            }
        } catch (error) {
            console.error('Erreur lors de la lecture du dossier:', error);
        }
    }

    createDirectoryElement(li, fileSpan, fullPath, directoryPath) {
        const subList = document.createElement('ul');

        const fileItemHeader = document.createElement('div');
        fileItemHeader.className = 'file-item-header';

        fileItemHeader.appendChild(fileSpan);
        fileSpan.dataset.type = 'directory';
        fileSpan.dataset.path = fullPath;

        const actionDiv = this.createActionButtons(fullPath, directoryPath, subList);
        fileItemHeader.appendChild(actionDiv);
        li.appendChild(fileItemHeader);
        li.appendChild(subList);

        li.addEventListener('click', async (event) => {
            await this.toggleDirectory(fileSpan, subList, fullPath);
        });
    }

    createActionButtons(fullPath, directoryPath, subList) {
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

        const file = path.basename(fullPath);
        renameBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await this.renameItem(file, fullPath, path.dirname(fullPath));
        });

        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await this.deleteItem(file, fullPath, path.dirname(fullPath));
        });

        addFileBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await this.createNewFile(fullPath, subList);
        });

        return actionDiv;
    }

    async showSubDirectory(dirPath, subList) {
        try {
            const wasOpen = subList.classList.contains('open');
            subList.innerHTML = '';
            const files = await fs.readdir(dirPath);

            for (const file of files) {
                const fullPath = nodePath.join(dirPath, file);
                const stats = await fs.stat(fullPath);

                const li = document.createElement('li');
                const fileSpan = document.createElement('span');
                fileSpan.textContent = file;
                li.appendChild(fileSpan);

                if (stats.isFile()) {
                    fileSpan.dataset.type = 'file';
                    fileSpan.addEventListener('click', (event) => {
                        event.stopPropagation();
                        window.editorManager.openFile(fullPath);
                    });
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

    async toggleDirectory(fileSpan, subList, fullPath) {
        const isHidden = !subList.classList.contains('open');

        if (isHidden) {
            subList.classList.add('open');
            fileSpan.classList.add('open');

            if (subList.children.length === 0) {
                await this.showSubDirectory(fullPath, subList);
            }
        } else {
            subList.classList.remove('open');
            fileSpan.classList.remove('open');
        }
    }

    async renameItem(file, fullPath, directoryPath) {
        const newName = await modalManager.show({
            title: 'Renommer le dossier',
            defaultValue: file,
            placeholder: 'Nouveau nom du dossier'
        });

        if (newName && newName !== file) {
            try {
                const newPath = nodePath.join(directoryPath, newName);
                await require('electron').ipcRenderer.invoke('rename-item', fullPath, newPath);
                await this.listFiles(directoryPath);
            } catch (error) {
                console.error('Erreur lors du renommage:', error);
            }
        }
    }

    async deleteItem(file, fullPath, directoryPath) {
        const confirmed = await modalManager.show({
            title: `Voulez-vous vraiment supprimer "${file}" ?`,
            type: 'confirm'
        });

        if (confirmed) {
            try {
                await require('electron').ipcRenderer.invoke('delete-item', fullPath);
                await this.listFiles(directoryPath);
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
            }
        }
    }

    async createNewFile(fullPath, subList) {
        const fileName = await modalManager.show({
            title: 'Créer un nouveau fichier',
            placeholder: 'Nom du fichier'
        });

        if (fileName) {
            try {
                const newFilePath = nodePath.join(fullPath, fileName);

                try {
                    await fs.access(newFilePath);

                    await modalManager.show({
                        title: `Un fichier nommé "${fileName}" existe déjà dans ce dossier`,
                        type: 'error'
                    });
                    return;
                } catch {
                    await require('electron').ipcRenderer.invoke('create-file', newFilePath);
                    if (subList.classList.contains('open')) {
                        await this.showSubDirectory(fullPath, subList);
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la création du fichier:', error);
            }
        }
    }
}