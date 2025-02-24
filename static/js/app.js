document.addEventListener('DOMContentLoaded', () => {
    const sections = [
        {
            key: 'old',
            title: 'Vecchiaia',
            example: 'Example: "An elderly gardener with weathered hands and gentle eyes, tending to a lush Mediterranean garden filled with olive trees and aromatic herbs. Soft afternoon sunlight filters through the branches, creating dappled shadows. Photorealistic style with warm, earthy tones."'
        },
        {
            key: 'recent',
            title: 'Maturità',
            example: 'Example: "A determined professional in their 40s working in a modern office space with floor-to-ceiling windows overlooking a vibrant cityscape. Sleek design elements and technology seamlessly integrated into the environment. Contemporary digital art style with dynamic lighting."'
        },
        {
            key: 'childhood',
            title: 'Infanzia',
            example: 'Example: "A curious child exploring a whimsical playground filled with colorful geometric shapes and fantastical elements. Floating bubbles and paper airplanes in the air, surrounded by imaginative toys. Stylized illustration with bright, playful colors."'
        }
    ];

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
            old: Array(4).fill(''),
            recent: Array(4).fill(''),
            childhood: Array(4).fill('')
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
        
        for (let i = 0; i < 4; i++) {
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
                <h1 class="landing-title">Benvenuto</h1>
                <p class="landing-subtitle">Inserisci i dati del tuo gruppo per iniziare</p>
                
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
                    <button id="start-collection" class="primary-button" disabled>Inizia la Raccolta →</button>
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
        
        prevButton.style.display = index === 0 ? 'none' : 'block';
        nextButton.style.display = 'block';
        
        if (index === sections.length - 1) {
            nextButton.textContent = 'Lista Prompts';
        } else {
            nextButton.textContent = 'Avanti →';
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
            } else if (nextButton.textContent === 'Lista Prompts') {
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
