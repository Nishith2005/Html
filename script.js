document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const maleBody = document.getElementById('maleBody');
  const femaleBody = document.getElementById('femaleBody');
  const showMaleBtn = document.getElementById('showMaleBtn');
  const showFemaleBtn = document.getElementById('showFemaleBtn');
  const qaModal = document.getElementById('qaModal');
  const closeModalBtn = qaModal.querySelector('.close-btn');
  const questionTextEl = document.getElementById('questionText');
  const answerOptionsEl = document.getElementById('answerOptions');
  const modalTitleEl = document.getElementById('modalTitle');
  const resultTextEl = document.getElementById('resultText');
  const resultAreaEl = document.getElementById('resultArea');

  let currentBodyPartName = ''; // Keep track of the clicked part name
  let diagnosisTree = {}; // Will be fetched from the backend

  // Maps SVG element ID prefixes to starting question nodes
  const partToQuestionMap = {
    'head': 'head_start',
    'neck': 'neck_start',
    'torso': 'torso_start', // Use this general one if chest/abdomen aren't separate clicks
    'chest': 'chest_q_pain_location', // Example if chest *is* clickable separately
    'abdomen': 'abdomen_q_pain_location', // Example if abdomen *is* clickable separately
    'arm-left': 'arm_start',
    'arm-right': 'arm_start',
    'leg-left': 'leg_start',
    'leg-right': 'leg_start'
    // Add more mappings as needed
  };


  // --- Event Listeners ---

  // Body switcher
  showMaleBtn.addEventListener('click', () => switchBody('male'));
  showFemaleBtn.addEventListener('click', () => switchBody('female'));

  // Clicking on body parts (Event Delegation on containers)
  maleBody.addEventListener('click', handleBodyPartClick);
  femaleBody.addEventListener('click', handleBodyPartClick);

  // Closing the modal
  closeModalBtn.addEventListener('click', closeModal);
  qaModal.addEventListener('click', (event) => {
    // Close if clicked on the background overlay
    if (event.target === qaModal) {
      closeModal();
    }
  });

  // Handling clicks on answer buttons (Event Delegation on answer container)
  answerOptionsEl.addEventListener('click', handleAnswerClick);


  // --- Functions ---

  function switchBody(bodyType) {
    if (bodyType === 'male') {
      maleBody.classList.add('visible');
      femaleBody.classList.remove('visible');
      showMaleBtn.classList.add('active');
      showFemaleBtn.classList.remove('active');
    } else {
      femaleBody.classList.add('visible');
      maleBody.classList.remove('visible');
      showFemaleBtn.classList.add('active');
      showMaleBtn.classList.remove('active');
    }
    // Reset result text when switching bodies
    resultTextEl.textContent = 'Click on a body part to start.';
    resultTextEl.style.fontWeight = 'normal';
    resultTextEl.style.color = '#555';
  }

  function handleBodyPartClick(event) {
    const clickedPart = event.target.closest('.body-part'); // Find the closest parent with class 'body-part'
    if (!clickedPart) return; // Exit if click wasn't on a designated part

    const partId = clickedPart.id; // e.g., "male-head" or "female-arm-left"
    currentBodyPartName = clickedPart.dataset.partName || 'Selected Area'; // Get readable name

    // Determine the base part name (e.g., 'head' from 'male-head')
    let basePartId = partId.replace('male-', '').replace('female-', '');

    // Find the starting question ID from the map
    const startQuestionId = partToQuestionMap[basePartId];

    if (startQuestionId && diagnosisTree[startQuestionId]) {
      resultTextEl.textContent = 'Follow the questions in the pop-up...'; // Update result area placeholder
      resultTextEl.style.fontWeight = 'normal';
      resultTextEl.style.color = '#555';
      askQuestion(startQuestionId);
      modalTitleEl.textContent = `Regarding your ${currentBodyPartName}`;
      qaModal.style.display = 'block';
    } else {
      console.warn(`No question mapping found for part ID: ${partId} (base: ${basePartId})`);
      resultTextEl.textContent = `No specific questions available for ${currentBodyPartName} yet.`;
      resultTextEl.style.fontWeight = 'bold';
      resultTextEl.style.color = '#cc0000'; // Indicate an issue/missing path
    }
  }

  function askQuestion(questionId) {
    const node = diagnosisTree[questionId];
    if (!node || !node.question) {
      console.error(`Invalid questionId or node structure: ${questionId}`);
      showDiagnosis({ diagnosis: "An error occurred in the question flow. Please consult a doctor." });
      return;
    }

    questionTextEl.textContent = node.question;
    answerOptionsEl.innerHTML = ''; // Clear previous options

    // Create buttons for each answer
    for (const answerText in node.answers) {
      const button = document.createElement('button');
      button.textContent = answerText;
      // Store the next step (either next question ID or diagnosis object) in a data attribute
      button.dataset.next = JSON.stringify(node.answers[answerText]);
      answerOptionsEl.appendChild(button);
    }
  }

  function handleAnswerClick(event) {
    if (event.target.tagName !== 'BUTTON') return; // Only process button clicks

    const nextStepData = JSON.parse(event.target.dataset.next);

    if (typeof nextStepData === 'string') {
      // It's an ID for the next question
      askQuestion(nextStepData);
    } else if (typeof nextStepData === 'object' && nextStepData.diagnosis) {
      // It's a diagnosis object
      showDiagnosis(nextStepData);
    } else {
      console.error('Invalid next step data:', nextStepData);
      showDiagnosis({ diagnosis: "Error processing answer. Please consult a doctor." });
    }
  }


  function showDiagnosis(diagnosisData) {
    resultTextEl.textContent = diagnosisData.diagnosis;
    resultTextEl.style.fontWeight = 'bold'; // Make diagnosis stand out
    resultTextEl.style.color = '#0056b3'; // Use a distinct color for diagnosis
    closeModal();
  }

  function closeModal() {
    // Add fade-out animation class
    qaModal.classList.add('fade-out');

    // Wait for animation to finish before hiding
    setTimeout(() => {
      qaModal.style.display = 'none';
      qaModal.classList.remove('fade-out'); // Remove class for next time
      // Optional: Clear modal content when closed
      questionTextEl.textContent = '';
      answerOptionsEl.innerHTML = '';
      modalTitleEl.textContent = 'Question';
    }, 300); // Match timeout to CSS animation duration
  }

  // --- Functions ---

  async function fetchDiagnosisTree() {
    try {
      const response = await fetch('http://localhost:5000/api/quiz');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      diagnosisTree = await response.json();
      console.log('Diagnosis tree loaded successfully.');
    } catch (error) {
      console.error('Failed to load diagnosis tree:', error);
      resultTextEl.textContent = 'Failed to load questions. Please try refreshing the page.';
      resultTextEl.style.color = '#cc0000';
    }
  }

  // --- Initial Setup ---
  switchBody('male'); // Start with the male body visible
  fetchDiagnosisTree(); // Fetch the data when the page loads

}); // End DOMContentLoaded
