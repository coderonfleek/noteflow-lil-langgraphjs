// ============================================================
// AI FEATURE FLAGS
// ============================================================
// Toggle each feature to 'true' after implementing the backend
// ============================================================
const AI_FEATURES = {
    summarize: true,      // Set to true after implementing /api/ai/summarize
    suggestTags: true,    // Set to true after implementing /api/ai/suggest-tags
    smartSearch: true,    // Set to true after implementing /api/ai/smart-search
    findRelated: true,    // Set to true after implementing /api/ai/find-related
    improveWriting: true, // Set to true after implementing /api/ai/improve-writing
};
// ============================================================

// State
let currentNoteId = null;
let currentNote = null;
let searchTimeout = null;

// Initialize AI Features on page load
function initializeAIFeatures() {
    // Summarize buttons
    const summarizeBtns = ['btnSummarize', 'btnViewSummarize'];
    summarizeBtns.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) toggleFeatureButton(btn, AI_FEATURES.summarize);
    });

    // Suggest Tags button
    const suggestTagsBtn = document.getElementById('btnSuggestTags');
    if (suggestTagsBtn) toggleFeatureButton(suggestTagsBtn, AI_FEATURES.suggestTags);

    // Smart Search button
    const smartSearchBtn = document.getElementById('btnSmartSearch');
    if (smartSearchBtn) toggleFeatureButton(smartSearchBtn, AI_FEATURES.smartSearch);

    // Find Related buttons
    const findRelatedBtns = ['btnFindRelated', 'btnViewFindRelated'];
    findRelatedBtns.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) toggleFeatureButton(btn, AI_FEATURES.findRelated);
    });

    // Improve Writing button
    const improveWritingBtn = document.getElementById('btnImproveWriting');
    if (improveWritingBtn) toggleFeatureButton(improveWritingBtn, AI_FEATURES.improveWriting);

    // Update section styling if any features are enabled
    updateAISections();
}

function toggleFeatureButton(button, enabled) {
    if (enabled) {
    button.classList.remove('ai-locked');
    button.disabled = false;
    } else {
    button.classList.add('ai-locked');
    button.disabled = true;
    }
}

function updateAISections() {
    const anyEnabled = Object.values(AI_FEATURES).some(v => v);
    const sections = document.querySelectorAll('.ai-locked-section');
    sections.forEach(section => {
    if (anyEnabled) {
        section.classList.remove('ai-locked-section');
        section.classList.add('ai-unlocked-section');
    }
    });
}

// ============================================================
// AI FEATURE API CALLS
// ============================================================

// Summarize Note
async function handleSummarize() {
    if (!AI_FEATURES.summarize) return;
    
    const content = document.getElementById('noteContent').value;
    if (!content.trim()) {
    showToast('Please enter some content first');
    return;
    }

    const btn = document.getElementById('btnSummarize');
    setButtonLoading(btn, true);

    try {
    const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });
    const result = await response.json();
    
    if (result.success) {
        showToast('Summary: ' + result.data.summary);
    } else {
        showToast(result.error || 'Failed to summarize');
    }
    } catch (error) {
    console.error('Summarize error:', error);
    showToast('Error generating summary');
    } finally {
    setButtonLoading(btn, false);
    }
}

async function handleSummarizeView() {
    if (!AI_FEATURES.summarize || !currentNote) return;
    
    const btn = document.getElementById('btnViewSummarize');
    setButtonLoading(btn, true);

    try {
    const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentNote.content })
    });
    const result = await response.json();
    
    if (result.success) {
        document.getElementById('summaryContent').textContent = result.data.summary;
        document.getElementById('summarySection').classList.remove('hidden');
    } else {
        showToast(result.error || 'Failed to summarize');
    }
    } catch (error) {
    console.error('Summarize error:', error);
    showToast('Error generating summary');
    } finally {
    setButtonLoading(btn, false);
    }
}

function hideSummary() {
    document.getElementById('summarySection').classList.add('hidden');
}

