// Four Corner — Comprehensive Multi-Step Property Verification & Onboarding Engine

const FC_COORDINATES_PRESETS = {
  'Tellapur': { lat: 17.4526, lng: 78.2934 },
  'Kokapet': { lat: 17.3984, lng: 78.3308 },
  'Financial District': { lat: 17.4187, lng: 78.3448 },
  'Gachibowli': { lat: 17.4401, lng: 78.3489 },
  'Nanakramguda': { lat: 17.4208, lng: 78.3512 },
  'Narsingi': { lat: 17.3888, lng: 78.3582 },
  'Kollur': { lat: 17.4912, lng: 78.2619 },
  'Mokila': { lat: 17.4325, lng: 78.1822 },
  'Kompally': { lat: 17.5452, lng: 78.4893 },
  'Bachupally': { lat: 17.5348, lng: 78.3712 },
  'Miyapur': { lat: 17.4968, lng: 78.3614 },
  'Kukatpally': { lat: 17.4849, lng: 78.4138 },
  'Manikonda': { lat: 17.4022, lng: 78.3886 },
  'Puppalaguda': { lat: 17.4095, lng: 78.3744 },
  'Banjara Hills': { lat: 17.4156, lng: 78.4358 },
  'Jubilee Hills': { lat: 17.4319, lng: 78.4073 },
  'Madhapur': { lat: 17.4483, lng: 78.3915 },
  'Hitech City': { lat: 17.4474, lng: 78.3762 },
  'Uppal': { lat: 17.4024, lng: 78.5595 },
  'LB Nagar': { lat: 17.3551, lng: 78.5529 }
};

let fcOnboardingState = {
  currentStep: 1,
  maxStep: 6,
  isReraRegistered: true,
  hasOcIssued: false,
  walkthroughMode: 'url', // 'url' or 'file'
  unitCounter: 0,
  unitTypes: [],
  activeDraftId: null,
  files: {
    reraCert: null,
    permitCert: null,
    ocCert: null,
    masterPlan: null,
    walkthroughVideo: null,
    builderCostSheet: null,
    sitePhotos: []
  }
};

// ─── Modal / In-Page View Open & Close ───────────────────────────────────────────

function openAddProjectModal() {
  if (typeof switchView === 'function') {
    const activeBtn = document.getElementById('side-btn-add-project');
    const isAlreadyOnAddView = activeBtn && activeBtn.classList.contains('bg-[#6D001A]');
    if (!isAlreadyOnAddView) {
      switchView('add-project');
      return;
    }
  }

  const standardContainer = document.getElementById('standard-views-container');
  if (standardContainer) standardContainer.classList.add('hidden');

  const viewEl = document.getElementById('view-add-project') || document.getElementById('add-property-modal');
  if (viewEl) viewEl.classList.remove('hidden');

  // Reset or initialize if clean
  if (fcOnboardingState.unitTypes.length === 0) {
    resetOnboardingForm();
  } else {
    goToOnboardingStep(fcOnboardingState.currentStep || 1);
  }
}

function closeAddProjectModal() {
  if (typeof switchView === 'function') {
    switchView('projects');
  } else {
    const viewEl = document.getElementById('view-add-project') || document.getElementById('add-property-modal');
    if (viewEl) viewEl.classList.add('hidden');
    const standardContainer = document.getElementById('standard-views-container');
    if (standardContainer) standardContainer.classList.remove('hidden');
  }
}

function resetOnboardingForm() {
  fcOnboardingState = {
    currentStep: 1,
    maxStep: 6,
    isReraRegistered: true,
    hasOcIssued: false,
    walkthroughMode: 'url',
    unitCounter: 0,
    unitTypes: [],
    activeDraftId: null,
    files: {
      reraCert: null,
      permitCert: null,
      ocCert: null,
      masterPlan: null,
      walkthroughVideo: null,
      builderCostSheet: null,
      sitePhotos: []
    }
  };

  // Reset basic text fields if they exist
  const form = document.getElementById('fc-onboarding-form');
  if (form) form.reset();

  // Set default audit date to today (YYYY-MM-DD)
  const today = new Date().toISOString().slice(0, 10);
  const auditDateEl = document.getElementById('fc-audit-date');
  if (auditDateEl) auditDateEl.value = today;

  // Auditor ID default
  const auditorIdEl = document.getElementById('fc-auditor-id');
  if (auditorIdEl && !auditorIdEl.value) {
    auditorIdEl.value = `FC-AUD-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  // Pre-add 1 default unit typology
  const unitListContainer = document.getElementById('fc-unit-typologies-list');
  if (unitListContainer) {
    unitListContainer.innerHTML = '';
    addUnitTypology({
      name: '3BHK Luxury Elite',
      carpet: 1420,
      balcony: 120,
      sbu: 1980,
      tourUrl: ''
    });
  }

  // Clear previews
  clearAllFilePreviews();

  // Reset radio states
  setReraRegistered(true);
  setOcIssued(false);
  setWalkthroughMode('url');

  // Setup coordinates based on default micro market
  syncMicroMarketCoordinates();

  // Recalculate cost engine
  recalculateCostEngine();

  // Go to step 1
  goToOnboardingStep(1);
}

// ─── Step Navigation & Progress Indicator ─────────────────────────────────────

function goToOnboardingStep(step) {
  if (step < 1 || step > 6) return;

  // If jumping forward more than 1 step, ensure intermediate steps validate
  if (step > fcOnboardingState.currentStep) {
    for (let s = fcOnboardingState.currentStep; s < step; s++) {
      if (!validateStep(s, false)) {
        validateStep(s, true); // show error highlights
        return;
      }
    }
  }

  fcOnboardingState.currentStep = step;

  // Toggle step panels
  for (let s = 1; s <= 6; s++) {
    const panel = document.getElementById(`fc-step-panel-${s}`);
    if (panel) {
      if (s === step) {
        panel.classList.remove('hidden');
        panel.classList.add('animate-in', 'fade-in', 'duration-200');
      } else {
        panel.classList.add('hidden');
      }
    }

    // Step Stepper visual feedback
    const stepBtn = document.getElementById(`fc-step-nav-${s}`);
    const stepCircle = document.getElementById(`fc-step-circle-${s}`);
    const stepLabel = document.getElementById(`fc-step-label-${s}`);
    const stepLine = document.getElementById(`fc-step-line-${s}`);

    if (stepCircle) {
      if (s < step) {
        // Completed step
        stepCircle.className = 'w-8 h-8 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-xs transition-all';
        stepCircle.innerHTML = `<svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
      } else if (s === step) {
        // Current active step
        stepCircle.className = 'w-8 h-8 rounded-full bg-[#6D001A] text-white text-xs font-bold flex items-center justify-center ring-4 ring-[#6D001A]/20 shadow-md transition-all scale-105';
        stepCircle.textContent = s;
      } else {
        // Upcoming step
        stepCircle.className = 'w-8 h-8 rounded-full bg-slate-100 text-slate-400 border border-slate-200 text-xs font-semibold flex items-center justify-center transition-all';
        stepCircle.textContent = s;
      }
    }

    if (stepLabel) {
      if (s === step) {
        stepLabel.className = 'hidden sm:block text-xs font-bold text-[#6D001A] transition-colors';
      } else if (s < step) {
        stepLabel.className = 'hidden sm:block text-xs font-semibold text-emerald-700 transition-colors';
      } else {
        stepLabel.className = 'hidden sm:block text-xs font-medium text-slate-400 transition-colors';
      }
    }

    if (stepLine) {
      if (s < step) {
        stepLine.className = 'flex-1 h-0.5 bg-emerald-500 transition-all';
      } else {
        stepLine.className = 'flex-1 h-0.5 bg-slate-200 transition-all';
      }
    }
  }


  // On Step 1: Back is NOT visible, only Cancel is visible on the left
  // On Step 2+: Back with arrow is visible first, and Cancel next
  const prevBtn = document.getElementById('fc-prev-onboarding-btn');
  if (prevBtn) {
    if (step === 1) {
      prevBtn.classList.add('hidden');
    } else {
      prevBtn.classList.remove('hidden');
    }
  }

  // Update top action button label on step changes
  const submitBtn = document.getElementById('fc-submit-onboarding-btn');
  if (submitBtn) {
    if (step === 6) {
      submitBtn.innerHTML = `<span>Submit Project for Audit ✓</span>`;
    } else {
      submitBtn.innerHTML = `<span>Continue →</span>`;
    }
  }

  // If entering section 5 or 6, trigger cost and review refresh
  if (step === 5) {
    recalculateCostEngine();
  } else if (step === 6) {
    renderAuditSummarySection();
  }

  // Scroll main view to top smoothly
  const mainScrollArea = document.querySelector('main') || document.getElementById('fc-onboarding-modal-scroll');
  if (mainScrollArea) mainScrollArea.scrollTo({ top: 0, behavior: 'smooth' });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextOnboardingStep() {
  const current = fcOnboardingState.currentStep;
  if (!validateStep(current, true)) {
    return;
  }
  if (current < 6) {
    goToOnboardingStep(current + 1);
  } else {
    submitProjectOnboarding();
  }
}

