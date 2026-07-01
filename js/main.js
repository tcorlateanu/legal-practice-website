'use strict';

// ============================================================
// NAVIGARE — scroll + hamburger + active link
// ============================================================
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
const allNavLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  highlightActiveSection();
}, { passive: true });

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
});

allNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
  });
});

function highlightActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  allNavLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

// ============================================================
// AN CURENT în footer
// ============================================================
document.getElementById('footerYear').textContent = new Date().getFullYear();

// ============================================================
// ANIMATII SCROLL — IntersectionObserver
// ============================================================
const animTargets = document.querySelectorAll(
  '.serviciu-card, .speta-card, .credential, .contact-item, .despre-stats'
);
animTargets.forEach(el => el.classList.add('anim-fade'));

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

animTargets.forEach(el => io.observe(el));

// ============================================================
// FILTRU SPETE
// ============================================================
const filterBtns  = document.querySelectorAll('.filter-btn');
const spetaCards  = document.querySelectorAll('.speta-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    spetaCards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.style.display = show ? '' : 'none';
    });
  });
});

// "Încarcă mai multe" — placeholder (în producție va face fetch la backend)
document.getElementById('incarcaMaiMulte').addEventListener('click', function () {
  this.textContent = 'Nu există alte spețe momentan.';
  this.disabled = true;
  this.style.opacity = '0.5';
});

// ============================================================
// MODAL SPETE
// ============================================================
const modalOverlay = document.getElementById('spetaModal');
const modalClose   = document.getElementById('modalClose');

