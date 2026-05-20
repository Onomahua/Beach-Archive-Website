/* ============================================================
   大梅沙垃圾图鉴 · Category Filtering
   ============================================================ */

(function () {
  'use strict';

  let currentCategory = '全部';

  /* ── Build filter buttons ─────────────────────────────────── */
  function buildFilterBar() {
    const bar = document.getElementById('filter-bar');
    if (!bar) return;

    const categories = window.TRASH_CATEGORIES || ['全部'];
    bar.innerHTML = categories.map(cat => `
      <button class="filter-btn${cat === '全部' ? ' active' : ''}"
              data-cat="${cat}">${cat}</button>
    `).join('');

    bar.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.cat;
      applyFilter();
    });
  }

  /* ── Filter & re-render ──────────────────────────────────── */
  function applyFilter() {
    const data = window.ALL_TRASH_DATA || window.PRESET_DATA || [];
    const filtered = currentCategory === '全部'
      ? data
      : data.filter(item => item.category === currentCategory);

    if (window.renderCards) window.renderCards(filtered);
  }

  /* Expose for gallery.js re-render after remote load */
  window.applyFilter = applyFilter;

  document.addEventListener('DOMContentLoaded', buildFilterBar);
})();
