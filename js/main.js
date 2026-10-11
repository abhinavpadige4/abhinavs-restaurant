// js/main.js – Vanilla JavaScript module for the restaurant landing page
// Features:
// 1. Smooth scrolling for internal anchor links
// 2. IntersectionObserver to fade‑in menu cards on scroll
// 3. Contact form validation and submission to Formspree
// 4. Mobile navigation toggle (hamburger menu)

// ----- Configuration -----
const FORM_ENDPOINT = "https://formspree.io/f/{{FORMSPREE_ID}}"; // replace {{FORMSPREE_ID}} with your Formspree ID

// ----- Utility Functions -----
function qs(selector, scope = document) {
  return scope.querySelector(selector);
}
function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

// ----- 1. Smooth Scroll -----
function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href').slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
        // Update URL hash without jumping
        history.pushState(null, '', `#${targetId}`);
      }
    });
  });
}

// ----- 2. IntersectionObserver for Menu Cards -----
function initMenuObserver() {
  const cards = qsa('.menu-card');
  if (!('IntersectionObserver' in window) || cards.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  cards.forEach(card => observer.observe(card));
}

// ----- 3. Contact Form -----
function initContactForm() {
  const form = qs('#contact-form');
  if (!form) return;

  const toast = qs('#form-toast');

  function showToast(message, type = 'success') {
    if (!toast) return;
    toast.textContent = message;
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded ${type === 'success' ? 'bg-success text-white' : 'bg-error text-white'} shadow-lg`;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 4000);
  }

  function validate() {
    const name = qs('#name').value.trim();
    const email = qs('#email').value.trim();
    const message = qs('#message').value.trim();
    const phone = qs('#phone').value.trim();

    if (!name) { return 'Please enter your name.'; }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { return 'Please enter a valid email address.'; }
    if (!message) { return 'Please write a message.'; }
    // phone is optional – no validation needed beyond optional format if desired
    return null;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const error = validate();
    if (error) {
      showToast(error, 'error');
      return;
    }

    const formData = new FormData(form);
    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        form.reset();
        showToast('Message sent successfully!');
      } else {
        const data = await response.json();
        const msg = data.error || 'Something went wrong. Please try again later.';
        showToast(msg, 'error');
      }
    } catch (err) {
      showToast('Network error. Please check your connection.', 'error');
    }
  });
}

// ----- 4. Mobile Navigation Toggle -----
function initMobileNav() {
  const toggleBtn = qs('#mobile-nav-toggle');
  const navMenu = qs('#mobile-nav');
  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!expanded));
    navMenu.classList.toggle('hidden');
  });
}

// ----- Initialize All -----
function init() {
  initSmoothScroll();
  initMenuObserver();
  initContactForm();
  initMobileNav();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
