const frontViewBtn = document.getElementById('front-view-btn');
const backViewBtn = document.getElementById('back-view-btn');
const frontView = document.getElementById('front-view');
const backView = document.getElementById('back-view');
const infoPanel = document.getElementById('info-panel');
const diagnosticFlow = document.getElementById('diagnostic-flow');
const resultsContainer = document.getElementById('results-container');
const notificationContainer = document.getElementById('notification-container');
const notificationMessage = document.getElementById('notification-message');
const dismissNotificationBtn = document.getElementById('dismiss-notification');
const notificationOverlay = document.getElementById('notification-overlay');
const tooltip = document.getElementById('tooltip');
const hotspots = document.querySelectorAll('#front-view .hotspot');
const backButtons = document.querySelectorAll('.back-btn-animated');
let isDiagnosisInProgress = false;
function showNotification(message) {
  notificationMessage.textContent = message;
  notificationContainer.style.display = 'flex';
  notificationOverlay.style.display = 'block';
  dismissNotificationBtn.focus();
}
function hideNotification() {
  notificationContainer.style.display = 'none';
  notificationOverlay.style.display = 'none';
}
dismissNotificationBtn.addEventListener('click', hideNotification);
function disableBodyPartInteractions() {
  hotspots.forEach(h => {
    h.classList.add('interaction-disabled');
    h.classList.remove('pulse');
    const originalSrc = h.getAttribute('data-original-src');
    if (originalSrc) h.src = originalSrc;
  });
  backButtons.forEach(b => {
    b.classList.add('disabled');
    b.classList.remove('pulse');
  });
  frontViewBtn.classList.add('interaction-disabled-button');
  backViewBtn.classList.add('interaction-disabled-button');
}
function enableBodyPartInteractions() {
  hotspots.forEach(h => {
    h.classList.remove('interaction-disabled');
    if (!h.getAttribute('data-original-src')) {
        h.setAttribute('data-original-src', h.src);
    }
    h.classList.add('pulse');
  });
  backButtons.forEach(b => {
    b.classList.remove('disabled');
  });
  frontViewBtn.classList.remove('interaction-disabled-button', 'disabled');
  backViewBtn.classList.remove('interaction-disabled-button', 'disabled');
}
frontViewBtn.addEventListener('click', () => {
  if (isDiagnosisInProgress) {
    showNotification("Please complete the current diagnosis or restart before switching views.");
    return;
  }
  frontViewBtn.classList.add('active');
  backViewBtn.classList.remove('active');
  frontView.style.display = 'block';
  backView.style.display = 'none';
  resetDiagnosticFlow();
});
backViewBtn.addEventListener('click', () => {
  if (isDiagnosisInProgress) {
    showNotification("Please complete the current diagnosis or restart before switching views.");
    return;
  }
  backViewBtn.classList.add('active');
  frontViewBtn.classList.remove('active');
  backView.style.display = 'block';
  frontView.style.display = 'none';
  resetDiagnosticFlow();
});
hotspots.forEach(hotspot => {
  if (!hotspot.getAttribute('data-original-src')) {
    hotspot.setAttribute('data-original-src', hotspot.src);
  }
  const originalSrc = hotspot.getAttribute('data-original-src');
  const hoverSrc = originalSrc.replace('.png', '_Hover.png');
  hotspot.addEventListener('mouseenter', (event) => {
    const tooltipText = hotspot.alt;
    tooltip.textContent = tooltipText;
    tooltip.style.left = (event.pageX + 15) + 'px';
    tooltip.style.top = (event.pageY + 15) + 'px';
    tooltip.classList.add('visible');
    if (hotspot.classList.contains('interaction-disabled')) return;
    const img = new Image();
    img.src = hoverSrc;
    img.onload = () => {
      hotspot.src = hoverSrc;
    };
    img.onerror = () => {
      hotspot.src = originalSrc;
    };
  });
  hotspot.addEventListener('mousemove', (event) => {
    if (tooltip.classList.contains('visible')) {
        tooltip.style.left = (event.pageX + 15) + 'px';
        tooltip.style.top = (event.pageY + 15) + 'px';
    }
  });
  hotspot.addEventListener('mouseleave', () => {
    tooltip.classList.remove('visible');
    hotspot.src = originalSrc;
  });
  hotspot.addEventListener('click', () => {
    if (hotspot.classList.contains('interaction-disabled') || isDiagnosisInProgress) {
      showNotification("Please complete the current diagnosis or restart before interacting with other parts.");
      return;
    }
    const bodyPart = hotspot.getAttribute('data-part');
    if (bodyPart) {
      startDiagnosticFlow(bodyPart);
      infoPanel.classList.add('active');
    }
  });
});
backButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (button.classList.contains('disabled') || isDiagnosisInProgress) {
      showNotification("Please complete the current diagnosis or restart before interacting with other parts.");
      return;
    }
    const bodyPart = button.getAttribute('data-part');
    if (bodyPart) {
      startDiagnosticFlow(bodyPart);
      infoPanel.classList.add('active');
    }
  });
})
let diagnosticQuestions = {};
let diagnosticOutcomes = {};
let currentBodyPart = null;
let currentQuestionIndex = 0;
let userResponses = [];