document.querySelectorAll('.speta-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const card  = btn.closest('.speta-card');
    const badge = card.querySelector('.speta-badge');
    const title = card.querySelector('.speta-title').textContent;
    const date  = card.querySelector('.speta-date').textContent;
    const sum   = card.querySelector('.speta-summary').textContent;
    const res   = card.querySelector('.speta-result').innerHTML;

    modalOverlay.querySelector('.modal-badge-el').innerHTML = badge.outerHTML;
    modalOverlay.querySelector('.modal-title').textContent  = title;
    modalOverlay.querySelector('.modal-meta').textContent   = date;
    modalOverlay.querySelector('.modal-body').innerHTML     =
      `<p>${sum}</p><p>[Detalii suplimentare ale speței — fundament juridic, instanțe parcurse, argumente principale, hotărâre finală]</p>`;
    modalOverlay.querySelector('.modal-result-el').innerHTML =
      `<strong>Rezultat:</strong> ${res}`;

    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ============================================================
// CALENDAR
// ============================================================
const LUNI_RO = [
  'Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie',
  'Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'
];
const ZILE_RO = ['duminică','luni','marți','miercuri','joi','vineri','sâmbătă'];

// Stare calendar
let calView = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selDate = null;
let selTime = null;

// Generare zile partial-ocupate (deterministă după dată, fără Math.random)
function isPartialBooked(year, month, day) {
  const n = year * 10000 + month * 100 + day;
  return (n * 6997 + 1234567) % 10 < 2; // ~20% din zile
}

function renderCalendar() {
  const year  = calView.getFullYear();
  const month = calView.getMonth();
  const today = new Date(); today.setHours(0,0,0,0);

  document.getElementById('calMonthYear').textContent =
    `${LUNI_RO[month]} ${year}`;

  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const offset   = firstDow === 0 ? 6 : firstDow - 1; // România: săptămâna începe luni
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const container = document.getElementById('calDays');
  container.innerHTML = '';

  for (let i = 0; i < offset; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day empty';
    container.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date   = new Date(year, month, d);
    const dow    = date.getDay(); // 0=Sun, 6=Sat
    const past   = date < today;
    const wkend  = dow === 0 || dow === 6;
    const isToday = date.getTime() === today.getTime();
    const partial = !past && !wkend && isPartialBooked(year, month + 1, d);
    const isSel   = selDate &&
      selDate.getFullYear() === year &&
      selDate.getMonth() === month &&
      selDate.getDate() === d;

    const el = document.createElement('div');
    el.textContent = d;

    const classes = ['cal-day'];
    if (isToday)  classes.push('today');
    if (isSel)    classes.push('selected');
    if (past)     classes.push('past');
    else if (wkend) classes.push('weekend');
    else {
      classes.push('available');
      if (partial) classes.push('booked');
      el.addEventListener('click', () => pickDate(new Date(year, month, d)));
    }

    el.className = classes.join(' ');
    container.appendChild(el);
  }
}

function pickDate(date) {
  selDate = date;
  selTime = null;
  renderCalendar();
  renderTimeslots(date);

  const tsw = document.getElementById('timeslotsWrapper');
  tsw.style.display = 'block';
  setTimeout(() => tsw.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);

  document.getElementById('bookingFormWrapper').style.display = 'none';
}

function renderTimeslots(date) {
  const label = date.toLocaleDateString('ro-RO', {
    weekday: 'long', day: 'numeric', month: 'long'
  });
  document.getElementById('selectedDateLabel').textContent = label;

  const slots = [
    '09:00','09:30','10:00','10:30','11:00','11:30',
    '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'
  ];

  // Generare deterministă: unele sloturi "ocupate"
  const seed = date.getFullYear() * 10000 + (date.getMonth()+1) * 100 + date.getDate();

  const container = document.getElementById('timeslots');
  container.innerHTML = '';

  slots.forEach((slot, i) => {
    const booked = ((seed + i * 137) % 10) < 3; // ~30% ocupate
    const el = document.createElement('div');
    el.textContent = slot;
    el.className = 'timeslot' + (booked ? ' booked-slot' : '');
    if (!booked) {
      el.addEventListener('click', () => pickTime(slot, el));
    }
    container.appendChild(el);
  });
}

function pickTime(time, el) {
  selTime = time;
  document.querySelectorAll('.timeslot').forEach(t => t.classList.remove('selected-slot'));
  el.classList.add('selected-slot');
  showBookingForm();
}

function showBookingForm() {
  const wrapper = document.getElementById('bookingFormWrapper');
  wrapper.style.display = 'block';

  const dateStr = selDate.toLocaleDateString('ro-RO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  document.getElementById('bookingSummary').innerHTML =
    `<strong>Data:</strong> ${dateStr}<br><strong>Ora:</strong> ${selTime}`;

  setTimeout(() => wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
}

// Navigare luni calendar
document.getElementById('calPrev').addEventListener('click', () => {
  const now = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const prev = new Date(calView.getFullYear(), calView.getMonth() - 1, 1);
  if (prev < now) return;
  calView = prev;
  renderCalendar();
});

document.getElementById('calNext').addEventListener('click', () => {
  calView = new Date(calView.getFullYear(), calView.getMonth() + 1, 1);
  renderCalendar();
});

// Init calendar
renderCalendar();

// ============================================================
// FORMULAR PROGRAMARE
// ============================================================
document.getElementById('bookingForm').addEventListener('submit', function (e) {
  e.preventDefault();
  if (!this.checkValidity()) { this.reportValidity(); return; }

  // TODO: trimite datele la backend (fetch POST /api/programari)
  this.style.display = 'none';
  document.getElementById('bookingSuccess').style.display = 'block';
});

document.getElementById('noaProgramare').addEventListener('click', () => {
  selDate = null;
  selTime = null;
  renderCalendar();

  document.getElementById('timeslotsWrapper').style.display = 'none';
  document.getElementById('bookingFormWrapper').style.display = 'none';

  const form = document.getElementById('bookingForm');
  form.reset();
  form.style.display = '';
  document.getElementById('bookingSuccess').style.display = 'none';

  document.getElementById('programare').scrollIntoView({ behavior: 'smooth' });
});

// ============================================================
// COOKIE CONSENT
// ============================================================
(function () {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;
  if (!localStorage.getItem('cookieConsent')) {
    setTimeout(() => banner.classList.add('visible'), 600);
  }
  document.getElementById('cookieAccept').addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'all');
    banner.classList.remove('visible');
  });
  document.getElementById('cookieReject').addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'necessary');
    banner.classList.remove('visible');
  });
})();

// ============================================================
// FORMULAR CONTACT
// ============================================================
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  if (!this.checkValidity()) { this.reportValidity(); return; }

  // TODO: trimite datele la backend (fetch POST /api/contact)
  document.getElementById('contactSuccess').style.display = 'block';
  this.reset();
  setTimeout(() => {
    document.getElementById('contactSuccess').style.display = 'none';
  }, 8000);
});
