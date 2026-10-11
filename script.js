(function() {
  // Smooth scroll for internal links (fallback for older browsers)
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // IntersectionObserver for fade‑in animations
  const observerOptions = {
    threshold: 0.1
  };
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.menu__item').forEach(el => revealObserver.observe(el));

  // Lazy‑load placeholder images (using background gradient as placeholder)
  // In this demo we use CSS gradients, so no actual image loading needed.

  // Form handling
  const form = document.getElementById('contact-form');
  const toast = document.getElementById('toast');

  function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `fixed bottom-4 right-4 max-w-xs p-4 rounded-md shadow-lg ${type}`;
    toast.classList.remove('hidden');
    setTimeout(() => { toast.classList.add('hidden'); }, 4000);
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      showToast('Please fill in all fields.', 'error');
      return;
    }
    if (!validateEmail(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    const payload = { name, email, message };
    const endpoint = 'https://formspree.io/f/{{FORMSPREE_ID}}'; // replace with actual ID in deployment

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (response.ok) {
        showToast('Message sent successfully!');
        form.reset();
      } else {
        showToast(result.message || 'Something went wrong.', 'error');
      }
    } catch (err) {
      showToast('Network error. Please try again later.', 'error');
    }
  });
})();