async function fetchDiagnosticData(bodyPart) {
  try {
    const response = await fetch(`http://localhost:5000/api/questions/${bodyPart}`);
    if (!response.ok) {
      throw new Error('Failed to fetch diagnostic data');
    }
    const data = await response.json();
    diagnosticQuestions[bodyPart] = data.questions;
    diagnosticOutcomes[bodyPart] = data.outcomes;
    return true;
  } catch (error) {
    console.error('Error fetching diagnostic data:', error);
    showNotification('Failed to load diagnostic questions. Please try again later.');
    return false;
  }
}

async function saveDiagnosis(bodyPart, condition, description, severity) {
  const token = localStorage.getItem('token');
  if (!token) {
    showNotification('You must be logged in to save your diagnosis history.');
    setTimeout(() => {
      window.location.href = 'user_login.html';
    }, 2500);
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/diagnoses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
      },
      body: JSON.stringify({
        bodyPart,
        condition,
        description,
        severity,
      }),
    });

    if (response.ok) {
      showNotification('Diagnosis saved successfully!');
    } else {
      const errorData = await response.json();
      showNotification(`Failed to save diagnosis: ${errorData.msg || 'Server error'}`);
    }
  } catch (error) {
    console.error('Error saving diagnosis:', error);
    showNotification('An error occurred while saving the diagnosis.');
  }
}

