// Study Design Form Builder
// ==========================================

let questions = [];
let questionIdCounter = 1;
let currentStudyId = null; // Store the current study ID if editing
let hasUnsavedChanges = false; // Track if there are unsaved changes
let initialFormState = null; // Store initial form state for comparison

// Generate unique study ID using timestamp
function generateStudyId() {
    return Date.now().toString();
}

// Mark form as changed
function markFormAsChanged() {
    if (!hasUnsavedChanges) {
        hasUnsavedChanges = true;
        updateSaveDraftButton();
    }
}

// Update save draft button state
function updateSaveDraftButton() {
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    if (saveDraftBtn) {
        if (hasUnsavedChanges) {
            saveDraftBtn.disabled = false;
            saveDraftBtn.style.background = 'var(--primary-green)';
            saveDraftBtn.style.color = 'white';
            saveDraftBtn.style.borderColor = 'var(--primary-green)';
        } else {
            saveDraftBtn.disabled = true;
            saveDraftBtn.style.background = '#e5e7eb';
            saveDraftBtn.style.color = '#9ca3af';
            saveDraftBtn.style.borderColor = '#e5e7eb';
            saveDraftBtn.style.cursor = 'not-allowed';
        }
    }
}

// Reset unsaved changes flag
function resetUnsavedChanges() {
    hasUnsavedChanges = false;
    updateSaveDraftButton();
}

// Initialize the form builder
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    checkForEditMode();
});

// Check if we're editing an existing study
async function checkForEditMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const studyId = urlParams.get('studyId');
    const isNewStudy = urlParams.get('new');
    
    // If explicitly creating a new study, clear everything
    if (isNewStudy === 'true') {
        clearStudyForm();
        console.log('Starting new study from scratch');
        return;
    }
    
    if (studyId) {
        try {
            const response = await fetch(`/api/studies/${encodeURIComponent(studyId)}`);
            if (response.ok) {
                const study = await response.json();
                loadStudyData(study);
                currentStudyId = studyId;
                console.log('Loaded study for editing:', studyId);
            } else {
                console.error('Failed to load study:', response.statusText);
                alert('Failed to load study. It may have been deleted.');
                window.location.href = '/studymanagement';
            }
        } catch (error) {
            console.error('Error loading study:', error);
            alert('Failed to load study. Please try again.');
        }
    } else {
        // New study mode
        loadInitialContent();
    }
}

// Load study data into the form
function loadStudyData(study) {
    // Set form title and description
    if (study.title) {
        document.getElementById('formTitle').value = study.title;
        // Update page title to include study name
        document.title = `Edit: ${study.title} - Study Details`;
        // Update the study title header
        const titleDisplay = document.getElementById('studyTitleDisplay');
        if (titleDisplay) {
            titleDisplay.textContent = study.title;
        }
    }
    if (study.description) {
        document.getElementById('formDescription').value = study.description;
    }
    
    // Load instruction title and text
    if (study.instructionTitle) {
        const instructionTitleElement = document.getElementById('instructionTitle');
        if (instructionTitleElement) {
            instructionTitleElement.value = study.instructionTitle;
        }
    }
    if (study.instructionText) {
        const instructionTextElement = document.getElementById('instructionText');
        if (instructionTextElement) {
            instructionTextElement.value = study.instructionText;
        }
    }
    
    // Load participant codes if available
    if (study.participantCodes && Array.isArray(study.participantCodes)) {
        participantCodes = study.participantCodes;
        if (typeof refreshCodesTable === 'function') {
            refreshCodesTable();
        }
    }
    
    // Load selfie configuration
    if (study.selfieConfig) {
        const selfieNeededElement = document.getElementById('selfieNeeded');
        if (selfieNeededElement && study.selfieConfig.enabled) {
            selfieNeededElement.checked = true;
            // Show selfie configuration options
            const selfieConfigOptions = document.getElementById('selfieConfigOptions');
            if (selfieConfigOptions) {
                selfieConfigOptions.style.display = 'block';
            }
            
            // Load selfie configuration values
            if (study.selfieConfig.language) {
                const languageElement = document.getElementById('selfieLanguage');
                if (languageElement) {
                    languageElement.value = study.selfieConfig.language;
                }
            }
            if (study.selfieConfig.camera) {
                const cameraElement = document.getElementById('selfieCamera');
                if (cameraElement) {
                    cameraElement.value = study.selfieConfig.camera;
                }
            }
        }
    }
    
    // Load questions
    if (study.questions && Array.isArray(study.questions)) {
        questions = study.questions.map(q => {
            // Ensure each question has an ID and editMode property
            if (!q.id) {
                q.id = questionIdCounter++;
            } else {
                questionIdCounter = Math.max(questionIdCounter, q.id + 1);
            }
            q.editMode = false; // All questions start in preview mode when editing
            return q;
        });
        
        reRenderAllQuestions();
    }
    
    // Update button text to indicate editing mode
    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) {
        publishBtn.innerHTML = '<i class="fas fa-save"></i> Update Study';
    }
    
    // When editing, start with study info tab to show loaded data
    if (typeof switchSection === 'function') {
        switchSection('studyInfo');
    } else if (typeof switchTab === 'function') {
        switchTab('studyInfo');
    }
    
    updatePreview();
    
    // Reset unsaved changes flag after loading data
    resetUnsavedChanges();
}

