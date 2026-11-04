const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-navigation');
const navigationLinks = [...navigation.querySelectorAll('a')];

function setMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
}

menuToggle.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});

navigationLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 760) setMenu(false);
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealElements = document.querySelectorAll('[data-reveal]');

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  revealElements.forEach((element) => revealObserver.observe(element));
}

const observedSections = [...document.querySelectorAll('main section[id]')];
if ('IntersectionObserver' in window) {
  const navigationObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navigationLinks.forEach((link) => {
        const active = link.hash === `#${visible.target.id}`;
        if (active) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    },
    { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.2, 0.6] }
  );
  observedSections.forEach((section) => navigationObserver.observe(section));
}

document.querySelector('#current-year').textContent = new Date().getFullYear();

const CONTACT_ENDPOINT = 'https://api.web3forms.com/submit';
const CONTACT_ACCESS_KEY = '4a8c9e6c-e42d-41fd-9467-3e5f2599245c';
const form = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formStatus.textContent = '';

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const formData = Object.fromEntries(new FormData(form).entries());
  const payload = {
    ...formData,
    access_key: CONTACT_ACCESS_KEY,
    subject: 'SNS・Webメディア ポートフォリオからのお問い合わせ',
    from_name: 'SNS・Webメディア ポートフォリオ'
  };

  submitButton.disabled = true;
  formStatus.textContent = '送信しています。';

  try {
    const response = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error('Form submission failed');
    form.reset();
    formStatus.textContent = '送信を受け付けました。ありがとうございます。';
  } catch {
    formStatus.textContent = '送信できませんでした。時間をおいて再度お試しください。';
  } finally {
    submitButton.disabled = false;
  }
});
