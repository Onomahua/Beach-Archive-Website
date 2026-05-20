/* ============================================================
   大梅沙垃圾图鉴 · Detail Modal
   ============================================================ */

(function () {
  'use strict';

  const PLACEHOLDER = 'assets/photos/placeholder.svg';

  function dangerStars(level) {
    return '★'.repeat(level) + '☆'.repeat(3 - level);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '日期不详';
    try {
      const d = new Date(dateStr);
      return `${d.getFullYear()} 年 ${d.getMonth()+1} 月 ${d.getDate()} 日`;
    } catch { return dateStr; }
  }

  function scoreBar(value, max = 10) {
    const pct = (value / max * 100).toFixed(0);
    return `
      <div class="rank-score-bar">
        <div class="rank-score-fill score-bar-fill" style="width:0%" data-target="${pct}"></div>
      </div>`;
  }

  /* ── Build modal content ─────────────────────────────────── */
  function buildModal(item) {
    const photo  = item.photoUrl || item.photo_url || PLACEHOLDER;
    const latin  = item.latinName || item.latin_name || '';
    const by     = item.foundBy   || item.found_by   || '匿名志愿者';
    const loc    = item.discoveredAt || item.location || '大梅沙海滩';
    const coord  = item.coordinates  || '';
    const danger = item.dangerLevel  || item.danger_lvl || 1;
    const desc   = item.description  || '暂无描述。';
    const date   = formatDate(item.date);

    return `
      <div class="modal-layout">
        <div class="modal-left">
          <img class="modal-photo"
               src="${photo}"
               alt="${item.name}"
               onerror="this.src='${PLACEHOLDER}'">
        </div>
        <div class="modal-right">
          <p class="modal-num">${item.id}</p>
          <h2 class="modal-name">${item.name}</h2>
          ${latin ? `<p class="modal-latin">${latin}</p>` : ''}

          <div class="modal-tags">
            <span class="modal-tag cat">${item.category || '其他'}</span>
            <span class="modal-tag">危险等级 ${dangerStars(danger)}</span>
          </div>

          <div class="modal-info-grid">
            <div class="modal-info-item">
              <p class="modal-info-label">发现地点</p>
              <p class="modal-info-val">${loc}</p>
            </div>
            <div class="modal-info-item">
              <p class="modal-info-label">发现日期</p>
              <p class="modal-info-val">${date}</p>
            </div>
            <div class="modal-info-item">
              <p class="modal-info-label">发现者</p>
              <p class="modal-info-val">${by}</p>
            </div>
            ${coord ? `
            <div class="modal-info-item">
              <p class="modal-info-label">坐标</p>
              <p class="modal-info-val" style="font-size:0.78rem;font-family:monospace">${coord}</p>
            </div>` : ''}
          </div>

          <p class="modal-desc-title">标本描述</p>
          <p class="modal-desc">${desc}</p>

          <div class="modal-scores">
            <div class="score-row">
              <span class="score-label">诡异指数</span>
              ${scoreBar(item.weirdness || 5)}
              <span class="score-val">${item.weirdness || 5}</span>
            </div>
            <div class="score-row">
              <span class="score-label">常见程度</span>
              ${scoreBar(item.frequency || 5)}
              <span class="score-val">${item.frequency || 5}</span>
            </div>
            <div class="score-row">
              <span class="score-label">环境威胁</span>
              ${scoreBar(item.weight || 5)}
              <span class="score-val">${item.weight || 5}</span>
            </div>
          </div>
        </div>
      </div>`;
  }

  /* ── Open / Close ────────────────────────────────────────── */
  function openModal(id) {
    const data = window.ALL_TRASH_DATA || window.PRESET_DATA || [];
    const item = data.find(d => d.id === id);
    if (!item) return;

    const overlay = document.getElementById('modal-overlay');
    const body    = document.getElementById('modal-body');
    if (!overlay || !body) return;

    body.innerHTML = buildModal(item);
    overlay.removeAttribute('hidden');

    // Trigger CSS open transition on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('open');
        // Animate score bars
        overlay.querySelectorAll('.score-bar-fill').forEach(bar => {
          bar.style.width = bar.dataset.target + '%';
        });
      });
    });

    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    setTimeout(() => {
      overlay.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }, 280);
  }

  window.openModal  = openModal;
  window.closeModal = closeModal;

  /* ── Event listeners ─────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('modal-close')?.addEventListener('click', closeModal);

    document.getElementById('modal-overlay')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) closeModal();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
    });
  });
})();
