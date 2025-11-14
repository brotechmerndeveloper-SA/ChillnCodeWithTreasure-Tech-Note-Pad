
// Name: ChillNCodeWithTreasure
//E-mail: brotech.merndeveloper@gmail.com

const themeToggle = document.getElementById('theme-toggle');
const newNoteBtn = document.getElementById('new-note');
const saveNoteBtn = document.getElementById('save-note');
const deleteNoteBtn = document.getElementById('delete-note');
const searchInput = document.getElementById('search');
const noteTitle = document.getElementById('note-title');
const noteContent = document.getElementById('note-content');
const notesList = document.getElementById('notes-list');
const charCounter = document.getElementById('char-counter');
const formatCodeBtn = document.getElementById('format-code');
const notification = document.getElementById('notification');


let currentNoteId = null;
let notes = JSON.parse(localStorage.getItem('tech-notes')) || [];
let isDarkMode = localStorage.getItem('tech-notes-theme') === 'dark';


function init() {
    applyTheme();
    renderNotesList();
    setupEventListeners();
    
   
    if (notes.length > 0) {
        loadNote(notes[0].id);
    } else {
        createNewNote();
    }
}


function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    newNoteBtn.addEventListener('click', createNewNote);
    saveNoteBtn.addEventListener('click', saveNote);
    deleteNoteBtn.addEventListener('click', deleteNote);
    searchInput.addEventListener('input', filterNotes);
    noteContent.addEventListener('input', updateCharCount);
    formatCodeBtn.addEventListener('click', formatCode);
    
   
    let saveTimeout;
    noteTitle.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveNote, 1000);
    });
    
    noteContent.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveNote, 1000);
    });
}


function toggleTheme() {
    isDarkMode = !isDarkMode;
    applyTheme();
    localStorage.setItem('tech-notes-theme', isDarkMode ? 'dark' : 'light');
}

function applyTheme() {
    const icon = themeToggle.querySelector('i');
    
    if (isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        icon.className = 'fas fa-sun';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        icon.className = 'fas fa-moon';
    }
}


function createNewNote() {
    const newNote = {
        id: Date.now().toString(),
        title: 'Untitled Note',
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    notes.unshift(newNote);
    saveToLocalStorage();
    renderNotesList();
    loadNote(newNote.id);
    
    
    setTimeout(() => {
        noteTitle.focus();
        noteTitle.select();
    }, 100);
}

function saveNote() {
    if (!currentNoteId) return;
    
    const noteIndex = notes.findIndex(note => note.id === currentNoteId);
    if (noteIndex === -1) return;
    
    notes[noteIndex].title = noteTitle.value || 'Untitled Note';
    notes[noteIndex].content = noteContent.value;
    notes[noteIndex].updatedAt = new Date().toISOString();
    
    saveToLocalStorage();
    renderNotesList();
    showNotification('Note saved successfully!');
}

function deleteNote() {
    if (!currentNoteId) return;
    
    if (confirm('Are you sure you want to delete this note?')) {
        notes = notes.filter(note => note.id !== currentNoteId);
        saveToLocalStorage();
        renderNotesList();
        
        
        if (notes.length > 0) {
            loadNote(notes[0].id);
        } else {
            createNewNote();
        }
    }
}

function loadNote(noteId) {
    const note = notes.find(note => note.id === noteId);
    if (!note) return;
    
    currentNoteId = noteId;
    noteTitle.value = note.title;
    noteContent.value = note.content;
    
    updateCharCount();
    
    
    document.querySelectorAll('.note-item').forEach(item => {
        if (item.dataset.id === noteId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function filterNotes() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredNotes = searchTerm 
        ? notes.filter(note => 
            note.title.toLowerCase().includes(searchTerm) || 
            note.content.toLowerCase().includes(searchTerm))
        : notes;
    
    renderNotesList(filteredNotes);
}

function renderNotesList(notesToRender = notes) {
    if (notesToRender.length === 0) {
        notesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sticky-note"></i>
                <p>No notes found</p>
            </div>
        `;
        return;
    }
    
    notesList.innerHTML = notesToRender.map(note => `
        <div class="note-item ${note.id === currentNoteId ? 'active' : ''}" data-id="${note.id}">
            <div class="note-title">${escapeHtml(note.title)}</div>
            <div class="note-preview">${escapeHtml(note.content.substring(0, 50))}${note.content.length > 50 ? '...' : ''}</div>
            <div class="note-date">${formatDate(note.updatedAt)}</div>
        </div>
    `).join('');
    
    // Add click event to note items
    document.querySelectorAll('.note-item').forEach(item => {
        item.addEventListener('click', () => {
            loadNote(item.dataset.id);
        });
    });
}


function updateCharCount() {
    charCounter.textContent = noteContent.value.length;
}

function formatCode() {
    
    const content = noteContent.value;
    
    
    const formattedContent = content.replace(/(```[\s\S]*?```)/g, '<div class="code-block">$1</div>');
    
    
    noteContent.value = formattedContent;
    saveNote();
}

function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function saveToLocalStorage() {
    localStorage.setItem('tech-notes', JSON.stringify(notes));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


document.addEventListener('DOMContentLoaded', init);