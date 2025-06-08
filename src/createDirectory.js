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
            const newFolderPath = path.join(DATA_DIR, folderName);
            
            try {
                await fs.access(newFolderPath);
                await modalManager.show({
                    title: `Un dossier nommé "${folderName}" existe déjà`,
                    type: 'error'
                });
                return;
            } catch {
                await fs.mkdir(newFolderPath);
                await listFiles(DATA_DIR);
            }
        } catch (error) {
            console.error('Erreur lors de la création du dossier:', error);
            await modalManager.show({
                title: `Erreur lors de la création du dossier: ${error.message}`,
                type: 'error'
            });
        }
    }
});