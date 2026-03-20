/* ============================================================
   Tiles WMS - Shared JavaScript
   ============================================================ */

(() => {
  const state = {
    parser: new DOMParser(),
    activeRequest: null,
    revealObserver: null,
    counterObserver: null,
    globalsBound: false
  };

  function getCurrentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  function isArabicPage() {
    return document.documentElement.lang === 'ar';
  }

  function getMessages() {
    return isArabicPage()
      ? {
          required: '\u0647\u0630\u0627 \u0627\u0644\u062d\u0642\u0644 \u0645\u0637\u0644\u0648\u0628.',
          invalidEmail: '\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0628\u0631\u064a\u062f \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0635\u062d\u064a\u062d.',
          sending: '\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0631\u0633\u0627\u0644...',
          sent: '\u062a\u0645 \u0627\u0644\u0625\u0631\u0633\u0627\u0644',
          failed: '\u0641\u0634\u0644 \u0627\u0644\u0625\u0631\u0633\u0627\u0644',
          sendMessage: '\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629',
          requestFailed: '\u062a\u0639\u0630\u0631 \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u062a\u0643 \u0627\u0644\u0622\u0646. \u064a\u0631\u062c\u0649 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649 \u0644\u0627\u062d\u0642\u064b\u0627.'
        }
      : {
          required: 'This field is required.',
          invalidEmail: 'Please enter a valid email.',
          sending: 'Sending...',
          sent: 'Message Sent',
          failed: 'Failed',
          sendMessage: 'Send Message',
          requestFailed: 'We could not send your message right now. Please try again later.'
        };
  }

  function syncLanguageSwitchers() {
    const currentPage = getCurrentPage();
    const desktopNav = document.querySelector('.nav-links');
    const mobileMenuRoot = document.getElementById('mobileMenu');
    const alternateHref = isArabicPage() ? `en/${currentPage}` : `../${currentPage}`;
    const alternateLabel = isArabicPage() ? 'English' : '\u0627\u0644\u0639\u0631\u0628\u064a\u0629';

    if (desktopNav && !desktopNav.querySelector('.lang-switch')) {
      const langItem = document.createElement('li');
      const langLink = document.createElement('a');
      langLink.href = alternateHref;
      langLink.className = 'lang-switch';
      langLink.textContent = alternateLabel;
      langItem.appendChild(langLink);
      desktopNav.appendChild(langItem);
    }

    if (mobileMenuRoot && !mobileMenuRoot.querySelector('.lang-switch-mobile')) {
      const mobileLangLink = document.createElement('a');
      mobileLangLink.href = alternateHref;
      mobileLangLink.className = 'lang-switch-mobile';
      mobileLangLink.textContent = alternateLabel;
      mobileMenuRoot.appendChild(mobileLangLink);
    }
  }

  function updateNavbarShadow() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    }
  }

  function closeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    hamburger?.classList.remove('open');
    mobileMenu?.classList.remove('open');
  }

  function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!hamburger || !mobileMenu || hamburger.dataset.bound === 'true') {
      return;
    }

    hamburger.dataset.bound = 'true';
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });
  }

  function updateActiveNav() {
    const currentPage = getCurrentPage();

    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach((link) => {
      const href = link.getAttribute('href') || '';
      link.classList.remove('active');

      if (href === currentPage || (currentPage === 'index.html' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  function scrollToHash(hash, smooth = true) {
    if (!hash || hash === '#') {
      return;
    }

    const targetId = decodeURIComponent(hash.replace(/^#/, ''));
    const escapedId = typeof CSS !== 'undefined' && CSS.escape ? `#${CSS.escape(targetId)}` : null;
    const target = document.getElementById(targetId) || (escapedId ? document.querySelector(escapedId) : null);

    if (!target) {
      return;
    }

    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
  }

  function setupSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      if (anchor.dataset.smoothBound === 'true') {
        return;
      }

      anchor.dataset.smoothBound = 'true';
      anchor.addEventListener('click', (event) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') {
          return;
        }

        const target = document.querySelector(targetId);
        if (!target) {
          return;
        }

        event.preventDefault();
        scrollToHash(targetId);
      });
    });
  }

  function setupRevealAnimations() {
    state.revealObserver?.disconnect();

    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) {
      return;
    }

    state.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          state.revealObserver?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach((element) => state.revealObserver.observe(element));
  }

  function animateCounter(element) {
    const target = parseFloat(element.dataset.target);
    const suffix = element.dataset.suffix || '';
    const prefix = element.dataset.prefix || '';
    const isDecimal = String(target).includes('.');
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      element.textContent = prefix + (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  function setupCounters() {
    state.counterObserver?.disconnect();

    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) {
      return;
    }

    state.counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          state.counterObserver?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach((element) => state.counterObserver.observe(element));
  }

  function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach((button) => {
      if (button.dataset.bound === 'true') {
        return;
      }

      button.dataset.bound = 'true';
      button.addEventListener('click', () => {
        const target = button.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach((item) => item.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(target)?.classList.add('active');
      });
    });
  }

  function setupFaq() {
    document.querySelectorAll('.faq-q').forEach((button) => {
      if (button.dataset.bound === 'true') {
        return;
      }

      button.dataset.bound = 'true';
      button.addEventListener('click', () => {
        const item = button.closest('.faq-item');
        const isOpen = item?.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach((faqItem) => faqItem.classList.remove('open'));
        if (item && !isOpen) {
          item.classList.add('open');
        }
      });
    });
  }

  function setupPricingToggle() {
    const priceToggle = document.getElementById('priceToggle');
    if (!priceToggle || priceToggle.dataset.bound === 'true') {
      return;
    }

    priceToggle.dataset.bound = 'true';
    priceToggle.addEventListener('click', () => {
      priceToggle.classList.toggle('on');
      const isAnnual = priceToggle.classList.contains('on');
      document.getElementById('label-monthly')?.classList.toggle('active', !isAnnual);
      document.getElementById('label-annual')?.classList.toggle('active', isAnnual);
      document.querySelectorAll('[data-monthly]').forEach((element) => {
        element.textContent = isAnnual ? element.dataset.annual : element.dataset.monthly;
      });
    });
  }

  function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    const messages = getMessages();

    if (!contactForm || contactForm.dataset.bound === 'true') {
      return;
    }

    contactForm.dataset.bound = 'true';
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      let valid = true;

      contactForm.querySelectorAll('[required]').forEach((field) => {
        const error = document.getElementById(field.name + 'Error');
        if (!field.value.trim()) {
          field.classList.add('error');
          if (error) {
            error.textContent = messages.required;
            error.classList.add('show');
          }
          valid = false;
        } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          field.classList.add('error');
          if (error) {
            error.textContent = messages.invalidEmail;
            error.classList.add('show');
          }
          valid = false;
        } else {
          field.classList.remove('error');
          error?.classList.remove('show');
        }
      });

      if (!valid) {
        return;
      }

      const formData = new FormData(contactForm);
      const name = `${formData.get('firstName')} ${formData.get('lastName')}`.trim();
      formData.append('name', name);

      if (!formData.get('phone')) {
        formData.set('phone', '');
      }

      if (!formData.get('company')) {
        formData.set('company', '');
      }

      const button = contactForm.querySelector('button[type="submit"]');
      button.disabled = true;
      button.textContent = messages.sending;

      fetch('http://localhost/mail_tileswarehouse/send-email.php', {
        method: 'POST',
        body: formData
      })
        .then(async (response) => {
          const text = await response.text();
          let data;

          try {
            data = JSON.parse(text);
          } catch (error) {
            throw new Error(`Invalid server response: ${text || 'Empty response'}`);
          }

          if (!response.ok) {
            throw new Error(data.message || 'Request failed.');
          }

          return data;
        })
        .then((data) => {
          if (data.success) {
            button.textContent = messages.sent;
            button.style.background = '#0e9f6e';
            contactForm.reset();
          } else {
            button.textContent = messages.failed;
            alert(messages.requestFailed);
          }

          setTimeout(() => {
            button.textContent = messages.sendMessage;
            button.style.background = '';
            button.disabled = false;
          }, 3000);
        })
        .catch(() => {
          alert(messages.requestFailed);
          button.disabled = false;
          button.textContent = messages.sendMessage;
          button.style.background = '';
        });
    });

    contactForm.querySelectorAll('.form-control').forEach((field) => {
      if (field.dataset.bound === 'true') {
        return;
      }

      field.dataset.bound = 'true';
      field.addEventListener('input', () => {
        field.classList.remove('error');
        document.getElementById(field.name + 'Error')?.classList.remove('show');
      });
    });
  }

  function syncHead(nextDocument) {
    document.title = nextDocument.title || document.title;

    const nextMetaDescription = nextDocument.querySelector('meta[name="description"]');
    let currentMetaDescription = document.querySelector('meta[name="description"]');

    if (nextMetaDescription && currentMetaDescription) {
      currentMetaDescription.setAttribute('content', nextMetaDescription.getAttribute('content') || '');
    } else if (nextMetaDescription && !currentMetaDescription) {
      currentMetaDescription = document.createElement('meta');
      currentMetaDescription.setAttribute('name', 'description');
      currentMetaDescription.setAttribute('content', nextMetaDescription.getAttribute('content') || '');
      document.head.appendChild(currentMetaDescription);
    }
  }

  function syncHtmlAttributes(nextDocument) {
    const nextLang = nextDocument.documentElement.getAttribute('lang');
    const nextDir = nextDocument.documentElement.getAttribute('dir');

    if (nextLang) {
      document.documentElement.setAttribute('lang', nextLang);
    }

    if (nextDir) {
      document.documentElement.setAttribute('dir', nextDir);
    } else {
      document.documentElement.removeAttribute('dir');
    }
  }

  function replaceBody(nextDocument) {
    const wasLoading = document.body.classList.contains('ajax-loading');

    document.body.className = nextDocument.body.className;
    document.body.innerHTML = nextDocument.body.innerHTML;

    if (wasLoading) {
      document.body.classList.add('ajax-loading');
    }
  }

  function shouldHandleAjaxLink(link, event) {
    if (!link) {
      return false;
    }

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return false;
    }

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || link.hasAttribute('download') || link.dataset.noAjax !== undefined) {
      return false;
    }

    if (link.target && link.target !== '_self') {
      return false;
    }

    if (/^(mailto:|tel:|javascript:)/i.test(href)) {
      return false;
    }

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) {
      return false;
    }

    if (url.pathname === window.location.pathname && url.search === window.location.search) {
      return false;
    }

    return /\.(html?)$/i.test(url.pathname) || url.pathname.endsWith('/');
  }

  async function navigateTo(url, options = {}) {
    const nextUrl = new URL(url, window.location.href);
    const nextLocation = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
    const controller = new AbortController();

    state.activeRequest?.abort();
    state.activeRequest = controller;
    document.body.classList.add('ajax-loading');
    closeMobileMenu();

    try {
      const response = await fetch(nextUrl.href, {
        signal: controller.signal,
        headers: {
          'X-Requested-With': 'fetch'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load ${nextUrl.href}`);
      }

      const html = await response.text();
      const nextDocument = state.parser.parseFromString(html, 'text/html');

      if (!nextDocument.body) {
        throw new Error('Invalid HTML response.');
      }

      syncHead(nextDocument);
      syncHtmlAttributes(nextDocument);
      replaceBody(nextDocument);

      if (options.replace) {
        history.replaceState({ url: nextLocation }, '', nextUrl.href);
      } else if (!options.fromPopState) {
        history.pushState({ url: nextLocation }, '', nextUrl.href);
      }

      initPage();

      if (nextUrl.hash) {
        scrollToHash(nextUrl.hash, false);
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        window.location.href = nextUrl.href;
      }
    } finally {
      if (state.activeRequest === controller) {
        document.body.classList.remove('ajax-loading');
        state.activeRequest = null;
      }
    }
  }

  function bindGlobals() {
    if (state.globalsBound) {
      return;
    }

    state.globalsBound = true;

    window.addEventListener('scroll', updateNavbarShadow, { passive: true });

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!shouldHandleAjaxLink(link, event)) {
        return;
      }

      event.preventDefault();
      navigateTo(link.href);
    });

    window.addEventListener('popstate', () => {
      navigateTo(window.location.href, { replace: true, fromPopState: true });
    });
  }

  function initPage() {
    bindGlobals();
    history.replaceState({ url: `${window.location.pathname}${window.location.search}${window.location.hash}` }, '', window.location.href);
    syncLanguageSwitchers();
    setupMobileMenu();
    updateActiveNav();
    setupSmoothAnchors();
    setupRevealAnimations();
    setupCounters();
    setupTabs();
    setupFaq();
    setupPricingToggle();
    setupContactForm();
    updateNavbarShadow();
  }

  document.addEventListener('DOMContentLoaded', initPage);
})();
