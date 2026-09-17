document.addEventListener('DOMContentLoaded', function () {
  var openBtn = document.querySelector('.hamburger');
  var closeBtn = document.querySelector('.nav-close');
  var overlay = document.querySelector('.nav-overlay');
  var body = document.body;

  function openNav () {
    overlay.classList.add('open');
    body.classList.add('nav-open');
  }
  function closeNav () {
    overlay.classList.remove('open');
    body.classList.remove('nav-open');
  }
  if (openBtn) openBtn.addEventListener('click', openNav);
  if (closeBtn) closeBtn.addEventListener('click', closeNav);
  if (overlay) {
    overlay.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* simple reveal-on-scroll */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);