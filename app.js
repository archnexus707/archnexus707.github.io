/* ============================================================
   DGM-707 // app.js
   Cyberpunk Red Team Portfolio
   ============================================================ */

const $  = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

/* -------- Tiny helpers -------- */
function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 1400);
}
function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString(undefined, { year:"numeric", month:"short", day:"2-digit" }); }
  catch { return ""; }
}
function escapeHTML(s) {
  return String(s || "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

/* ============================================================
   BOOT SEQUENCE
   ============================================================ */
(function bootSequence() {
  const boot = $("#boot");
  if (!boot) return;

  // Skip boot if user has already seen it this session
  if (sessionStorage.getItem("dgm.booted") === "1") {
    boot.remove();
    return;
  }

  const lines = [
    "> <b>dgm-console</b> v4.7.0 loading…",
    "> mounting <b>/dev/ops</b> …………………………… <span class='ok'>[ OK ]</span>",
    "> handshake with <b>archnexus707</b> …… <span class='ok'>[ OK ]</span>",
    "> loading operator profile <b>DGM-707</b> …",
    "> clearance level: <span class='warn'>RED TEAM</span>",
    "> engagement scope: <span class='ok'>AUTHORIZED</span>",
    "> session id: <b>0xA1E7-CAFE-2026</b>",
    "> portfolio ready — welcome, operator.<span class='boot__cursor'></span>"
  ];

  const host = $("#bootLines");
  let i = 0;
  (function next() {
    if (i >= lines.length) {
      setTimeout(() => {
        boot.classList.add("is-done");
        setTimeout(() => boot.remove(), 450);
        sessionStorage.setItem("dgm.booted", "1");
      }, 500);
      return;
    }
    const el = document.createElement("div");
    el.className = "boot__line";
    el.innerHTML = lines[i++];
    host.appendChild(el);
    setTimeout(next, 180 + Math.random() * 160);
  })();

  $("#bootSkip")?.addEventListener("click", () => {
    boot.classList.add("is-done");
    setTimeout(() => boot.remove(), 300);
    sessionStorage.setItem("dgm.booted", "1");
  });
})();

/* ============================================================
   NAV — mobile burger + year
   ============================================================ */
$("#burger")?.addEventListener("click", () => {
  $("#tabs")?.classList.toggle("is-open");
});
const yearEl = $("#year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* ============================================================
   COPY BUTTONS
   ============================================================ */
$$("[data-copy]").forEach(btn => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    const val = btn.getAttribute("data-copy");
    try {
      await navigator.clipboard.writeText(val);
      toast("Copied to clipboard");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = val;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch {}
      ta.remove();
      toast("Copied");
    }
  });
});

/* ============================================================
   TYPEWRITER (hero status line)
   ============================================================ */
(function typer() {
  const el = $("#typed");
  if (!el) return;
  const phrases = [
    "Red team operator online. Target engagement authorized.",
    "Purple team ready. MITRE ATT&CK mapping active.",
    "Scanning perimeter … 0 false positives.",
    "Threat intel feed syncing … IOCs up to date."
  ];
  let p = 0, i = 0, deleting = false;
  const caret = '<span class="caret"></span>';

  function tick() {
    const full = phrases[p];
    if (!deleting) {
      i++;
      el.innerHTML = full.slice(0, i) + caret;
      if (i === full.length) { deleting = true; return setTimeout(tick, 1800); }
      return setTimeout(tick, 28 + Math.random() * 40);
    }
    i--;
    el.innerHTML = full.slice(0, i) + caret;
    if (i === 0) { deleting = false; p = (p + 1) % phrases.length; return setTimeout(tick, 500); }
    setTimeout(tick, 14);
  }
  setTimeout(tick, 900);
})();

/* ============================================================
   SKILL BARS (fill on scroll-in)
   ============================================================ */
(function skillBars() {
  const bars = $$(".bar__fill");
  if (!bars.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        const pct = en.target.dataset.pct || "80";
        en.target.style.right = `${100 - Number(pct)}%`;
        io.unobserve(en.target);
      }
    });
  }, { threshold: .4 });
  bars.forEach(b => io.observe(b));
})();

/* ============================================================
   COMMAND PALETTE (Ctrl/Cmd+K)
   ============================================================ */
