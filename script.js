const cursor = document.querySelector('.cursor-glow');
window.addEventListener('mousemove', e => {
  if (!cursor) return;
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, {threshold: 0.08});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      const show = filter === 'all' || card.dataset.category.split(' ').includes(filter);
      card.classList.toggle('hidden', !show);
    });
  });
});

const menu = document.querySelector('.menu');
const nav = document.querySelector('.nav nav');
if (menu && nav) {
  menu.addEventListener('click', () => nav.classList.toggle('mobile-open'));
  document.querySelectorAll('.nav nav a').forEach(a => {
    a.addEventListener('click', () => nav.classList.remove('mobile-open'));
  });
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Letter-by-letter Geospatial Data Analyst animation.
const role = document.getElementById('role-letters');
if (role) {
  'Geospatial Data Analyst'.split('').forEach((char) => {
    const span = document.createElement('span');
    if (char === ' ') span.className = 'space';
    else span.textContent = char;
    role.appendChild(span);
  });
}

// Interactive Ahmedabad basemap.
document.addEventListener('DOMContentLoaded', function(){
  const el = document.getElementById('hero-map');
  if (!el || typeof L === 'undefined') return;

  const locations = [
    { name: 'Ahmedabad', coords: [23.0225, 72.5714] },
    { name: 'Pune', coords: [18.5204, 73.8567] },
    { name: 'New Delhi', coords: [28.6139, 77.2090] }
  ];
  const ahmedabad = locations[0].coords;

  const map = L.map(el, {
    zoomControl: false,
    attributionControl: true,
    scrollWheelZoom: true,
    dragging: true,
    doubleClickZoom: true,
    touchZoom: true,
    boxZoom: true,
    keyboard: true,
    zoomSnap: 1,
    zoomDelta: 1,
    tap: true
  }).setView(ahmedabad, 6);

  const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 19, maxNativeZoom: 19, attribution: '&copy; Esri, Maxar, Earthstar Geographics' }
  );
  const street = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 19, maxNativeZoom: 19, attribution: '&copy; Esri' }
  );
  satellite.addTo(map);
  let activeLayer = satellite;

  // Geographic markers: all three labels stay attached to their real coordinates
  // while the user zooms, pans, or changes the basemap.
  locations.forEach(function(location) {
    L.circleMarker(location.coords, {
      radius: 6, color: '#07100d', weight: 2,
      fillColor: '#66ffb5', fillOpacity: 1, interactive: false
    }).addTo(map).bindTooltip(location.name, {
      permanent: true, direction: 'right', offset: [10, 0],
      className: 'ahmedabad-tooltip', opacity: 1
    }).openTooltip();
  });

  // Keep a subtle geographic analysis ring around Ahmedabad.
  L.circle(ahmedabad, {
    radius: 7000, color: '#66ffb5', weight: 1,
    opacity: .20, fillColor: '#66ffb5', fillOpacity: .018,
    interactive: false
  }).addTo(map);

  // Frame all three locations on first load.
  const locationBounds = L.latLngBounds(locations.map(function(location) { return location.coords; }));
  map.fitBounds(locationBounds, { padding: [70, 90], maxZoom: 7 });

  // Custom controls with ordinary DOM click handlers. This avoids browser/touch conflicts
  // caused by nested Leaflet control handlers and guarantees the visible buttons are clickable.
  const controls = el.parentElement.querySelector('.map-controls');
  if (controls) {
    L.DomEvent.disableClickPropagation(controls);
    L.DomEvent.disableScrollPropagation(controls);

    controls.querySelector('[data-map-action="zoom-in"]').addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation(); map.zoomIn(1);
    });
    controls.querySelector('[data-map-action="zoom-out"]').addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation(); map.zoomOut(1);
    });

    controls.querySelectorAll('[data-map-layer]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        const requested = btn.dataset.mapLayer === 'street' ? street : satellite;
        if (requested !== activeLayer) {
          activeLayer.remove();
          requested.addTo(map);
          activeLayer = requested;
        }
        controls.querySelectorAll('[data-map-layer]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        map.invalidateSize({pan:false});
      });
    });
  }

  const refreshMap = () => map.invalidateSize({pan:false});
  requestAnimationFrame(refreshMap);
  setTimeout(refreshMap, 200);
  setTimeout(refreshMap, 700);
  window.addEventListener('resize', refreshMap);
});

// Ensure important portfolio actions work even when opened on touch devices.
document.addEventListener('click', function(e){
  const projectBtn = e.target.closest('[href="#projects"]');
  if (projectBtn) {
    e.preventDefault();
    document.getElementById('projects')?.scrollIntoView({behavior:'smooth', block:'start'});
  }
  const resumeBtn = e.target.closest('a[href="resume.pdf"]');
  if (resumeBtn) {
    // Let the browser handle the PDF normally; prevent accidental overlay interception.
    e.stopPropagation();
  }
});
