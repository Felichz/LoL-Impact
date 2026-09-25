/* LoLImpact frontend — vanilla JS + ECharts */
const $ = (s) => document.querySelector(s);
const fmt = (x, d = 1) => Number(x).toFixed(d);
const pct = (p) => (p * 100).toFixed(1) + "%";

let CHAMPS = [];          // [{id, name}]
let currentDetail = null;

// ---------- utilidades visuales ----------
function chip(ident) {
  return ident
    ? '<span class="chip green">● identificado</span>'
    : '<span class="chip grey">◐ IC cubre 0</span>';
}
const SIGN = (v) => (v >= 0 ? "+" : "");

// ---------- navegacion ----------
document.querySelectorAll("nav button").forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll("nav button").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
    $("#view-" + b.dataset.view).classList.remove("hidden");
  };
});

// ---------- health ----------
async function loadHealth() {
  const h = await (await fetch("/api/health")).json();
  $("#health").innerHTML =
    `claves vivas: <b>${h.claves_vivas}</b> · modelo ${h.modelo}`;
}

// ---------- perfil + historial ----------
$("#btnLoad").onclick = loadProfile;

async function loadProfile() {
  const rid = $("#riotId").value.trim();
  const region = $("#region").value;
  $("#historial").innerHTML = '<p class="placeholder">Cargando… (las primeras ' +
    'cargas pueden tardar por los límites de la API de Riot)</p>';
  const r = await fetch(`/api/profile?riot_id=${encodeURIComponent(rid)}&region=${region}`);
  if (!r.ok) {
    $("#historial").innerHTML =
      '<p class="placeholder">Sin datos: regenera las claves de la API o ' +
      'espera — no hay partidas cacheadas para ese perfil.</p>';
    return;
  }
  const data = await r.json();
  if (data.degradado) showBanner(data.motivo);
  renderPatron(data.patron);
  renderHistory(data.matches);
}

function showBanner(msg) {
  const b = $("#bannerDegradado");
  b.textContent = "⚠ Modo degradado: " + msg +
    " — mostrando la última vista guardada en caché.";
  b.classList.remove("hidden");
}

function renderPatron(p) {
  const el = $("#patron");
  if (!p) { el.classList.add("hidden"); return; }
  el.classList.remove("hidden");
  const block = (t, d) => `
    <div><div class="big">${SIGN(d.mean)}${d.mean} g</div>
    <div class="sub">${t} (n=${d.n})<br>IC95%: [${d.lo}, ${d.hi}]</div></div>`;
  el.innerHTML = `
    <div><b>Tu oro al min 10</b><div class="sub">ventaja vs la media de los 10,
    bootstrap por partida — el IC es ancho porque tu historial es corto</div></div>
    ${block("en tus victorias", p.wins)}
    ${block("en tus derrotas", p.losses)}`;
}

function renderHistory(matches) {
  const el = $("#historial");
  el.innerHTML = "";
  matches.forEach((m) => {
    const row = document.createElement("div");
    row.className = "match-row " + (m.win ? "win" : "loss");
    const g = m.my_gold_adv_10;
    row.innerHTML = `
      <div class="mr-champ">${m.champ}</div>
      <div class="mr-kda">${m.kda[0]}/${m.kda[1]}/${m.kda[2]}</div>
      <div class="mr-dur">${m.duration_min}m</div>
      <div class="mr-gold">${g !== undefined ? `<b>${SIGN(g)}${g}</b> g @10` : ""}</div>
      <div class="mr-spark" id="spark-${m.match_id}"></div>`;
    row.onclick = () => openMatch(m.match_id, $("#region").value);
    el.appendChild(row);
    if (m.curve && m.curve.length) {
      const c = echarts.init(row.querySelector(".mr-spark"), null, { renderer: "svg" });
      const mine = m.win === (m.curve[0].p >= 0.5);
      c.setOption({
        grid: { left: 0, right: 0, top: 2, bottom: 2 },
        xAxis: { show: false, data: m.curve.map((x) => x.m) },
        yAxis: { show: false, min: 0, max: 1 },
        series: [{
          type: "line", symbol: "none", smooth: true,
          data: m.curve.map((x) => (mine ? x.p : 1 - x.p)),
          lineStyle: { width: 1.5, color: m.win ? "#3fb950" : "#f85149" },
          areaStyle: { opacity: 0.12, color: m.win ? "#3fb950" : "#f85149" },
          markLine: {
            silent: true, symbol: "none",
            data: [{ yAxis: 0.5 }], lineStyle: { color: "#30363d", type: "solid" },
          },
        }],
      });
    }
  });
}