(function cmdk() {
  const overlay = $("#cmdk");
  if (!overlay) return;
  const input = $("#cmdkInput");
  const list  = $("#cmdkList");

  const items = [
    { label: "Go to Profile",          href: "index.html",    icon: "user",   kbd: "g p" },
    { label: "Go to Skills / Arsenal", href: "skills.html",   icon: "zap",    kbd: "g s" },
    { label: "Go to Operations (projects)", href: "projects.html", icon: "folder", kbd: "g o" },
    { label: "Go to Secure Comms",     href: "contact.html",  icon: "radio",  kbd: "g c" },
    { label: "Open GitHub profile",    href: "https://github.com/archnexus707", ext: true, icon: "github" },
    { label: "Open LinkedIn",          href: "https://tz.linkedin.com/in/dickson-godwin-963114249", ext: true, icon: "link" },
    { label: "Copy email",             action: "copy-email",  icon: "mail" },
    { label: "Run: whoami",            action: "whoami",      icon: "terminal" },
    { label: "Run: nmap localhost",    action: "nmap",        icon: "radar" },
    { label: "Toggle scanlines",       action: "toggle-scan", icon: "grid" },
  ];

  const ICONS = {
    user:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>',
    zap:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>',
    folder:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    radio:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="2"/><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 15.5a5 5 0 0 0 0-7M5 5a9 9 0 0 0 0 14M19 19a9 9 0 0 0 0-14"/></svg>',
    github:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.8 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.7 1.2 3.3.9.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3 0 0 1-.3 3.2 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.7.1 3 .7.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.8-5.8 7.8-10.9C23.5 5.7 18.3.5 12 .5z"/></svg>',
    link:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M10 14l-1 1a4 4 0 0 1-5.7-5.7l3-3a4 4 0 0 1 5.7 0M14 10l1-1a4 4 0 0 1 5.7 5.7l-3 3a4 4 0 0 1-5.7 0"/></svg>',
    mail:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></svg>',
    terminal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/></svg>',
    radar:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12l6-6"/></svg>',
    grid:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
  };

  let activeIndex = 0;

  function render(filter = "") {
    const q = filter.toLowerCase().trim();
    const filtered = items.filter(it => !q || it.label.toLowerCase().includes(q));
    list.innerHTML = filtered.map((it, i) => `
      <div class="cmdk__item ${i === activeIndex ? "is-active" : ""}" data-idx="${items.indexOf(it)}">
        ${ICONS[it.icon] || ""}
        <span>${escapeHTML(it.label)}</span>
        ${it.kbd ? `<kbd>${it.kbd}</kbd>` : ""}
      </div>
    `).join("") || `<div style="padding:16px;color:var(--fg-2);font-family:var(--mono);font-size:12px">no results</div>`;
    list._filtered = filtered;
  }

  function execItem(it) {
    if (!it) return;
    if (it.href) {
      if (it.ext) window.open(it.href, "_blank", "noopener");
      else location.href = it.href;
      close();
      return;
    }
    if (it.action === "copy-email") {
      navigator.clipboard?.writeText("dicksonmassawe707@gmail.com").then(() => toast("Email copied"));
    }
    if (it.action === "whoami") {
      toast("dgm-707 :: red-team operator");
    }
    if (it.action === "nmap") {
      toast("Scan complete — 1 host up, 4 ports open");
    }
    if (it.action === "toggle-scan") {
      document.body.classList.toggle("no-scan");
      const on = !document.body.classList.contains("no-scan");
      toast(`Scanlines ${on ? "on" : "off"}`);
      $(".bg-scan").style.display = on ? "" : "none";
    }
    close();
  }

  function open()  { overlay.classList.add("is-open"); activeIndex = 0; input.value = ""; render(); setTimeout(() => input.focus(), 30); }
  function close() { overlay.classList.remove("is-open"); }

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      overlay.classList.contains("is-open") ? close() : open();
      return;
    }
    if (!overlay.classList.contains("is-open")) return;
    if (e.key === "Escape") return close();
    if (e.key === "ArrowDown") { e.preventDefault(); activeIndex = Math.min((list._filtered?.length || 1) - 1, activeIndex + 1); render(input.value); }
    if (e.key === "ArrowUp")   { e.preventDefault(); activeIndex = Math.max(0, activeIndex - 1); render(input.value); }
    if (e.key === "Enter")     { e.preventDefault(); execItem(list._filtered?.[activeIndex]); }
  });

  $("#cmdkOpen")?.addEventListener("click", open);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  input.addEventListener("input", () => { activeIndex = 0; render(input.value); });
  list.addEventListener("click", (e) => {
    const row = e.target.closest(".cmdk__item");
    if (!row) return;
    const idx = Number(row.dataset.idx);
    execItem(items[idx]);
  });
})();

/* ============================================================
   PROJECTS PAGE
   ============================================================ */