function prevOnboardingStep() {
  if (fcOnboardingState.currentStep > 1) {
    goToOnboardingStep(fcOnboardingState.currentStep - 1);
  }
}

// ─── Conditional Logic Branches (Section 2 & Section 3) ───────────────────────

function setReraRegistered(isRera) {
  fcOnboardingState.isReraRegistered = isRera;

  const btnYes = document.getElementById('fc-rera-toggle-yes');
  const btnNo = document.getElementById('fc-rera-toggle-no');
  const reraYesPanel = document.getElementById('fc-sec2-rera-yes-panel');
  const reraNoPanel = document.getElementById('fc-sec2-rera-no-panel');

  if (btnYes && btnNo) {
    if (isRera) {
      btnYes.className = 'flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#6D001A] text-white shadow-xs transition-all';
      btnNo.className = 'flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition-all';
    } else {
      btnNo.className = 'flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-600 text-white shadow-xs transition-all';
      btnYes.className = 'flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition-all';
    }
  }

  if (reraYesPanel && reraNoPanel) {
    if (isRera) {
      reraYesPanel.classList.remove('hidden');
      reraNoPanel.classList.add('hidden');
    } else {
      reraYesPanel.classList.add('hidden');
      reraNoPanel.classList.remove('hidden');
    }
  }
}

function setOcIssued(hasOc) {
  fcOnboardingState.hasOcIssued = hasOc;

  const btnYes = document.getElementById('fc-oc-toggle-yes');
  const btnNo = document.getElementById('fc-oc-toggle-no');
  const ocYesPanel = document.getElementById('fc-sec2-oc-yes-panel');
  const ocNoPanel = document.getElementById('fc-sec2-oc-no-panel');

  if (btnYes && btnNo) {
    if (hasOc) {
      btnYes.className = 'px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-xs transition-all';
      btnNo.className = 'px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition-all';
    } else {
      btnNo.className = 'px-4 py-2 rounded-lg text-xs font-bold bg-slate-700 text-white shadow-xs transition-all';
      btnYes.className = 'px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition-all';
    }
  }

  if (ocYesPanel && ocNoPanel) {
    if (hasOc) {
      ocYesPanel.classList.remove('hidden');
      ocNoPanel.classList.add('hidden');
    } else {
      ocYesPanel.classList.add('hidden');
      ocNoPanel.classList.remove('hidden');
    }
  }
}

function setWalkthroughMode(mode) {
  fcOnboardingState.walkthroughMode = mode;
  const tabUrl = document.getElementById('fc-walkthrough-tab-url');
  const tabFile = document.getElementById('fc-walkthrough-tab-file');
  const panelUrl = document.getElementById('fc-walkthrough-panel-url');
  const panelFile = document.getElementById('fc-walkthrough-panel-file');

  if (tabUrl && tabFile) {
    if (mode === 'url') {
      tabUrl.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-900 shadow-xs border border-slate-200';
      tabFile.className = 'px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800';
    } else {
      tabFile.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-900 shadow-xs border border-slate-200';
      tabUrl.className = 'px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800';
    }
  }

  if (panelUrl && panelFile) {
    if (mode === 'url') {
      panelUrl.classList.remove('hidden');
      panelFile.classList.add('hidden');
    } else {
      panelUrl.classList.add('hidden');
      panelFile.classList.remove('hidden');
    }
  }
}

// ─── Section 4: Unit Typologies Manager & Auto-Calculations ───────────────────

function addUnitTypology(initialData = null) {
  fcOnboardingState.unitCounter++;
  const unitId = `unit_${fcOnboardingState.unitCounter}_${Date.now().toString(36)}`;
  const defaultData = initialData || {
    name: `Unit Typology ${fcOnboardingState.unitCounter}`,
    carpet: 1350,
    balcony: 100,
    sbu: 1850,
    tourUrl: ''
  };

  const unitObj = {
    id: unitId,
    name: defaultData.name,
    carpet: defaultData.carpet,
    balcony: defaultData.balcony,
    sbu: defaultData.sbu,
    loadingFactor: 0,
    floorPlanFile: null,
    tourUrl: defaultData.tourUrl
  };

  fcOnboardingState.unitTypes.push(unitObj);

  const container = document.getElementById('fc-unit-typologies-list');
  if (!container) return;

  const card = document.createElement('div');
  card.id = `unit-card-${unitId}`;
  card.className = 'p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4 transition-all hover:border-slate-300';
  card.innerHTML = `
    <div class="flex items-center justify-between pb-3 border-b border-slate-100">
      <div class="flex items-center gap-2.5">
        <div class="w-6 h-6 rounded-lg bg-red-50 text-[#6D001A] font-bold text-xs flex items-center justify-center">
          ${fcOnboardingState.unitTypes.length}
        </div>
        <span class="text-sm font-bold text-slate-900" id="unit-title-display-${unitId}">${escapeHtml(unitObj.name)}</span>
      </div>
      <div class="flex items-center gap-2">
        <button type="button" onclick="removeUnitTypology('${unitId}')"
          class="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer" title="Remove unit typology">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Inputs Row 1: Name and 3D Tour -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Typology Name <span class="text-red-500">*</span></label>
        <input type="text" id="unit-name-${unitId}" value="${escapeHtml(unitObj.name)}"
          oninput="handleUnitTypologyChange('${unitId}')" placeholder="e.g., 3BHK Type-A (West)"
          class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#6D001A] focus:bg-white transition">
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Unit 3D Tour / Interactive Walkthrough URL <span class="text-slate-400 font-normal">(Optional)</span></label>
        <input type="url" id="unit-tour-${unitId}" value="${escapeHtml(unitObj.tourUrl)}"
          oninput="handleUnitTypologyChange('${unitId}')" placeholder="https://my.matterport.com/show/?m=..."
          class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#6D001A] focus:bg-white transition">
      </div>
    </div>

    <!-- Inputs Row 2: Carpet, Balcony, Super Built-up, Loading Factor -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">RERA Carpet Area (sq. ft.) <span class="text-red-500">*</span></label>
        <input type="number" id="unit-carpet-${unitId}" value="${unitObj.carpet}" min="100" max="25000"
          oninput="handleUnitTypologyChange('${unitId}')"
          class="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-[#6D001A]">
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Exclusive Balcony & Utility (sq. ft.) <span class="text-red-500">*</span></label>
        <input type="number" id="unit-balcony-${unitId}" value="${unitObj.balcony}" min="0" max="5000"
          oninput="handleUnitTypologyChange('${unitId}')"
          class="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-[#6D001A]">
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Super Built-up / Saleable Area (sq. ft.) <span class="text-red-500">*</span></label>
        <input type="number" id="unit-sbu-${unitId}" value="${unitObj.sbu}" min="150" max="35000"
          oninput="handleUnitTypologyChange('${unitId}')"
          class="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-[#6D001A]">
      </div>
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Loading Factor (%) <span class="text-slate-400 font-normal">(Auto)</span></label>
        <input type="text" id="unit-loading-${unitId}" readonly
          class="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-700 cursor-not-allowed">
      </div>
    </div>

    <!-- Sanctioned Unit Floor Plan Upload with drag & drop -->
    <div>
      <label class="block text-xs font-semibold text-slate-700 mb-1">Sanctioned Unit Floor Plan <span class="text-red-500">*</span> <span class="text-slate-400 font-normal">(PNG, JPG, or PDF • Max 25MB)</span></label>
      <div id="dropzone-floorplan-${unitId}"
        class="border-2 border-dashed border-slate-200 hover:border-[#6D001A] rounded-xl p-3 text-center bg-slate-50/60 hover:bg-red-50/20 transition-all cursor-pointer">
        <input type="file" id="file-floorplan-${unitId}" accept=".pdf,image/png,image/jpeg,image/webp" class="hidden"
          onchange="handleUnitFloorPlanFile(this, '${unitId}')">
        <div id="preview-floorplan-${unitId}" class="flex items-center justify-center gap-3">
          <svg class="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
          <span class="text-xs text-slate-600 font-medium">Click or drag & drop sanctioned floor plan image/PDF</span>
        </div>
      </div>
    </div>
  `;

  container.appendChild(card);

  // Setup drag and drop for floor plan
  const dropzone = document.getElementById(`dropzone-floorplan-${unitId}`);
  const fileInput = document.getElementById(`file-floorplan-${unitId}`);
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('border-[#6D001A]', 'bg-red-50/40');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('border-[#6D001A]', 'bg-red-50/40');
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('border-[#6D001A]', 'bg-red-50/40');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        fileInput.files = e.dataTransfer.files;
        handleUnitFloorPlanFile(fileInput, unitId);
      }
    });
  }

  // Calculate loading factor
  handleUnitTypologyChange(unitId);
}