// ---------- detalle de partida ----------
async function openMatch(matchId, region) {
  $("#detalle").classList.remove("hidden");
  $("#detalle").scrollIntoView({ behavior: "smooth" });
  $("#detTitle").textContent = "Cargando partida…";
  const r = await fetch(`/api/match/${region}/${matchId}`);
  if (!r.ok) {
    $("#detTitle").textContent = "No se pudo cargar (¿claves muertas y sin timeline en caché?)";
    return;
  }
  currentDetail = await r.json();
  $("#detTitle").textContent = `Partida ${matchId}`;
  $("#detMeta").innerHTML =
    `parche ${currentDetail.patch} · ${currentDetail.duration_min} min · ` +
    (currentDetail.blue_win ? "ganó el lado azul" : "ganó el lado rojo");
  renderCurve();
  const sel = $("#lmSelector");
  sel.innerHTML = currentDetail.curve.map((c) =>
    `<option value="${c.landmark}">min ${c.landmark}</option>`).join("");
  sel.value = currentDetail.curve[Math.max(1, currentDetail.curve.length - 3)]?.landmark ||
              currentDetail.curve[0].landmark;
  sel.onchange = () => renderTable(currentDetail.players);
  renderLanes();
  renderTable(currentDetail.players);
}

function renderCurve() {
  const c = echarts.init($("#chartCurve"));
  const cv = currentDetail.curve;
  const minutes = cv.map((x) => x.landmark);
  c.setOption({
    backgroundColor: "transparent",
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: { type: "category", data: minutes, name: "minuto",
             axisLine: { lineStyle: { color: "#30363d" } },
             axisLabel: { color: "#8b949e" } },
    yAxis: { min: 0, max: 1, axisLabel: {
               formatter: (v) => (v * 100) + "%", color: "#8b949e" },
             splitLine: { lineStyle: { color: "#21262d" } } },
    series: [
      { type: "line", data: cv.map((x) => x.lo), stack: "band",
        symbol: "none", lineStyle: { opacity: 0 }, silent: true },
      { type: "line", data: cv.map((x) => x.hi - x.lo), stack: "band",
        symbol: "none", lineStyle: { opacity: 0 },
        areaStyle: { color: "rgba(88,166,255,0.15)" } },
      { type: "line", data: cv.map((x) => x.p_blue), symbol: "circle",
        symbolSize: 7, smooth: true,
        lineStyle: { width: 2.5, color: "#58a6ff" },
        itemStyle: { color: "#58a6ff" },
        markLine: { silent: true, symbol: "none",
          data: [{ yAxis: 0.5 }], lineStyle: { color: "#8b949e", type: "dashed" },
          label: { formatter: "50%", color: "#8b949e" } },
        tooltip: { valueFormatter: (v) => pct(v) } },
    ],
    tooltip: { trigger: "axis",
      formatter: (ps) => {
        const i = ps[0].dataIndex;
        const x = cv[i];
        return `<b>min ${x.landmark}</b><br>P(azul) = ${pct(x.p_blue)} ` +
          `<span style="color:#8b949e">[${pct(x.lo)}, ${pct(x.hi)}]</span><br>` +
          `confianza del modelo: ${pct(x.confidence)}`;
      } },
  });
}

const ROLE_COLORS = { TOP: "#d29922", JUNGLE: "#f778ba", MIDDLE: "#a371f7",
                      BOTTOM: "#58a6ff", UTILITY: "#3fb950" };

function renderLanes() {
  const cv = currentDetail.curve;
  const c = echarts.init($("#chartLanes"));
  const roles = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
  const series = roles.map((r, ri) => ({
    name: r, type: "line", smooth: true,
    data: cv.map((x) => {
      const k = x.contribs.find((q) => q.rol === r);
      if (!k) return null;
      return {
        value: k.pp,
        itemStyle: k.identificado
          ? { color: ROLE_COLORS[r] }
          : { color: "#161b22", borderColor: ROLE_COLORS[r], borderWidth: 2 },
        symbolSize: k.identificado ? 8 : 7,
      };
    }),
    lineStyle: { width: 2, color: ROLE_COLORS[r], opacity: 0.85 },
    ...(ri === 0 ? { markLine: { silent: true, symbol: "none",
        data: [{ yAxis: 0 }],
        lineStyle: { color: "#30363d", type: "dashed" } } } : {}),
  }));
  c.setOption({
    backgroundColor: "transparent",
    grid: { left: 60, right: 20, top: 34, bottom: 40 },
    legend: { textStyle: { color: "#8b949e", fontSize: 11 }, top: 0,
              itemWidth: 14, itemHeight: 8 },
    xAxis: { type: "category", data: cv.map((x) => x.landmark), name: "min",
             axisLabel: { color: "#8b949e" },
             axisLine: { lineStyle: { color: "#30363d" } } },
    yAxis: { axisLabel: { color: "#8b949e", formatter: (v) => v + " pp" },
             splitLine: { lineStyle: { color: "#21262d" } } },
    series,
    tooltip: {
      trigger: "axis",
      formatter: (ps) => {
        const i = ps[0].dataIndex;
        const x = cv[i];
        const rows = x.contribs.slice()
          .sort((a, b) => Math.abs(b.pp) - Math.abs(a.pp))
          .map((k) =>
            `<span style="color:${ROLE_COLORS[k.rol]}">■</span> ${k.rol}: ` +
            `${SIGN(k.pp)}${fmt(k.pp)} ± ${fmt(k.se_pp)} pp ` +
            `<span style="color:#8b949e">(Δoro ${SIGN(k.val_k)}${fmt(k.val_k)}k` +
            `${k.identificado ? "" : ", ◐"})</span>`)
          .join("<br>");
        return `<b>min ${x.landmark}</b> — P(azul) ${pct(x.p_blue)}<br>` + rows;
      },
    },
  });
}

