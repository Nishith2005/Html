const frontViewBtn = document.getElementById('front-view-btn');
const backViewBtn = document.getElementById('back-view-btn');
const frontView = document.getElementById('front-view');
const backView = document.getElementById('back-view');
const infoPanel = document.getElementById('info-panel');
const diagnosticFlow = document.getElementById('diagnostic-flow');
const resultsContainer = document.getElementById('results-container');
const feedbackMessageElement = document.getElementById("feedback-message");

const hotspots = document.querySelectorAll('#front-view .hotspot');
const backButtons = document.querySelectorAll('.back-btn-animated');

const customAlertOverlay = document.getElementById('custom-alert-overlay');
const customAlertBox = document.getElementById('custom-alert-box');
const customAlertHeading = document.getElementById('custom-alert-heading');
const customAlertMessage = document.getElementById('custom-alert-message');
const customAlertDismissBtn = document.getElementById('custom-alert-dismiss-btn');

function showCustomAlert(heading, message) {
  customAlertHeading.textContent = heading;
  customAlertMessage.textContent = message;
  if (customAlertOverlay) {
    customAlertOverlay.style.display = 'flex';
    setTimeout(() => {
      customAlertOverlay.classList.add('visible');
    }, 10);
  }
}

function hideCustomAlert() {
  if (customAlertOverlay) {
    customAlertOverlay.classList.remove('visible');
    setTimeout(() => {
      customAlertOverlay.style.display = 'none';
    }, 300);
  }
}

if (customAlertDismissBtn) {
  customAlertDismissBtn.addEventListener('click', hideCustomAlert);
}

function showFeedbackMessage(message) {
  if (!feedbackMessageElement) return;
  feedbackMessageElement.textContent = message;
  feedbackMessageElement.classList.add('visible');
  setTimeout(() => {
    feedbackMessageElement.classList.remove('visible');
  }, 3000);
}

function disableBodyPartInteractions() {
  hotspots.forEach(h => {
    h.classList.add('interaction-disabled');
    h.classList.remove('pulse');
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
    showCustomAlert("Action Not Allowed", "Please complete the current diagnosis before changing the view.");
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
    showCustomAlert("Action Not Allowed", "Please complete the current diagnosis before changing the view.");
    return;
  }
  backViewBtn.classList.add('active');
  frontViewBtn.classList.remove('active');
  backView.style.display = 'block';
  frontView.style.display = 'none';
  resetDiagnosticFlow();
});

