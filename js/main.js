/**
 * LOTUS BOTANICAL ROMANCE - Main Application Controller
 * Handles Countdown Timer, RSVP Form & Interactive Stepper, Guestbook Wishes & Likes,
 * Gallery Lightbox with Mobile Touch Swipe, Calendar Integration (.ics + Google Calendar),
 * Copy to Clipboard, Floating Navigation, Digital Guest Pass & QR, Interactive Map Modal,
 * Wedding Gift Tabs, Dress Code Tooltips, and Scroll Animations.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initRSVP();
  initGuestbook();
  initGallery();
  initCalendar();
  initCopyActions();
  initNavigation();
  initScrollAnimations();
  initDigitalPass();
  initMapModal();
  initGiftTabs();
  initDressCodeTooltips();
});

/* ==========================================================================
   1. COUNTDOWN TIMER
   ========================================================================== */
function initCountdown() {
  const targetDate = new Date('2026-10-24T09:00:00').getTime();

  const daysEl = document.getElementById('cdDays');
  const hoursEl = document.getElementById('cdHours');
  const minutesEl = document.getElementById('cdMinutes');
  const secondsEl = document.getElementById('cdSeconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function update() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. RSVP FORM, STORAGE & INTERACTIVE STEPPER
   ========================================================================== */
function initRSVP() {
  const form = document.getElementById('rsvpForm');
  const feedback = document.getElementById('rsvpFeedback');
  const radioCards = document.querySelectorAll('.radio-label-card');
  const guestsSelect = document.getElementById('rsvpGuests');
  const btnMinus = document.getElementById('btnGuestsMinus');
  const btnPlus = document.getElementById('btnGuestsPlus');
  const guestDisplay = document.getElementById('guestsDisplayVal');

  // Interactive radio card selection styling
  radioCards.forEach(card => {
    card.addEventListener('click', () => {
      radioCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  // Guest Stepper (+ / -)
  if (btnMinus && btnPlus && guestsSelect && guestDisplay) {
    btnMinus.addEventListener('click', () => {
      let val = parseInt(guestsSelect.value) || 1;
      if (val > 1) {
        val--;
        guestsSelect.value = val;
        guestDisplay.textContent = `${val} Orang`;
      }
    });

    btnPlus.addEventListener('click', () => {
      let val = parseInt(guestsSelect.value) || 1;
      if (val < 5) {
        val++;
        guestsSelect.value = val;
        guestDisplay.textContent = `${val} Orang`;
      }
    });

    guestsSelect.addEventListener('change', () => {
      guestDisplay.textContent = `${guestsSelect.value} Orang`;
    });
  }

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('rsvpName').value.trim();
    const attendance = document.querySelector('input[name="attendance"]:checked')?.value || 'Hadir';
    const guests = guestsSelect ? guestsSelect.value : '2';
    const notes = document.getElementById('rsvpNotes').value.trim();

    if (!name) {
      showToast('Mohon masukkan nama Anda.', 'error');
      return;
    }

    const rsvpData = {
      name,
      attendance,
      guests,
      notes,
      timestamp: new Date().toISOString()
    };

    const stored = JSON.parse(localStorage.getItem('lotus_rsvp_list') || '[]');
    stored.push(rsvpData);
    localStorage.setItem('lotus_rsvp_list', JSON.stringify(stored));

    if (feedback) {
      feedback.classList.remove('hidden');
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    form.reset();
    showToast('Terima kasih! Konfirmasi kehadiran Anda telah tersimpan.', 'success');
  });
}

/* ==========================================================================
   3. GUESTBOOK / WISHES SYSTEM WITH INTERACTIVE LIKES
   ========================================================================== */
function initGuestbook() {
  const form = document.getElementById('guestbookForm');
  const listEl = document.getElementById('wishesList');
  if (!listEl) return;

  const defaultWishes = [
    {
      name: 'Aditya & Melati',
      status: 'Hadir',
      message: 'Selamat untuk Clara & Brandon! Semoga cinta kalian selalu mekar indah seperti bunga teratai di setiap musim kehidupan. Bahagia selalu selamanya!',
      date: '2 jam yang lalu',
      likes: 12
    },
    {
      name: 'Sarah Stephanie',
      status: 'Hadir',
      message: 'So breathtakingly beautiful! Happy wedding Brandon & Clara, wishing you a lifetime of joy, deep companionship, and endless blessings.',
      date: '5 jam yang lalu',
      likes: 8
    },
    {
      name: 'Keluarga Dimas Prasetya',
      status: 'Hadir (2 Orang)',
      message: 'Baarakallahu laka wa baaraka \'alaika wa jama\'a bainakuma fii khoir. Selamat menempuh hidup baru yang penuh berkah dan cinta sakinah.',
      date: '1 hari yang lalu',
      likes: 15
    },
    {
      name: 'Dr. Raymond Tan',
      status: 'Hadir',
      message: 'Warmest congratulations to the lovely couple. May your marriage be filled with unforgettable laughter, mutual growth, and profound peace.',
      date: '2 hari yang lalu',
      likes: 6
    }
  ];

  function getWishes() {
    const saved = localStorage.getItem('lotus_wishes_list');
    return saved ? JSON.parse(saved) : defaultWishes;
  }

  function renderWishes() {
    const wishes = getWishes();
    listEl.innerHTML = '';

    wishes.forEach((w, idx) => {
      const card = document.createElement('div');
      card.className = 'wish-card';
      card.innerHTML = `
        <div class="wish-header">
          <div class="wish-author-info">
            <span class="wish-avatar-initial">${w.name.charAt(0).toUpperCase()}</span>
            <div>
              <h4 class="wish-name">${escapeHTML(w.name)}</h4>
              <span class="wish-badge"><i class="badge-dot"></i>${escapeHTML(w.status || 'Hadir')}</span>
            </div>
          </div>
          <span class="wish-time">${escapeHTML(w.date || 'Baru saja')}</span>
        </div>
        <p class="wish-body">${escapeHTML(w.message)}</p>
        <div class="wish-footer">
          <button type="button" class="wish-like-btn" data-wish-idx="${idx}" aria-label="Sukai doa ini">
            <svg class="heart-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span class="like-counter">${w.likes || 0}</span>
          </button>
        </div>
      `;
      listEl.appendChild(card);
    });

    // Bind like buttons
    listEl.querySelectorAll('.wish-like-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = btn.dataset.wishIdx;
        const currentWishes = getWishes();
        if (currentWishes[idx]) {
          currentWishes[idx].likes = (currentWishes[idx].likes || 0) + 1;
          localStorage.setItem('lotus_wishes_list', JSON.stringify(currentWishes));
          btn.classList.add('liked');
          const counter = btn.querySelector('.like-counter');
          if (counter) counter.textContent = currentWishes[idx].likes;
          showToast('Doa restu telah disukai ❤️', 'info');
        }
      });
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('wishName').value.trim();
      const status = document.getElementById('wishStatus').value;
      const message = document.getElementById('wishMessage').value.trim();

      if (!name || !message) {
        showToast('Mohon lengkapi nama dan ucapan Anda.', 'error');
        return;
      }

      const newWish = {
        name,
        status,
        message,
        date: 'Baru saja',
        likes: 1
      };

      const current = getWishes();
      current.unshift(newWish);
      localStorage.setItem('lotus_wishes_list', JSON.stringify(current));

      renderWishes();
      form.reset();
      showToast('Pesan dan doa Anda berhasil dikirimkan!', 'success');
    });
  }

  renderWishes();
}

function escapeHTML(str) {
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
}

/* ==========================================================================
   4. GALLERY FILTERING & LIGHTBOX WITH MOBILE TOUCH SWIPE
   ========================================================================== */
function initGallery() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  let currentIndex = 0;
  let activeItems = Array.from(items);

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      items.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = 'block';
          item.classList.add('fade-in-up');
        } else {
          item.style.display = 'none';
        }
      });

      activeItems = Array.from(items).filter(item => item.style.display !== 'none');
    });
  });

  // Open Lightbox
  items.forEach((item) => {
    item.addEventListener('click', () => {
      currentIndex = activeItems.indexOf(item);
      openLightbox();
    });
  });

  function openLightbox() {
    if (!lightbox || currentIndex < 0 || currentIndex >= activeItems.length) return;
    const currentItem = activeItems[currentIndex];
    const img = currentItem.querySelector('img');
    const caption = currentItem.querySelector('.gallery-overlay-title')?.textContent || '';

    lightboxImg.src = img.src;
    lightboxCaption.textContent = caption;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + activeItems.length) % activeItems.length;
    openLightbox();
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % activeItems.length;
    openLightbox();
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showPrev();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showNext();
    });
  }

  // Mobile Touch Swipe Gesture Support
  let touchStartX = 0;
  let touchEndX = 0;

  if (lightbox) {
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        showPrev(); // Swipe Right -> Prev
      } else {
        showNext(); // Swipe Left -> Next
      }
    }
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });
}

