const modal = document.getElementById('folderModal');
const newFolderBtn = document.getElementById('newFolderBtn');
const createFolderBtn = document.getElementById('createFolderBtn');
const cancelFolderBtn = document.getElementById('cancelFolderBtn');
const folderNameInput = document.getElementById('folderName');

newFolderBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    folderNameInput.value = '';
    folderNameInput.focus();
});

cancelFolderBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

createFolderBtn.addEventListener('click', async () => {
    const folderName = folderNameInput.value.trim();
    if (folderName) {
        try {
            await fs.mkdir(path.join(DATA_DIR, folderName));
            modal.style.display = 'none';
            await listFiles(DATA_DIR);
        } catch (error) {
            console.error('Erreur lors de la création du dossier:', error);
        }
    }
});