// Suggest Tags
async function handleSuggestTags() {
    if (!AI_FEATURES.suggestTags) return;
    
    const content = document.getElementById('noteContent').value;
    const title = document.getElementById('noteTitle').value;
    
    if (!content.trim() && !title.trim()) {
    showToast('Please enter a title or content first');
    return;
    }

    const btn = document.getElementById('btnSuggestTags');
    setButtonLoading(btn, true);

    try {
    const response = await fetch('/api/ai/suggest-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
    });
    const result = await response.json();
    
    if (result.success && result.data.tags.length > 0) {
        displaySuggestedTags(result.data.tags);
    } else {
        showToast('No tag suggestions available');
    }
    } catch (error) {
    console.error('Suggest tags error:', error);
    showToast('Error suggesting tags');
    } finally {
    setButtonLoading(btn, false);
    }
}

function displaySuggestedTags(tags) {
    const container = document.getElementById('suggestedTagsContainer');
    const tagsDiv = document.getElementById('suggestedTags');
    
    tagsDiv.innerHTML = tags.map(tag => `
    <button 
        type="button"
        onclick="addSuggestedTag('${escapeHtml(tag)}')"
        class="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full hover:bg-indigo-200 transition-colors"
    >
        + ${escapeHtml(tag)}
    </button>
    `).join('');
    
    container.classList.remove('hidden');
}

function addSuggestedTag(tag) {
    const tagsInput = document.getElementById('noteTags');
    const currentTags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean);
    
    if (!currentTags.includes(tag)) {
    currentTags.push(tag);
    tagsInput.value = currentTags.join(', ');
    }
}

// Smart Search
async function handleSmartSearch() {
    if (!AI_FEATURES.smartSearch) return;
    
    const query = document.getElementById('searchInput').value;
    if (!query.trim()) {
    showToast('Please enter a search query');
    return;
    }

    const btn = document.getElementById('btnSmartSearch');
    setButtonLoading(btn, true);
    showLoading();

    try {
    const response = await fetch(`/api/ai/smart-search?q=${encodeURIComponent(query)}`);
    const result = await response.json();
    
    if (result.success) {
        renderNotes(result.data);
        showToast(`Found ${result.data.length} relevant notes`);
    } else {
        showToast(result.error || 'Search failed');
    }
    } catch (error) {
    console.error('Smart search error:', error);
    showToast('Error performing smart search');
    } finally {
    setButtonLoading(btn, false);
    hideLoading();
    }
}

// Find Related Notes
async function handleFindRelated() {
    if (!AI_FEATURES.findRelated) return;
    
    const content = document.getElementById('noteContent').value;
    const noteId = document.getElementById('noteId').value;
    
    if (!content.trim()) {
    showToast('Please enter some content first');
    return;
    }

    const btn = document.getElementById('btnFindRelated');
    setButtonLoading(btn, true);

    try {
    const response = await fetch('/api/ai/find-related', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, excludeId: noteId })
    });
    const result = await response.json();
    
    if (result.success && result.data.notes.length > 0) {
        const notesList = result.data.notes.map(n => n.title).join(', ');
        showToast('Related: ' + notesList);
    } else {
        showToast('No related notes found');
    }
    } catch (error) {
    console.error('Find related error:', error);
    showToast('Error finding related notes');
    } finally {
    setButtonLoading(btn, false);
    }
}

async function handleFindRelatedView() {
    if (!AI_FEATURES.findRelated || !currentNote) return;
    
    const btn = document.getElementById('btnViewFindRelated');
    setButtonLoading(btn, true);

    try {
    const response = await fetch('/api/ai/find-related', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentNote.content, excludeId: currentNote.id })
    });
    const result = await response.json();
    
    if (result.success && result.data.notes.length > 0) {
        displayRelatedNotes(result.data.notes);
    } else {
        showToast('No related notes found');
    }
    } catch (error) {
    console.error('Find related error:', error);
    showToast('Error finding related notes');
    } finally {
    setButtonLoading(btn, false);
    }
}

