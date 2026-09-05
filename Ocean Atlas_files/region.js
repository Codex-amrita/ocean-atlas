/* ==========================================================================
   OCEAN ATLAS - REGION PICKER CONTROLLER
   ========================================================================== */

(function() {
  'use strict';

  const REGIONS_DATA = {
    'Indian': [
      { name: 'Bay of Bengal', detail: 'INCOIS Hub · 10°N–16°N, 78°E–84°E (Chennai coastal grid)' },
      { name: 'Arabian Sea', detail: 'Somali Upwelling & seasonal Oxygen Minimum Zone' },
      { name: 'Equatorial Indian Ocean', detail: 'Wyrtki jet eastward surface currents & thermocline ridge' },
      { name: 'Andaman Sea', detail: 'Subduction volcanic basin & deep marginal sea' },
      { name: 'Lakshadweep Sea', detail: 'Coral atolls & Lakshadweep high/low eddy circulation' },
      { name: 'Southwest Indian Ridge', detail: 'Ultraslow-spreading seafloor spreading center' }
    ],
    'Pacific': [
      { name: 'Mariana Trench', detail: 'Challenger Deep · 10,994 m deepest point on Earth' },
      { name: 'Kuroshio Extension', detail: 'High-energy western boundary current heat transport' },
      { name: 'Great Barrier Reef', detail: 'Coral Sea lagoon & tropical biological hotspot' },
      { name: 'Eastern Tropical Pacific', detail: 'El Niño–Southern Oscillation (ENSO) monitoring core' },
      { name: 'California Current', detail: 'Eastern boundary coastal upwelling system' },
      { name: 'Philippine Sea Basin', detail: 'Deep abyssal plain with active typhoon storm tracks' }
    ],
    'Atlantic': [
      { name: 'Gulf Stream Drift', detail: 'Atlantic Meridional Overturning Circulation (AMOC) spine' },
      { name: 'Sargasso Sea', detail: 'High-salinity subtropical gyre & floating pelagic ecosystem' },
      { name: 'Mid-Atlantic Ridge', detail: 'Hydrothermal vents & divergent tectonic rift valley' },
      { name: 'Caribbean Basin', detail: 'Warm Caribbean Current and mesopelagic trenches' },
      { name: 'Benguela Upwelling', detail: 'Wind-driven nutrient-rich eastern boundary current' },
      { name: 'Romanche Trench', detail: 'Equatorial deep fracture zone through mid-ocean ridge' }
    ],
    'Southern': [
      { name: 'Antarctic Circumpolar Current', detail: 'World’s strongest ocean current connecting all basins' },
      { name: 'Weddell Sea Gyre', detail: 'Antarctic Bottom Water (AABW) cold dense sink' },
      { name: 'Ross Sea Ice Shelf', detail: 'Sub-ice shelf circulation & coastal polynyas' },
      { name: 'Drake Passage', detail: 'Narrow choke point throttling Antarctic circumpolar flow' },
      { name: 'Kerguelen Plateau', detail: 'Natural iron-fertilized Southern Ocean biological bloom' },
      { name: 'Amundsen Sea', detail: 'Accelerated glacial ice-shelf melting boundary' }
    ],
    'Arctic': [
      { name: 'Fram Strait Gateway', detail: 'Primary deep water exchange between Arctic & North Atlantic' },
      { name: 'Beaufort Sea Gyre', detail: 'Major fresh water reservoir governed by clockwise winds' },
      { name: 'Barents Sea Opening', detail: 'Inflowing warm Atlantic water & declining sea-ice edge' },
      { name: 'Chukchi Sea Shelf', detail: 'Pacific water inflow through shallow Bering Strait' },
      { name: 'Lomonosov Ridge', detail: 'Underwater continental crust dividing Arctic into basins' },
      { name: 'Greenland Sea', detail: 'Open-ocean deep convection and chimney formation' }
    ]
  };

  let currentOcean = 'Indian';

  window.RegionPicker = {
    show: function(oceanName) {
      currentOcean = oceanName || 'Indian';

      const globeSec = document.getElementById('globe-view');
      const regionSec = document.getElementById('region-picker');
      const oceanSec = document.getElementById('ocean-view');
      const dataDeck = document.getElementById('data-deck');

      if (globeSec) globeSec.hidden = true;
      if (oceanSec) oceanSec.hidden = true;
      if (dataDeck) dataDeck.hidden = true;
      if (regionSec) regionSec.hidden = false;

      const titleEl = document.getElementById('region-title');
      if (titleEl) {
        titleEl.textContent = `Select a research region — ${currentOcean} Ocean`;
      }

      const optionsContainer = document.getElementById('region-options');
      if (optionsContainer) {
        optionsContainer.innerHTML = '';
        const regions = REGIONS_DATA[currentOcean] || REGIONS_DATA['Indian'];

        regions.forEach(reg => {
          const btn = document.createElement('button');
          btn.innerHTML = `<strong>${reg.name}</strong><br><span style="font-size:12px;opacity:0.85;color:#c0e7ed;">${reg.detail}</span>`;
          btn.addEventListener('click', () => {
            if (window.diveIntoOcean) {
              window.diveIntoOcean(currentOcean, reg.name);
            }
          });
          optionsContainer.appendChild(btn);
        });
      }
    }
  };

  // Back Button from Region Picker
  const regionBackBtn = document.getElementById('region-back');
  if (regionBackBtn) {
    regionBackBtn.addEventListener('click', () => {
      const globeSec = document.getElementById('globe-view');
      const regionSec = document.getElementById('region-picker');
      if (regionSec) regionSec.hidden = true;
      if (globeSec) globeSec.hidden = false;
    });
  }

})();