async function startDiagnosticFlow(bodyPart) {
  if (isDiagnosisInProgress) {
    showNotification("Please complete the current diagnosis or restart before starting a new one.");
    return;
  }
  isDiagnosisInProgress = true;
  disableBodyPartInteractions();

  const success = await fetchDiagnosticData(bodyPart);
  if (!success) {
    isDiagnosisInProgress = false;
    enableBodyPartInteractions();
    return;
  }

  currentBodyPart = bodyPart;
  currentQuestionIndex = 0;
  userResponses = [];
  diagnosticFlow.innerHTML = '';
  resultsContainer.innerHTML = '';
  diagnosticFlow.classList.add('active');
  resultsContainer.classList.remove('active');
  infoPanel.querySelector('h2').textContent = `Diagnosing ${bodyPart.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
  infoPanel.querySelectorAll('.info-text').forEach(p => p.style.display = 'none');
  renderQuestion();
}
function renderQuestion() {
  const questions = diagnosticQuestions[currentBodyPart];
  if (!questions || currentQuestionIndex >= questions.length) {
    showResults();
    return;
  }
  const question = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  const questionHTML = `
    <div class="question-container" role="region" aria-label="Diagnostic question ${currentQuestionIndex + 1}">
      <div class="progress-bar-container">
        <div class="progress-bar-indicator" style="width: ${progressPercentage}%;"></div>
      </div>
      <div class="progress-indicator">Question ${currentQuestionIndex + 1} of ${questions.length}</div>
      <div class="question">${question.text}</div>
      <div class="options">
        ${question.options.map(opt => `
          <button class="animated-button option" data-option="${opt.toLowerCase()}" aria-label="Select ${opt}">
            <svg viewBox="0 0 24 24" class="arr-2" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
            </svg>
            <span class="text">${opt}</span>
            <span class="circle"></span>
            <svg viewBox="0 0 24 24" class="arr-1" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
            </svg>
          </button>
        `).join('')}
      </div>
      <button class="animated-button ${isLastQuestion ? 'show-results-btn-animated' : 'next-btn-animated'} action-button-margin disabled"
              aria-label="${isLastQuestion ? 'Show diagnostic results' : 'Proceed to next question'}">
        <svg viewBox="0 0 24 24" class="arr-2" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
        </svg>
        <span class="text">${isLastQuestion ? 'Show Results' : 'Next'}</span>
        <span class="circle"></span>
        <svg viewBox="0 0 24 24" class="arr-1" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
        </svg>
      </button>
    </div>
  `;
  diagnosticFlow.innerHTML = questionHTML;
  const optionButtonsAnimated = diagnosticFlow.querySelectorAll('.animated-button.option');
  const actionButtonAnimated = diagnosticFlow.querySelector('.next-btn-animated, .show-results-btn-animated');
  optionButtonsAnimated.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('disabled')) return;
      optionButtonsAnimated.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      actionButtonAnimated.classList.remove('disabled');
      userResponses[currentQuestionIndex] = btn.getAttribute('data-option');
    });
  });
  actionButtonAnimated.addEventListener('click', () => {
    if (actionButtonAnimated.classList.contains('disabled')) return;
    if (isLastQuestion) {
      showResults();
    } else {
      currentQuestionIndex++;
      renderQuestion();
    }
  });
}
function showResults() {
  const responseKey = userResponses.join('').toLowerCase();
  let outcomes = [];
  const defaultOutcome = [{ name: 'Consult Healthcare Professional', description: 'Your combination of symptoms requires a professional evaluation for an accurate diagnosis.', severity: 'medium', wiki: '' }];
  if (diagnosticOutcomes[currentBodyPart] && diagnosticOutcomes[currentBodyPart][responseKey]) {
    outcomes = diagnosticOutcomes[currentBodyPart][responseKey];
  } else {
    outcomes = defaultOutcome;
  }
  if (!Array.isArray(outcomes)) {
      outcomes = [outcomes];
  }
  if (outcomes.length === 0) {
      outcomes = defaultOutcome;
  }
  diagnosticFlow.classList.remove('active');
  diagnosticFlow.innerHTML='';
  resultsContainer.classList.add('active');
  infoPanel.querySelector('h2').textContent = 'Possible Conditions';
  const resultsHTML = outcomes.map((outcome, index) => `
    <div class="diagnosis-card ${outcome.severity === 'critical' ? 'critical-alert' : ''}" style="transition-delay: ${index * 0.2}s">
      <div class="diagnosis-name">${outcome.name}</div>
      <div class="diagnosis-desc">${outcome.description}</div>
      <div class="severity ${outcome.severity}">${outcome.severity.charAt(0).toUpperCase() + outcome.severity.slice(1)} Severity</div>
      ${outcome.wiki ? `<a href="${outcome.wiki}" target="_blank" class="wiki-link" aria-label="Learn more about ${outcome.name} on Wikipedia">Learn More</a>` : ''}
      <button class="animated-button save-btn" data-condition="${outcome.name}" data-description="${outcome.description}" data-severity="${outcome.severity}"><span class="text">Save Diagnosis</span></button>
    </div>
  `).join('');
  resultsContainer.innerHTML = `
    ${resultsHTML}
    <button class="restart-btn active" aria-label="Restart diagnosis">
      <i class="fas fa-redo"></i> Restart Diagnosis
    </button>
  `;
  const cards = resultsContainer.querySelectorAll('.diagnosis-card');
  requestAnimationFrame(() => {
    cards.forEach(card => card.classList.add('active'));
  });
}
function resetDiagnosticFlow() {
  isDiagnosisInProgress = false;
  enableBodyPartInteractions();
  currentBodyPart = null;
  currentQuestionIndex = 0;
  userResponses = [];
  diagnosticFlow.innerHTML = '';
  resultsContainer.innerHTML = '';
  diagnosticFlow.classList.remove('active');
  resultsContainer.classList.remove('active');
  infoPanel.classList.remove('active');
  infoPanel.querySelector('h2').textContent = 'Welcome to the Interactive Diagnostic Tool';
  infoPanel.querySelectorAll('.info-text').forEach(p => p.style.display = 'block');
}

resultsContainer.addEventListener('click', function(event) {
    const target = event.target;
    const button = target.closest('button');
    if (!button) return;

    if (button.classList.contains('save-btn')) {
        const condition = button.dataset.condition;
        const description = button.dataset.description;
        const severity = button.dataset.severity;
        saveDiagnosis(currentBodyPart, condition, description, severity);
    } else if (button.classList.contains('restart-btn')) {
        resetDiagnosticFlow();
    }
});

enableBodyPartInteractions();
const currentYearSpan = document.getElementById('current-year');
if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
}