(function () {
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');

  /* Header + mobile menu (home page only) */
  if (nav) {
    var onScroll = function () { nav.classList.toggle('solid', window.scrollY > 40); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* Gallery lightbox */
  var lb = document.getElementById('lb');
  var gal = document.getElementById('gal');
  if (lb && gal) {
    gal.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b || !lb.showModal) return;
      var pic = document.getElementById('lbpic');
      var cs = getComputedStyle(b);
      pic.style.background = cs.backgroundImage !== 'none' ? cs.backgroundImage : cs.backgroundColor;
      var media = b.querySelector('svg, img');
      pic.innerHTML = media ? media.outerHTML : '';
      document.getElementById('lbcap').textContent = b.dataset.cap || '';
      lb.showModal();
    });
    document.getElementById('lbx').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  }

  /* Reservation form: validates (including consent), then opens an email draft. Change BOOKING_EMAIL. */
  var BOOKING_EMAIL = 'navajkerrie@gmail.com';
  var form = document.getElementById('rf');
  var msg = document.getElementById('msg');
  if (form && msg) {
    var date = form.elements.date;
    var consent = form.elements.consent;
    date.min = new Date().toISOString().split('T')[0];

    consent.addEventListener('change', function () {
      if (consent.checked) { consent.classList.remove('bad'); msg.textContent = ''; }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      ['name', 'email', 'date', 'time'].forEach(function (n) {
        var f = form.elements[n];
        var bad = !f.value || (n === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
        f.classList.toggle('bad', bad);
        if (bad) ok = false;
      });

      /* Consent is required before anything is sent */
      var consentMissing = !consent.checked;
      consent.classList.toggle('bad', consentMissing);

      if (!ok && consentMissing) { msg.textContent = 'Please complete the highlighted fields and tick the consent box.'; return; }
      if (!ok) { msg.textContent = 'Please complete the highlighted fields.'; return; }
      if (consentMissing) { msg.textContent = 'Please tick the consent box so we can process your request.'; consent.focus(); return; }

      var v = function (k) { return form.elements[k].value; };
      var subject = encodeURIComponent('Reservation request from ' + v('name'));
      var body =
      'Reservation Details:\r\n'+
      'Name: ' + v('name') + '\r\n' +
      'Email: ' + v('email') + '\r\n' +
      'Date: ' + v('date') + '\r\n' +
      'Time: ' + v('time') + '\r\n' +
      'Guests: ' + v('guests') + '\r\n' +
      'Seating: ' + v('seat') + '\r\n' +
      'Special Occasion: ' + v('special') + '\r\n' +
      'Notes: ' + v('notes') + '\r\n\r\n' +
      'Consent: Agreed to the Privacy Policy, Terms and Booking & Refund Policy\r\n' +
      'Marketing updates: ' + (form.elements.marketing.checked ? 'Yes' : 'No');
      var bodyEnc = encodeURIComponent(body);
      var mailtoLink = 'mailto:' + BOOKING_EMAIL + '?subject=' + subject + '&body=' + bodyEnc;
      var gmailWebLink = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + BOOKING_EMAIL + '&su=' + subject + '&body=' + bodyEnc;
      if(/Android|iOS|iPadOS/i.test(navigator.userAgent)) {
        window.location.href = mailtoLink;
        msg.textContent = 'Opening Gmail...';
      } else {
        window.open(gmailWebLink, '_blank');
        msg.textContent = 'Opening Gmail...';
      }
    });
  }

  /* ---------- Cookie consent (accept / reject) ---------- */
  var CONSENT_KEY = 'br_cookie_consent';
  var CONSENT_DAYS = 180;

  function getConsent() {
    try {
      var d = JSON.parse(localStorage.getItem(CONSENT_KEY));
      if (!d || !d.choice) return null;
      if (Date.now() - d.time > CONSENT_DAYS * 864e5) return null; /* ask again after 180 days */
      return d.choice;
    } catch (e) { return null; }
  }
  function setConsent(choice) {
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice: choice, time: Date.now() })); } catch (e) {}
  }
  /* Other scripts check this before running optional tracking */
  window.brConsent = { get: getConsent, allowed: function () { return getConsent() === 'accepted'; } };

  var banner = null;
  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('show');
    var b = banner; banner = null;
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 400);
  }
  function showBanner(focusIt) {
    if (banner) return;
    banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<strong class="cookie-title">Cookies, kept simple</strong>' +
      '<p>We use one optional tool to see which parts of our site bring enquiries. Accept to allow it, or reject and we will only use what the site needs. Details are in our <a href="cookies.html">Cookie Policy</a>.</p>' +
      '<div class="cookie-actions">' +
      '<button type="button" class="btn sm" data-choice="accepted">Accept</button>' +
      '<button type="button" class="btn sm ghost" data-choice="rejected">Reject</button>' +
      '</div>';
    banner.addEventListener('click', function (e) {
      var c = e.target.getAttribute && e.target.getAttribute('data-choice');
      if (c) { setConsent(c); hideBanner(); }
    });
    document.body.appendChild(banner);
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (banner) banner.classList.add('show'); }); });
    if (focusIt) banner.querySelector('button').focus({ preventScroll: true });
  }

  if (!getConsent()) setTimeout(function () { showBanner(false); }, 700);
  var settings = document.getElementById('cookie-settings');
  if (settings) settings.addEventListener('click', function (e) { e.preventDefault(); showBanner(true); });
})();