const cursor = document.querySelector('.cursor-glow');
window.addEventListener('mousemove', e => {
  if (!cursor) return;
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
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
  document.querySelectorAll('.nav nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('mobile-open')));
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const role = document.getElementById('role-letters');
if (role) {
  'Geospatial Data Analyst'.split('').forEach((char) => {
    const span = document.createElement('span');
    if (char === ' ') span.className = 'space'; else span.textContent = char;
    role.appendChild(span);
  });
}

document.addEventListener('DOMContentLoaded', function(){
  const el = document.getElementById('hero-map');
  if (!el) return;
  if (typeof L === 'undefined') {
    setTimeout(() => { if (typeof L !== 'undefined') window.dispatchEvent(new Event('leaflet-ready')); }, 250);
    return;
  }

  const locations = [
    { name: 'Ahmedabad', coords: [23.0225, 72.5714], current: true },
    { name: 'Pune', coords: [18.5204, 73.8567] },
    { name: 'New Delhi', coords: [28.6139, 77.2090] }
  ];
  const map = L.map(el, {
    zoomControl: true,
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
  }).setView([23.0225, 72.5714], 6);

  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19, maxNativeZoom: 19, attribution: '&copy; Esri, Maxar, Earthstar Geographics'
  });
  const street = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19, maxNativeZoom: 19, attribution: '&copy; Esri'
  });
  satellite.addTo(map);
  let activeLayer = satellite;

  locations.forEach(function(location){
    if(location.current){
      L.marker(location.coords, {
        icon: L.divIcon({
          className:'current-location-marker',
          html:'<span class="current-location-pin-wrap"><span class="current-location-pin"></span><span class="current-location-base"></span></span>',
          iconSize:[48,58],
          iconAnchor:[24,50]
        }),
        interactive:false
      }).addTo(map);
    } else {
      L.circleMarker(location.coords, {radius:6,color:'#07100d',weight:2,fillColor:'#66ffb5',fillOpacity:1,interactive:false})
        .addTo(map).bindTooltip(location.name,{permanent:true,direction:'right',offset:[10,0],className:'ahmedabad-tooltip',opacity:1}).openTooltip();
    }
  });

  const locationBounds = L.latLngBounds(locations.map(location => location.coords));
  map.fitBounds(locationBounds,{padding:[70,90],maxZoom:7});

  const controls = el.parentElement.querySelector('.map-controls');
  if (controls) {
    L.DomEvent.disableClickPropagation(controls);
    L.DomEvent.disableScrollPropagation(controls);
    const zin = controls.querySelector('[data-map-action="zoom-in"]');
    const zout = controls.querySelector('[data-map-action="zoom-out"]');
    if (zin) zin.addEventListener('click', e => {e.preventDefault();e.stopPropagation();map.zoomIn(1);});
    if (zout) zout.addEventListener('click', e => {e.preventDefault();e.stopPropagation();map.zoomOut(1);});
    controls.querySelectorAll('[data-map-layer]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();e.stopPropagation();
        const requested = btn.dataset.mapLayer === 'street' ? street : satellite;
        if(requested !== activeLayer){activeLayer.remove();requested.addTo(map);activeLayer=requested;}
        controls.querySelectorAll('[data-map-layer]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        map.invalidateSize({pan:false});
      });
    });
  }

  const refreshMap = () => map.invalidateSize({pan:false});
  requestAnimationFrame(refreshMap); setTimeout(refreshMap,200); setTimeout(refreshMap,700);
  window.addEventListener('resize',refreshMap);
});

document.addEventListener('click', function(e){
  const projectBtn = e.target.closest('[href="#projects"]');
  if(projectBtn){e.preventDefault();document.getElementById('projects')?.scrollIntoView({behavior:'smooth',block:'start'});}
  const resumeBtn = e.target.closest('a[href="resume.pdf"]');
  if(resumeBtn)e.stopPropagation();
});


// Subtle mouse parallax for the ambient geospatial objects.
const ambient = document.querySelector('.ambient-tech');
if (ambient && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let tx = 0, ty = 0, cx = 0, cy = 0;
  window.addEventListener('mousemove', e => {
    tx = (e.clientX / window.innerWidth - .5) * 2;
    ty = (e.clientY / window.innerHeight - .5) * 2;
  }, {passive:true});
  const parallax = () => {
    cx += (tx - cx) * .035; cy += (ty - cy) * .035;
    ambient.style.transform = `translate3d(${cx * 5}px, ${cy * 4}px, 0)`;
    requestAnimationFrame(parallax);
  };
  requestAnimationFrame(parallax);
}
