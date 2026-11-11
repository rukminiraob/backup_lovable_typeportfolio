/* ═══════════════════════════════════════════
   PORTFOLIO JAVASCRIPT — Rukmini Rao
   Tabs, Custom cursor, Nav scroll, Reveals,
   Smooth scrolling, Case study controls
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. TAB MANAGEMENT ────────────────────────
  const tabLinks = document.querySelectorAll('[data-tab], [data-tab-link]');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const validTabs = ['personal', 'passion', 'design'];

  function getActiveTabFromUrl() {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (validTabs.includes(hash)) return hash;
    // Direct link to element within a tab (e.g. #project-swachh -> design)
    if (hash.startsWith('project-') || hash === 'work') return 'design';
    if (hash === 'home' || hash === 'about' || hash === 'skills' || hash === 'story' || hash === 'values' || hash === 'process' || hash === 'certifications') return 'personal';
    return 'personal';
  }

  function setActiveTab(targetTab, shouldScroll = false) {
    if (!validTabs.includes(targetTab)) targetTab = 'personal';

    // Update panel visibility
    tabPanels.forEach(panel => {
      const isTarget = panel.id === targetTab;
      panel.hidden = !isTarget;
      if (isTarget) {
        panel.removeAttribute('hidden');
        panel.setAttribute('aria-hidden', 'false');
      } else {
        panel.setAttribute('hidden', '');
        panel.setAttribute('aria-hidden', 'true');
      }
    });

    // Update nav tab styles & aria attributes
    document.querySelectorAll('.nav-links [role="tab"]').forEach(link => {
      const isSelected = link.getAttribute('data-tab') === targetTab;
      link.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      if (isSelected) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update mobile nav links
    document.querySelectorAll('.mobile-link[data-tab-link]').forEach(link => {
      const isSelected = link.getAttribute('data-tab-link') === targetTab;
      if (isSelected) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Trigger reveal checks for newly visible elements
    setTimeout(triggerReveals, 60);

    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Click handlers on tab buttons and logo
  tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const tabTarget = link.getAttribute('data-tab') || link.getAttribute('data-tab-link');
      if (tabTarget && validTabs.includes(tabTarget)) {
        e.preventDefault();
        if (history.pushState) {
          history.pushState(null, null, '#' + tabTarget);
        } else {
          window.location.hash = '#' + tabTarget;
        }
        setActiveTab(tabTarget, true);
      }
    });
  });

  // Handle URL hash changes (back/forward navigation)
  window.addEventListener('hashchange', () => {
    const target = getActiveTabFromUrl();
    setActiveTab(target, false);
  });

  // Keyboard navigation for tablist (WAI-ARIA compliant)
  const tablist = document.querySelector('[role="tablist"]');
  if (tablist) {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    tablist.addEventListener('keydown', (e) => {
      const currentTab = document.activeElement;
      const index = tabs.indexOf(currentTab);
      if (index === -1) return;

      let nextIndex = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIndex = (index + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        tabs[nextIndex].focus();
        const tabTarget = tabs[nextIndex].getAttribute('data-tab');
        setActiveTab(tabTarget, false);
        if (history.pushState) {
          history.pushState(null, null, '#' + tabTarget);
        }
      }
    });
  }

  // ── 2. CASE STUDY EXPAND / CLOSE CONTROLS ───
  // Handle case study close buttons
  document.querySelectorAll('.case-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const details = btn.closest('details');
      if (details) {
        details.removeAttribute('open');
        const proj = details.closest('.proj');
        if (proj) {
          const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
          const top = proj.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

  // Project quick index links: jump to project and open its disclosure
  document.querySelectorAll('.project-index a').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').replace('#', '');
      const targetProj = document.getElementById(targetId);
      if (targetProj) {
        e.preventDefault();
        // Make sure we're on design tab
        setActiveTab('design', false);
        // Open the disclosure inside
        const details = targetProj.querySelector('details.case-toggle');
        if (details) {
          details.setAttribute('open', '');
        }
        setTimeout(() => {
          const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
          const top = targetProj.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top, behavior: 'smooth' });
        }, 80);
      }
    });
  });

  // ── 3. CUSTOM CURSOR ─────────────────────────
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let mx = 0, my = 0, fx = 0, fy = 0;
  let cursorActive = false;

  // Only run custom cursor on fine-pointer devices (not touch)
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (isFinePointer && cursor && follower) {
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
      if (!cursorActive) {
        cursor.style.opacity = '1';
        follower.style.opacity = '1';
        cursorActive = true;
      }
    });

    function followCursor() {
      fx += (mx - fx) * 0.12;
      fy += (my - fy) * 0.12;
      follower.style.left = fx + 'px';
      follower.style.top = fy + 'px';
      requestAnimationFrame(followCursor);
    }
    followCursor();

    const hoverSelectors = 'a, button, summary, .skill-card, .belief-card, .rc, .geo-card, .pi-card, .small-card, .star';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverSelectors)) {
        cursor.classList.add('expanded');
        follower.classList.add('expanded');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverSelectors)) {
        cursor.classList.remove('expanded');
        follower.classList.remove('expanded');
      }
    });
  }

  // ── 4. NAV SCROLL STATE ──────────────────────
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  // ── 5. MOBILE NAV TOGGLE ─────────────────────
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close mobile nav on link click
    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── 6. REVEAL ON SCROLL ──────────────────────
  let observer = null;
  function setupObserver() {
    const revealElements = document.querySelectorAll(
      '.about-grid, .skill-card, .belief-card, .process-step, .contact-inner, .passion-item, .nature-inner, .small-card, .proj-summary, .evidence-row'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => observer.observe(el));
  }

  function triggerReveals() {
    const revealElements = document.querySelectorAll('.tab-panel:not([hidden]) .reveal:not(.visible)');
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100) {
        el.classList.add('visible');
      }
    });
  }

  setupObserver();

  // ── 7. SMOOTH SCROLL FOR HASH LINKS ──────────
  document.querySelectorAll('a[href^="#"]:not([role="tab"]):not([data-tab-link])').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').substring(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (target) {
        // If target is inside a specific tab, make sure that tab is open
        const parentTab = target.closest('.tab-panel');
        if (parentTab && parentTab.hidden) {
          setActiveTab(parentTab.id, false);
        }

        e.preventDefault();
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── 8. HERO TITLE ENTRANCE ───────────────────
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    heroTitle.style.opacity = '0';
    heroTitle.style.transform = 'translateY(30px)';
    setTimeout(() => {
      heroTitle.style.transition = 'opacity 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      heroTitle.style.opacity = '1';
      heroTitle.style.transform = 'translateY(0)';
    }, 120);
  }

  // ── 9. INITIALISE BASED ON URL HASH ──────────
  const initialTab = getActiveTabFromUrl();
  setActiveTab(initialTab, false);

  // If URL has a specific project hash, open it
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash.startsWith('project-')) {
    const proj = document.getElementById(initialHash);
    if (proj) {
      const details = proj.querySelector('details.case-toggle');
      if (details) details.setAttribute('open', '');
      setTimeout(() => {
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
        const top = proj.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }, 150);
    }
  }

  console.log('%c rB. Portfolio · complexity · clarity · design ✓', 'color: #3b5066; font-weight: bold; font-size: 13px;');
});
