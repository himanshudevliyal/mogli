/* =====================================================================
   Mogli — doodle.js   (all pages)
   2  navigation: dropdown panels, mobile menu, bar -> pill on the home page
   3  FAQ accordion, "#" placeholder links
   4  smooth scroll (Lenis)
   5  motion (GSAP + ScrollTrigger + DrawSVG + MotionPath + Flip), only when the
      visitor has no reduced-motion preference. Without GSAP or with reduced
      motion the page is static and complete.
   ===================================================================== */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- 2. Navigation ---------- */
  function initNav() {
    var nav = $('#ddNav');
    if (!nav) return;
    var burger = $('.dd-burger', nav);
    var items = $$('.dd-item', nav).filter(function (li) { return $('.dd-panel', li); });
    var desktop = function () { return window.innerWidth >= 992; };
    var hoverable = window.matchMedia('(hover: hover)');

    var closeAll = function (except) {
      items.forEach(function (li) {
        if (li === except) return;
        li.classList.remove('is-open');
        var b = $('.dd-link', li); if (b) b.setAttribute('aria-expanded', 'false');
      });
    };
    var setOpen = function (li, on) {
      if (on) closeAll(li);
      li.classList.toggle('is-open', on);
      var b = $('.dd-link', li); if (b) b.setAttribute('aria-expanded', on ? 'true' : 'false');
    };
    var setMenu = function (on) {
      nav.classList.toggle('is-open', on);
      burger.setAttribute('aria-expanded', on ? 'true' : 'false');
      burger.setAttribute('aria-label', on ? 'Close menu' : 'Open menu');
      if (!on) closeAll();
    };

    items.forEach(function (li) {
      var b = $('.dd-link', li), timer;
      b.addEventListener('click', function (e) {
        // a real mouse click on a hover-opened panel keeps it open; keyboard and touch toggle
        if (desktop() && hoverable.matches && e.detail > 0 && li.classList.contains('is-open')) return;
        setOpen(li, !li.classList.contains('is-open'));
      });
      li.addEventListener('mouseenter', function () { if (desktop() && hoverable.matches) { clearTimeout(timer); setOpen(li, true); } });
      li.addEventListener('mouseleave', function () { if (desktop() && hoverable.matches) { timer = setTimeout(function () { setOpen(li, false); }, 140); } });
      li.addEventListener('focusout', function (e) { if (desktop() && !li.contains(e.relatedTarget)) setOpen(li, false); });
    });
    if (burger) burger.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
    d.addEventListener('click', function (e) { if (!nav.contains(e.target)) { closeAll(); if (nav.classList.contains('is-open')) setMenu(false); } });
    d.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var open = items.filter(function (li) { return li.classList.contains('is-open'); })[0];
      closeAll();
      if (open) { var b = $('.dd-link', open); if (b) b.focus(); }
      else if (nav.classList.contains('is-open')) { setMenu(false); if (burger) burger.focus(); }
    });
    $$('a', $('.dd-menu', nav)).forEach(function (a) { a.addEventListener('click', function () { closeAll(); if (nav.classList.contains('is-open')) setMenu(false); }); });
    window.addEventListener('resize', function () { closeAll(); if (desktop()) setMenu(false); });

    // Home page: the plain top bar turns into the sticky pill once the audience strip reaches it
    var strip = $('#strip');
    var setPill = function (on, animate) {
      if (nav.classList.contains('is-pill') === on) return;
      if (!animate || reduceQuery.matches) { nav.classList.toggle('is-pill', on); return; }
      nav.classList.add('is-hidden');
      setTimeout(function () { nav.classList.toggle('is-pill', on); nav.classList.remove('is-hidden'); }, 220);
    };
    if (strip) {
      var ticking = false;
      var check = function () { ticking = false; setPill(strip.getBoundingClientRect().top <= 72, true); };
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(check); } }, { passive: true });
      setPill(strip.getBoundingClientRect().top <= 72, false);
    } else if (nav.classList.contains('is-pill') && !reduceQuery.matches) {
      nav.classList.add('is-hidden');
      requestAnimationFrame(function () { requestAnimationFrame(function () { nav.classList.remove('is-hidden'); }); });
    }
  }

  /* ---------- 3. FAQ + placeholder links ---------- */
  function initFaq() {
    var items = $$('[data-faq]');
    items.forEach(function (item) {
      var btn = $('.dd-faq__q', item);
      btn.addEventListener('click', function () {
        var open = !item.classList.contains('is-open');
        items.forEach(function (it) {
          var o = it === item && open;
          it.classList.toggle('is-open', o);
          $('.dd-faq__q', it).setAttribute('aria-expanded', o ? 'true' : 'false');
        });
      });
    });
  }
  /* ---- contact form: prepares an email in the visitor's own mail app (nothing is sent from the page) ---- */
  function initContact() {
    var form = $('form[data-mailto]');
    if (!form) return;
    var q = new URLSearchParams(window.location.search);
    var topic = q.get('topic'), team = q.get('team');
    if (topic) { $$('#cf-topic option').forEach(function (o) { if (o.getAttribute('data-topic') === topic) o.selected = true; }); }
    if (team) { $$('#cf-team option').forEach(function (o) { if (o.getAttribute('data-team') === team) o.selected = true; }); }
    var status = $('.dd-form__status', form);
    function clearErr(el) {
      el.removeAttribute('aria-invalid');
      var e = el.parentNode.querySelector('.dd-field__err'); if (e) e.remove();
      el.removeAttribute('aria-describedby');
    }
    function setErr(el, msg) {
      clearErr(el);
      el.setAttribute('aria-invalid', 'true');
      var e = document.createElement('span'); e.className = 'dd-field__err'; e.id = el.id + '-err'; e.textContent = msg;
      el.parentNode.appendChild(e); el.setAttribute('aria-describedby', e.id);
    }
    $$('input, textarea', form).forEach(function (el) { el.addEventListener('input', function () { clearErr(el); }); });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var f = form.elements, bad = null;
      [['name', 'Please add your name.'], ['email', 'Please add your work email.'], ['message', 'Please write a short message.']].forEach(function (k) {
        var el = f[k[0]]; clearErr(el);
        var v = el.value.trim();
        if (!v || (k[0] === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))) { setErr(el, k[0] === 'email' && v ? 'That email does not look right.' : k[1]); if (!bad) bad = el; }
      });
      if (bad) { bad.focus(); status.hidden = true; return; }
      var to = form.getAttribute('data-mailto');
      var subject = f.topic.value + (f.company.value.trim() ? ' - ' + f.company.value.trim() : '');
      var lines = ['Name: ' + f.name.value.trim(), 'Email: ' + f.email.value.trim()];
      if (f.company.value.trim()) lines.push('Company: ' + f.company.value.trim());
      if (f.team.value) lines.push('Type of company: ' + f.team.value);
      lines.push('Topic: ' + f.topic.value, '', f.message.value.trim());
      var href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\r\n'));
      status.hidden = false;
      status.textContent = 'Your email app should open with the message ready to send. If nothing opens, write to ' + to + ' directly.';
      window.location.href = href;
    });
  }

  function initLinks() {
    $$('a[data-placeholder-link]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });
    // opened straight from disk, folder links need index.html
    if (location.protocol === 'file:') {
      $$('a[href]').forEach(function (a) {
        var h = a.getAttribute('href');
        if (!h || /^(#|https?:|mailto:|tel:)/.test(h)) return;
        var m = h.match(/^([^#?]*)(.*)$/);
        if (m[1] && /\/$/.test(m[1])) a.setAttribute('href', m[1] + 'index.html' + m[2]);
      });
    }
  }

  /* ---------- 4. Smooth scroll (Lenis, https://lenis.dev) ---------- */
  // Driven by the GSAP ticker so ScrollTrigger and the road/board scrubs stay in step.
  // Skipped for visitors who prefer reduced motion; the page then scrolls natively.
  function initSmooth() {
    if (!window.Lenis || reduceQuery.matches) return;
    var gsap = window.gsap, ST = window.ScrollTrigger;
    var useGsap = !!(gsap && ST);
    var lenis = new window.Lenis({ autoRaf: !useGsap });
    window.mogliLenis = lenis;
    if (useGsap) {
      lenis.on('scroll', ST.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    // scrollable panels (mega menus, mobile menu) keep native wheel scrolling
    $$('.dd-panel, .dd-menu').forEach(function (el) { el.setAttribute('data-lenis-prevent', ''); });
    // in-page links glide to their section, leaving room for the fixed nav
    d.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var h = a.getAttribute('href');
      if (!h || h.length < 2) return;
      var target = null;
      try { target = d.querySelector(h); } catch (err) { return; }
      if (!target) return;
      e.preventDefault();
      var margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      lenis.scrollTo(target, { offset: -margin });
      if (history.pushState) history.pushState(null, '', h);
    });
  }

  /* ---------- 5. Motion ---------- */
  function initMotion() {
    var gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    var plugins = [ST, window.DrawSVGPlugin, window.MotionPathPlugin, window.Flip].filter(Boolean);
    gsap.registerPlugin.apply(gsap, plugins);
    var hasDraw = !!window.DrawSVGPlugin, hasPath = !!window.MotionPathPlugin, hasFlip = !!window.Flip;
    var mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', function () {
      var rnd = gsap.utils.random;

      /* "boil": the turbulence seed changes ~6 times a second so marker lines wobble */
      var turb = $('#dd-boil feTurbulence');
      if (turb && $('.boil')) {
        var seed = 0;
        gsap.to({}, { duration: .16, repeat: -1, onRepeat: function () { seed = (seed + 1) % 4; turb.setAttribute('seed', seed); } });
      }

      /* section headings: squiggle draws itself, copy rises */
      if (hasDraw) {
        $$('.dd-squig path').forEach(function (p) {
          gsap.from(p, { drawSVG: '0%', duration: .9, ease: 'power2.out', scrollTrigger: { trigger: p.closest('.dd-title') || p, start: 'top 88%', once: true } });
        });
      }
      $$('[data-reveal]').forEach(function (el) {
        gsap.from(el, { y: 30, opacity: 0, duration: .7, ease: 'power2.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
      });

      /* ----- hero: the family road trip ----- */
      var hero = $('#hero'), cleanups = [];
      if (hero) {
        var q = function (s) { return $(s, hero); }, qa = function (s) { return $$(s, hero); };
        var letters = qa('.ch'), note = q('[data-note]'), pass = q('[data-pass]'), stamp = q('.dd-stamp');
        var totalEl = q('[data-total]');
        var ease = 'sine.inOut';

        // intro
        var intro = gsap.timeline({ defaults: { ease: 'back.out(1.7)' } });
        intro.from(letters, { y: 80, rotate: function () { return rnd(-25, 25); }, opacity: 0, duration: .8, stagger: .08 });
        if (hasDraw && q('.dd-wordmark__line path')) intro.from(q('.dd-wordmark__line path'), { drawSVG: '0%', duration: .7, ease: 'power2.inOut' }, .5);
        intro.from(q('.dd-hero__eyebrow'), { y: -14, opacity: 0, duration: .5 }, .3)
             .from(qa('.rt-spark'), { scale: 0, transformOrigin: '50% 50%', duration: .5, stagger: .08 }, .8)
             .from(q('.rt-van'), { x: -900, duration: 1.6, ease: 'power3.out' }, .2);
        if (note) intro.from(note, { y: 60, rotate: -14, opacity: 0, duration: .9 }, .9);
        if (pass) intro.from(pass, { y: 60, rotate: 16, opacity: 0, duration: .9 }, 1.05);
        if (totalEl) {
          var tv = { v: 0 }, target = +totalEl.getAttribute('data-total');
          totalEl.textContent = '0';
          intro.to(tv, { v: target, duration: 1.4, ease: 'power2.out', onUpdate: function () { totalEl.textContent = Math.round(tv.v).toLocaleString('en-IN'); } }, 1.4);
        }

        // letters keep a little life in them
        letters.forEach(function (l, i) {
          gsap.to(l, { rotate: i % 2 ? 4 : -4, y: -6, duration: 1.4 + i * .15, repeat: -1, yoyo: true, ease: ease, delay: 1.2 });
        });
        gsap.to(qa('.rt-spark'), { scale: .6, rotate: 30, transformOrigin: '50% 50%', duration: .9, repeat: -1, yoyo: true, stagger: .3, ease: ease, delay: 1.4 });

        // the drive: road, verge and horizon pass at their own speeds
        gsap.to(q('.rt-dashes'), { strokeDashoffset: 140, duration: .7, repeat: -1, ease: 'none' });
        gsap.to(q('.rt-verge'), { x: -1600, duration: 8, repeat: -1, ease: 'none' });
        gsap.to(q('.rt-horizon'), { x: -1600, duration: 60, repeat: -1, ease: 'none' });
        gsap.to(qa('.rt-cloud'), { x: '-=140', duration: 18, repeat: -1, yoyo: true, ease: ease, stagger: 3 });
        gsap.to(qa('.rt-blades'), { rotate: 360, transformOrigin: '50% 50%', duration: 6, repeat: -1, ease: 'none' });

        // the van
        gsap.to(qa('.rt-wheel'), { rotate: 360, transformOrigin: '50% 50%', duration: .5, repeat: -1, ease: 'none' });
        gsap.to(q('.rt-van-body'), { y: -5, rotate: -.6, transformOrigin: '50% 100%', duration: .22, repeat: -1, yoyo: true, ease: ease });
        gsap.to(q('.rt-arm'), { rotate: -32, transformOrigin: '0% 100%', duration: .32, repeat: -1, yoyo: true, ease: ease });
        gsap.to(q('.rt-ear'), { rotate: -50, transformOrigin: '50% 0%', duration: .14, repeat: -1, yoyo: true, ease: ease });
        gsap.fromTo(qa('.rt-puff'), { x: 0, y: 0, scale: .4, opacity: 1, transformOrigin: '50% 50%' }, { x: -110, y: -36, scale: 1.7, opacity: 0, duration: 1.2, repeat: -1, stagger: .4, ease: 'power1.out' });
        gsap.to(qa('.rt-speed'), { opacity: .15, x: -12, duration: .25, repeat: -1, yoyo: true, stagger: .08 });

        // the back seat talks
        var lines = qa('.rt-line'), bub = q('.rt-bubble');
        if (lines.length && bub) {
          gsap.set(lines, { opacity: 0 });
          var chat = gsap.timeline({ repeat: -1, delay: 2 });
          lines.forEach(function (line) {
            chat.fromTo(bub, { scale: .6, opacity: 0, transformOrigin: '70% 100%' }, { scale: 1, opacity: 1, duration: .35, ease: 'back.out(2.5)' })
                .set(line, { opacity: 1 }, '<')
                .to(bub, { scale: .6, opacity: 0, duration: .25, ease: 'power2.in' }, '+=1.8')
                .set(line, { opacity: 0 })
                .to({}, { duration: 1.4 });
          });
        }

        // sky
        gsap.to(q('.rt-rays'), { rotate: 360, transformOrigin: '50% 50%', duration: 24, repeat: -1, ease: 'none' });
        gsap.to(qa('.rt-bird'), { scaleY: .4, transformOrigin: '50% 50%', duration: .3, repeat: -1, yoyo: true, stagger: .12 });
        gsap.to(q('.rt-birds'), { x: 60, y: -20, duration: 6, repeat: -1, yoyo: true, ease: ease });
        gsap.to(q('.rt-pin'), { y: '-=18', duration: .6, repeat: -1, yoyo: true, ease: 'power1.inOut' });

        // the paper plane loops and draws its own trail
        var trail = q('.rt-trail'), planeEl = q('.rt-paper-plane');
        if (hasPath && hasDraw && trail && planeEl) {
          gsap.set(trail, { drawSVG: '0%' });
          gsap.timeline({ repeat: -1, repeatDelay: 1.5, delay: 1.5 })
            .set(trail, { opacity: 1 })
            .fromTo(trail, { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 6, ease: 'none' })
            .to(planeEl, { motionPath: { path: '#rt-flight', align: '#rt-flight', alignOrigin: [.5, .5], autoRotate: true }, duration: 6, ease: 'none' }, '<')
            .to(trail, { opacity: 0, duration: .8 });
        }

        // the stamp lands on the boarding pass now and then
        if (stamp && pass) {
          gsap.set(stamp, { opacity: 0 });
          gsap.timeline({ repeat: -1, repeatDelay: 3.5, delay: 2.8 })
            .fromTo(stamp, { scale: 2.4, opacity: 0, rotate: -30 }, { scale: 1, opacity: 1, rotate: -12, duration: .35, ease: 'power4.in' })
            .to(pass, { x: '+=4', y: '+=3', duration: .06, yoyo: true, repeat: 3 })
            .to(stamp, { opacity: 0, duration: .4 }, '+=3');
        }

        // a little parallax on the floating paper
        if (note || pass) {
          var nX = note && gsap.quickTo(note, 'x', { duration: .8 }), nY = note && gsap.quickTo(note, 'y', { duration: .8 });
          var pX = pass && gsap.quickTo(pass, 'x', { duration: .8 }), pY = pass && gsap.quickTo(pass, 'y', { duration: .8 });
          var onMove = function (e) {
            var nx = (e.clientX / window.innerWidth - .5) * 2, ny = (e.clientY / window.innerHeight - .5) * 2;
            if (nX) { nX(nx * 10); nY(ny * 8); }
            if (pX) { pX(nx * -12); pY(ny * -8); }
          };
          if (window.matchMedia('(pointer: fine)').matches) {
            intro.eventCallback('onComplete', function () { window.addEventListener('pointermove', onMove); });
            cleanups.push(function () { window.removeEventListener('pointermove', onMove); });
          }
        }
      }

      /* ----- how it works: the road draws itself while the car drives down it ----- */
      var road = $('[data-road]');
      if (road) {
        road.style.setProperty('--p', 0);
        ST.create({ trigger: road, start: 'top 60%', end: 'bottom 60%', scrub: true, onUpdate: function (self) { road.style.setProperty('--p', self.progress.toFixed(4)); } });
        $$('[data-step]', road).forEach(function (st, i) {
          var card = $('.dd-step__card', st), node = $('.dd-step__node', st);
          var side = window.innerWidth < 768 ? 60 : (i % 2 ? 110 : -110);
          gsap.from(card, { x: side, opacity: 0, duration: .8, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: st, start: 'top 80%', once: true } });
          gsap.from(node, { scale: 0, rotation: -40, duration: .6, ease: 'back.out(2.4)', clearProps: 'transform', scrollTrigger: { trigger: st, start: 'top 80%', once: true } });
        });
      }

      /* ----- card grids: back-out bounce ----- */
      [['[data-fgrid] .dd-card', 50], ['[data-trust]', 40], ['[data-post]', 40], ['[data-pop]', 40]].forEach(function (g) {
        var cards = $$(g[0]);
        if (!cards.length) return;
        gsap.set(cards, { opacity: 0, y: g[1], scale: .9 });
        ST.batch(cards, { start: 'top 92%', once: true, onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, scale: 1, stagger: .07, duration: .6, ease: 'back.out(1.7)', clearProps: 'transform,opacity', overwrite: true }); } });
      });

      /* ----- sample board moves cards between columns with Flip ----- */
      var board = $('[data-board]');
      if (board && hasFlip) {
        var cols = $$('[data-col]', board), cards = $$('[data-bcard]', board), step = 0;
        var tl = gsap.timeline({ repeat: -1, paused: true });
        tl.call(function () {
          var card = cards[step % cards.length]; step++;
          var from = cols.indexOf(card.parentNode), to = (from + 1) % cols.length;
          var state = window.Flip.getState(cards);
          cols[to].appendChild(card);
          window.Flip.from(state, { duration: .7, ease: 'power2.inOut' });
        }, null, 0).to({}, { duration: 1.8 });
        ST.create({ trigger: board, start: 'top 90%', end: 'bottom 5%', onToggle: function (self) { if (self.isActive) tl.play(); else tl.pause(); } });
      }

      /* ----- luggage tags drop in and swing ----- */
      var tags = $$('[data-tags] .dd-tag');
      if (tags.length) {
        gsap.set(tags, { opacity: 0, y: -170, rotation: function () { return rnd(-10, 10); } });
        ST.batch(tags, { start: 'top 92%', once: true, onEnter: function (b) {
          gsap.to(b, { opacity: 1, y: 0, rotation: 0, duration: 1.1, ease: 'bounce.out', stagger: .12, overwrite: true, onComplete: function () {
            b.forEach(function (t) { gsap.fromTo(t, { rotation: -2.2 }, { rotation: 2.2, duration: rnd(2.4, 3.4), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: rnd(0, 1) }); });
          } });
        } });
      }

      /* ----- phone floats, notifications pop in ----- */
      var phoneWrap = $('[data-phone]');
      if (phoneWrap) {
        gsap.to($('.dd-phone', phoneWrap), { y: -12, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        var pills = $$('[data-pill]', phoneWrap);
        gsap.set(pills, { scale: 0, opacity: 0, rotation: -18 });
        ST.create({ trigger: phoneWrap, start: 'top 75%', once: true, onEnter: function () {
          gsap.to(pills, { scale: 1, opacity: 1, rotation: 0, duration: .6, ease: 'back.out(2.2)', stagger: .45, onComplete: function () {
            pills.forEach(function (p, i) { gsap.to(p, { y: i % 2 ? 7 : -7, duration: 2 + i * .4, ease: 'sine.inOut', yoyo: true, repeat: -1 }); });
          } });
        } });
      }

      /* ----- sticker suitcase: the padlock jiggles ----- */
      var lock = $('[data-suitcase] .lock');
      if (lock) {
        gsap.timeline({ repeat: -1, repeatDelay: 3.2, scrollTrigger: { trigger: lock, start: 'top 95%', toggleActions: 'play pause resume pause' } })
          .to(lock, { rotation: 14, transformOrigin: '50% 0%', duration: .07, yoyo: true, repeat: 7, ease: 'sine.inOut' })
          .to(lock, { rotation: 0, duration: .1 });
        gsap.to($$('[data-suitcase] .stk'), { rotation: '+=3', duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: .25 });
      }

      /* ----- postcard: tilts in, stamp slams ----- */
      var pc = $('[data-postcard]');
      if (pc) {
        gsap.from(pc, { y: 70, rotation: -5, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: pc, start: 'top 85%', once: true } });
        var sb = $('[data-stampbox]', pc);
        if (sb) gsap.from(sb, { scale: 3.4, rotation: -30, opacity: 0, duration: .35, delay: .5, ease: 'power4.in', scrollTrigger: { trigger: pc, start: 'top 70%', once: true } });
      }

      /* ----- inner pages: hero copy rises in, zig-zag rows slide from their sides ----- */
      var ph = $('[data-phero]');
      if (ph) {
        var kids = $$('[data-hero]', ph);
        gsap.from(kids, { y: 34, opacity: 0, duration: .75, stagger: .12, ease: 'power3.out', clearProps: 'transform,opacity', delay: .15 });
        var sun = $('.dd-phero__sun', ph);
        if (sun) gsap.from(sun, { scale: 0, rotation: -60, transformOrigin: '50% 50%', duration: .9, ease: 'back.out(2)', clearProps: 'transform' });
      }
      $$('[data-zz]').forEach(function (row, i) {
        var txt = $('.dd-zz__text', row), med = $('.dd-zz__media', row);
        var flip = row.classList.contains('dd-zz__item--flip'), narrow = window.innerWidth < 992;
        var dx = narrow ? 0 : 70;
        var tr = { trigger: row, start: 'top 82%', once: true };
        if (txt) gsap.from(txt, { x: flip ? dx : -dx, y: narrow ? 30 : 0, opacity: 0, duration: .8, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: tr });
        if (med) gsap.from(med, { x: flip ? -dx : dx, y: narrow ? 30 : 0, opacity: 0, duration: .8, delay: .1, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: tr });
      });

      return function () { cleanups.forEach(function (fn) { fn(); }); };
    });
  }

  function boot() {
    initNav(); initFaq(); initLinks(); initContact(); initSmooth();
    if (window.gsap && window.ScrollTrigger) initMotion();
    else root.classList.remove('js');
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})();
