document.addEventListener('DOMContentLoaded', () => {
    const ideasTableBody = document.querySelector('#ideas-table tbody');
    const ideaForm = document.getElementById('idea-form');
    const ideaText = document.getElementById('idea-text');
    const ideaLink = document.getElementById('idea-link');
    const addIdeaButton = document.getElementById('add-idea-button');
    const addIdeaPopup = document.getElementById('add-idea-popup');
    const closeAddIdea = document.getElementById('close-add-idea');
    const videoPopup = document.getElementById('video-popup');
    const closeVideoPopup = document.getElementById('close-video-popup');
    const videoTitle = document.getElementById('video-title');
    const goToVideoButton = document.getElementById('go-to-video');
    const filterSelect = document.getElementById('filter-select');
    const searchInput = document.getElementById('search-input');

    loadIdeas();

    addIdeaButton.addEventListener('click', () => {
        addIdeaPopup.style.display = 'flex';
    });

    closeAddIdea.addEventListener('click', () => {
        addIdeaPopup.style.display = 'none';
    });

    closeVideoPopup.addEventListener('click', () => {
        videoPopup.style.display = 'none';
    });

    // Add close-on-overlay-click for video popup
    videoPopup.addEventListener('click', (e) => {
        if (e.target === videoPopup) {
            videoPopup.style.display = 'none';
        }
    });

    ideaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addIdea(ideaText.value, ideaLink.value);
        ideaText.value = '';
        ideaLink.value = '';
        addIdeaPopup.classList.add('hidden');
        addIdeaPopup.style.display = 'none';
    });

    filterSelect.addEventListener('change', () => {
        filterIdeas(filterSelect.value);
    });

    searchInput.addEventListener('input', () => {
        searchIdeas(searchInput.value);
    });

    function showVideoPopup(text, link, publishedDate) {
        videoTitle.innerText = text;
        const publishedDateElement = document.getElementById('published-date');
        if (publishedDate) {
            publishedDateElement.innerText = `Veröffentlicht am: ${new Date(publishedDate).toLocaleDateString()}`;
            publishedDateElement.style.display = 'block';
        } else {
            publishedDateElement.style.display = 'none';
        }
        goToVideoButton.onclick = () => {
            window.open(link, '_blank');
        };
        videoPopup.style.display = 'flex';
    }

    // Hilfsfunktion zum Kürzen des Textes
    function truncateText(text, maxLength) {
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    }
    
    function addIdea(text, link, status = 'planned', publishedDate = null) {
        if (isIdeaPresent(text, link)) { return; }
        const tr = document.createElement('tr');
        tr.dataset.publishedDate = publishedDate || "";
        
        const tdTitle = document.createElement('td');
        const span = document.createElement('span');
        span.textContent = truncateText(text, 30);
        span.title = text;
        tdTitle.appendChild(span);
        
        const tdStatus = document.createElement('td');
        const statusSelect = document.createElement('select');
        statusSelect.innerHTML = `
            <option value="planned">Geplant</option>
            <option value="in-progress">In Bearbeitung</option>
            <option value="published">Veröffentlicht</option>
        `;
        statusSelect.value = status;
        statusSelect.addEventListener('change', () => {
            const newStatus = statusSelect.value;
            let newPublishedDate = "";
            if (newStatus === 'published') {
                newPublishedDate = new Date().toISOString();
            }
            updateIdeaStatus(text, link, newStatus, newPublishedDate);
            tr.className = newStatus;
            tr.dataset.publishedDate = newPublishedDate;
        });
        tdStatus.appendChild(statusSelect);
        
        const tdActions = document.createElement('td');
        const btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';
        
        const viewButton = document.createElement('button');
        viewButton.innerHTML = '👁';
        viewButton.title = 'Ansehen';
        viewButton.addEventListener('click', () => {
            showVideoPopup(text, link, tr.dataset.publishedDate);
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '🗑';
        deleteButton.title = 'Löschen';
        deleteButton.addEventListener('click', () => {
            if (confirm('Möchten Sie die Idee wirklich löschen?')) {
                removeIdea(text, link);
                tr.remove();
            }
        });
        
        btnGroup.appendChild(viewButton);
        btnGroup.appendChild(deleteButton);
        tdActions.appendChild(btnGroup);
        
        tr.appendChild(tdTitle);
        tr.appendChild(tdStatus);
        tr.appendChild(tdActions);
        tr.className = status;
        ideasTableBody.appendChild(tr);
        saveIdea(text, link, status, publishedDate);
    }

    function editIdea(oldText, oldLink, tr) {
        const newText = prompt('Neue Idee:', oldText);
        const newLink = prompt('Neuer Link:', oldLink);
        if (newText && newLink) {
            removeIdea(oldText, oldLink);
            addIdea(newText, newLink);
            tr.remove();
        }
    }

    function loadIdeas() {
        const ideas = JSON.parse(localStorage.getItem('ideas')) || [];
        ideas.forEach(idea => {
            const tr = document.createElement('tr');
            tr.dataset.publishedDate = idea.publishedDate || "";
            const tdTitle = document.createElement('td');
            const span = document.createElement('span');
            span.textContent = truncateText(idea.text, 30);
            span.title = idea.text;
            tdTitle.appendChild(span);
            const tdStatus = document.createElement('td');
            const statusSelect = document.createElement('select');
            statusSelect.innerHTML = `
                <option value="planned">Geplant</option>
                <option value="in-progress">In Bearbeitung</option>
                <option value="published">Veröffentlicht</option>
            `;
            statusSelect.value = idea.status || 'planned';
            statusSelect.addEventListener('change', () => {
                const newStatus = statusSelect.value;
                let newPublishedDate = "";
                if (newStatus === 'published') {
                    newPublishedDate = new Date().toISOString();
                }
                updateIdeaStatus(idea.text, idea.link, newStatus, newPublishedDate);
                tr.className = newStatus;
                tr.dataset.publishedDate = newPublishedDate;
            });
            tdStatus.appendChild(statusSelect);
            const tdActions = document.createElement('td');
            const btnGroup = document.createElement('div');
            btnGroup.className = 'btn-group';
        
            const viewButton = document.createElement('button');
            viewButton.innerHTML = '👁';
            viewButton.title = 'Ansehen';
            viewButton.addEventListener('click', () => {
                showVideoPopup(idea.text, idea.link, tr.dataset.publishedDate);
            });
        
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '🗑';
            deleteButton.title = 'Löschen';
            deleteButton.addEventListener('click', () => {
                if (confirm('Möchten Sie die Idee wirklich löschen?')) {
                    removeIdea(idea.text, idea.link);
                    tr.remove();
                }
            });
        
            btnGroup.appendChild(viewButton);
            btnGroup.appendChild(deleteButton);
            tdActions.appendChild(btnGroup);
            tr.appendChild(tdTitle);
            tr.appendChild(tdStatus);
            tr.appendChild(tdActions);
            tr.className = idea.status || 'planned';
            ideasTableBody.appendChild(tr);
        });
    }

    function reloadIdeasTable() {
        const ideasTableBody = document.querySelector('#ideas-table tbody');
        ideasTableBody.innerHTML = '';
        loadIdeas();
    }

    function saveIdea(text, link, status, publishedDate) {
        const ideas = JSON.parse(localStorage.getItem('ideas')) || [];
        ideas.push({ text, link, status, publishedDate });
        localStorage.setItem('ideas', JSON.stringify(ideas));
    }

    function removeIdea(text, link) {
        let ideas = JSON.parse(localStorage.getItem('ideas')) || [];
        ideas = ideas.filter(idea => !(idea.text === text && idea.link === link));
        localStorage.setItem('ideas', JSON.stringify(ideas));
    }

    function isIdeaPresent(text, link) {
        const ideas = JSON.parse(localStorage.getItem('ideas')) || [];
        return ideas.some(idea => idea.text === text && idea.link === link);
    }

    function updateIdeaStatus(text, link, status, publishedDate = null) {
        const ideas = JSON.parse(localStorage.getItem('ideas')) || [];
        const idea = ideas.find(idea => idea.text === text && idea.link === link);
        if (idea) {
            idea.status = status;
            if (status === 'published' && !idea.publishedDate) {
                idea.publishedDate = new Date().toISOString();
            } else if(status !== 'published'){
                idea.publishedDate = null;
            }
            localStorage.setItem('ideas', JSON.stringify(ideas));
        }
    }

    function filterIdeas(filter) {
        const rows = ideasTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const status = row.querySelector('select').value;
            if (filter === 'all' || filter === status) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    function searchIdeas(query) {
        const rows = ideasTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const text = row.querySelector('td:nth-child(1) span').textContent.toLowerCase();
            if (text.includes(query.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
});
