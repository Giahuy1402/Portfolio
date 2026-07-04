/* ============================================================
   PORTFOLIO SCRIPT — Noomo Labs Inspired
   Custom cursor, scroll reveal, skill bars, filters, hero anim
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ====== Set Year ====== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();



  /* ====== Nav Scroll Behavior ====== */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 80) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ====== Hero Text Reveal Animation ====== */
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    // Trigger word animation after small delay
    setTimeout(() => {
      heroSection.classList.add('hero-loaded');
    }, 200);
  }

  /* ====== Scroll Reveal ====== */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ====== Skill Bar Animation ====== */
  const skillBars = document.querySelectorAll('.skill-item-bar');

  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = parseFloat(bar.getAttribute('data-width')) || 0.7;
        // Use scaleX for editorial line effect
        bar.style.transformOrigin = 'left';
        bar.style.transform = `scaleX(${width})`;
        bar.classList.add('animated');
        barObserver.unobserve(bar);
      }
    });
  }, { threshold: 0.2 });

  skillBars.forEach(bar => {
    bar.style.transform = 'scaleX(0)';
    bar.style.transformOrigin = 'left';
    bar.style.transition = 'transform 1.4s cubic-bezier(0.0, 0, 0.2, 1) 0.2s';
    barObserver.observe(bar);
  });

  /* ====== Project Filter ====== */
  const filterBar = document.querySelector('.filter-bar');
  const projectItems = document.querySelectorAll('.project-item');

  if (filterBar && projectItems.length) {
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      filterBar.querySelector('.filter-btn.active')?.classList.remove('active');
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectItems.forEach(item => {
        const tags = item.getAttribute('data-tags') || '';
        const visible = filter === 'all' || tags.includes(filter);

        if (visible) {
          item.classList.remove('hidden');
          item.style.animation = 'none';
          void item.offsetWidth; // reflow
          item.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  }

  /* ====== Copy Email ====== */
  const copyBtn = document.getElementById('copy-email-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const emailEl = document.getElementById('email-address');
      const email = emailEl ? emailEl.textContent.trim() : '';
      if (!email) return;

      navigator.clipboard.writeText(email).then(() => {
        const icon = copyBtn.querySelector('i');
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Đã sao chép!';
        copyBtn.style.background = 'var(--accent)';
        copyBtn.style.color = 'var(--bg)';
        copyBtn.style.borderColor = 'var(--accent)';

        setTimeout(() => {
          copyBtn.innerHTML = originalHTML;
          copyBtn.style.background = '';
          copyBtn.style.color = '';
          copyBtn.style.borderColor = '';
        }, 2000);
      }).catch(err => {
        console.error('Copy failed:', err);
      });
    });
  }

  /* ====== Active Nav Link on Scroll ====== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const activeLinkObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => activeLinkObserver.observe(s));

  /* ====== Smooth scroll for nav ====== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ====== Project item stagger on load ====== */
  const allProjectItems = document.querySelectorAll('.project-item');
  allProjectItems.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;

    setTimeout(() => {
      if (!item.classList.contains('hidden')) {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }
    }, 500 + i * 70);
  });

});

/* ====== Keyframe for filter animation ====== */
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .nav-links a.active {
    color: var(--fg) !important;
  }
`;
document.head.appendChild(style);