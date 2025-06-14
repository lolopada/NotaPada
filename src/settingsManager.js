const settingsPath = require('path');

class SettingsManager {
    constructor() {
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        this.themeSwitch = document.getElementById('themeSwitch');
        this.fontSize = document.getElementById('fontSize');
        
        this.userPrefs = {
            darkTheme: true,
            fontSize: '16px'
        };
        
        this.initSettings();
        this.setupEventListeners();
    }
    
    async initSettings() {
        const isDarkTheme = !document.documentElement.classList.contains('light-theme');
        this.themeSwitch.checked = isDarkTheme;
        
        try {
            const configPath = settingsPath.join(process.cwd(), 'userPreferences.json');
            const configExists = await this.fileExists(configPath);
            
            if (configExists) {
                const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
                this.userPrefs = { ...this.userPrefs, ...config };
                
                this.themeSwitch.checked = this.userPrefs.darkTheme;
                this.fontSize.value = this.userPrefs.fontSize;
                
                this.applyTheme(this.userPrefs.darkTheme);
                this.applyFontSize(this.userPrefs.fontSize);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des préférences:', error);
        }
    }
    
    setupEventListeners() {
        this.settingsBtn.addEventListener('click', () => {
            this.settingsModal.classList.add('show');
        });
        
        this.closeSettingsBtn.addEventListener('click', () => {
            this.settingsModal.classList.remove('show');
            this.saveSettings();
        });
        
        this.settingsModal.addEventListener('click', (event) => {
            if (event.target === this.settingsModal) {
                this.settingsModal.classList.remove('show');
                this.saveSettings();
            }
        });
        
        this.themeSwitch.addEventListener('change', () => {
            this.applyTheme(this.themeSwitch.checked);
            this.userPrefs.darkTheme = this.themeSwitch.checked;
        });
        
        this.fontSize.addEventListener('change', () => {
            this.applyFontSize(this.fontSize.value);
            this.userPrefs.fontSize = this.fontSize.value;
        });
    }
    
    applyTheme(isDarkTheme) {
        if (isDarkTheme) {
            document.documentElement.classList.remove('light-theme');
        } else {
            document.documentElement.classList.add('light-theme');
        }
    }
    
    applyFontSize(size) {
        document.getElementById('editor').style.fontSize = size;
    }
    
    async saveSettings() {
        try {
            const settingsPath = settingsPath.join(process.cwd(), 'userPreferences.json');
            await fs.writeFile(settingsPath, JSON.stringify(this.userPrefs, null, 2), 'utf8');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des préférences:', error);
        }
    }
    
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
}

const settingsManager = new SettingsManager();