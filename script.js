/* =========================================================
   ORIONPULSE — MAIN SCRIPT
   1. Nav scroll state
   2. Mobile menu toggle
   3. Scroll reveal animations
   4. Lead form submission
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. NAV SCROLL STATE ---------- */
  var nav = document.getElementById('nav');

  function updateNavState() {
    if (window.scrollY > 20) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  }

  updateNavState();
  window.addEventListener('scroll', updateNavState, { passive: true });

  /* ---------- 2. MOBILE MENU ---------- */
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');

  function closeMenu() {
    navToggle.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function openMenu() {
    navToggle.classList.add('is-open');
    mobileMenu.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  navToggle.addEventListener('click', function () {
    var isOpen = mobileMenu.classList.contains('is-open');
    if (isOpen) { closeMenu(); } else { openMenu(); }
  });

  var mobileLinks = mobileMenu.querySelectorAll('a');
  for (var i = 0; i < mobileLinks.length; i++) {
    mobileLinks[i].addEventListener('click', closeMenu);
  }

  /* ---------- 3. SCROLL REVEAL ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- 4. LEAD FORM SUBMISSION ---------- */
  var form = document.getElementById('growthForm');
  var successMessage = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Collect form data as a plain object.
      var formData = new FormData(form);
      var data = {};
      formData.forEach(function (value, key) {
        if (data[key]) {
          data[key] = Array.isArray(data[key]) ? data[key].concat(value) : [data[key], value];
        } else {
          data[key] = value;
        }
      });

      /*
        Connect to a Google Apps Script Web App backend here.
        Example:

        fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' }
        })
        .then(function () { showSuccess(); })
        .catch(function () { alert('Something went wrong. Please try again.'); });

        For now, this submits nothing to a backend — it just shows the
        confirmation message so the form can be wired up later.
      */

      showSuccess();
    });
  }

  function showSuccess() {
    form.reset();
    form.classList.add('is-hidden');
    successMessage.classList.add('is-visible');
    successMessage.setAttribute('tabindex', '-1');
    successMessage.focus();
  }

});
