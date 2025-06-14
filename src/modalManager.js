class ModalManager {
    constructor() {
        this.modal = document.getElementById('actionModal');
        this.title = document.getElementById('modalTitle');
        this.input = document.getElementById('modalInput');
        this.confirmBtn = document.getElementById('confirmActionBtn');
        this.cancelBtn = document.getElementById('cancelActionBtn');
        
        this.setupListeners();
    }

    setupListeners() {
        this.cancelBtn.addEventListener('click', () => this.hide());
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.hide();
            }
        });
    }

    show(options) {
        return new Promise((resolve) => {
            this.title.textContent = options.title;
            this.input.value = options.defaultValue || '';
            this.input.placeholder = options.placeholder || '';
            
            if (options.type === 'error') {
                this.modal.querySelector('.modal-content').classList.add('error');
                this.confirmBtn.style.display = 'none';
                this.cancelBtn.textContent = 'OK';
                this.input.style.display = 'none';
            } else {
                this.modal.querySelector('.modal-content').classList.remove('error');
                this.confirmBtn.style.display = 'block';
                this.cancelBtn.textContent = 'Annuler';
                
                if (options.type === 'confirm') {
                    this.input.style.display = 'none';
                    this.confirmBtn.textContent = 'Supprimer';
                    this.confirmBtn.classList.add('delete');
                } else {
                    this.input.style.display = 'block';
                    this.confirmBtn.textContent = 'Confirmer';
                    this.confirmBtn.classList.remove('delete');
                }
            }

            const handleConfirm = () => {
                const value = options.type === 'confirm' ? true : this.input.value.trim();
                this.hide();
                resolve(value);
            };

            this.confirmBtn.onclick = handleConfirm;
            this.input.onkeyup = (e) => {
                if (e.key === 'Enter') handleConfirm();
                if (e.key === 'Escape') this.hide();
            };

            this.modal.style.display = 'block';
            this.input.focus();
        });
    }

    hide() {
        this.modal.style.display = 'none';
        this.confirmBtn.onclick = null;
        this.input.onkeyup = null;
    }
}

const modalManager = new ModalManager();