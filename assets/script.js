/* ══════════════════════════════════════════════════════════════
   PORTOFOLIO GH0ST4N — JAVASCRIPT
   ──────────────────────────────────────────────────────────────
   DAFTAR ISI:
   0. Konfigurasi ........ titik edit utama (username, animasi)
   1. Typewriter ......... tagline hero ngetik sendiri
   2. Scroll-spy ......... nav aktif mengikuti posisi scroll
   3. Hamburger menu ..... menu mobile
   4. Scroll reveal ...... animasi .fade-in-up
   5. Particles .......... background canvas hero
   6. GitHub Activity .... fetch + render heatmap/bahasa
   7. Lightbox ........... modal sertifikat
   8. Inisialisasi ....... semua fitur dinyalakan di sini

   CATATAN:
   - File ini dimuat di AKHIR <body> → DOM pasti sudah ada.
     Kalau dipindah ke <head>, WAJIB tambah atribut defer.
   - Semua dibungkus IIFE (() => {...})() → variabel & function
     gak bocor ke global scope, gak bisa tabrakan dgn script lain.
   - Matikan sementara satu fitur → komentar 1 baris di bagian 8.
   ══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";

  /* ─────────────── 0. KONFIGURASI ───────────────
     Edit bagian ini dulu sebelum ubah yang lain. */
  const GH_USER = "gh0st4n"; // username GitHub (heatmap + bahasa)
  const GH_ORGS = ["T4n-Labs"]; // org yang ikut dihitung Most Used Languages
  const HEATMAP_FADE_MS = 200; // durasi fade-out ganti periode ⚠ harus SAMA dgn .is-loading di CSS (0.2s)
  const HEATMAP_STAGGER_MS = 7; // jeda animasi antar kolom minggu (efek gelombang)
  const CACHE_TTL_MS = 60 * 60 * 1000; // umur cache API: 1 jam

  /* ─────────────── 1. TYPEWRITER ───────────────
     Tagline hero diketik-hapus-ganti secara bergantian.
     Edit daftar phrases di bawah untuk ganti tagline. */
  function initTypewriter() {
    const span = document.getElementById("typewriter");
    const phrases = [
      "Vulnerability Researcher Security Low Level",
      "T4n-Labs Founder",
      "Linux Developer",
      "Open-Source Builder",
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
      const current = phrases[phraseIndex];

      if (isDeleting) {
        span.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50; // hapus lebih cepat
      } else {
        span.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 100;
      }

      if (!isDeleting && charIndex === current.length) {
        isDeleting = true;
        typeSpeed = 2000; // jeda saat kalimat lengkap
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 500; // jeda sebelum kalimat baru
      }

      setTimeout(type, typeSpeed);
    }

    type();
  }

  /* ─────────────── 2. SCROLL-SPY ───────────────
     Menandai link navbar sesuai section yang sedang terlihat. */
  function initScrollSpy() {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-links a");

    window.addEventListener("scroll", () => {
      let current = "";
      sections.forEach((section) => {
        if (pageYOffset >= section.offsetTop - 200) {
          current = section.getAttribute("id");
        }
      });

      navLinks.forEach((a) => {
        a.classList.remove("active");
        if (a.getAttribute("href").includes(current)) {
          a.classList.add("active");
        }
      });
    });
  }

  /* ─────────────── 3. HAMBURGER MENU ───────────────
     Toggle menu mobile + auto-tutup saat link diklik. */
  function initHamburger() {
    const hamburger = document.getElementById("hamburger");
    const navContainer = document.getElementById("navLinks");

    hamburger.addEventListener("click", () => {
      navContainer.classList.toggle("active");
    });

    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        navContainer.classList.remove("active");
      });
    });
  }

  /* ─────────────── 4. SCROLL REVEAL ───────────────
     Elemen .fade-in-up muncul saat masuk viewport (sekali saja). */
  function initScrollReveal() {
    const elements = document.querySelectorAll(".fade-in-up");

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target); // animasi cuma sekali
          }
        });
      },
      { root: null, threshold: 0.15, rootMargin: "0px" },
    );

    elements.forEach((el) => observer.observe(el));
  }

  /* ─────────────── 5. PARTICLES ───────────────
     Background titik-titik ungu di hero.
     Jumlah partikel menyesuaikan luas layar (makin besar makin banyak). */
  function initParticles() {
    const canvas = document.getElementById("particles-canvas");
    const ctx = canvas.getContext("2d");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let particlesArray = [];

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1; // 1–3 px
        this.speedX = Math.random() * 0.5 - 0.25; // gerak pelan
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = "rgba(124, 58, 237, 0.3)"; // ungu transparan
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        // wrap: keluar sisi → muncul di sisi sebaliknya
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function spawnParticles() {
      particlesArray = [];
      const total = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < total; i++) {
        particlesArray.push(new Particle());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particlesArray) {
        p.update();
        p.draw();
      }
      requestAnimationFrame(animate);
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    spawnParticles();

    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      spawnParticles();
    });

    // user mematikan animasi → gambar frame statis saja
    if (reducedMotion) {
      particlesArray.forEach((p) => p.draw());
      return;
    }
    animate();
  }

  /* ─────────────── 6. GITHUB ACTIVITY ───────────────
     Sumber data:
     - Kontribusi : github-contributions-api.jogruber.de (tanpa token)
     - Bahasa     : api.github.com (repo publik, fork diabaikan)

     Semua response di-cache CACHE_TTL_MS di localStorage
     supaya hemat rate-limit GitHub (60 req/jam tanpa token). */

  /** Fetch JSON + cache di localStorage (umur: CACHE_TTL_MS). */
  async function ghCached(key, url) {
    try {
      const cached = JSON.parse(localStorage.getItem(key) || "null");
      if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.data;
    } catch (e) {
      /* cache korup → anggap tidak ada */
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    try {
      localStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
    } catch (e) {
      /* storage penuh/diblokir → skip cache */
    }
    return data;
  }

  // penanda request terbaru — cegah hasil lama menimpa hasil baru
  // saat tombol periode diklik cepat-cepat (race condition)
  let ghRequestToken = 0;

  /**
   * Ambil data kontribusi satu periode lalu render.
   * Alur transisi (biar gak "patah"):
   *   1. heatmap lama di-fade-out (class .is-loading) sambil fetch data
   *   2. tunggu dua-duanya selesai
   *   3. render isi baru → kotak muncul berurutan (efek gelombang)
   * @param {string|number} period - "last" (12 bln terakhir) atau tahun, mis. 2025
   */
  async function loadContributions(period = "last") {
    const scroll = document.querySelector(".heatmap-scroll");
    const grid = document.getElementById("gh-heatmap");
    const token = ++ghRequestToken;

    scroll.classList.add("is-loading");
    const fadeDone = new Promise((r) => setTimeout(r, HEATMAP_FADE_MS));

    try {
      const url =
        period === "last"
          ? `https://github-contributions-api.jogruber.de/v4/${GH_USER}`
          : `https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=${period}`;

      const [data] = await Promise.all([
        ghCached("gh-contrib-" + period, url),
        fadeDone,
      ]);
      if (token !== ghRequestToken) return; // ada klik lebih baru

      // render + angkat fade dalam SATU blok sinkron →
      // browser gak sempat menampilkan kondisi "kosong" di antaranya
      renderContributions(data, period);
      scroll.classList.remove("is-loading");
    } catch (err) {
      if (token !== ghRequestToken) return;
      document.getElementById("gh-months").innerHTML = "";
      grid.innerHTML =
        '<span class="gh-error">[ gagal memuat kontribusi — coba refresh ]</span>';
      scroll.classList.remove("is-loading");
      console.error(err);
    }
  }

  /**
   * Render statistik + heatmap + label bulan.
   * Tiap kotak dikasih animationDelay per minggu → gelombang kiri→kanan.
   * @param {object} data   - response API { total, contributions: [...] }
   * @param {string|number} period - "last" atau tahun
   */
  function renderContributions(data, period) {
    const days = data.contributions; // [{ date, count, level }, ...]
    const grid = document.getElementById("gh-heatmap");
    const months = document.getElementById("gh-months");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // ---- statistik ----
    document.getElementById("gh-total").textContent =
      data.total.toLocaleString("id-ID");
    document.getElementById("gh-best").textContent = Math.max(
      ...days.map((d) => d.count),
    );
    document.getElementById("gh-avg").textContent =
      (data.total / days.length).toFixed(1) + "/day";

    // kartu ke-2: "last" = minggu ini • per tahun = bulan tersibuk
    if (period === "last") {
      const thisWeek = days
        .slice(-(days.length % 7 || 7))
        .reduce((s, d) => s + d.count, 0);
      document.getElementById("gh-week").textContent = thisWeek;
      document.getElementById("gh-week-label").textContent = "This Week";
    } else {
      const perMonth = {};
      days.forEach((d) => {
        const m = d.date.slice(0, 7); // "2026-01"
        perMonth[m] = (perMonth[m] || 0) + d.count;
      });
      const best = Object.entries(perMonth).sort((a, b) => b[1] - a[1])[0];
      document.getElementById("gh-week").textContent = best[1];
      document.getElementById("gh-week-label").textContent =
        "Best Month (" +
        monthNames[parseInt(best[0].slice(5, 7), 10) - 1] +
        ")";
    }

    // ---- kotak heatmap (fade-in berurutan per kolom) ----
    grid.innerHTML = "";
    days.forEach((d, i) => {
      const cell = document.createElement("div");
      cell.className = "cell lvl-" + d.level;
      cell.dataset.tip = `${d.count} contribution${d.count === 1 ? "" : "s"} — ${d.date}`;
      cell.style.animationDelay = Math.floor(i / 7) * HEATMAP_STAGGER_MS + "ms";
      grid.appendChild(cell);
    });

    // ---- label bulan (delay disamakan dgn kolom minggunya) ----
    months.innerHTML = "";
    let lastMonth = -1;
    for (let i = 0; i < days.length; i += 7) {
      const slot = document.createElement("span");
      const m = new Date(days[i].date + "T00:00:00").getMonth();
      if (m !== lastMonth) {
        lastMonth = m;
        slot.textContent = monthNames[m];
      }
      slot.style.animationDelay = Math.floor(i / 7) * HEATMAP_STAGGER_MS + "ms";
      months.appendChild(slot);
    }
  }

  /**
   * Bikin satu tombol periode.
   * @param {string} label   - teks tombol, mis. "Last" / "2025"
   * @param {string|number} period - nilai yang dikirim ke loadContributions
   */
  function makeYearBtn(label, period) {
    const btn = document.createElement("button");
    btn.className = "gh-year-btn mono";
    btn.textContent = "[ " + label + " ]";
    btn.addEventListener("click", () => {
      if (btn.classList.contains("active")) return; // sudah aktif
      document
        .querySelectorAll(".gh-year-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      loadContributions(period);
    });
    return btn;
  }

  /**
   * Susun tombol periode otomatis:
   * [ Last ] + satu tombol per tahun sejak akun GitHub dibuat
   * (diambil dari created_at) — tahun baru muncul sendiri,
   * gak perlu hardcode.
   */
  async function initYearSelector() {
    const wrap = document.getElementById("gh-years");
    const thisYear = new Date().getFullYear();
    let startYear = thisYear - 1; // fallback kalau profil gagal diambil

    try {
      const user = await ghCached(
        "gh-user",
        `https://api.github.com/users/${GH_USER}`,
      );
      startYear = new Date(user.created_at).getFullYear();
    } catch (e) {
      /* diam aja, pakai fallback */
    }

    const lastBtn = makeYearBtn("Last", "last");
    lastBtn.classList.add("active"); // default terpilih
    wrap.appendChild(lastBtn);

    for (let y = thisYear; y >= startYear; y--) {
      wrap.appendChild(makeYearBtn(String(y), y));
    }
  }

  /** Tooltip heatmap — ngikutin kursor (desktop) + tap (HP). */
  function initTooltip() {
    const tip = document.createElement("div");
    tip.className = "gh-tooltip mono";
    document.body.appendChild(tip);
    const area = document.getElementById("gh-heatmap");

    // ---- desktop: ngikutin kursor ----
    // listener nempel di container → tetap jalan walau kotaknya
    // dirender ulang saat ganti periode
    area.addEventListener("mouseover", (e) => {
      const c = e.target.closest(".cell");
      if (c && c.dataset.tip) tip.textContent = c.dataset.tip;
    });
    area.addEventListener("mousemove", (e) => {
      tip.style.left = Math.min(e.clientX + 14, innerWidth - 190) + "px";
      tip.style.top = e.clientY - 34 + "px";
      tip.style.opacity = 1;
    });
    area.addEventListener("mouseleave", () => (tip.style.opacity = 0));

    // ---- HP: tap kotak → tooltip muncul 2 detik ----
    area.addEventListener(
      "touchstart",
      (e) => {
        const c = e.target.closest(".cell");
        if (!c || !c.dataset.tip) return;
        tip.textContent = c.dataset.tip;
        const r = c.getBoundingClientRect();
        tip.style.left = Math.min(r.left, innerWidth - 190) + "px";
        tip.style.top = r.top - 30 + "px";
        tip.style.opacity = 1;
        clearTimeout(tip._hide); // tap cepat-cepat → reset timer
        tip._hide = setTimeout(() => (tip.style.opacity = 0), 2000);
      },
      { passive: true }, // jangan ngeblok scroll
    );
  }

  /**
   * Bar chart bahasa terpopuler.
   * Dihitung dari repo publik (fork diabaikan) milik
   * GH_USER + semua GH_ORGS → bahasa utama tiap repo dihitung.
   */
  async function loadLanguages() {
    const wrap = document.getElementById("gh-langs");
    try {
      const repoLists = await Promise.all(
        [GH_USER, ...GH_ORGS].map((u) =>
          ghCached(
            "gh-repos-" + u,
            `https://api.github.com/users/${u}/repos?per_page=100&sort=pushed`,
          ),
        ),
      );

      const tally = {};
      repoLists
        .flat()
        .filter((r) => !r.fork)
        .forEach((r) => {
          if (r.language) tally[r.language] = (tally[r.language] || 0) + 1;
        });

      const top = Object.entries(tally)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      if (!top.length) {
        wrap.innerHTML =
          '<span class="gh-error">[ belum ada repo publik ]</span>';
        return;
      }

      const max = top[0][1];
      wrap.innerHTML = top
        .map(
          ([lang, n]) => `
          <div class="lang-row">
            <span class="lang-name">${lang}</span>
            <div class="lang-bar">
              <div class="lang-fill" data-w="${((n / max) * 100).toFixed(0)}"></div>
            </div>
            <span class="lang-count">${n} repo${n > 1 ? "s" : ""}</span>
          </div>`,
        )
        .join("");

      // animasi bar mengisi setelah elemen masuk DOM
      setTimeout(() => {
        wrap
          .querySelectorAll(".lang-fill")
          .forEach((f) => (f.style.width = f.dataset.w + "%"));
      }, 300);
    } catch (err) {
      wrap.innerHTML = '<span class="gh-error">[ gagal memuat bahasa ]</span>';
      console.error(err);
    }
  }

  /* ─────────────── 7. LIGHTBOX SERTIFIKAT ───────────────
     Klik [ View ] → tampil full-screen.
     - File gambar → <img>, klik gambar = zoom
     - File .pdf   → auto-detect, dirender via <iframe>
     - Tutup: tombol [X], klik area gelap, atau tekan Esc
     Link tetap punya href → kalau JS mati, gambar tetap bisa
     dibuka di tab baru (graceful degradation). */
  function initLightbox() {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = `
      <button class="lightbox-close" aria-label="Tutup">[ X ]</button>
      <div class="lightbox-content"></div>
      <div class="lightbox-caption"></div>
    `;
    document.body.appendChild(lb);

    const content = lb.querySelector(".lightbox-content");
    const caption = lb.querySelector(".lightbox-caption");
    const closeBtn = lb.querySelector(".lightbox-close");

    function open(src, title) {
      content.innerHTML = "";
      lb.classList.remove("zoomed");

      if (/\.pdf$/i.test(src)) {
        // PDF → iframe
        const frame = document.createElement("iframe");
        frame.className = "lightbox-iframe";
        frame.src = src;
        frame.title = title;
        content.appendChild(frame);
      } else {
        // gambar → klik untuk zoom
        const img = document.createElement("img");
        img.className = "lightbox-img";
        img.alt = title;
        img.addEventListener("click", () => lb.classList.toggle("zoomed"));
        img.addEventListener("error", () => {
          content.innerHTML =
            '<span class="lightbox-error">[ gagal memuat — cek nama file & lokasinya ]</span>';
        });
        img.src = src; // set SETELAH listener error terpasang
        content.appendChild(img);
      }

      caption.textContent =
        "> " + title + " — klik gambar utk zoom • Esc utk tutup";
      lb.classList.add("open");
      document.body.style.overflow = "hidden"; // kunci scroll background
    }

    function close() {
      lb.classList.remove("open", "zoomed");
      document.body.style.overflow = "";
      content.innerHTML = ""; // bersihkan biar gak berat
    }

    // semua link .cert-view → buka lightbox
    document.querySelectorAll(".cert-view").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const card = link.closest(".cert-card");
        const title =
          card?.querySelector(".cert-title")?.textContent || "Certificate";
        open(link.getAttribute("href"), title);
      });
    });

    // tiga cara menutup
    closeBtn.addEventListener("click", close);
    lb.addEventListener("click", (e) => {
      if (
        !e.target.closest(".lightbox-content") &&
        !e.target.closest(".lightbox-close")
      )
        close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lb.classList.contains("open")) close();
    });
  }

  /* ─────────────── 8. INISIALISASI ───────────────
     Nyalakan semua fitur. Urutan bebas — semua function
     saling independen. Mau matikan sementara satu fitur?
     Komentarin satu barisnya. */
  initTypewriter();
  initScrollSpy();
  initHamburger();
  initScrollReveal();
  initParticles();
  initTooltip();
  initYearSelector();
  loadContributions(); // periode default: "last"
  loadLanguages();
  initLightbox();
})();