function removeUnitTypology(unitId) {
  if (fcOnboardingState.unitTypes.length <= 1) {
    showToast('At least one unit typology is required.', false);
    return;
  }
  fcOnboardingState.unitTypes = fcOnboardingState.unitTypes.filter(u => u.id !== unitId);
  const card = document.getElementById(`unit-card-${unitId}`);
  if (card) card.remove();
  recalculateCostEngine();
}

function handleUnitTypologyChange(unitId) {
  const u = fcOnboardingState.unitTypes.find(x => x.id === unitId);
  if (!u) return;

  const nameVal = document.getElementById(`unit-name-${unitId}`)?.value.trim() || 'Untitled Unit';
  const carpetVal = parseFloat(document.getElementById(`unit-carpet-${unitId}`)?.value) || 0;
  const balconyVal = parseFloat(document.getElementById(`unit-balcony-${unitId}`)?.value) || 0;
  const sbuVal = parseFloat(document.getElementById(`unit-sbu-${unitId}`)?.value) || 0;
  const tourVal = document.getElementById(`unit-tour-${unitId}`)?.value.trim() || '';

  u.name = nameVal;
  u.carpet = carpetVal;
  u.balcony = balconyVal;
  u.sbu = sbuVal;
  u.tourUrl = tourVal;

  const titleEl = document.getElementById(`unit-title-display-${unitId}`);
  if (titleEl) titleEl.textContent = nameVal;

  // Loading Factor formula: ((Super Built-up - Carpet Area) / Carpet Area) * 100
  let loadingPct = 0;
  if (carpetVal > 0 && sbuVal >= carpetVal) {
    loadingPct = ((sbuVal - carpetVal) / carpetVal) * 100;
  } else if (carpetVal > 0 && sbuVal > 0) {
    loadingPct = 0;
  }
  u.loadingFactor = parseFloat(loadingPct.toFixed(1));

  const loadingInput = document.getElementById(`unit-loading-${unitId}`);
  if (loadingInput) loadingInput.value = `${u.loadingFactor}%`;


  recalculateCostEngine();
}

function handleUnitFloorPlanFile(input, unitId) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  if (file.size > 25 * 1024 * 1024) {
    showToast('File size exceeds the 25MB maximum limit.', false);
    input.value = '';
    return;
  }

  const u = fcOnboardingState.unitTypes.find(x => x.id === unitId);
  if (u) u.floorPlanFile = file;

  const preview = document.getElementById(`preview-floorplan-${unitId}`);
  if (!preview) return;

  const sizeKb = (file.size / 1024).toFixed(1);
  const isImage = file.type.startsWith('image/');

  if (isImage) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `
        <div class="flex items-center gap-3 w-full justify-between">
          <div class="flex items-center gap-2.5">
            <img src="${e.target.result}" class="w-10 h-10 object-cover rounded-lg border border-slate-200 shadow-xs" alt="Plan Preview">
            <div class="text-left">
              <div class="text-xs font-bold text-slate-800 truncate max-w-[200px]">${escapeHtml(file.name)}</div>
              <div class="text-[10px] text-slate-400 font-mono">${sizeKb} KB • Image Verified</div>
            </div>
          </div>
          <span class="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Attached ✓</span>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = `
      <div class="flex items-center gap-3 w-full justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs font-mono">PDF</div>
          <div class="text-left">
            <div class="text-xs font-bold text-slate-800 truncate max-w-[200px]">${escapeHtml(file.name)}</div>
            <div class="text-[10px] text-slate-400 font-mono">${sizeKb} KB • Plan Document Verified</div>
          </div>
        </div>
        <span class="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Attached ✓</span>
      </div>
    `;
  }
}

// ─── Section 5: Transparent Cost Breakdown ───────────────────────────────────

function recalculateCostEngine() {
  // Read inputs from Section 5
  const baseRate = parseFloat(document.getElementById('fc-cost-base-price')?.value) || 7500;
  const floorRise = parseFloat(document.getElementById('fc-cost-floor-rise')?.value) || 0;
  const facingSurcharge = parseFloat(document.getElementById('fc-cost-facing-surcharge')?.value) || 0;
  const parkingCharge = parseFloat(document.getElementById('fc-cost-parking-charge')?.value) || 450000;
  const parkingSlots = parseInt(document.getElementById('fc-cost-parking-slots')?.value) || 1;
  const clubhouseFee = parseFloat(document.getElementById('fc-cost-clubhouse-fee')?.value) || 350000;
  const infraFee = parseFloat(document.getElementById('fc-cost-infra-fee')?.value) || 250000;
  const maintenanceFund = parseFloat(document.getElementById('fc-cost-maintenance-fund')?.value) || 150000;
  const gstRate = parseFloat(document.getElementById('fc-cost-gst-rate')?.value) || 5.0; // %
  const stampDutyRate = parseFloat(document.getElementById('fc-cost-stamp-duty-rate')?.value) || 7.6; // %

  // Reference primary unit (or average across units)
  const primaryUnit = fcOnboardingState.unitTypes[0] || { sbu: 1850, carpet: 1350 };
  const sbu = primaryUnit.sbu || 1850;
  const carpet = primaryUnit.carpet || 1350;

  // Rate additions per sq ft (assume 5th floor average for floor rise preview)
  const effectiveBaseRate = baseRate + (floorRise * 4);
  const baseUnitCost = sbu * effectiveBaseRate;
  const parkingTotal = parkingCharge * (parkingSlots === 3 ? 2 : parkingSlots); // tandem counts ~2
  const fixedAmenitiesCost = clubhouseFee + infraFee + maintenanceFund + facingSurcharge;
  const subtotalBeforeTax = baseUnitCost + parkingTotal + fixedAmenitiesCost;

  const gstAmount = Math.round(subtotalBeforeTax * (gstRate / 100));
  const stampDutyAmount = Math.round(subtotalBeforeTax * (stampDutyRate / 100));
  const grandTotal = subtotalBeforeTax + gstAmount + stampDutyAmount;
  const grandTotalCr = (grandTotal / 10000000).toFixed(2);
  const effectiveCarpetRate = Math.round(grandTotal / carpet);

  // Update UI Elements in Section 5
  const displayTotalCr = document.getElementById('fc-cost-preview-grand-total');
  const displayTotalInr = document.getElementById('fc-cost-preview-grand-inr');
  const displayEffectiveCarpet = document.getElementById('fc-cost-preview-carpet-rate');
  const displayBreakdownBase = document.getElementById('fc-cost-preview-breakdown-base');
  const displayBreakdownFixed = document.getElementById('fc-cost-preview-breakdown-fixed');
  const displayBreakdownTaxes = document.getElementById('fc-cost-preview-breakdown-taxes');

  if (displayTotalCr) displayTotalCr.textContent = `₹${grandTotalCr} Cr`;
  if (displayTotalInr) displayTotalInr.textContent = `₹${formatInr(grandTotal)}`;
  if (displayEffectiveCarpet) displayEffectiveCarpet.textContent = `₹${formatInr(effectiveCarpetRate)} / sq ft`;

  if (displayBreakdownBase) displayBreakdownBase.textContent = `₹${(baseUnitCost / 100000).toFixed(1)} L`;
  if (displayBreakdownFixed) displayBreakdownFixed.textContent = `₹${((parkingTotal + fixedAmenitiesCost) / 100000).toFixed(1)} L`;
  if (displayBreakdownTaxes) displayBreakdownTaxes.textContent = `₹${((gstAmount + stampDutyAmount) / 100000).toFixed(1)} L`;
}

function formatInr(num) {
  return Number(num).toLocaleString('en-IN');
}

// ─── Section 6: Map Picker & Site Photos ──────────────────────────────────────

function syncMicroMarketCoordinates() {
  const mmEl = document.getElementById('fc-micro-market');
  if (!mmEl) return;
  const selected = mmEl.value;
  const coords = FC_COORDINATES_PRESETS[selected] || { lat: 17.4401, lng: 78.3489 };

  const latEl = document.getElementById('fc-audit-lat');
  const lngEl = document.getElementById('fc-audit-lng');
  if (latEl && !latEl.value) latEl.value = coords.lat.toFixed(5);
  if (lngEl && !lngEl.value) lngEl.value = coords.lng.toFixed(5);
}

function pickCoordinatesOnMap() {
  const mmEl = document.getElementById('fc-micro-market');
  const market = mmEl ? mmEl.value : 'Financial District';
  const coords = FC_COORDINATES_PRESETS[market] || { lat: 17.4401, lng: 78.3489 };

  // Small perturbation for real site pinpointing
  const lat = (coords.lat + (Math.random() - 0.5) * 0.006).toFixed(5);
  const lng = (coords.lng + (Math.random() - 0.5) * 0.006).toFixed(5);

  const latEl = document.getElementById('fc-audit-lat');
  const lngEl = document.getElementById('fc-audit-lng');
  if (latEl) latEl.value = lat;
  if (lngEl) lngEl.value = lng;

  showToast(`Geographic coordinates verified for ${market} (${lat}, ${lng}).`, true);
}

function handleSitePhotosUpload(input) {
  if (!input.files || !input.files.length) return;
  const files = Array.from(input.files);

  for (const f of files) {
    if (f.size > 25 * 1024 * 1024) {
      showToast(`Photo "${f.name}" exceeds 25MB and was skipped.`, false);
      continue;
    }
    fcOnboardingState.files.sitePhotos.push(f);
  }

  renderSitePhotosGrid();
}

function renderSitePhotosGrid() {
  const container = document.getElementById('fc-site-photos-grid');
  const counterEl = document.getElementById('fc-site-photos-counter');
  if (!container) return;

  const count = fcOnboardingState.files.sitePhotos.length;
  if (counterEl) {
    if (count >= 3) {
      counterEl.className = 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200';
      counterEl.textContent = `${count} of min 3 uploaded ✓ (Requirement Met)`;
    } else {
      counterEl.className = 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200';
      counterEl.textContent = `${count} of min 3 uploaded (Need ${3 - count} more)`;
    }
  }

  if (count === 0) {
    container.innerHTML = `
      <div class="col-span-full py-6 text-center text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
        No site photos uploaded yet. Minimum 3 required (Site gate, ongoing construction work, and approach road).
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  fcOnboardingState.files.sitePhotos.forEach((file, idx) => {
    const card = document.createElement('div');
    card.className = 'relative group rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs aspect-video';

    const reader = new FileReader();
    reader.onload = (e) => {
      card.innerHTML = `
        <img src="${e.target.result}" class="w-full h-full object-cover" alt="Site photo ${idx + 1}">
        <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-2">
          <span class="text-[10px] text-white font-mono bg-black/60 px-1.5 py-0.5 rounded">Photo ${idx + 1}</span>
          <button type="button" onclick="removeSitePhoto(${idx})" class="p-1 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer transition">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      `;
    };
    reader.readAsDataURL(file);
    container.appendChild(card);
  });
}

