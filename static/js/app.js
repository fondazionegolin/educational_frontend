document.addEventListener('DOMContentLoaded', () => {
    const sections = ['VECCHIAIA', 'MATURITÀ', 'INFANZIA'];
    let currentSectionIndex = 0;
    
    // Generate a random 5-digit code
    let userCode = Math.floor(10000 + Math.random() * 90000).toString();
    
    // Display user code
    const userCodeDisplay = document.getElementById('user-code-display');
    userCodeDisplay.textContent = `Codice Gruppo: ${userCode}`;
    
    let prompts = {
        user_data: {
            classe: '',
            user_code: userCode,
            gruppo: ''
        },
        prompts: {
            old: ['', '', '', ''],
            recent: ['', '', '', ''],
            childhood: ['', '', '', '']
        }
    };

    const modal = document.getElementById('prompt-modal');
    const promptInput = document.getElementById('prompt-input');
    promptInput.contentEditable = 'false'; 
    promptInput.innerHTML = '';
    const sectionsContainer = document.getElementById('sections-container');
    const prevButton = document.getElementById('prev-section');
    const nextButton = document.getElementById('next-section');
    const classeInput = document.getElementById('classe');
    const gruppoInput = document.getElementById('gruppo');
    
    let activePromptElement = null;
    let currentSectionKey = '';

    function playTypewriterSound() {
        const sound = document.getElementById('typewriterSound');
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio play failed:', e));
    }

    // Add input event for contenteditable
    promptInput.addEventListener('input', (e) => {
        if (e.inputType === 'insertText') {
            playTypewriterSound();
        }
    });

    document.querySelectorAll('input[type="text"]').forEach(input => {
        input.addEventListener('input', (e) => {
            if (e.inputType === 'insertText') {
                playTypewriterSound();
            }
            validateHeaderInputs();
        });
    });

    function updateNavigationButtonsText() {
        if (currentSectionIndex === 0) {
            nextButton.textContent = 'MATURITÀ →';
            prevButton.style.display = 'none';
        } else if (currentSectionIndex === 1) {
            nextButton.textContent = 'INFANZIA →';
            prevButton.textContent = '← VECCHIAIA';
            prevButton.style.display = 'block';
        } else if (currentSectionIndex === 2) {
            nextButton.textContent = 'RIEPILOGO →';
            prevButton.textContent = '← MATURITÀ';
        }
    }

    function getSectionKey(index) {
        const sectionMap = {
            0: 'old',
            1: 'recent',
            2: 'childhood'
        };
        return sectionMap[index];
    }

    function createSection(title) {
        currentSectionKey = getSectionKey(currentSectionIndex);
        const section = document.createElement('div');
        section.className = 'section';
        section.setAttribute('data-section', currentSectionKey);
        section.innerHTML = `
            <h2 class="section-title">${title}</h2>
            <div class="prompt-grid">
                ${Array.from({length: 4}, (_, i) => `
                    <div class="prompt-box" data-prompt="${i}">
                        <p>Prompt ${i + 1}</p>
                        <div class="prompt-content"></div>
                    </div>
                `).join('')}
            </div>
        `;
        return section;
    }

    function validateSection() {
        if (currentSectionIndex === 0) {
            return validateHeaderInputs();
        }

        const sectionKey = getSectionKey(currentSectionIndex);
        const isValid = prompts.prompts[sectionKey].every(prompt => prompt.trim() !== '');
        nextButton.classList.toggle('disabled', !isValid);
        return isValid;
    }

    function validateHeaderInputs() {
        prompts.user_data.classe = classeInput.value.trim();
        prompts.user_data.gruppo = gruppoInput.value.trim();
        const isValid = prompts.user_data.classe !== '' && prompts.user_data.gruppo !== '';
        nextButton.classList.toggle('disabled', !isValid);
        return isValid;
    }

    function showSection(index) {
        if (index > currentSectionIndex && !validateSection()) {
            if (currentSectionIndex === 0) {
                alert('Per favore compila sia la Classe che il Nome Gruppo prima di continuare.');
            } else {
                alert('Per favore compila tutti i prompt prima di procedere.');
            }
            return;
        }

        currentSectionIndex = index;
        sectionsContainer.innerHTML = '';
        const section = createSection(sections[index]);
        sectionsContainer.appendChild(section);
        
        updateNavigationButtonsText();
        
        section.querySelectorAll('.prompt-box').forEach(box => {
            box.addEventListener('click', () => openPromptModal(box));
        });

        updatePromptContents();
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
            const content = prompts.prompts[currentSectionKey][promptIndex] || '';
            const contentDiv = box.querySelector('.prompt-content');
            contentDiv.textContent = content;
            box.classList.toggle('filled', content.trim() !== '');
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
        if (!prevButton.classList.contains('disabled') && currentSectionIndex > 0) {
            showSection(currentSectionIndex - 1);
        }
    });

    nextButton.addEventListener('click', () => {
        if (!nextButton.classList.contains('disabled')) {
            if (currentSectionIndex < sections.length - 1) {
                showSection(currentSectionIndex + 1);
            } else {
                showReviewPage();
            }
        }
    });

    function showReviewPage() {
        sectionsContainer.innerHTML = `
            <h2 class="section-title">RIEPILOGO PROMPT</h2>
            <div class="review-header">
                <p><strong>Codice Gruppo:</strong> ${prompts.user_data.user_code}</p>
                <p><strong>Classe:</strong> ${prompts.user_data.classe}</p>
                <p><strong>Gruppo:</strong> ${prompts.user_data.gruppo}</p>
            </div>
            ${sections.map((section, index) => {
                const sectionKey = getSectionKey(index);
                return `
                    <div class="section review-section">
                        <h3>${section}</h3>
                        ${prompts.prompts[sectionKey].map((value, i) => `
                            <div class="prompt-review">
                                <strong>Prompt ${i + 1}:</strong> 
                                <p>${value || '(vuoto)'}</p>
                            </div>
                        `).join('')}
                    </div>
                `;
            }).join('')}
        `;

        const submitButton = document.createElement('button');
        submitButton.id = 'submit-prompts';
        submitButton.textContent = 'INVIA I PROMPT';
        document.body.appendChild(submitButton);

        prevButton.style.display = 'block';
        nextButton.style.display = 'none';

        submitButton.addEventListener('click', async () => {
            submitButton.disabled = true;
            submitButton.textContent = 'Invio in corso...';
            
            try {
                const response = await fetch('/api/submit/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(prompts)
                });
                const result = await response.json();
                if (result.success) {
                    const shouldContinue = confirm(`Prompts salvati con successo!\nFile: ${result.filename}\n\nVuoi inserire un nuovo set di prompt?`);
                    if (shouldContinue) {
                        userCode = Math.floor(10000 + Math.random() * 90000).toString();
                        userCodeDisplay.textContent = `Codice Gruppo: ${userCode}`;
                        const savedClasse = prompts.user_data.classe;
                        const savedGruppo = prompts.user_data.gruppo;
                        prompts = {
                            user_data: {
                                classe: savedClasse,
                                user_code: userCode,
                                gruppo: savedGruppo
                            },
                            prompts: {
                                old: ['', '', '', ''],
                                recent: ['', '', '', ''],
                                childhood: ['', '', '', '']
                            }
                        };
                        document.body.removeChild(submitButton);
                        currentSectionIndex = 0;
                        showSection(0);
                    }
                } else {
                    alert('Errore: ' + (result.error || 'Errore sconosciuto durante il salvataggio'));
                }
            } catch (error) {
                console.error('Submission error:', error);
                alert('Errore durante l\'invio dei prompt.');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'INVIA I PROMPT';
            }
        });
    }

    showSection(0);
    validateHeaderInputs();
});
