// Nicole Hernandez — shared behaviour: warm cursor light, blue page
// transitions, scroll reveals, and a lightbox for videos + photos.

// Web3Forms access key made with Destined Echo's email (https://web3forms.com).
// Used by the inquiry form and the Reimagined island sign-up.
window.NH_FORM_KEY = 'PASTE-DESTINED-ECHO-ACCESS-KEY-HERE';

(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;

  // ── warm light that trails the cursor ──
  if (finePointer && !reduce && !document.body.hasAttribute('data-no-glow')) {
    const glow = document.createElement('div');
    glow.className = 'glow';
    document.body.appendChild(glow);
    let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; glow.classList.add('on'); });
    document.addEventListener('pointerleave', () => glow.classList.remove('on'));
    (function loop() {
      x += (tx - x) * .12; y += (ty - y) * .12;
      glow.style.transform = `translate(${x}px,${y}px)`;
      requestAnimationFrame(loop);
    })();
  }

  // ── page transitions: blue circle closes from where you clicked, opens on the next page ──
  const veil = document.createElement('div');
  veil.className = 'veil';
  document.body.appendChild(veil);

  let arrived = false;
  try { arrived = sessionStorage.getItem('nh-veil') === '1'; sessionStorage.removeItem('nh-veil'); } catch (e) {}
  if (arrived && !reduce) {
    veil.classList.add('cover', 'instant');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      veil.classList.remove('cover', 'instant');
      veil.classList.add('lift');
      setTimeout(() => veil.classList.remove('lift'), 900);
    }));
  }
  addEventListener('pageshow', e => { if (e.persisted) veil.className = 'veil'; });

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || reduce || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    e.preventDefault();
    veil.style.setProperty('--vx', e.clientX + 'px');
    veil.style.setProperty('--vy', e.clientY + 'px');
    veil.classList.add('cover');
    try { sessionStorage.setItem('nh-veil', '1'); } catch (err) {}
    setTimeout(() => { location.href = url.href; }, 620);
  });

  // ── reveal on scroll ──
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: .12 });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  // ── lightbox ──
  let lb, stage, opener;
  function ensureLightbox() {
    if (lb) return;
    lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = '<button class="lb-close">close ✕</button><div class="lb-stage"></div>';
    document.body.appendChild(lb);
    stage = lb.querySelector('.lb-stage');
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('on')) close(); });
  }
  function open(html, from) {
    ensureLightbox();
    opener = from || null;
    stage.innerHTML = html;
    lb.classList.add('on');
    lb.querySelector('.lb-close').focus();
  }
  function close() {
    lb.classList.remove('on');
    stage.innerHTML = '';
    if (opener) opener.focus();
  }
  window.NH = {
    openVideo(id, title, from) {
      open(`<div style="width:min(1000px,92vw);aspect-ratio:16/9;background:#000" class="lace"><iframe style="width:100%;height:100%;border:0;display:block;position:relative" src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="${title} — Nicole Hernandez" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`, from);
    },
    openPhoto(src, alt, from) {
      open(`<div class="lace" style="max-width:min(900px,92vw)"><img src="${src}" alt="${alt}" style="max-height:82vh;width:auto"></div>`, from);
    }
  };
})();