function removeSitePhoto(index) {
  fcOnboardingState.files.sitePhotos.splice(index, 1);
  renderSitePhotosGrid();
}

// ─── Drag & Drop Generic File Handlers ────────────────────────────────────────

function setupDropzone(dropzoneId, inputId, previewId, fileKey, acceptedType = 'any') {
  const dropzone = document.getElementById(dropzoneId);
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!dropzone || !input || !preview) return;

  dropzone.addEventListener('click', () => input.click());
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('border-[#6D001A]', 'bg-red-50/30');
  });
  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('border-[#6D001A]', 'bg-red-50/30');
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-[#6D001A]', 'bg-red-50/30');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      input.files = e.dataTransfer.files;
      handleGenericFileUpload(input, previewId, fileKey);
    }
  });

  input.addEventListener('change', () => {
    handleGenericFileUpload(input, previewId, fileKey);
  });
}

function handleGenericFileUpload(input, previewId, fileKey) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];

  if (file.size > 25 * 1024 * 1024) {
    showToast(`File "${file.name}" exceeds 25MB max size limit.`, false);
    input.value = '';
    return;
  }

  fcOnboardingState.files[fileKey] = file;
  const preview = document.getElementById(previewId);
  if (!preview) return;

  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

  if (isImage) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `
        <div class="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 w-full shadow-xs">
          <div class="flex items-center gap-3">
            <img src="${e.target.result}" class="w-11 h-11 object-cover rounded-lg border border-slate-200" alt="Preview">
            <div>
              <div class="text-xs font-bold text-slate-900 truncate max-w-[240px]">${escapeHtml(file.name)}</div>
              <div class="text-[10px] text-slate-400 font-mono">${sizeMb} MB • Image Verified</div>
            </div>
          </div>
          <button type="button" onclick="clearSpecificFile('${fileKey}', '${input.id}', '${previewId}')"
            class="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  } else if (isPdf) {
    preview.innerHTML = `
      <div class="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 w-full shadow-xs">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs font-mono">PDF</div>
          <div>
            <div class="text-xs font-bold text-slate-900 truncate max-w-[240px]">${escapeHtml(file.name)}</div>
            <div class="text-[10px] text-slate-400 font-mono">${sizeMb} MB • Official Document</div>
          </div>
        </div>
        <button type="button" onclick="clearSpecificFile('${fileKey}', '${input.id}', '${previewId}')"
          class="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `;
  } else {
    // Video or other
    preview.innerHTML = `
      <div class="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 w-full shadow-xs">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs font-mono">VID</div>
          <div>
            <div class="text-xs font-bold text-slate-900 truncate max-w-[240px]">${escapeHtml(file.name)}</div>
            <div class="text-[10px] text-slate-400 font-mono">${sizeMb} MB • Media Verified</div>
          </div>
        </div>
        <button type="button" onclick="clearSpecificFile('${fileKey}', '${input.id}', '${previewId}')"
          class="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `;
  }
}

function clearSpecificFile(fileKey, inputId, previewId) {
  fcOnboardingState.files[fileKey] = null;
  const input = document.getElementById(inputId);
  if (input) input.value = '';
  const preview = document.getElementById(previewId);
  if (preview) {
    preview.innerHTML = `
      <div class="flex items-center justify-center gap-3 py-2 text-slate-500 text-xs">
        <svg class="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <span>Click or drag and drop file here (PDF/Image • Max 25MB)</span>
      </div>
    `;
  }
}

function clearAllFilePreviews() {
  const uploadKeys = [
    { key: 'reraCert', input: 'fc-upload-rera-cert', preview: 'fc-preview-rera-cert' },
    { key: 'permitCert', input: 'fc-upload-permit-cert', preview: 'fc-preview-permit-cert' },
    { key: 'ocCert', input: 'fc-upload-oc-cert', preview: 'fc-preview-oc-cert' },
    { key: 'masterPlan', input: 'fc-upload-master-plan', preview: 'fc-preview-master-plan' },
    { key: 'walkthroughVideo', input: 'fc-upload-walkthrough-video', preview: 'fc-preview-walkthrough-video' },
    { key: 'builderCostSheet', input: 'fc-upload-cost-sheet', preview: 'fc-preview-cost-sheet' }
  ];

  uploadKeys.forEach(u => clearSpecificFile(u.key, u.input, u.preview));
  renderSitePhotosGrid();
}

// ─── Strict Field Validation Engine ───────────────────────────────────────────

