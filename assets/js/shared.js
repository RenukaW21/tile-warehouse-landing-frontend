/* ============================================================
   Tiles WMS - Shared JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const isArabic = document.documentElement.lang === 'ar';
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const isEnglishFolder = window.location.pathname.includes('/en/');
  const messages = isArabic
    ? {
        required: 'هذا الحقل مطلوب.',
        invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح.',
        sending: 'جارٍ الإرسال...',
        sent: 'تم الإرسال',
        failed: 'فشل الإرسال',
        sendMessage: 'إرسال الرسالة',
        requestFailed: 'تعذر إرسال رسالتك الآن. يرجى المحاولة مرة أخرى لاحقًا.'
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

  const desktopNav = document.querySelector('.nav-links');
  const mobileMenuRoot = document.getElementById('mobileMenu');
  const alternateHref = isArabic ? `en/${currentPage}` : `../${currentPage}`;
  const alternateLabel = isArabic ? 'English' : 'العربية';

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

  // Sticky navbar scroll shadow
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    });
  }

  // Mobile hamburger
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // Active nav link
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Intersection Observer: reveal animations
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach((el) => observer.observe(el));
  }

  // Counter animation
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const isDecimal = String(target).includes('.');
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = prefix + (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach((el) => counterObserver.observe(el));
  }

  // Tab switching
  const tabBtns = document.querySelectorAll('.tab-btn');
  if (tabBtns.length) {
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
        btn.classList.add('active');
        const targetEl = document.getElementById(target);
        if (targetEl) targetEl.classList.add('active');
      });
    });
  }

  // FAQ Accordion
  document.querySelectorAll('.faq-q').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // Pricing toggle
  const priceToggle = document.getElementById('priceToggle');
  if (priceToggle) {
    priceToggle.addEventListener('click', () => {
      priceToggle.classList.toggle('on');
      const isAnnual = priceToggle.classList.contains('on');
      document.getElementById('label-monthly')?.classList.toggle('active', !isAnnual);
      document.getElementById('label-annual')?.classList.toggle('active', isAnnual);
      document.querySelectorAll('[data-monthly]').forEach((el) => {
        el.textContent = isAnnual ? el.dataset.annual : el.dataset.monthly;
      });
    });
  }

  // Contact form validation + submit
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      contactForm.querySelectorAll('[required]').forEach((field) => {
        const err = document.getElementById(field.name + 'Error');
        if (!field.value.trim()) {
          field.classList.add('error');
          if (err) {
            err.textContent = messages.required;
            err.classList.add('show');
          }
          valid = false;
        } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          field.classList.add('error');
          if (err) {
            err.textContent = messages.invalidEmail;
            err.classList.add('show');
          }
          valid = false;
        } else {
          field.classList.remove('error');
          if (err) err.classList.remove('show');
        }
      });

      if (!valid) return;

      const formData = new FormData(contactForm);
      const name = `${formData.get('firstName')} ${formData.get('lastName')}`.trim();
      formData.append('name', name);

      if (!formData.get('phone')) formData.set('phone', '');
      if (!formData.get('company')) formData.set('company', '');

      const btn = contactForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = messages.sending;

      fetch('http://localhost/mail_tileswarehouse/send-email.php', {
        method: 'POST',
        body: formData
      })
        .then(async (res) => {
          const text = await res.text();
          console.log('Raw response:', text);

          let data;
          try {
            data = JSON.parse(text);
          } catch (error) {
            throw new Error(`Invalid server response: ${text || 'Empty response'}`);
          }

          if (!res.ok) {
            throw new Error(data.message || 'Request failed.');
          }

          return data;
        })
        .then((data) => {
          console.log('Response:', data);

          if (data.success) {
            btn.textContent = messages.sent;
            btn.style.background = '#0e9f6e';
            contactForm.reset();
          } else {
            btn.textContent = messages.failed;
            alert(messages.requestFailed);
          }

          setTimeout(() => {
            btn.textContent = messages.sendMessage;
            btn.style.background = '';
            btn.disabled = false;
          }, 3000);
        })
        .catch((err) => {
          console.error('Error:', err);
          alert(messages.requestFailed);
          btn.disabled = false;
          btn.textContent = messages.sendMessage;
          btn.style.background = '';
        });
    });

    contactForm.querySelectorAll('.form-control').forEach((field) => {
      field.addEventListener('input', () => {
        field.classList.remove('error');
        const err = document.getElementById(field.name + 'Error');
        if (err) err.classList.remove('show');
      });
    });
  }
});