function renderTable(players) {
  const lm = $("#lmSelector").value;
  const rows = players.filter((p) => String(p.landmark) === String(lm));
  const bySide = { blue: [], red: [] };
  rows.forEach((p) => bySide[p.side].push(p));
  const thead = `<tr><th></th><th>Jugador</th><th>Campeón</th><th>Rol</th>
    <th>K/D @min</th><th>Oro vs media</th><th>CS vs media</th>
    <th>Percentil de su rol</th></tr>`;
  const tr = (p) => {
    const pc = p.pct == null ? "—" : Math.round(p.pct);
    const bar = p.pct == null ? "" :
      `<div class="pct-bar"><div class="pct-fill" style="width:${pc}%"></div>
       <span class="pct-num">${pc}</span></div>`;
    return `<tr><td class="${p.side === "blue" ? "side-b" : "side-r"}"></td>
      <td>${p.name}</td><td>${p.champ}</td><td>${p.role}</td>
      <td>${p.kills}/${p.deaths}</td>
      <td class="${p.gold_adv >= 0 ? "pos" : "neg"}">${SIGN(p.gold_adv)}${p.gold_adv}</td>
      <td class="${p.cs_adv >= 0 ? "pos" : "neg"}">${SIGN(p.cs_adv)}${p.cs_adv}</td>
      <td>${bar}</td></tr>`;
  };
  $("#tablaJugadores").innerHTML =
    `<table><thead>${thead}</thead><tbody>` +
    bySide.blue.map(tr).join("") +
    `<tr><td colspan="8" style="height:8px;background:#161b22"></td></tr>` +
    bySide.red.map(tr).join("") +
    "</tbody></table>";
}
// refrescar tabla al cambiar landmark (la tabla usa el mismo selector)
document.addEventListener("change", (e) => {
  if (e.target.id === "lmSelector" && currentDetail) renderTable(currentDetail.players);
});

// ---------- draft ----------
async function loadChamps() {
  const v = (await (await fetch(
    "https://ddragon.leagueoflegends.com/api/versions.json")).json())[0];
  const data = await (await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${v}/data/es_ES/champion.json`)).json();
  CHAMPS = Object.values(data.data)
    .map((c) => ({ id: c.id, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const roles = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
  ["blue", "red"].forEach((side) => {
    const box = $(`#${side}Picks`);
    box.innerHTML = roles.map((r) => `
      <div><label>${r}</label>
      <select id="${side}-${r}">
        <option value="">—</option>
        ${CHAMPS.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
      </select></div>`).join("");
  });
}

$("#btnDraft").onclick = async () => {
  const roles = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
  const body = { blue: {}, red: {} };
  roles.forEach((r) => {
    const b = $(`#blue-${r}`).value, x = $(`#red-${r}`).value;
    if (b) body.blue[r] = b;
    if (x) body.red[r] = x;
  });
  const r = await fetch("/api/draft", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  const nameOf = (id) => CHAMPS.find((c) => c.id === id)?.name || id;
  const card = (x, side) => {
    const w = Math.min(Math.abs(x.pp_por_1000g) / 30 * 50, 50);
    const col = side === "red" ? "#f85149" : "#3fb950";
    return `<div class="draft-card">
      <div class="who"><b>${nameOf(x.champ)}</b><br>
        <span class="sub">${x.role} · ${x.tags.join("/") || "sin tags"}</span></div>
      <div class="pp" style="color:${col}">${SIGN(x.pp_por_1000g)}${x.pp_por_1000g}
        <span style="font-size:11px;color:#8b949e">pp/1000g</span></div>
      <div class="ppbar"><div class="ppbar-fill" style="
        ${x.pp_por_1000g >= 0 ? `left:50%;width:${w}%` : `right:50%;width:${w}%`};
        background:${col};opacity:${x.identificado ? 0.9 : 0.35}"></div></div>
      ${chip(x.identificado)}
    </div>`;
  };
  $("#draftOut").innerHTML = `
    <h4 style="margin-top:16px">Enemigos: a quién NO dejarle oro
      <span class="chip grey">por clase, min ~10</span></h4>
    ${[...d.red].sort((a, b) => b.pp_por_1000g - a.pp_por_1000g)
                .map((x) => card(x, "red")).join("")}
    <h4 style="margin-top:16px">Tu equipo: dónde rinde más tu oro</h4>
    ${[...d.blue].sort((a, b) => b.pp_por_1000g - a.pp_por_1000g)
                 .map((x) => card(x, "blue")).join("")}
    <p class="chart-note">${d.nota}.</p>`;
};

// ---------- init ----------
loadHealth();
loadChamps();