function markFieldStatus(elementId, isValid, errorMessage = '') {
  const el = document.getElementById(elementId);
  if (!el) return;

  const existingErr = document.getElementById(`${elementId}-err`);
  if (isValid) {
    el.classList.remove('border-red-500', 'ring-2', 'ring-red-200');
    el.classList.add('border-slate-300');
    if (existingErr) existingErr.remove();
  } else {
    el.classList.add('border-red-500', 'ring-2', 'ring-red-200');
    el.classList.remove('border-slate-300');
    if (!existingErr && errorMessage) {
      const err = document.createElement('div');
      err.id = `${elementId}-err`;
      err.className = 'text-[11px] font-semibold text-red-600 mt-1';
      err.textContent = errorMessage;
      el.parentNode.appendChild(err);
    }
  }
}

function validateStep(step, showFeedback = true) {
  let isValid = true;
  let firstErrorField = null;

  function check(fieldId, condition, errMsg) {
    if (!condition) {
      isValid = false;
      if (showFeedback) {
        markFieldStatus(fieldId, false, errMsg);
        if (!firstErrorField) firstErrorField = fieldId;
      }
    } else {
      if (showFeedback) markFieldStatus(fieldId, true);
    }
  }

  if (step === 1) {
    const name = document.getElementById('fc-project-name')?.value.trim();
    const dev = document.getElementById('fc-developer-name')?.value.trim();
    const type = document.getElementById('fc-project-type')?.value;

    check('fc-project-name', !!name, 'Project Name is required');
    check('fc-developer-name', !!dev, 'Developer / Promoter Name is required');
    check('fc-project-type', !!type, 'Please select Project Type');
  }

  else if (step === 2) {
    if (fcOnboardingState.isReraRegistered) {
      const authority = document.getElementById('fc-rera-authority')?.value;
      const reraNum = document.getElementById('fc-rera-number')?.value.trim();
      const reraDeadline = document.getElementById('fc-rera-deadline')?.value;
      const promisedDate = document.getElementById('fc-promised-date')?.value;
      const encumbrance = document.getElementById('fc-encumbrance-status')?.value;
      const hasCert = !!fcOnboardingState.files.reraCert;

      check('fc-rera-authority', !!authority, 'State RERA Authority is required');
      check('fc-rera-number', !!reraNum, 'RERA Registration Number is required');
      check('fc-rera-deadline', !!reraDeadline, 'RERA Approved Completion Deadline is required');
      check('fc-promised-date', !!promisedDate, 'Promised Possession Date is required');
      check('fc-encumbrance-status', !!encumbrance, 'Encumbrance / Mortgage Status is required');
      check('dropzone-rera-cert', hasCert, 'RERA Registration Certificate (PDF) is required');
    } else {
      const reason = document.getElementById('fc-exemption-reason')?.value;
      const auth = document.getElementById('fc-planning-authority')?.value.trim();
      const permitNo = document.getElementById('fc-permit-order-no')?.value.trim();
      const issueDate = document.getElementById('fc-permit-issue-date')?.value;
      const expiryDate = document.getElementById('fc-permit-expiry-date')?.value;
      const hasPermit = !!fcOnboardingState.files.permitCert;

      check('fc-exemption-reason', !!reason, 'Reason for Exemption is required');
      check('fc-planning-authority', !!auth, 'Planning Authority is required');
      check('fc-permit-order-no', !!permitNo, 'Building Permit Order Number is required');
      check('fc-permit-issue-date', !!issueDate, 'Permit Issue Date is required');
      check('fc-permit-expiry-date', !!expiryDate, 'Permit Expiry Date is required');
      check('dropzone-permit-cert', hasPermit, 'Municipal Building Permit (PDF) is required');

      if (fcOnboardingState.hasOcIssued) {
        const ocNo = document.getElementById('fc-oc-number')?.value.trim();
        const hasOcCert = !!fcOnboardingState.files.ocCert;
        check('fc-oc-number', !!ocNo, 'OC/CC Reference Number is required');
        check('dropzone-oc-cert', hasOcCert, 'OC/CC Certificate (PDF) is required');
      } else {
        const riskSummary = document.getElementById('fc-legal-risk-summary')?.value.trim();
        check('fc-legal-risk-summary', !!riskSummary, 'Legal Approval Status & Risk Summary is required');
      }
    }
  }

  else if (step === 3) {
    const towers = parseInt(document.getElementById('fc-total-towers')?.value) || 0;
    const units = parseInt(document.getElementById('fc-total-units')?.value) || 0;
    const roadWidth = parseFloat(document.getElementById('fc-road-width')?.value) || 0;
    const hasMasterPlan = !!fcOnboardingState.files.masterPlan;

    check('fc-total-towers', towers > 0, 'Total Sanctioned Towers must be > 0');
    check('fc-total-units', units > 0, 'Total Sanctioned Units must be > 0');
    check('fc-road-width', roadWidth >= 20, 'Approach road width must be at least 20 ft');
    check('dropzone-master-plan', hasMasterPlan, 'Approved Master Layout Plan is required');
  }

  else if (step === 4) {
    if (fcOnboardingState.unitTypes.length === 0) {
      if (showFeedback) showToast('Please add at least one Unit Typology.', false);
      return false;
    }

    for (const u of fcOnboardingState.unitTypes) {
      if (!u.name || !u.name.trim()) {
        if (showFeedback) showToast('All Unit Typologies must have a Typology Name.', false);
        return false;
      }
      if (!u.carpet || u.carpet <= 0) {
        if (showFeedback) showToast(`Carpet Area for "${u.name}" must be greater than 0.`, false);
        return false;
      }
      if (!u.sbu || u.sbu <= u.carpet) {
        if (showFeedback) showToast(`Saleable Area for "${u.name}" must be greater than Carpet Area.`, false);
        return false;
      }
      if (!u.floorPlanFile) {
        if (showFeedback) showToast(`Sanctioned Floor Plan is required for "${u.name}".`, false);
        return false;
      }
    }
  }

  else if (step === 5) {
    const basePrice = parseFloat(document.getElementById('fc-cost-base-price')?.value) || 0;
    const parkingCharge = parseFloat(document.getElementById('fc-cost-parking-charge')?.value) || 0;
    const clubhouseFee = parseFloat(document.getElementById('fc-cost-clubhouse-fee')?.value) || 0;
    const infraFee = parseFloat(document.getElementById('fc-cost-infra-fee')?.value) || 0;
    const maintenanceFund = parseFloat(document.getElementById('fc-cost-maintenance-fund')?.value) || 0;
    const hasCostSheet = !!fcOnboardingState.files.builderCostSheet;

    check('fc-cost-base-price', basePrice > 1000, 'Base Selling Price must be at least ₹1,000/sq ft');
    check('fc-cost-parking-charge', parkingCharge >= 0, 'Parking Charges must be specified');
    check('fc-cost-clubhouse-fee', clubhouseFee >= 0, 'Clubhouse Fee is required');
    check('fc-cost-infra-fee', infraFee >= 0, 'Infrastructure fee is required');
    check('fc-cost-maintenance-fund', maintenanceFund >= 0, 'Maintenance fund is required');
    check('dropzone-cost-sheet', hasCostSheet, 'Official Builder Cost Sheet is required');
  }

  else if (step === 6) {
    const lat = parseFloat(document.getElementById('fc-audit-lat')?.value) || 0;
    const lng = parseFloat(document.getElementById('fc-audit-lng')?.value) || 0;
    const auditorName = document.getElementById('fc-auditor-id')?.value.trim();
    const badge = document.getElementById('fc-verification-badge')?.value;
    const photoCount = fcOnboardingState.files.sitePhotos.length;

    check('fc-audit-lat', lat > 10 && lat < 30, 'Valid Latitude is required');
    check('fc-audit-lng', lng > 70 && lng < 90, 'Valid Longitude is required');
    check('fc-auditor-id', !!auditorName, 'Internal Auditor Name / ID is required');
    check('fc-verification-badge', !!badge, 'Assigned Verification Badge is required');
    check('dropzone-site-photos', photoCount >= 3, 'Minimum 3 actual site photos are required');
  }

  if (!isValid && showFeedback) {
    showToast('Please complete all required fields and uploads before proceeding.', false);
    if (firstErrorField) {
      const el = document.getElementById(firstErrorField);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  return isValid;
}

// ─── Section 6 Summary Renderer ───────────────────────────────────────────────

function renderAuditSummarySection() {
  const panel = document.getElementById('fc-audit-summary-container');
  if (!panel) return;

  const projName = document.getElementById('fc-project-name')?.value.trim() || 'Untitled Project';
  const dev = document.getElementById('fc-developer-name')?.value.trim() || 'Developer';
  const type = document.getElementById('fc-project-type')?.value || 'Residential Apartment';
  const market = document.getElementById('fc-micro-market')?.value || 'Financial District';
  const reraNum = fcOnboardingState.isReraRegistered ? (document.getElementById('fc-rera-number')?.value.trim() || 'TS RERA Verified') : 'Municipal Approved Only';
  const towers = document.getElementById('fc-total-towers')?.value || '4';
  const units = document.getElementById('fc-total-units')?.value || '320';
  const badge = document.getElementById('fc-verification-badge')?.value || 'Four Corner RERA Verified';

  const badgeColors = {
    'Four Corner RERA Verified': 'bg-emerald-50 text-emerald-700 border-emerald-300',
    'Four Corner Municipal Approved': 'bg-blue-50 text-blue-700 border-blue-300',
    'Title Vetted Only': 'bg-amber-50 text-amber-700 border-amber-300',
    'Verification Rejected': 'bg-red-50 text-red-700 border-red-300'
  };

  const badgeClass = badgeColors[badge] || 'bg-slate-100 text-slate-700 border-slate-300';

  panel.innerHTML = `
    <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-base font-bold text-slate-900">${escapeHtml(projName)}</span>
            <span class="text-xs px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-semibold">${escapeHtml(type)}</span>
          </div>
          <div class="text-xs text-slate-500 mt-0.5">${escapeHtml(dev)} • ${escapeHtml(market)} • ${escapeHtml(reraNum)}</div>
        </div>
        <div class="px-3 py-1.5 rounded-xl border text-xs font-bold ${badgeClass}">
          ${escapeHtml(badge)}
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div class="p-2.5 rounded-xl bg-white border border-slate-100">
          <div class="text-[10px] text-slate-400 font-semibold uppercase">Total Towers</div>
          <div class="text-sm font-bold text-slate-800 mt-0.5">${towers} Blocks</div>
        </div>
        <div class="p-2.5 rounded-xl bg-white border border-slate-100">
          <div class="text-[10px] text-slate-400 font-semibold uppercase">Sanctioned Units</div>
          <div class="text-sm font-bold text-slate-800 mt-0.5">${units} Units</div>
        </div>
        <div class="p-2.5 rounded-xl bg-white border border-slate-100">
          <div class="text-[10px] text-slate-400 font-semibold uppercase">Typologies Configured</div>
          <div class="text-sm font-bold text-slate-800 mt-0.5">${fcOnboardingState.unitTypes.length} Configurations</div>
        </div>
        <div class="p-2.5 rounded-xl bg-white border border-slate-100">
          <div class="text-[10px] text-slate-400 font-semibold uppercase">Ground Photos</div>
          <div class="text-sm font-bold text-emerald-700 mt-0.5">${fcOnboardingState.files.sitePhotos.length} Verified Images</div>
        </div>
      </div>
    </div>
  `;
}

// ─── Project Submission & Backend Synchronization ─────────────────────────────

async function submitProjectOnboarding() {
  // Validate all 6 steps
  for (let s = 1; s <= 6; s++) {
    if (!validateStep(s, true)) {
      goToOnboardingStep(s);
      return;
    }
  }

  const submitBtn = document.getElementById('fc-submit-onboarding-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="w-4 h-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10"/>
      </svg>
      <span>Certifying & Onboarding...</span>
    `;
  }

  const projName = document.getElementById('fc-project-name').value.trim();
  const dev = document.getElementById('fc-developer-name').value.trim();
  const tagline = document.getElementById('fc-tagline')?.value.trim() || '';
  const type = document.getElementById('fc-project-type').value;
  const url = document.getElementById('fc-promoter-url')?.value.trim() || '';
  const market = document.getElementById('fc-micro-market')?.value || 'Tellapur';

  // Compliance
  const isRera = fcOnboardingState.isReraRegistered;
  const reraNum = isRera ? document.getElementById('fc-rera-number').value.trim() : `MUN-${Date.now().toString().slice(-6)}`;
  const handoverYear = isRera
    ? (new Date(document.getElementById('fc-promised-date').value).getFullYear() || 2026)
    : 2026;

  // Section 3: Land & Layout Details
  const landExtent = parseFloat(document.getElementById('fc-land-extent')?.value) || 10.0;
  const totalTowers = parseInt(document.getElementById('fc-total-towers')?.value) || 4;
  const totalUnits = parseInt(document.getElementById('fc-total-units')?.value) || 500;
  const openSpacePct = parseFloat(document.getElementById('fc-open-space-ratio')?.value) || 75.0;
  const roadWidth = parseFloat(document.getElementById('fc-road-width')?.value) || 100.0;
  const waterSources = Array.from(document.querySelectorAll('input[name="fc-water-source"]:checked'))
    .map(cb => cb.value)
    .join(', ') || 'Municipal Pipeline';

  // Section 5: Costs
  const baseRate = parseInt(document.getElementById('fc-cost-base-price')?.value) || 7500;
  const parkingCharge = parseInt(document.getElementById('fc-cost-parking-charge')?.value) || 450000;
  const clubhouseFee = parseInt(document.getElementById('fc-cost-clubhouse-fee')?.value) || 350000;
  const infraFee = parseInt(document.getElementById('fc-cost-infra-fee')?.value) || 250000;

  // Section 6: Audit
  const lat = parseFloat(document.getElementById('fc-audit-lat')?.value) || 17.44;
  const lng = parseFloat(document.getElementById('fc-audit-lng')?.value) || 78.34;
  const roadCondition = document.getElementById('fc-audit-road-condition')?.value || 'Fully Paved/Bitumen';
  const constructionStage = document.getElementById('fc-audit-construction-stage')?.value || 'Mid-Rise Slabs';
  const auditorName = document.getElementById('fc-auditor-id')?.value.trim() || 'Internal Auditor';
  const assignedBadge = document.getElementById('fc-verification-badge')?.value || 'Four Corner RERA Verified';
  const redFlagNotes = document.getElementById('fc-auditor-notes')?.value.trim() || '';

  // Section 4: Units
  const unitsPayload = fcOnboardingState.unitTypes.map((u, i) => {
    const nameLower = (u.name || '').toLowerCase();
    let bhk = 3.0;
    const bhkMatch = u.name.match(/(\d+(\.\d+)?)\s*bhk/i);
    if (bhkMatch) {
      bhk = parseFloat(bhkMatch[1]);
    } else if (nameLower.includes('4')) {
      bhk = 4.0;
    } else if (nameLower.includes('2.5')) {
      bhk = 2.5;
    } else if (nameLower.includes('2')) {
      bhk = 2.0;
    }

    let facing = 'East';
    if (nameLower.includes('west')) facing = 'West';
    else if (nameLower.includes('north')) facing = 'North';
    else if (nameLower.includes('south')) facing = 'South';

    const isCorner = nameLower.includes('corner');
    const sbu = parseInt(u.sbu) || 1850;
    const carpet = parseInt(u.carpet) || Math.round(sbu * 0.74);
    const balcony = parseInt(u.balcony) || 85;

    return {
      bhk,
      facing,
      super_built_up_sqft: sbu,
      carpet_area_sqft: carpet,
      balcony_sqft: balcony,
      balcony_facing: facing,
      base_rate_per_sqft: baseRate,
      is_corner_unit: isCorner,
      has_morning_sunlight: facing === 'East' || facing === 'North'
    };
  });

  // Helper to read file as base64 data URL
  const readFileAsDataUrl = (file) => {
    return new Promise((resolve) => {
      if (!file) return resolve('');
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // 1. Process Master Layout Plan
  let masterPlanUrl = '';
  if (fcOnboardingState.files && fcOnboardingState.files.masterPlan) {
    masterPlanUrl = await readFileAsDataUrl(fcOnboardingState.files.masterPlan);
  }

  // 2. Process Cost Sheet
  let costSheetUrl = '';
  if (fcOnboardingState.files && fcOnboardingState.files.builderCostSheet) {
    costSheetUrl = await readFileAsDataUrl(fcOnboardingState.files.builderCostSheet);
  }

  // 3. Process RERA Certificate
  let reraCertUrl = '';
  if (fcOnboardingState.files && fcOnboardingState.files.reraCert) {
    reraCertUrl = await readFileAsDataUrl(fcOnboardingState.files.reraCert);
  }

  // 4. Process Walkthrough Video (URL or file)
  let walkthroughVideoUrl = '';
  const urlInput = document.getElementById('fc-walkthrough-video-url');
  if (urlInput && urlInput.value.trim()) {
    walkthroughVideoUrl = urlInput.value.trim();
  } else if (fcOnboardingState.files && fcOnboardingState.files.walkthroughVideo) {
    walkthroughVideoUrl = await readFileAsDataUrl(fcOnboardingState.files.walkthroughVideo);
  }

  // 5. Process Multi-Image Site Photos
  const sitePhotosUrls = [];
  if (fcOnboardingState.files && fcOnboardingState.files.sitePhotos && fcOnboardingState.files.sitePhotos.length > 0) {
    for (const f of fcOnboardingState.files.sitePhotos) {
      const dataUrl = await readFileAsDataUrl(f);
      if (dataUrl) sitePhotosUrls.push(dataUrl);
    }
  }

  // 6. Process Unit Typology Floor Plans
  for (let i = 0; i < fcOnboardingState.unitTypes.length; i++) {
    const u = fcOnboardingState.unitTypes[i];
    if (u.floorPlanFile && unitsPayload[i]) {
      unitsPayload[i].floor_plan_image_url = await readFileAsDataUrl(u.floorPlanFile);
    }
  }

  const heroImageUrl = sitePhotosUrls.length > 0 ? sitePhotosUrls[0] : '';

  const payload = {
    project_name: projName,
    developer: dev,
    tagline,
    project_type: type,
    official_url: url,
    micro_market: market,
    rera_id: reraNum,
    handover_year: handoverYear,
    is_rera_registered: isRera,
    total_acres: landExtent,
    total_towers: totalTowers,
    approved_towers: totalTowers,
    total_units: totalUnits,
    open_space_pct: openSpacePct,
    road_width_feet: roadWidth,
    water_source: waterSources,
    clubhouse_sqft: 45000,
    base_rate_per_sqft: baseRate,
    parking_charges: parkingCharge,
    clubhouse_charges: clubhouseFee,
    infra_charges: infraFee,
    assigned_badge: assignedBadge,
    verification_status: assignedBadge,
    auditor_id: auditorName,
    latitude: lat,
    longitude: lng,
    construction_stage: constructionStage,
    road_condition: roadCondition,
    red_flag_notes: redFlagNotes,
    hero_image_url: heroImageUrl,
    gallery_images: sitePhotosUrls,
    site_progress_photos: sitePhotosUrls,
    walkthrough_video_url: walkthroughVideoUrl,
    drone_footage_url: walkthroughVideoUrl,
    brochure_pdf_url: costSheetUrl || reraCertUrl || '',
    master_plan_url: masterPlanUrl,
    cost_sheet_pdf_url: costSheetUrl,
    rera_certificate_url: reraCertUrl,
    units: unitsPayload
  };

  try {
    // 1. Persist directly into the database via backend endpoint
    const response = await postRegisterProject(payload);

    // 2. Fetch fresh database data immediately
    if (typeof loadProjectsData === 'function') {
      await loadProjectsData();
    }
    if (typeof loadOverviewData === 'function') {
      await loadOverviewData();
    }

    // 3. Close modal, clear saved draft, & reset form
    if (fcOnboardingState.activeDraftId) {
      let drafts = getSavedDrafts();
      drafts = drafts.filter(d => d.id !== fcOnboardingState.activeDraftId);
      saveDraftsList(drafts);
      fcOnboardingState.activeDraftId = null;
    }
    closeAddProjectModal();
    resetOnboardingForm();

    // 4. Show success confirmation toast
    showToast(`Property "${projName}" certified & saved directly to database!`, true);

    // 5. Navigate to Projects Registry view
    if (typeof switchView === 'function') {
      switchView('projects');
    }
  } catch (err) {
    console.error('Failed to register project in database:', err);
    showToast(`Failed to store in database: ${err.message || 'Server error'}`, false);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span>Certify & Onboard Property</span>
      `;
    }
  }
}

// ─── Initialize Onboarding Dropzones & Listeners on Page Ready ─────────────────

function initOnboardingModule() {
  setupDropzone('dropzone-rera-cert', 'fc-upload-rera-cert', 'fc-preview-rera-cert', 'reraCert', 'pdf');
  setupDropzone('dropzone-permit-cert', 'fc-upload-permit-cert', 'fc-preview-permit-cert', 'permitCert', 'pdf');
  setupDropzone('dropzone-oc-cert', 'fc-upload-oc-cert', 'fc-preview-oc-cert', 'ocCert', 'pdf');
  setupDropzone('dropzone-master-plan', 'fc-upload-master-plan', 'fc-preview-master-plan', 'masterPlan', 'image/pdf');
  setupDropzone('dropzone-walkthrough-video', 'fc-upload-walkthrough-video', 'fc-preview-walkthrough-video', 'walkthroughVideo', 'video');
  setupDropzone('dropzone-cost-sheet', 'fc-upload-cost-sheet', 'fc-preview-cost-sheet', 'builderCostSheet', 'pdf/image');

  // Site photos dropzone
  const sitePhotosDropzone = document.getElementById('dropzone-site-photos');
  const sitePhotosInput = document.getElementById('fc-upload-site-photos');
  if (sitePhotosDropzone && sitePhotosInput) {
    sitePhotosDropzone.addEventListener('click', () => sitePhotosInput.click());
    sitePhotosDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      sitePhotosDropzone.classList.add('border-[#6D001A]', 'bg-red-50/30');
    });
    sitePhotosDropzone.addEventListener('dragleave', () => {
      sitePhotosDropzone.classList.remove('border-[#6D001A]', 'bg-red-50/30');
    });
    sitePhotosDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      sitePhotosDropzone.classList.remove('border-[#6D001A]', 'bg-red-50/30');
      if (e.dataTransfer.files && e.dataTransfer.files.length) {
        sitePhotosInput.files = e.dataTransfer.files;
        handleSitePhotosUpload(sitePhotosInput);
      }
    });
    sitePhotosInput.addEventListener('change', () => {
      handleSitePhotosUpload(sitePhotosInput);
    });
  }

  // Micro market sync
  const mm = document.getElementById('fc-micro-market');
  if (mm) {
    mm.addEventListener('change', syncMicroMarketCoordinates);
  }

  // Update sidebar saved draft badge
  updateSidebarDraftCount();
}

