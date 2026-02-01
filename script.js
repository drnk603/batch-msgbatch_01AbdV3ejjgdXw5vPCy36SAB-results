(function() {
  'use strict';

  const CONFIG = {
    headerHeight: 72,
    scrollOffset: 20,
    formSubmitDelay: 800,
    countUpDuration: 2000,
    scrollSpyOffset: 100
  };

  const REGEX = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[+\d\s()-]{10,20}$/,
    name: /^[a-zA-ZÀ-ÿ\s-']{2,50}$/,
    message: /^.{10,}$/
  };

  class BurgerMenu {
    constructor() {
      this.toggler = document.querySelector('.navbar-toggler');
      this.collapse = document.querySelector('.navbar-collapse');
      this.navLinks = document.querySelectorAll('.nav-link');
      
      if (this.toggler && this.collapse) {
        this.init();
      }
    }

    init() {
      this.toggler.addEventListener('click', () => this.toggle());
      
      this.navLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (window.innerWidth < 768) {
            this.close();
          }
        });
      });

      document.addEventListener('click', (e) => {
        if (window.innerWidth < 768 && 
            this.collapse.classList.contains('show') &&
            !this.collapse.contains(e.target) && 
            !this.toggler.contains(e.target)) {
          this.close();
        }
      });
    }

    toggle() {
      const isOpen = this.collapse.classList.contains('show');
      isOpen ? this.close() : this.open();
    }

    open() {
      this.collapse.classList.add('show');
      this.toggler.setAttribute('aria-expanded', 'true');
      document.body.classList.add('u-no-scroll');
    }

    close() {
      this.collapse.classList.remove('show');
      this.toggler.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('u-no-scroll');
    }
  }

  class ScrollSpy {
    constructor() {
      this.sections = document.querySelectorAll('section[id]');
      this.navLinks = document.querySelectorAll('.nav-link[href^="#"]');
      
      if (this.sections.length && this.navLinks.length) {
        this.init();
      }
    }

    init() {
      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
      this.onScroll();
    }

    onScroll() {
      const scrollPos = window.scrollY + CONFIG.scrollSpyOffset;

      this.sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
          this.setActive(id);
        }
      });
    }

    setActive(id) {
      this.navLinks.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      });
    }
  }

  class SmoothScroll {
    constructor() {
      this.links = document.querySelectorAll('a[href^="#"]');
      if (this.links.length) {
        this.init();
      }
    }

    init() {
      this.links.forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href === '#' || href === '') return;

          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            const offsetTop = target.offsetTop - CONFIG.headerHeight;
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });
          }
        });
      });
    }
  }

  class ScrollToTop {
    constructor() {
      this.button = document.querySelector('[data-scroll-top]');
      
      if (this.button) {
        this.init();
      }
    }

    init() {
      window.addEventListener('scroll', () => this.toggleVisibility(), { passive: true });
      this.button.addEventListener('click', () => this.scrollToTop());
    }

    toggleVisibility() {
      if (window.scrollY > 300) {
        this.button.classList.add('visible');
      } else {
        this.button.classList.remove('visible');
      }
    }

    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  class FormValidator {
    constructor(formId) {
      this.form = document.getElementById(formId);
      
      if (!this.form) return;

      this.submitButton = this.form.querySelector('button[type="submit"]');
      this.fields = {
        firstName: this.form.querySelector('#firstName'),
        lastName: this.form.querySelector('#lastName'),
        email: this.form.querySelector('#email'),
        phone: this.form.querySelector('#phone'),
        subject: this.form.querySelector('#subject'),
        message: this.form.querySelector('#message'),
        privacyConsent: this.form.querySelector('#privacyConsent')
      };

      this.init();
    }

    init() {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
      
      Object.values(this.fields).forEach(field => {
        if (field) {
          field.addEventListener('blur', () => this.validateField(field));
          field.addEventListener('input', () => this.clearError(field));
        }
      });
    }

    handleSubmit(e) {
      e.preventDefault();
      
      this.form.classList.add('was-validated');
      
      const isValid = this.validateAll();

      if (isValid) {
        this.submitForm();
      } else {
        this.showNotification('Prosím, opravte chyby vo formulári', 'error');
      }
    }

    validateAll() {
      let isValid = true;

      if (this.fields.firstName && !this.validateName(this.fields.firstName)) {
        isValid = false;
      }

      if (this.fields.lastName && !this.validateName(this.fields.lastName)) {
        isValid = false;
      }

      if (this.fields.email && !this.validateEmail(this.fields.email)) {
        isValid = false;
      }

      if (this.fields.phone && this.fields.phone.value && !this.validatePhone(this.fields.phone)) {
        isValid = false;
      }

      if (this.fields.subject && !this.validateRequired(this.fields.subject)) {
        isValid = false;
      }

      if (this.fields.message && !this.validateMessage(this.fields.message)) {
        isValid = false;
      }

      if (this.fields.privacyConsent && !this.fields.privacyConsent.checked) {
        this.showError(this.fields.privacyConsent, 'Musíte súhlasiť so spracovaním údajov');
        isValid = false;
      }

      return isValid;
    }

    validateField(field) {
      const fieldName = field.getAttribute('name');

      switch(fieldName) {
        case 'firstName':
        case 'lastName':
          return this.validateName(field);
        case 'email':
          return this.validateEmail(field);
        case 'phone':
          return field.value ? this.validatePhone(field) : true;
        case 'subject':
          return this.validateRequired(field);
        case 'message':
          return this.validateMessage(field);
        case 'privacyConsent':
          return field.checked;
        default:
          return true;
      }
    }

    validateName(field) {
      const value = field.value.trim();
      
      if (!value) {
        this.showError(field, 'Toto pole je povinné');
        return false;
      }

      if (!REGEX.name.test(value)) {
        this.showError(field, 'Zadajte platné meno (2-50 znakov)');
        return false;
      }

      this.clearError(field);
      return true;
    }

    validateEmail(field) {
      const value = field.value.trim();

      if (!value) {
        this.showError(field, 'E-mail je povinný');
        return false;
      }

      if (!REGEX.email.test(value)) {
        this.showError(field, 'Zadajte platnú e-mailovú adresu');
        return false;
      }

      this.clearError(field);
      return true;
    }

    validatePhone(field) {
      const value = field.value.trim();

      if (!REGEX.phone.test(value)) {
        this.showError(field, 'Zadajte platné telefónne číslo');
        return false;
      }

      this.clearError(field);
      return true;
    }

    validateRequired(field) {
      const value = field.value.trim();

      if (!value) {
        this.showError(field, 'Toto pole je povinné');
        return false;
      }

      this.clearError(field);
      return true;
    }

    validateMessage(field) {
      const value = field.value.trim();

      if (!value) {
        this.showError(field, 'Správa je povinná');
        return false;
      }

      if (!REGEX.message.test(value)) {
        this.showError(field, 'Správa musí obsahovať aspoň 10 znakov');
        return false;
      }

      this.clearError(field);
      return true;
    }

    showError(field, message) {
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');

      let feedback = field.parentElement.querySelector('.invalid-feedback');
      
      if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        field.parentElement.appendChild(feedback);
      }

      feedback.textContent = message;
    }

    clearError(field) {
      field.classList.remove('is-invalid');
      
      if (field.value.trim()) {
        field.classList.add('is-valid');
      } else {
        field.classList.remove('is-valid');
      }

      const feedback = field.parentElement.querySelector('.invalid-feedback');
      if (feedback) {
        feedback.textContent = '';
      }
    }

    submitForm() {
      this.disableSubmit();

      setTimeout(() => {
        if (navigator.onLine) {
          window.location.href = 'thank_you.html';
        } else {
          this.showNotification('Chyba spojenia, skúste neskôr', 'error');
          this.enableSubmit();
        }
      }, CONFIG.formSubmitDelay);
    }

    disableSubmit() {
      if (this.submitButton) {
        this.submitButton.disabled = true;
        this.submitButton.textContent = 'Odosielam...';
      }
    }

    enableSubmit() {
      if (this.submitButton) {
        this.submitButton.disabled = false;
        this.submitButton.textContent = 'Odoslať správu';
      }
    }

    showNotification(message, type) {
      const notification = document.createElement('div');
      notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'}`;
      notification.textContent = message;
      notification.style.position = 'fixed';
      notification.style.top = '100px';
      notification.style.right = '20px';
      notification.style.zIndex = '9999';
      notification.style.minWidth = '300px';

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.remove();
      }, 4000);
    }
  }

  class CountUp {
    constructor() {
      this.counters = document.querySelectorAll('[data-count]');
      this.animated = new Set();

      if (this.counters.length) {
        this.init();
      }
    }

    init() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.animated.has(entry.target)) {
            this.animate(entry.target);
            this.animated.add(entry.target);
          }
        });
      }, { threshold: 0.5 });

      this.counters.forEach(counter => observer.observe(counter));
    }

    animate(element) {
      const target = parseInt(element.getAttribute('data-count'), 10);
      const duration = CONFIG.countUpDuration;
      const step = target / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += step;
        
        if (current >= target) {
          element.textContent = target.toLocaleString('sk-SK');
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(current).toLocaleString('sk-SK');
        }
      }, 16);
    }
  }

  class Modal {
    constructor() {
      this.triggers = document.querySelectorAll('[data-modal]');
      this.overlay = null;
      this.activeModal = null;

      if (this.triggers.length) {
        this.init();
      }
    }

    init() {
      this.triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          const modalId = trigger.getAttribute('data-modal');
          this.open(modalId);
        });
      });
    }

    open(modalId) {
      const modal = document.getElementById(modalId);
      if (!modal) return;

      this.createOverlay();
      this.activeModal = modal;
      
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('u-no-scroll');

      const closeBtn = modal.querySelector('[data-modal-close]');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.close());
      }
    }

    close() {
      if (this.activeModal) {
        this.activeModal.classList.remove('show');
        this.activeModal.setAttribute('aria-hidden', 'true');
        this.activeModal = null;
      }

      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
      }

      document.body.classList.remove('u-no-scroll');
    }

    createOverlay() {
      this.overlay = document.createElement('div');
      this.overlay.className = 'modal-overlay';
      this.overlay.style.position = 'fixed';
      this.overlay.style.top = '0';
      this.overlay.style.left = '0';
      this.overlay.style.right = '0';
      this.overlay.style.bottom = '0';
      this.overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      this.overlay.style.zIndex = '1000';
      
      this.overlay.addEventListener('click', () => this.close());
      
      document.body.appendChild(this.overlay);
    }
  }

  class Accordion {
    constructor() {
      this.buttons = document.querySelectorAll('.accordion-button');
      
      if (this.buttons.length) {
        this.init();
      }
    }

    init() {
      this.buttons.forEach(button => {
        button.addEventListener('click', () => this.toggle(button));
      });
    }

    toggle(button) {
      const targetId = button.getAttribute('data-bs-target');
      const target = document.querySelector(targetId);
      
      if (!target) return;

      const isExpanded = button.getAttribute('aria-expanded') === 'true';

      if (isExpanded) {
        this.close(button, target);
      } else {
        const parent = button.closest('.accordion');
        if (parent) {
          const openButtons = parent.querySelectorAll('.accordion-button:not(.collapsed)');
          openButtons.forEach(openButton => {
            if (openButton !== button) {
              const openTargetId = openButton.getAttribute('data-bs-target');
              const openTarget = document.querySelector(openTargetId);
              this.close(openButton, openTarget);
            }
          });
        }
        
        this.open(button, target);
      }
    }

    open(button, target) {
      button.classList.remove('collapsed');
      button.setAttribute('aria-expanded', 'true');
      target.classList.add('show');
    }

    close(button, target) {
      button.classList.add('collapsed');
      button.setAttribute('aria-expanded', 'false');
      target.classList.remove('show');
    }
  }

  function init() {
    new BurgerMenu();
    new ScrollSpy();
    new SmoothScroll();
    new ScrollToTop();
    new FormValidator('contactForm');
    new CountUp();
    new Modal();
    new Accordion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();