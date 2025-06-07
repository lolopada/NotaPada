# NotaPada

NotaPada est une application de prise de notes construite avec Electron.

## 🚀 Installation

1. Clonez le repository :
```bash
git clone <votre-repo-url>
cd mon-app-electron
```

2. Installez les dépendances :
```bash
npm install
```

3. Créez un dossier `userdata` à la racine du projet :
```bash
mkdir userdata
```

4. Configurez le chemin du dossier dans settings.js :
```javascript
// Dans src/settings.js, vérifiez que le chemin pointe vers votre dossier userdata
DATA_DIR: path.join(process.cwd(), 'userdata')
```

5. Lancez l'application :
```bash
npm start
```

## ✨ Fonctionnalités

### Gestion des fichiers
- Création de dossiers
- Création de nouveaux fichiers
- Renommage de fichiers et dossiers
- Suppression de fichiers et dossiers
- Navigation dans l'arborescence des fichiers

### Éditeur
- Sauvegarde automatique
- Indicateur de sauvegarde en temps réel
- Interface redimensionnable
- Thème sombre moderne

## 🔧 Configuration requise

- Node.js
- npm ou yarn
- Electron 36.4.0 ou supérieur

## 📦 Technologies utilisées

- Electron
- HTML/CSS
- JavaScript
- electron-builder