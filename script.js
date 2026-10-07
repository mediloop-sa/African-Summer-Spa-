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

  /* ---------- gift voucher dossier (index.html) ----------
     Pick an amount -> the form panel opens. On submit, the details are
     validated and sent to the spa as a pre-filled WhatsApp message. */
  var voucherWrap = document.getElementById('voucher-amounts');
  var dossier = document.getElementById('voucher-dossier');
  var vForm = document.getElementById('voucher-form');
  if (voucherWrap && dossier && vForm) {
    var vPills = voucherWrap.querySelectorAll('.voucher-pill');
    var vAmount = document.getElementById('vf-amount');
    var vNote = document.getElementById('vf-physical-note');
    var vError = document.getElementById('vf-error');
    var vClose = document.getElementById('voucher-close');
    var vField = function (id) { return document.getElementById(id); };

    function openDossier () {
      dossier.classList.add('open');
      dossier.setAttribute('aria-hidden', 'false');
    }
    function closeDossier () {
      dossier.classList.remove('open');
      dossier.setAttribute('aria-hidden', 'true');
      vPills.forEach(function (p) { p.classList.remove('active'); });
    }

    vPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        vPills.forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        var amt = pill.getAttribute('data-amount');
        var wasOpen = dossier.classList.contains('open');
        if (amt === 'custom') {
          vAmount.value = '';
        } else {
          vAmount.value = amt;
        }
        openDossier();
        if (amt === 'custom') {
          setTimeout(function () { vAmount.focus(); }, wasOpen ? 0 : 600);
        } else if (!wasOpen) {
          setTimeout(function () {
            dossier.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 300);
        }
      });
    });
    if (vClose) vClose.addEventListener('click', closeDossier);

    /* keep the pills in sync if the amount is typed by hand */
    vAmount.addEventListener('input', function () {
      var typed = vAmount.value.replace(/\s/g, '').toUpperCase();
      vPills.forEach(function (p) {
        var a = (p.getAttribute('data-amount') || '').replace(/\s/g, '').toUpperCase();
        p.classList.toggle('active', a === typed || (a === 'CUSTOM' && typed !== '' && ['R500','R1000','R1500'].indexOf(typed) === -1));
      });
    });

    /* clear red error state as the visitor fixes a field */
    vForm.querySelectorAll('input, textarea').forEach(function (el) {
      el.addEventListener('input', function () { el.classList.remove('invalid'); });
    });

    /* physical voucher note */
    vForm.querySelectorAll('input[name="vtype"]').forEach(function (r) {
      r.addEventListener('change', function () {
        var physical = vForm.querySelector('input[name="vtype"]:checked').value === 'Physical';
        vNote.hidden = !physical;
      });
    });

    vForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = {
        amount: vAmount.value.trim(),
        email: vField('vf-email').value.trim(),
        phone: vField('vf-phone').value.trim(),
        from: vField('vf-from').value.trim(),
        to: vField('vf-to').value.trim(),
        message: vField('vf-message').value.trim(),
        type: vForm.querySelector('input[name="vtype"]:checked').value
      };

      ['vf-amount','vf-email','vf-phone','vf-from','vf-to'].forEach(function (id) {
        vField(id).classList.remove('invalid');
      });
      var problems = [];
      var amountDigits = f.amount.replace(/[^0-9]/g, '');
      if (!amountDigits || Number(amountDigits) < 1) problems.push(['vf-amount', 'a voucher amount']);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) problems.push(['vf-email', 'a valid email address']);
      if (f.phone.replace(/[^0-9]/g, '').length < 9) problems.push(['vf-phone', 'a phone / WhatsApp number']);
      if (!f.from) problems.push(['vf-from', 'who the voucher is from']);
      if (!f.to) problems.push(['vf-to', 'who the voucher is for']);

      if (problems.length) {
        problems.forEach(function (p) { vField(p[0]).classList.add('invalid'); });
        vError.textContent = 'Please add ' + problems.map(function (p) { return p[1]; }).join(', ').replace(/, ([^,]*)$/, ' and $1') + '.';
        vError.hidden = false;
        vField(problems[0][0]).focus();
        return;
      }
      vError.hidden = true;

      var amountLabel = /^\s*R/i.test(f.amount) ? f.amount : 'R' + f.amount;
      var lines = [
        'Hi African Summer Spa! I would like to purchase a gift voucher.',
        '',
        '*Voucher type:* ' + f.type + (f.type === 'Physical' ? ' (I will collect it at the spa)' : ''),
        '*Amount:* ' + amountLabel,
        '*From:* ' + f.from,
        '*To:* ' + f.to,
        '*Message:* ' + (f.message || '(none)'),
        '',
        '*My email:* ' + f.email,
        '*My phone / WhatsApp:* ' + f.phone
      ];
      var url = 'https://wa.me/27823709845?text=' + encodeURIComponent(lines.join('\n'));
      var win = window.open(url, '_blank', 'noopener');
      if (!win) window.location.href = url;
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

  /* ---------- brand lists (products.html) ----------
     CHANGED: brands now render into separate group containers
     (Face / Body) instead of one flat list. Each brand's "group"
     field ("face" or "body") decides which list it lands in. */
  function renderBrandGroup (containerId, groupKey) {
    var container = document.getElementById(containerId);
    if (!container || !window.brandData) return;

    var items = window.brandData.filter(function (b) {
      return b.group === groupKey;
    });

    container.innerHTML = items.map(function (b, i) {
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

    container.querySelectorAll('.brand-row').forEach(function (row) {
      row.addEventListener('click', function () {
        var b = items[Number(row.getAttribute('data-index'))];
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
  renderBrandGroup('brand-list-face', 'face');
  renderBrandGroup('brand-list-body', 'body');

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