const FEATURED = [
  {
    name: "NUNGUNUNGU",
    url: "https://github.com/archnexus707/nungunungu",
    desc: "Windows C2 agent demonstrating LSA-based privilege escalation with multi-layer shellcode encryption and Defender evasion.",
    tags: [{t:"Go",c:"cyan"}, {t:"C2",c:"red"}, {t:"Research",c:"amber"}],
    threat: "CRITICAL"
  },
  {
    name: "EYE_OF_ZEUS",
    url: "https://github.com/archnexus707",
    desc: "Advanced network reconnaissance + MITM traffic analysis (ARP poisoning, HTTPS interception, credential capture).",
    tags: [{t:"Python",c:""}, {t:"Recon",c:"red"}, {t:"MITM",c:"amber"}]
  },
  {
    name: "NEONHUNTER",
    url: "https://github.com/archnexus707/NEONHUNTER",
    desc: "GUI-based bug bounty & web fuzzing framework — XSS, SQLi, SSTI, Open Redirect, HPP with blind-callback detection.",
    tags: [{t:"Python",c:""}, {t:"Fuzzer",c:"red"}, {t:"Bug-Bounty",c:"green"}]
  },
  {
    name: "M2TOOL",
    url: "https://github.com/archnexus707/M2TOOL",
    desc: "Python anti-malware + SOC monitoring node with VirusTotal multi-engine scans, heuristic analysis, automated alerting.",
    tags: [{t:"Python",c:""}, {t:"SOC",c:"cyan"}, {t:"Monitoring",c:""}]
  },
  {
    name: "TuFFSnatcher",
    url: "https://github.com/archnexus707",
    desc: "Credential extraction + password attack simulation research tool. Tkinter GUI, multi-threaded, controlled-lab only.",
    tags: [{t:"Python",c:""}, {t:"Research",c:"amber"}]
  },
  {
    name: "T_DOWN",
    url: "https://github.com/archnexus707",
    desc: "Educational PowerShell tool for Windows security configuration assessment — UAC bypass analysis, registry, persistence.",
    tags: [{t:"PowerShell",c:""}, {t:"Red-Team",c:"red"}]
  }
];

function repoFeaturedCard(p) {
  return `
    <a class="repo" href="${p.url}" target="_blank" rel="noreferrer">
      <span class="repo__featured-tag">FEATURED</span>
      <div class="repo__top">
        <div class="repo__name">${escapeHTML(p.name)}</div>
      </div>
      <div class="repo__desc">${escapeHTML(p.desc)}</div>
      <div class="repo__meta">
        ${p.tags.map(t => `<span class="badge ${t.c ? "badge--"+t.c : ""}">${escapeHTML(t.t)}</span>`).join("")}
        ${p.threat ? `<span class="badge badge--red">THREAT: ${p.threat}</span>` : ""}
      </div>
    </a>
  `;
}

(function featured() {
  const host = $("#featured");
  if (!host) return;
  host.innerHTML = FEATURED.map(repoFeaturedCard).join("");
})();

/* GitHub repo grid */
(function githubRepos() {
  const grid = $("#repoGrid");
  if (!grid) return;
  const status = $("#repoStatus");
  const qEl    = $("#q");
  const lEl    = $("#lang");
  let all = [];

  function card(r) {
    const lang = r.language || "—";
    const updated = r.updated_at ? fmtDate(r.updated_at) : "";
    const desc = escapeHTML(r.description || "No description provided.");
    return `
      <a class="repo" href="${r.html_url}" target="_blank" rel="noreferrer">
        <div class="repo__top">
          <div class="repo__name">${escapeHTML(r.name)}</div>
          <span class="badge badge--cyan">${escapeHTML(lang)}</span>
        </div>
        <div class="repo__desc">${desc}</div>
        <div class="repo__meta">
          <span class="badge">★ ${r.stargazers_count}</span>
          <span class="badge">⑂ ${r.forks_count}</span>
          <span class="badge">${updated}</span>
        </div>
      </a>
    `;
  }

  function apply() {
    const q = (qEl?.value || "").toLowerCase().trim();
    const lang = (lEl?.value || "");
    const filtered = all.filter(r => {
      const hay = `${r.name} ${r.description || ""}`.toLowerCase();
      return (!q || hay.includes(q)) && (!lang || (r.language || "") === lang);
    });
    grid.innerHTML = filtered.map(card).join("") || `<div class="muted mono small">no matching repositories.</div>`;
    if (status) status.innerHTML = `displaying <b>${filtered.length}</b> of <b>${all.length}</b> repositories`;
  }

  async function load() {
    if (status) status.textContent = "pulling repositories from github…";
    try {
      const res = await fetch("https://api.github.com/users/archnexus707/repos?per_page=100&sort=updated");
      if (!res.ok) throw new Error("api");
      const data = await res.json();
      all = data.sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at));
      const langs = [...new Set(all.map(r => r.language).filter(Boolean))].sort();
      if (lEl) {
        lEl.innerHTML = `<option value="">ALL LANGUAGES</option>` + langs.map(l => `<option value="${escapeHTML(l)}">${escapeHTML(l)}</option>`).join("");
      }
      apply();
    } catch {
      if (status) status.textContent = "could not reach github api (rate limited / offline). featured modules still visible above.";
    }
  }

  qEl?.addEventListener("input", apply);
  lEl?.addEventListener("change", apply);
  load();
})();

/* ============================================================
   Hover spotlight fallback (already via CSS hover, this adds subtle parallax)
   ============================================================ */
$$(".idcard, .card, .module").forEach(card => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width - .5) * 2;
    const my = ((e.clientY - r.top) / r.height - .5) * 2;
    card.style.setProperty("--mx", (50 + mx * 20) + "%");
    card.style.setProperty("--my", (50 + my * 20) + "%");
  });
});
