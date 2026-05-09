const canvas = document.getElementById("heroCanvas");
const ctx = canvas.getContext("2d");
const clockElement = document.getElementById("clock");
const periodElement = document.getElementById("period");
const dateElement = document.getElementById("dateText");
const prayerListElement = document.getElementById("prayerList");
const nextPrayerElement = document.getElementById("nextPrayer");
const prayerNoteElement = document.getElementById("prayerNote");
const refreshPrayerButton = document.getElementById("refreshPrayer");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.querySelector(".theme-icon");
const themeText = document.querySelector(".theme-text");
const azkarGrid = document.getElementById("azkarGrid");
const azkarButtons = document.querySelectorAll("[data-azkar]");
let width = 0;
let height = 0;
let nodes = [];
let prayerTimes = [];

const fallbackPrayerTimes = {
  Fajr: "04:30",
  Sunrise: "06:05",
  Dhuhr: "12:50",
  Asr: "16:25",
  Maghrib: "19:35",
  Isha: "21:05",
};

const prayerLabels = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

const azkar = {
  morning: [
    {
      title: "آية الكرسي",
      text: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...",
      count: "مرة واحدة",
    },
    {
      title: "سيد الاستغفار",
      text: "اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت.",
      count: "مرة واحدة",
    },
    {
      title: "الحفظ والبركة",
      text: "بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم.",
      count: "ثلاث مرات",
    },
  ],
  evening: [
    {
      title: "المعوذات",
      text: "قل هو الله أحد، قل أعوذ برب الفلق، قل أعوذ برب الناس.",
      count: "ثلاث مرات",
    },
    {
      title: "الرضا بالله",
      text: "رضيت بالله ربا، وبالإسلام دينا، وبمحمد صلى الله عليه وسلم نبيا.",
      count: "ثلاث مرات",
    },
    {
      title: "كفاية اليوم",
      text: "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم.",
      count: "سبع مرات",
    },
  ],
};

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.max(30, Math.floor(width / 34));
  nodes = Array.from({ length: count }, (_, index) => ({
    x: (index / count) * width + Math.random() * 40,
    y: Math.random() * height,
    r: 1.5 + Math.random() * 3.3,
    speed: 0.14 + Math.random() * 0.32,
    phase: Math.random() * Math.PI * 2,
  }));
}

function drawCanvas(time) {
  ctx.clearRect(0, 0, width, height);

  const isDark = document.body.classList.contains("dark");
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, isDark ? "rgba(53, 201, 182, 0.18)" : "rgba(15, 118, 110, 0.18)");
  gradient.addColorStop(0.5, isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.22)");
  gradient.addColorStop(1, isDark ? "rgba(240, 139, 79, 0.18)" : "rgba(209, 106, 50, 0.16)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < nodes.length; i += 1) {
    const a = nodes[i];
    a.y -= a.speed;
    a.x += Math.sin(time * 0.001 + a.phase) * 0.22;

    if (a.y < -24) {
      a.y = height + 24;
      a.x = Math.random() * width;
    }

    for (let j = i + 1; j < nodes.length; j += 1) {
      const b = nodes[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < 150) {
        const opacity = 0.14 * (1 - distance / 150);
        ctx.strokeStyle = isDark
          ? `rgba(245, 239, 230, ${opacity})`
          : `rgba(32, 40, 38, ${opacity})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = isDark ? "rgba(53, 201, 182, 0.58)" : "rgba(15, 118, 110, 0.58)";
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(drawCanvas);
}

function updateClock() {
  const now = new Date();
  clockElement.textContent = now.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  periodElement.textContent = now.getHours() >= 12 ? "مساء" : "صباحا";
  dateElement.textContent = now.toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  updateNextPrayer();
}

function normalizeTime(value) {
  return String(value).split(" ")[0];
}

function to12Hour(value) {
  const [hour, minute] = normalizeTime(value).split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function renderPrayerTimes(timings, isFallback = false) {
  prayerTimes = Object.entries(prayerLabels).map(([key, label]) => ({
    key,
    label,
    time: normalizeTime(timings[key]),
  }));

  prayerListElement.innerHTML = prayerTimes
    .map(
      (item) => `
        <div class="prayer-time">
          <span>${item.label}</span>
          <strong>${to12Hour(item.time)}</strong>
        </div>
      `,
    )
    .join("");

  prayerNoteElement.textContent = isFallback
    ? "تعذر جلب المواقيت من الإنترنت، فتم عرض أوقات تقريبية مؤقتة للقاهرة."
    : "المواقيت محدثة تلقائيا للقاهرة، مصر.";

  updateNextPrayer();
}

function updateNextPrayer() {
  if (!prayerTimes.length) return;

  const now = new Date();
  const upcoming = prayerTimes.find((item) => {
    const [hour, minute] = item.time.split(":").map(Number);
    const prayerDate = new Date();
    prayerDate.setHours(hour, minute, 0, 0);
    return prayerDate > now;
  });

  const next = upcoming || prayerTimes[0];
  nextPrayerElement.textContent = `${next.label} - ${to12Hour(next.time)}`;
}

async function loadPrayerTimes() {
  prayerNoteElement.textContent = "جار تحديث مواقيت الصلاة...";
  try {
    const response = await fetch(
      "https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt&method=5",
    );
    if (!response.ok) throw new Error("Prayer API request failed");
    const result = await response.json();
    renderPrayerTimes(result.data.timings);
  } catch (error) {
    renderPrayerTimes(fallbackPrayerTimes, true);
  }
}

function renderAzkar(type) {
  azkarGrid.innerHTML = azkar[type]
    .map(
      (item) => `
        <article class="azkar-card">
          <span>${item.title}</span>
          <p>${item.text}</p>
          <strong>${item.count}</strong>
        </article>
      `,
    )
    .join("");
  observeRevealItems();
}

function observeRevealItems() {
  const items = document.querySelectorAll(
    ".section-heading, .time-panel, .prayer-panel, .azkar-card, .service-card, .gallery-copy, .stack-image, .contact-actions",
  );

  items.forEach((item) => item.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 },
  );

  items.forEach((item) => observer.observe(item));
}

function setTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark", isDark);
  themeIcon.textContent = isDark ? "☀" : "☾";
  themeText.textContent = isDark ? "الوضع الفاتح" : "الوضع الليلي";
  localStorage.setItem("theme", theme);
}

themeToggle.addEventListener("click", () => {
  setTheme(document.body.classList.contains("dark") ? "light" : "dark");
});

azkarButtons.forEach((button) => {
  button.addEventListener("click", () => {
    azkarButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderAzkar(button.dataset.azkar);
  });
});

refreshPrayerButton.addEventListener("click", loadPrayerTimes);

setTheme(localStorage.getItem("theme") || "light");
renderAzkar("morning");
observeRevealItems();
resizeCanvas();
requestAnimationFrame(drawCanvas);
updateClock();
loadPrayerTimes();

setInterval(updateClock, 1000);
window.addEventListener("resize", resizeCanvas);
