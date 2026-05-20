/* ============================================================
   大梅沙垃圾图鉴 · Gallery Rendering
   ============================================================ */

(function () {
  'use strict';

  const PLACEHOLDER = 'assets/photos/placeholder.svg';

  /* ── Helpers ─────────────────────────────────────────────── */
  function dangerStars(level) {
    const filled = '★'.repeat(level);
    const empty  = '☆'.repeat(3 - level);
    return `<span class="danger-stars">${filled}${empty}</span>`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '日期不详';
    try {
      const d = new Date(dateStr);
      return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
    } catch { return dateStr; }
  }

  /* ── Build one card HTML ─────────────────────────────────── */
  function cardHTML(item) {
    const photo = item.photoUrl || item.photo_url || PLACEHOLDER;
    return `
      <article class="trash-card" data-id="${item.id}" data-category="${item.category || ''}" title="${item.name}">
        <div class="card-photo-wrap">
          <img class="card-photo"
               src="${photo}"
               alt="${item.name}"
               loading="lazy"
               onerror="this.src='${PLACEHOLDER}'">
        </div>
      </article>`;
  }

  /* ── Render cards into grid ──────────────────────────────── */
  function renderCards(items) {
    const grid = document.getElementById('gallery-grid');
    const count = document.getElementById('gallery-count');
    if (!grid) return;

    grid.innerHTML = items.map(cardHTML).join('');

    if (count) {
      count.textContent = items.length > 0
        ? `共收录 ${items.length} 件标本`
        : '暂无匹配标本';
    }

    // Attach tilt + modal click
    grid.querySelectorAll('.trash-card').forEach(card => {
      if (window.initTilt) window.initTilt(card);
    });
    grid.querySelectorAll('.btn-detail, .trash-card').forEach(el => {
      el.addEventListener('click', e => {
        const id = el.dataset.id || el.closest('.trash-card')?.dataset.id;
        if (id && window.openModal) window.openModal(id);
      });
    });
  }

  /* ── Load from Supabase & merge ──────────────────────────── */
  async function loadRemoteData() {
    if (!window.supabaseClient) return;
    try {
      const { data, error } = await window.supabaseClient
        .from('trash_items')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return;

      // Normalize remote fields to match preset schema
      const remote = data.map(r => ({
        id:          r.id,
        name:        r.name,
        latinName:   r.latin_name,
        category:    r.category,
        discoveredAt:r.location,
        date:        r.date,
        foundBy:     r.found_by,
        photoUrl:    r.photo_url,
        description: r.description,
        weirdness:   r.weirdness  || 5,
        frequency:   r.frequency  || 5,
        weight:      r.weight     || 5,
        dangerLevel: r.danger_lvl || 1,
        isPreset:    false
      }));

      // Merge: preset first, then remote (deduplicate by id)
      const existing = new Set(window.PRESET_DATA.map(p => p.id));
      const newItems = remote.filter(r => !existing.has(r.id));
      window.ALL_TRASH_DATA = [...window.PRESET_DATA, ...newItems];

      // Re-render with current filter
      if (window.applyFilter) window.applyFilter();

      // Update stats
      const statEl = document.querySelector('[data-target]');
      if (statEl) updateStats();

    } catch (err) {
      console.warn('Remote data load failed:', err);
    }
  }

  function updateStats() {
    const total = window.ALL_TRASH_DATA.length;
    // Animate the count-up from current displayed value
    const el = document.querySelector('.count-up[data-target]');
    if (el) {
      el.dataset.target = total;
      window.animateCountUp && window.animateCountUp(el, total);
    }
  }

  /* ── Init ───────────────────────────────────────────────── */
  function init() {
    renderCards(window.ALL_TRASH_DATA || window.PRESET_DATA || []);
    loadRemoteData();
  }

  /* Expose for filter.js */
  window.renderCards = renderCards;

  document.addEventListener('DOMContentLoaded', init);
})();
