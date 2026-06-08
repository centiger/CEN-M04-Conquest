(() => {
  const viewport = document.getElementById('viewport');
  const canvas = document.getElementById('canvas');
  const dialog = document.getElementById('infoDialog');
  const dialogTitle = document.getElementById('dialogTitle');
  const dialogText = document.getElementById('dialogText');
  const closeDialog = document.getElementById('closeDialog');

  const base = { w: 846, h: 1858 };
  const state = { scale: 1, minScale: 0.35, maxScale: 3.2, x: 0, y: 0 };
  const pointers = new Map();
  let pinchStart = null;
  let fitScale = 1;

  function clampPan() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const sw = base.w * state.scale;
    const sh = base.h * state.scale;
    const xMargin = 80;

    // 좌우는 약간의 여유를 두고 이동 허용
    if (sw <= vw) state.x = (vw - sw) / 2;
    else state.x = Math.min(xMargin, Math.max(vw - sw - xMargin, state.x));

    // 세로는 아래로 끌어내리지 않게 제한하고, 위로만 이동
    // 마지막 영역이 하단 고정 메뉴 위에서 멈추도록 과도한 하단 노출을 차단
    if (sh <= vh) {
      state.y = 0;
    } else {
      const minY = vh - sh + 12;
      state.y = Math.min(0, Math.max(minY, state.y));
    }
  }

  function apply() {
    clampPan();
    canvas.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`;
  }

  function fitView() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    state.minScale = Math.min(vw / base.w, vh / base.h) * 0.88;
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

  function beginPinch() {
    const [a, b] = [...pointers.values()];
    const rect = viewport.getBoundingClientRect();
    const mid = midpoint(a, b);
    const px = mid.x - rect.left;
    const py = mid.y - rect.top;
    pinchStart = {
      dist: distance(a, b),
      scale: state.scale,
      contentX: (px - state.x) / state.scale,
      contentY: (py - state.y) / state.scale
    };
  }

  viewport.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    e.preventDefault();
    viewport.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, e);
    viewport.classList.add('dragging');
    if (pointers.size === 2) beginPinch();
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    e.preventDefault();
    const prev = pointers.get(e.pointerId);
    pointers.set(e.pointerId, e);

    if (pointers.size === 1 && !pinchStart) {
      state.x += e.clientX - prev.clientX;
      state.y += e.clientY - prev.clientY;
      apply();
      return;
    }

    if (pointers.size === 2 && pinchStart) {
      const [a, b] = [...pointers.values()];
      const rect = viewport.getBoundingClientRect();
      const mid = midpoint(a, b);
      const px = mid.x - rect.left;
      const py = mid.y - rect.top;
      const ratio = distance(a, b) / pinchStart.dist;
      state.scale = Math.min(state.maxScale, Math.max(state.minScale, pinchStart.scale * ratio));
      state.x = px - pinchStart.contentX * state.scale;
      state.y = py - pinchStart.contentY * state.scale;
      apply();
    }
  });

  function endPointer(e) {
    pointers.delete(e.pointerId);
    if (pointers.size === 2) beginPinch();
    else pinchStart = null;
    if (pointers.size === 0) viewport.classList.remove('dragging');
  }
  viewport.addEventListener('pointerup', endPointer);
  viewport.addEventListener('pointercancel', endPointer);

  // 모바일 기본 조작감에 맞춰 더블탭 확대는 제거하고, 한 손가락 드래그 + 두 손가락 핀치만 사용한다.

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
  window.addEventListener('resize', fitView);
  window.addEventListener('load', fitView);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
})();