// Event Listeners
function initializeEventListeners() {
    // Form title and description updates
    document.getElementById('formTitle').addEventListener('input', function() {
        updatePreview();
        // Update the study title header when title changes
        const titleValue = this.value.trim();
        const titleDisplay = document.getElementById('studyTitleDisplay');
        if (titleDisplay) {
            titleDisplay.textContent = titleValue || 'New Study';
        }
        // Hide error if title is not empty
        const titleError = document.getElementById('titleError');
        if (titleError && titleValue) {
            titleError.classList.remove('visible');
            this.style.borderColor = '#d1d5db';
        }
    });
    
    document.getElementById('formTitle').addEventListener('blur', function() {
        // Show error if title is empty on blur
        const titleValue = this.value.trim();
        const titleError = document.getElementById('titleError');
        if (titleError && !titleValue) {
            titleError.classList.add('visible');
            this.style.borderColor = '#ef4444';
        }
    });
    
    document.getElementById('formDescription').addEventListener('input', updatePreview);
    
    // Customer instruction fields
    const instructionTitleField = document.getElementById('instructionTitle');
    const instructionTextField = document.getElementById('instructionText');
    if (instructionTitleField) {
        instructionTitleField.addEventListener('input', updatePreview);
    }
    if (instructionTextField) {
        instructionTextField.addEventListener('input', updatePreview);
    }
    
    // Selfie configuration master toggle
    const selfieNeededCheckbox = document.getElementById('selfieNeeded');
    if (selfieNeededCheckbox) {
        selfieNeededCheckbox.addEventListener('change', function() {
            const configOptions = document.getElementById('selfieConfigOptions');
            if (configOptions) {
                configOptions.style.display = this.checked ? 'block' : 'none';
            }
        });
    }
    
    // Selfie endpoints textarea
    const selfieEndpointsField = document.getElementById('selfieEndpoints');
    if (selfieEndpointsField) {
        selfieEndpointsField.addEventListener('input', markFormAsChanged);
    }
    
    // Click outside to exit edit mode
    document.addEventListener('click', function(e) {
        // Check if click is on add question button or its container
        const isAddQuestionBtn = e.target.closest('#addQuestionBtn') || e.target.closest('.add-question-container');
        
        // Check if click is outside any question card
        const clickedCard = e.target.closest('.question-card');
        
        // Don't exit edit mode if clicking on add question button
        if (!clickedCard && !isAddQuestionBtn) {
            // Exit all edit modes
            const hasEditMode = questions.some(q => q.editMode);
            if (hasEditMode) {
                questions.forEach(q => q.editMode = false);
                reRenderAllQuestions();
            }
        }
    });
    
    // Question type buttons
    document.querySelectorAll('.question-type-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const questionType = this.getAttribute('data-type');
            addQuestion(questionType);
            toggleQuestionToolbar(); // Close toolbar after adding question
        });
    });
    
    // Add question button
    document.getElementById('addQuestionBtn').addEventListener('click', function() {
        addQuestionQuick();
    });
    
    // Action buttons
    document.getElementById('saveDraftBtn').addEventListener('click', saveDraft);
    document.getElementById('publishBtn').addEventListener('click', publishStudy);
    // Preview button now handled by togglePreview() in HTML
    
    // Track changes on form inputs
    const formInputs = [
        'formTitle',
        'formDescription',
        'instructionTitle',
        'instructionText',
        'selfieNeeded',
        'selfieLanguage',
        'selfieCamera',
        'askedZone',
        'autoTake',
        'showTutorial',
        'enableValidations',
        'lightValidation',
        'distanceValidation',
        'tiltValidation',
        'expressionValidation',
        'eyesValidation'
    ];
    
    formInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', markFormAsChanged);
            element.addEventListener('change', markFormAsChanged);
        }
    });
    
    // Also track changes on threshold inputs
    const thresholdInputs = document.querySelectorAll('#selfieConfigContent input[type="number"]');
    thresholdInputs.forEach(input => {
        input.addEventListener('input', markFormAsChanged);
        input.addEventListener('change', markFormAsChanged);
    });
}

