(function () {
  'use strict';

  // ---------- Design Tokens (mirrored from CSS) ----------
  const TOAST_DURATION = 4000; // ms
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ---------- Helper Functions ----------
  function createToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast--hide');
      toast.addEventListener('transitionend', () => toast.remove());
    }, TOAST_DURATION);
  }

  function smoothScroll(target) {
    const element = document.querySelector(target);
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.pageYOffset - 80; // offset for fixed header
    window.scrollTo({ top, behavior: 'smooth' });
  }

  // ---------- Smooth Scroll Polyfill for Anchor Links ----------
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (href.length > 1) {
        e.preventDefault();
        smoothScroll(href);
        // Update URL hash without jumping
        history.pushState(null, '', href);
      }
    });
  }

  // ---------- Form Validation & Submission ----------
  function validateForm(data) {
    const errors = [];
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Name is required.');
    } else if (data.name.length > 100) {
      errors.push('Name must be less than 100 characters.');
    }

    if (!data.email || data.email.trim().length === 0) {
      errors.push('Email is required.');
    } else if (!EMAIL_REGEX.test(data.email)) {
      errors.push('Please enter a valid email address.');
    }

    if (!data.message || data.message.trim().length === 0) {
      errors.push('Message is required.');
    } else if (data.message.length > 2000) {
      errors.push('Message must be less than 2000 characters.');
    }

    return errors;
  }

  function initContactForm() {
    const form = document.querySelector('#contact form[data-form-action]');
    if (!form) return;
    const endpoint = form.dataset.formAction;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const formData = new FormData(form);
      const payload = {
        name: formData.get('name')?.trim() || '',
        email: formData.get('email')?.trim() || '',
        message: formData.get('message')?.trim() || ''
      };

      const errors = validateForm(payload);
      if (errors.length) {
        createToast(errors.join(' '), 'error');
        return;
      }

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          createToast('Message sent! Thank you.', 'success');
          form.reset();
        } else {
          const data = await response.json();
          const msg = data.error || 'Something went wrong. Please try again later.';
          createToast(msg, 'error');
        }
      } catch (err) {
        createToast('Network error. Please check your connection.', 'error');
      }
    });
  }

  // ---------- Scroll‑Reveal Animations for Menu Cards ----------
  function initScrollReveal() {
    const cards = document.querySelectorAll('.menu__card');
    if (!cards.length) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('menu__card--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    cards.forEach(card => observer.observe(card));
  }

  // ---------- Mobile Navigation Toggle (optional) ----------
  function initMobileNav() {
    const toggleBtn = document.querySelector('.nav__toggle');
    const navMenu = document.querySelector('.nav__menu');
    if (!toggleBtn || !navMenu) return;
    toggleBtn.addEventListener('click', () => {
      const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('nav__menu--open');
    });
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initContactForm();
    initScrollReveal();
    initMobileNav();
  });
})();
