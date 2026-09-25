/* LoLImpact frontend — claro, explicado, desde TU perspectiva */
const $ = (s) => document.querySelector(s);
const fmt = (x, d = 1) => Number(x).toFixed(d);
const pct = (p) => (p * 100).toFixed(0) + "%";
const SIGN = (v) => (v >= 0 ? "+" : "");

let CHAMPS = [];
let currentDetail = null;
let userSide = null;        // "blue" | "red" | null
let userName = null;        // riot name cargado en el perfil

const ROLE_COLORS = { TOP: "#d29922", JUNGLE: "#f778ba", MIDDLE: "#a371f7",
                      BOTTOM: "#58a6ff", UTILITY: "#3fb950" };
const ROLE_ES = { TOP: "Top", JUNGLE: "Jungla", MIDDLE: "Mid",
                  BOTTOM: "Bot", UTILITY: "Soporte" };

// ============ tooltips: contenido centralizado ============
const TIPS = {
  gold10: "Tu oro al minuto 10 menos el oro promedio de los 10 jugadores de la partida. " +
          "+400 significa que ibas 400g por encima del promedio.",
  spark: "Probabilidad de que TU equipo gane, del min 8 al 20, según el modelo. " +
         "Es tu partida resumida en una línea: se cae = tu equipo quedó peor.",
  kda: "Kills / muertes / asistencias del final de la partida.",
  dur: "Duración total en minutos.",
  curve: "Probabilidad de victoria de TU equipo. 50% = lanzamiento de moneda. " +
         "La franja gris es el margen de error del modelo (IC de credibilidad 95%).",
  lanesPP: "Puntos porcentuales de probabilidad de victoria que esa línea le sumó " +
           "(o restó) a tu equipo en ese minuto, comparado con una partida pareada.",
  kdMin: "Kills y muertes ACUMULADAS hasta el minuto seleccionado (no el total final).",
  goldVs: "Oro del jugador menos el promedio de los 10 en ese minuto. " +
          "+400 = 400g por encima del promedio de la partida.",
  csVs: "Subditos + monstruos, igual que la columna de oro.",
  pctRol: "Qué porcentaje de jugadores de esa posición (en ~30k partidas Esmeralda+) " +
          "tenía MENOS oro que él en ese minuto. 85 = iba más rico que el 85%.",
  pp1000: "Puntos porcentuales de victoria que gana su equipo por cada 1000 de oro " +
           "de ventaja que tenga un jugador de esa clase. +15pp: con 1000g de " +
           "ventaja, su equipo pasa de 50% a ~65%.",
};

// ============ navegación / health ============
document.querySelectorAll("nav button").forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll("nav button").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
    $("#view-" + b.dataset.view).classList.remove("hidden");
  };
});

async function loadHealth() {
  const h = await (await fetch("/api/health")).json();
  $("#health").innerHTML = `claves API vivas: <b>${h.claves_vivas}</b>`;
}

// ============ perfil + historial ============
$("#btnLoad").onclick = loadProfile;

async function loadProfile() {
  const rid = $("#riotId").value.trim();
  userName = rid.split("#")[0].trim();
  const region = $("#region").value;
  $("#historial").innerHTML =
    '<p class="placeholder">Cargando… las primeras cargas tardan un poco ' +
    '(límites de la API de Riot).</p>';
  const r = await fetch(`/api/profile?riot_id=${encodeURIComponent(rid)}&region=${region}`);
  if (!r.ok) {
    $("#historial").innerHTML =
      '<p class="placeholder">Sin datos: regenera las claves de la API o prueba más tarde.</p>';
    return;
  }
  const data = await r.json();
  if (data.degradado) showBanner(data.motivo);
  renderPatron(data.patron);
  renderHistory(data.matches);
}

function showBanner(msg) {
  const b = $("#bannerDegradado");
  b.textContent = "⚠ Modo degradado: " + msg + " — mostrando la última vista guardada.";
  b.classList.remove("hidden");
}

function renderPatron(p) {
  const el = $("#patron");
  if (!p) { el.classList.add("hidden"); return; }
  el.classList.remove("hidden");
  const block = (t, d, col) => `
    <div><div class="big" style="color:${col}">${SIGN(d.mean)}${d.mean}g</div>
    <div class="sub">${t} (${d.n} partidas)<br>rango probable: [${d.lo}, ${d.hi}]g</div></div>`;
  el.innerHTML = `
    <div style="max-width:280px"><b>Tu arranque típico</b>
      <div class="sub">${TIPS.gold10} Comparado entre tus victorias y derrotas —
      si los rangos se solapan, tu oro temprano no explica tus resultados.</div></div>
    <div class="sep"></div>
    ${block("en tus victorias", p.wins, "#3fb950")}
    ${block("en tus derrotas", p.losses, "#f85149")}`;
}