/* ==========================================================================
   5. CALENDAR INTEGRATION (Google Calendar & .ICS File)
   ========================================================================== */
function initCalendar() {
  const gcalBtn = document.getElementById('addToGCalBtn');
  const icsBtn = document.getElementById('downloadIcsBtn');

  const eventDetails = {
    title: 'The Wedding of Clara & Brandon — Lotus Botanical Romance',
    description: 'We joyfully invite you to celebrate our holy matrimony and wedding reception.',
    location: 'The Glasshouse Botanical Pavilion, Jl. Lotus Grand Boulevard No. 8, Jakarta',
    startDate: '20261024T090000',
    endDate: '20261024T170000'
  };

  if (gcalBtn) {
    gcalBtn.addEventListener('click', () => {
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.title)}&dates=${eventDetails.startDate}/${eventDetails.endDate}&details=${encodeURIComponent(eventDetails.description)}&location=${encodeURIComponent(eventDetails.location)}`;
      window.open(gcalUrl, '_blank');
    });
  }

  if (icsBtn) {
    icsBtn.addEventListener('click', () => {
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Everafter//Lotus Botanical Romance//ID',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `SUMMARY:${eventDetails.title}`,
        `DESCRIPTION:${eventDetails.description}`,
        `LOCATION:${eventDetails.location}`,
        `DTSTART:${eventDetails.startDate}`,
        `DTEND:${eventDetails.endDate}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'Wedding_Clara_and_Brandon.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('File kalender (.ics) berhasil diunduh!', 'success');
    });
  }
}

