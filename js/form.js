/* ============================================================
   大梅沙垃圾图鉴 · Submission Form
   Photo upload → compress → Supabase Storage → DB insert
   Falls back to localStorage if Supabase not configured.
   ============================================================ */

(function () {
  'use strict';

  /* ── Photo preview ───────────────────────────────────────── */
  function initPhotoPreview() {
    const input       = document.getElementById('f-photo');
    const preview     = document.getElementById('photo-preview');
    const placeholder = document.getElementById('upload-placeholder');
    if (!input) return;

    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      preview.src = url;
      preview.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';
    });
  }

  /* ── Compress image via canvas ───────────────────────────── */
  function compressImage(file, maxPx = 1200, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width > height) { height = Math.round(height * maxPx / width); width = maxPx; }
          else { width = Math.round(width * maxPx / height); height = maxPx; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Compress failed')), 'image/jpeg', quality);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  /* ── Upload to Supabase Storage ──────────────────────────── */
  async function uploadPhoto(file) {
    if (!window.supabaseClient) return null;
    try {
      const blob     = await compressImage(file);
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const { data, error } = await window.supabaseClient.storage
        .from('trash-photos')
        .upload(filename, blob, { contentType: 'image/jpeg', upsert: false });

      if (error) throw error;

      const { data: urlData } = window.supabaseClient.storage
        .from('trash-photos')
        .getPublicUrl(data.path);

      return urlData?.publicUrl || null;
    } catch (err) {
      console.warn('Photo upload failed:', err);
      return null;
    }
  }

  /* ── Save to Supabase DB ─────────────────────────────────── */
  async function saveToSupabase(record) {
    if (!window.supabaseClient) return false;
    try {
      const { error } = await window.supabaseClient
        .from('trash_items')
        .insert([record]);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('DB insert failed:', err);
      return false;
    }
  }

  /* ── Save to localStorage (fallback) ────────────────────── */
  function saveLocally(record) {
    try {
      const key  = 'dmx_submissions';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      list.push(record);
      localStorage.setItem(key, JSON.stringify(list));
      return true;
    } catch { return false; }
  }

  /* ── Validate form ───────────────────────────────────────── */
  function validate(form) {
    let ok = true;
    form.querySelectorAll('[required]').forEach(el => {
      el.classList.remove('error');
      if (!el.value.trim()) {
        el.classList.add('error');
        ok = false;
      }
    });
    return ok;
  }

  /* ── Set button loading state ────────────────────────────── */
  function setBtnState(btn, label, loading) {
    const span = document.getElementById('btn-label');
    if (span) span.textContent = label;
    btn.disabled = loading;
  }

  /* ── Show success UI ─────────────────────────────────────── */
  function showSuccess(id) {
    const form    = document.getElementById('submission-form');
    const success = document.getElementById('submit-success');
    const idEl    = document.getElementById('success-id');
    if (form)    form.style.display    = 'none';
    if (success) success.removeAttribute('hidden');
    if (idEl)    idEl.textContent = `标本编号：${id}`;
  }

  /* ── Reset form ──────────────────────────────────────────── */
  window.resetForm = function () {
    const form    = document.getElementById('submission-form');
    const success = document.getElementById('submit-success');
    const preview = document.getElementById('photo-preview');
    const placeholder = document.getElementById('upload-placeholder');
    if (form) { form.reset(); form.style.display = ''; }
    if (success) success.setAttribute('hidden', '');
    if (preview) { preview.style.display = 'none'; preview.src = ''; }
    if (placeholder) placeholder.style.display = '';
    form?.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  };

  /* ── Handle submit ───────────────────────────────────────── */
  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn  = document.getElementById('submit-btn');

    if (!validate(form)) return;

    setBtnState(btn, '提交中…', true);

    const photoFile = form.elements['photo']?.files[0];
    let photoUrl    = null;
    if (photoFile) photoUrl = await uploadPhoto(photoFile);

    const id = `DMS-${Date.now().toString(36).toUpperCase()}`;

    const record = {
      id,
      name:        form.elements['name'].value.trim(),
      category:    form.elements['category'].value || '其他',
      location:    form.elements['location'].value.trim(),
      date:        form.elements['date'].value || new Date().toISOString().split('T')[0],
      found_by:    form.elements['found_by'].value.trim() || '匿名志愿者',
      description: form.elements['description'].value.trim(),
      photo_url:   photoUrl,
      weirdness:   5,
      frequency:   5,
      weight:      5,
      danger_lvl:  1,
      approved:    false,
      created_at:  new Date().toISOString()
    };

    const saved = await saveToSupabase(record) || saveLocally(record);

    if (saved) {
      showSuccess(id);
    } else {
      setBtnState(btn, '提交标本报告', false);
      alert('提交失败，请稍后再试。');
    }
  }

  /* ── Init ───────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initPhotoPreview();
    document.getElementById('submission-form')?.addEventListener('submit', handleSubmit);
  });
})();