// Quick add question from inline input (React prototype style)
function addQuestionQuick() {
    const input = document.getElementById('quickQuestionInput');
    const typeSelect = document.getElementById('quickQuestionType');
    
    const questionText = input ? input.value.trim() : '';
    const questionType = typeSelect ? typeSelect.value : 'text';
    
    if (!questionText && input) {
        // If empty, just add a default question in edit mode
        addQuestion(questionType);
        return;
    }
    
    if (questionText) {
        // Set all existing questions to preview mode
        questions.forEach(q => q.editMode = false);
        
        const question = {
            id: questionIdCounter++,
            type: questionType,
            text: questionText,
            required: false,
            options: [],
            logic: null,
            editMode: false // Add directly to preview mode since we have text
        };
        
        // Set default options for choice-based questions
        if (questionType === 'choice' || ['single-choice', 'multiple-choice', 'dropdown'].includes(questionType)) {
            question.options = ['Option 1', 'Option 2', 'Option 3'];
        } else if (questionType === 'ranking') {
            question.options = ['Item 1', 'Item 2', 'Item 3'];
        } else if (questionType === 'likert') {
            question.options = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
        } else if (questionType === 'rating') {
            question.maxRating = 5;
        }
        
        questions.push(question);
        
        // Clear input
        if (input) input.value = '';
        
        // Re-render and update
        reRenderAllQuestions();
        updatePreview();
    }
}

