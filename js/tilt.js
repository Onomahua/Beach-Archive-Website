/* ============================================================
   大梅沙垃圾图鉴 · 3D Effects
   1. Card tilt on hover (CSS perspective + rotateX/Y)
   2. Hero parallax on mousemove
   3. Stats count-up animation
   4. Scroll-reveal + sticky nav
   ============================================================ */

(function () {
  'use strict';

  /* ── Reduced-motion check ─────────────────────────────────── */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ══════════════════════════════════════════════════════════
     1. CARD 3D TILT
     ══════════════════════════════════════════════════════════ */
  const TILT_MAX = 12; // degrees

  function initTilt(card) {
    if (prefersReduced) return;

    card.addEventListener('mousemove', onTiltMove);
    card.addEventListener('mouseleave', onTiltLeave);
  }

  function onTiltMove(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);

    const rotY =  dx * TILT_MAX;
    const rotX = -dy * TILT_MAX;

    // Mouse position as percentage for gloss effect
    const px = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
    const py = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);

    card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
    card.style.setProperty('--mouse-x', `${px}%`);
    card.style.setProperty('--mouse-y', `${py}%`);
  }

  function onTiltLeave(e) {
    const card = e.currentTarget;
    card.style.transform = '';
    card.style.removeProperty('--mouse-x');
    card.style.removeProperty('--mouse-y');
  }

  window.initTilt = initTilt;

  /* ══════════════════════════════════════════════════════════
     2. HERO PARALLAX
     ══════════════════════════════════════════════════════════ */
  function initHeroParallax() {
    if (prefersReduced) return;
    const hero  = document.querySelector('.hero');
    const items = document.querySelectorAll('.h-item');
    if (!hero || items.length === 0) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let raf;

    hero.addEventListener('mousemove', e => {
      const rect = hero.getBoundingClientRect();
      targetX = (e.clientX - rect.left  - rect.width  / 2) / rect.width;
      targetY = (e.clientY - rect.top   - rect.height / 2) / rect.height;
    });

    hero.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    });

    function tick() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      items.forEach(item => {
        const depth = parseFloat(item.dataset.depth || 0.3);
        const tx = currentX * depth * 40;
        const ty = currentY * depth * 30;
        // Preserve the float animation by adding to it via translateX/Y
        item.style.setProperty('--tx', `${tx}px`);
        item.style.setProperty('--ty', `${ty}px`);
        item.style.transform = `translate(${tx}px, ${ty}px)`;
      });

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
  }

  /* ══════════════════════════════════════════════════════════
     3. COUNT-UP ANIMATION
     ══════════════════════════════════════════════════════════ */
  function animateCountUp(el, target, duration = 1200) {
    const start   = 0;
    const startTs = performance.now();

    function step(ts) {
      const progress = Math.min((ts - startTs) / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const val      = Math.round(start + (target - start) * ease);
      el.textContent = val;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  window.animateCountUp = animateCountUp;

  function initCountUps() {
    const els = document.querySelectorAll('.count-up[data-target]');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el     = entry.target;
          const target = parseInt(el.dataset.target, 10);
          animateCountUp(el, target);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    els.forEach(el => observer.observe(el));
  }

  /* ══════════════════════════════════════════════════════════
     4. STICKY NAV (shows when hero scrolls out)
     ══════════════════════════════════════════════════════════ */
  function initStickyNav() {
    // Create sticky nav element
    const sticky = document.createElement('div');
    sticky.className = 'site-nav-sticky';
    sticky.innerHTML = `
      <div class="sticky-logo">
        <img src="assets/logo- main.png" alt="轻扫" onerror="this.style.display='none'">
        大梅沙垃圾图鉴
      </div>
      <div class="sticky-links">
        <a href="#gallery">图鉴</a>
        <a href="#rankings">排行榜</a>
        <a href="#submit">投递标本</a>
        <a href="#" id="about-trigger">关于轻扫Action</a>
      </div>`;
    document.body.prepend(sticky);

    // Wire about trigger after DOM insertion
    document.getElementById('about-trigger')?.addEventListener('click', e => {
      e.preventDefault();
      if (window.openAbout) window.openAbout();
    });

    const hero = document.querySelector('.hero');
    const observer = new IntersectionObserver(entries => {
      sticky.classList.toggle('visible', !entries[0].isIntersecting);
    }, { threshold: 0 });

    if (hero) observer.observe(hero);
  }

  /* ══════════════════════════════════════════════════════════
     5. SCROLL PROGRESS BAR
     ══════════════════════════════════════════════════════════ */
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.prepend(bar);

    window.addEventListener('scroll', () => {
      const total   = document.documentElement.scrollHeight - window.innerHeight;
      const current = window.scrollY;
      bar.style.width = (current / total * 100).toFixed(1) + '%';
    }, { passive: true });
  }

  /* ══════════════════════════════════════════════════════════
     6. SECTION REVEAL ON SCROLL
     ══════════════════════════════════════════════════════════ */
  function initReveal() {
    const sections = document.querySelectorAll('.gallery-section, .rankings-section, .submit-section, .stats-section');
    sections.forEach(s => s.classList.add('reveal'));

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    sections.forEach(s => observer.observe(s));
  }

  /* ── Init all on DOM ready ───────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initHeroParallax();
    initCountUps();
    initStickyNav();
    initScrollProgress();
    initReveal();
  });
})();