function displayRelatedNotes(notes) {
    const container = document.getElementById('relatedNotesSection');
    const listDiv = document.getElementById('relatedNotesList');
    
    listDiv.innerHTML = notes.map(note => `
    <button 
        onclick="closeViewModal(); setTimeout(() => viewNote('${note.id}'), 100)"
        class="w-full text-left p-2 bg-white rounded border border-purple-200 hover:border-purple-400 transition-colors"
    >
        <p class="font-medium text-purple-900 text-sm">${escapeHtml(note.title)}</p>
        <p class="text-xs text-purple-600 truncate">${escapeHtml(note.content.substring(0, 100))}...</p>
    </button>
    `).join('');
    
    container.classList.remove('hidden');
}

function hideRelatedNotes() {
    document.getElementById('relatedNotesSection').classList.add('hidden');
}

// Improve Writing
async function handleImproveWriting() {
    if (!AI_FEATURES.improveWriting) return;
    
    const content = document.getElementById('noteContent').value;
    if (!content.trim()) {
    showToast('Please enter some content first');
    return;
    }

    const btn = document.getElementById('btnImproveWriting');
    setButtonLoading(btn, true);

    try {
    const response = await fetch('/api/ai/improve-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });
    const result = await response.json();
    
    if (result.success) {
        document.getElementById('noteContent').value = result.data.improved;
        showToast('Content improved!');
    } else {
        showToast(result.error || 'Failed to improve writing');
    }
    } catch (error) {
    console.error('Improve writing error:', error);
    showToast('Error improving writing');
    } finally {
    setButtonLoading(btn, false);
    }
}

// Utility: Set button loading state
function setButtonLoading(button, loading) {
    if (loading) {
    button.classList.add('ai-loading');
    button.disabled = true;
    } else {
    button.classList.remove('ai-loading');
    // Only re-enable if the feature is enabled
    const featureMap = {
        'btnSummarize': 'summarize',
        'btnViewSummarize': 'summarize',
        'btnSuggestTags': 'suggestTags',
        'btnSmartSearch': 'smartSearch',
        'btnFindRelated': 'findRelated',
        'btnViewFindRelated': 'findRelated',
        'btnImproveWriting': 'improveWriting',
    };
    const feature = featureMap[button.id];
    button.disabled = feature ? !AI_FEATURES[feature] : false;
    }
}

// ============================================================
// EXISTING API FUNCTIONS (unchanged)
// ============================================================

async function fetchNotes(search = '', tag = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tag) params.append('tag', tag);
    
    const response = await fetch(`/api/notes?${params}`);
    return response.json();
}

async function fetchNote(id) {
    const response = await fetch(`/api/notes/${id}`);
    return response.json();
}

async function createNote(data) {
    const response = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
    });
    return response.json();
}

