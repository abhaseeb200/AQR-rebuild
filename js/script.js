/*!
 * AQR Orthodontics — homepage interactions
 * Vanilla JS, no external dependencies.
 * Sections:
 *   1. Hero "wheel" carousel (circular arc of case cards)
 *   2. Smile Gallery filters + case detail modal
 *   3. Contact form (client-side demo submit — wire up to a real endpoint)
 */
(function () {
  'use strict';

  /* =========================================================
     1. HERO SLIDER (PHOTO REEL)
  ========================================================= */
  /* ==========================================================================
     AQR Orthodontics — Hero slider (photo reel)

     How it works
     ------------
     The photos are wedge-shaped slices of ONE big circle whose centre sits far
     off to the right of the column. Every panel is rotated about that centre
     (16° per slide) and clipped to a radial wedge; the circular overflow of
     .reel__disc carves the curved outer edge. Turning the reel = changing the
     rotation of every panel, so it always spins the same direction.
     ========================================================================== */

  (function () {
    'use strict';

    /* ---- Settings ---------------------------------------------------------- */
    var CONFIG = {
      autoplay: true,   // turn the reel automatically
      interval: 4200,   // ms between automatic turns
      stepDeg: 16,      // angle between neighbouring photos
      gap: 9            // px seam between neighbouring photos
    };

    /* ---- Elements ---------------------------------------------------------- */
    var hero       = document.getElementById('hero');
    var reel       = document.getElementById('hero-reel');
    if (!hero || !reel) return;
    var disc       = reel.querySelector('.reel__disc');
    var hub        = reel.querySelector('.reel__hub');
    var panels     = Array.prototype.slice.call(reel.querySelectorAll('.reel__panel'));
    var dotsWrap   = document.getElementById('hero-dots');
    var titleEl    = document.getElementById('hero-caption-title');
    var metaEl     = document.getElementById('hero-caption-meta');

    var n = panels.length;
    if (!n) return;

    /* ---- State ------------------------------------------------------------- */
    var pos    = 0;       // continuous position; only ever grows, never wraps
    var paused = false;
    var geo    = null;    // current reel geometry (see layout())
    var lastW  = 0;

    function mod(a, m) { return ((a % m) + m) % m; }

    /* ---- Dots -------------------------------------------------------------- */
    var dots = panels.map(function (panel, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'hero__dot';
      b.setAttribute('aria-label', 'Show result ' + (i + 1) + ': ' + panel.dataset.title);
      b.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(b);
      return b;
    });

    /* ---- Navigation -------------------------------------------------------- */
    // Shortest way round to slide i, so the reel keeps turning naturally.
    function goTo(i) {
      var current = mod(pos, n);
      var delta = i - current;
      if (delta >  n / 2) delta -= n;
      if (delta < -n / 2) delta += n;
      pos += delta;
      render();
    }

    panels.forEach(function (panel, i) {
      panel.addEventListener('click', function () { goTo(i); });
    });

    /* ---- Geometry (depends on the width of the reel column) ---------------- */
    function layout() {
      var W = reel.clientWidth || 460;
      lastW = W;

      var R       = 1.8 * W;                       // outer radius of the reel
      var centerX = R + 0.18 * W;                  // circle centre, right of the column
      var Ri      = Math.max(120, centerX - W);    // radius where the reel meets the column edge
      var pad     = 90;                            // panels overshoot R so the disc clips a clean arc
      var Rout    = R + pad;
      var L       = Rout - Ri;                     // panel length
      var t       = Math.tan((CONFIG.stepDeg / 2) * Math.PI / 180);
      var H       = 2 * Rout * t;                  // panel height at the outer edge
      var inHalf  = Math.max(6, Ri * t - CONFIG.gap / 2);
      var trackH  = Math.round(1.05 * W);
      var discSize = Math.round(2 * R);

      geo = {
        W: W, Rout: Rout,
        L: Math.round(L), H: Math.round(H),
        inHalf: Math.round(inHalf)
      };

      reel.style.height = trackH + 'px';

      disc.style.left   = Math.round(centerX - R) + 'px';
      disc.style.top    = Math.round(trackH / 2 - R) + 'px';
      disc.style.width  = discSize + 'px';
      disc.style.height = discSize + 'px';

      hub.style.left = Math.round(R) + 'px';
      hub.style.top  = Math.round(R) + 'px';

      var g = CONFIG.gap / 2;
      var clip = 'polygon(0px ' + g + 'px, 0px calc(100% - ' + g + 'px), ' +
                 '100% calc(50% + ' + geo.inHalf + 'px), 100% calc(50% - ' + geo.inHalf + 'px))';

      panels.forEach(function (panel) {
        panel.style.width    = geo.L + 'px';
        panel.style.height   = geo.H + 'px';
        panel.style.clipPath = clip;
        panel.style.webkitClipPath = clip;
        frameImage(panel);
      });
    }

    /* ---- Photo framing: "cover" fit × zoom, panned by x / y (in %) ---------- */
    function frameImage(panel) {
      var img = panel.querySelector('.reel__frame img');
      if (!img || !img.naturalWidth || !geo) return;

      var iw = img.naturalWidth,  ih = img.naturalHeight;
      var fw = geo.L,             fh = geo.H;
      var s  = parseFloat(panel.dataset.scale) || 1;
      var x  = parseFloat(panel.dataset.x) || 0;
      var y  = parseFloat(panel.dataset.y) || 0;

      var base = Math.max(fw / iw, fh / ih);       // cover
      var k    = base * s;

      // keep the pan inside the picture
      var mx = Math.max(0, (iw * k / fw - 1) * 50);
      var my = Math.max(0, (ih * k / fh - 1) * 50);
      x = Math.max(-mx, Math.min(mx, x));
      y = Math.max(-my, Math.min(my, y));

      img.style.width  = (iw * k / fw * 100) + '%';
      img.style.height = (ih * k / fh * 100) + '%';
      img.style.left   = (50 + x) + '%';
      img.style.top    = (50 + y) + '%';
    }

    panels.forEach(function (panel) {
      var img = panel.querySelector('.reel__frame img');
      if (img) img.addEventListener('load', function () { frameImage(panel); });
    });

    /* ---- Draw the current position ----------------------------------------- */
    function render() {
      if (!geo) return;
      var active = mod(pos, n);

      panels.forEach(function (panel, i) {
        // shortest signed offset from the active slide keeps the reel spinning one way
        var offset = mod(i - pos + n / 2, n) - n / 2;
        var abs    = Math.abs(offset);
        var angle  = offset * CONFIG.stepDeg;

        var opacity = abs <= 1.05 ? 1 : Math.max(0.32, 1 - (abs - 1.05) * 0.55);
        var filter  = abs < 0.001
          ? 'grayscale(0) brightness(1)'
          : 'grayscale(1) brightness(' + (0.92 - abs * 0.05).toFixed(2) + ')';

        panel.style.transform =
          'rotate(' + angle.toFixed(2) + 'deg) ' +
          'translate(' + (-Math.round(geo.Rout)) + 'px, ' + (-Math.round(geo.H / 2)) + 'px)';
        panel.style.opacity = opacity.toFixed(2);
        panel.style.zIndex  = Math.round(100 - abs * 10);
        panel.style.filter  = filter;
      });

      dots.forEach(function (dot, i) {
        var on = i === active;
        dot.classList.toggle('is-active', on);
        if (on) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });

      titleEl.textContent = panels[active].dataset.title || '';
      metaEl.textContent  = panels[active].dataset.meta  || '';
    }

    /* ---- Autoplay (pauses while the pointer is over the hero) -------------- */
    var reduceMotion = window.matchMedia &&
                       window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (CONFIG.autoplay && !reduceMotion) {
      setInterval(function () {
        if (!paused) { pos += 1; render(); }
      }, CONFIG.interval);
    }

    hero.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') paused = true; });
    hero.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch') paused = false; });
    hero.addEventListener('focusin',  function () { paused = true; });
    hero.addEventListener('focusout', function () { paused = false; });

    /* ---- Measure once on mount (matches the original design exactly) ------
       The reel's geometry is computed from the column's width a few times
       right after mount (immediately, next frame, and once more after fonts/
       layout settle) and then LEFT ALONE — there is no resize listener.
       This is intentional, not an oversight: it's what makes the reel scale
       smoothly with the whole page under browser zoom (which rescales the
       already-laid-out page uniformly, like a photograph). Re-measuring on
       every size change would fight that rescaling and cancel it out. The
       trade-off, also present in the original, is that the reel does not
       reflow if the browser WINDOW itself is resized after the page has
       loaded (a page refresh picks up the new size). */
    function relayout() {
      if (reel.clientWidth && reel.clientWidth !== lastW) {
        layout();
        render();
      }
    }

    relayout();
    requestAnimationFrame(relayout);
    setTimeout(relayout, 300);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add('is-ready'); });
    });
  })();

  /* =========================================================
     1b. HERO MOBILE SWIPE CAROUSEL
     (only active when .hero__mobile-reel is visible, i.e. ≤ 768px)
  ========================================================= */
  (function () {
    var wrap   = document.getElementById('hero-mobile-reel');
    if (!wrap) return;

    var track  = document.getElementById('hmr-track');
    var dotsW  = document.getElementById('hmr-dots');
    var titleEl = document.getElementById('hmr-title');
    var metaEl  = document.getElementById('hmr-meta');
    if (!track || !dotsW) return;

    var slides = Array.prototype.slice.call(track.querySelectorAll('.hmr__slide'));
    var n = slides.length;
    if (!n) return;

    /* Build dots */
    var dots = slides.map(function (slide, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'hmr__dot' + (i === 0 ? ' is-active' : '');
      b.setAttribute('aria-label', 'Show result ' + (i + 1) + ': ' + slide.dataset.title);
      b.addEventListener('click', function () { scrollTo(i); });
      dotsW.appendChild(b);
      return b;
    });

    function scrollTo(i) {
      var slide = slides[i];
      track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    }

    function activate(i) {
      slides.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
      dots.forEach(function (d, j) { d.classList.toggle('is-active', j === i); });
      if (titleEl) titleEl.textContent = slides[i].dataset.title || '';
      if (metaEl)  metaEl.textContent  = slides[i].dataset.meta  || '';
    }

    /* IntersectionObserver: whichever slide is most visible = active */
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            activate(slides.indexOf(entry.target));
          }
        });
      }, { root: track, threshold: 0.55 });
      slides.forEach(function (s) { obs.observe(s); });
    }

    /* Autoplay — pauses on touch */
    var paused = false;
    var current = 0;

    track.addEventListener('touchstart', function () { paused = true; },  { passive: true });
    track.addEventListener('touchend',   function () {
      setTimeout(function () { paused = false; }, 2000);
    }, { passive: true });

    setInterval(function () {
      if (paused) return;
      /* only run on mobile (carousel visible) */
      if (wrap.offsetParent === null) return;
      current = (current + 1) % n;
      scrollTo(current);
    }, 4200);

    activate(0);
  })();

  /* =========================================================
     2. SMILE GALLERY — filters + comparison sliders + case modal
  ========================================================= */
  var filtersEl = document.getElementById('galleryFilters');
  var galleryGrid = document.getElementById('galleryGrid');
  var caseCards = galleryGrid ? Array.prototype.slice.call(galleryGrid.querySelectorAll('.case-card')) : [];

  // Initialize all comparison sliders (both on cards and in modal)
  function initComparisonSliders() {
    var sliders = document.querySelectorAll('.comparison-slider');

    sliders.forEach(function (slider) {
      if (slider.dataset.sliderReady === 'true') return;
      slider.dataset.sliderReady = 'true';

      var handle = slider.querySelector('.comparison-slider__handle');
      var hint = slider.querySelector('.comparison-slider__hint');
      var isDragging = false;

      function setPosition(clientX) {
        var rect = slider.getBoundingClientRect();
        if (rect.width <= 0) return;
        var x = clientX - rect.left;
        var pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
        slider.style.setProperty('--pos', pct + '%');
        if (handle) {
          handle.setAttribute('aria-valuenow', Math.round(pct));
        }
        if (hint && hint.style.opacity !== '0') {
          hint.style.opacity = '0';
          hint.style.pointerEvents = 'none';
        }
      }

      function onPointerDown(e) {
        e.stopPropagation();
        isDragging = true;
        slider.classList.add('is-dragging');
        if (handle && handle.setPointerCapture) {
          try {
            handle.setPointerCapture(e.pointerId);
          } catch (err) {}
        }
        setPosition(e.clientX);
      }

      function onPointerMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        e.stopPropagation();
        setPosition(e.clientX);
      }

      function onPointerUp(e) {
        if (!isDragging) return;
        e.stopPropagation();
        isDragging = false;
        slider.classList.remove('is-dragging');
        if (handle && handle.releasePointerCapture) {
          try {
            handle.releasePointerCapture(e.pointerId);
          } catch (err) {}
        }
      }

      slider.addEventListener('pointerdown', onPointerDown);
      slider.addEventListener('pointermove', onPointerMove);
      slider.addEventListener('pointerup', onPointerUp);
      slider.addEventListener('pointercancel', onPointerUp);

      slider.addEventListener('click', function (e) {
        e.stopPropagation();
      });

      // Keyboard navigation support
      if (handle) {
        handle.addEventListener('keydown', function (e) {
          var current = parseFloat(getComputedStyle(slider).getPropertyValue('--pos')) || 50;
          var step = 5;
          var next = current;

          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            next = Math.max(0, current - step);
          } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            next = Math.min(100, current + step);
          } else if (e.key === 'Home') {
            next = 0;
          } else if (e.key === 'End') {
            next = 100;
          } else {
            return;
          }

          e.preventDefault();
          e.stopPropagation();
          slider.style.setProperty('--pos', next + '%');
          handle.setAttribute('aria-valuenow', Math.round(next));
          if (hint) {
            hint.style.opacity = '0';
            hint.style.pointerEvents = 'none';
          }
        });
      }
    });
  }

  // Run slider initialization
  initComparisonSliders();

  if (filtersEl && caseCards.length) {
    filtersEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-pill');
      if (!btn) return;

      filtersEl.querySelectorAll('.filter-pill').forEach(function (p) { p.classList.remove('is-active'); });
      btn.classList.add('is-active');

      var filter = btn.getAttribute('data-filter');
      caseCards.forEach(function (card) {
        var show =
          filter === 'All' ||
          card.getAttribute('data-category') === filter ||
          card.getAttribute('data-agegroup') === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  }

  // ---- Case detail modal ----
  var modal = document.getElementById('caseModal');
  var modalClose = document.getElementById('modalClose');
  var modalCondition = document.getElementById('modalCondition');
  var modalTitle = document.getElementById('modalTitle');
  var modalTabs = document.getElementById('modalTabs');
  var modalVideoLabel = document.getElementById('modalVideoLabel');
  var modalInfoTreatment = document.getElementById('modalInfoTreatment');
  var modalInfoDuration = document.getElementById('modalInfoDuration');
  var modalInfoAgeGroup = document.getElementById('modalInfoAgeGroup');
  var modalInfoDescription = document.getElementById('modalInfoDescription');
  var modalPanelPhotos = document.getElementById('modalPanelPhotos');
  var modalPanelVideo = document.getElementById('modalPanelVideo');
  var modalPanelInfo = document.getElementById('modalPanelInfo');

  var currentTabs = [];
  var lastFocusedEl = null;

  function openModal(card) {
    var data = card.dataset;
    var isVideo = data.type === 'video';

    modalCondition.textContent = data.condition;
    modalTitle.textContent = data.title;
    modalInfoTreatment.textContent = data.treatment;
    modalInfoDuration.textContent = data.duration;
    modalInfoAgeGroup.textContent = data.agegroup;
    modalInfoDescription.textContent = data.description;

    var beforeSrc = card.getAttribute('data-before') || '';
    var afterSrc = card.getAttribute('data-after') || '';

    var modalImgBefore = document.getElementById('modalImgBefore');
    var modalImgAfter = document.getElementById('modalImgAfter');
    var modalThumbBefore = document.getElementById('modalThumbBefore');
    var modalThumbAfter = document.getElementById('modalThumbAfter');
    var modalSlider = document.getElementById('modalSlider');

    if (modalImgBefore && beforeSrc) {
      modalImgBefore.src = beforeSrc;
      modalImgBefore.alt = 'Before Treatment — ' + data.title;
    }
    if (modalImgAfter && afterSrc) {
      modalImgAfter.src = afterSrc;
      modalImgAfter.alt = 'After Result — ' + data.title;
    }
    if (modalThumbBefore && beforeSrc) {
      modalThumbBefore.src = beforeSrc;
      modalThumbBefore.alt = 'Before Treatment — ' + data.title;
    }
    if (modalThumbAfter && afterSrc) {
      modalThumbAfter.src = afterSrc;
      modalThumbAfter.alt = 'After Result — ' + data.title;
    }
    if (modalSlider) {
      modalSlider.style.setProperty('--pos', '50%');
      var modalHandle = modalSlider.querySelector('.comparison-slider__handle');
      if (modalHandle) modalHandle.setAttribute('aria-valuenow', '50');
      var modalHint = modalSlider.querySelector('.comparison-slider__hint');
      if (modalHint) {
        modalHint.style.opacity = '';
        modalHint.style.pointerEvents = '';
      }
    }

    modalVideoLabel.textContent = data.videolabel || '';

    currentTabs = isVideo ? ['video', 'photos', 'info'] : ['photos', 'info'];
    buildTabs();
    setActiveTab(isVideo ? 'video' : 'photos');

    lastFocusedEl = document.activeElement;
    modal.hidden = false;
    modalClose.focus();
    document.addEventListener('keydown', onModalKeydown);
  }

  function buildTabs() {
    modalTabs.innerHTML = '';
    currentTabs.forEach(function (tab) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = tab === 'photos' ? 'Photos & Slider' : tab === 'video' ? 'Video Story' : 'Case Info';
      btn.setAttribute('data-tab', tab);
      btn.addEventListener('click', function () { setActiveTab(tab); });
      modalTabs.appendChild(btn);
    });
  }

  function setActiveTab(tab) {
    modalTabs.querySelectorAll('button').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-tab') === tab);
    });
    modalPanelPhotos.hidden = tab !== 'photos';
    modalPanelVideo.hidden = tab !== 'video';
    modalPanelInfo.hidden = tab !== 'info';
  }

  function closeModal() {
    modal.hidden = true;
    document.removeEventListener('keydown', onModalKeydown);
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  function onModalKeydown(e) {
    if (e.key === 'Escape') closeModal();
  }

  caseCards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      // Ignore click if user clicked on or dragged the comparison slider
      if (e.target.closest('.comparison-slider')) {
        return;
      }
      openModal(card);
    });

    card.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('.comparison-slider__handle')) {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
  }
  if (modalClose) modalClose.addEventListener('click', closeModal);


  /* =========================================================
     3. CONTACT FORM (client-side demo)
     Replace the setTimeout below with a real fetch() call to your
     backend / form service (e.g. Formspree, a serverless function,
     or your CRM's lead-capture endpoint).
  ========================================================= */
  var contactForm = document.getElementById('contactForm');
  var contactSuccess = document.getElementById('contactSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // TODO: send form data to your backend, e.g.:
      // fetch('/api/callback-request', { method: 'POST', body: new FormData(contactForm) });

      contactForm.hidden = true;
      contactSuccess.hidden = false;
    });
  }

  /* =========================================================
     4. MOBILE / TABLET NAVIGATION DRAWER
  ========================================================= */
  var navToggle = document.getElementById('nav-toggle');
  var mobileDrawer = document.getElementById('mobile-drawer');
  var mobileOverlay = document.getElementById('mobile-drawer-overlay');
  var mobileCloseBtn = document.getElementById('mobile-drawer-close');
  var mobileLinks = document.querySelectorAll('.mobile-drawer__link, .mobile-drawer__body a');

  function openMobileNav() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('is-open');
    if (mobileOverlay) mobileOverlay.classList.add('is-open');
    if (navToggle) {
      navToggle.classList.add('is-active');
      navToggle.setAttribute('aria-expanded', 'true');
    }
    mobileDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('is-open');
    if (mobileOverlay) mobileOverlay.classList.remove('is-open');
    if (navToggle) {
      navToggle.classList.remove('is-active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
    mobileDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      if (mobileDrawer && mobileDrawer.classList.contains('is-open')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener('click', closeMobileNav);
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileNav);
  }

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMobileNav();
    });
  });

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('is-open')) {
      closeMobileNav();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 968 && mobileDrawer && mobileDrawer.classList.contains('is-open')) {
      closeMobileNav();
    }
  });
})();
