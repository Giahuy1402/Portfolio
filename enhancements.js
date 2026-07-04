/* ============================================================
   PORTFOLIO ENHANCEMENTS — VIP EDITION
   ✦ Canvas particles  ✦ Scroll progress  ✦ Smooth scroll
   ✦ Project modal + YouTube embed  ✦ Text scramble
   ✦ Magnetic buttons  ✦ Count-up  ✦ Parallax orbs
   ✦ Cursor trail  ✦ Tilt on cards
   ============================================================ */

(function () {
  'use strict';

  // =============================================
  // 1. ANIMATED PARTICLE CANVAS BACKGROUND
  // =============================================
  (function initCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    const PARTICLE_COUNT = 55;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    class Particle {
      constructor() { this.reset(true); }
      reset(init = false) {
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H : H + 10;
        this.r = Math.random() * 1.4 + 0.2;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = -(Math.random() * 0.35 + 0.12);
        this.life = 0;
        this.maxLife = Math.random() * 450 + 250;
        this.hue = Math.random() > 0.6 ? 77 : 228; // lime or indigo
      }
      update() {
        this.x += this.vx; this.y += this.vy; this.life++;
        if (this.life > this.maxLife || this.y < -10) this.reset();
      }
      draw() {
        const p = this.life / this.maxLife;
        const a = p < 0.1 ? p * 10 * 0.4 : p > 0.85 ? (1 - p) / 0.15 * 0.4 : 0.4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue},90%,65%,${a})`;
        ctx.fill();
      }
    }

    function drawLines() {
      const D = 95;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < D) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(200,245,58,${(1 - d / D) * 0.055})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
    loop();
  })();

  // =============================================
  // 2. SCROLL PROGRESS BAR
  // =============================================
  (function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    function update() {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (docH > 0 ? window.scrollY / docH * 100 : 0) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  })();

  // =============================================
  // 3. SMOOTH SCROLL (with nav offset)
  // =============================================
  (function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const navH = document.getElementById('nav')?.offsetHeight ?? 80;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
      });
    });
  })();

  // =============================================
  // 4. PROJECT MODAL + YOUTUBE EMBED
  // =============================================
  (function initProjectModal() {
    const modal = document.getElementById('project-modal');
    const backdrop = document.getElementById('modal-backdrop');
    const closeBtn = document.getElementById('modal-close-btn');
    const urlBar = document.getElementById('modal-url-bar');
    const demoImg = document.getElementById('modal-demo-img');
    const demoBadge = document.getElementById('modal-demo-badge');
    const numEl = document.getElementById('modal-project-num');
    const titleEl = document.getElementById('modal-project-title');
    const descEl = document.getElementById('modal-desc');
    const tagsEl = document.getElementById('modal-tags');
    const actionBtns = document.getElementById('modal-action-btns');

    if (!modal) return;

    function openModal(data) {
      /* Populate text */
      numEl.textContent = data.num ? `PROJECT ${data.num}` : '';
      titleEl.textContent = data.title || '';
      descEl.textContent = data.desc || '';

      /* URL bar */
      urlBar.textContent = `portfolio.local/${(data.title || '').toLowerCase().replace(/\s+/g, '-')}`;

      /* Demo area — always image preview */
      if (data.img) {
        demoImg.src = data.img;
        demoImg.alt = data.title || 'Project';
        demoImg.style.display = 'block';
      } else {
        demoImg.style.display = 'none';
      }
      demoBadge.textContent = 'Preview';

      /* Tags */
      tagsEl.innerHTML = '';
      (data.tagsList || '').split(',').filter(Boolean).forEach(tag => {
        const s = document.createElement('span');
        s.className = 'modal-tag'; s.textContent = tag.trim();
        tagsEl.appendChild(s);
      });

      /* Action buttons */
      actionBtns.innerHTML = '';
      if (data.github && data.github !== '#') {
        const b = document.createElement('a');
        b.href = data.github; b.target = '_blank'; b.rel = 'noopener';
        b.className = 'modal-btn modal-btn-ghost';
        b.innerHTML = '<i class="fab fa-github"></i> GitHub';
        actionBtns.appendChild(b);
      }
      if (data.demo && data.demo !== '#') {
        const b = document.createElement('a');
        b.href = data.demo; b.target = '_blank'; b.rel = 'noopener';
        b.className = 'modal-btn modal-btn-primary';
        
        // If it's a YouTube URL, style it with a YouTube icon and change text
        const isYoutube = data.demo.includes("youtube.com") || data.demo.includes("youtu.be");
        if (isYoutube) {
          b.innerHTML = '<i class="fab fa-youtube" style="margin-right:6px;color:#ff3b30;"></i> Xem Video Demo ↗';
        } else {
          b.innerHTML = '<i class="fas fa-external-link-alt"></i> Live Demo ↗';
        }
        actionBtns.appendChild(b);
      }

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => closeBtn?.focus(), 100);
    }

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.project-item').forEach(item => {
      item.addEventListener('click', () => {
        const data = {
          num: item.getAttribute('data-num'),
          title: item.getAttribute('data-title'),
          desc: item.getAttribute('data-desc'),
          img: item.getAttribute('data-img'),
          tagsList: item.getAttribute('data-tags-list'),
          github: item.getAttribute('data-github'),
          demo: item.getAttribute('data-demo'),
        };
        if (data.title) openModal(data);
      });
    });

    closeBtn?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', closeModal);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  })();

  // =============================================
  // 5. ENHANCED SCROLL REVEAL
  // =============================================
  (function initReveal() {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children');
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -55px 0px' });
    els.forEach(el => obs.observe(el));
  })();

  // =============================================
  // 6. MAGNETIC BUTTON EFFECT
  // =============================================
  (function initMagnetic() {
    document.querySelectorAll('.btn-primary, .btn-outline, .nav-cta').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.28;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
        btn.style.transform = `translate(${dx}px,${dy}px)`;
      });
      btn.addEventListener('mouseleave', () => btn.style.transform = '');
    });
  })();

  // =============================================
  // 7. COUNT-UP NUMBERS
  // =============================================
  (function initCountUp() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.textContent.includes('∞')) return;
        const raw = el.textContent.trim();
        const m = raw.match(/^(\d+(?:\.\d+)?)(\+|k|m)?/i);
        if (!m) return;
        const target = parseFloat(m[1]);
        const suffix = m[2] || raw.replace(/[\d.]+/, '');
        const t0 = performance.now();
        const dur = 1400;
        const tick = now => {
          const t = Math.min((now - t0) / dur, 1);
          el.textContent = Math.round((1 - Math.pow(1 - t, 3)) * target) + suffix;
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.about-stat-number, .cv-stat-num').forEach(el => obs.observe(el));
  })();

  // =============================================
  // 8. HERO TEXT SCRAMBLE on load
  // =============================================
  (function initTextScramble() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&';
    function scramble(el) {
      const original = el.textContent;
      let iteration = 0;
      const interval = setInterval(() => {
        el.textContent = original.split('').map((c, i) => {
          if (c === ' ') return ' ';
          if (i < iteration) return original[i];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        if (iteration >= original.length) clearInterval(interval);
        iteration += 0.6;
      }, 35);
    }

    // Trigger scramble on the hero number label after 500ms
    const heroNum = document.querySelector('.hero-number');
    if (heroNum) setTimeout(() => scramble(heroNum), 500);
  })();

  // =============================================
  // 9. HERO MINI PARTICLES
  // =============================================
  (function initHeroParticles() {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const c = document.createElement('div');
    c.className = 'hero-particles';
    hero.insertBefore(c, hero.firstChild);
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('div');
      p.className = 'hero-particle';
      const size = Math.random() * 3 + 1;
      p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;bottom:${Math.random() * 40}%;animation-duration:${Math.random() * 6 + 5}s;animation-delay:${Math.random() * 10}s;`;
      c.appendChild(p);
    }
  })();

  // =============================================
  // 10. PARALLAX ORBS ON SCROLL
  // =============================================
  (function initParallaxOrbs() {
    const orbs = document.querySelectorAll('.page-orb');
    if (!orbs.length) return;
    let ticking = false;
    function update() {
      const sy = window.scrollY;
      orbs.forEach((orb, i) => {
        const speed = [0.11, 0.07, 0.14][i] || 0.09;
        orb.style.transform = `translateY(${sy * speed * (i % 2 === 0 ? 1 : -1)}px)`;
      });
      ticking = false;
    }
    window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  })();


  // =============================================
  // 12. VIP CARD HOVER TILT (project items + stat cards)
  // =============================================
  (function initCardTilt() {
    const cards = document.querySelectorAll('.about-stat, .about-tag-item, .education-item');
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(4px)`;
      });
      card.addEventListener('mouseleave', () => card.style.transform = '');
    });
  })();

  // =============================================
  // 13. SECTION ENTRANCE — stagger about tags
  // =============================================
  (function initAboutTagsReveal() {
    const grid = document.querySelector('.about-tags-grid');
    if (!grid) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { grid.classList.add('revealed'); obs.unobserve(grid); } });
    }, { threshold: 0.18 });
    obs.observe(grid);
  })();

  // =============================================
  // 14. LIVE LOCAL TIME (TP. HỒ CHÍ MINH, VN)
  // =============================================
  (function initLiveClock() {
    const clockEl = document.getElementById('hero-local-time');
    if (!clockEl) return;
    function updateClock() {
      try {
        const options = {
          timeZone: 'Asia/Ho_Chi_Minh',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const timeStr = formatter.format(new Date());
        clockEl.innerHTML = `📍 TP. HỒ CHÍ MINH — ${timeStr} (GMT+7)`;
      } catch (e) {
        console.error('Lỗi khởi tạo đồng hồ thời gian thực:', e);
      }
    }
    updateClock();
    setInterval(updateClock, 1000);
  })();

  // 15. LANYARD — moved to lanyard.js (Three.js + Rapier 3D)

})();

