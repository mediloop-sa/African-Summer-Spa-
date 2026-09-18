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

  /* ---------- gift voucher amount picker (index.html) ----------
     FIX: the pills previously had no click behaviour at all — the
     "active" state and the WhatsApp link never updated. This wires
     them up: clicking a pill highlights it and rewrites the
     pre-filled WhatsApp message to include the chosen amount. */
  var voucherWrap = document.getElementById('voucher-amounts');
  var voucherCta = document.getElementById('voucher-cta');
  if (voucherWrap && voucherCta) {
    var voucherPills = voucherWrap.querySelectorAll('.voucher-pill');
    voucherPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        voucherPills.forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        var amount = pill.getAttribute('data-amount');
        var message = "Hi! I'd like to purchase a gift voucher for " + amount + ".";
        voucherCta.href = 'https://wa.me/27823709845?text=' + encodeURIComponent(message);
      });
    });
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

  /* ---------- team accordion (about.html) ---------- */
  var teamAccordion = document.getElementById('team-accordion');
  if (teamAccordion) {
    var items = window.staffData || [];

    teamAccordion.innerHTML = items.map(function (m, i) {
      var bgStyle = m.img ? ' style="background-image:url(\'' + m.img + '\')"' : '';
      var cardClass = 'team-card' + (m.img ? '' : ' placeholder');
      return (
        '<div class="' + cardClass + '" data-index="' + i + '"' + bgStyle + '>' +
          '<div class="label">' + m.name + '</div>' +
          '<div class="detail">' +
            '<h3>' + m.name + '</h3>' +
            '<span class="role">' + (m.role || '') + '</span>' +
            '<p>' + (m.bio || '') + '</p>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    teamAccordion.querySelectorAll('.team-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var isOpen = card.classList.contains('expanded');
        teamAccordion.querySelectorAll('.team-card').forEach(function (c) {
          c.classList.remove('expanded');
        });
        if (!isOpen) card.classList.add('expanded');
      });
    });
  }

  /* ---------- brand list (products.html) ---------- */
  var brandList = document.getElementById('brand-list');
  if (brandList && window.brandData) {
    brandList.innerHTML = window.brandData.map(function (b, i) {
      var num = String(i + 1).padStart(2, '0');
      return (
        '<button class="brand-row" data-index="' + i + '">' +
          '<span class="br-left">' +
            '<span class="br-num">' + num + '</span>' +
            '<span class="br-name">' + b.name + '</span>' +
          '</span>' +
          '<span class="br-right">' +
            '<span class="br-cat">' + (b.category || '') + '</span>' +
            '<span class="br-arrow">→</span>' +
          '</span>' +
        '</button>'
      );
    }).join('');

    brandList.querySelectorAll('.brand-row').forEach(function (row) {
      row.addEventListener('click', function () {
        var b = window.brandData[Number(row.getAttribute('data-index'))];
        openModal({
          title: b.name,
          role: b.category,
          desc: b.description,
          img: b.img,
          ctaText: 'Book a Treatment',
          ctaHref: 'https://wa.me/27823709845?text=' + encodeURIComponent(b.whatsapp)
        });
      });
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
