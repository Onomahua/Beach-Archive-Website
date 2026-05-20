/* ============================================================
   大梅沙垃圾图鉴 · About Drawer
   ============================================================ */

(function () {
  'use strict';

  function openAbout() {
    const overlay = document.getElementById('about-overlay');
    if (!overlay) return;
    overlay.removeAttribute('hidden');
    overlay.removeAttribute('aria-hidden');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => overlay.classList.add('open'));
    });
    document.body.style.overflow = 'hidden';
  }

  function closeAbout() {
    const overlay = document.getElementById('about-overlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    setTimeout(() => {
      overlay.setAttribute('hidden', '');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }, 350);
  }

  window.openAbout  = openAbout;
  window.closeAbout = closeAbout;

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('about-close')?.addEventListener('click', closeAbout);

    document.getElementById('about-overlay')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) closeAbout();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeAbout();
    });
  });
})();
