// Study Design Form Builder
// ==========================================

let questions = [];
let questionIdCounter = 1;
let currentStudyId = null; // Store the current study ID if editing

// Generate unique study ID using timestamp
function generateStudyId() {
    return Date.now().toString();
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
        document.title = `Edit: ${study.title} - Study Design`;
        // Update the study title header
        const titleDisplay = document.getElementById('studyTitleDisplay');
        if (titleDisplay) {
            titleDisplay.textContent = study.title;
        }
    }
    if (study.description) {
        document.getElementById('formDescription').value = study.description;
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
    
    // When editing, go directly to questionnaire tab
    if (typeof switchTab === 'function') {
        switchTab('questionnaire');
    }
    
    updatePreview();
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
    
    // Selfie configuration validation toggles
    const enableValidationsCheckbox = document.getElementById('enableValidations');
    if (enableValidationsCheckbox) {
        enableValidationsCheckbox.addEventListener('change', function() {
            const validationOptions = document.getElementById('validationOptions');
            if (validationOptions) {
                validationOptions.style.display = this.checked ? 'block' : 'none';
            }
        });
    }
    
    // Individual validation checkboxes
    const validationTypes = ['light', 'distance', 'tilt', 'expression', 'eyes'];
    validationTypes.forEach(type => {
        const checkbox = document.getElementById(`${type}Validation`);
        const thresholds = document.getElementById(`${type}Thresholds`);
        if (checkbox && thresholds) {
            checkbox.addEventListener('change', function() {
                thresholds.style.display = this.checked ? 'block' : 'none';
            });
        }
    });
    
    // Click outside to exit edit mode
    document.addEventListener('click', function(e) {
        // Check if click is outside any question card
        const clickedCard = e.target.closest('.question-card');
        if (!clickedCard) {
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
    questionCard.setAttribute('draggable', 'true');
    
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
                    <button class="question-action-btn" title="Drag to reorder">
                        <i class="fas fa-grip-vertical"></i>
                    </button>
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
        reRenderQuestion(questionId);
        updatePreview();
    }
}

// Remove option from question
function removeOption(questionId, optionIndex) {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options.length > 2) {
        question.options.splice(optionIndex, 1);
        reRenderQuestion(questionId);
        updatePreview();
    }
}

// Update option text
function updateOption(questionId, optionIndex, text) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.options[optionIndex] = text;
        updatePreview();
    }
}

// Update max rating
function updateMaxRating(questionId, value) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.maxRating = parseInt(value);
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
        updatePreview();
    }
}

// Toggle logic
function toggleLogic(questionId, checked) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.logic = checked ? {} : null;
        reRenderQuestion(questionId);
    }
}

