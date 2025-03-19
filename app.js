document.addEventListener('DOMContentLoaded', () => {
    const ideasTableBody = document.querySelector('#ideas-table tbody');
    const trashUl = document.getElementById('trash');
    const ideaForm = document.getElementById('idea-form');
    const ideaText = document.getElementById('idea-text');
    const ideaLink = document.getElementById('idea-link');
    const addIdeaButton = document.getElementById('add-idea-button');
    const trashIcon = document.getElementById('trash-icon');
    const addIdeaPopup = document.getElementById('add-idea-popup');
    const trashPopup = document.getElementById('trash-popup');
    const closeAddIdea = document.getElementById('close-add-idea');
    const closeTrash = document.getElementById('close-trash');
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

    trashIcon.addEventListener('click', () => {
        loadTrash();
        trashPopup.style.display = 'flex';
    });

    closeAddIdea.addEventListener('click', () => {
        addIdeaPopup.style.display = 'none';
    });

    closeTrash.addEventListener('click', () => {
        trashPopup.style.display = 'none';
    });

    closeVideoPopup.addEventListener('click', () => {
        videoPopup.style.display = 'none';
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

    function showVideoPopup(text, link) {
        videoTitle.innerText = text;
        goToVideoButton.onclick = () => {
            window.open(link, '_blank');
        };
        videoPopup.style.display = 'flex';
    }

    // Hilfsfunktion zum Kürzen des Textes
    function truncateText(text, maxLength) {
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    }
    
    function addIdea(text, link, status = 'planned') {
        if (isIdeaPresent(text, link)) { return; }
        const tr = document.createElement('tr');
        const tdCheckbox = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.addEventListener('change', () => {
            toggleIdeaCompletion(text, link, tr, checkbox);
        });
        tdCheckbox.appendChild(checkbox);
        const tdTitle = document.createElement('td');
        const span = document.createElement('span');
        // Anzeige auf 30 Zeichen begrenzen
        span.textContent = truncateText(text, 30);
        span.title = text; // Vollständiger Text als Tooltip
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
            updateIdeaStatus(text, link, statusSelect.value);
        });
        tdStatus.appendChild(statusSelect);
        const tdActions = document.createElement('td');
        const btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';

        const viewButton = document.createElement('button');
        viewButton.textContent = 'Ansehen';
        viewButton.addEventListener('click', () => {
            showVideoPopup(text, link);
        });

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '&#128465;'; // Trash icon
        deleteButton.addEventListener('click', () => {
            if (confirm('Möchten Sie die Idee wirklich löschen?')) {
                removeIdea(text, link);
                saveTrash(text, link);
                tr.remove();
            }
        });

        btnGroup.appendChild(viewButton);
        btnGroup.appendChild(deleteButton);
        tdActions.appendChild(btnGroup);
        tr.appendChild(tdCheckbox);
        tr.appendChild(tdTitle);
        tr.appendChild(tdStatus);
        tr.appendChild(tdActions);
        ideasTableBody.appendChild(tr);
        saveIdea(text, link, status);
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
            const tdCheckbox = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = idea.completed;
            checkbox.addEventListener('change', () => {
                toggleIdeaCompletion(idea.text, idea.link, tr, checkbox);
            });
            tdCheckbox.appendChild(checkbox);
            const tdTitle = document.createElement('td');
            const span = document.createElement('span');
            // Anzeige auf 30 Zeichen begrenzen
            span.textContent = truncateText(idea.text, 30);
            span.title = idea.text; // Vollständiger Text als Tooltip
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
                updateIdeaStatus(idea.text, idea.link, statusSelect.value);
            });
            tdStatus.appendChild(statusSelect);
            const tdActions = document.createElement('td');
            const btnGroup = document.createElement('div');
            btnGroup.className = 'btn-group';

            const viewButton = document.createElement('button');
            viewButton.textContent = 'Ansehen';
            viewButton.addEventListener('click', () => {
                showVideoPopup(idea.text, idea.link);
            });

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '&#128465;'; // Trash icon
            deleteButton.addEventListener('click', () => {
                if (confirm('Möchten Sie die Idee wirklich löschen?')) {
                    removeIdea(idea.text, idea.link);
                    saveTrash(idea.text, idea.link);
                    tr.remove();
                }
            });

            btnGroup.appendChild(viewButton);
            btnGroup.appendChild(deleteButton);
            tdActions.appendChild(btnGroup);
            tr.appendChild(tdCheckbox);
            tr.appendChild(tdTitle);
            tr.appendChild(tdStatus);
            tr.appendChild(tdActions);
            if (idea.completed) {
                tr.classList.add('completed');
            }
            ideasTableBody.appendChild(tr);
        });
    }

    function loadTrash() {
        const trash = JSON.parse(localStorage.getItem('trash')) || [];
        trashUl.innerHTML = ''; // Alte Einträge entfernen
        trash.forEach((item, index) => {
            const li = document.createElement('li');
            
            // Container für Text und Datum
            const textContainer = document.createElement('div');
            textContainer.className = 'text-container';
            
            // Span für den Text (gekürzt) mit Tooltip
            const textSpan = document.createElement('span');
            textSpan.textContent = truncateText(item.text, 20); // Kürzerer Text
            textSpan.title = item.text;
            textContainer.appendChild(textSpan);
            
            // Neue Zeile für das Datum
            const dateSpan = document.createElement('div');
            dateSpan.textContent = new Date(item.date).toLocaleString(); // Nur das Datum
            textContainer.appendChild(dateSpan);
            
            li.appendChild(textContainer);
            
            // Button-Gruppe unterhalb des Textes
            const btnGroup = document.createElement('div');
            btnGroup.className = 'btn-group';
            
            const restoreButton = document.createElement('button');
            restoreButton.textContent = 'Wiederherstellen';
            restoreButton.addEventListener('click', () => {
                if (confirm('Möchten Sie die Idee wiederherstellen?')) {
                    restoreTrash(index);
                    li.remove();
                    reloadIdeasTable();
                }
            });
            
            const permanentDeleteButton = document.createElement('button');
            permanentDeleteButton.textContent = 'Löschen'; // Text geändert
            permanentDeleteButton.addEventListener('click', () => {
                if (confirm('Möchten Sie die Idee endgültig löschen?')) {
                    removeTrash(index);
                    li.remove();
                }
            });
            
            btnGroup.appendChild(restoreButton);
            btnGroup.appendChild(permanentDeleteButton);
            li.appendChild(btnGroup);
            
            trashUl.appendChild(li);
        });
    }

    function restoreTrash(index) {
        const trash = JSON.parse(localStorage.getItem('trash')) || [];
        const [restoredItem] = trash.splice(index, 1);
        localStorage.setItem('trash', JSON.stringify(trash));
        const ideas = JSON.parse(localStorage.getItem('ideas')) || [];
        ideas.push({ text: restoredItem.text, link: restoredItem.link });
        localStorage.setItem('ideas', JSON.stringify(ideas));
    }

    function reloadIdeasTable() {
        const ideasTableBody = document.querySelector('#ideas-table tbody');
        ideasTableBody.innerHTML = '';
        loadIdeas();
    }

    function saveIdea(text, link, status) {
        const ideas = JSON.parse(localStorage.getItem('ideas')) || [];
        ideas.push({ text, link, status });
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

    function saveTrash(text, link) {
        const trash = JSON.parse(localStorage.getItem('trash')) || [];
        trash.push({ text, link, date: new Date().toISOString() });
        localStorage.setItem('trash', JSON.stringify(trash));
    }

    function removeTrash(index) {
        const trash = JSON.parse(localStorage.getItem('trash')) || [];
        trash.splice(index, 1);
        localStorage.setItem('trash', JSON.stringify(trash));
    }

    function toggleIdeaCompletion(text, link, tr, checkbox) {
        const ideas = JSON.parse(localStorage.getItem('ideas')) || [];
        const idea = ideas.find(idea => idea.text === text && idea.link === link);
        if (idea) {
            idea.completed = checkbox.checked;
            localStorage.setItem('ideas', JSON.stringify(ideas));
            tr.classList.toggle('completed', idea.completed);
        }
    }

    function updateIdeaStatus(text, link, status) {
        const ideas = JSON.parse(localStorage.getItem('ideas')) || [];
        const idea = ideas.find(idea => idea.text === text && idea.link === link);
        if (idea) {
            idea.status = status;
            localStorage.setItem('ideas', JSON.stringify(ideas));
        }
    }

    function filterIdeas(filter) {
        const rows = ideasTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const isCompleted = row.classList.contains('completed');
            if (filter === 'all' || (filter === 'completed' && isCompleted) || (filter === 'incomplete' && !isCompleted)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    function searchIdeas(query) {
        const rows = ideasTableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const text = row.querySelector('td:nth-child(2) span').textContent.toLowerCase();
            if (text.includes(query.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
});