function renderHistory(matches) {
  const el = $("#historial");
  el.innerHTML = `
    <div class="hist-head">
      <div>Campeón</div>
      <div data-tip="${TIPS.kda}">KDA (?)</div>
      <div data-tip="${TIPS.dur}">Dur. (?)</div>
      <div data-tip="${TIPS.gold10}">Tu oro @min 10 (?)</div>
      <div data-tip="${TIPS.spark}">Tu probabilidad de ganar, minuto a minuto (?)</div>
      <div></div>
    </div>` + matches.map(matchRow).join("");
  matches.forEach((m) => {
    if (!m.curve || !m.curve.length) return;
    const c = echarts.init(document.querySelector(`#spark-${m.match_id}`),
                           null, { renderer: "svg" });
    const flip = m.side === "red";
    c.setOption({
      grid: { left: 0, right: 0, top: 3, bottom: 3 },
      xAxis: { show: false, data: m.curve.map((x) => x.m) },
      yAxis: { show: false, min: 0, max: 1 },
      series: [{
        type: "line", symbol: "none", smooth: true,
        data: m.curve.map((x) => (flip ? 1 - x.p : x.p)),
        lineStyle: { width: 1.6, color: m.win ? "#3fb950" : "#f85149" },
        areaStyle: { opacity: 0.13, color: m.win ? "#3fb950" : "#f85149" },
        markLine: { silent: true, symbol: "none", data: [{ yAxis: 0.5 }],
                    lineStyle: { color: "#30363d" } },
      }],
    });
    document.querySelector(`#row-${m.match_id}`).onclick = () =>
      openMatch(m.match_id, $("#region").value);
  });
}

function matchRow(m) {
  const g = m.my_gold_adv_10;
  return `
  <div class="match-row ${m.win ? "win" : "loss"}" id="row-${m.match_id}">
    <div class="mr-champ">${m.champ}
      <small>${ROLE_ES[m.role] || m.role} · ${m.win ? "victoria" : "derrota"}</small></div>
    <div class="mr-kda">${m.kda[0]} / ${m.kda[1]} / ${m.kda[2]}</div>
    <div class="mr-dur">${m.duration_min}m</div>
    <div class="mr-gold">${g !== undefined
      ? `<b class="${g >= 0 ? "pos" : "neg"}">${SIGN(g)}${g}g</b>` : "—"}
      <span class="sub">vs promedio</span></div>
    <div class="mr-spark" id="spark-${m.match_id}"></div>
    <div class="mr-arrow">›</div>
  </div>`;
}

// ============ detalle de partida ============
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

  // perspectiva: tu lado en esta partida
  userSide = null;
  if (userName) {
    const me = currentDetail.final.find(
      (p) => (p.name || "").toLowerCase() === userName.toLowerCase());
    if (me) userSide = me.side;
  }
  const meEntry = currentDetail.final.find(
    (p) => userSide && p.side === userSide &&
    (!userName || (p.name || "").toLowerCase() === userName.toLowerCase()));

  $("#detTitle").innerHTML =
    (meEntry
      ? `Tu ${meEntry.champ} — ` +
        (meEntry.win ? '<span class="badge win">VICTORIA</span>'
                     : '<span class="badge loss">DERROTA</span>')
      : `Partida ${matchId}`);
  $("#detMeta").innerHTML =
    `${currentDetail.duration_min} min · parche ${currentDetail.patch}`;

  renderCurve();
  renderLanes();

  const sel = $("#lmSelector");
  sel.innerHTML = currentDetail.curve.map((c) =>
    `<option value="${c.landmark}">min ${c.landmark}</option>`).join("");
  sel.value = currentDetail.curve[Math.max(1, currentDetail.curve.length - 3)]?.landmark ||
              currentDetail.curve[0].landmark;
  sel.onchange = () => renderTable();
  renderTable();
}

const pMine = (x) => (userSide === "red" ? 1 - x.p_blue : x.p_blue);
const ppMine = (v) => (userSide === "red" ? -v : v);

