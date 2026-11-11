const langToggle = document.getElementById('langToggle');
let currentLang = 'pt';
function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-pt][data-en]').forEach(el => {
    const value = el.dataset[lang];
    if (value !== undefined) el.innerHTML = value;
  });
  langToggle.textContent = lang === 'pt' ? 'EN' : 'PT';
}
langToggle.addEventListener('click', () => setLanguage(currentLang === 'pt' ? 'en' : 'pt'));

const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('mainNav');
menuToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('contactForm').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = encodeURIComponent('Contacto — JMima SoftwareTech');
  const body = encodeURIComponent(`Nome: ${data.get('name')}\nEmail: ${data.get('email')}\n\nMensagem:\n${data.get('message')}`);
  // The official company email has not been supplied yet.
  const recipient = ''; 
  if (!recipient) {
    const note = document.getElementById('formNote');
    note.textContent = currentLang === 'pt'
      ? 'O formulário visual está preparado, mas ainda precisamos definir o email oficial para ativar o envio.'
      : 'The form layout is ready, but the official email address must be set before sending is enabled.';
    return;
  }
  window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
});