/* ==========================================================================
   6. COPY TO CLIPBOARD ACTIONS
   ========================================================================== */
function initCopyActions() {
  const copyButtons = document.querySelectorAll('.copy-trigger-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetText = btn.dataset.copyText;
      if (!targetText) return;

      navigator.clipboard.writeText(targetText).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = `<svg class="inline-icon" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg> Tersalin!`;
        btn.classList.add('copied');
        showToast(`Tersalin ke clipboard: ${targetText}`, 'success');

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove('copied');
        }, 2400);
      }).catch(() => {
        showToast('Gagal menyalin. Silakan salin secara manual.', 'error');
      });
    });
  });
}

/* ==========================================================================
   7. NAVIGATION & SCROLL HIGHLIGHT
   ========================================================================== */
function initNavigation() {
  const navLinks = document.querySelectorAll('.bottom-nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 140;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* ==========================================================================
   8. DIGITAL GUEST PASS & QR CODE MODAL
   ========================================================================== */
function initDigitalPass() {
  const modal = document.getElementById('digitalPassModal');
  const openBtns = document.querySelectorAll('.btn-open-pass');
  const closeBtn = document.getElementById('passModalClose');
  const saveBtn = document.getElementById('btnSavePass');

  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closePass() {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closePass);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePass();
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      showToast('Silakan ambil tangkapan layar (screenshot) pass ini untuk check-in!', 'info');
    });
  }
}

/* ==========================================================================
   9. INTERACTIVE GOOGLE MAPS MODAL
   ========================================================================== */
function initMapModal() {
  const modal = document.getElementById('mapModal');
  const openBtns = document.querySelectorAll('.btn-open-map-modal');
  const closeBtn = document.getElementById('mapModalClose');

  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeMap() {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closeMap);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeMap();
    });
  }
}

/* ==========================================================================
   10. WEDDING GIFT TABS (BANK / QRIS / KADO)
   ========================================================================== */
function initGiftTabs() {
  const tabBtns = document.querySelectorAll('.gift-tab-btn');
  const tabPanes = document.querySelectorAll('.gift-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tabTarget;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePane = document.getElementById(target);
      if (activePane) activePane.classList.add('active');
    });
  });
}

/* ==========================================================================
   11. DRESS CODE COLOR SWATCH INTERACTION
   ========================================================================== */
function initDressCodeTooltips() {
  const swatches = document.querySelectorAll('.swatch-circle');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const colorName = swatch.dataset.colorName || 'Warna';
      const colorTip = swatch.dataset.colorTip || 'Warna rekomendasi busana.';
      showToast(`${colorName}: ${colorTip}`, 'info');
    });
  });
}

/* ==========================================================================
   12. SCROLL ANIMATIONS (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

/* ==========================================================================
   13. TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  toast.innerHTML = `
    <span class="toast-dot"></span>
    <span class="toast-message">${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}
