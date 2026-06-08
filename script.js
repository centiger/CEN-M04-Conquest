(() => {
  const viewport = document.getElementById('viewport');
  const canvas = document.getElementById('canvas');
  const resetBtn = document.getElementById('resetView');
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');
  const dialog = document.getElementById('infoDialog');
  const dialogTitle = document.getElementById('dialogTitle');
  const dialogText = document.getElementById('dialogText');
  const closeDialog = document.getElementById('closeDialog');

  const base = { w: 887, h: 1773 };
  const state = { scale: 1, minScale: 0.35, maxScale: 3.2, x: 0, y: 0 };
  const pointers = new Map();
  let lastTap = 0;
  let pinchStart = null;
  let fitScale = 1;

  function clampPan() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const sw = base.w * state.scale;
    const sh = base.h * state.scale;
    const margin = 80;
    if (sw <= vw) state.x = (vw - sw) / 2;
    else state.x = Math.min(margin, Math.max(vw - sw - margin, state.x));
    if (sh <= vh) state.y = (vh - sh) / 2;
    else state.y = Math.min(margin, Math.max(vh - sh - margin, state.y));
  }

  function apply() {
    clampPan();
    canvas.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`;
  }

  function fitView() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    state.minScale = Math.min(vw / base.w, vh / base.h) * 0.92;
    fitScale = Math.max(vw / base.w, state.minScale);
    state.scale = fitScale;
    state.x = (vw - base.w * state.scale) / 2;
    state.y = 0;
    apply();
  }

  function zoomAt(clientX, clientY, nextScale) {
    const rect = viewport.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const beforeX = (px - state.x) / state.scale;
    const beforeY = (py - state.y) / state.scale;
    state.scale = Math.min(state.maxScale, Math.max(state.minScale, nextScale));
    state.x = px - beforeX * state.scale;
    state.y = py - beforeY * state.scale;
    apply();
  }

  function midpoint(a, b) { return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 }; }
  function distance(a, b) { return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }

  viewport.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    viewport.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, e);
    viewport.classList.add('dragging');
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchStart = { dist: distance(a, b), scale: state.scale };
    }
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId);
    pointers.set(e.pointerId, e);
    if (pointers.size === 1 && !pinchStart) {
      state.x += e.clientX - prev.clientX;
      state.y += e.clientY - prev.clientY;
      apply();
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const currentDist = distance(a, b);
      const mid = midpoint(a, b);
      if (pinchStart && pinchStart.dist > 0) {
        const next = state.scale * (currentDist / pinchStart.dist);
        zoomAt(mid.x, mid.y, next);
      }
      pinchStart = { dist: currentDist, scale: state.scale };
    }
  });

  function endPointer(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchStart = null;
    if (pointers.size === 0) viewport.classList.remove('dragging');
  }
  viewport.addEventListener('pointerup', endPointer);
  viewport.addEventListener('pointercancel', endPointer);

  viewport.addEventListener('dblclick', (e) => {
    e.preventDefault();
    const targetScale = state.scale < fitScale * 1.25 ? fitScale * 1.85 : fitScale;
    zoomAt(e.clientX, e.clientY, targetScale);
  });

  viewport.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 280 && e.changedTouches[0]) {
      const t = e.changedTouches[0];
      const targetScale = state.scale < fitScale * 1.25 ? fitScale * 1.85 : fitScale;
      zoomAt(t.clientX, t.clientY, targetScale);
    }
    lastTap = now;
  }, { passive: true });

  document.querySelectorAll('.button-set button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const group = btn.closest('.button-set');
      const eventName = group.dataset.event;
      const kind = btn.dataset.kind;
      const label = kind === 'hub' ? `${eventName} 허브` : kind === 'link' ? `${eventName} 연결탐험` : `${eventName} 통합탐험`;
      dialogTitle.textContent = label;
      dialogText.textContent = '정복시대 Matrix 1.0 위치 확인용 임시 창입니다. 다음 단계에서 실제 허브 페이지와 탐험 내용을 연결합니다.';
      dialog.showModal();
    });
  });

  document.querySelectorAll('.footer button').forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.textContent.trim();
      dialogTitle.textContent = label;
      dialogText.textContent = '첫 버전에서는 하단 메뉴가 메인 이미지와 분리되어 고정되는지 확인합니다. 실제 링크는 다음 단계에서 연결합니다.';
      dialog.showModal();
    });
  });

  closeDialog.addEventListener('click', () => dialog.close());
  resetBtn.addEventListener('click', fitView);
  zoomOutBtn.addEventListener('click', () => zoomAt(window.innerWidth / 2, window.innerHeight / 2, state.scale / 1.22));
  zoomInBtn.addEventListener('click', () => zoomAt(window.innerWidth / 2, window.innerHeight / 2, state.scale * 1.22));
  window.addEventListener('resize', fitView);
  window.addEventListener('load', fitView);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
})();
