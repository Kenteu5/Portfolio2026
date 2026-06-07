/**
 * main.js — Ken Condez Portfolio
 *
 * Modules:
 *   1. Intro Sequence
 *   2. Custom Cursor
 *   3. Navigation (scroll state + mobile toggle)
 *   4. Progress Bar
 *   5. Scroll Reveal (bidirectional)
 *   6. Hero Entrance Animations
 *   7. Magnetic Buttons
 *   8. Portrait Parallax
 */

'use strict';

/* ─────────────────────────────────────
   UTILS
───────────────────────────────────── */
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/** Run callback once the DOM is ready */
function ready(fn) {
  if (document.readyState !== 'loading') { fn(); }
  else { document.addEventListener('DOMContentLoaded', fn); }
}

/* ─────────────────────────────────────
   1. INTRO SEQUENCE
   Hides the intro overlay after animations complete.
   Uses CSS animations; JS only removes the element.
───────────────────────────────────── */
function initIntro() {
  const intro = $('#intro');
  if (!intro) return;

  // Total animation duration: last word at 0.35s + 0.65s duration + 0.5s rule = ~1.8s
  // Add small buffer → hide at 2.4s
  const HIDE_DELAY = 2400;

  setTimeout(() => {
    intro.classList.add('is-hidden');
    // After transition ends, remove from DOM so it doesn't interfere
    intro.addEventListener('transitionend', () => intro.remove(), { once: true });
  }, HIDE_DELAY);
}

/* ─────────────────────────────────────
   2. CUSTOM CURSOR
   Dot follows mouse exactly.
   Ring follows with spring interpolation.
   Both scale on hoverable elements.
───────────────────────────────────── */
function initCursor() {
  const dot  = $('#cursor');
  const ring = $('#cursor-ring');
  if (!dot || !ring) return;

  // Check for touch/no-hover devices
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let rafId  = null;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  function animateRing() {
    // Lerp ring toward cursor
    ringX += (mouseX - ringX) * 0.11;
    ringY += (mouseY - ringY) * 0.11;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover states on interactive elements
  const hoverTargets = 'a, button, [data-magnetic], .proj-card, .skill-col__list li';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      dot.classList.add('cursor--hover');
      ring.classList.add('cursor-ring--hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      dot.classList.remove('cursor--hover');
      ring.classList.remove('cursor-ring--hover');
    }
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '';
  });
}

/* ─────────────────────────────────────
   3. NAVIGATION
   - Scrolled state (solid background)
   - Mobile menu toggle
───────────────────────────────────── */
function initNav() {
  const header = $('#site-header');
  const toggle = $('#nav-toggle');
  const mobile = $('#nav-mobile');
  if (!header) return;

  // Scrolled state
  const SCROLL_THRESHOLD = 64;

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once on init

  // Mobile menu
  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      mobile.setAttribute('aria-hidden', String(isOpen));
      mobile.style.display = isOpen ? '' : 'flex';

      // Small delay so display:flex kicks in before opacity transition
      requestAnimationFrame(() => {
        mobile.setAttribute('aria-hidden', String(isOpen));
      });
    });

    // Close on link click
    $$('a', mobile).forEach(link => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        mobile.setAttribute('aria-hidden', 'true');
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        toggle.setAttribute('aria-expanded', 'false');
        mobile.setAttribute('aria-hidden', 'true');
      }
    });
  }
}

/* ─────────────────────────────────────
   4. PROGRESS BAR
   Tracks reading progress as a percentage
   of total scrollable document height.
───────────────────────────────────── */
function initProgressBar() {
  const bar = $('#progress-bar');
  if (!bar) return;

  function update() {
    const scrollTop    = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress     = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width = clamp(progress, 0, 100) + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ─────────────────────────────────────
   5. SCROLL REVEAL (BIDIRECTIONAL)
   Elements with [data-reveal] animate in
   when entering viewport and out when leaving.
   Uses IntersectionObserver with two thresholds.
───────────────────────────────────── */
function initScrollReveal() {
  const els = $$('[data-reveal]');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          entry.target.classList.remove('is-hidden');
        } else {
          // Only reverse if element has already been shown at least once
          if (entry.target.classList.contains('is-visible')) {
            entry.target.classList.remove('is-visible');
            entry.target.classList.add('is-hidden');
          }
        }
      });
    },
    {
      threshold: 0,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  els.forEach((el) => observer.observe(el));
}

/* ─────────────────────────────────────
   6. HERO ENTRANCE ANIMATIONS
   Staggers elements marked with [data-intro-reveal]
   after the intro sequence completes.
───────────────────────────────────── */
function initHeroEntrance() {
  const INTRO_DONE = 2500; // ms — when intro overlay is gone
  const STAGGER    = 120;  // ms between each element

  const els = $$('[data-intro-reveal]');
  if (!els.length) return;

  setTimeout(() => {
    els.forEach((el) => {
      const delay = parseInt(el.getAttribute('data-intro-delay') || '0', 10);

      setTimeout(() => {
        el.style.transition = `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay * 0}ms,
                               transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay * 0}ms`;
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';
      }, delay * STAGGER);
    });
  }, INTRO_DONE);
}

/* ─────────────────────────────────────
   7. MAGNETIC BUTTONS
   Elements with [data-magnetic] subtly
   follow the cursor on hover.
───────────────────────────────────── */
function initMagneticButtons() {
  const buttons = $$('[data-magnetic]');
  if (!buttons.length) return;

  // Only on pointer-capable devices
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const STRENGTH = 0.3; // 0–1, how strongly it follows cursor

  buttons.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect   = btn.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) * STRENGTH;
      const dy     = (e.clientY - cy) * STRENGTH;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)';
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.15s ease';
    });
  });
}

/* ─────────────────────────────────────
   8. PORTRAIT PARALLAX
   The hero portrait frame shifts slightly
   as the user scrolls — creates depth
   without being distracting.
───────────────────────────────────── */
function initPortraitParallax() {
  const portrait = $('#hero-portrait');
  if (!portrait) return;
  if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;

  let ticking = false;

  function update() {
    const scrollY = window.scrollY;
    const shift   = scrollY * 0.12; // subtle
    portrait.style.transform = `translateY(${shift}px)`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
}

/* ─────────────────────────────────────
   INIT — Run all modules
───────────────────────────────────── */
ready(() => {
  initIntro();
  initCursor();
  initNav();
  initProgressBar();
  initScrollReveal();
  initHeroEntrance();
  initMagneticButtons();
  initPortraitParallax();
});