// Delete question
function deleteQuestion(questionId) {
    if (confirm('Are you sure you want to delete this question?')) {
        questions = questions.filter(q => q.id !== questionId);
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
// Preview pagination state
let previewCurrentPage = 0;

function updatePreview() {
    const title = document.getElementById('formTitle').value || 'Untitled Study';
    const description = document.getElementById('formDescription').value || 'Add a description for your study...';
    
    document.getElementById('previewTitle').textContent = 'Please answer questions';
    document.getElementById('previewDescription').style.display = 'none';
    
    // Check if instruction page exists - always show instruction page
    const instructionTitle = document.getElementById('instructionTitle')?.value || '';
    const instructionText = document.getElementById('instructionText')?.value || '';
    const hasInstructionPage = true; // Always show instruction page
    
    // Check if selfie is needed
    const selfieNeeded = document.getElementById('selfieNeeded')?.checked || false;
    
    const instructionSection = document.getElementById('previewInstructionSection');
    const previewInstructionTitle = document.getElementById('previewInstructionTitle');
    const previewInstructionText = document.getElementById('previewInstructionText');
    const previewHeader = document.querySelector('.preview-form-header');
    const previewQuestions = document.getElementById('previewQuestions');
    
    // Update instruction content - show empty if no content
    if (previewInstructionTitle) previewInstructionTitle.textContent = instructionTitle;
    if (previewInstructionText) previewInstructionText.textContent = instructionText;
    
    // Filter out section breaks for pagination
    const displayableQuestions = questions.filter(q => q.type !== 'section-break');
    
    // Calculate total pages (instruction page + question pages + selfie page if needed)
    const questionPages = Math.max(1, displayableQuestions.length);
    const totalPages = questionPages + 1 + (selfieNeeded ? 1 : 0); // Instruction + questions + (optionally selfie)
    document.getElementById('previewTotalPages').textContent = totalPages;
    
    // Ensure current page is within bounds
    if (previewCurrentPage >= totalPages) {
        previewCurrentPage = Math.max(0, totalPages - 1);
    }
    
    // Determine if we're on the instruction page or selfie page
    const isInstructionPage = hasInstructionPage && previewCurrentPage === 0;
    const isSelfiePage = selfieNeeded && previewCurrentPage === totalPages - 1;
    
    // Show/hide instruction section vs questionnaire vs selfie
    if (isInstructionPage) {
        // Show instruction page
        if (instructionSection) instructionSection.style.display = 'block';
        if (previewHeader) previewHeader.style.display = 'none';
        if (previewQuestions) previewQuestions.style.display = 'none';
    } else if (isSelfiePage) {
        // Show selfie page - remove padding for full screen
        if (instructionSection) instructionSection.style.display = 'none';
        if (previewHeader) previewHeader.style.display = 'none';
        if (previewQuestions) {
            previewQuestions.style.display = 'block';
            previewQuestions.style.padding = '0';
            previewQuestions.style.position = 'relative';
        }
    } else {
        // Show questionnaire page - restore normal padding
        if (instructionSection) instructionSection.style.display = 'none';
        if (previewHeader) previewHeader.style.display = 'block';
        if (previewQuestions) {
            previewQuestions.style.display = 'block';
            previewQuestions.style.padding = '20px 16px';
            previewQuestions.style.position = 'static';
        }
    }
    
    // Update current page display
    document.getElementById('previewCurrentPage').textContent = previewCurrentPage + 1;
    
    // Update progress bar
    const progressPercentage = totalPages > 0 ? ((previewCurrentPage + 1) / totalPages) * 100 : 0;
    const progressFill = document.getElementById('previewProgressFill');
    if (progressFill) {
        progressFill.style.width = progressPercentage + '%';
    }
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = previewCurrentPage === 0;
    nextBtn.disabled = previewCurrentPage >= totalPages - 1 || totalPages === 0;
    
    // Update next button text
    if (previewCurrentPage >= totalPages - 1) {
        nextBtn.innerHTML = 'Submit <i class="fas fa-check"></i>';
    } else {
        nextBtn.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
    }
    
    // Render current question (only if not on instruction page)
    if (!isInstructionPage) {
        const questionContainer = document.getElementById('previewQuestions');
        questionContainer.innerHTML = '';
        
        if (isSelfiePage) {
            // Show selfie mockup - Fill entire screen
            questionContainer.innerHTML = `
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #000; padding: 0; margin: 0;">
                    <img src="/public/selfiemockup.png" alt="Selfie Capture" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            `;
        } else {
            // Adjust question index if instruction page exists
            const adjustedPage = hasInstructionPage ? previewCurrentPage - 1 : previewCurrentPage;
            
            if (displayableQuestions.length > 0 && adjustedPage >= 0 && adjustedPage < displayableQuestions.length) {
                const question = displayableQuestions[adjustedPage];
                const questionIndex = questions.indexOf(question);
                
                const questionDiv = document.createElement('div');
                questionDiv.className = 'preview-question';
                
                const label = document.createElement('div');
                label.className = 'preview-question-label';
                label.innerHTML = `${questionIndex + 1}. ${question.text || 'Question text'}`;
                if (question.required) {
                    label.innerHTML += ' <span class="required-indicator">*</span>';
                }
                questionDiv.appendChild(label);
                
                const inputDiv = renderPreviewInput(question);
                questionDiv.appendChild(inputDiv);
                
                questionContainer.appendChild(questionDiv);
            } else if (displayableQuestions.length === 0) {
                questionContainer.innerHTML = '<div style="text-align: center; color: #9ca3af; padding: 40px 20px;">No questions added yet</div>';
            }
        }
    }
}

function previewPrevPage() {
    if (previewCurrentPage > 0) {
        previewCurrentPage--;
        updatePreview();
    }
}

function previewNextPage() {
    const displayableQuestions = questions.filter(q => q.type !== 'section-break');
    const selfieNeeded = document.getElementById('selfieNeeded')?.checked || false;
    const totalPages = displayableQuestions.length + 1 + (selfieNeeded ? 1 : 0);
    
    if (previewCurrentPage < totalPages - 1) {
        previewCurrentPage++;
        updatePreview();
    }
}

// Render preview input based on question type
function renderPreviewInput(question) {
    const div = document.createElement('div');
    
    switch (question.type) {
        case 'text':
        case 'short-text':
            div.innerHTML = '<input type="text" class="preview-input" placeholder="Your answer">';
            break;
        case 'long-text':
            div.innerHTML = '<textarea class="preview-input" rows="4" placeholder="Your answer"></textarea>';
            break;
        case 'choice':
        case 'single-choice':
            question.options.forEach(option => {
                div.innerHTML += `
                    <div class="preview-option">
                        <input type="radio" name="q${question.id}">
                        <label>${option}</label>
                    </div>
                `;
            });
            break;
        case 'multiple-choice':
            question.options.forEach(option => {
                div.innerHTML += `
                    <div class="preview-option">
                        <input type="checkbox">
                        <label>${option}</label>
                    </div>
                `;
            });
            break;
        case 'dropdown':
            div.innerHTML = `
                <select class="preview-input">
                    <option>Select an option</option>
                    ${question.options.map(opt => `<option>${opt}</option>`).join('')}
                </select>
            `;
            break;
        case 'rating':
            const maxRating = question.maxRating || 5;
            div.innerHTML = `<div style="display: flex; gap: 8px;">
                ${Array.from({length: maxRating}, (_, i) => 
                    `<i class="far fa-star" style="font-size: 24px; color: #fbbf24; cursor: pointer;"></i>`
                ).join('')}
            </div>`;
            break;
        case 'likert':
            div.style.display = 'flex';
            div.style.flexDirection = 'column';
            div.style.gap = '8px';
            question.options.forEach(option => {
                div.innerHTML += `
                    <label class="preview-option">
                        <input type="radio" name="q${question.id}">
                        ${option}
                    </label>
                `;
            });
            break;
        case 'date':
            div.innerHTML = '<input type="date" class="preview-input">';
            break;
        case 'time':
            div.innerHTML = '<input type="time" class="preview-input">';
            break;
        case 'file-upload':
            div.innerHTML = '<input type="file" class="preview-input">';
            break;
        case 'number':
            div.innerHTML = '<input type="number" class="preview-input" placeholder="Enter a number">';
            break;
        case 'ranking':
            div.innerHTML = `<div style="background: white; padding: 12px; border-radius: 8px;">
                ${question.options.map((opt, i) => `
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--bg-secondary); margin-bottom: 6px; border-radius: 6px;">
                        <i class="fas fa-grip-vertical" style="color: var(--text-secondary);"></i>
                        <span>${i + 1}.</span>
                        <span>${opt}</span>
                    </div>
                `).join('')}
            </div>`;
            break;
    }
    
    return div;
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
            
            alert('✓ Draft saved successfully!\n\nThe study has been saved as a draft.');
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
            selfieNeededCheckbox.checked = data.selfieConfig.enabled || false;
            
            // Trigger change event to show/hide config options
            const configOptions = document.getElementById('selfieConfigOptions');
            if (configOptions) {
                configOptions.style.display = data.selfieConfig.enabled ? 'block' : 'none';
            }
        }
        
        if (data.selfieConfig.enabled) {
            // Load basic configuration
            if (document.getElementById('selfieLanguage')) {
                document.getElementById('selfieLanguage').value = data.selfieConfig.language || 'en';
            }
            if (document.getElementById('selfieCamera')) {
                document.getElementById('selfieCamera').value = data.selfieConfig.camera || 'FRONT';
            }
            if (document.getElementById('askedZone')) {
                document.getElementById('askedZone').value = data.selfieConfig.askedZone || 'FRONT_FACE';
            }
            if (document.getElementById('autoTake')) {
                document.getElementById('autoTake').checked = data.selfieConfig.autoTake || false;
            }
            if (document.getElementById('showTutorial')) {
                document.getElementById('showTutorial').checked = data.selfieConfig.showTutorial || false;
            }
            
            // Load validations
            if (data.selfieConfig.validations && Object.keys(data.selfieConfig.validations).length > 0) {
                const enableValidationsCheckbox = document.getElementById('enableValidations');
                if (enableValidationsCheckbox) {
                    enableValidationsCheckbox.checked = true;
                    const validationOptions = document.getElementById('validationOptions');
                    if (validationOptions) {
                        validationOptions.style.display = 'block';
                    }
                }
                
                // Light validation
                if (data.selfieConfig.validations.light) {
                    const lightCheckbox = document.getElementById('lightValidation');
                    if (lightCheckbox) {
                        lightCheckbox.checked = true;
                        const lightThresholds = document.getElementById('lightThresholds');
                        if (lightThresholds) lightThresholds.style.display = 'block';
                    }
                    document.getElementById('brightMin').value = data.selfieConfig.validations.light.brightnessMin || 90;
                    document.getElementById('brightMax').value = data.selfieConfig.validations.light.brightnessMax || 200;
                    document.getElementById('lightingValue').value = data.selfieConfig.validations.light.lightingValue || 70;
                    document.getElementById('lightColorValue').value = data.selfieConfig.validations.light.lightColorValue || 20;
                }
                
                // Distance validation
                if (data.selfieConfig.validations.distance) {
                    const distanceCheckbox = document.getElementById('distanceValidation');
                    if (distanceCheckbox) {
                        distanceCheckbox.checked = true;
                        const distanceThresholds = document.getElementById('distanceThresholds');
                        if (distanceThresholds) distanceThresholds.style.display = 'block';
                    }
                    document.getElementById('distanceFar').value = data.selfieConfig.validations.distance.far || 10;
                    document.getElementById('distanceClose').value = data.selfieConfig.validations.distance.close || 30;
                }
                
                // Tilt validation
                if (data.selfieConfig.validations.tilt) {
                    const tiltCheckbox = document.getElementById('tiltValidation');
                    if (tiltCheckbox) {
                        tiltCheckbox.checked = true;
                        const tiltThresholds = document.getElementById('tiltThresholds');
                        if (tiltThresholds) tiltThresholds.style.display = 'block';
                    }
                    document.getElementById('pitchMin').value = data.selfieConfig.validations.tilt.pitchMin || -25;
                    document.getElementById('pitchMax').value = data.selfieConfig.validations.tilt.pitchMax || 25;
                    document.getElementById('rollMin').value = data.selfieConfig.validations.tilt.rollMin || -20;
                    document.getElementById('rollMax').value = data.selfieConfig.validations.tilt.rollMax || 20;
                    document.getElementById('yawMin').value = data.selfieConfig.validations.tilt.yawMin || -20;
                    document.getElementById('yawMax').value = data.selfieConfig.validations.tilt.yawMax || 20;
                    document.getElementById('rightProfile').value = data.selfieConfig.validations.tilt.rightProfile || -35;
                    document.getElementById('leftProfile').value = data.selfieConfig.validations.tilt.leftProfile || 35;
                }
                
                // Expression validation
                if (data.selfieConfig.validations.expression) {
                    const expressionCheckbox = document.getElementById('expressionValidation');
                    if (expressionCheckbox) {
                        expressionCheckbox.checked = true;
                        const expressionThresholds = document.getElementById('expressionThresholds');
                        if (expressionThresholds) expressionThresholds.style.display = 'block';
                    }
                    document.getElementById('smileRatio').value = data.selfieConfig.validations.expression.smileRatio || 0.47;
                    document.getElementById('eyebrowHeight').value = data.selfieConfig.validations.expression.eyebrowHeight || 0.9;
                }
                
                // Eyes validation
                if (data.selfieConfig.validations.eyes) {
                    const eyesCheckbox = document.getElementById('eyesValidation');
                    if (eyesCheckbox) {
                        eyesCheckbox.checked = true;
                        const eyesThresholds = document.getElementById('eyesThresholds');
                        if (eyesThresholds) eyesThresholds.style.display = 'block';
                    }
                    document.getElementById('eyeClose').value = data.selfieConfig.validations.eyes.eyeCloseThreshold || 0.15;
                }
            }
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