// Toggle question toolbar visibility
function toggleQuestionToolbar() {
    const toolbar = document.getElementById('questionToolbar');
    toolbar.classList.toggle('show');
    
    // Scroll to toolbar when opening
    if (toolbar.classList.contains('show')) {
        toolbar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Add a new question
function addQuestion(type) {
    // Set all existing questions to preview mode
    questions.forEach(q => q.editMode = false);
    
    const question = {
        id: questionIdCounter++,
        type: type,
        text: '',
        required: false,
        options: [],
        logic: null,
        editMode: true // New question starts in edit mode
    };
    
    // Set default options for choice-based questions
    if (type === 'choice' || ['single-choice', 'multiple-choice', 'dropdown'].includes(type)) {
        question.options = ['Option 1', 'Option 2', 'Option 3'];
    } else if (type === 'ranking') {
        question.options = ['Item 1', 'Item 2', 'Item 3'];
    } else if (type === 'likert') {
        question.options = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
    } else if (type === 'rating') {
        question.maxRating = 5;
    }
    
    questions.push(question);
    
    // Mark form as changed
    markFormAsChanged();
    
    // Re-render all questions to update their modes
    reRenderAllQuestions();
    updatePreview();
    
    // Auto-focus on the new question's input field
    setTimeout(() => {
        const newQuestionCard = document.querySelector(`[data-question-id="${question.id}"]`);
        if (newQuestionCard) {
            const inputField = newQuestionCard.querySelector('.question-text-input');
            if (inputField) {
                inputField.focus();
                inputField.select(); // Also select the text if any
            }
        }
    }, 100); // Increased timeout slightly for more reliable focus
}

// Render a question card
function renderQuestion(question) {
    const container = document.getElementById('questionsContainer');
    const questionCard = document.createElement('div');
    questionCard.className = question.editMode ? 'question-card edit-mode' : 'question-card preview-mode';
    questionCard.setAttribute('data-question-id', question.id);
    questionCard.setAttribute('draggable', 'false');
    
    const questionNumber = questions.findIndex(q => q.id === question.id) + 1;
    
    if (question.editMode) {
        // Edit Mode - Minimal editing interface
        questionCard.innerHTML = `
            <div class="question-header">
                <div class="question-header-left">
                    <span class="question-number">Q${questionNumber}</span>
                    <input type="text" class="question-text-input" placeholder="Type your question..." value="${question.text}" 
                           onchange="updateQuestionText(${question.id}, this.value)"
                           style="flex: 1; font-size: 14px; font-weight: 500; border: none; outline: none; padding: 0; color: #111827; line-height: 1.5;">
                    <select class="question-type-selector" onchange="changeQuestionType(${question.id}, this.value)"
                           style="padding: 6px 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; background: white;">
                        ${getQuestionTypeOptions(question.type)}
                    </select>
                </div>
                <div class="question-actions">
                    <button class="question-action-btn" onclick="duplicateQuestion(${question.id})" title="Duplicate">
                        <i class="far fa-copy"></i>
                    </button>
                    <button class="question-action-btn" onclick="deleteQuestion(${question.id})" title="Delete">
                        <i class="far fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            
            <div class="question-content">
                
                ${renderQuestionOptions(question)}
            </div>
            
            <div class="question-settings">
                <label class="question-setting-toggle">
                    <input type="checkbox" ${question.required ? 'checked' : ''} 
                           onchange="toggleRequired(${question.id}, this.checked)">
                    Required
                </label>
                <label class="question-setting-toggle">
                    <input type="checkbox" ${question.logic ? 'checked' : ''} 
                           onchange="toggleLogic(${question.id}, this.checked)">
                    Add logic
                </label>
                <span class="question-settings-divider">•</span>
                <span>Type: ${getQuestionTypeLabel(question.type)}</span>
            </div>
            
            ${question.logic ? renderLogicSection(question) : ''}
        `;
    } else {
        // Preview Mode - Minimal preview with Q# format
        const questionText = question.text || 'Enter your question';
        const previewOptions = renderQuestionPreview(question);
        
        questionCard.innerHTML = `
            <div class="question-preview" onclick="enterEditMode(${question.id})">
                <div class="question-preview-header">
                    <div class="question-preview-title">
                        <span class="question-number-label">Q${questionNumber}</span>
                        <span class="question-preview-text">${questionText}</span>
                        ${question.required ? '<span class="required-badge">Required</span>' : ''}
                    </div>
                    <div class="question-actions">
                        <button class="question-action-btn" onclick="event.stopPropagation(); duplicateQuestion(${question.id})" title="Duplicate">
                            <i class="far fa-copy"></i>
                        </button>
                        <button class="question-action-btn" onclick="event.stopPropagation(); deleteQuestion(${question.id})" title="Delete">
                            <i class="far fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                ${previewOptions}
            </div>
        `;
    }
    
    container.appendChild(questionCard);
    
    // Add drag and drop listeners
    questionCard.addEventListener('dragstart', handleDragStart);
    questionCard.addEventListener('dragover', handleDragOver);
    questionCard.addEventListener('drop', handleDrop);
    questionCard.addEventListener('dragend', handleDragEnd);
}

// Get question type options for dropdown
function getQuestionTypeOptions(selectedType) {
    const types = [
        { value: 'text', label: 'Text' },
        { value: 'choice', label: 'Multiple Choice' },
        { value: 'rating', label: 'Rating' },
        { value: 'date', label: 'Date' },
        { value: 'ranking', label: 'Ranking' }
    ];
    
    return types.map(type => 
        `<option value="${type.value}" ${type.value === selectedType ? 'selected' : ''}>${type.label}</option>`
    ).join('');
}

// Get question type label
function getQuestionTypeLabel(type) {
    const labels = {
        'text': 'Text',
        'choice': 'Multiple Choice',
        'single-choice': 'Multiple Choice',
        'multiple-choice': 'Checkboxes',
        'rating': 'Rating',
        'date': 'Date',
        'ranking': 'Ranking',
        'likert': 'Likert Scale',
        'dropdown': 'Dropdown'
    };
    return labels[type] || 'Text';
}

// Get question type icon
function getQuestionTypeIcon(type) {
    const icons = {
        'text': '📝',
        'choice': '⚪',
        'rating': '⭐',
        'date': '📅',
        'ranking': '🔢'
    };
    return icons[type] || '📝';
}

// Render question preview (shows options in preview mode)
function renderQuestionPreview(question) {
    const choiceTypes = ['choice', 'single-choice', 'multiple-choice', 'dropdown', 'ranking', 'likert'];
    
    if (choiceTypes.includes(question.type) && question.options && question.options.length > 0) {
        const inputType = (question.type === 'choice' || question.type === 'single-choice') ? 'radio' : 'checkbox';
        const optionsList = question.options.map((opt, idx) => {
            return `
                <label class="preview-option-label">
                    <input type="${inputType}" name="preview-q${question.id}" disabled>
                    <span>${opt}</span>
                </label>
            `;
        }).join('');
        
        return `<div class="question-preview-options">${optionsList}</div>`;
    } else if (question.type === 'rating') {
        const maxRating = question.maxRating || 5;
        const stars = Array.from({length: maxRating}, (_, i) => 
            `<span class="preview-star">★</span>`
        ).join('');
        return `<div class="question-preview-options"><div class="preview-rating">${stars}</div></div>`;
    } else if (question.type === 'date') {
        return `<div class="question-preview-options"><input type="date" class="preview-date-input" disabled></div>`;
    } else if (question.type === 'text') {
        return `<div class="question-preview-options"><input type="text" class="preview-text-input" placeholder="Your answer here..." disabled></div>`;
    } else if (question.type === 'ranking') {
        const itemsList = question.options.map((opt, idx) => {
            return `
                <div class="preview-ranking-item">
                    <span class="preview-drag-icon">≡</span>
                    <span>${opt}</span>
                </div>
            `;
        }).join('');
        return `<div class="question-preview-options">${itemsList}</div>`;
    }
    
    return '';
}

// Enter edit mode for a question
function enterEditMode(questionId) {
    // Set all questions to preview mode except the clicked one
    questions.forEach(q => {
        q.editMode = (q.id === questionId);
    });
    reRenderAllQuestions();
}

// Re-render all questions
function reRenderAllQuestions() {
    const container = document.getElementById('questionsContainer');
    container.innerHTML = '';
    questions.forEach(q => renderQuestion(q));
}

// Render question-specific options
function renderQuestionOptions(question) {
    const choiceTypes = ['choice', 'single-choice', 'multiple-choice', 'dropdown', 'ranking', 'likert'];
    
    if (choiceTypes.includes(question.type)) {
        return `
            <div class="question-options">
                ${question.options.map((option, index) => `
                    <div class="option-item">
                        <input type="text" value="${option}" 
                               onchange="updateOption(${question.id}, ${index}, this.value)" 
                               placeholder="Option ${index + 1}">
                        ${question.options.length > 2 ? `
                            <button class="remove-option-btn" onclick="removeOption(${question.id}, ${index})">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                `).join('')}
                <button class="add-option-btn" onclick="addOption(${question.id})">
                    <i class="fas fa-plus"></i> Add Option
                </button>
            </div>
        `;
    } else if (question.type === 'rating') {
        return `
            <div class="question-options">
                <label style="font-size: 13px; color: var(--text-secondary);">
                    Max Rating: 
                    <input type="number" value="${question.maxRating || 5}" min="1" max="10" 
                           style="width: 60px; margin-left: 8px;"
                           onchange="updateMaxRating(${question.id}, this.value)">
                </label>
            </div>
        `;
    } else if (question.type === 'section-break') {
        return `
            <div class="question-options">
                <input type="text" placeholder="Section title (optional)" 
                       value="${question.sectionTitle || ''}"
                       onchange="updateSectionTitle(${question.id}, this.value)"
                       style="font-weight: 600;">
            </div>
        `;
    }
    
    return '';
}

// Render logic branching section
function renderLogicSection(question) {
    return `
        <div class="logic-section">
            <strong style="font-size: 13px; display: block; margin-bottom: 8px;">
                <i class="fas fa-code-branch"></i> Logic Rules
            </strong>
            <div class="logic-rule">
                <span>If answer is</span>
                <select>
                    <option>equals</option>
                    <option>not equals</option>
                    <option>contains</option>
                </select>
                <input type="text" placeholder="value" style="flex: 1;">
                <span>then show question</span>
                <select>
                    ${questions.filter(q => q.id !== question.id).map(q => 
                        `<option value="${q.id}">#${questions.indexOf(q) + 1}</option>`
                    ).join('')}
                </select>
            </div>
        </div>
    `;
}

// Update question text
function updateQuestionText(questionId, text) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.text = text;
        markFormAsChanged();
        updatePreview();
    }
}

// Change question type
function changeQuestionType(questionId, newType) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.type = newType;
        
        // Reset options for new type
        if (newType === 'choice' || ['single-choice', 'multiple-choice', 'dropdown'].includes(newType)) {
            question.options = ['Option 1', 'Option 2', 'Option 3'];
        } else if (newType === 'ranking') {
            question.options = ['Item 1', 'Item 2', 'Item 3'];
        } else if (newType === 'likert') {
            question.options = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
        }
        
        markFormAsChanged();
        reRenderQuestion(questionId);
        updatePreview();
    }
}

// Add option to question
function addOption(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        const optionNumber = question.options.length + 1;
        question.options.push(`Option ${optionNumber}`);
        markFormAsChanged();
        reRenderQuestion(questionId);
        updatePreview();
    }
}

// Remove option from question
function removeOption(questionId, optionIndex) {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options.length > 2) {
        question.options.splice(optionIndex, 1);
        markFormAsChanged();
        reRenderQuestion(questionId);
        updatePreview();
    }
}

// Update option text
function updateOption(questionId, optionIndex, text) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.options[optionIndex] = text;
        markFormAsChanged();
        updatePreview();
    }
}

// Update max rating
function updateMaxRating(questionId, value) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.maxRating = parseInt(value);
        markFormAsChanged();
        updatePreview();
    }
}

// Update section title
function updateSectionTitle(questionId, title) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.sectionTitle = title;
        updatePreview();
    }
}

// Toggle required
function toggleRequired(questionId, checked) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.required = checked;
        markFormAsChanged();
        updatePreview();
    }
}

// Toggle logic
function toggleLogic(questionId, checked) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.logic = checked ? {} : null;
        markFormAsChanged();
        reRenderQuestion(questionId);
    }
}

// Delete question
function deleteQuestion(questionId) {
    if (confirm('Are you sure you want to delete this question?')) {
        questions = questions.filter(q => q.id !== questionId);
        markFormAsChanged();
        reRenderAllQuestions();
        updatePreview();
    }
}

// Duplicate question
function duplicateQuestion(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        const newQuestion = {
            ...JSON.parse(JSON.stringify(question)),
            id: questionIdCounter++
        };
        questions.push(newQuestion);
        markFormAsChanged();
        renderQuestion(newQuestion);
        updatePreview();
    }
}

// Re-render a specific question
function reRenderQuestion(questionId) {
    const question = questions.find(q => q.id === questionId);
    const card = document.querySelector(`[data-question-id="${questionId}"]`);
    if (card && question) {
        card.remove();
        renderQuestion(question);
    }
}

// Re-render all questions
function reRenderAllQuestions() {
    document.getElementById('questionsContainer').innerHTML = '';
    questions.forEach(question => renderQuestion(question));
}

// Update live preview
let previewIframeLoaded = false;

function updatePreview() {
    const iframe = document.getElementById('previewIframe');
    if (!iframe) return;
    
    // Build study data object
    const studyData = collectFormData();
    
    // If iframe hasn't loaded yet, set up the src with study data
    if (!previewIframeLoaded) {
        // Create a data URL with the study data embedded
        const studyId = new URLSearchParams(window.location.search).get('studyId') || 'preview';
        
        // Store study data in sessionStorage for the iframe to access
        sessionStorage.setItem('previewStudyData', JSON.stringify(studyData));
        
        // Load the iframe with a special preview mode parameter
        iframe.src = `/mobilepreview?studyId=${studyId}&mode=preview`;
        
        // Set flag when iframe loads
        iframe.onload = () => {
            previewIframeLoaded = true;
            // Send initial data after iframe loads
            setTimeout(() => {
                sendPreviewUpdate(iframe, studyData);
            }, 100);
        };
    } else {
        // Iframe already loaded, send update message
        sendPreviewUpdate(iframe, studyData);
    }
}

// Send preview update to iframe
function sendPreviewUpdate(iframe, studyData) {
    try {
        iframe.contentWindow.postMessage({
            type: 'updatePreview',
            studyData: studyData
        }, '*');
    } catch (error) {
        console.error('Error sending preview update:', error);
    }
}

// Collect form data for preview
function collectFormData() {
    const title = document.getElementById('formTitle')?.value || 'Untitled Study';
    const description = document.getElementById('formDescription')?.value || '';
    const instructionTitle = document.getElementById('instructionTitle')?.value || '';
    const instructionText = document.getElementById('instructionText')?.value || '';
    const selfieNeeded = document.getElementById('selfieNeeded')?.checked || false;
    const selfieEndpoints = document.getElementById('selfieEndpoints')?.value || '';
    
    return {
        title: title,
        description: description,
        instructionTitle: instructionTitle,
        instructionText: instructionText,
        questions: questions,
        selfieConfig: {
            required: selfieNeeded,
            endpoints: selfieEndpoints
        },
        status: 'Draft'
    };
}

// Drag and drop handlers
let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (draggedElement !== this) {
        const draggedId = parseInt(draggedElement.getAttribute('data-question-id'));
        const targetId = parseInt(this.getAttribute('data-question-id'));
        
        const draggedIndex = questions.findIndex(q => q.id === draggedId);
        const targetIndex = questions.findIndex(q => q.id === targetId);
        
        const [draggedQuestion] = questions.splice(draggedIndex, 1);
        questions.splice(targetIndex, 0, draggedQuestion);
        
        reRenderAllQuestions();
        updatePreview();
    }
    
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
}

// Action button handlers
async function saveDraft() {
    const title = document.getElementById('formTitle').value;
    
    if (!title.trim()) {
        alert('Please enter a study title before saving draft.');
        return;
    }
    
    const formData = getFormData();
    formData.status = 'Draft';
    
    // Use existing study ID or generate a new one using timestamp
    if (currentStudyId) {
        formData.studyId = currentStudyId;
    } else if (!formData.studyId) {
        formData.studyId = generateStudyId();
    }
    
    formData.label = title;
    formData.edc = 'VCA-STUDY';
    
    try {
        // Use PUT for updates, POST for new drafts
        const method = currentStudyId ? 'PUT' : 'POST';
        const url = currentStudyId ? `/api/studies/${encodeURIComponent(currentStudyId)}` : '/api/studies';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            // Save to localStorage
            localStorage.setItem('studyDraft', JSON.stringify(formData));
            
            // Update current study ID if this was a new draft
            if (!currentStudyId) {
                currentStudyId = formData.studyId;
            }
            
            // Reset unsaved changes flag
            resetUnsavedChanges();
        } else {
            const error = await response.json();
            alert('Failed to save draft: ' + (error.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error saving draft:', error);
        alert('Failed to save draft. Please try again.');
    }
}

async function publishStudy() {
    const title = document.getElementById('formTitle').value;
    
    if (!title.trim()) {
        alert('Please enter a study title before publishing.');
        return;
    }
    
    if (questions.length === 0) {
        alert('Please add at least one question before publishing.');
        return;
    }
    
    const confirmMessage = currentStudyId 
        ? `Are you sure you want to publish "${title}"?\n\nThis will update the study status to Published.`
        : `Are you sure you want to publish "${title}"?\n\nThis will save the study to the system.`;
    
    if (confirm(confirmMessage)) {
        const formData = getFormData();
        formData.publishedAt = new Date().toISOString();
        formData.status = 'Published';
        
        // Use existing study ID or generate a new one using timestamp
        if (currentStudyId) {
            formData.studyId = currentStudyId;
        } else if (!formData.studyId) {
            formData.studyId = generateStudyId();
        }
        
        formData.label = title;
        formData.edc = 'VCA-STUDY';
        
        console.log('Publishing study with status:', formData.status);
        console.log('Study ID:', formData.studyId);
        
        try {
            // Use PUT for updates, POST for new studies
            const method = currentStudyId ? 'PUT' : 'POST';
            const url = currentStudyId ? `/api/studies/${encodeURIComponent(currentStudyId)}` : '/api/studies';
            
            console.log('Using method:', method, 'URL:', url);
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                const successMessage = currentStudyId 
                    ? '✓ Study published successfully!\n\nRedirecting to Study Management...'
                    : '✓ Study published successfully!\n\nRedirecting to Study Management...';
                alert(successMessage);
                // Clear localStorage draft
                localStorage.removeItem('studyDraft');
                // Redirect to study management page
                window.location.href = '/studymanagement';
            } else {
                const error = await response.json();
                alert('Failed to publish study: ' + (error.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error publishing study:', error);
            alert('Failed to publish study. Please try again.');
        }
    }
}

// Helper function to get all form data
function getFormData() {
    const titleElement = document.getElementById('formTitle');
    const descriptionElement = document.getElementById('formDescription');
    const instructionTitleElement = document.getElementById('instructionTitle');
    const instructionTextElement = document.getElementById('instructionText');
    
    // Collect selfie configuration
    const selfieNeeded = document.getElementById('selfieNeeded')?.checked || false;
    let selfieConfig = null;
    
    if (selfieNeeded) {
        selfieConfig = {
            enabled: true,
            language: document.getElementById('selfieLanguage')?.value || 'en',
            camera: document.getElementById('selfieCamera')?.value || 'FRONT',
            askedZone: document.getElementById('askedZone')?.value || 'FRONT_FACE',
            autoTake: document.getElementById('autoTake')?.checked || false,
            showTutorial: document.getElementById('showTutorial')?.checked || false,
            validations: {}
        };
        
        // Check if custom validations are enabled
        const validationsEnabled = document.getElementById('enableValidations')?.checked || false;
        
        if (validationsEnabled) {
            // Light validation
            if (document.getElementById('lightValidation')?.checked) {
                selfieConfig.validations.light = {
                    brightnessMin: parseInt(document.getElementById('brightMin')?.value) || 90,
                    brightnessMax: parseInt(document.getElementById('brightMax')?.value) || 200,
                    lightingValue: parseInt(document.getElementById('lightingValue')?.value) || 70,
                    lightColorValue: parseInt(document.getElementById('lightColorValue')?.value) || 20
                };
            }
            
            // Distance validation
            if (document.getElementById('distanceValidation')?.checked) {
                selfieConfig.validations.distance = {
                    far: parseInt(document.getElementById('distanceFar')?.value) || 10,
                    close: parseInt(document.getElementById('distanceClose')?.value) || 30
                };
            }
            
            // Tilt validation
            if (document.getElementById('tiltValidation')?.checked) {
                selfieConfig.validations.tilt = {
                    pitchMin: parseInt(document.getElementById('pitchMin')?.value) || -25,
                    pitchMax: parseInt(document.getElementById('pitchMax')?.value) || 25,
                    rollMin: parseInt(document.getElementById('rollMin')?.value) || -20,
                    rollMax: parseInt(document.getElementById('rollMax')?.value) || 20,
                    yawMin: parseInt(document.getElementById('yawMin')?.value) || -20,
                    yawMax: parseInt(document.getElementById('yawMax')?.value) || 20,
                    rightProfile: parseInt(document.getElementById('rightProfile')?.value) || -35,
                    leftProfile: parseInt(document.getElementById('leftProfile')?.value) || 35
                };
            }
            
            // Expression validation
            if (document.getElementById('expressionValidation')?.checked) {
                selfieConfig.validations.expression = {
                    smileRatio: parseFloat(document.getElementById('smileRatio')?.value) || 0.47,
                    eyebrowHeight: parseFloat(document.getElementById('eyebrowHeight')?.value) || 0.9
                };
            }
            
            // Eyes validation
            if (document.getElementById('eyesValidation')?.checked) {
                selfieConfig.validations.eyes = {
                    eyeCloseThreshold: parseFloat(document.getElementById('eyeClose')?.value) || 0.15
                };
            }
        }
    }
    
    const formData = {
        title: titleElement ? titleElement.value : 'Untitled Study',
        description: descriptionElement ? descriptionElement.value : '',
        instructionTitle: instructionTitleElement ? instructionTitleElement.value : '',
        instructionText: instructionTextElement ? instructionTextElement.value : '',
        questions: questions,
        selfieConfig: selfieConfig,
        participantCodes: participantCodes || [], // Include participant codes
        version: '1.0'
    };
    
    // Only set createdAt for new studies
    if (!currentStudyId) {
        formData.createdAt = new Date().toISOString();
    }
    
    return formData;
}

// Download data as JSON file
function downloadJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Load study from JSON file
function loadFromJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                loadStudyData(data);
                alert('✓ Study loaded successfully!');
            } catch (error) {
                alert('Error loading study: Invalid JSON file.\n\n' + error.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Load study data into the form
function loadStudyData(data) {
    // Load form fields
    document.getElementById('formTitle').value = data.title || '';
    document.getElementById('formDescription').value = data.description || '';
    
    // Update the study title header
    const titleDisplay = document.getElementById('studyTitleDisplay');
    if (titleDisplay) {
        titleDisplay.textContent = data.title || 'New Study';
    }
    
    // Load customer instruction fields
    const instructionTitleElement = document.getElementById('instructionTitle');
    const instructionTextElement = document.getElementById('instructionText');
    if (instructionTitleElement) instructionTitleElement.value = data.instructionTitle || '';
    if (instructionTextElement) instructionTextElement.value = data.instructionText || '';
    
    // Load settings
    if (data.settings) {
        document.getElementById('startDate').value = data.settings.startDate || '';
        document.getElementById('endDate').value = data.settings.endDate || '';
        document.getElementById('responseLimit').value = data.settings.responseLimit || '';
        document.getElementById('themeColor').value = data.settings.themeColor || '#10b981';
    }
    
    // Clear existing questions
    questions = [];
    document.getElementById('questionsContainer').innerHTML = '';
    
    // Load questions
    if (data.questions && Array.isArray(data.questions)) {
        questionIdCounter = 1;
        data.questions.forEach(q => {
            const question = {
                id: questionIdCounter++,
                type: q.type,
                text: q.text,
                required: q.required || false,
                options: q.options || [],
                logic: q.logic || null
            };
            
            if (q.maxRating) {
                question.maxRating = q.maxRating;
            }
            
            questions.push(question);
            renderQuestion(question);
        });
    }
    
    // Load selfie configuration
    if (data.selfieConfig) {
        const selfieNeededCheckbox = document.getElementById('selfieNeeded');
        if (selfieNeededCheckbox) {
            selfieNeededCheckbox.checked = data.selfieConfig.required || false;
            
            // Trigger change event to show/hide config options
            const configOptions = document.getElementById('selfieConfigOptions');
            if (configOptions) {
                configOptions.style.display = data.selfieConfig.required ? 'block' : 'none';
            }
        }
        
        // Load selfie endpoints
        const selfieEndpointsElement = document.getElementById('selfieEndpoints');
        if (selfieEndpointsElement) {
            selfieEndpointsElement.value = data.selfieConfig.endpoints || '';
        }
    }
    
    // Load participant codes
    if (data.participantCodes && Array.isArray(data.participantCodes)) {
        participantCodes = data.participantCodes;
        // Refresh the table if on participants tab
        if (typeof refreshCodesTable === 'function') {
            refreshCodesTable();
        }
    }
    
    updatePreview();
}

function showPreview() {
    window.open('/studypreview', '_blank');
}

// Load initial content (either saved draft or sample question)
function loadInitialContent() {
    const savedDraft = localStorage.getItem('studyDraft');
    if (savedDraft) {
        if (confirm('A saved draft was found. Would you like to load it?')) {
            try {
                const data = JSON.parse(savedDraft);
                loadStudyData(data);
                return;
            } catch (error) {
                console.error('Error loading draft:', error);
                alert('Error loading saved draft. Starting with a new study.');
            }
        }
    }
    
    // Load sample question if no draft was loaded
    loadSampleQuestion();
}

// Load sample question
function loadSampleQuestion() {
    addQuestion('text');
    updateQuestionText(questions[0].id, 'What is your age?');
}

// Clear study form for creating a new study from scratch
function clearStudyForm() {
    // Clear localStorage draft
    localStorage.removeItem('studyDraft');
    
    // Reset all form fields
    document.getElementById('formTitle').value = '';
    document.getElementById('formDescription').value = '';
    
    // Clear all questions
    questions = [];
    questionIdCounter = 1;
    currentStudyId = null;
    
    // Clear the questions container
    const questionsContainer = document.getElementById('questionsContainer');
    if (questionsContainer) {
        questionsContainer.innerHTML = '';
    }
    
    // Reset button text to create mode
    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) {
        publishBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publish Study';
    }
    
    // Update preview
    updatePreview();
    
    console.log('Study form cleared - starting fresh');
}

// Show JSON format help
function showJSONHelp() {
    const helpMessage = `
📄 STUDY JSON FORMAT GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The Study Design tool exports studies in JSON format for easy storage and sharing.

🔹 WORKFLOW:
1. Click "Save Draft" - Downloads JSON + saves to localStorage
2. Click "Publish Study" - Downloads final JSON with publish timestamp
3. Click "Load Study" - Import any previously saved JSON file

🔹 JSON STRUCTURE:
{
  "title": "Study name",
  "description": "Study description",
  "settings": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "responseLimit": "100",
    "themeColor": "#10b981"
  },
  "questions": [
    {
      "id": 1,
      "type": "short-text",
      "text": "Question text",
      "required": true,
      "options": [],
      "logic": null
    }
  ],
  "version": "1.0",
  "createdAt": "2024-01-01T00:00:00.000Z"
}

🔹 QUESTION TYPES:
• short-text, long-text
• single-choice, multiple-choice, dropdown
• rating, likert, ranking
• date, time, number
• file-upload, section-break

🔹 USING THE JSON:
• Store in version control (Git)
• Share with team members
• Deploy to survey platforms
• Archive study designs
• Backup important studies

💡 TIP: Keep JSON files organized by study name and date!
    `;
    
    alert(helpMessage);
}