document.addEventListener('DOMContentLoaded', () => {
  initOnboardingModule();
});

// ─── Draft Management & Cancel Pop-up System ───────────────────────────────────

const FC_DRAFTS_STORAGE_KEY = 'fc_saved_drafts_v1';

function getSavedDrafts() {
  try {
    const raw = localStorage.getItem(FC_DRAFTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse saved drafts', e);
    return [];
  }
}

function saveDraftsList(drafts) {
  try {
    localStorage.setItem(FC_DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    updateSidebarDraftCount();
  } catch (e) {
    console.error('Failed to save drafts list', e);
  }
}

function updateSidebarDraftCount() {
  const drafts = getSavedDrafts();
  const countEl = document.getElementById('side-drafts-count');
  if (countEl) {
    countEl.textContent = drafts.length;
    countEl.classList.toggle('hidden', drafts.length === 0);
  }
  const badgeEl = document.getElementById('drafts-count-badge');
  if (badgeEl) {
    badgeEl.textContent = `${drafts.length} Draft${drafts.length === 1 ? '' : 's'}`;
  }
}

function handleOnboardingCancelClick() {
  const modal = document.getElementById('fc-cancel-draft-modal');
  if (!modal) {
    if (typeof switchView === 'function') switchView('projects');
    return;
  }

  // Set modal draft preview info
  const projName = document.getElementById('fc-project-name')?.value?.trim() || 'Untitled Project';
  const nameEl = document.getElementById('fc-modal-draft-project-name');
  if (nameEl) nameEl.textContent = projName;

  const stepEl = document.getElementById('fc-modal-draft-step-label');
  if (stepEl) stepEl.textContent = `Step ${fcOnboardingState.currentStep} of 6`;

  modal.classList.remove('hidden');
}

function closeCancelDraftModal() {
  const modal = document.getElementById('fc-cancel-draft-modal');
  if (modal) modal.classList.add('hidden');
}

function saveDraftAndExit() {
  const saved = saveCurrentDraft();
  closeCancelDraftModal();
  if (typeof showToast === 'function') {
    showToast(`Draft saved: "${saved.projectName}". Resume anytime from Saved Drafts.`);
  }
  if (typeof switchView === 'function') {
    switchView('saved-drafts');
  }
}

function discardAndExit() {
  closeCancelDraftModal();
  fcOnboardingState.activeDraftId = null;
  resetOnboardingForm();
  if (typeof showToast === 'function') {
    showToast('Changes discarded.');
  }
  if (typeof switchView === 'function') {
    switchView('projects');
  }
}

function saveDraftQuick() {
  const saved = saveCurrentDraft();
  if (typeof showToast === 'function') {
    showToast(`Draft saved: "${saved.projectName}". Saved in Saved Drafts.`);
  }
}

function serializeOnboardingFormData() {
  const form = document.getElementById('fc-onboarding-form');
  const values = {};
  if (!form) return values;

  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(el => {
    if (!el.id) return;
    if (el.type === 'checkbox' || el.type === 'radio') {
      values[el.id] = { checked: el.checked, value: el.value, type: el.type };
    } else if (el.type !== 'file') {
      values[el.id] = { value: el.value, type: el.type };
    }
  });
  return values;
}

function saveCurrentDraft() {
  const drafts = getSavedDrafts();
  const projName = document.getElementById('fc-project-name')?.value?.trim() || 'Untitled Project';
  const devName = document.getElementById('fc-developer-name')?.value?.trim() || 'Unspecified Developer';
  const microMarket = document.getElementById('fc-micro-market')?.value || 'Tellapur';
  const reraNum = document.getElementById('fc-rera-number')?.value?.trim() || '';

  const draftId = fcOnboardingState.activeDraftId || `draft_${Date.now()}`;
  fcOnboardingState.activeDraftId = draftId;

  const draftObj = {
    id: draftId,
    projectName: projName,
    developer: devName,
    microMarket: microMarket,
    reraNumber: reraNum,
    step: fcOnboardingState.currentStep || 1,
    savedAt: new Date().toISOString(),
    formData: serializeOnboardingFormData(),
    state: {
      isReraRegistered: fcOnboardingState.isReraRegistered,
      hasOcIssued: fcOnboardingState.hasOcIssued,
      walkthroughMode: fcOnboardingState.walkthroughMode,
      unitTypes: JSON.parse(JSON.stringify(fcOnboardingState.unitTypes || []))
    }
  };

  const existingIdx = drafts.findIndex(d => d.id === draftId);
  if (existingIdx >= 0) {
    drafts[existingIdx] = draftObj;
  } else {
    drafts.unshift(draftObj);
  }

  saveDraftsList(drafts);
  return draftObj;
}

function restoreDraftData(draft) {
  if (!draft) return;

  // Restore form inputs
  if (draft.formData) {
    Object.keys(draft.formData).forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const data = draft.formData[id];
      if (data.type === 'checkbox' || data.type === 'radio') {
        el.checked = !!data.checked;
      } else if (data.value !== undefined) {
        el.value = data.value;
      }
    });
  }

  // Restore state flags
  if (draft.state) {
    if (typeof draft.state.isReraRegistered === 'boolean') {
      setReraRegistered(draft.state.isReraRegistered);
    }
    if (typeof draft.state.hasOcIssued === 'boolean') {
      setOcIssued(draft.state.hasOcIssued);
    }
    if (draft.state.walkthroughMode) {
      setWalkthroughMode(draft.state.walkthroughMode);
    }

    // Restore unit typologies
    fcOnboardingState.unitTypes = [];
    const container = document.getElementById('fc-unit-typologies-list');
    if (container) container.innerHTML = '';
    if (Array.isArray(draft.state.unitTypes) && draft.state.unitTypes.length > 0) {
      draft.state.unitTypes.forEach(u => addUnitTypology(u));
    } else {
      addUnitTypology({ name: '3BHK Luxury Elite', carpet: 1420, balcony: 120, sbu: 1980, tourUrl: '' });
    }
  }

  fcOnboardingState.activeDraftId = draft.id;
  syncMicroMarketCoordinates();
  recalculateCostEngine();
}

