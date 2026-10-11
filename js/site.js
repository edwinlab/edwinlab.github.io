(() => {
  'use strict';

  const timeElement = document.querySelector('#jakarta-time');
  const yearElement = document.querySelector('#year');
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const yearFormatter = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Jakarta', year: 'numeric' });
  const updateTime = () => {
    const now = new Date();
    if (timeElement) timeElement.textContent = `${timeFormatter.format(now)} WIB`;
    if (yearElement) yearElement.textContent = yearFormatter.format(now);
  };
  updateTime();
  window.setInterval(updateTime, 60000);

  const copyButton = document.querySelector('[data-copy-email]');
  const copyStatus = document.querySelector('.copy-status');
  if (copyButton && copyStatus && navigator.clipboard && window.isSecureContext) {
    copyButton.hidden = false;
    let resetTimer;
    copyButton.addEventListener('click', async () => {
      window.clearTimeout(resetTimer);
      try {
        await navigator.clipboard.writeText(copyButton.dataset.copyEmail);
        copyButton.querySelector('span').textContent = 'Copied!';
        copyStatus.textContent = 'Email address copied.';
      } catch {
        copyStatus.textContent = 'Couldn’t copy. Select the email address, or click it to send a message.';
      }
      resetTimer = window.setTimeout(() => {
        copyButton.querySelector('span').textContent = 'Copy email';
        copyStatus.textContent = '';
      }, 6000);
    });
  }

  const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
  if ('IntersectionObserver' in window) {
    const sections = navLinks.map((link) => document.querySelector(link.hash)).filter(Boolean);
    const visibleSections = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleSections.add(entry.target.id);
        else visibleSections.delete(entry.target.id);
      });
      const activeSection = sections.find((section) => visibleSections.has(section.id));
      navLinks.forEach((link) => {
        if (activeSection && link.hash === `#${activeSection.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-20% 0px -40% 0px' });
    sections.forEach((section) => observer.observe(section));
  }
})();
