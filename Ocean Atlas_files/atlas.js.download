/* ==========================================================================
   OCEAN ATLAS - INTERACTIVE 3D GLOBE & OCEAN DIVE ENGINE
   ========================================================================== */

(function() {
  'use strict';

  // --------------------------------------------------------------------------
  // GLOBE CONFIG & STATE
  // --------------------------------------------------------------------------
  const globeCanvas = document.getElementById('globe');
  const ctx = globeCanvas ? globeCanvas.getContext('2d') : null;

  let globeRadius = 320;
  let yaw = 82 * Math.PI / 180;    // Longitude focus (starts at Indian Ocean 82°E)
  let pitch = -5 * Math.PI / 180;  // Latitude tilt (~5°N)
  let targetYaw = yaw;
  let targetPitch = pitch;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let startYaw = 0;
  let startPitch = 0;
  let velocityX = 0;
  let velocityY = 0;
  let lastX = 0;
  let lastY = 0;
  let autoRotate = true;
  let autoRotateTimer = null;

  // Key ocean coordinates [lon, lat]
  const OCEANS = {
    'Indian':   { lon: 82,   lat: 4,   title: 'Indian Ocean', desc: 'Bay of Bengal & Arabian Sea' },
    'Pacific':  { lon: -160, lat: 0,   title: 'Pacific Ocean', desc: 'Mariana Trench & Coral Sea' },
    'Atlantic': { lon: -35,  lat: 18,  title: 'Atlantic Ocean', desc: 'Gulf Stream & Mid-Atlantic Ridge' },
    'Southern': { lon: 30,   lat: -62, title: 'Southern Ocean', desc: 'Antarctic Circumpolar Current' },
    'Arctic':   { lon: 15,   lat: 82,  title: 'Arctic Ocean', desc: 'Fram Strait & Sea Ice Margin' }
  };

  // Simplified continent polygons [lon, lat]
  const CONTINENTS = [
    // Africa
    [[35, -22], [31, -2], [12, 14], [32, 28], [26, 35], [10, 37], [-5, 36], [-17, 15], [-15, 6], [0, 5], [9, -5], [18, -34], [28, -33], [35, -22]],
    // Eurasia
    [[-10, 36], [-3, 44], [8, 54], [25, 71], [60, 71], [95, 74], [135, 71], [170, 66], [142, 48], [121, 35], [108, 18], [80, 16], [71, 24], [52, 25], [36, 31], [27, 41], [14, 46], [-6, 44], [-10, 36]],
    // India Subcontinent
    [[69, 23], [72, 20], [74, 15], [77, 8], [80, 13], [85, 20], [89, 22], [79, 28], [69, 23]],
    // Australia
    [[115, -22], [130, -12], [142, -11], [153, -28], [148, -38], [135, -35], [115, -34], [115, -22]],
    // North America
    [[-165, 65], [-140, 70], [-100, 70], [-62, 48], [-70, 42], [-81, 25], [-92, 19], [-105, 21], [-120, 35], [-130, 52], [-165, 65]],
    // South America
    [[-75, 11], [-50, -5], [-35, -5], [-40, -22], [-55, -36], [-68, -55], [-75, -45], [-80, -10], [-75, 11]],
    // Antarctica
    [[-180, -78], [-120, -72], [-60, -68], [0, -70], [60, -68], [120, -72], [180, -78]]
  ];

  function project(lonDeg, latDeg) {
    const lambda = lonDeg * Math.PI / 180;
    const phi = latDeg * Math.PI / 180;

    // 3D Cartesian coordinates on unit sphere
    const x = Math.cos(phi) * Math.sin(lambda - yaw);
    const y0 = -Math.sin(phi);
    const z0 = Math.cos(phi) * Math.cos(lambda - yaw);

    // Apply pitch rotation
    const y = y0 * Math.cos(pitch) - z0 * Math.sin(pitch);
    const z = y0 * Math.sin(pitch) + z0 * Math.cos(pitch);

    const cx = globeCanvas.width / 2;
    const cy = globeCanvas.height / 2;

    return {
      x: cx + x * globeRadius,
      y: cy + y * globeRadius,
      z: z,
      visible: z > 0
    };
  }

  function drawGlobe() {
    if (!ctx) return;

    const width = globeCanvas.width;
    const height = globeCanvas.height;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    // 1. Atmosphere Outer Halo
    const haloGrad = ctx.createRadialGradient(cx, cy, globeRadius * 0.95, cx, cy, globeRadius * 1.15);
    haloGrad.addColorStop(0, 'rgba(85, 219, 227, 0.45)');
    haloGrad.addColorStop(0.5, 'rgba(12, 80, 107, 0.2)');
    haloGrad.addColorStop(1, 'rgba(4, 27, 48, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, globeRadius * 1.15, 0, Math.PI * 2);
    ctx.fill();

    // 2. Base Ocean Sphere (3D Light Shading)
    const sphereGrad = ctx.createRadialGradient(
      cx - globeRadius * 0.35,
      cy - globeRadius * 0.35,
      globeRadius * 0.1,
      cx,
      cy,
      globeRadius
    );
    sphereGrad.addColorStop(0, '#135e80');
    sphereGrad.addColorStop(0.5, '#0a3652');
    sphereGrad.addColorStop(0.85, '#051c2e');
    sphereGrad.addColorStop(1, '#020b14');

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, globeRadius, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = sphereGrad;
    ctx.fill();

    // 3. Graticules (Latitude & Longitude Grid Lines)
    ctx.strokeStyle = 'rgba(85, 219, 227, 0.15)';
    ctx.lineWidth = 1;

    // Parallels
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      let first = true;
      for (let lon = -180; lon <= 180; lon += 5) {
        const p = project(lon, lat);
        if (p.visible) {
          if (first) { ctx.moveTo(p.x, p.y); first = false; }
          else { ctx.lineTo(p.x, p.y); }
        } else {
          first = true;
        }
      }
      ctx.stroke();
    }

    // Meridians
    for (let lon = -180; lon <= 180; lon += 30) {
      ctx.beginPath();
      let first = true;
      for (let lat = -85; lat <= 85; lat += 5) {
        const p = project(lon, lat);
        if (p.visible) {
          if (first) { ctx.moveTo(p.x, p.y); first = false; }
          else { ctx.lineTo(p.x, p.y); }
        } else {
          first = true;
        }
      }
      ctx.stroke();
    }

    // 4. Continents
    ctx.fillStyle = 'rgba(28, 95, 80, 0.55)';
    ctx.strokeStyle = 'rgba(85, 219, 227, 0.5)';
    ctx.lineWidth = 1.5;

    for (const poly of CONTINENTS) {
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < poly.length; i++) {
        const p = project(poly[i][0], poly[i][1]);
        if (p.visible) {
          if (!started) { ctx.moveTo(p.x, p.y); started = true; }
          else { ctx.lineTo(p.x, p.y); }
        }
      }
      if (started) {
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // 5. Specular / Atmospheric Limb Highlight
    const limbGrad = ctx.createRadialGradient(cx, cy, globeRadius * 0.75, cx, cy, globeRadius);
    limbGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    limbGrad.addColorStop(0.85, 'rgba(85, 219, 227, 0.08)');
    limbGrad.addColorStop(1, 'rgba(85, 219, 227, 0.45)');
    ctx.fillStyle = limbGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, globeRadius, 0, Math.PI * 2);
    ctx.fill();

    // 6. Ocean Target Nodes & Pulsing Labels
    const time = Date.now() * 0.003;
    for (const [oceanName, info] of Object.entries(OCEANS)) {
      const p = project(info.lon, info.lat);
      if (p.visible && p.z > 0.15) {
        const alpha = Math.min(1, (p.z - 0.15) / 0.5);

        // Pulse ring
        const pulse = Math.sin(time + info.lon) * 4 + 10;
        ctx.strokeStyle = `rgba(85, 219, 227, ${0.7 * alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Pin center
        ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.font = 'bold 13px Georgia, serif';
        ctx.fillStyle = `rgba(240, 251, 255, ${0.95 * alpha})`;
        ctx.textAlign = 'center';
        ctx.fillText(oceanName, p.x, p.y + 22);

        ctx.font = '10px -apple-system, sans-serif';
        ctx.fillStyle = `rgba(103, 212, 219, ${0.8 * alpha})`;
        ctx.fillText(info.desc.split('&')[0].trim(), p.x, p.y + 34);
      }
    }

    ctx.restore();
  }

  function animateGlobe() {
    // Smooth interpolation towards target
    yaw += (targetYaw - yaw) * 0.08;
    pitch += (targetPitch - pitch) * 0.08;

    // Apply inertia when user drags
    if (!isDragging && Math.abs(velocityX) > 0.0001) {
      targetYaw += velocityX;
      velocityX *= 0.92;
    }
    if (!isDragging && Math.abs(velocityY) > 0.0001) {
      targetPitch += velocityY;
      velocityY *= 0.92;
      targetPitch = Math.max(-1.2, Math.min(1.2, targetPitch));
    }

    // Auto-rotate if idle
    if (autoRotate && !isDragging) {
      targetYaw += 0.0018;
    }

    drawGlobe();
    requestAnimationFrame(animateGlobe);
  }

  // --------------------------------------------------------------------------
  // GLOBE EVENT HANDLERS
  // --------------------------------------------------------------------------
  if (globeCanvas) {
    globeCanvas.addEventListener('pointerdown', (e) => {
      isDragging = true;
      autoRotate = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      startYaw = targetYaw;
      startPitch = targetPitch;
      lastX = e.clientX;
      lastY = e.clientY;
      velocityX = 0;
      velocityY = 0;
      globeCanvas.setPointerCapture(e.pointerId);
    });

    globeCanvas.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;

      targetYaw = startYaw - dx * 0.006;
      targetPitch = Math.max(-1.2, Math.min(1.2, startPitch - dy * 0.006));

      velocityX = -(e.clientX - lastX) * 0.004;
      velocityY = -(e.clientY - lastY) * 0.004;
      lastX = e.clientX;
      lastY = e.clientY;
    });

    const stopDrag = () => {
      isDragging = false;
      clearTimeout(autoRotateTimer);
      autoRotateTimer = setTimeout(() => { autoRotate = true; }, 4000);
    };

    globeCanvas.addEventListener('pointerup', stopDrag);
    globeCanvas.addEventListener('pointercancel', stopDrag);

    // Click hit detection on ocean pin
    globeCanvas.addEventListener('click', (e) => {
      if (Math.abs(e.clientX - dragStartX) > 6 || Math.abs(e.clientY - dragStartY) > 6) return;
      const rect = globeCanvas.getBoundingClientRect();
      const scaleX = globeCanvas.width / rect.width;
      const scaleY = globeCanvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      for (const [oceanName, info] of Object.entries(OCEANS)) {
        const p = project(info.lon, info.lat);
        if (p.visible && p.z > 0.2) {
          const dist = Math.hypot(clickX - p.x, clickY - p.y);
          if (dist < 36) {
            selectOcean(oceanName);
            break;
          }
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // OCEAN SELECTION & NAVIGATION
  // --------------------------------------------------------------------------
  window.selectOcean = function(oceanName) {
    const info = OCEANS[oceanName] || OCEANS['Indian'];

    // Update active button
    document.querySelectorAll('.ocean-buttons button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.ocean === oceanName);
    });

    // Animate globe rotation towards the ocean
    autoRotate = false;
    targetYaw = info.lon * Math.PI / 180;
    targetPitch = -info.lat * Math.PI / 180;

    // Transition to Region Picker after short pan
    setTimeout(() => {
      if (window.RegionPicker) {
        window.RegionPicker.show(oceanName);
      } else {
        diveIntoOcean(oceanName);
      }
    }, 450);
  };

  document.querySelectorAll('.ocean-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
      selectOcean(btn.dataset.ocean);
    });
  });

  window.diveIntoOcean = function(oceanName, regionName) {
    const globeSec = document.getElementById('globe-view');
    const regionSec = document.getElementById('region-picker');
    const oceanSec = document.getElementById('ocean-view');
    const dataDeck = document.getElementById('data-deck');

    if (globeSec) globeSec.hidden = true;
    if (regionSec) regionSec.hidden = true;
    if (oceanSec) oceanSec.hidden = false;
    if (dataDeck) dataDeck.hidden = false;

    const oceanSpan = document.getElementById('selected-ocean');
    if (oceanSpan) oceanSpan.textContent = oceanName;

    const subSmall = document.querySelector('.ocean-head small');
    if (subSmall) subSmall.textContent = regionName ? `${regionName} field view` : 'Bay of Bengal field view';

    updateTelemetry();
  };

  // Back to Globe
  const backBtn = document.getElementById('back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      const globeSec = document.getElementById('globe-view');
      const regionSec = document.getElementById('region-picker');
      const oceanSec = document.getElementById('ocean-view');
      const dataDeck = document.getElementById('data-deck');

      if (oceanSec) oceanSec.hidden = true;
      if (dataDeck) dataDeck.hidden = true;
      if (regionSec) regionSec.hidden = true;
      if (globeSec) globeSec.hidden = false;

      autoRotate = true;
    });
  }

  // --------------------------------------------------------------------------
  // OCEAN VIEW CONTROLS & TELEMETRY
  // --------------------------------------------------------------------------
  const weatherSelect = document.getElementById('weather');
  const depthSlider = document.getElementById('depth');
  const depthLabel = document.getElementById('depth-label');
  const fieldSelect = document.getElementById('field');
  const obsToggle = document.getElementById('obs-toggle');
  const obsLayer = document.getElementById('observation-layer');
  const readingEl = document.getElementById('reading');
  const depthStory = document.getElementById('depth-story');
  const diveBtn = document.getElementById('dive');

  // Depth Zone Catalog
  const DEPTH_ZONES = [
    {
      name: 'Sunlit zone',
      range: '0–200 m',
      temp: 29.1,
      sal: 34.1,
      speed: 0.65,
      story: 'Warm, bright water with schools of pelagic fish, coral reefs, and active wind-driven currents (EICC).'
    },
    {
      name: 'Twilight zone',
      range: '200–1,000 m',
      temp: 14.8,
      sal: 34.6,
      speed: 0.28,
      story: 'Sunlight fades rapidly into dusk. Steep thermocline boundary with migratory lanternfish and zooplankton.'
    },
    {
      name: 'Midnight zone',
      range: '1,000–4,000 m',
      temp: 4.6,
      sal: 34.92,
      speed: 0.12,
      story: 'Perpetual pitch black darkness. Intense hydrostatic pressure, sparse bioluminescent jellyfish, and giant squids.'
    },
    {
      name: 'Abyssal zone',
      range: '4,000–6,000 m',
      temp: 2.1,
      sal: 34.78,
      speed: 0.05,
      story: 'Covers over 60% of Earth’s seafloor. Near-freezing temperatures, abyssal plains, and hydrothermal vents.'
    },
    {
      name: 'Hadal trench',
      range: '>6,000 m',
      temp: 1.8,
      sal: 34.72,
      speed: 0.02,
      story: 'Extreme ocean trenches (e.g. Java Trench / Mariana Trench). Crushing pressure exceeding 1,000 atmospheres.'
    }
  ];

  function updateTelemetry() {
    if (!depthSlider) return;
    const depthIdx = parseInt(depthSlider.value, 10) || 0;
    const zone = DEPTH_ZONES[depthIdx] || DEPTH_ZONES[0];

    // Update ocean-view styling attribute
    const oceanView = document.getElementById('ocean-view');
    if (oceanView) {
      oceanView.setAttribute('data-zone', depthIdx);
    }

    // Update Depth Label
    if (depthLabel) {
      depthLabel.textContent = `${zone.name} · ${zone.range}`;
    }

    // Update Depth Story
    if (depthStory) {
      depthStory.innerHTML = `<b>${zone.name}</b><span>${zone.range}</span><p>${zone.story}</p>`;
    }

    // Update Marine Life Visibility based on depth
    const fishA = document.querySelector('.fish-a');
    const fishB = document.querySelector('.fish-b');
    const fishC = document.querySelector('.fish-c');
    const plants = document.querySelectorAll('.plant');

    if (depthIdx === 0) {
      if (fishA) fishA.style.opacity = '0.8';
      if (fishB) fishB.style.opacity = '0.7';
      if (fishC) fishC.style.opacity = '0.9';
      plants.forEach(p => p.style.opacity = '0.7');
    } else if (depthIdx === 1) {
      if (fishA) fishA.style.opacity = '0.3';
      if (fishB) fishB.style.opacity = '0.6';
      if (fishC) fishC.style.opacity = '0.2';
      plants.forEach(p => p.style.opacity = '0.2');
    } else {
      if (fishA) fishA.style.opacity = '0';
      if (fishB) fishB.style.opacity = '0.3';
      if (fishC) fishC.style.opacity = '0';
      plants.forEach(p => p.style.opacity = '0');
    }

    // Update Data Field Reading
    const currentField = fieldSelect ? fieldSelect.value : 'Temperature';
    if (readingEl) {
      if (currentField.includes('Temp')) {
        readingEl.innerHTML = `${zone.temp.toFixed(1)} °C<br><small>Local NEMO Model • ${zone.name.toLowerCase()}</small>`;
      } else if (currentField.includes('Salin')) {
        readingEl.innerHTML = `${zone.sal.toFixed(2)} PSU<br><small>Copernicus salinity sample • ${zone.range}</small>`;
      } else if (currentField.includes('Current')) {
        readingEl.innerHTML = `${zone.speed.toFixed(2)} m/s<br><small>East India Coastal Current vector</small>`;
      }
    }
  }

  // Weather Handler
  if (weatherSelect) {
    weatherSelect.addEventListener('change', () => {
      document.body.className = weatherSelect.value;

      // Handle Raindrops procedural generation
      const sky = document.getElementById('sky');
      document.querySelectorAll('.rain-drop').forEach(r => r.remove());

      if (weatherSelect.value === 'rain' && sky) {
        for (let i = 0; i < 40; i++) {
          const drop = document.createElement('div');
          drop.className = 'rain-drop';
          drop.style.left = `${Math.random() * 100}%`;
          drop.style.top = `${Math.random() * 100}px`;
          drop.style.animationDelay = `${Math.random() * 0.7}s`;
          drop.style.animationDuration = `${0.5 + Math.random() * 0.3}s`;
          sky.appendChild(drop);
        }
      }
    });
  }

  // Depth Slider Handler
  if (depthSlider) {
    depthSlider.addEventListener('input', updateTelemetry);
  }

  // Field Select Handler
  if (fieldSelect) {
    fieldSelect.addEventListener('change', updateTelemetry);
  }

  // Observations Toggle
  if (obsToggle && obsLayer) {
    obsToggle.addEventListener('change', () => {
      obsLayer.style.display = obsToggle.checked ? 'block' : 'none';
    });
  }

  // Dive Below Button
  if (diveBtn && depthSlider) {
    diveBtn.addEventListener('click', () => {
      let currentVal = parseInt(depthSlider.value, 10) || 0;
      let nextVal = (currentVal + 1) % 5;
      depthSlider.value = nextVal;
      updateTelemetry();

      diveBtn.textContent = nextVal === 0 ? 'SURFACE UP' : `DESCEND (${DEPTH_ZONES[nextVal].range})`;
    });
  }

  // --------------------------------------------------------------------------
  // OBSERVATION MARKER MODAL INSPECTOR
  // --------------------------------------------------------------------------
  const OBS_DETAILS = {
    'ARGO-5906219': {
      platform: 'Argo Profiling Float 5906219',
      badge: 'INCOIS · Indian Ocean Array',
      lat: '13.412° N',
      lon: '82.145° E',
      depth: '0–500 m profile',
      temp: '29.1 °C',
      salinity: '34.12 PSU',
      modelTemp: '28.88 °C (diff +0.22 °C)',
      status: 'Active · Cycle #142 (Reporting via Iridium)',
      specs: 'CTD sensor suite (Conductivity, Temperature, Depth) drifting in central Bay of Bengal eddy.'
    },
    'GLIDER-BAY-01': {
      platform: 'Ocean Glider Bay-01',
      badge: 'NIOT / MoES Autonomous Glider',
      lat: '12.870° N',
      lon: '80.950° E',
      depth: '50 m sawtooth dive',
      temp: '26.5 °C',
      salinity: '34.40 PSU',
      modelTemp: '26.35 °C (diff +0.15 °C)',
      status: 'Transect Line Chennai–Port Blair',
      specs: 'Autonomous buoyancy engine glider recording thermocline boundary shear and oxygen minimum zone.'
    },
    'CHENNAI-COAST-01': {
      platform: 'Chennai Coastal Met Buoy 01',
      badge: 'MoES Coastal Telemetry Station',
      lat: '13.082° N',
      lon: '80.320° E',
      depth: '5 m surface mooring',
      temp: '29.3 °C',
      salinity: '33.80 PSU',
      modelTemp: '29.15 °C (diff +0.15 °C)',
      status: 'Real-time telemetry every 15 min',
      specs: 'Continuous sea surface temperature, salinity, acoustic Doppler current profiler (ADCP) and barometric sensor.'
    }
  };

  const modalBackdrop = document.getElementById('obs-modal');
  const modalContent = document.getElementById('modal-content');
  const modalClose = document.getElementById('modal-close-btn');

  function openObservation(id) {
    const data = OBS_DETAILS[id] || {
      platform: id,
      badge: 'In-situ sensor',
      lat: '13.0° N',
      lon: '82.0° E',
      depth: 'Surface',
      temp: '28.5 °C',
      salinity: '34.0 PSU',
      modelTemp: '28.4 °C',
      status: 'Operational',
      specs: 'Sensor observation payload.'
    };

    if (modalContent) {
      modalContent.innerHTML = `
        <div class="modal-header">
          <h3>${data.platform}</h3>
          <span class="modal-badge">${data.badge}</span>
        </div>
        <div class="modal-grid">
          <div class="modal-metric">
            <label>Coordinates</label>
            <span>${data.lat}, ${data.lon}</span>
          </div>
          <div class="modal-metric">
            <label>Sensor Depth</label>
            <span>${data.depth}</span>
          </div>
          <div class="modal-metric">
            <label>Measured Temp</label>
            <span style="color:var(--cyan-bright)">${data.temp}</span>
          </div>
          <div class="modal-metric">
            <label>Measured Salinity</label>
            <span style="color:var(--gold-accent)">${data.salinity}</span>
          </div>
          <div class="modal-metric">
            <label>Model Comparison</label>
            <span>${data.modelTemp}</span>
          </div>
          <div class="modal-metric">
            <label>System Status</label>
            <span style="font-size:14px;color:#3ee69a">${data.status}</span>
          </div>
        </div>
        <p style="font-size:13.5px;line-height:1.6;color:var(--text-muted);margin-top:14px;">
          ${data.specs}
        </p>
      `;
    }

    if (modalBackdrop) modalBackdrop.style.display = 'flex';
  }

  document.querySelectorAll('.obs').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openObservation(btn.dataset.id);
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      if (modalBackdrop) modalBackdrop.style.display = 'none';
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) modalBackdrop.style.display = 'none';
    });
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------
  window.addEventListener('DOMContentLoaded', () => {
    animateGlobe();
    updateTelemetry();
  });

})();
