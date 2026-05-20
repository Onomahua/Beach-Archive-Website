/* ============================================================
   大梅沙垃圾图鉴 · Rankings
   ============================================================ */

(function () {
  'use strict';

  const PLACEHOLDER = 'assets/photos/placeholder.svg';

  const RANK_CONFIG = {
    weirdness: { label: '诡异指数', unit: '/10' },
    frequency: { label: '目击频率', unit: '/10' },
    weight:    { label: '环境威胁', unit: '/10' }
  };

  let currentRank = 'weirdness';

  /* ── Render rank list ────────────────────────────────────── */
  function renderRankings(mode) {
    const list = document.getElementById('rank-list');
    if (!list) return;

    const data   = window.ALL_TRASH_DATA || window.PRESET_DATA || [];
    const config = RANK_CONFIG[mode] || RANK_CONFIG.weirdness;
    const sorted = [...data]
      .sort((a, b) => (b[mode] || 0) - (a[mode] || 0))
      .slice(0, 10);

    const medals = ['🥇', '🥈', '🥉'];

    list.innerHTML = sorted.map((item, i) => {
      const photo   = item.photoUrl || item.photo_url || PLACEHOLDER;
      const score   = item[mode] || 5;
      const pct     = (score / 10 * 100).toFixed(0);
      const posClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
      const posText  = i < 3 ? medals[i] : `${i + 1}`;

      return `
        <div class="rank-item" data-id="${item.id}">
          <span class="rank-pos ${posClass}">${posText}</span>
          <img class="rank-thumb"
               src="${photo}"
               alt="${item.name}"
               loading="lazy"
               onerror="this.src='${PLACEHOLDER}'">
          <div class="rank-info">
            <p class="rank-name">${item.name}</p>
            <p class="rank-sub">${item.category || ''} · ${config.label}</p>
            <div class="rank-score-bar">
              <div class="rank-score-fill score-bar-fill" style="width:0%" data-target="${pct}"></div>
            </div>
          </div>
          <span class="rank-score">${score}<small>${config.unit}</small></span>
        </div>`;
    }).join('');

    // Animate score bars
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        list.querySelectorAll('.score-bar-fill').forEach(bar => {
          bar.style.width = bar.dataset.target + '%';
        });
      });
    });

    // Click to open modal
    list.querySelectorAll('.rank-item').forEach(el => {
      el.addEventListener('click', () => {
        if (window.openModal) window.openModal(el.dataset.id);
      });
    });
  }

  /* ── Tab switching ───────────────────────────────────────── */
  function initTabs() {
    const tabs = document.getElementById('rank-tabs');
    if (!tabs) return;

    tabs.addEventListener('click', e => {
      const tab = e.target.closest('.rank-tab');
      if (!tab) return;
      tabs.querySelectorAll('.rank-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentRank = tab.dataset.rank;
      renderRankings(currentRank);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    renderRankings(currentRank);
  });
})();
