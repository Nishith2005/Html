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
const diagnosticQuestions = {
  'left-shoulder': [
    { id: 1, text: 'Is there pain when lifting your arm above your head?', options: ['Yes', 'No'] },
    { id: 2, text: 'Do you experience stiffness or reduced range of motion?', options: ['Yes', 'No'] },
    { id: 3, text: 'Does the pain worsen at night or when resting?', options: ['Yes', 'No'] },
    { id: 4, text: 'Have you noticed any swelling or warmth in the shoulder area?', options: ['Yes', 'No'] }
  ],
  'right-shoulder': [
    { id: 1, text: 'Is there pain when lifting your arm above your head?', options: ['Yes', 'No'] },
    { id: 2, text: 'Do you experience stiffness or reduced range of motion?', options: ['Yes', 'No'] },
    { id: 3, text: 'Does the pain worsen at night or when resting?', options: ['Yes', 'No'] },
    { id: 4, text: 'Have you noticed any swelling or warmth in the shoulder area?', options: ['Yes', 'No'] }
  ],
  'left-hand': [
    { id: 1, text: 'Do you feel tingling or numbness in your fingers?', options: ['Yes', 'No'] },
    { id: 2, text: 'Is there pain or swelling in your wrist?', options: ['Yes', 'No'] },
    { id: 3, text: 'Does gripping objects cause discomfort or weakness?', options: ['Yes', 'No'] },
    { id: 4, text: 'Have you experienced any recent trauma to the hand?', options: ['Yes', 'No'] }
  ],
  'right-hand': [
    { id: 1, text: 'Do you feel tingling or numbness in your fingers?', options: ['Yes', 'No'] },
    { id: 2, text: 'Is there pain or swelling in your wrist?', options: ['Yes', 'No'] },
    { id: 3, text: 'Does gripping objects cause discomfort or weakness?', options: ['Yes', 'No'] },
    { id: 4, text: 'Have you experienced any recent trauma to the hand?', options: ['Yes', 'No'] }
  ],
  'hip': [
    { id: 1, text: 'Do you experience pain when walking or climbing stairs?', options: ['Yes', 'No'] },
    { id: 2, text: 'Is there stiffness in your hip joint?', options: ['Yes', 'No'] },
    { id: 3, text: 'Does the pain radiate to your groin or thigh?', options: ['Yes', 'No'] },
    { id: 4, text: 'Have you noticed a clicking or locking sensation in the hip?', options: ['Yes', 'No'] }
  ],
  'knee': [
    { id: 1, text: 'Do you feel pain when bending or straightening your knee?', options: ['Yes', 'No'] },
    { id: 2, text: 'Is there swelling or warmth around the knee?', options: ['Yes', 'No'] },
    { id: 3, text: 'Does your knee feel unstable or give way?', options: ['Yes', 'No'] },
    { id: 4, text: 'Have you heard a popping sound during movement?', options: ['Yes', 'No'] }
  ],
  'left-foot': [
    { id: 1, text: 'Do you have pain in your heel when walking?', options: ['Yes', 'No'] },
    { id: 2, text: 'Is there swelling or redness in your foot?', options: ['Yes', 'No'] },
    { id: 3, text: 'Does the pain worsen after long periods of standing?', options: ['Yes', 'No'] },
    { id: 4, text: 'Have you noticed any changes in the arch of your foot?', options: ['Yes', 'No'] }
  ],
  'right-foot': [
    { id: 1, text: 'Do you have pain in your heel when walking?', options: ['Yes', 'No'] },
    { id: 2, text: 'Is there swelling or redness in your foot?', options: ['Yes', 'No'] },
    { id: 3, text: 'Does the pain worsen after long periods of standing?', options: ['Yes', 'No'] },
    { id: 4, text: 'Have you noticed any changes in the arch of your foot?', options: ['Yes', 'No'] }
  ],
  'spine': [
    { id: 1, text: 'Do you experience sharp pain in your upper back?', options: ['Yes', 'No'] },
    { id: 2, text: 'Is there stiffness when turning your torso?', options: ['Yes', 'No'] },
    { id: 3, text: 'Does the pain radiate to your chest or arms?', options: ['Yes', 'No'] },
    { id: 4, text: 'Have you noticed any numbness in your upper back?', options: ['Yes', 'No'] }
  ],
  'lower-back': [
    { id: 1, text: 'Do you have pain that radiates to your legs?', options: ['Yes', 'No'] },
    { id: 2, text: 'Is there stiffness in your lower back?', options: ['Yes', 'No'] },
    { id: 3, text: 'Does the pain worsen when sitting for long periods?', options: ['Yes', 'No'] },
    { id: 4, text: 'Have you experienced any muscle spasms in the lower back?', options: ['Yes', 'No'] }
  ],
  'back-shoulder-left': [
    { id: 1, text: 'Is there pain when reaching behind your back?', options: ['Yes', 'No'] },
    { id: 2, text: 'Do you feel stiffness in your shoulder blade?', options: ['Yes', 'No'] },
    { id: 3, text: 'Does the pain increase with overhead activities?', options: ['Yes', 'No'] },
    { id: 4, text: 'Have you noticed any grinding sensation in the shoulder?', options: ['Yes', 'No'] }
  ],
  'back-shoulder-right': [
    { id: 1, text: 'Is there pain when reaching behind your back?', options: ['Yes', 'No'] },
    { id: 2, text: 'Do you feel stiffness in your shoulder blade?', options: ['Yes', 'No'] },
    { id: 3, text: 'Does the pain increase with overhead activities?', options: ['Yes', 'No'] },
    { id: 4, text: 'Have you noticed any grinding sensation in the shoulder?', options: ['Yes', 'No'] }
  ]
};
const diagnosticOutcomes = {
  'left-shoulder': {
    'yesyesyesyes': [    { name: 'Rotator Cuff Tear', description: 'A tear in one or more of the tendons surrounding the shoulder joint.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Rotator_cuff_tear' },
      { name: 'Frozen Shoulder', description: 'Stiffness and pain in the shoulder joint limiting movement.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Adhesive_capsulitis_of_shoulder' }
    ],
    'yesyesyesno': [  { name: 'Rotator Cuff Tear', description: 'A tear in one or more of the tendons surrounding the shoulder joint.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Rotator_cuff_tear' }
    ],
    'yesyesnoyes': [  { name: 'Shoulder Impingement', description: 'Pinching of tendons or bursa in the shoulder during arm movement.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Shoulder_impingement_syndrome' }
    ],
    'yesyesnono': [{ name: 'Shoulder Impingement', description: 'Pinching of tendons or bursa in the shoulder during arm movement.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Shoulder_impingement_syndrome' }
    ],
    'yesnoyesyes': [{ name: 'Bursitis', description: 'Inflammation of the bursa causing pain and swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Bursitis' }
    ],
    'yesnoyesno': [{ name: 'Tendinitis', description: 'Inflammation of the shoulder tendons.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Tendinitis' }
    ],
    'yesnonoyes': [{ name: 'Shoulder Arthritis', description: 'Degeneration of the shoulder joint causing stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }
    ],
    'yesnonono': [{ name: 'Mild Strain', description: 'Minor muscle or tendon strain in the shoulder.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'noyesyesyes': [{ name: 'Frozen Shoulder', description: 'Stiffness and pain in the shoulder joint limiting movement.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Adhesive_capsulitis_of_shoulder' }
    ],
    'noyesyesno': [{ name: 'Shoulder Arthritis', description: 'Degeneration of the shoulder joint causing stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }
    ],
    'noyesnoyes': [{ name: 'Bursitis', description: 'Inflammation of the bursa causing pain and swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Bursitis' }
    ],
    'noyesnono': [{ name: 'Mild Strain', description: 'Minor muscle or tendon strain in the shoulder.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nonoyesyes': [{ name: 'Shoulder Arthritis', description: 'Degeneration of the shoulder joint causing stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }
    ],
    'nonoyesno': [{ name: 'Mild Strain', description: 'Minor muscle or tendon strain in the shoulder.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nononoyes': [{ name: 'Bursitis', description: 'Inflammation of the bursa causing pain and swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Bursitis' }
    ],
    'nononono': [ { name: 'No Significant Issue', description: 'No significant issues detected based on your answers.', severity: 'low', wiki: '' }
    ]
  },
  'right-shoulder': {
    'yesyesyesyes': [{ name: 'Rotator Cuff Tear', description: 'A tear in one or more of the tendons surrounding the shoulder joint.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Rotator_cuff_tear' },
      { name: 'Frozen Shoulder', description: 'Stiffness and pain in the shoulder joint limiting movement.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Adhesive_capsulitis_of_shoulder' }
    ],
    'yesyesyesno': [{ name: 'Rotator Cuff Tear', description: 'A tear in one or more of the tendons surrounding the shoulder joint.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Rotator_cuff_tear' }
    ],
    'yesyesnoyes': [{ name: 'Shoulder Impingement', description: 'Pinching of tendons or bursa in the shoulder during arm movement.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Shoulder_impingement_syndrome' }
    ],
    'yesyesnono': [{ name: 'Shoulder Impingement', description: 'Pinching of tendons or bursa in the shoulder during arm movement.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Shoulder_impingement_syndrome' }
    ],
    'yesnoyesyes': [{ name: 'Bursitis', description: 'Inflammation of the bursa causing pain and swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Bursitis' }
    ],
    'yesnoyesno': [{ name: 'Tendinitis', description: 'Inflammation of the shoulder tendons.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Tendinitis' }
    ],
    'yesnonoyes': [{ name: 'Shoulder Arthritis', description: 'Degeneration of the shoulder joint causing stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }
    ],
    'yesnonono': [{ name: 'Mild Strain', description: 'Minor muscle or tendon strain in the shoulder.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'noyesyesyes': [{ name: 'Frozen Shoulder', description: 'Stiffness and pain in the shoulder joint limiting movement.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Adhesive_capsulitis_of_shoulder' }
    ],
    'noyesyesno': [{ name: 'Shoulder Arthritis', description: 'Degeneration of the shoulder joint causing stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }
    ],
    'noyesnoyes': [{ name: 'Bursitis', description: 'Inflammation of the bursa causing pain and swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Bursitis' }
    ],
    'noyesnono': [{ name: 'Mild Strain', description: 'Minor muscle or tendon strain in the shoulder.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nonoyesyes': [{ name: 'Shoulder Arthritis', description: 'Degeneration of the shoulder joint causing stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }
    ],
    'nonoyesno': [{ name: 'Mild Strain', description: 'Minor muscle or tendon strain in the shoulder.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nononoyes': [{ name: 'Bursitis', description: 'Inflammation of the bursa causing pain and swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Bursitis' }
    ],
    'nononono': [{ name: 'No Significant Issue', description: 'No significant issues detected based on your answers.', severity: 'low', wiki: '' }
    ]
  },
  'left-hand': {
    'yesyesyesyes': [{ name: 'Carpal Tunnel Syndrome', description: 'Compression of the median nerve causing tingling and pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Carpal_tunnel_syndrome' }
    ],
    'yesyesyesno': [{ name: 'Carpal Tunnel Syndrome', description: 'Compression of the median nerve causing tingling and pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Carpal_tunnel_syndrome' }
    ],
    'yesyesnoyes': [{ name: 'Wrist Tendinitis', description: 'Inflammation of the tendons in the wrist causing pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Tendinitis' }
    ],
    'yesyesnono': [{ name: 'Peripheral Neuropathy', description: 'Nerve damage causing tingling in the hands.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Peripheral_neuropathy' }
    ],
    'yesnoyesyes': [{ name: 'Carpal Tunnel Syndrome', description: 'Compression of the median nerve causing tingling and pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Carpal_tunnel_syndrome' }
    ],
    'yesnoyesno': [{ name: 'Peripheral Neuropathy', description: 'Nerve damage causing tingling in the hands.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Peripheral_neuropathy' }
    ],
    'yesnonoyes': [{ name: 'Wrist Sprain', description: 'Ligament injury in the wrist causing pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Sprain' }
    ],
    'yesnonono': [{ name: 'Mild Strain', description: 'Minor muscle or tendon strain in the hand.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'noyesyesyes': [{ name: 'Wrist Tendinitis', description: 'Inflammation of the tendons in the wrist causing pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Tendinitis' }
    ],
    'noyesyesno': [{ name: 'Wrist Tendinitis', description: 'Inflammation of the tendons in the wrist causing pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Tendinitis' }
    ],
    'noyesnoyes': [{ name: 'Wrist Sprain', description: 'Ligament injury in the wrist causing pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Sprain' }
    ],
    'noyesnono': [{ name: 'Mild Strain', description: 'Minor muscle or tendon strain in the hand.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nonoyesyes': [{ name: 'Wrist Sprain', description: 'Ligament injury in the wrist causing pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Sprain' }
    ],
    'nonoyesno': [{ name: 'Mild Strain', description: 'Minor muscle or tendon strain in the hand.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nononoyes': [{ name: 'Wrist Sprain', description: 'Ligament injury in the wrist causing pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Sprain' }
    ],
    'nononono': [{ name: 'No Significant Issue', description: 'No significant issues detected based on your answers.', severity: 'low', wiki: '' }
    ]
  },
  'right-hand': {
    'yesyesyesyes': [{ name: 'Carpal Tunnel Syndrome', description: 'Compression of the median nerve causing tingling and pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Carpal_tunnel_syndrome' }
    ],
    'yesyesyesno': [{ name: 'Carpal Tunnel Syndrome', description: 'Compression of the median nerve causing tingling and pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Carpal_tunnel_syndrome' }
    ],
    'yesyesnoyes': [{ name: 'Wrist Tendinitis', description: 'Inflammation of the tendons in the wrist causing pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Tendinitis' }
    ],
    'yesyesnono': [{ name: 'Peripheral Neuropathy', description: 'Nerve damage causing tingling in the hands.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Peripheral_neuropathy' }
    ],
    'yesnoyesyes': [{ name: 'Carpal Tunnel Syndrome', description: 'Compression of the median nerve causing tingling and pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Carpal_tunnel_syndrome' }
    ],
    'yesnoyesno': [{ name: 'Peripheral Neuropathy', description: 'Nerve damage causing tingling in the hands.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Peripheral_neuropathy' }
    ],
    'yesnonoyes': [{ name: 'Wrist Sprain', description: 'Ligament injury in the wrist causing pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Sprain' }
    ],
    'yesnonono': [{ name: 'Mild Strain', description: 'Minor muscle or tendon strain in the hand.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'noyesyesyes': [{ name: 'Wrist Tendinitis', description: 'Inflammation of the tendons in the wrist causing pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Tendinitis' }
    ],
    'noyesyesno': [{ name: 'Wrist Tendinitis', description: 'Inflammation of the tendons in the wrist causing pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Tendinitis' }
    ],
    'noyesnoyes': [{ name: 'Wrist Sprain', description: 'Ligament injury in the wrist causing pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Sprain' }
    ],
    'noyesnono': [{ name: 'Mild Strain', description: 'Minor muscle or tendon strain in the hand.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nonoyesyes': [{ name: 'Wrist Sprain', description: 'Ligament injury in the wrist causing pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Sprain' }
    ],
    'nonoyesno': [{ name: 'Mild Strain', description: 'Minor muscle or tendon strain in the hand.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nononoyes': [{ name: 'Wrist Sprain', description: 'Ligament injury in the wrist causing pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Sprain' }
    ],
    'nononono': [{ name: 'No Significant Issue', description: 'No significant issues detected based on your answers.', severity: 'low', wiki: '' }
    ]
  },
  'hip': {
    'yesyesyesyes': [{ name: 'Hip Osteoarthritis', description: 'Degeneration of the hip joint causing pain and stiffness.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }
    ],
    'yesyesyesno': [{ name: 'Hip Osteoarthritis', description: 'Degeneration of the hip joint causing pain and stiffness.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }
    ],
    'yesyesnoyes': [{ name: 'Labral Tear', description: 'Tear in the cartilage ring around the hip socket.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Acetabular_labrum#Labral_tear' }
    ],
    'yesyesnono': [{ name: 'Hip Bursitis', description: 'Inflammation of the bursa in the hip causing pain during movement.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Bursitis' }
    ],
    'yesnoyesyes': [{ name: 'Hip Osteoarthritis', description: 'Degeneration of the hip joint causing pain and stiffness.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }
    ],
    'yesnoyesno': [{ name: 'Hip Bursitis', description: 'Inflammation of the bursa in the hip causing pain during movement.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Bursitis' }
    ],
    'yesnonoyes': [{ name: 'Labral Tear', description: 'Tear in the cartilage ring around the hip socket.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Acetabular_labrum#Labral_tear' }
    ],
    'yesnonono': [{ name: 'Mild Strain', description: 'Minor muscle strain in the hip area.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'noyesyesyes': [{ name: 'Labral Tear', description: 'Tear in the cartilage ring around the hip socket.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Acetabular_labrum#Labral_tear' }
    ],
    'noyesyesno': [{ name: 'Hip Bursitis', description: 'Inflammation of the bursa in the hip causing pain during movement.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Bursitis'}
    ],
    'noyesnoyes': [{ name: 'Labral Tear', description: 'Tear in the cartilage ring around the hip socket.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Acetabular_labrum#Labral_tear' }
    ],
    'noyesnono': [{ name: 'Mild Strain', description: 'Minor muscle strain in the hip area.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nonoyesyes': [{ name: 'Hip Osteoarthritis', description: 'Degeneration of the hip joint causing pain and stiffness.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }
    ],
    'nonoyesno': [{ name: 'Mild Strain', description: 'Minor muscle strain in the hip area.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nononoyes': [{ name: 'Labral Tear', description: 'Tear in the cartilage ring around the hip socket.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Acetabular_labrum#Labral_tear' }
    ],
    'nononono': [{ name: 'No Significant Issue', description: 'No significant issues detected based on your answers.', severity: 'low', wiki: '' }
    ]
  },
  'knee': {
    'yesyesyesyes': [{ name: 'Meniscus Tear', description: 'Tear in the cartilage of the knee causing pain and swelling.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Meniscus_tear' }
    ],
    'yesyesyesno': [{ name: 'Meniscus Tear', description: 'Tear in the cartilage of the knee causing pain and swelling.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Meniscus_tear' }
    ],
    'yesyesnoyes': [{ name: 'ACL Injury', description: 'Tear or sprain of the anterior cruciate ligament in the knee.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Anterior_cruciate_ligament_injury' }
    ],
    'yesyesnono': [{ name: 'Patellar Tendinitis', description: 'Inflammation of the tendon connecting the kneecap to the shin.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Patellar_tendinitis' }
    ],
    'yesnoyesyes': [{ name: 'Knee Bursitis', description: 'Inflammation of the bursa in the knee causing swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Bursitis' }
    ],
    'yesnoyesno': [{ name: 'Patellar Tendinitis', description: 'Inflammation of the tendon connecting the kneecap to the shin.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Patellar_tendinitis' }
    ],
    'yesnonoyes': [{ name: 'Meniscus Tear', description: 'Tear in the cartilage of the knee causing pain and swelling.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Meniscus_tear' }
    ],
    'yesnonono': [{ name: 'Mild Sprain', description: 'Minor ligament strain in the knee.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Sprain' }
    ],
    'noyesyesyes': [{ name: 'Knee Bursitis', description: 'Inflammation of the bursa in the knee causing swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Bursitis' }
    ],
    'noyesyesno': [{ name: 'Knee Bursitis', description: 'Inflammation of the bursa in the knee causing swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Bursitis' }
    ],
    'noyesnoyes': [{ name: 'Meniscus Tear', description: 'Tear in the cartilage of the knee causing pain and swelling.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Meniscus_tear' }
    ],
    'noyesnono': [{ name: 'Mild Sprain', description: 'Minor ligament strain in the knee.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Sprain' }
    ],
    'nonoyesyes': [{ name: 'ACL Injury', description: 'Tear or sprain of the anterior cruciate ligament in the knee.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Anterior_cruciate_ligament_injury' }
    ],
    'nonoyesno': [{ name: 'Mild Sprain', description: 'Minor ligament strain in the knee.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Sprain' }
    ],
    'nononoyes': [{ name: 'Meniscus Tear', description: 'Tear in the cartilage of the knee causing pain and swelling.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Meniscus_tear' }
    ],
    'nononono': [{ name: 'No Significant Issue', description: 'No significant issues detected based on your answers.', severity: 'low', wiki: '' }
    ]
  },
  'left-foot': {
    'yesyesyesyes': [{ name: 'Plantar Fasciitis', description: 'Inflammation of the tissue along the bottom of the foot.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Plantar_fasciitis' }
    ],
    'yesyesyesno': [{ name: 'Plantar Fasciitis', description: 'Inflammation of the tissue along the bottom of the foot.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Plantar_fasciitis' }
    ],
    'yesyesnoyes': [{ name: 'Flat Feet', description: 'Lack of arch in the foot causing pain during walking.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Flat_feet' }
    ],
    'yesyesnono': [{ name: 'Heel Spur', description: 'Bone growth on the heel causing pain during walking.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Heel_spur' }
    ],
    'yesnoyesyes': [{ name: 'Ankle Sprain', description: 'Ligament injury in the ankle causing swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Sprain' }
    ],
    'yesnoyesno': [{ name: 'Heel Spur', description: 'Bone growth on the heel causing pain during walking.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Heel_spur' }
    ],
    'yesnonoyes': [{ name: 'Flat Feet', description: 'Lack of arch in the foot causing pain during walking.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Flat_feet' }
    ],
    'yesnonono': [{ name: 'Mild Strain', description: 'Minor muscle or tendon strain in the foot.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'noyesyesyes': [{ name: 'Ankle Sprain', description: 'Ligament injury in the ankle causing swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Sprain' }
    ],
    'noyesyesno': [{ name: 'Ankle Sprain', description: 'Ligament injury in the ankle causing swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Sprain' }
    ],
    'noyesnoyes': [{ name: 'Flat Feet', description: 'Lack of arch in the foot causing pain during walking.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Flat_feet' }
    ],
    'noyesnono': [{ name: 'Mild Strain', description: 'Minor muscle or tendon strain in the foot.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nonoyesyes': [{ name: 'Ankle Sprain', description: 'Ligament injury in the ankle causing swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Sprain' }
    ],
    'nonoyesno': [{ name: 'Mild Strain', description: 'Minor muscle or tendon strain in the foot.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nononoyes': [{ name: 'Flat Feet', description: 'Lack of arch in the foot causing pain during walking.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Flat_feet' }
    ],
    'nononono': [{ name: 'No Significant Issue', description: 'No significant issues detected based on your answers.', severity: 'low', wiki: '' }
    ]
  },
  'right-foot': {
    'yesyesyesyes': [{ name: 'Plantar Fasciitis', description: 'Inflammation of the tissue along the bottom of the foot.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Plantar_fasciitis' }
    ],
    'yesyesyesno': [{ name: 'Plantar Fasciitis', description: 'Inflammation of the tissue along the bottom of the foot.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Plantar_fasciitis' }
    ],
    'yesyesnoyes': [{ name: 'Flat Feet', description: 'Lack of arch in the foot causing pain during walking.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Flat_feet' }
    ],
    'yesyesnono': [{ name: 'Heel Spur', description: 'Bone growth on the heel causing pain during walking.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Heel_spur' }
    ],
    'yesnoyesyes': [{ name: 'Ankle Sprain', description: 'Ligament injury in the ankle causing swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Sprain' }
    ],
    'yesnoyesno': [{ name: 'Heel Spur', description: 'Bone growth on the heel causing pain during walking.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Heel_spur' }
    ],
    'yesnonoyes': [{ name: 'Flat Feet', description: 'Lack of arch in the foot causing pain during walking.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Flat_feet' }
    ],
    'yesnonono': [{ name: 'Mild Strain', description: 'Minor muscle or tendon strain in the foot.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'noyesyesyes': [{ name: 'Ankle Sprain', description: 'Ligament injury in the ankle causing swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Sprain' }
    ],
    'noyesyesno': [{ name: 'Ankle Sprain', description: 'Ligament injury in the ankle causing swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Sprain' }
    ],
    'noyesnoyes': [{ name: 'Flat Feet', description: 'Lack of arch in the foot causing pain during walking.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Flat_feet' }
    ],
    'noyesnono': [{ name: 'Mild Strain', description: 'Minor muscle or tendon strain in the foot.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nonoyesyes': [{ name: 'Ankle Sprain', description: 'Ligament injury in the ankle causing swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Sprain' }
    ],
    'nonoyesno': [{ name: 'Mild Strain', description: 'Minor muscle or tendon strain in the foot.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nononoyes': [{ name: 'Flat Feet', description: 'Lack of arch in the foot causing pain during walking.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Flat_feet' }
    ],
    'nononono': [{ name: 'No Significant Issue', description: 'No significant issues detected based on your answers.', severity: 'low', wiki: '' }
    ]
  },
  'spine': {
    'yesyesyesyes': [{ name: 'Herniated Disc', description: 'Disc protrusion in the spine causing pain and stiffness.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Spinal_disc_herniation' }
    ],
    'yesyesyesno': [{ name: 'Herniated Disc', description: 'Disc protrusion in the spine causing pain and stiffness.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Spinal_disc_herniation' }
    ],
    'yesyesnoyes': [{ name: 'Spinal Stenosis', description: 'Narrowing of the spinal canal causing stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Spinal_stenosis' }
    ],
    'yesyesnono': [{ name: 'Muscle Strain', description: 'Overstretched muscles in the upper back.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'yesnoyesyes': [{ name: 'Herniated Disc', description: 'Disc protrusion in the spine causing pain and stiffness.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Spinal_disc_herniation' }
    ],
    'yesnoyesno': [{ name: 'Muscle Strain', description: 'Overstretched muscles in the upper back.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'yesnonoyes': [{ name: 'Spinal Stenosis', description: 'Narrowing of the spinal canal causing stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Spinal_stenosis' }
    ],
    'yesnonono': [{ name: 'Mild Strain', description: 'Minor muscle strain in the upper back.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'noyesyesyes': [{ name: 'Spinal Stenosis', description: 'Narrowing of the spinal canal causing stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Spinal_stenosis' }
    ],
    'noyesyesno': [{ name: 'Muscle Strain', description: 'Overstretched muscles in the upper back.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'noyesnoyes': [{ name: 'Spinal Stenosis', description: 'Narrowing of the spinal canal causing stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Spinal_stenosis' }
    ],
    'noyesnono': [{ name: 'Mild Strain', description: 'Minor muscle strain in the upper back.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nonoyesyes': [{ name: 'Herniated Disc', description: 'Disc protrusion in the spine causing pain and stiffness.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Spinal_disc_herniation' }
    ],
    'nonoyesno': [{ name: 'Mild Strain', description: 'Minor muscle strain in the upper back.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nononoyes': [{ name: 'Spinal Stenosis', description: 'Narrowing of the spinal canal causing stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Spinal_stenosis' }
    ],
    'nononono': [{ name: 'No Significant Issue', description: 'No significant issues detected based on your answers.', severity: 'low', wiki: '' }
    ]
  },
  'lower-back': {
    'yesyesyesyes': [{ name: 'Sciatica', description: 'Compression of the sciatic nerve causing leg pain.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Sciatica' }
    ],
    'yesyesyesno': [{ name: 'Sciatica', description: 'Compression of the sciatic nerve causing leg pain.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Sciatica' }
    ],
    'yesyesnoyes': [{ name: 'Lumbar Strain', description: 'Muscle or tendon strain in the lower back.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'yesyesnono': [{ name: 'Lumbar Strain', description: 'Muscle or tendon strain in the lower back.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'yesnoyesyes': [{ name: 'Spondylosis', description: 'Degeneration of the spine causing stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Spondylosis' }
    ],
    'yesnoyesno': [{ name: 'Lumbar Strain', description: 'Muscle or tendon strain in the lower back.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'yesnonoyes': [{ name: 'Spondylosis', description: 'Degeneration of the spine causing stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Spondylosis' }
    ],
    'yesnonono': [{ name: 'Mild Strain', description: 'Minor muscle strain in the lower back.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'noyesyesyes': [{ name: 'Spondylosis', description: 'Degeneration of the spine causing stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Spondylosis' }
    ],
    'noyesyesno': [{ name: 'Lumbar Strain', description: 'Muscle or tendon strain in the lower back.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'noyesnoyes': [{ name: 'Spondylosis', description: 'Degeneration of the spine causing stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Spondylosis' }
    ],
    'noyesnono': [{ name: 'Mild Strain', description: 'Minor muscle strain in the lower back.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nonoyesyes': [{ name: 'Spondylosis', description: 'Degeneration of the spine causing stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Spondylosis' }
    ],
    'nonoyesno': [{ name: 'Mild Strain', description: 'Minor muscle strain in the lower back.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nononoyes': [{ name: 'Lumbar Strain', description: 'Muscle or tendon strain in the lower back.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nononono': [{ name: 'No Significant Issue', description: 'No significant issues detected based on your answers.', severity: 'low', wiki: '' }
    ]
  },
  'back-shoulder-left': {
    'yesyesyesyes': [{ name: 'Scapular Dyskinesis', description: 'Abnormal shoulder blade movement causing pain and stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Scapular_dyskinesis' }
    ],
    'yesyesyesno': [{ name: 'Scapular Dyskinesis', description: 'Abnormal shoulder blade movement causing pain and stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Scapular_dyskinesis' }
    ],
    'yesyesnoyes': [{ name: 'Rhomboid Strain', description: 'Muscle strain in the upper back near the shoulder blade.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'yesyesnono': [{ name: 'Rhomboid Strain', description: 'Muscle strain in the upper back near the shoulder blade.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'yesnoyesyes': [{ name: 'Shoulder Blade Arthritis', description: 'Degeneration in the shoulder blade area.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }
    ],
    'yesnoyesno': [{ name: 'Rhomboid Strain', description: 'Muscle strain in the upper back near the shoulder blade.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'yesnonoyes': [{ name: 'Shoulder Blade Arthritis', description: 'Degeneration in the shoulder blade area.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }
    ],
    'yesnonono': [{ name: 'Mild Strain', description: 'Minor muscle strain in the shoulder blade area.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'noyesyesyes': [{ name: 'Shoulder Blade Arthritis', description: 'Degeneration in the shoulder blade area.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }
    ],
    'noyesyesno': [{ name: 'Rhomboid Strain', description: 'Muscle strain in the upper back near the shoulder blade.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'noyesnoyes': [{ name: 'Shoulder Blade Arthritis', description: 'Degeneration in the shoulder blade area.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }
    ],
    'noyesnono': [{ name: 'Mild Strain', description: 'Minor muscle strain in the shoulder blade area.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nonoyesyes': [{ name: 'Scapular Dyskinesis', description: 'Abnormal shoulder blade movement causing pain and stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Scapular_dyskinesis' }
    ],
    'nonoyesno': [{ name: 'Mild Strain', description: 'Minor muscle strain in the shoulder blade area.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nononoyes': [{ name: 'Shoulder Blade Arthritis', description: 'Degeneration in the shoulder blade area.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }
    ],
    'nononono': [{ name: 'No Significant Issue', description: 'No significant issues detected based on your answers.', severity: 'low', wiki: '' }
    ]
  },
  'back-shoulder-right': {
    'yesyesyesyes': [{ name: 'Scapular Dyskinesis', description: 'Abnormal shoulder blade movement causing pain and stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Scapular_dyskinesis' }
    ],
    'yesyesyesno': [{ name: 'Scapular Dyskinesis', description: 'Abnormal shoulder blade movement causing pain and stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Scapular_dyskinesis' }
    ],
    'yesyesnoyes': [{ name: 'Rhomboid Strain', description: 'Muscle strain in the upper back near the shoulder blade.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'yesyesnono': [{ name: 'Rhomboid Strain', description: 'Muscle strain in the upper back near the shoulder blade.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'yesnoyesyes': [{ name: 'Shoulder Blade Arthritis', description: 'Degeneration in the shoulder blade area.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }
    ],
    'yesnoyesno': [{ name: 'Rhomboid Strain', description: 'Muscle strain in the upper back near the shoulder blade.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'yesnonoyes': [{ name: 'Shoulder Blade Arthritis', description: 'Degeneration in the shoulder blade area.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }
    ],
    'yesnonono': [{ name: 'Mild Strain', description: 'Minor muscle strain in the shoulder blade area.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'noyesyesyes': [{ name: 'Shoulder Blade Arthritis', description: 'Degeneration in the shoulder blade area.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }
    ],
    'noyesyesno': [{ name: 'Rhomboid Strain', description: 'Muscle strain in the upper back near the shoulder blade.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'noyesnoyes': [{ name: 'Shoulder Blade Arthritis', description: 'Degeneration in the shoulder blade area.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }
    ],
    'noyesnono': [{ name: 'Mild Strain', description: 'Minor muscle strain in the shoulder blade area.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nonoyesyes': [{ name: 'Scapular Dyskinesis', description: 'Abnormal shoulder blade movement causing pain and stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Scapular_dyskinesis' }
    ],
    'nonoyesno': [{ name: 'Mild Strain', description: 'Minor muscle strain in the shoulder blade area.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }
    ],
    'nononoyes': [{ name: 'Shoulder Blade Arthritis', description: 'Degeneration in the shoulder blade area.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }
    ],
    'nononono': [{ name: 'No Significant Issue', description: 'No significant issues detected based on your answers.', severity: 'low', wiki: '' }
    ]
  }
};
let currentBodyPart = null;
let currentQuestionIndex = 0;
let userResponses = [];

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

function startDiagnosticFlow(bodyPart) {
  if (isDiagnosisInProgress) {
    showNotification("Please complete the current diagnosis or restart before starting a new one.");
    return;
  }
  isDiagnosisInProgress = true;
  disableBodyPartInteractions();
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