function renderCurve() {
  const c = echarts.init($("#chartCurve"));
  const cv = currentDetail.curve;
  c.setOption({
    backgroundColor: "transparent",
    grid: { left: 56, right: 24, top: 24, bottom: 44 },
    xAxis: { type: "category", data: cv.map((x) => x.landmark), name: "minuto",
             axisLine: { lineStyle: { color: "#30363d" } },
             axisLabel: { color: "#8b949e" } },
    yAxis: { min: 0, max: 1,
             axisLabel: { formatter: (v) => (v * 100) + "%", color: "#8b949e" },
             splitLine: { lineStyle: { color: "#21262d" } } },
    series: [
      { type: "line", data: cv.map((x) => (userSide === "red" ? 1 - x.hi : x.lo)),
        stack: "band", symbol: "none", lineStyle: { opacity: 0 }, silent: true },
      { type: "line",
        data: cv.map((x) => (userSide === "red" ? x.hi - x.lo : x.hi - x.lo)),
        stack: "band", symbol: "none", lineStyle: { opacity: 0 },
        areaStyle: { color: "rgba(88,166,255,0.14)" } },
      { type: "line", data: cv.map(pMine), symbol: "circle", symbolSize: 8,
        smooth: true,
        lineStyle: { width: 3, color: "#58a6ff" },
        itemStyle: { color: "#58a6ff" },
        markLine: { silent: true, symbol: "none", data: [{ yAxis: 0.5 }],
          lineStyle: { color: "#8b949e", type: "dashed" },
          label: { formatter: "50% = al azar", color: "#8b949e", position: "insideEndTop" } } },
    ],
    tooltip: { trigger: "axis",
      formatter: (ps) => {
        const i = ps[0].dataIndex;
        const x = cv[i];
        return `<b>min ${x.landmark}</b><br>` +
          `Probabilidad de que tu equipo gane: <b>${pct(pMine(x))}</b><br>` +
          `<span style="color:#8b949e">rango probable: ` +
          `[${pct(userSide === "red" ? 1 - x.hi : x.lo)}, ` +
          `${pct(userSide === "red" ? 1 - x.lo : x.hi)}]</span><br>` +
          `<span style="color:#8b949e">precisión del modelo en este minuto: ` +
          `${pct(x.confidence)}</span>`;
      } },
  });
}

function renderLanes() {
  const cv = currentDetail.curve;
  const c = echarts.init($("#chartLanes"));
  const roles = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
  const series = roles.map((r, ri) => ({
    name: ROLE_ES[r], type: "line", smooth: true,
    data: cv.map((x) => {
      const k = x.contribs.find((q) => q.rol === r);
      if (!k) return null;
      return {
        value: ppMine(k.pp),
        itemStyle: k.identificado
          ? { color: ROLE_COLORS[r] }
          : { color: "#161b22", borderColor: ROLE_COLORS[r], borderWidth: 2 },
        symbolSize: k.identificado ? 8 : 7,
      };
    }),
    lineStyle: { width: 2, color: ROLE_COLORS[r], opacity: 0.85 },
    ...(ri === 0 ? { markLine: { silent: true, symbol: "none",
        data: [{ yAxis: 0 }],
        lineStyle: { color: "#484f58", type: "dashed" },
        label: { formatter: "línea base", color: "#8b949e" } } } : {}),
  }));
  c.setOption({
    backgroundColor: "transparent",
    grid: { left: 56, right: 24, top: 40, bottom: 44 },
    legend: { textStyle: { color: "#8b949e", fontSize: 11 }, top: 4,
              itemWidth: 14, itemHeight: 8 },
    xAxis: { type: "category", data: cv.map((x) => x.landmark), name: "minuto",
             axisLabel: { color: "#8b949e" },
             axisLine: { lineStyle: { color: "#30363d" } } },
    yAxis: { axisLabel: { color: "#8b949e", formatter: (v) => v + " pp" },
             splitLine: { lineStyle: { color: "#21262d" } } },
    series,
    tooltip: { trigger: "axis",
      formatter: (ps) => {
        const i = ps[0].dataIndex;
        const x = cv[i];
        const rows = x.contribs.slice()
          .sort((a, b) => Math.abs(b.pp) - Math.abs(a.pp))
          .map((k) =>
            `<span style="color:${ROLE_COLORS[k.rol]}">■</span> ` +
            `${ROLE_ES[k.rol]}: ${SIGN(ppMine(k.pp))}${fmt(ppMine(k.pp))}` +
            ` ± ${fmt(k.se_pp)} pp ` +
            `<span style="color:#8b949e">(iba ${SIGN(k.val_k)}${fmt(k.val_k)}k de oro ` +
            `${k.val_k >= 0 ? "arriba" : "abajo"}${k.identificado ? "" : ", ◐ no confirmado"})</span>`)
          .join("<br>");
        return `<b>min ${x.landmark}</b> — tu equipo al ${pct(pMine(x))}<br>` + rows;
      } },
  });
}

