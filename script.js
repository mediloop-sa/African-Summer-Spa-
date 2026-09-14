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
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- generic modal ---------- */
  var modalOverlay = document.getElementById('modal-overlay');
  var modalClose = document.getElementById('modal-close');
  var modalImg = document.getElementById('modal-img');
  var modalMedia = document.getElementById('modal-media');
  var modalTitle = document.getElementById('modal-title');
  var modalRole = document.getElementById('modal-role');
  var modalDesc = document.getElementById('modal-desc');
  var modalMeta = document.getElementById('modal-meta');
  var modalCta = document.getElementById('modal-cta');

  function openModal (data) {
    if (!modalOverlay) return;
    modalTitle.textContent = data.title || '';
    modalRole.textContent = data.role || '';
    modalRole.style.display = data.role ? '' : 'none';
    modalDesc.textContent = data.desc || '';

    if (data.img) {
      modalMedia.style.display = '';
      modalMedia.classList.remove('no-photo');
      modalMedia.innerHTML = '<img id="modal-img" src="' + data.img + '" alt="' + (data.title || '') + '">';
    } else if (data.img === null) {
      modalMedia.style.display = '';
      modalMedia.classList.add('no-photo');
      modalMedia.innerHTML = '<span>Photo coming soon</span>';
    } else {
      modalMedia.style.display = 'none';
    }

    modalMeta.innerHTML = '';
    if (data.meta && data.meta.length) {
      data.meta.forEach(function (m) {
        var d = document.createElement('div');
        d.innerHTML = '<span class="m-label">' + m.label + '</span><span class="m-value">' + m.value + '</span>';
        modalMeta.appendChild(d);
      });
      modalMeta.style.display = 'flex';
    } else {
      modalMeta.style.display = 'none';
    }

    modalCta.innerHTML = '';
    if (data.ctaText && data.ctaHref) {
      var a = document.createElement('a');
      a.href = data.ctaHref;
      a.target = '_blank';
      a.rel = 'noopener';
      a.className = 'btn btn-solid';
      a.textContent = data.ctaText;
      modalCta.appendChild(a);
    }

    modalOverlay.classList.add('open');
    body.classList.add('nav-open');
  }
  function closeModal () {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    body.classList.remove('nav-open');
  }
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  /* ---------- team grid (about.html) ---------- */
  var teamGrid = document.getElementById('team-grid');
  if (teamGrid && window.staffData) {
    window.staffData.forEach(function (person) {
      var card = document.createElement('button');
      card.className = 'team-card';
      var mediaHtml = person.img
        ? '<img src="' + person.img + '" alt="' + person.name + '">'
        : '<div class="no-photo">Photo coming soon</div>';
      card.innerHTML = mediaHtml +
        '<div class="team-card-label">' +
        '<span class="tc-name">' + person.name + '</span>' +
        '<span class="tc-role">' + person.role + '</span>' +
        '<span class="tc-tap">TAP TO READ MORE</span>' +
        '</div>';
      card.addEventListener('click', function () {
        openModal({
          title: person.name,
          role: person.role,
          desc: person.bio,
          img: person.img
        });
      });
      teamGrid.appendChild(card);
    });
  }

  /* ---------- price cards (price-list.html) ---------- */
  var priceCategories = document.querySelectorAll('[data-price-category]');
  if (priceCategories.length && window.priceData) {
    priceCategories.forEach(function (container) {
      var key = container.getAttribute('data-price-category');
      var items = window.priceData[key] || [];
      items.forEach(function (item) {
        var card = document.createElement('button');
        card.className = 'price-card';
        var priceLabel = item.price ? item.price : 'Ask us for pricing';
        var durationLabel = item.duration ? item.duration : '';
        card.innerHTML =
          '<span class="pc-name">' + item.name + '</span>' +
          '<span class="pc-meta">' + (durationLabel ? durationLabel + ' &middot; ' : '') + priceLabel + '</span>' +
          '<span class="pc-tap">TAP FOR DETAILS</span>';
        card.addEventListener('click', function () {
          var meta = [];
          if (item.duration) meta.push({ label: 'Duration', value: item.duration });
          meta.push({ label: 'Price', value: priceLabel });
          openModal({
            title: item.name,
            desc: item.description || '',
            meta: meta,
            ctaText: 'Enquire on WhatsApp',
            ctaHref: 'https://wa.me/27823709845?text=' + encodeURIComponent('Hi! I\'d like to book the ' + item.name + ' treatment.')
          });
        });
        container.appendChild(card);
      });
    });
  }

  /* treatments page: category filter, if present */
  var filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var target = btn.getAttribute('data-target');
        document.querySelectorAll('.treat-group').forEach(function (group) {
          if (target === 'all' || group.id === target) {
            group.style.display = '';
          } else {
            group.style.display = 'none';
          }
        });
      });
    });
  }
});