function resumeDraft(draftId) {
  const drafts = getSavedDrafts();
  const draft = drafts.find(d => d.id === draftId);
  if (!draft) {
    if (typeof showToast === 'function') showToast('Draft not found.');
    return;
  }

  restoreDraftData(draft);
  if (typeof switchView === 'function') {
    switchView('add-project');
  } else {
    openAddProjectModal();
  }

  goToOnboardingStep(draft.step || 1);
  if (typeof showToast === 'function') {
    showToast(`Resumed draft for "${draft.projectName}".`);
  }
}

function deleteSavedDraft(draftId, event) {
  if (event) event.stopPropagation();
  if (!confirm('Are you sure you want to permanently delete this draft application?')) return;

  let drafts = getSavedDrafts();
  drafts = drafts.filter(d => d.id !== draftId);
  saveDraftsList(drafts);

  if (fcOnboardingState.activeDraftId === draftId) {
    fcOnboardingState.activeDraftId = null;
  }

  renderSavedDraftsView();
  if (typeof showToast === 'function') {
    showToast('Draft deleted.');
  }
}

function startFreshProjectApplication() {
  fcOnboardingState.activeDraftId = null;
  resetOnboardingForm();
  if (typeof switchView === 'function') {
    switchView('add-project');
  } else {
    openAddProjectModal();
  }
  goToOnboardingStep(1);
}