hotspots.forEach(hotspot => {
  const originalSrc = hotspot.src;
  const hoverSrc = originalSrc.replace('.png', '_Hover1.png');

  hotspot.addEventListener('mouseenter', () => {
    if (isDiagnosisInProgress && hotspot.classList.contains('interaction-disabled')) return;
    const img = new Image();
    img.src = hoverSrc;
    img.onload = () => {
      hotspot.src = hoverSrc;
    };
    img.onerror = () => {
      hotspot.src = originalSrc;
    };
  });

  hotspot.addEventListener('mouseleave', () => {
    hotspot.src = originalSrc;
  });

  hotspot.addEventListener('click', () => {
    if (isDiagnosisInProgress) {
      showCustomAlert("Action Not Allowed", "Please complete the current diagnosis before selecting another body part.");
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
    if (button.classList.contains('disabled')) {
      showCustomAlert("Action Not Allowed", "Please complete the current diagnosis before selecting another body part.");
      return;
    }
    if (isDiagnosisInProgress) {
      showCustomAlert("Action Not Allowed", "Please complete the current diagnosis before selecting another body part.");
      return;
    }
    const bodyPart = button.getAttribute('data-part');
    if (bodyPart) {
      startDiagnosticFlow(bodyPart);
      infoPanel.classList.add('active');
    }
  });
});

const diagnosticQuestions = {
  'left-shoulder': [
    { id: 1, text: 'Is there pain when lifting your arm or carrying items?', options: ['Yes', 'No'] },
    { id: 2, text: 'Do you experience stiffness, particularly in the morning or after inactivity?', options: ['Yes', 'No'] },
    { id: 3, text: 'Does the pain worsen at night or affect your sleep?', options: ['Yes', 'No'] },
    { id: 4, text: 'Have you noticed any swelling, warmth, or redness in the shoulder area?', options: ['Yes', 'No'] }
  ],
  'right-shoulder': [
    { id: 1, text: 'Is there pain when lifting your arm or carrying items?', options: ['Yes', 'No'] },
    { id: 2, text: 'Do you experience stiffness, particularly in the morning or after inactivity?', options: ['Yes', 'No'] },
    { id: 3, text: 'Does the pain worsen at night or affect your sleep?', options: ['Yes', 'No'] },
    { id: 4, text: 'Have you noticed any swelling, warmth, or redness in the shoulder area?', options: ['Yes', 'No'] }
  ],
  'left-hand': [
    { id: 1, text: 'Do you feel tingling, numbness, or burning in your fingers, especially the thumb, index, and middle finger?', options: ['Yes', 'No'] },
    { id: 2, text: 'Is there pain or swelling at the base of your thumb or in your wrist?', options: ['Yes', 'No'] },
    { id: 3, text: 'Do you have difficulty gripping objects or making a fist?', options: ['Yes', 'No'] },
    { id: 4, text: 'Are symptoms worse at night or after repetitive hand movements?', options: ['Yes', 'No'] }
  ],
  'right-hand': [
    { id: 1, text: 'Do you feel tingling, numbness, or burning in your fingers, especially the thumb, index, and middle finger?', options: ['Yes', 'No'] },
    { id: 2, text: 'Is there pain or swelling at the base of your thumb or in your wrist?', options: ['Yes', 'No'] },
    { id: 3, text: 'Do you have difficulty gripping objects or making a fist?', options: ['Yes', 'No'] },
    { id: 4, text: 'Are symptoms worse at night or after repetitive hand movements?', options: ['Yes', 'No'] }
  ],
  'hip': [
    { id: 1, text: 'Do you experience pain in the groin, outer hip, or buttock area?', options: ['Yes', 'No'] },
    { id: 2, text: 'Is there stiffness in your hip, especially in the morning or after sitting for a while?', options: ['Yes', 'No'] },
    { id: 3, text: 'Does the pain worsen with activities like walking, climbing stairs, or standing for long periods?', options: ['Yes', 'No'] },
    { id: 4, text: 'Have you ever been told you have low bone density or osteoporosis?', options: ['Yes', 'No'] }
  ],
  'knee': [
    { id: 1, text: 'Do you feel pain around or behind your kneecap, especially when squatting, climbing stairs, or sitting for long periods?', options: ['Yes', 'No'] },
    { id: 2, text: 'Is there swelling, warmth, or redness around the knee?', options: ['Yes', 'No'] },
    { id: 3, text: 'Does your knee feel unstable, give way, or make popping/crunching noises?', options: ['Yes', 'No'] },
    { id: 4, text: 'Do you participate in activities involving jumping or sudden direction changes?', options: ['Yes', 'No'] }
  ],
  'left-foot': [
    { id: 1, text: 'Do you have pain in your heel, especially with the first steps in the morning?', options: ['Yes', 'No'] },
    { id: 2, text: 'Is there a bony bump at the base of your big toe, or is your big toe angling towards other toes?', options: ['Yes', 'No'] },
    { id: 3, text: 'Do you experience burning, tingling, or numbness between your toes, like walking on a marble?', options: ['Yes', 'No'] },
    { id: 4, text: 'Do you often wear high-heeled or narrow-toed shoes?', options: ['Yes', 'No'] }
  ],
  'right-foot': [
    { id: 1, text: 'Do you have pain in your heel, especially with the first steps in the morning?', options: ['Yes', 'No'] },
    { id: 2, text: 'Is there a bony bump at the base of your big toe, or is your big toe angling towards other toes?', options: ['Yes', 'No'] },
    { id: 3, text: 'Do you experience burning, tingling, or numbness between your toes, like walking on a marble?', options: ['Yes', 'No'] },
    { id: 4, text: 'Do you often wear high-heeled or narrow-toed shoes?', options: ['Yes', 'No'] }
  ],
  'spine': [
    { id: 1, text: 'Do you experience aching or sharp pain in your upper or mid back?', options: ['Yes', 'No'] },
    { id: 2, text: 'Is there stiffness when trying to bend or twist your upper body?', options: ['Yes', 'No'] },
    { id: 3, text: 'Have you noticed a change in your posture, such as increased rounding of the upper back?', options: ['Yes', 'No'] },
    { id: 4, text: 'Does the pain worsen with prolonged sitting or standing?', options: ['Yes', 'No'] }
  ],
  'lower-back': [
    { id: 1, text: 'Do you have pain that radiates down your leg (sciatica-like pain)?', options: ['Yes', 'No'] },
    { id: 2, text: 'Is there stiffness in your lower back, especially in the morning or after rest?', options: ['Yes', 'No'] },
    { id: 3, text: 'Does the pain worsen with prolonged sitting, standing, or certain movements like bending or lifting?', options: ['Yes', 'No'] },
    { id: 4, text: 'Have you experienced changes in bowel or bladder control, or numbness in the saddle area?', options: ['Yes', 'No'] }
  ],
  'back-shoulder-left': [
    { id: 1, text: 'Is there pain when reaching behind your back?', options: ['Yes', 'No'] },
    { id: 2, text: 'Do you feel stiffness in your shoulder blade area?', options: ['Yes', 'No'] },
    { id: 3, text: 'Does the pain increase with overhead activities?', options: ['Yes', 'No'] },
    { id: 4, text: 'Have you noticed any grinding sensation in the shoulder?', options: ['Yes', 'No'] }
  ],
  'back-shoulder-right': [
    { id: 1, text: 'Is there pain when reaching behind your back?', options: ['Yes', 'No'] },
    { id: 2, text: 'Do you feel stiffness in your shoulder blade area?', options: ['Yes', 'No'] },
    { id: 3, text: 'Does the pain increase with overhead activities?', options: ['Yes', 'No'] },
    { id: 4, text: 'Have you noticed any grinding sensation in the shoulder?', options: ['Yes', 'No'] }
  ]
};

const diagnosticOutcomes = {
  'left-shoulder': {
    'yesyesyesyes': [{ name: 'Rotator Cuff Issue / Severe Bursitis', description: 'Significant inflammation or tear in shoulder tendons/bursa, worse at night with swelling.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Rotator_cuff_tear' }, { name: 'Adhesive Capsulitis (Frozen Shoulder) with Inflammation', description: 'Marked stiffness, pain, and inflammation limiting movement.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Adhesive_capsulitis_of_shoulder' }],
    'yesyesyesno': [{ name: 'Rotator Cuff Tendinopathy / Frozen Shoulder (Early)', description: 'Pain with movement and stiffness, worsening at night, but no significant swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Rotator_cuff_tendinopathy' }],
    'yesyesnoyes': [{ name: 'Shoulder Impingement with Bursitis', description: 'Pinching of tendons or bursa, with notable stiffness and swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Shoulder_impingement_syndrome' }],
    'yesyesnono': [{ name: 'Shoulder Impingement / Mild Arthritis', description: 'Pain and stiffness with movement, but no night worsening or swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Shoulder_impingement_syndrome' }],
    'yesnoyesyes': [{ name: 'Bursitis / Inflammatory Arthritis', description: 'Pain, worse at night, with swelling, but less overall stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Bursitis' }],
    'yesnoyesno': [{ name: 'Tendinitis / Night Pain Syndrome', description: 'Pain with movement, worse at night, but no significant stiffness or swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Tendinitis' }],
    'yesnonoyes': [{ name: 'Localized Inflammation / Mild Bursitis', description: 'Pain with movement and swelling, but not notably stiff or worse at night.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Bursitis' }],
    'yesnonono': [{ name: 'Mild Shoulder Strain / Overuse', description: 'Pain with movement, but no other significant symptoms.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }],
    'noyesyesyes': [{ name: 'Frozen Shoulder / Inflammatory Condition', description: 'Significant stiffness, night pain, and swelling, even without initial pain on lifting.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Adhesive_capsulitis_of_shoulder' }],
    'noyesyesno': [{ name: 'Possible Frozen Shoulder (Early) / Arthritis', description: 'Stiffness and night pain, but no swelling or initial pain on lifting.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Adhesive_capsulitis_of_shoulder' }],
    'noyesnoyes': [{ name: 'Non-Specific Shoulder Stiffness with Swelling', description: 'Stiffness and swelling present, cause unclear, consult doctor.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Joint_stiffness' }],
    'noyesnono': [{ name: 'Postural Strain / General Stiffness', description: 'Stiffness without other major indicators, consider posture.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Myalgia' }],
    'nonoyesyes': [{ name: 'Inflammatory Condition (Non-Activity Related)', description: 'Night pain and swelling without specific activity pain or stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Inflammation' }],
    'nonoyesno': [{ name: 'Nocturnal Shoulder Pain (Consult Doctor)', description: 'Pain primarily at night without other clear symptoms, needs investigation.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Nocturnal_pain' }],
    'nononoyes': [{ name: 'Localized Swelling (Consult Doctor)', description: 'Swelling without pain or stiffness, needs medical evaluation.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Edema' }],
    'nononono': [{ name: 'No Clear Indication (Monitor Symptoms)', description: 'No significant issues reported. Monitor and consult doctor if symptoms develop or persist.', severity: 'low', wiki: '' }]
  },
  'right-shoulder': {
    'yesyesyesyes': [{ name: 'Rotator Cuff Issue / Severe Bursitis', description: 'Significant inflammation or tear in shoulder tendons/bursa, worse at night with swelling.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Rotator_cuff_tear' }, { name: 'Adhesive Capsulitis (Frozen Shoulder) with Inflammation', description: 'Marked stiffness, pain, and inflammation limiting movement.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Adhesive_capsulitis_of_shoulder' }],
    'yesyesyesno': [{ name: 'Rotator Cuff Tendinopathy / Frozen Shoulder (Early)', description: 'Pain with movement and stiffness, worsening at night, but no significant swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Rotator_cuff_tendinopathy' }],
    'yesyesnoyes': [{ name: 'Shoulder Impingement with Bursitis', description: 'Pinching of tendons or bursa, with notable stiffness and swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Shoulder_impingement_syndrome' }],
    'yesyesnono': [{ name: 'Shoulder Impingement / Mild Arthritis', description: 'Pain and stiffness with movement, but no night worsening or swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Shoulder_impingement_syndrome' }],
    'yesnoyesyes': [{ name: 'Bursitis / Inflammatory Arthritis', description: 'Pain, worse at night, with swelling, but less overall stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Bursitis' }],
    'yesnoyesno': [{ name: 'Tendinitis / Night Pain Syndrome', description: 'Pain with movement, worse at night, but no significant stiffness or swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Tendinitis' }],
    'yesnonoyes': [{ name: 'Localized Inflammation / Mild Bursitis', description: 'Pain with movement and swelling, but not notably stiff or worse at night.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Bursitis' }],
    'yesnonono': [{ name: 'Mild Shoulder Strain / Overuse', description: 'Pain with movement, but no other significant symptoms.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }],
    'noyesyesyes': [{ name: 'Frozen Shoulder / Inflammatory Condition', description: 'Significant stiffness, night pain, and swelling, even without initial pain on lifting.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Adhesive_capsulitis_of_shoulder' }],
    'noyesyesno': [{ name: 'Possible Frozen Shoulder (Early) / Arthritis', description: 'Stiffness and night pain, but no swelling or initial pain on lifting.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Adhesive_capsulitis_of_shoulder' }],
    'noyesnoyes': [{ name: 'Non-Specific Shoulder Stiffness with Swelling', description: 'Stiffness and swelling present, cause unclear, consult doctor.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Joint_stiffness' }],
    'noyesnono': [{ name: 'Postural Strain / General Stiffness', description: 'Stiffness without other major indicators, consider posture.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Myalgia' }],
    'nonoyesyes': [{ name: 'Inflammatory Condition (Non-Activity Related)', description: 'Night pain and swelling without specific activity pain or stiffness.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Inflammation' }],
    'nonoyesno': [{ name: 'Nocturnal Shoulder Pain (Consult Doctor)', description: 'Pain primarily at night without other clear symptoms, needs investigation.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Nocturnal_pain' }],
    'nononoyes': [{ name: 'Localized Swelling (Consult Doctor)', description: 'Swelling without pain or stiffness, needs medical evaluation.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Edema' }],
    'nononono': [{ name: 'No Clear Indication (Monitor Symptoms)', description: 'No significant issues reported. Monitor and consult doctor if symptoms develop or persist.', severity: 'low', wiki: '' }]
  },
  'left-hand': {
    'yesyesyesyes': [{ name: 'Carpal Tunnel Syndrome (Severe) / De Quervain\'s Tenosynovitis', description: 'Significant nerve symptoms, pain/swelling, grip difficulty, worse at night/repetitive use.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Carpal_tunnel_syndrome' }, { name: 'Rheumatoid Arthritis (Hand)', description: 'Inflammatory joint disease causing pain, swelling, stiffness.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Rheumatoid_arthritis' }],
    'yesyesyesno': [{ name: 'Carpal Tunnel Syndrome / De Quervain\'s (Moderate)', description: 'Nerve symptoms, pain/swelling, grip difficulty, but not specifically worse at night/repetitive use.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Carpal_tunnel_syndrome' }],
    'yesyesnoyes': [{ name: 'Possible Carpal Tunnel Syndrome with Night Worsening', description: 'Nerve symptoms, pain/swelling, worse at night, but grip not majorly affected.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Carpal_tunnel_syndrome' }],
    'yesyesnono': [{ name: 'Early Carpal Tunnel / Tendinitis', description: 'Nerve symptoms and pain/swelling, other factors less prominent.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Tendinitis' }],
    'yesnoyesyes': [{ name: 'Nerve Compression / Repetitive Strain Injury', description: 'Nerve symptoms, grip difficulty, worse with use, but less focal pain/swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Repetitive_strain_injury' }],
    'yesnoyesno': [{ name: 'Mild Nerve Irritation / Early Carpal Tunnel', description: 'Nerve symptoms and grip difficulty, other factors less prominent.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Paresthesia' }],
    'yesnonoyes': [{ name: 'Nerve Symptoms (Worse at Night)', description: 'Mainly tingling/numbness, worse at night/with use, less pain/grip issues.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Paresthesia' }],
    'yesnonono': [{ name: 'Isolated Nerve Symptoms (Monitor)', description: 'Only tingling/numbness reported. Monitor or consult if persistent.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Paresthesia' }],
    'noyesyesyes': [{ name: 'De Quervain\'s Tenosynovitis / Arthritis at Thumb/Wrist', description: 'Pain/swelling at thumb/wrist, grip issues, worse with use, but no primary nerve symptoms.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/De_Quervain%27s_syndrome' }],
    'noyesyesno': [{ name: 'Thumb/Wrist Pain with Grip Difficulty', description: 'Pain/swelling at thumb/wrist and grip issues. Consider arthritis or tendinitis.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis_of_the_hands' }],
    'noyesnoyes': [{ name: 'Thumb/Wrist Pain (Worse with Use)', description: 'Pain/swelling at thumb/wrist, worse with repetitive use. Possible tendinitis.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Tendinitis' }],
    'noyesnono': [{ name: 'Localized Thumb/Wrist Pain', description: 'Only pain/swelling at thumb/wrist. Could be mild strain or early arthritis.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Wrist_pain' }],
    'nonoyesyes': [{ name: 'Grip Difficulty (Repetitive Use)', description: 'Difficulty gripping, worse with use, but no primary pain/nerve issues. Could be muscle fatigue or RSI.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Repetitive_strain_injury' }],
    'nonoyesno': [{ name: 'Isolated Grip Difficulty (Consult Doctor)', description: 'Difficulty gripping without other symptoms. Needs evaluation.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Muscle_weakness' }],
    'nononoyes': [{ name: 'Symptoms Worse with Repetitive Use (Non-specific)', description: 'General discomfort with repetitive use. Consider ergonomics.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Repetitive_strain_injury' }],
    'nononono': [{ name: 'No Clear Indication (Monitor Symptoms)', description: 'No significant issues reported. Monitor and consult doctor if symptoms develop or persist.', severity: 'low', wiki: '' }]
  },
  'right-hand': {
    'yesyesyesyes': [{ name: 'Carpal Tunnel Syndrome (Severe) / De Quervain\'s Tenosynovitis', description: 'Significant nerve symptoms, pain/swelling, grip difficulty, worse at night/repetitive use.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Carpal_tunnel_syndrome' }, { name: 'Rheumatoid Arthritis (Hand)', description: 'Inflammatory joint disease causing pain, swelling, stiffness.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Rheumatoid_arthritis' }],
    'yesyesyesno': [{ name: 'Carpal Tunnel Syndrome / De Quervain\'s (Moderate)', description: 'Nerve symptoms, pain/swelling, grip difficulty, but not specifically worse at night/repetitive use.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Carpal_tunnel_syndrome' }],
    'yesyesnoyes': [{ name: 'Possible Carpal Tunnel Syndrome with Night Worsening', description: 'Nerve symptoms, pain/swelling, worse at night, but grip not majorly affected.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Carpal_tunnel_syndrome' }],
    'yesyesnono': [{ name: 'Early Carpal Tunnel / Tendinitis', description: 'Nerve symptoms and pain/swelling, other factors less prominent.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Tendinitis' }],
    'yesnoyesyes': [{ name: 'Nerve Compression / Repetitive Strain Injury', description: 'Nerve symptoms, grip difficulty, worse with use, but less focal pain/swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Repetitive_strain_injury' }],
    'yesnoyesno': [{ name: 'Mild Nerve Irritation / Early Carpal Tunnel', description: 'Nerve symptoms and grip difficulty, other factors less prominent.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Paresthesia' }],
    'yesnonoyes': [{ name: 'Nerve Symptoms (Worse at Night)', description: 'Mainly tingling/numbness, worse at night/with use, less pain/grip issues.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Paresthesia' }],
    'yesnonono': [{ name: 'Isolated Nerve Symptoms (Monitor)', description: 'Only tingling/numbness reported. Monitor or consult if persistent.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Paresthesia' }],
    'noyesyesyes': [{ name: 'De Quervain\'s Tenosynovitis / Arthritis at Thumb/Wrist', description: 'Pain/swelling at thumb/wrist, grip issues, worse with use, but no primary nerve symptoms.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/De_Quervain%27s_syndrome' }],
    'noyesyesno': [{ name: 'Thumb/Wrist Pain with Grip Difficulty', description: 'Pain/swelling at thumb/wrist and grip issues. Consider arthritis or tendinitis.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis_of_the_hands' }],
    'noyesnoyes': [{ name: 'Thumb/Wrist Pain (Worse with Use)', description: 'Pain/swelling at thumb/wrist, worse with repetitive use. Possible tendinitis.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Tendinitis' }],
    'noyesnono': [{ name: 'Localized Thumb/Wrist Pain', description: 'Only pain/swelling at thumb/wrist. Could be mild strain or early arthritis.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Wrist_pain' }],
    'nonoyesyes': [{ name: 'Grip Difficulty (Repetitive Use)', description: 'Difficulty gripping, worse with use, but no primary pain/nerve issues. Could be muscle fatigue or RSI.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Repetitive_strain_injury' }],
    'nonoyesno': [{ name: 'Isolated Grip Difficulty (Consult Doctor)', description: 'Difficulty gripping without other symptoms. Needs evaluation.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Muscle_weakness' }],
    'nononoyes': [{ name: 'Symptoms Worse with Repetitive Use (Non-specific)', description: 'General discomfort with repetitive use. Consider ergonomics.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Repetitive_strain_injury' }],
    'nononono': [{ name: 'No Clear Indication (Monitor Symptoms)', description: 'No significant issues reported. Monitor and consult doctor if symptoms develop or persist.', severity: 'low', wiki: '' }]
  },
  'hip': {
    'yesyesyesyes': [{ name: 'Osteoarthritis of Hip (Advanced) / Osteoporosis Complication', description: 'Significant pain, stiffness, activity limitation, with known low bone density.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis_of_the_hip' }, { name: 'Trochanteric Bursitis (Severe)', description: 'Marked outer hip pain, stiffness, worse with activity, potentially related to bone health.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Trochanteric_bursitis' }],
    'yesyesyesno': [{ name: 'Osteoarthritis of Hip / Trochanteric Bursitis', description: 'Pain, stiffness, activity limitation, but no known bone density issues.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis_of_the_hip' }],
    'yesyesnoyes': [{ name: 'Hip Pain with Stiffness (Osteoporosis Risk)', description: 'Pain, stiffness, with known low bone density, but not specifically worse with activity. Consider early OA or stress reaction.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Hip_pain' }],
    'yesyesnono': [{ name: 'Hip Arthritis / Bursitis (Early/Moderate)', description: 'Pain and stiffness, but not specifically worse with activity or known bone issues.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Hip_pain' }],
    'yesnoyesyes': [{ name: 'Activity-Related Hip Pain (Osteoporosis Risk)', description: 'Pain worse with activity, known low bone density. Could be stress fracture or OA flare.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Stress_fracture' }],
    'yesnoyesno': [{ name: 'Activity-Related Hip Pain (Bursitis/Tendonitis)', description: 'Pain primarily with activity. Could be bursitis, tendonitis, or muscle strain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Trochanteric_bursitis' }],
    'yesnonoyes': [{ name: 'Hip Pain with Osteoporosis History (Consult Doctor)', description: 'Pain in hip area with known low bone density, other symptoms less clear. Needs evaluation.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Osteoporosis' }],
    'yesnonono': [{ name: 'Mild Hip Pain / Strain', description: 'Pain in hip area without other strong indicators. Could be mild strain.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }],
    'noyesyesyes': [{ name: 'Hip Stiffness & Activity Pain (Osteoporosis Risk)', description: 'Stiffness, pain with activity, and known low bone density, but no initial groin/outer hip pain reported.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis' }],
    'noyesyesno': [{ name: 'Hip Stiffness & Activity Pain', description: 'Stiffness and pain with activity. Could be early OA or muscle imbalance.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Joint_stiffness' }],
    'noyesnoyes': [{ name: 'Hip Stiffness (Osteoporosis Risk, Consult Doctor)', description: 'Stiffness with known low bone density. Needs evaluation.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Joint_stiffness' }],
    'noyesnono': [{ name: 'Isolated Hip Stiffness (Monitor)', description: 'Stiffness without other major indicators. Monitor, consider stretching.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Joint_stiffness' }],
    'nonoyesyes': [{ name: 'Non-Specific Hip Symptoms (Osteoporosis Risk, Consult Doctor)', description: 'Pain worse with activity and osteoporosis history, but other symptoms vague. Needs evaluation.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Hip_pain' }],
    'nonoyesno': [{ name: 'Pain with Activity Only (Consult Doctor)', description: 'Pain primarily with activity. Could be various causes like tendonitis or strain. Consult if persistent.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Muscle_fatigue' }],
    'nononoyes': [{ name: 'Possible Osteoporosis Related Concern (Consult Doctor)', description: 'Known low bone density, but current hip symptoms are unclear. Regular check-up advised.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Osteoporosis' }],
    'nononono': [{ name: 'No Clear Indication (Monitor Symptoms)', description: 'No significant issues reported. Monitor and consult doctor if symptoms develop or persist.', severity: 'low', wiki: '' }]
  },
  'knee': {
    'yesyesyesyes': [{ name: 'Patellofemoral Pain Syndrome (Severe) / Ligament Injury (e.g., ACL)', description: 'Significant kneecap pain, swelling, instability, especially with high-risk activities.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Patellofemoral_pain_syndrome' }, { name: 'Osteoarthritis of Knee with Instability', description: 'Knee pain, swelling, and instability, common with activity.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Osteoarthritis_of_the_knee' }],
    'yesyesyesno': [{ name: 'Patellofemoral Pain Syndrome / Chondromalacia Patellae', description: 'Kneecap pain, swelling, instability, but not linked to specific high-risk activities.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Chondromalacia_patellae' }],
    'yesyesnoyes': [{ name: 'Knee Swelling & Pain (Possible Meniscus/Ligament Issue)', description: 'Kneecap pain, swelling, especially with high-risk activities, but less instability noted.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Meniscus_tear' }],
    'yesyesnono': [{ name: 'Knee Pain with Swelling (Arthritis/Bursitis)', description: 'Kneecap pain and swelling. Could be early arthritis or bursitis.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Knee_bursitis' }],
    'yesnoyesyes': [{ name: 'Knee Instability with Pain (Ligament Sprain/Meniscus)', description: 'Kneecap pain, instability, common in high-risk activities, less swelling.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Sprained_knee' }],
    'yesnoyesno': [{ name: 'Patellofemoral Pain / Mild Instability', description: 'Kneecap pain with some feeling of instability, other symptoms minor.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Patellofemoral_pain_syndrome' }],
    'yesnonoyes': [{ name: 'Activity-Related Kneecap Pain', description: 'Pain around kneecap, especially with high-risk activities. Common in runners/jumpers.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Jumper%27s_knee' }],
    'yesnonono': [{ name: 'Mild Kneecap Pain (Runner\'s Knee Early)', description: 'Pain around kneecap without other significant symptoms.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Patellofemoral_pain_syndrome' }],
    'noyesyesyes': [{ name: 'Knee Swelling & Instability (Meniscus/Ligament, Consult Doctor)', description: 'Swelling, instability, related to high-risk activities, even without direct kneecap pain focus.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Anterior_cruciate_ligament_injury' }],
    'noyesyesno': [{ name: 'Knee Swelling & Instability (Consult Doctor)', description: 'Swelling and instability without clear kneecap pain focus. Needs investigation.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Swollen_knee' }],
    'noyesnoyes': [{ name: 'Knee Swelling (Activity Related, Consult Doctor)', description: 'Swelling, especially with high-risk activities. Could be bursitis or other inflammatory issue.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Knee_bursitis' }],
    'noyesnono': [{ name: 'Isolated Knee Swelling (Consult Doctor)', description: 'Swelling without other major symptoms. Needs medical evaluation.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Swollen_knee' }],
    'nonoyesyes': [{ name: 'Knee Instability (Activity Related, Consult Doctor)', description: 'Instability with high-risk activities, other symptoms less clear. Possible ligament issue.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Sprained_knee' }],
    'nonoyesno': [{ name: 'Isolated Knee Instability (Consult Doctor)', description: 'Knee feels unstable without other prominent symptoms. Needs evaluation.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Joint_instability' }],
    'nononoyes': [{ name: 'Symptoms with High-Risk Activities (Non-Specific)', description: 'General discomfort with high-risk activities. Consider proper form/gear.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Sports_injury' }],
    'nononono': [{ name: 'No Clear Indication (Monitor Symptoms)', description: 'No significant issues reported. Monitor and consult doctor if symptoms develop or persist.', severity: 'low', wiki: '' }]
  },
  'left-foot': {
    'yesyesyesyes': [{ name: 'Plantar Fasciitis with Bunion & Neuroma (Footwear Aggravated)', description: 'Heel pain, bunion, nerve symptoms between toes, likely worsened by footwear.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Plantar_fasciitis' }, {name: 'Multiple Foot Issues (Consult Podiatrist)', description: 'Combination of heel pain, bunion, neuroma symptoms, and footwear influence requires specialist assessment.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Podiatry'}],
    'yesyesyesno': [{ name: 'Plantar Fasciitis with Bunion & Neuroma', description: 'Heel pain, bunion, nerve symptoms, footwear not specified as major factor.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Bunion' }],
    'yesyesnoyes': [{ name: 'Plantar Fasciitis & Bunion (Footwear Aggravated)', description: 'Heel pain and bunion, likely worsened by footwear, neuroma less prominent.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Plantar_fasciitis' }],
    'yesyesnono': [{ name: 'Plantar Fasciitis & Bunion', description: 'Heel pain and bunion present, other factors less clear.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Plantar_fasciitis' }],
    'yesnoyesyes': [{ name: 'Plantar Fasciitis & Morton\'s Neuroma (Footwear Aggravated)', description: 'Heel pain and nerve symptoms between toes, likely worsened by footwear.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Morton%27s_neuroma' }],
    'yesnoyesno': [{ name: 'Plantar Fasciitis & Morton\'s Neuroma', description: 'Heel pain and nerve symptoms between toes.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Plantar_fasciitis' }],
    'yesnonoyes': [{ name: 'Heel Pain (Footwear Related)', description: 'Heel pain, possibly from plantar fasciitis or Achilles tendinitis, aggravated by footwear.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Heel_pain' }],
    'yesnonono': [{ name: 'Isolated Heel Pain (Plantar Fasciitis Early)', description: 'Pain in heel, could be early plantar fasciitis.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Plantar_fasciitis' }],
    'noyesyesyes': [{ name: 'Bunion & Morton\'s Neuroma (Footwear Aggravated)', description: 'Bunion and nerve symptoms, likely worsened by footwear.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Bunion' }],
    'noyesyesno': [{ name: 'Bunion & Morton\'s Neuroma', description: 'Bunion and nerve symptoms, footwear not specified as major factor.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Morton%27s_neuroma' }],
    'noyesnoyes': [{ name: 'Bunion (Footwear Aggravated)', description: 'Bunion present, likely worsened by footwear.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Bunion' }],
    'noyesnono': [{ name: 'Isolated Bunion', description: 'Bony bump at big toe, could be a bunion.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Bunion' }],
    'nonoyesyes': [{ name: 'Morton\'s Neuroma (Footwear Aggravated)', description: 'Nerve symptoms between toes, likely worsened by footwear.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Morton%27s_neuroma' }],
    'nonoyesno': [{ name: 'Isolated Morton\'s Neuroma Symptoms', description: 'Nerve symptoms between toes. Could be Morton\'s Neuroma.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Morton%27s_neuroma' }],
    'nononoyes': [{ name: 'Foot Pain (Poor Footwear Choice)', description: 'General foot discomfort potentially related to footwear. Consider better shoes.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Foot_pain' }],
    'nononono': [{ name: 'No Clear Indication (Monitor Symptoms)', description: 'No significant issues reported. Monitor and consult doctor if symptoms develop or persist.', severity: 'low', wiki: '' }]
  },
  'right-foot': {
    'yesyesyesyes': [{ name: 'Plantar Fasciitis with Bunion & Neuroma (Footwear Aggravated)', description: 'Heel pain, bunion, nerve symptoms between toes, likely worsened by footwear.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Plantar_fasciitis' }, {name: 'Multiple Foot Issues (Consult Podiatrist)', description: 'Combination of heel pain, bunion, neuroma symptoms, and footwear influence requires specialist assessment.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Podiatry'}],
    'yesyesyesno': [{ name: 'Plantar Fasciitis with Bunion & Neuroma', description: 'Heel pain, bunion, nerve symptoms, footwear not specified as major factor.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Bunion' }],
    'yesyesnoyes': [{ name: 'Plantar Fasciitis & Bunion (Footwear Aggravated)', description: 'Heel pain and bunion, likely worsened by footwear, neuroma less prominent.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Plantar_fasciitis' }],
    'yesyesnono': [{ name: 'Plantar Fasciitis & Bunion', description: 'Heel pain and bunion present, other factors less clear.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Plantar_fasciitis' }],
    'yesnoyesyes': [{ name: 'Plantar Fasciitis & Morton\'s Neuroma (Footwear Aggravated)', description: 'Heel pain and nerve symptoms between toes, likely worsened by footwear.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Morton%27s_neuroma' }],
    'yesnoyesno': [{ name: 'Plantar Fasciitis & Morton\'s Neuroma', description: 'Heel pain and nerve symptoms between toes.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Plantar_fasciitis' }],
    'yesnonoyes': [{ name: 'Heel Pain (Footwear Related)', description: 'Heel pain, possibly from plantar fasciitis or Achilles tendinitis, aggravated by footwear.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Heel_pain' }],
    'yesnonono': [{ name: 'Isolated Heel Pain (Plantar Fasciitis Early)', description: 'Pain in heel, could be early plantar fasciitis.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Plantar_fasciitis' }],
    'noyesyesyes': [{ name: 'Bunion & Morton\'s Neuroma (Footwear Aggravated)', description: 'Bunion and nerve symptoms, likely worsened by footwear.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Bunion' }],
    'noyesyesno': [{ name: 'Bunion & Morton\'s Neuroma', description: 'Bunion and nerve symptoms, footwear not specified as major factor.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Morton%27s_neuroma' }],
    'noyesnoyes': [{ name: 'Bunion (Footwear Aggravated)', description: 'Bunion present, likely worsened by footwear.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Bunion' }],
    'noyesnono': [{ name: 'Isolated Bunion', description: 'Bony bump at big toe, could be a bunion.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Bunion' }],
    'nonoyesyes': [{ name: 'Morton\'s Neuroma (Footwear Aggravated)', description: 'Nerve symptoms between toes, likely worsened by footwear.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Morton%27s_neuroma' }],
    'nonoyesno': [{ name: 'Isolated Morton\'s Neuroma Symptoms', description: 'Nerve symptoms between toes. Could be Morton\'s Neuroma.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Morton%27s_neuroma' }],
    'nononoyes': [{ name: 'Foot Pain (Poor Footwear Choice)', description: 'General foot discomfort potentially related to footwear. Consider better shoes.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Foot_pain' }],
    'nononono': [{ name: 'No Clear Indication (Monitor Symptoms)', description: 'No significant issues reported. Monitor and consult doctor if symptoms develop or persist.', severity: 'low', wiki: '' }]
  },
  'spine': {
    'yesyesyesyes': [{ name: 'Thoracic Spine Dysfunction / Possible Osteoporotic Change with Postural Strain', description: 'Pain, stiffness, posture change, and worsening with prolonged positions suggest significant issue.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Kyphosis' }, { name: 'Ankylosing Spondylitis (Consider if other symptoms align)', description: 'Inflammatory arthritis affecting the spine, causing pain and stiffness.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Ankylosing_spondylitis' }],
    'yesyesyesno': [{ name: 'Thoracic Spine Pain with Stiffness & Posture Change', description: 'Pain, stiffness, posture change, but not specifically worse with prolonged positions.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Thoracic_vertebrae' }],
    'yesyesnoyes': [{ name: 'Postural Strain with Thoracic Pain & Stiffness', description: 'Pain and stiffness, worse with prolonged positions, posture change less prominent.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Upper_crossed_syndrome' }],
    'yesyesnono': [{ name: 'Thoracic Myofascial Pain / Mild Arthritis', description: 'Pain and stiffness in upper/mid back, other factors less clear.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Myofascial_pain_syndrome' }],
    'yesnoyesyes': [{ name: 'Postural Kyphosis / Osteoporotic Back Pain', description: 'Pain, posture change, worse with prolonged positions, stiffness less of a complaint.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Postural_kyphosis' }],
    'yesnoyesno': [{ name: 'Thoracic Pain with Posture Change', description: 'Pain and posture change, but not specifically stiff or worse with positions.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Back_pain' }],
    'yesnonoyes': [{ name: 'Activity/Position Related Thoracic Pain', description: 'Pain in upper/mid back, worse with prolonged positions, other symptoms minor.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Back_strain' }],
    'yesnonono': [{ name: 'Mild Upper/Mid Back Pain', description: 'Aching or sharp pain without other significant symptoms.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Back_pain' }],
    'noyesyesyes': [{ name: 'Significant Thoracic Stiffness & Postural Issue (Consult Doctor)', description: 'Stiffness, posture change, worse with positions, even without initial specific pain.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Spinal_stiffness' }],
    'noyesyesno': [{ name: 'Thoracic Stiffness with Posture Change', description: 'Stiffness and posture change, other factors less prominent.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Spinal_stiffness' }],
    'noyesnoyes': [{ name: 'Stiffness Worse with Prolonged Positions', description: 'Stiffness in upper/mid back, mainly related to posture/positions.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Myalgia' }],
    'noyesnono': [{ name: 'Isolated Upper/Mid Back Stiffness', description: 'Stiffness without other major symptoms. Monitor, consider stretching.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Spinal_stiffness' }],
    'nonoyesyes': [{ name: 'Posture Change with Positional Worsening (Consult Doctor)', description: 'Posture change and symptoms worsen with positions. Needs evaluation.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Lordosis' }],
    'nonoyesno': [{ name: 'Isolated Posture Change (Monitor/Consult)', description: 'Noticed posture change, other symptoms absent. Monitor or consult for assessment.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Posture_(psychology)' }],
    'nononoyes': [{ name: 'Pain with Prolonged Sitting/Standing (Non-Specific)', description: 'Pain related to posture. Consider ergonomic adjustments.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Ergonomics' }],
    'nononono': [{ name: 'No Clear Indication (Monitor Symptoms)', description: 'No significant issues reported. Monitor and consult doctor if symptoms develop or persist.', severity: 'low', wiki: '' }]
  },
  'lower-back': {
    'yesyesyesyes': [{ name: 'Cauda Equina Syndrome (Seek Urgent Medical Attention)', description: 'Radiating pain, stiffness, worse with activity, AND bowel/bladder changes or saddle numbness. This is a medical emergency.', severity: 'critical', wiki: 'https://en.wikipedia.org/wiki/Cauda_equina_syndrome' }, { name: 'Severe Sciatica / Herniated Disc with Red Flags', description: 'All symptoms present including red flags, requires urgent evaluation.', severity: 'critical', wiki: 'https://en.wikipedia.org/wiki/Spinal_disc_herniation' }],
    'yesyesyesno': [{ name: 'Sciatica / Lumbar Radiculopathy (Herniated Disc Likely)', description: 'Radiating pain, stiffness, worse with activity, but no red flag symptoms.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Sciatica' }, { name: 'Spinal Stenosis (Lumbar)', description: 'Narrowing of spinal canal causing radiating pain and stiffness.', severity: 'high', wiki: 'https://en.wikipedia.org/wiki/Spinal_stenosis' }],
    'yesyesnoyes': [{ name: 'Lower Back Pain with Stiffness & Red Flags (Seek Urgent Medical Attention)', description: 'Stiffness, radiating pain, and red flags, activity link less clear. Urgent evaluation needed.', severity: 'critical', wiki: 'https://en.wikipedia.org/wiki/Cauda_equina_syndrome' }],
    'yesyesnono': [{ name: 'Mechanical Lower Back Pain with Stiffness & Radiculopathy', description: 'Radiating pain and stiffness. Likely disc or facet joint issue.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Low_back_pain' }],
    'yesnoyesyes': [{ name: 'Radiating Pain, Worse with Activity & Red Flags (Seek Urgent Medical Attention)', description: 'Radiating pain, worse with activity, and red flags. Stiffness less prominent. Urgent evaluation.', severity: 'critical', wiki: 'https://en.wikipedia.org/wiki/Cauda_equina_syndrome' }],
    'yesnoyesno': [{ name: 'Sciatica / Nerve Root Irritation', description: 'Radiating pain, worse with activity. Stiffness not a major complaint, no red flags.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Sciatica' }],
    'yesnonoyes': [{ name: 'Radiating Pain with Red Flags (Seek Urgent Medical Attention)', description: 'Radiating pain and red flags. Other symptoms less prominent. Urgent evaluation.', severity: 'critical', wiki: 'https://en.wikipedia.org/wiki/Cauda_equina_syndrome' }],
    'yesnonono': [{ name: 'Mild Sciatica / Piriformis Syndrome', description: 'Radiating pain down the leg, without other major LBP symptoms. No red flags.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Piriformis_syndrome' }],
    'noyesyesyes': [{ name: 'Lower Back Stiffness, Activity Pain & Red Flags (Seek Urgent Medical Attention)', description: 'Stiffness, pain worse with activity, and red flags, but no initial radiating pain. Urgent evaluation.', severity: 'critical', wiki: 'https://en.wikipedia.org/wiki/Cauda_equina_syndrome' }],
    'noyesyesno': [{ name: 'Mechanical Lower Back Pain with Stiffness (Muscular/Facet)', description: 'Stiffness, pain worse with activity. Likely muscular or facet joint related. No red flags.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Facet_syndrome' }],
    'noyesnoyes': [{ name: 'Lower Back Stiffness with Red Flags (Seek Urgent Medical Attention)', description: 'Stiffness and red flags, other symptoms less prominent. Urgent evaluation.', severity: 'critical', wiki: 'https://en.wikipedia.org/wiki/Cauda_equina_syndrome' }],
    'noyesnono': [{ name: 'Isolated Lower Back Stiffness (Muscular)', description: 'Stiffness in lower back, likely muscular. No red flags.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Myalgia' }],
    'nonoyesyes': [{ name: 'Activity-Related Pain with Red Flags (Seek Urgent Medical Attention)', description: 'Pain worse with activity and red flags present. Other symptoms less prominent. Urgent evaluation.', severity: 'critical', wiki: 'https://en.wikipedia.org/wiki/Cauda_equina_syndrome' }],
    'nonoyesno': [{ name: 'Non-Specific Lower Back Pain (Activity Related)', description: 'Pain worse with activity. Likely muscular strain. No red flags.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Back_strain' }],
    'nononoyes': [{ name: 'Isolated Red Flag Symptoms (Seek Urgent Medical Attention)', description: 'Presence of bowel/bladder changes or saddle numbness requires immediate medical evaluation, even if other pain is minimal.', severity: 'critical', wiki: 'https://en.wikipedia.org/wiki/Cauda_equina_syndrome' }],
    'nononono': [{ name: 'No Clear Indication (Monitor Symptoms)', description: 'No significant issues reported. Monitor and consult doctor if symptoms develop or persist. If any red flag symptoms (Q4) develop, seek immediate help.', severity: 'low', wiki: '' }]
  },
  'back-shoulder-left': {
    'yesyesyesyes': [{ name: 'Scapular Dyskinesis / Myofascial Pain Syndrome (Severe)', description: 'Significant pain with reaching, stiffness, worse with overhead activity, and grinding.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Scapular_dyskinesis' }, { name: 'Possible Thoracic Outlet Syndrome (Consult Doctor)', description: 'Symptoms could indicate nerve/vessel compression near shoulder/neck.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Thoracic_outlet_syndrome'}],
    'yesyesyesno': [{ name: 'Scapular Area Pain with Stiffness & Activity Limitation', description: 'Pain, stiffness, worse with overhead activity, no grinding.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Myofascial_pain_syndrome' }],
    'yesyesnoyes': [{ name: 'Pain with Reaching & Stiffness, Grinding Present', description: 'Pain, stiffness, and grinding, but not specifically worse with overhead activities.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Crepitus' }],
    'yesyesnono': [{ name: 'Posterior Shoulder/Scapular Pain & Stiffness', description: 'Pain with reaching and stiffness. Consider muscle strain or postural issues.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Rhomboid_muscles' }],
    'yesnoyesyes': [{ name: 'Pain with Reaching, Overhead Activity & Grinding', description: 'Pain pattern suggests mechanical issue, stiffness less prominent.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Shoulder_pain' }],
    'yesnoyesno': [{ name: 'Pain with Reaching & Overhead Activity', description: 'Pain, worse with overhead tasks. Possible tendinopathy or impingement.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Tendinopathy' }],
    'yesnonoyes': [{ name: 'Pain with Reaching & Grinding (Consult Doctor)', description: 'Pain and grinding, other symptoms less clear. Could be joint or muscle issue.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Crepitus' }],
    'yesnonono': [{ name: 'Mild Pain When Reaching Behind Back', description: 'Isolated pain on specific movement. Monitor, could be minor strain.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }],
    'noyesyesyes': [{ name: 'Stiffness, Overhead Pain & Grinding (Consult Doctor)', description: 'Stiffness, pain with overhead use, and grinding. Evaluate for joint/muscle issues.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Shoulder_stiffness' }],
    'noyesyesno': [{ name: 'Stiffness & Overhead Pain (Scapular Area)', description: 'Stiffness and pain with overhead activity. Possible muscle imbalance or mild arthritis.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Myalgia' }],
    'noyesnoyes': [{ name: 'Stiffness & Grinding in Shoulder Blade Area', description: 'Stiffness and grinding sensation. Consider seeing a physical therapist.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Crepitus' }],
    'noyesnono': [{ name: 'Isolated Stiffness in Shoulder Blade Area', description: 'Stiffness without other major symptoms. Focus on posture and stretching.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Shoulder_stiffness' }],
    'nonoyesyes': [{ name: 'Pain with Overhead Activity & Grinding', description: 'Symptoms primarily with overhead use and grinding. Possible mechanical issue.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Shoulder_pain' }],
    'nonoyesno': [{ name: 'Pain with Overhead Activity Only (Scapular)', description: 'Pain in shoulder blade area with overhead tasks. Could be muscle strain.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Muscle_strain' }],
    'nononoyes': [{ name: 'Isolated Grinding Sensation (Monitor)', description: 'Grinding sensation without pain or stiffness. Monitor for other symptoms.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Crepitus' }],
    'nononono': [{ name: 'No Clear Indication (Monitor Symptoms)', description: 'No significant issues reported. Monitor and consult doctor if symptoms develop or persist.', severity: 'low', wiki: '' }]
  },
  'back-shoulder-right': {
    'yesyesyesyes': [{ name: 'Scapular Dyskinesis / Myofascial Pain Syndrome (Severe)', description: 'Significant pain with reaching, stiffness, worse with overhead activity, and grinding.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Scapular_dyskinesis' }, { name: 'Possible Thoracic Outlet Syndrome (Consult Doctor)', description: 'Symptoms could indicate nerve/vessel compression near shoulder/neck.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Thoracic_outlet_syndrome'}],
    'yesyesyesno': [{ name: 'Scapular Area Pain with Stiffness & Activity Limitation', description: 'Pain, stiffness, worse with overhead activity, no grinding.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Myofascial_pain_syndrome' }],
    'yesyesnoyes': [{ name: 'Pain with Reaching & Stiffness, Grinding Present', description: 'Pain, stiffness, and grinding, but not specifically worse with overhead activities.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Crepitus' }],
    'yesyesnono': [{ name: 'Posterior Shoulder/Scapular Pain & Stiffness', description: 'Pain with reaching and stiffness. Consider muscle strain or postural issues.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Rhomboid_muscles' }],
    'yesnoyesyes': [{ name: 'Pain with Reaching, Overhead Activity & Grinding', description: 'Pain pattern suggests mechanical issue, stiffness less prominent.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Shoulder_pain' }],
    'yesnoyesno': [{ name: 'Pain with Reaching & Overhead Activity', description: 'Pain, worse with overhead tasks. Possible tendinopathy or impingement.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Tendinopathy' }],
    'yesnonoyes': [{ name: 'Pain with Reaching & Grinding (Consult Doctor)', description: 'Pain and grinding, other symptoms less clear. Could be joint or muscle issue.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Crepitus' }],
    'yesnonono': [{ name: 'Mild Pain When Reaching Behind Back', description: 'Isolated pain on specific movement. Monitor, could be minor strain.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Strain_(injury)' }],
    'noyesyesyes': [{ name: 'Stiffness, Overhead Pain & Grinding (Consult Doctor)', description: 'Stiffness, pain with overhead use, and grinding. Evaluate for joint/muscle issues.', severity: 'medium', wiki: 'https://en.wikipedia.org/wiki/Shoulder_stiffness' }],
    'noyesyesno': [{ name: 'Stiffness & Overhead Pain (Scapular Area)', description: 'Stiffness and pain with overhead activity. Possible muscle imbalance or mild arthritis.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Myalgia' }],
    'noyesnoyes': [{ name: 'Stiffness & Grinding in Shoulder Blade Area', description: 'Stiffness and grinding sensation. Consider seeing a physical therapist.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Crepitus' }],
    'noyesnono': [{ name: 'Isolated Stiffness in Shoulder Blade Area', description: 'Stiffness without other major symptoms. Focus on posture and stretching.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Shoulder_stiffness' }],
    'nonoyesyes': [{ name: 'Pain with Overhead Activity & Grinding', description: 'Symptoms primarily with overhead use and grinding. Possible mechanical issue.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Shoulder_pain' }],
    'nonoyesno': [{ name: 'Pain with Overhead Activity Only (Scapular)', description: 'Pain in shoulder blade area with overhead tasks. Could be muscle strain.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Muscle_strain' }],
    'nononoyes': [{ name: 'Isolated Grinding Sensation (Monitor)', description: 'Grinding sensation without pain or stiffness. Monitor for other symptoms.', severity: 'low', wiki: 'https://en.wikipedia.org/wiki/Crepitus' }],
    'nononono': [{ name: 'No Clear Indication (Monitor Symptoms)', description: 'No significant issues reported. Monitor and consult doctor if symptoms develop or persist.', severity: 'low', wiki: '' }]
  }
};

let currentBodyPart = null;
let currentQuestionIndex = 0;
let userResponses = [];
let isDiagnosisInProgress = false;

async function saveDiagnosis(bodyPart, condition, description, severity) {
  const token = localStorage.getItem('token');
  if (!token) {
    showCustomAlert('Not Logged In', 'You must be logged in to save your diagnosis history.');
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
      showFeedbackMessage('Diagnosis saved successfully!');
    } else {
      const errorData = await response.json();
      showCustomAlert('Error', `Failed to save diagnosis: ${errorData.msg || 'Server error'}`);
    }
  } catch (error) {
    console.error('Error saving diagnosis:', error);
    showCustomAlert('Error', 'An error occurred while saving the diagnosis.');
  }
}

function startDiagnosticFlow(bodyPart) {
  if (isDiagnosisInProgress) {
    showCustomAlert("Diagnosis in Progress", "Please complete the current diagnosis before selecting another body part.");
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
  infoPanel.querySelector('h2').textContent = `Diagnosing ${bodyPart.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
  infoPanel.querySelectorAll('.info-text').forEach(p => p.style.display = 'none');

  if (['spine', 'lower-back', 'back-shoulder-left', 'back-shoulder-right'].includes(bodyPart)) {
    diagnosticFlow.classList.add('back-view');
  } else {
    diagnosticFlow.classList.remove('back-view');
  }

  renderQuestion();
}

function renderQuestion() {
  const questions = diagnosticQuestions[currentBodyPart];
  if (!questions || currentQuestionIndex >= questions.length) {
    showResults();
    return;
  }

  const totalQuestions = questions.length;
  const progressPercent = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;
  const question = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const questionHTML = `
    <div class="progress-bar-custom-container">
      <div class="progress-bar-text-custom">Question ${currentQuestionIndex + 1} of ${totalQuestions}</div>
      <div class="progress-bar-fill-wrapper-custom">
        <div class="progress-bar-fill-custom" style="width: ${progressPercent}%;"></div>
      </div>
    </div>
    <div class="question-container" role="region" aria-label="Diagnostic question ${currentQuestionIndex + 1}">
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

  const optionButtons = diagnosticFlow.querySelectorAll('.animated-button.option');
  const actionButton = diagnosticFlow.querySelector('.next-btn-animated, .show-results-btn-animated');

  optionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('disabled')) return;
      optionButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      actionButton.classList.remove('disabled');
      userResponses[currentQuestionIndex] = btn.getAttribute('data-option');
    });
  });

  actionButton.addEventListener('click', () => {
    if (actionButton.classList.contains('disabled')) return;
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

  if (diagnosticOutcomes[currentBodyPart] && diagnosticOutcomes[currentBodyPart][responseKey]) {
    outcomes = diagnosticOutcomes[currentBodyPart][responseKey];
  } else {
    outcomes = [{ name: 'Consult Healthcare Professional', description: 'Your combination of symptoms requires a professional evaluation for an accurate diagnosis.', severity: 'medium', wiki: '' }];
  }

  if (!Array.isArray(outcomes)) {
    outcomes = [outcomes];
  }

  diagnosticFlow.classList.remove('active');
  diagnosticFlow.innerHTML = '';
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
  infoPanel.querySelector('h2').textContent = 'Welcome to the Female Interactive Diagnostic Tool';
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
document.getElementById('current-year').textContent = new Date().getFullYear();