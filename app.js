// ----------------- small utilities -----------------
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];

function toast(msg){
  const t = $("#toast");
  if(!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1100);
}

function fmtDate(iso){
  try{
    return new Date(iso).toLocaleDateString(undefined, { year:"numeric", month:"short", day:"2-digit" });
  }catch{ return ""; }
}

// ----------------- hover spotlight -----------------
$$(".hover").forEach(card => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 100;
    const my = ((e.clientY - r.top) / r.height) * 100;
    card.style.setProperty("--mx", mx + "%");
    card.style.setProperty("--my", my + "%");
  });
});

// ----------------- copy helpers -----------------
$$("[data-copy]").forEach(btn => {
  btn.addEventListener("click", async () => {
    const val = btn.getAttribute("data-copy");
    try{
      await navigator.clipboard.writeText(val);
      toast("Copied");
    }catch{
      // fallback
      const ta = document.createElement("textarea");
      ta.value = val;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast("Copied");
    }
  });
});

// ----------------- footer year -----------------
const y = $("#year");
if(y) y.textContent = String(new Date().getFullYear());

// ----------------- Projects page logic -----------------
const featuredEl = $("#featured");
const repoGrid = $("#repoGrid");
const repoStatus = $("#repoStatus");
const qEl = $("#q");
const langEl = $("#lang");

// featured projects are curated + professional labels (no “extra words”)
const FEATURED = [
  {
    name: "CHOMBEZA",
    url: "https://github.com/archnexus707/CHOMBEZA",
    desc: "Advanced security testing toolkit for bug hunters and VAPT work.",
    tags: ["Python", "Security Testing"]
  },
  {
    name: "NEONHUNTER",
    url: "https://github.com/archnexus707/NEONHUNTER",
    desc: "GUI fuzzer suite for web vulnerability testing and reporting.",
    tags: ["Python", "Fuzzing"]
  },
  {
    name: "M2TOOL",
    url: "https://github.com/archnexus707/M2TOOL",
    desc: "Endpoint directory monitoring + VirusTotal reporting workflow.",
    tags: ["Python", "Monitoring"]
  },
  {
    name: "ShadowBind707",
    url: "https://github.com/archnexus707/ShadowBind707",
    desc: "Red-team utility project (research / controlled environments).",
    tags: ["PowerShell", "Research"]
  }
];

function renderFeatured(){
  if(!featuredEl) return;
  featuredEl.innerHTML = FEATURED.map(p => `
    <a class="repoCard hover" href="${p.url}" target="_blank" rel="noreferrer">
      <div class="repoTop">
        <div class="repoName">${p.name}</div>
        <span class="badge">Featured</span>
      </div>
      <div class="repoDesc">${p.desc}</div>
      <div class="repoMeta">
        ${p.tags.map(t => `<span class="badge">${t}</span>`).join("")}
      </div>
    </a>
  `).join("");

  // rebind spotlight
  $$(".hover", featuredEl).forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty("--mx", mx + "%");
      card.style.setProperty("--my", my + "%");
    });
  });
}

let allRepos = [];

function repoCard(r){
  const lang = r.language || "—";
  const updated = r.updated_at ? fmtDate(r.updated_at) : "";
  const desc = (r.description || "").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  return `
    <a class="repoCard hover" href="${r.html_url}" target="_blank" rel="noreferrer">
      <div class="repoTop">
        <div class="repoName">${r.name}</div>
        <span class="badge">${lang}</span>
      </div>
      <div class="repoDesc">${desc || "No description provided."}</div>
      <div class="repoMeta">
        <span class="badge">★ ${r.stargazers_count}</span>
        <span class="badge">⑂ ${r.forks_count}</span>
        <span class="badge">Updated ${updated}</span>
      </div>
    </a>
  `;
}

function applyFilters(){
  if(!repoGrid) return;
  const q = (qEl?.value || "").toLowerCase().trim();
  const lang = (langEl?.value || "");
  const filtered = allRepos.filter(r => {
    const hay = `${r.name} ${r.description || ""}`.toLowerCase();
    const qOk = !q || hay.includes(q);
    const lOk = !lang || (r.language || "") === lang;
    return qOk && lOk;
  });

  repoGrid.innerHTML = filtered.map(repoCard).join("");
  if(repoStatus) repoStatus.textContent = `Showing ${filtered.length} of ${allRepos.length} repos`;
  $$(".hover", repoGrid).forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      card.style.setProperty("--mx", mx + "%");
      card.style.setProperty("--my", my + "%");
    });
  });
}

async function loadRepos(){
  if(!repoGrid) return;

  renderFeatured();

  if(repoStatus) repoStatus.textContent = "Loading repositories…";
  try{
    const res = await fetch("https://api.github.com/users/archnexus707/repos?per_page=100&sort=updated");
    if(!res.ok) throw new Error("GitHub API error");
    const data = await res.json();

    // filter out forks if you want: keep everything for now
    allRepos = data.sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at));

    // build language options
    const langs = Array.from(new Set(allRepos.map(r => r.language).filter(Boolean))).sort();
    if(langEl){
      langEl.innerHTML = `<option value="">All languages</option>` + langs.map(l => `<option value="${l}">${l}</option>`).join("");
    }

    applyFilters();
  }catch(e){
    if(repoStatus) repoStatus.textContent = "Could not load repos from GitHub API (rate limit/offline). Refresh later.";
    // still show featured
    renderFeatured();
  }
}

if(qEl) qEl.addEventListener("input", applyFilters);
if(langEl) langEl.addEventListener("change", applyFilters);
loadRepos();