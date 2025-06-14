const { marked } = require('marked');

class MarkdownManager {
    constructor() {
        this.isMarkdownMode = false;
        this.isPreviewMode = false;
        this.setupEventListeners();
        this.configureMarked();
    }

    configureMarked() {
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: false,
            mangle: false
        });
    }

    setupEventListeners() {
        const markdownToggleBtn = document.getElementById('markdownToggleBtn');
        const previewToggleBtn = document.getElementById('previewToggleBtn');

        markdownToggleBtn.addEventListener('click', () => this.toggleMarkdownMode());
        previewToggleBtn.addEventListener('click', () => this.togglePreviewMode());
    }

    toggleMarkdownMode() {
        this.isMarkdownMode = !this.isMarkdownMode;
        const markdownToggleBtn = document.getElementById('markdownToggleBtn');
        const previewToggleBtn = document.getElementById('previewToggleBtn');
        const editorContainer = document.querySelector('.editor-container');

        if (this.isMarkdownMode) {
            markdownToggleBtn.style.backgroundColor = 'var(--scrollbar-thumb-hover)';
            previewToggleBtn.style.display = 'block';
            this.showPreview();
            editorContainer.classList.add('split-view');
        } else {
            markdownToggleBtn.style.backgroundColor = 'transparent';
            previewToggleBtn.style.display = 'none';
            this.hidePreview();
            editorContainer.classList.remove('split-view', 'preview-only');
            this.isPreviewMode = false;
        }
    }

    togglePreviewMode() {
        if (!this.isMarkdownMode) return;

        this.isPreviewMode = !this.isPreviewMode;
        const previewToggleBtn = document.getElementById('previewToggleBtn');
        const editorContainer = document.querySelector('.editor-container');

        if (this.isPreviewMode) {
            previewToggleBtn.style.backgroundColor = 'var(--scrollbar-thumb-hover)';
            editorContainer.classList.remove('split-view');
            editorContainer.classList.add('preview-only');
        } else {
            previewToggleBtn.style.backgroundColor = 'transparent';
            editorContainer.classList.remove('preview-only');
            editorContainer.classList.add('split-view');
        }
    }

    showPreview() {
        const previewWrapper = document.getElementById('previewWrapper');
        previewWrapper.style.display = 'block';
        this.updatePreview();
    }

    hidePreview() {
        const previewWrapper = document.getElementById('previewWrapper');
        previewWrapper.style.display = 'none';
    }

    updatePreview() {
        if (!this.isMarkdownMode) return;

        const editor = document.getElementById('editor');
        const preview = document.getElementById('markdownPreview');
        const content = editor.value;

        try {
            const html = marked.parse(content);
            preview.innerHTML = html;
        } catch (error) {
            console.error('Erreur lors du rendu Markdown:', error);
            preview.innerHTML = '<p>Erreur lors du rendu Markdown</p>';
        }
    }

    onEditorInput() {
        if (this.isMarkdownMode) {
            this.debounce(() => this.updatePreview(), 300)();
        }
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
}