document.addEventListener('DOMContentLoaded', () => {
    const sections = [
        {
            key: 'old',
            title: 'Vecchiaia',
            example: 'Esempio: "Un anziano giardiniere con mani segnate dal tempo e occhi gentili, che si prende cura di un rigoglioso giardino mediterraneo pieno di ulivi ed erbe aromatiche. La luce del pomeriggio filtra attraverso i rami, creando ombre suggestive. Stile fotorealistico con toni caldi e terrosi."'
        },
        {
            key: 'recent',
            title: 'Maturità',
            example: 'Esempio: "Un professionista determinato sulla quarantina che lavora in un ufficio moderno con finestre a tutta altezza che si affacciano su un panorama urbano vibrante. Elementi di design eleganti e tecnologia perfettamente integrati nell\'ambiente. Stile arte digitale contemporanea con illuminazione dinamica."'
        },
        {
            key: 'childhood',
            title: 'Infanzia',
            example: 'Esempio: "Un bambino curioso che esplora un parco giochi fantasioso pieno di forme geometriche colorate ed elementi fantastici. Bolle fluttuanti e aerei di carta nell\'aria, circondato da giocattoli immaginativi. Stile illustrazione stilizzata con colori vivaci e giocosi."'
        }
    ];

    const MAX_PROMPTS_PER_PHASE = 2;  // Reduced from 4 to 2

    let currentSectionIndex = -1; // Start at -1 for landing page
    let currentSectionKey = '';
    let activePromptElement = null;
    let userCode = '';
    let userData = {
        classe: '',
        gruppo: ''
    };
    
    const modal = document.getElementById('prompt-modal');
    const promptInput = document.getElementById('prompt-input');
    const sectionsContainer = document.getElementById('sections-container');
    const prevButton = document.getElementById('prev-section');
    const nextButton = document.getElementById('next-section');
    
    // Initialize prompts object
    const prompts = {
        prompts: {
            old: Array(MAX_PROMPTS_PER_PHASE).fill(''),
            recent: Array(MAX_PROMPTS_PER_PHASE).fill(''),
            childhood: Array(MAX_PROMPTS_PER_PHASE).fill('')
        }
    };

    function getSectionKey(index) {
        const sectionMap = {
            0: 'old',
            1: 'recent',
            2: 'childhood'
        };
        return sectionMap[index];
    }
    
    function createSection(section) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'section';
        sectionDiv.dataset.section = section.key;
        
        const title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = section.title;
        sectionDiv.appendChild(title);
        
        const example = document.createElement('div');
        example.className = 'section-example';
        example.textContent = section.example;
        sectionDiv.appendChild(example);
        
        const promptBoxes = document.createElement('div');
        promptBoxes.className = 'prompt-boxes';
        
        for (let i = 0; i < MAX_PROMPTS_PER_PHASE; i++) {
            const box = document.createElement('div');
            box.className = 'prompt-box';
            box.dataset.prompt = i;
            
            const content = document.createElement('div');
            content.className = 'prompt-content';
            content.textContent = prompts.prompts[section.key][i] || `Prompt ${i + 1}`;
            
            box.appendChild(content);
            box.addEventListener('click', () => openPromptModal(box));
            promptBoxes.appendChild(box);
        }
        
        sectionDiv.appendChild(promptBoxes);
        return sectionDiv;
    }
    
    function validateSection() {
        const currentPrompts = prompts.prompts[currentSectionKey];
        const isValid = currentPrompts.every(prompt => prompt.trim() !== '');
        nextButton.classList.toggle('disabled', !isValid);
        return isValid;
    }
    
    function showLandingPage() {
        userCode = Math.floor(10000 + Math.random() * 90000).toString();
        currentSectionIndex = -1;
        userData = { classe: '', gruppo: '' };
        
        // Nascondi l'header con classe e gruppo
        document.querySelector('.input-row').style.display = 'none';
        
        sectionsContainer.innerHTML = `
            <div class="landing-page">
                <h1 class="landing-title">Benvenut* al T-symmetry<h1>
                <p class="landing-subtitle">In questo progetto, vi guideremo attraverso tre fasi della vita: infanzia, maturità e vecchiaia. Per ciascuna fase, scriverete due prompt creativi che descrivono scene significative di quel periodo. I vostri prompt contribuiranno a creare un archivio di immagini che rappresentano diverse prospettive ed esperienze di vita.</p>
                
                <div class="landing-form">
                    <div class="form-group">
                        <label for="landing-classe">Classe</label>
                        <input type="text" id="landing-classe" placeholder="Inserisci la classe" required>
                    </div>
                    <div class="form-group">
                        <label for="landing-gruppo">Nome del Gruppo</label>
                        <input type="text" id="landing-gruppo" placeholder="Inserisci il nome del gruppo" required>
                    </div>
                    <div class="user-code">
                        <strong>Il tuo codice:</strong> ${userCode}
                    </div>
                    <button id="start-collection" class="primary-button" disabled>Prompt →</button>
                </div>
            </div>
        `;

        // Nascondi i bottoni di navigazione nella landing
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';

        const classeInput = document.getElementById('landing-classe');
        const gruppoInput = document.getElementById('landing-gruppo');
        const startButton = document.getElementById('start-collection');

        function validateInputs() {
            const isValid = classeInput.value.trim() !== '' && gruppoInput.value.trim() !== '';
            startButton.disabled = !isValid;
        }

        classeInput.addEventListener('input', validateInputs);
        gruppoInput.addEventListener('input', validateInputs);

        startButton.addEventListener('click', () => {
            userData.classe = classeInput.value.trim();
            userData.gruppo = gruppoInput.value.trim();
            document.querySelector('.input-row').style.display = 'grid';
            showSection(0);
        });
    }

    function showSection(index) {
        currentSectionIndex = index;
        currentSectionKey = getSectionKey(index);
        
        // Aggiorna l'header con i dati utente
        document.getElementById('user-code-display').textContent = `Codice: ${userCode}`;
        document.getElementById('classe').value = userData.classe;
        document.getElementById('gruppo').value = userData.gruppo;
        
        // Disabilita i campi di input
        document.getElementById('classe').disabled = true;
        document.getElementById('gruppo').disabled = true;
        
        sectionsContainer.innerHTML = '';
        sectionsContainer.appendChild(createSection(sections[index]));
        
        // Mostra/nascondi bottoni e aggiorna i loro testi
        prevButton.style.display = index === 0 ? 'none' : 'block';
        nextButton.style.display = 'block';
        
        // Aggiorna il testo dei bottoni con le fasi
        if (index === sections.length - 1) {
            nextButton.textContent = 'Lista Prompts →';
        } else {
            nextButton.textContent = `${sections[index + 1].title} →`;
        }
        
        if (index > 0) {
            prevButton.textContent = `← ${sections[index - 1].title}`;
        }
        
        validateSection();
    }

    function openPromptModal(promptBox) {
        activePromptElement = promptBox;
        const promptIndex = promptBox.dataset.prompt;
        promptInput.value = prompts.prompts[currentSectionKey][promptIndex] || '';
        modal.style.display = 'flex';
        promptInput.focus();
    }

    function updatePromptContents() {
        document.querySelectorAll('.prompt-box').forEach(box => {
            const promptIndex = box.dataset.prompt;
            const content = prompts.prompts[currentSectionKey][promptIndex] || `Prompt ${parseInt(promptIndex) + 1}`;
            const contentDiv = box.querySelector('.prompt-content');
            contentDiv.textContent = content;
            box.classList.toggle('filled', content.trim() !== '' && content !== `Prompt ${parseInt(promptIndex) + 1}`);
        });
        validateSection();
    }

    document.getElementById('close-modal').addEventListener('click', () => {
        modal.style.display = 'none';
        promptInput.value = '';
        // Rimuovi tutti gli event listener dal promptInput
        promptInput.replaceWith(promptInput.cloneNode(true));
    });

    document.getElementById('save-prompt').addEventListener('click', () => {
        if (activePromptElement) {
            const promptIndex = activePromptElement.dataset.prompt;
            prompts.prompts[currentSectionKey][promptIndex] = promptInput.value.trim();
            updatePromptContents();
            modal.style.display = 'none';
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentSectionIndex > 0) {
            showSection(currentSectionIndex - 1);
        }
    });

    function showReviewPage() {
        sectionsContainer.innerHTML = `
            <div class="review-page">
                <h2 class="section-title">Riepilogo Prompt</h2>
                <div class="review-header">
                    <p><strong>Codice:</strong> ${userCode}</p>
                    <p><strong>Classe:</strong> ${userData.classe}</p>
                    <p><strong>Gruppo:</strong> ${userData.gruppo}</p>
                </div>
                ${sections.map((section, index) => {
                    const sectionKey = getSectionKey(index);
                    return `
                        <div class="section review-section" data-section="${section.key}">
                            <h3>${section.title}</h3>
                            ${prompts.prompts[sectionKey].map((value, i) => `
                                <div class="prompt-review">
                                    <strong>Prompt ${i + 1}:</strong> 
                                    <p>${value || '(vuoto)'}</p>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }).join('')}
                <div class="review-buttons">
                    <button id="back-to-edit" class="secondary-button">← Torna Indietro</button>
                    <button id="translate-prompts" class="secondary-button">Traduci in Inglese</button>
                    <button id="submit-prompts" class="primary-button">Invia Prompts</button>
                </div>
                <div class="review-warning">
                    <p>⚠️ I prompt sono già tradotti in inglese? Se non lo sono clicca TRADUCI prima di inviare</p>
                </div>
            </div>
        `;

        // Nascondi i bottoni di navigazione
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';

        // Aggiungi event listeners per i bottoni
        document.getElementById('back-to-edit').addEventListener('click', () => {
            showSection(sections.length - 1);
            prevButton.style.display = 'block';
            nextButton.style.display = 'block';
        });

        document.getElementById('translate-prompts').addEventListener('click', () => {
            const translateButton = document.getElementById('translate-prompts');
            translateButton.disabled = true;
            translateButton.textContent = 'Traduzione in corso...';
            
            fetch('/api/translate_prompts/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompts: prompts.prompts })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    prompts.prompts = data.translated_prompts;
                    showReviewPage(); // Aggiorna la pagina con i prompt tradotti
                    alert('Traduzione completata con successo!');
                } else {
                    alert('Errore durante la traduzione: ' + data.error);
                    translateButton.disabled = false;
                    translateButton.textContent = 'Traduci in Inglese';
                }
            })
            .catch(error => {
                alert('Errore durante la traduzione: ' + error);
                translateButton.disabled = false;
                translateButton.textContent = 'Traduci in Inglese';
            });
        });

        document.getElementById('submit-prompts').addEventListener('click', submitPrompts);
    }

    nextButton.addEventListener('click', () => {
        if (!nextButton.classList.contains('disabled')) {
            if (currentSectionIndex < sections.length - 1) {
                showSection(currentSectionIndex + 1);
            } else if (nextButton.textContent === 'Lista Prompts →') {
                showReviewPage();
            }
        }
    });

    function submitPrompts() {
        const data = {
            classe: userData.classe,
            gruppo: userData.gruppo,
            user_code: userCode,
            prompts: prompts.prompts
        };
        
        fetch('/api/submit/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Prompts salvati con successo!');
                window.location.reload(); // Reload della pagina
            } else {
                alert('Errore durante il salvataggio: ' + data.error);
            }
        })
        .catch(error => {
            alert('Errore durante il salvataggio: ' + error);
        });
    }

    // Start with the landing page
    showLandingPage();
});
