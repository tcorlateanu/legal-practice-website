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
// GDPR CHECKBOX — Formspree Ajax nu validează required pe checkbox
// ============================================================
document.getElementById('contactForm').addEventListener('submit', function (e) {
  const gdpr = document.getElementById('contactGDPR');
  if (!gdpr.checked) {
    e.preventDefault();
    e.stopImmediatePropagation();
    gdpr.closest('.form-group').querySelector('label').style.color = '#c0392b';
    gdpr.focus();
  }
}, true);

document.getElementById('contactGDPR').addEventListener('change', function () {
  this.closest('.form-group').querySelector('label').style.color = '';
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

