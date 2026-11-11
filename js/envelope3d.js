/**
 * LOTUS BOTANICAL ROMANCE - 3D Pink Wedding Envelope & Opening Experience
 * Implements interactive 3D perspective tilt, realistic flap folding,
 * metallic embossed wax seal, sliding invitation card, and cinematic page transition.
 */

class Lotus3DEnvelope {
  constructor() {
    this.coverSection = document.getElementById('openingCover');
    this.envelopeContainer = document.getElementById('envelope3DContainer');
    this.envelope = document.getElementById('envelopeWrapper');
    this.flap = document.getElementById('envelopeFlap');
    this.waxSeal = document.getElementById('waxSeal');
    this.card = document.getElementById('slidingCard');
    this.openBtn = document.getElementById('openInvitationBtn');
    this.mainWebsite = document.getElementById('mainWebsite');
    this.guestNameEl = document.getElementById('envelopeGuestName');

    this.isOpen = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.currentRotateX = 0;
    this.currentRotateY = 0;
    this.targetRotateX = 0;
    this.targetRotateY = 0;

    this.init();
  }

  init() {
    this.parseGuestName();
    this.bindEvents();
    this.startParallaxLoop();
  }

  parseGuestName() {
    const urlParams = new URLSearchParams(window.location.search);
    const guest = urlParams.get('to') || urlParams.get('guest') || urlParams.get('nama') || 'Tamu Undangan';
    if (this.guestNameEl) {
      this.guestNameEl.textContent = decodeURIComponent(guest.replace(/\+/g, ' '));
    }

    // Also update any guest greeting across the site
    const greetingSpans = document.querySelectorAll('.dynamic-guest-name');
    greetingSpans.forEach(el => {
      el.textContent = decodeURIComponent(guest.replace(/\+/g, ' '));
    });
  }

  bindEvents() {
    if (!this.envelopeContainer) return;

    // Pointer move parallax (Desktop & Pointer Devices)
    window.addEventListener('pointermove', (e) => {
      if (this.isOpen) return;
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      this.targetRotateY = x * 20; // Max 20 deg Y rotation
      this.targetRotateX = -y * 16; // Max 16 deg X rotation
    });

    // Mobile & Tablet Touch Drag Parallax
    window.addEventListener('touchmove', (e) => {
      if (this.isOpen || !e.touches || e.touches.length === 0) return;
      const touch = e.touches[0];
      const x = (touch.clientX / window.innerWidth) - 0.5;
      const y = (touch.clientY / window.innerHeight) - 0.5;
      this.targetRotateY = x * 22;
      this.targetRotateX = -y * 18;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (this.isOpen) return;
      // Spring gently back towards center
      this.targetRotateY = 0;
      this.targetRotateX = 0;
    });

    // Mobile DeviceOrientation gyroscope support
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== 'function') {
      window.addEventListener('deviceorientation', (e) => {
        if (this.isOpen || !e.gamma || !e.beta) return;
        this.targetRotateY = Math.min(Math.max(e.gamma * 0.5, -20), 20);
        this.targetRotateX = Math.min(Math.max((e.beta - 45) * 0.4, -16), 16);
      });
    }

    // Click & Touch triggers for opening
    if (this.waxSeal) {
      this.waxSeal.addEventListener('click', () => this.openEnvelope());
      this.waxSeal.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.openEnvelope();
      });
    }
    if (this.openBtn) {
      this.openBtn.addEventListener('click', () => this.openEnvelope());
      this.openBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.openEnvelope();
      });
    }
  }

  startParallaxLoop() {
    const animate = () => {
      if (!this.isOpen && this.envelope) {
        // Smooth lerp damping
        this.currentRotateX += (this.targetRotateX - this.currentRotateX) * 0.08;
        this.currentRotateY += (this.targetRotateY - this.currentRotateY) * 0.08;

        this.envelope.style.transform = `rotateX(${this.currentRotateX.toFixed(2)}deg) rotateY(${this.currentRotateY.toFixed(2)}deg)`;
      }
      requestAnimationFrame(animate);
    };
    animate();
  }

  openEnvelope() {
    if (this.isOpen) return;
    this.isOpen = true;

    // Reset rotation smoothly to neutral before unfolding
    if (this.envelope) {
      this.envelope.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      this.envelope.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }

    // 1. Play tactile wax seal break sound
    if (window.romanticAudio) {
      window.romanticAudio.playSealBreak();
    }

    // 2. Animate wax seal cracking and releasing
    if (this.waxSeal) {
      this.waxSeal.classList.add('broken');
      this.createGoldSparkles(this.waxSeal);
    }

    // 3. Open top flap in 3D
    setTimeout(() => {
      if (this.flap) {
        this.flap.classList.add('open');
      }
      if (window.romanticAudio) {
        window.romanticAudio.playPaperRustle();
      }
    }, 350);

    // 4. Slide out invitation card smoothly
    setTimeout(() => {
      if (this.card) {
        this.card.classList.add('pulled-out');
      }
      // Start ambient romantic music
      if (window.romanticAudio) {
        window.romanticAudio.play();
      }
    }, 750);

    // 5. Cinematic transition to main wedding website
    setTimeout(() => {
      if (this.coverSection) {
        this.coverSection.classList.add('fade-out');
      }
      if (this.mainWebsite) {
        this.mainWebsite.classList.remove('hidden');
        this.mainWebsite.classList.add('visible');
        document.body.classList.remove('invitation-closed');
        document.body.classList.add('invitation-opened');
      }

      // Smooth scroll to hero section
      const hero = document.getElementById('hero');
      if (hero) {
        hero.scrollIntoView({ behavior: 'smooth' });
      }

      // Hide cover section after transition to preserve memory
      setTimeout(() => {
        if (this.coverSection) {
          this.coverSection.style.display = 'none';
        }
      }, 1000);
    }, 2200);
  }

  createGoldSparkles(element) {
    const rect = element.getBoundingClientRect();
    const count = 16;
    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'gold-sparkle-particle';
      const angle = (i / count) * Math.PI * 2;
      const distance = 40 + Math.random() * 50;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      
      sparkle.style.setProperty('--tx', `${tx}px`);
      sparkle.style.setProperty('--ty', `${ty}px`);
      sparkle.style.left = `${rect.width / 2}px`;
      sparkle.style.top = `${rect.height / 2}px`;

      element.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 800);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.lotusEnvelope = new Lotus3DEnvelope();
});

