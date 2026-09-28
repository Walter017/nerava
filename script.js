// اسپلش
window.onload = () => {
  setTimeout(() => {
    document.getElementById('splash').classList.add('hide');
    document.getElementById('app').classList.remove('hidden');
  }, 1800);
};

// انتخاب ویدیو
function selectVideo() {
  document.getElementById('videoInput').click();
}

document.getElementById('videoInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const video = document.getElementById('videoPlayer');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.style.display = 'block';
    document.getElementById('placeholder').style.display = 'none';
  }
});

// باز کردن پنلها
function openPanel(type) {
  const panel = document.getElementById('panel');
  const title = document.getElementById('panelTitle');
  const content = document.getElementById('panelContent');

  panel.classList.remove('hidden');

  if (type === 'text') {
    title.innerText = 'متن';
    content.innerHTML = `
<input type="text" id="textInput" placeholder="متن خود را بنویسید...">
<button onclick="applyText()">اعمال متن</button>
    `;
  }

  if (type === 'effect') {
    title.innerText = 'افکت';
    content.innerHTML = `
<button onclick="applyEffect('none')">بدون افکت</button><br><br>
<button onclick="applyEffect('grayscale')">سیاه و سفید</button><br><br>
<button onclick="applyEffect('sepia')">قدیمی</button><br><br>
<button onclick="applyEffect('contrast')">کنتراست بالا</button>
    `;
  }

  if (type === 'music') {
    title.innerText = 'موزیک';
    content.innerHTML = `
<button onclick="document.getElementById('musicInput').click()">انتخاب از فایلهای خودم</button>
<br><br>
<p style="color:#aaa; margin-bottom:10px;">موسیقیهای ترند:</p>
<button>گل - شروین</button><br><br>
<button>دلم گرفت - راغب</button><br><br>
<button>دریا - علی یاسینی</button>
    `;
  }

  if (type === 'trim') {
    title.innerText = 'برش';
    content.innerHTML = `<p style="color:#aaa">قابلیت برش در نسخه بعدی اضافه میشود</p>`;
  }

  if (type === 'template') {
    title.innerText = 'قالبها';
    content.innerHTML = `
<button>دلنوشته</button><br><br>
<button>انگیزشی</button><br><br>
<button>روتین روزانه</button><br><br>
<button>معرفی محصول</button>
    `;
  }

  if (type === 'subtitle') {
    title.innerText = 'زیرنویس';
    content.innerHTML = `
<input type="text" id="subtitleInput" placeholder="کلمه یا جمله فعلی...">
<button onclick="addSubtitle()">ثبت و بعدی</button>
    `;
  }
}

function closePanel() {
  document.getElementById('panel').classList.add('hidden');
}

// اعمال متن
function applyText() {
  const text = document.getElementById('textInput').value;
  document.getElementById('textOverlay').innerText = text;
  closePanel();
}

// افکت ساده
function applyEffect(type) {
  const video = document.getElementById('videoPlayer');
  video.style.filter = '';

  if (type === 'grayscale') video.style.filter = 'grayscale(100%)';
  if (type === 'sepia') video.style.filter = 'sepia(80%)';
  if (type === 'contrast') video.style.filter = 'contrast(140%)';

  closePanel();
}

// زیرنویس
function addSubtitle() {
  const text = document.getElementById('subtitleInput').value;
  if (text) {
    document.getElementById('textOverlay').innerText = text;
    document.getElementById('subtitleInput').value = '';
  }
}

// خروجی (فعلاً پیام)
function exportVideo() {
  alert('در نسخه وب، خروجی واقعی محدود است.\nاین قابلیت در نسخه اپ کاملتر میشود.');
}