const STEP_TITLES = {
  1: 'Identity & Promoter',
  2: 'Compliance & Permits',
  3: 'Land & Master Layout',
  4: 'Unit Typologies',
  5: 'Cost & Price Matrix',
  6: 'Audit Clearance'
};

function renderSavedDraftsView() {
  updateSidebarDraftCount();
  const listContainer = document.getElementById('saved-drafts-list');
  if (!listContainer) return;

  const drafts = getSavedDrafts();
  if (drafts.length === 0) {
    listContainer.innerHTML = `
      <div class="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs space-y-3">
        <div class="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 mx-auto flex items-center justify-center">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
        </div>
        <h3 class="text-sm font-bold text-slate-800">No Draft Applications Saved</h3>
        <p class="text-xs text-slate-400 max-w-md mx-auto">
          When you click "Cancel" while creating or verifying a project and choose "Save Draft", your entered details, survey parcels, and unit configurations will be stored here.
        </p>
        <button onclick="startFreshProjectApplication()" class="mt-2 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#6D001A] text-white text-xs font-semibold hover:bg-[#520013] transition shadow-xs cursor-pointer">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Start New Application</span>
        </button>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = drafts.map(d => {
    const stepNum = d.step || 1;
    const stepName = STEP_TITLES[stepNum] || 'Application Setup';
    const pct = Math.round((stepNum / 6) * 100);
    const dateFormatted = d.savedAt ? new Date(d.savedAt).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : 'Recently';

    return `
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
        <div class="space-y-4">
          
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#6D001A]/10 text-[#6D001A] mb-1.5">
                Draft Application
              </span>
              <h3 class="text-base font-bold text-slate-900 truncate group-hover:text-[#6D001A] transition-colors" title="${d.projectName || 'Untitled'}">
                ${d.projectName || 'Untitled Project'}
              </h3>
              <p class="text-xs text-slate-500 truncate mt-0.5">${d.developer || 'Developer unassigned'} • ${d.microMarket || 'Hyderabad'}</p>
            </div>
            <button onclick="deleteSavedDraft('${d.id}', event)" title="Delete Draft"
              class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition cursor-pointer shrink-0">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>

          <div class="space-y-1.5 pt-1">
            <div class="flex items-center justify-between text-xs">
              <span class="font-semibold text-slate-700">Section ${stepNum}: ${stepName}</span>
              <span class="font-mono text-slate-400 font-bold">${pct}%</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div class="bg-[#6D001A] h-1.5 rounded-full transition-all duration-300" style="width: ${pct}%"></div>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
            <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Saved ${dateFormatted}</span>
          </div>

        </div>

        <div class="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button onclick="resumeDraft('${d.id}')"
            class="w-full py-2.5 px-4 rounded-xl bg-[#6D001A] hover:bg-[#520013] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <span>Continue Application</span>
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

      </div>
    `;
  }).join('');
}
