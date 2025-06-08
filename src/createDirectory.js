const modal = document.getElementById('folderModal');
const newFolderBtn = document.getElementById('newFolderBtn');
const createFolderBtn = document.getElementById('createFolderBtn');
const cancelFolderBtn = document.getElementById('cancelFolderBtn');
const folderNameInput = document.getElementById('folderName');

newFolderBtn.addEventListener('click', async () => {
    const folderName = await modalManager.show({
        title: 'Créer un nouveau dossier',
        placeholder: 'Nom du dossier'
    });
    
    if (folderName) {
        try {
            await fs.mkdir(path.join(DATA_DIR, folderName));
            await listFiles(DATA_DIR);
        } catch (error) {
            console.error('Erreur lors de la création du dossier:', error);
        }
    }
});