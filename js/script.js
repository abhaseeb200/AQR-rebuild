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
     1. HERO VERTICAL SLIDER (Wireframe 3 Image Rows + Caption Box)
  ========================================================= */
  (function () {
    var vslider = document.getElementById('hero-vslider');
    if (!vslider) return;

    var viewport = document.getElementById('vslider-viewport');
    var track = document.getElementById('vslider-track');
    var rows = Array.prototype.slice.call(track.querySelectorAll('.vslider__row'));
    var prevBtn = document.getElementById('vslider-prev');
    var nextBtn = document.getElementById('vslider-next');
    var counterEl = document.getElementById('vslider-counter');
    var dotsContainer = document.getElementById('vslider-dots');
    var dots = dotsContainer ? Array.prototype.slice.call(dotsContainer.querySelectorAll('.vslider__dot')) : [];

    var captionContent = document.getElementById('vslider-caption-content');
    var captionBadge = document.getElementById('vslider-caption-badge');
    var captionTitle = document.getElementById('vslider-caption-title');
    var captionMetaText = document.getElementById('vslider-caption-meta-text');
    var captionLink = document.getElementById('vslider-caption-link');

    var n = rows.length;
    if (!n) return;

    // Clinical Case Data (matches user wireframe text & clinic specialities)
    var casesData = [
      {
        badge: 'Damon Braces',
        title: 'Severe Crowding, Corrected',
        meta: '14-month treatment · Teen patient',
        link: '#gallery'
      },
      {
        badge: 'Spark Aligners',
        title: 'Spacing Closed Without Extraction',
        meta: '9-month treatment · Adult patient',
        link: '#gallery'
      },
      {
        badge: 'Palatal Expander',
        title: 'Early Crossbite & Narrow Arch Expanded',
        meta: '8-month treatment · Age 8',
        link: '#gallery'
      },
      {
        badge: 'Airway Orthodontics',
        title: 'From Mouth-Breather to Nasal Breather',
        meta: '12-month treatment · Age 10',
        link: '#gallery'
      },
      {
        badge: 'Splint Therapy',
        title: 'TMJ Pain Resolved with Splint Therapy',
        meta: '10-month treatment · Adult patient',
        link: '#gallery'
      },
      {
        badge: 'Clear Aligners',
        title: 'Deep Overbite Corrected',
        meta: '16-month treatment · Adult patient',
        link: '#gallery'
      }
    ];

    var currentIndex = 0;
    var autoplayDuration = 4500;
    var autoplayTimer = null;
    var isPaused = false;
    var reduceMotion = window.matchMedia &&
                       window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function calculateOffset(index) {
      if (!rows[0]) return 0;
      var perView = 2;
      var rowHeight = rows[0].offsetHeight;
      var style = window.getComputedStyle(track);
      var gap = parseFloat(style.rowGap || style.gap) || 10;
      var step = rowHeight + gap;

      // With 2 cards visible per view, scroll smoothly to show current card:
      var maxScrollIndex = Math.max(0, n - perView);
      var targetScroll = Math.max(0, Math.min(index, maxScrollIndex));
      return targetScroll * step;
    }

    function updateUI(instant) {
      // 1. Vertical translation of the 3 visible image rows
      var offset = calculateOffset(currentIndex);
      if (instant) {
        track.style.transition = 'none';
        track.style.transform = 'translateY(-' + offset + 'px)';
        track.offsetHeight; // force reflow
        track.style.transition = '';
      } else {
        track.style.transform = 'translateY(-' + offset + 'px)';
      }

      // 2. Highlight active row
      rows.forEach(function (row, i) {
        var isActive = (i === currentIndex);
        row.classList.toggle('is-active', isActive);
        row.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      // 3. Update bottom caption box with subtle fade transition
      var currentCase = casesData[currentIndex] || casesData[0];
      if (captionContent) {
        captionContent.style.opacity = '0';
        captionContent.style.transform = 'translateY(4px)';
        setTimeout(function () {
          if (captionBadge) captionBadge.textContent = currentCase.badge;
          if (captionTitle) captionTitle.textContent = currentCase.title;
          if (captionMetaText) captionMetaText.textContent = currentCase.meta;
          if (captionLink) captionLink.setAttribute('href', currentCase.link);
          captionContent.style.opacity = '1';
          captionContent.style.transform = 'translateY(0)';
        }, 120);
      }

      // 4. Update dots pagination
      dots.forEach(function (dot, i) {
        var isActive = (i === currentIndex);
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      // 5. Update header counter
      if (counterEl) {
        var curStr = (currentIndex + 1 < 10 ? '0' : '') + (currentIndex + 1);
        var totStr = (n < 10 ? '0' : '') + n;
        counterEl.textContent = curStr + ' / ' + totStr;
      }
    }

    function goTo(index) {
      currentIndex = ((index % n) + n) % n;
      updateUI(false);
    }

    function next() {
      goTo(currentIndex + 1);
    }

    function prev() {
      goTo(currentIndex - 1);
    }

    // Prev / Next button listeners
    if (prevBtn) {
      prevBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        prev();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        next();
      });
    }

    // Clicking ANY of the image rows directly selects that case!
    rows.forEach(function (row, i) {
      row.addEventListener('click', function (e) {
        e.preventDefault();
        goTo(i);
      });
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goTo(i);
        }
      });
    });

    // Clicking pagination dots (wireframe dots)
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        goTo(i);
      });
    });

    // Keyboard navigation
    if (viewport) {
      viewport.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          prev();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          next();
        } else if (e.key === 'Home') {
          e.preventDefault();
          goTo(0);
        } else if (e.key === 'End') {
          e.preventDefault();
          goTo(n - 1);
        }
      });
    }

    // Touch swipe gestures
    var touchStartY = 0;
    var touchStartX = 0;
    var touchStartTime = 0;

    if (viewport) {
      viewport.addEventListener('touchstart', function (e) {
        if (e.touches.length !== 1) return;
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        touchStartTime = Date.now();
        pauseAutoplay();
      }, { passive: true });

      viewport.addEventListener('touchend', function (e) {
        if (!e.changedTouches || e.changedTouches.length !== 1) return;
        var deltaY = e.changedTouches[0].clientY - touchStartY;
        var deltaX = e.changedTouches[0].clientX - touchStartX;
        var deltaTime = Date.now() - touchStartTime;

        if (Math.abs(deltaY) > 30 && Math.abs(deltaY) > Math.abs(deltaX) && deltaTime < 550) {
          if (deltaY < 0) {
            next();
          } else {
            prev();
          }
        }
        setTimeout(resumeAutoplay, 2500);
      }, { passive: true });
    }

    // Autoplay controller
    function startAutoplay() {
      if (reduceMotion) return;
      clearInterval(autoplayTimer);
      autoplayTimer = setInterval(function () {
        if (!isPaused) {
          next();
        }
      }, autoplayDuration);
    }

    function pauseAutoplay() {
      isPaused = true;
    }

    function resumeAutoplay() {
      isPaused = false;
    }

    // Pause on hover or focus
    vslider.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'touch') pauseAutoplay();
    });
    vslider.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'touch') resumeAutoplay();
    });
    vslider.addEventListener('focusin', pauseAutoplay);
    vslider.addEventListener('focusout', resumeAutoplay);

    // Window resize handler to maintain vertical alignment
    var resizeDebounce = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(function () {
        updateUI(true);
      }, 100);
    });

    // Initial setup
    updateUI(true);
    startAutoplay();
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
