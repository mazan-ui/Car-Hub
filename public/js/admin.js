// Car Hub - admin panel script (made by Mazan)
const loginView = document.getElementById('loginView');
const dashView = document.getElementById('dashView');
const formBox = document.getElementById('formBox');
const list = document.getElementById('list');
const preview = document.getElementById('preview');
const fields = ['name', 'brand', 'price', 'priceNote', 'description', 'engine', 'transmission', 'fuel', 'mileage'];

let token = sessionStorage.getItem('carhubToken');
let cars = [];
let imageData = ''; // base64 picture when a file is chosen

function esc(text) {
  const d = document.createElement('div');
  d.textContent = text == null ? '' : String(text);
  return d.innerHTML.replace(/"/g, '&quot;');
}

async function api(url, method = 'GET', data) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: data ? JSON.stringify(data) : undefined
  });
  const json = await res.json().catch(() => ({}));
  if (res.status === 401 && token) logout();
  if (!res.ok) throw new Error(json.message || 'Something went wrong');
  return json;
}

function showDashboard() {
  loginView.hidden = true;
  dashView.hidden = false;
  loadCars();
}

function logout() {
  sessionStorage.removeItem('carhubToken');
  token = null;
  dashView.hidden = true;
  loginView.hidden = false;
}

/* ---------- login ---------- */
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('loginMsg');
  msg.textContent = '';
  try {
    const data = await api('/api/admin/login', 'POST', {
      username: document.getElementById('username').value.trim(),
      password: document.getElementById('password').value
    });
    token = data.token;
    sessionStorage.setItem('carhubToken', token);
    showDashboard();
  } catch (err) {
    msg.textContent = err.message;
  }
});
document.getElementById('logoutBtn').addEventListener('click', logout);

/* ---------- list ---------- */
async function loadCars() {
  cars = await api('/api/cars');
  if (!cars.length) {
    list.innerHTML = '<p style="color:var(--steel)">Abhi koi gari nahi hai. "Add new car" dabayein.</p>';
    return;
  }
  list.innerHTML = cars.map((c) => `
    <div class="row">
      <img src="${esc(c.image)}" alt="${esc(c.name)}">
      <div><h3>${esc(c.name)}</h3><p>Rs ${Number(c.price).toLocaleString('en-IN')}</p></div>
      <div class="acts">
        <button class="b-alt" data-edit="${c._id}" type="button">Edit</button>
        <button class="b-del" data-del="${c._id}" type="button">Delete</button>
      </div>
    </div>`).join('');
}

list.addEventListener('click', async (e) => {
  const editId = e.target.dataset.edit;
  const delId = e.target.dataset.del;
  if (editId) openForm(cars.find((c) => c._id === editId));
  if (delId && confirm('Is gari ko delete karna hai?')) {
    try { await api('/api/cars/' + delId, 'DELETE'); loadCars(); } catch (err) { alert(err.message); }
  }
});

/* ---------- form ---------- */
function openForm(car) {
  document.getElementById('formTitle').textContent = car ? 'Edit car' : 'Add car';
  document.getElementById('carId').value = car ? car._id : '';
  fields.forEach((f) => { document.getElementById(f).value = car ? car[f] : (f === 'fuel' ? 'Petrol' : ''); });
  document.getElementById('imageUrl').value = car && !car.image.startsWith('data:') ? car.image : '';
  document.getElementById('imageFile').value = '';
  imageData = car && car.image.startsWith('data:') ? car.image : '';
  preview.hidden = !car;
  if (car) preview.src = car.image;
  document.getElementById('formMsg').textContent = '';
  formBox.style.display = 'block';
  formBox.scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('addBtn').addEventListener('click', () => openForm(null));
document.getElementById('cancelBtn').addEventListener('click', () => { formBox.style.display = 'none'; });

// shrink the picture before saving so the database stays light
document.getElementById('imageFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 900 / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      imageData = canvas.toDataURL('image/jpeg', 0.8);
      preview.src = imageData;
      preview.hidden = false;
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

document.getElementById('carForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('formMsg');
  msg.className = 'msg';
  const data = {};
  fields.forEach((f) => { data[f] = document.getElementById(f).value.trim(); });
  data.price = Number(data.price);
  data.image = imageData || document.getElementById('imageUrl').value.trim();

  if (!data.image) {
    msg.className = 'msg err';
    msg.textContent = 'Please upload a picture or paste an image link.';
    return;
  }

  const id = document.getElementById('carId').value;
  try {
    await api(id ? '/api/cars/' + id : '/api/cars', id ? 'PUT' : 'POST', data);
    msg.className = 'msg ok';
    msg.textContent = 'Saved';
    await loadCars();
    setTimeout(() => { formBox.style.display = 'none'; }, 600);
  } catch (err) {
    msg.className = 'msg err';
    msg.textContent = err.message;
  }
});

if (token) showDashboard();
