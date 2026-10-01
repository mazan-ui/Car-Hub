// Car Hub - main script (made by Mazan)
const body = document.body;
let whatsappNumber = '923104959769';

/* ---------------- helpers ---------------- */
function formatPrice(n) {
  return 'Rs ' + Number(n).toLocaleString('en-IN');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text == null ? '' : String(text);
  return div.innerHTML.replace(/"/g, '&quot;');
}

function waLink(message) {
  return 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(message);
}

/* ---------------- intro animation ---------------- */
function runIntro() {
  const intro = document.getElementById('intro');
  const man = document.getElementById('man');
  const text = document.getElementById('introText');
  const glassTool = document.getElementById('glassTool');
  const checklist = document.getElementById('checklist');
  const ticks = document.querySelectorAll('.tick');
  const rating = document.getElementById('rating');
  const ratingNum = document.getElementById('ratingNum');
  const brand = document.getElementById('introBrand');
  const headlight = document.getElementById('headlight');
  const beam = document.getElementById('beamLight');

  const timers = [];
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    intro.classList.add('hide');
    body.classList.remove('loading');
    setTimeout(() => intro.remove(), 1000);
  }

  document.getElementById('skipIntro').addEventListener('click', finish);

  // step 1: inspector walks in towards the back of the car
  at(300, () => {
    man.classList.add('walking');
    man.style.transform = 'translate(290px, 372px)';
  });

  // step 2: he stops and checks body and paint
  at(3400, () => {
    man.classList.remove('walking');
    man.classList.add('checking');
    glassTool.setAttribute('opacity', '1');
    checklist.classList.add('show');
    text.textContent = 'Checking body and paint...';
  });
  at(3900, () => ticks[0].classList.add('on'));
  at(4600, () => {
    ticks[1].classList.add('on');
    text.textContent = 'Now walking to the front...';
    man.classList.remove('checking');
    glassTool.setAttribute('opacity', '0');
    man.classList.add('walking');
    man.style.transitionDuration = '2.4s';
    man.style.transform = 'translate(560px, 372px)';
  });

  // step 3: front of the car, headlights, interior and comfort
  at(7000, () => {
    man.classList.remove('walking');
    man.classList.add('checking');
    glassTool.setAttribute('opacity', '1');
    headlight.classList.add('on');
    beam.setAttribute('opacity', '1');
    text.textContent = 'Checking engine and interior...';
  });
  at(7500, () => ticks[2].classList.add('on'));
  at(8200, () => ticks[3].classList.add('on'));

  // step 4: final rating
  at(8900, () => {
    man.classList.remove('checking');
    text.textContent = 'Inspection complete';
    rating.classList.add('show');
    let n = 0;
    const counter = setInterval(() => {
      n += 4;
      if (n >= 100) { n = 100; clearInterval(counter); }
      ratingNum.textContent = n;
    }, 30);
  });
  at(10300, () => brand.classList.add('show'));
  at(11800, finish);
}

/* ---------------- cars ---------------- */
const grid = document.getElementById('carGrid');
const emptyMsg = document.getElementById('emptyMsg');

function carCard(car) {
  const msg = 'Assalam o Alaikum, mujhe ' + car.name + ' ke baare mein maloomat chahiye. Price: ' + formatPrice(car.price);
  return `
    <article class="card hidden">
      <div class="pic"><img src="${escapeHtml(car.image)}" alt="${escapeHtml(car.name)}" loading="lazy"></div>
      <div class="card-body">
        <h3>${escapeHtml(car.name)}</h3>
        <p class="desc">${escapeHtml(car.description)}</p>
        <div class="specs">
          ${car.engine ? `<span>${escapeHtml(car.engine)}</span>` : ''}
          ${car.transmission ? `<span>${escapeHtml(car.transmission)}</span>` : ''}
          ${car.fuel ? `<span>${escapeHtml(car.fuel)}</span>` : ''}
          ${car.mileage ? `<span>${escapeHtml(car.mileage)}</span>` : ''}
        </div>
        <div class="price">${formatPrice(car.price)}</div>
        <div class="price-sub">${escapeHtml(car.priceNote)}</div>
        <a class="wa-btn" href="${waLink(msg)}" target="_blank" rel="noopener">Order / Poochein on WhatsApp</a>
      </div>
    </article>`;
}

const revealer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

async function loadCars(search = '') {
  try {
    const res = await fetch('/api/cars' + (search ? '?search=' + encodeURIComponent(search) : ''));
    if (!res.ok) throw new Error('bad response');
    const cars = await res.json();
    grid.innerHTML = cars.map(carCard).join('');
    emptyMsg.hidden = cars.length > 0;
    grid.querySelectorAll('.card').forEach((c) => revealer.observe(c));
  } catch (err) {
    grid.innerHTML = '';
    emptyMsg.textContent = 'Gariyan load nahi ho sakin. Page dobara refresh karein.';
    emptyMsg.hidden = false;
  }
}

let searchTimer;
document.getElementById('search').addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadCars(e.target.value), 300);
});

/* ---------------- config (numbers come from the backend) ---------------- */
async function loadConfig() {
  try {
    const res = await fetch('/api/config');
    const cfg = await res.json();
    whatsappNumber = cfg.whatsapp;
    const phone = document.getElementById('phoneLink');
    phone.textContent = cfg.phone;
    phone.href = 'tel:' + cfg.phone;
  } catch (err) {
    console.log('Using default contact numbers');
  }
  const hello = 'Assalam o Alaikum, mujhe Car Hub ki gariyon ke baare mein poochna hai.';
  ['logoWhatsapp', 'heroWhatsapp', 'contactWhatsapp'].forEach((id) => {
    document.getElementById(id).href = waLink(hello);
  });
}

/* ---------------- small things ---------------- */
function startCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const watcher = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const end = Number(el.dataset.count);
      let value = 0;
      const step = Math.max(1, Math.round(end / 40));
      const t = setInterval(() => {
        value = Math.min(end, value + step);
        el.textContent = value;
        if (value >= end) clearInterval(t);
      }, 35);
      watcher.unobserve(el);
    });
  });
  counters.forEach((c) => watcher.observe(c));
}

const nav = document.getElementById('nav');
document.getElementById('menuBtn').addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => nav.classList.remove('open')));
document.getElementById('year').textContent = new Date().getFullYear();

loadConfig().then(() => loadCars());
startCounters();
runIntro();
