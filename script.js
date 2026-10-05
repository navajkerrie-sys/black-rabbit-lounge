/* Black Rabbit – site behaviour.
   To use real gallery photos: in index.html replace each <svg> inside .gal buttons with
   <img src="photos/your-photo.jpg" alt="Describe the photo">, and style .gal img to fill the tile. */
(function () {
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');

  function onScroll() { nav.classList.toggle('solid', window.scrollY > 40); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  });

  /* Gallery lightbox */
  var lb = document.getElementById('lb');
  document.getElementById('gal').addEventListener('click', function (e) {
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

  /* Reservation form: validates, then opens an email draft. Change BOOKING_EMAIL. */
  var BOOKING_EMAIL = 'navajkerrie@gmail.com';
  var form = document.getElementById('rf');
  var msg = document.getElementById('msg');
  var date = form.elements.date;
  date.min = new Date().toISOString().split('T')[0];

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    ['name', 'email', 'date', 'time', 'special'].forEach(function (n) {
      var f = form.elements[n];
      var bad = !f.value || (n === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('bad', bad);
      if (bad) ok = false;
    });
    if (!ok) { msg.textContent = 'Please complete the highlighted fields.'; return; }
    var v = function (k) { return form.elements[k].value; };
    var body = 'Name: ' + v('name') + '\nEmail: ' + v('email') + '\nDate: ' + v('date') + ' at ' + v('time') +
      '\nGuests: ' + v('guests') + '\nSeating: ' + v('seat') + '\nNotes: ' + v('notes') + '\nSpecial Occasion: ' + v('special');
    var subject = encodeURIComponent('Reservation request from ' + v('name'));
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
})();
