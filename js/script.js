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
     1. HERO WHEEL CAROUSEL
  /* =========================================================
     1. HERO WHEEL & SHOWCASE CAROUSEL
  ========================================================= */
  var heroCases = [
    {
      id: 0,
      eyebrow: 'Braces',
      treatment: 'Damon Ultima Braces',
      title: 'Severe Crowding, Corrected',
      meta: '14-month treatment · Teen patient',
      badge: 'Verified Result',
      afterLabel: 'AFTER — Damon braces result',
      image: 'https://aqrorthodontics.com/wp-content/uploads/2025/01/3B.webp',
      galleryId: 'c1'
    },
    {
      id: 1,
      eyebrow: 'Clear Aligner',
      treatment: 'Spark Clear Aligners',
      title: 'Spacing Closed with Spark Aligners',
      meta: '9-month treatment · Adult patient',
      badge: 'Verified Result',
      afterLabel: 'AFTER — Spark aligners result',
      image: 'https://aqrorthodontics.com/wp-content/uploads/2025/04/7B-ALIGNERS.webp',
      galleryId: 'c2'
    },
    {
      id: 2,
      eyebrow: 'Functional',
      treatment: 'Twin Block Appliance',
      title: 'Early Crossbite Correction',
      meta: '8-month treatment · Age 8',
      badge: 'Pediatric Care',
      afterLabel: 'AFTER — palatal expander result',
      image: 'https://aqrorthodontics.com/wp-content/uploads/2025/04/Twinblock-treatment-2.jpg.webp',
      galleryId: 'c3'
    },
    {
      id: 3,
      eyebrow: 'Airway',
      treatment: 'Myofunctional Therapy',
      title: 'Nasal Breathing Restored',
      meta: '12-month treatment · Age 10',
      badge: 'Holistic Airway',
      afterLabel: 'AFTER — myofunctional therapy result',
      image: 'https://aqrorthodontics.com/wp-content/uploads/2024/12/Airway-5.jpeg',
      galleryId: 'c7'
    }
  ];

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function HeroWheel(options) {
    this.track = options.track;
    this.categoriesEl = options.categoriesEl;
    this.dotsEl = options.dotsEl;
    this.counterEl = options.counterEl;
    this.prevBtn = options.prevBtn;
    this.nextBtn = options.nextBtn;
    this.hoverBoundary = options.hoverBoundary;

    this.wheelPos = 0;
    this.wheelW = 460;
    this.wheelH = 480;
    this.paused = false;
    this.timer = null;

    this.cardEls = [];
    this.badgeEls = [];
    this.categoryBtns = [];
    this.dotEls = [];

    this._buildDom();
    this._bindEvents();
    this._measure();
    this.render();

    var self = this;
    requestAnimationFrame(function () { self._measure(); self.render(); });
    setTimeout(function () { self._measure(); self.render(); }, 300);

    // Autoscroll timer (3.8s per case)
    this.timer = setInterval(function () {
      if (!self.paused) {
        self.wheelPos += 1;
        self.render();
      }
    }, 3800);
  }

  HeroWheel.prototype._buildDom = function () {
    var self = this;

    // Build category tabs
    if (this.categoriesEl) {
      heroCases.forEach(function (h, i) {
        var catBtn = document.createElement('button');
        catBtn.type = 'button';
        catBtn.className = 'hero__category-btn' + (i === 0 ? ' is-active' : '');
        catBtn.setAttribute('role', 'tab');
        catBtn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        catBtn.setAttribute('aria-label', 'View ' + h.eyebrow + ' cases');
        catBtn.textContent = h.eyebrow;

        catBtn.addEventListener('click', function () {
          self.goToIndex(i);
        });

        self.categoriesEl.appendChild(catBtn);
        self.categoryBtns.push(catBtn);
      });
    }

    // Build showcase cards and satellite badges
    heroCases.forEach(function (h, i) {
      var card = document.createElement('div');
      card.className = 'wheel-card';
      card.setAttribute('role', 'group');
      card.setAttribute('aria-roledescription', 'slide');
      card.setAttribute('aria-label', h.title + ' — ' + h.treatment);
      card.tabIndex = 0;

      var inner = document.createElement('div');
      inner.className = 'wheel-card__inner';

      var media = document.createElement('div');
      media.className = 'wheel-card__media';

      if (h.image) {
        var img = document.createElement('img');
        img.className = 'wheel-card__img';
        img.src = h.image;
        img.alt = h.title;
        img.loading = 'eager';
        img.decoding = 'async';
        media.appendChild(img);
      } else {
        var imgSlot = document.createElement('div');
        imgSlot.className = 'img-slot';
        imgSlot.setAttribute('data-label', h.afterLabel);
        media.appendChild(imgSlot);
      }

      var badges = document.createElement('div');
      badges.className = 'wheel-card__badges';
      badges.innerHTML =
        '<span class="wheel-card__pill"><span class="wheel-card__pill-dot"></span>' + h.treatment + '</span>' +
        '<span class="wheel-card__verified"><svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg>' + h.badge + '</span>';
      media.appendChild(badges);
      inner.appendChild(media);

      var overlay = document.createElement('div');
      overlay.className = 'wheel-card__overlay';
      overlay.innerHTML =
        '<span class="wheel-card__eyebrow">' + h.eyebrow + '</span>' +
        '<h3 class="wheel-card__title">' + h.title + '</h3>' +
        '<div class="wheel-card__meta">' +
        '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>' +
        '<span>' + h.meta + '</span>' +
        '</div>';
      inner.appendChild(overlay);

      var actionHint = document.createElement('button');
      actionHint.type = 'button';
      actionHint.className = 'wheel-card__action-hint';
      actionHint.setAttribute('aria-label', 'View detailed patient case story for ' + h.title);
      actionHint.innerHTML = '<span>View Story</span><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
      actionHint.addEventListener('click', function (e) {
        e.stopPropagation();
        var galleryBtn = document.querySelector('.case-card[data-id="' + h.galleryId + '"]');
        if (galleryBtn) {
          galleryBtn.click();
        } else {
          var gallerySec = document.getElementById('gallery');
          if (gallerySec) gallerySec.scrollIntoView({ behavior: 'smooth' });
        }
      });
      inner.appendChild(actionHint);

      card.appendChild(inner);

      card.addEventListener('click', function () {
        var current = mod(Math.round(self.wheelPos), heroCases.length);
        if (current === i) {
          var galleryBtn = document.querySelector('.case-card[data-id="' + h.galleryId + '"]');
          if (galleryBtn) galleryBtn.click();
        } else {
          self.goToIndex(i);
        }
      });

      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          self.goToIndex(i);
        }
      });

      self.track.appendChild(card);
      self.cardEls.push(card);

      // Desktop orbital satellite badge
      var badge = document.createElement('button');
      badge.type = 'button';
      badge.className = 'wheel-badge';
      badge.setAttribute('aria-label', 'Select ' + h.eyebrow + ' treatment case');
      var badgeLabel = document.createElement('span');
      badgeLabel.className = 'wheel-badge__eyebrow';
      badgeLabel.textContent = h.eyebrow;
      badge.appendChild(badgeLabel);
      badge.addEventListener('click', function () { self.goToIndex(i); });
      self.track.appendChild(badge);
      self.badgeEls.push(badge);

      // Dots
      if (self.dotsEl) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'hero__dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Show case ' + (i + 1));
        dot.addEventListener('click', function () { self.goToIndex(i); });
        self.dotsEl.appendChild(dot);
        self.dotEls.push(dot);
      }
    });
  };

  HeroWheel.prototype._bindEvents = function () {
    var self = this;
    this._measureHandler = function () {
      self._measure();
      self.render();
    };
    window.addEventListener('resize', this._measureHandler);
    window.addEventListener('orientationchange', function () {
      setTimeout(function () { self._measure(); self.render(); }, 150);
    });

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', function () {
        self.wheelPos -= 1;
        self.render();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', function () {
        self.wheelPos += 1;
        self.render();
      });
    }

    if (this.hoverBoundary) {
      this.hoverBoundary.addEventListener('mouseenter', function () { self.paused = true; });
      this.hoverBoundary.addEventListener('mouseleave', function () { self.paused = false; });
      this.hoverBoundary.addEventListener('focusin', function () { self.paused = true; });
      this.hoverBoundary.addEventListener('focusout', function () { self.paused = false; });
    }

    // Touch / swipe gestures for mobile & tablets
    var touchStartX = 0;
    var touchStartY = 0;
    var touchStartTime = 0;

    this.track.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        self.paused = true;
      }
    }, { passive: true });

    this.track.addEventListener('touchend', function (e) {
      self.paused = false;
      if (e.changedTouches.length === 1) {
        var deltaX = e.changedTouches[0].clientX - touchStartX;
        var deltaY = e.changedTouches[0].clientY - touchStartY;
        var duration = Date.now() - touchStartTime;

        if (duration < 650) {
          if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < 0) {
              self.wheelPos += 1;
            } else {
              self.wheelPos -= 1;
            }
            self.render();
          } else if (Math.abs(deltaY) > 40 && Math.abs(deltaY) > Math.abs(deltaX)) {
            if (deltaY < 0) {
              self.wheelPos += 1;
            } else {
              self.wheelPos -= 1;
            }
            self.render();
          }
        }
      }
    }, { passive: true });
  };

  HeroWheel.prototype._measure = function () {
    var w = this.track.clientWidth || this.track.offsetWidth;
    var h = this.track.clientHeight || this.track.offsetHeight;
    if (w > 0) this.wheelW = w;
    if (h > 0) this.wheelH = h;
  };

  HeroWheel.prototype.goToIndex = function (i) {
    var n = heroCases.length;
    var current = mod(this.wheelPos, n);
    var delta = i - current;
    if (delta > n / 2) delta -= n;
    if (delta < -n / 2) delta += n;
    this.wheelPos += delta;
    this.render();
  };

  HeroWheel.prototype.render = function () {
    var n = heroCases.length;
    var activeIndex = mod(Math.round(this.wheelPos), n);

    // Update Counter
    if (this.counterEl) {
      var curStr = (activeIndex + 1) < 10 ? '0' + (activeIndex + 1) : '' + (activeIndex + 1);
      var totStr = n < 10 ? '0' + n : '' + n;
      this.counterEl.textContent = curStr + ' / ' + totStr;
    }

    // Update Category Switcher buttons
    this.categoryBtns.forEach(function (btn, i) {
      var isAct = (i === activeIndex);
      btn.classList.toggle('is-active', isAct);
      btn.setAttribute('aria-selected', isAct ? 'true' : 'false');
    });

    // Update Dots
    this.dotEls.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === activeIndex);
    });

    var wheelW = this.wheelW || 460;
    var trackH = this.wheelH || 480;
    var isDesktop = wheelW >= 968 || window.innerWidth >= 968;

    if (!isDesktop) {
      // =========================================================
      // MOBILE & TABLET RESPONSIVE SHOWCASE ENGINE
      // =========================================================
      var cardW = Math.min(wheelW - 24, 420);
      if (wheelW < 400) cardW = wheelW - 16;
      var cardH = Math.min(trackH - 12, Math.round(cardW * 0.68));
      var centerX = Math.round((wheelW - cardW) / 2);
      var centerY = Math.round((trackH - cardH) / 2);

      for (var i = 0; i < n; i++) {
        var offset = i - this.wheelPos;
        offset = mod(offset + n / 2, n) - n / 2;
        var abs = Math.abs(offset);

        var card = this.cardEls[i];
        var badge = this.badgeEls[i];

        // Hide satellite badges completely on mobile/tablet
        if (badge) {
          badge.style.display = 'none';
        }

        if (abs > 1.25) {
          card.style.opacity = '0';
          card.style.visibility = 'hidden';
          card.style.pointerEvents = 'none';
          card.style.zIndex = '0';
          continue;
        }

        var scale = Math.max(0.85, 1 - abs * 0.15);
        var opacity = Math.max(0, 1 - abs * 0.65);
        var zIndex = Math.round(100 - abs * 25);
        var xShift = offset * (cardW * 0.94);
        var leftPx = Math.round(centerX + xShift);
        var topPx = centerY;

        card.style.display = 'block';
        card.style.visibility = 'visible';
        card.style.pointerEvents = abs < 0.5 ? 'auto' : 'pointer';
        card.style.left = leftPx + 'px';
        card.style.top = topPx + 'px';
        card.style.width = cardW + 'px';
        card.style.height = cardH + 'px';
        card.style.transform = 'scale(' + scale + ')';
        card.style.opacity = opacity;
        card.style.zIndex = zIndex;
        card.classList.toggle('is-active', abs < 0.5);
      }
    } else {
      // =========================================================
      // PREVIOUS DESKTOP CIRCULAR ARC WHEEL ENGINE (RESTORED)
      // =========================================================
      var activeBadgeD = 160;
      var inactiveBadgeD = 88;
      var badgeCenterX = Math.round(wheelW - activeBadgeD / 2 - 54);
      var dCardW = Math.max(220, Math.min(310, (badgeCenterX - 20) * 0.72));
      var dCardH = Math.max(160, Math.min(205, trackH * 0.32));
      var spacingY = Math.round(dCardH * 0.88 + 48);
      var R = Math.max(60, Math.min(220, badgeCenterX - dCardW - 30));

      for (var j = 0; j < n; j++) {
        var dOffset = j - this.wheelPos;
        dOffset = mod(dOffset + n / 2, n) - n / 2;
        var dAbs = Math.abs(dOffset);

        var dCard = this.cardEls[j];
        var dBadge = this.badgeEls[j];

        var y = dOffset * spacingY;
        var arcRatio = Math.min(1, Math.abs(y) / (R * 1.25 || 1));
        var x = -Math.round(R * Math.sqrt(Math.max(0, 1 - arcRatio * arcRatio * 0.65)));

        var scale = Math.max(0.74, 1 - dAbs * 0.22);
        var opacity = Math.max(0, 1 - dAbs * 0.36);
        var zIndex = Math.round(100 - dAbs * 15);

        var finalW = Math.round(dCardW * scale);
        var finalH = Math.round(dCardH * scale);
        var leftPx = Math.round(badgeCenterX + x - finalW - 60);
        var topPx = Math.round(trackH / 2 + y - finalH / 2);

        var badgeD = Math.round(inactiveBadgeD + Math.max(0, 1 - dAbs) * (activeBadgeD - inactiveBadgeD));
        var badgeLeft = Math.round(badgeCenterX - badgeD / 2);
        var badgeTopOffset = 5;
        var badgeTop = Math.round(trackH / 2 + y - badgeD / 2 + badgeTopOffset);

        dCard.style.display = 'block';
        dCard.style.left = leftPx + 'px';
        dCard.style.top = topPx + 'px';
        dCard.style.width = finalW + 'px';
        dCard.style.height = finalH + 'px';
        dCard.style.transform = 'none';

        if (dBadge) {
          dBadge.style.display = 'flex';
          dBadge.style.left = badgeLeft + 'px';
          dBadge.style.top = badgeTop + 'px';
          dBadge.style.width = badgeD + 'px';
          dBadge.style.height = badgeD + 'px';
        }

        if (dAbs > 1.15) {
          dCard.style.opacity = '0';
          dCard.style.pointerEvents = 'none';
          dCard.style.visibility = 'hidden';
          dCard.style.zIndex = '0';

          if (dBadge) {
            dBadge.style.opacity = '0';
            dBadge.style.pointerEvents = 'none';
            dBadge.style.visibility = 'hidden';
            dBadge.style.zIndex = '0';
          }
          continue;
        }

        dCard.style.opacity = opacity;
        dCard.style.zIndex = zIndex;
        dCard.style.visibility = 'visible';
        dCard.style.pointerEvents = 'auto';

        if (dBadge) {
          dBadge.style.opacity = opacity;
          dBadge.style.zIndex = zIndex + 5;
          dBadge.style.visibility = 'visible';
          dBadge.style.pointerEvents = 'auto';
          dBadge.classList.toggle('is-active', dAbs < 0.5);
        }
      }
    }
  };

  HeroWheel.prototype.destroy = function () {
    clearInterval(this.timer);
    window.removeEventListener('resize', this._measureHandler);
  };

  var wheelTrack = document.getElementById('hero-wheel-track');
  if (wheelTrack) {
    new HeroWheel({
      track: wheelTrack,
      categoriesEl: document.getElementById('heroCategories'),
      dotsEl: document.getElementById('heroDots'),
      counterEl: document.getElementById('heroCounter'),
      prevBtn: document.getElementById('heroPrevBtn'),
      nextBtn: document.getElementById('heroNextBtn'),
      hoverBoundary: document.getElementById('heroWheelSection') || wheelTrack
    });
  }

  /* =========================================================
     2. SMILE GALLERY — filters + case modal
  ========================================================= */
  var filtersEl = document.getElementById('galleryFilters');
  var galleryGrid = document.getElementById('galleryGrid');
  var caseCards = galleryGrid ? Array.prototype.slice.call(galleryGrid.querySelectorAll('.case-card')) : [];

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
          (filter === 'Videos' && card.getAttribute('data-type') === 'video') ||
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
  var modalBeforeSlot = document.getElementById('modalBeforeSlot');
  var modalAfterSlot = document.getElementById('modalAfterSlot');
  var modalVideoLabel = document.getElementById('modalVideoLabel');
  var modalInfoTreatment = document.getElementById('modalInfoTreatment');
  var modalInfoDuration = document.getElementById('modalInfoDuration');
  var modalInfoAgeGroup = document.getElementById('modalInfoAgeGroup');
  var modalInfoDescription = document.getElementById('modalInfoDescription');
  var modalPanelPhotos = document.getElementById('modalPanelPhotos');
  var modalPanelVideo = document.getElementById('modalPanelVideo');
  var modalPanelInfo = document.getElementById('modalPanelInfo');

  var currentTabs = [];
  var currentTabIndex = 0;
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

    modalBeforeSlot.setAttribute('data-label', 'BEFORE — ' + data.condition.toLowerCase());
    modalAfterSlot.setAttribute('data-label', 'AFTER — ' + data.treatment.toLowerCase());
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
      btn.textContent = tab === 'photos' ? 'Photos' : tab === 'video' ? 'Video' : 'Info';
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
    card.addEventListener('click', function () { openModal(card); });
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
