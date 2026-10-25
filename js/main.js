/* ==========================================================
   Висюн (v1syun) — скрипты лендинга
   © 2026, Полунин Лев. Все права защищены.
   ========================================================== */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var TG = 'https://t.me/pechenyushkina';
  var NS = 'http://www.w3.org/2000/svg';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var PAL = {
    pink: '#F49AB5', green: '#6BBE45', yellow: '#FFD740', blue: '#45A8E6',
    red: '#E5294F', lilac: '#B79CEB', rose: '#E8457A'
  };
  var SCHEMES = {
    rainbow: ['#F49AB5', '#FFD740', '#45A8E6', '#E5294F', '#6BBE45', '#B79CEB'],
    pink: ['#E8457A'],
    pastel: ['#F9C6D6', '#FFE39A', '#C9EDB3', '#BFE3F7', '#D9CCF5']
  };

  /* ---------- утилиты ---------- */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    var f = function (v) { return Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt))); };
    return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
  }
  function isLight(hex) {
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return (r * 299 + g * 587 + b * 114) / 1000 > 200;
  }
  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  /* ---------- фетровые буквы ---------- */
  var FS = 120, H = 150, BASE = 112, PAD = 9;

  function feltWord(text, colors) {
    var wrap = document.createElement('span');
    wrap.className = 'felt';
    wrap.setAttribute('aria-hidden', 'true');
    var ci = 0;
    Array.prototype.forEach.call(text, function (ch) {
      if (ch === ' ') {
        var sp = document.createElement('span'); sp.className = 'sp'; wrap.appendChild(sp); return;
      }
      var c = colors[ci++ % colors.length];
      var stitch = isLight(c) ? shade(c, -0.32) : 'rgba(255,255,255,.92)';
      var span = document.createElement('span'); span.className = 'fl';
      var svg = el('svg', { viewBox: '0 0 80 ' + H, focusable: 'false' });
      var common = { x: PAD, y: BASE, 'font-size': FS, 'font-family': 'Nunito, "Arial Rounded MT Bold", sans-serif', 'font-weight': 900 };
      var t1 = el('text', Object.assign({}, common, { fill: shade(c, -0.35), stroke: shade(c, -0.35), 'stroke-width': 13, 'stroke-linejoin': 'round', opacity: '.35', transform: 'translate(1.5 5)' }));
      var t2 = el('text', Object.assign({}, common, { fill: c, stroke: c, 'stroke-width': 13, 'stroke-linejoin': 'round', filter: 'url(#feltTex)' }));
      var t3 = el('text', Object.assign({}, common, { fill: 'none', stroke: stitch, 'stroke-width': 2.6, 'stroke-dasharray': '6 5', 'stroke-linecap': 'round' }));
      [t1, t2, t3].forEach(function (t) { t.textContent = ch; svg.appendChild(t); });
      span.appendChild(svg);
      wrap.appendChild(span);
    });
    return wrap;
  }

  function fitFelt(wrap) {
    $$('svg', wrap).forEach(function (svg) {
      var t = svg.querySelector('text:nth-of-type(2)');
      var len = 0;
      try { len = t.getComputedTextLength(); } catch (e) { len = 0; }
      if (!len) len = 68;
      var w = len + PAD * 2;
      svg.setAttribute('viewBox', '0 0 ' + w.toFixed(1) + ' ' + H);
      svg.style.width = (w / H).toFixed(3) + 'em';
    });
  }

  function renderFelt(node) {
    var text = node.getAttribute('data-felt');
    var colors = (node.getAttribute('data-colors') || 'pink,green,yellow,blue,red,lilac').split(',').map(function (k) { return PAL[k.trim()] || k.trim(); });
    if (!node.hasAttribute('aria-label') && !node.closest('[aria-hidden="true"]')) node.setAttribute('aria-label', text);
    if (!node.hasAttribute('role') && node.hasAttribute('aria-label')) node.setAttribute('role', 'img');
    node.textContent = '';
    var w = feltWord(text, colors);
    node.appendChild(w);
    fitFelt(w);
  }

  function initFelt() { $$('[data-felt]').forEach(renderFelt); }

  var fontsReady = (document.fonts && document.fonts.load)
    ? Promise.race([
        Promise.all([document.fonts.load('900 120px Nunito', 'висюн v1syun'), document.fonts.ready]),
        new Promise(function (r) { setTimeout(r, 2500); })
      ])
    : Promise.resolve();

  /* ---------- тост и заказ ---------- */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3600);
  }
  function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).catch(function () { legacyCopy(text); });
        return;
      }
    } catch (e) { /* noop */ }
    legacyCopy(text);
  }
  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
    document.body.appendChild(ta);
    ta.select(); ta.setSelectionRange(0, text.length);
    try { document.execCommand('copy'); } catch (e) { /* noop */ }
    document.body.removeChild(ta);
  }
  function orderMsg(what) { return 'Здравствуйте, Катя! Хочу заказать: ' + what; }
  function order(what, openTg) {
    copyText(orderMsg(what));
    toast('Текст заказа скопирован — вставьте его в чат с Катей ♡');
    if (openTg) window.open(TG, '_blank', 'noopener');
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-order]');
    if (!t) return;
    var isLink = t.tagName === 'A' && t.getAttribute('href') && t.getAttribute('href').indexOf('t.me') > -1;
    order(t.getAttribute('data-order'), !isLink);
  });

  /* ---------- меню ---------- */
  var burger = $('.burger'), nav = $('#nav');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  }
  if (burger && nav) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 980) setMenu(false); });
  }

  /* ---------- плавающая кнопка ---------- */
  var fab = $('.fab');
  function onScroll() { if (fab) fab.classList.toggle('is-on', window.scrollY > 640); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- hero: буквы прыгают ---------- */
  $$('.hero__logo .hl').forEach(function (h) {
    h.addEventListener('pointerdown', function () {
      h.classList.remove('boing'); void h.offsetWidth; h.classList.add('boing');
    });
    h.addEventListener('animationend', function (e) { if (e.animationName === 'boing') h.classList.remove('boing'); });
  });

  /* ---------- фильтр витрины ---------- */
  var chips = $$('.chip');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-filter');
      chips.forEach(function (x) { var on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', String(on)); });
      $$('#cards .card').forEach(function (card) {
        card.classList.toggle('is-hidden', f !== 'all' && card.getAttribute('data-cat') !== f);
      });
    });
  });

  /* ---------- тренажёр-червяк ---------- */
  var worm = $('#worm');
  if (worm) {
    var count = 0, pressed = false;
    var mouth = $('.worm__mouth', worm);
    var fill = $('#meterFill'), cnt = $('#squishCount'), word = $('#squishWord'), mood = $('#squishMood'), puffs = $('#puffs');
    var PUFFS = ['пиу!', 'ммм', 'вдох…', 'выдох', 'хорошо', 'ещё!', 'фух', 'мягко', 'спокойно', '♡'];
    var MOODS = [[0, 'тревожность: на месте'], [3, 'чуть отпустило'], [7, 'плечи опустились'], [12, 'дыхание ровное'], [18, 'нервы в порядке ♡'], [30, 'дзен достигнут. пора заказывать']];
    function plural(n) {
      var a = n % 10, b = n % 100;
      if (a === 1 && b !== 11) return 'сжатие';
      if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return 'сжатия';
      return 'сжатий';
    }
    function down(e) {
      if (e && e.button && e.button !== 0) return;
      pressed = true; worm.classList.add('is-press');
      mouth.setAttribute('d', 'M88 146 q12 -10 24 0');
      if (navigator.vibrate) { try { navigator.vibrate(12); } catch (er) { /* noop */ } }
    }
    function up() {
      if (!pressed) return;
      pressed = false; worm.classList.remove('is-press');
      mouth.setAttribute('d', 'M84 140 q16 14 32 0');
      count++;
      cnt.textContent = count; word.textContent = plural(count);
      fill.style.width = Math.max(4, 100 - count * 5) + '%';
      var m = MOODS[0][1];
      MOODS.forEach(function (x) { if (count >= x[0]) m = x[1]; });
      mood.textContent = m;
      if (!reduceMotion && puffs) {
        var p = document.createElement('span');
        p.className = 'puff';
        p.textContent = PUFFS[Math.floor(Math.random() * PUFFS.length)];
        p.style.left = (35 + Math.random() * 30) + '%';
        p.style.top = (20 + Math.random() * 20) + '%';
        p.style.setProperty('--rot', (Math.random() * 24 - 12) + 'deg');
        puffs.appendChild(p);
        setTimeout(function () { p.remove(); }, 1300);
      }
    }
    worm.addEventListener('pointerdown', down);
    worm.addEventListener('pointerup', up);
    worm.addEventListener('pointerleave', up);
    worm.addEventListener('pointercancel', up);
    worm.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    worm.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !pressed) { e.preventDefault(); down(); } });
    worm.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') up(); });
  }

  /* ---------- конструктор футболки ---------- */
  var tee = $('#tee'), teeTop = $('#teeTop'), teeBottom = $('#teeBottom');
  var inTop = $('#inTop'), inBottom = $('#inBottom'), makerForm = $('#makerForm'), makerPrice = $('#makerPrice');
  function checked(name) { var r = document.querySelector('input[name="' + name + '"]:checked'); return r; }
  function drawLine(box, text, colors, offset) {
    box.textContent = '';
    text = (text || '').trim().toLowerCase();
    if (!text) return;
    var rotated = colors.slice(offset % colors.length).concat(colors.slice(0, offset % colors.length));
    var w = feltWord(text, rotated);
    box.appendChild(w);
    fitFelt(w);
    var avail = box.clientWidth || 200;
    var fs = Math.min(avail * 0.3, avail / (text.length * 0.6 + 0.2));
    w.style.fontSize = fs + 'px';
    // точная подгонка, если фраза не влезла
    var real = w.getBoundingClientRect().width;
    if (real > avail && real > 0) w.style.fontSize = (fs * avail / real * 0.97) + 'px';
  }
  function drawTee() {
    if (!tee) return;
    var scheme = SCHEMES[checked('letters').value] || SCHEMES.rainbow;
    tee.setAttribute('data-color', checked('cloth').value);
    drawLine(teeTop, inTop.value, scheme, 0);
    drawLine(teeBottom, inBottom.value, scheme, (inTop.value || '').trim().length);
    makerPrice.textContent = checked('kind').getAttribute('data-price') + ' ₽';
  }
  if (makerForm) {
    var raf;
    makerForm.addEventListener('input', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(drawTee); });
    makerForm.addEventListener('change', drawTee);
    makerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var phrase = [inTop.value.trim(), inBottom.value.trim()].filter(Boolean).join(' / ') || 'своя фраза';
      var cloth = checked('cloth').value === 'black' ? 'чёрный' : 'молочный';
      var letters = checked('letters').parentNode.textContent.trim().toLowerCase();
      order(checked('kind').value + ' (' + checked('kind').getAttribute('data-price') + ' ₽), надпись: «' + phrase + '», цвет ткани: ' + cloth + ', буквы: ' + letters, true);
    });
    var rz;
    window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(drawTee, 150); });
  }

  /* ---------- котик любого цвета ---------- */
  var paintCat = $('#paintCat'), catOrder = $('#catOrder');
  var GEN = { 'серый': 'серого', 'белый': 'белого', 'чёрный': 'чёрного', 'рыжий': 'рыжего', 'коричневый': 'коричневого', 'лавандовый': 'лавандового' };
  $$('.sws').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.sws').forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-checked', String(on)); });
      var c = b.getAttribute('data-c'), n = b.getAttribute('data-n');
      paintCat.style.setProperty('--cat', c);
      paintCat.style.setProperty('--stitch', isLight(c) ? 'rgba(43,30,47,.35)' : 'rgba(255,255,255,.75)');
      catOrder.textContent = 'Хочу ' + (GEN[n] || n) + ' котика';
      catOrder.setAttribute('data-order', 'Котик-антистресс, цвет: ' + n + ', 990 ₽');
    });
  });

  /* ---------- сертификат ---------- */
  var giftForm = $('#giftForm');
  if (giftForm) {
    var certNo = 'VS-' + String(Math.floor(1000 + Math.random() * 9000));
    $('#certNo').textContent = '№ ' + certNo;
    var customWrap = $('#customSumWrap'), customSum = $('#customSum');
    var cert = $('#cert');
    function giftSum() {
      var v = checked('sum').value;
      if (v === 'custom') { var c = parseInt(customSum.value, 10); return c > 0 ? c : 1500; }
      return parseInt(v, 10);
    }
    function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
    function drawCert() {
      customWrap.hidden = checked('sum').value !== 'custom';
      $('#certSum').textContent = fmt(giftSum());
      $('#certTo').textContent = $('#gTo').value.trim() || 'Лиза';
      $('#certFrom').textContent = $('#gFrom').value.trim() || 'Аня';
      $('#certWish').textContent = $('#gWish').value.trim() || 'пусть нервы будут мягкими';
    }
    giftForm.addEventListener('input', drawCert);
    giftForm.addEventListener('change', function (e) {
      drawCert();
      if (e.target.name === 'sum') { cert.classList.remove('flash'); void cert.offsetWidth; cert.classList.add('flash'); if (e.target.value === 'custom') customSum.focus(); }
    });
    giftForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var parts = ['подарочный сертификат ' + certNo + ' на ' + fmt(giftSum()) + ' ₽'];
      if ($('#gTo').value.trim()) parts.push('для: ' + $('#gTo').value.trim());
      if ($('#gFrom').value.trim()) parts.push('от: ' + $('#gFrom').value.trim());
      if ($('#gWish').value.trim()) parts.push('пожелание: «' + $('#gWish').value.trim() + '»');
      order(parts.join(', '), true);
    });
    $('#giftPrint').addEventListener('click', function () { window.print(); });
    drawCert();
  }

  /* ---------- слайдер отзывов ---------- */
  var slider = $('#revSlider');
  if (slider) {
    var slides = $$('.rev', slider), dotsBox = $('#revDots'), dots = [];
    function step() {
      var s = slides[0]; if (!s) return 0;
      var gap = parseFloat(getComputedStyle(slider).columnGap) || 22;
      return s.getBoundingClientRect().width + gap;
    }
    function maxIndex() { return Math.max(0, Math.round((slider.scrollWidth - slider.clientWidth) / (step() || 1))); }
    function current() { return Math.round(slider.scrollLeft / (step() || 1)); }
    function go(i) {
      var m = maxIndex();
      if (i > m) i = 0; if (i < 0) i = m;
      slider.scrollTo({ left: i * step(), behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    function buildDots() {
      dotsBox.textContent = ''; dots = [];
      for (var i = 0; i <= maxIndex(); i++) {
        (function (i) {
          var b = document.createElement('button'); b.type = 'button'; b.tabIndex = -1;
          b.addEventListener('click', function () { go(i); });
          dotsBox.appendChild(b); dots.push(b);
        })(i);
      }
      syncDots();
    }
    function syncDots() { var c = current(); dots.forEach(function (d, i) { d.classList.toggle('is-on', i === c); }); }
    $('#revPrev').addEventListener('click', function () { go(current() - 1); });
    $('#revNext').addEventListener('click', function () { go(current() + 1); });
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current() - 1); }
    });
    var st;
    slider.addEventListener('scroll', function () { clearTimeout(st); st = setTimeout(syncDots, 60); }, { passive: true });
    var rb; window.addEventListener('resize', function () { clearTimeout(rb); rb = setTimeout(buildDots, 200); });
    buildDots();

    // мягкий автопрокрут, пауза при взаимодействии
    var auto = null, paused = false, inView = false;
    ['pointerenter', 'touchstart', 'focusin'].forEach(function (ev) { slider.addEventListener(ev, function () { paused = true; }, { passive: true }); });
    ['pointerleave', 'focusout'].forEach(function (ev) { slider.addEventListener(ev, function () { paused = false; }); });
    if (!reduceMotion && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { inView = en[0].isIntersecting; }, { threshold: .4 }).observe(slider);
      auto = setInterval(function () { if (inView && !paused && !document.hidden) go(current() + 1); }, 5500);
    }
  }

  /* ---------- видео: грузим и играем только в зоне видимости ---------- */
  var vids = $$('.reel video');
  function loadVid(v) { if (!v.getAttribute('src')) { v.src = v.getAttribute('data-src'); } }
  vids.forEach(function (v) {
    v.addEventListener('click', function () { loadVid(v); if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
  });
  if ('IntersectionObserver' in window && !reduceMotion) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { loadVid(v); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else if (!v.paused) v.pause();
      });
    }, { threshold: .45 });
    vids.forEach(function (v) { vio.observe(v); });
  }

  /* ---------- появление при скролле ---------- */
  var revealEls = $$('.sec__head, .chips, .card, .squish__stage, .maker, .specs li, .tee-gal figure, .ideas li, .paint, .reel, .cert, .stitch-path li, .bonus, .acc details, .final');
  if ('IntersectionObserver' in window && !reduceMotion) {
    revealEls.forEach(function (e, i) { e.classList.add('rv'); e.style.transitionDelay = ((i % 4) * 70) + 'ms'; });
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (e) { rio.observe(e); });
  }

  /* ---------- старт после загрузки шрифта ---------- */
  fontsReady.then(function () { initFelt(); drawTee(); }, function () { initFelt(); drawTee(); });
})();