async function updateNote(id, data) {
    const response = await fetch(`/api/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
    });
    return response.json();
}

async function deleteNote(id) {
    const response = await fetch(`/api/notes/${id}`, {
    method: 'DELETE'
    });
    return response.json();
}

async function fetchTags() {
    const response = await fetch('/api/notes/tags/all');
    return response.json();
}

// ============================================================
// UI FUNCTIONS
// ============================================================

function showLoading() {
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('notesContainer').classList.add('hidden');
    document.getElementById('emptyState').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loadingState').classList.add('hidden');
}

function renderNotes(notes) {
    const container = document.getElementById('notesContainer');
    const emptyState = document.getElementById('emptyState');
    
    hideLoading();
    
    if (notes.length === 0) {
    container.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
    }
    
    container.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    container.innerHTML = notes.map(note => `
    <div class="note-card bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer transition-all duration-200" onclick="viewNote('${note.id}')">
        <h3 class="font-semibold text-gray-900 mb-2 line-clamp-1">${escapeHtml(note.title)}</h3>
        <p class="text-gray-600 text-sm mb-4 line-clamp-3">${escapeHtml(note.content)}</p>
        <div class="flex flex-wrap gap-2 mb-3">
        ${note.tags.map(tag => `
            <span class="tag inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
            ${escapeHtml(tag)}
            </span>
        `).join('')}
        </div>
        <p class="text-xs text-gray-400">${formatDate(note.updatedAt)}</p>
    </div>
    `).join('');
}

async function loadNotes() {
    showLoading();
    const search = document.getElementById('searchInput').value;
    const tag = document.getElementById('tagFilter').value;
    
    try {
    const result = await fetchNotes(search, tag);
    if (result.success) {
        renderNotes(result.data);
    }
    } catch (error) {
    console.error('Error loading notes:', error);
    showToast('Error loading notes');
    }
}

async function loadTags() {
    try {
    const result = await fetchTags();
    if (result.success) {
        const select = document.getElementById('tagFilter');
        select.innerHTML = '<option value="">All Tags</option>' + 
        result.data.map(tag => `<option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>`).join('');
    }
    } catch (error) {
    console.error('Error loading tags:', error);
    }
}

function debounceSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(loadNotes, 300);
}

// Modal Functions
function openModal(note = null) {
    const modal = document.getElementById('noteModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('noteForm');
    
    form.reset();
    document.getElementById('noteId').value = '';
    document.getElementById('suggestedTagsContainer').classList.add('hidden');
    
    if (note) {
    title.textContent = 'Edit Note';
    document.getElementById('noteId').value = note.id;
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').value = note.content;
    document.getElementById('noteTags').value = note.tags.join(', ');
    } else {
    title.textContent = 'New Note';
    }
    
    modal.classList.remove('hidden');
    document.getElementById('noteTitle').focus();
}

function closeModal() {
    document.getElementById('noteModal').classList.add('hidden');
    document.getElementById('suggestedTagsContainer').classList.add('hidden');
}

async function viewNote(id) {
    try {
    const result = await fetchNote(id);
    if (result.success) {
        const note = result.data;
        currentNoteId = note.id;
        currentNote = note;
        
        document.getElementById('viewTitle').textContent = note.title;
        document.getElementById('viewContent').textContent = note.content;
        document.getElementById('viewDate').textContent = `Last updated: ${formatDate(note.updatedAt)}`;
        
        document.getElementById('viewTags').innerHTML = note.tags.map(tag => `
        <span class="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
            ${escapeHtml(tag)}
        </span>
        `).join('');
        
        // Hide AI sections when opening new note
        hideSummary();
        hideRelatedNotes();
        
        document.getElementById('viewModal').classList.remove('hidden');
    }
    } catch (error) {
    console.error('Error viewing note:', error);
    showToast('Error loading note');
    }
}

function closeViewModal() {
    document.getElementById('viewModal').classList.add('hidden');
    currentNoteId = null;
    currentNote = null;
}

async function editCurrentNote() {
    if (!currentNoteId) return;
    
    try {
    const result = await fetchNote(currentNoteId);
    if (result.success) {
        closeViewModal();
        openModal(result.data);
    }
    } catch (error) {
    console.error('Error editing note:', error);
    showToast('Error loading note for editing');
    }
}

async function deleteCurrentNote() {
    if (!currentNoteId) return;
    
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
    const result = await deleteNote(currentNoteId);
    if (result.success) {
        closeViewModal();
        showToast('Note deleted');
        loadNotes();
        loadTags();
    }
    } catch (error) {
    console.error('Error deleting note:', error);
    showToast('Error deleting note');
    }
}

async function saveNote(event) {
    event.preventDefault();
    
    const id = document.getElementById('noteId').value;
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    const tagsInput = document.getElementById('noteTags').value;
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    
    try {
    let result;
    if (id) {
        result = await updateNote(id, { title, content, tags });
    } else {
        result = await createNote({ title, content, tags });
    }
    
    if (result.success) {
        closeModal();
        showToast(id ? 'Note updated' : 'Note created');
        loadNotes();
        loadTags();
    } else {
        showToast(result.error || 'Error saving note');
    }
    } catch (error) {
    console.error('Error saving note:', error);
    showToast('Error saving note');
    }
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
    return 'Today';
    } else if (diffDays === 1) {
    return 'Yesterday';
    } else if (diffDays < 7) {
    return `${diffDays} days ago`;
    } else {
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
    toast.classList.add('hidden');
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape to close modals
    if (e.key === 'Escape') {
    closeModal();
    closeViewModal();
    }
    // Ctrl/Cmd + N to create new note
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    openModal();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeAIFeatures();
    loadNotes();
    loadTags();
});