function renderTable() {
  const lm = $("#lmSelector").value;
  const rows = currentDetail.players.filter(
    (p) => String(p.landmark) === String(lm));
  const mine = userSide || "blue";
  const enemy = mine === "blue" ? "red" : "blue";
  const bySide = {};
  bySide[mine] = rows.filter((p) => p.side === mine);
  bySide[enemy] = rows.filter((p) => p.side === enemy);

  const thead = `
    <tr>
      <th></th><th>Jugador</th><th>Campeón</th><th>Posición</th>
      <th data-tip="${TIPS.kdMin}">K / D al min <span class="th-q">?</span></th>
      <th data-tip="${TIPS.goldVs}">Oro vs promedio <span class="th-q">?</span></th>
      <th data-tip="${TIPS.csVs}">CS vs promedio <span class="th-q">?</span></th>
      <th data-tip="${TIPS.pctRol}">Vs su posición <span class="th-q">?</span></th>
    </tr>`;

  const tr = (p) => {
    const isMe = userName &&
      (p.name || "").toLowerCase() === userName.toLowerCase();
    const pc = p.pct == null ? null : Math.round(p.pct);
    const bar = pc == null ? "—" :
      `<div class="pct-bar"><div class="pct-fill" style="width:${pc}%"></div>
       <div class="pct-num">${pc}</div></div>`;
    return `<tr class="${isMe ? "you-row" : ""}">
      <td style="color:${p.side === mine ? "#3fb950" : "#f85149"}">
        ${p.side === mine ? "▲" : "▼"}</td>
      <td>${p.name}${isMe ? ' <span class="chip you">TÚ</span>' : ""}</td>
      <td>${p.champ}</td><td>${ROLE_ES[p.role] || p.role}</td>
      <td>${p.kills} / ${p.deaths}</td>
      <td class="${p.gold_adv >= 0 ? "pos" : "neg"}">${SIGN(p.gold_adv)}${p.gold_adv}g</td>
      <td class="${p.cs_adv >= 0 ? "pos" : "neg"}">${SIGN(p.cs_adv)}${p.cs_adv}</td>
      <td>${bar}</td></tr>`;
  };

  $("#tablaJugadores").innerHTML =
    `<table><thead>${thead}</thead><tbody>` +
    bySide[mine].map(tr).join("") +
    `<tr class="team-sep"><td colspan="8"></td></tr>` +
    bySide[enemy].map(tr).join("") +
    "</tbody></table>";
}

// ============ draft ============
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
      <div><label>${ROLE_ES[r]}</label>
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
        <span class="sub">${ROLE_ES[x.role]} · clase: ${x.tags.join(" / ") || "—"}</span></div>
      <div class="pp" style="color:${col}">${SIGN(x.pp_por_1000g)}${x.pp_por_1000g}
        <small data-tip="${TIPS.pp1000}">pp por 1000g (?)</small></div>
      <div class="ppbar"><div class="mid"></div>
        <div class="ppbar-fill" style="
          ${x.pp_por_1000g >= 0 ? `left:50%;width:${w}%` : `right:50%;width:${w}%`};
          background:${col};opacity:${x.identificado ? 0.9 : 0.35}"></div></div>
      ${x.identificado
        ? '<span class="chip green" data-tip="El modelo distingue este valor del ruido con 95% de confianza.">● confirmado</span>'
        : '<span class="chip grey" data-tip="El intervalo de confianza incluye el 0: valor indicativo, no confirmado.">◐ indicativo</span>'}
    </div>`;
  };
  $("#draftOut").innerHTML = `
    <h4 style="margin-top:18px">Enemigos — mientras más alto, MENOS oro dejarle</h4>
    ${[...d.red].sort((a, b) => b.pp_por_1000g - a.pp_por_1000g)
                .map((x) => card(x, "red")).join("")}
    <h4 style="margin-top:18px">Tu equipo — donde tu oro rinde más</h4>
    ${[...d.blue].sort((a, b) => b.pp_por_1000g - a.pp_por_1000g)
                 .map((x) => card(x, "blue")).join("")}
    <p class="chart-note">${d.nota}.</p>`;
};

// ============ init ============
loadHealth();
loadChamps();
