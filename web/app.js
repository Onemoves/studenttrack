(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var DS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
  var ymd = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  var todayStr = function () { return ymd(new Date()); };
  var P = function (s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); };
  var addDays = function (s, n) { var d = P(s); d.setDate(d.getDate() + n); return ymd(d); };
  var diff = function (s) { return Math.round((P(s) - P(todayStr())) / 86400000); };
  var shortDate = function (s) { var d = P(s); return MON[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear(); };
  var longDate = function (s) { var d = P(s); return DAYS[d.getDay()] + ", " + MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear(); };
  var fmtTime = function (t) { if (!t) return ""; var p = t.split(":"), h = +p[0]; return (h % 12 || 12) + ":" + p[1] + " " + (h >= 12 ? "PM" : "AM"); };
  var dayLabel = function (s) { var n = diff(s); return n === 0 ? "Today" : n === -1 ? "Yesterday" : n === 1 ? "Tomorrow" : longDate(s); };
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ---------- icons ---------- */
  var IC = {
    home: "M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6", plus: "M12 5v14M5 12h14", minus: "M5 12h14", close: "M6 6l12 12M18 6L6 18",
    piggy: "M4 12a8 6 0 0 1 8-6h3a5 5 0 0 1 5 5v1a4 4 0 0 1-2 3.4V19h-3v-2h-5v2H7v-3A6 6 0 0 1 4 12zM15.5 11h.01M20 9l1.5-.5M9 6V4h4",
    swap: "M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7", list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
    notes: "M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6", tasks: "M4 5h16v14H4zM8 12l3 3 5-6", calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
    history: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2", user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
    sliders: "M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6", chart: "M5 20V10M12 20V4M19 20v-7", wallet: "M4 7a2 2 0 0 1 2-2h11v3M4 7v11a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H6a2 2 0 0 1-2-1zM16 14h.01",
    flame: "M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z", book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 8h7",
    search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5", edit: "M4 20h4L19 9l-4-4L4 16zM13 7l4 4", trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
    check: "M5 12l5 5 9-10", left: "M15 5l-7 7 7 7", right: "M9 5l7 7-7 7", more: "M5 12h.01M12 12h.01M19 12h.01", clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
    arrowup: "M12 19V5M6 11l6-6 6 6", arrowdown: "M12 5v14M6 13l6 6 6-6", cap: "M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v6",
    eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z", eyeoff: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 4l16 16",
    sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
    moon: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z",
    vol: "M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11", mute: "M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6",
    chat: "M4 5h16v11H9l-5 4z", send: "M22 3L11 14M22 3l-7 19-4-8-8-4z", clip: "M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7",
    camera: "M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
    logout: "M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9", shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
    users: "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM21 19v-1a4 4 0 0 0-3-3.9M16 4.2a3 3 0 0 1 0 5.6",
    spark: "M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z", pen: "M4 20l1-4L17 4l3 3L8 19zM15 6l3 3",
    cart: "M3 4h2l2.4 11h10.2l2-8H6.6M9.5 20h.01M17 20h.01", gift: "M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-2.5 0-4-1-4-2.5S10.5 3 12 7zM12 7c2.5 0 4-1 4-2.5S13.5 3 12 7z",
    plane: "M3 11l18-7-7 18-3-8z", star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
    heart: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"
  };
  var ic = function (n) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (IC[n] || IC.list) + '"/></svg>'; };
  var logo = function () { return '<span class="logo">' + ic("cap") + '</span>'; };
  function pig(cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 120 100" aria-hidden="true">' +
      '<rect x="32" y="72" width="12" height="16" rx="5" fill="#FF8B4D" stroke="#1B1A2E" stroke-width="3"/><rect x="72" y="72" width="12" height="16" rx="5" fill="#FF8B4D" stroke="#1B1A2E" stroke-width="3"/>' +
      '<path d="M20 56c-9-1-13-8-8-14" fill="none" stroke="#1B1A2E" stroke-width="5" stroke-linecap="round"/>' +
      '<ellipse cx="58" cy="56" rx="40" ry="30" fill="#FF5C8F" stroke="#1B1A2E" stroke-width="3"/>' +
      '<path d="M46 32l4-16 16 12z" fill="#FF8DB0" stroke="#1B1A2E" stroke-width="3" stroke-linejoin="round"/>' +
      '<ellipse cx="96" cy="60" rx="11" ry="9" fill="#FFB3CB" stroke="#1B1A2E" stroke-width="3"/><ellipse cx="93" cy="60" rx="1.8" ry="2.8" fill="#1B1A2E"/><ellipse cx="100" cy="60" rx="1.8" ry="2.8" fill="#1B1A2E"/>' +
      '<circle cx="82" cy="46" r="3.5" fill="#1B1A2E"/><rect x="46" y="28" width="22" height="5" rx="2.5" fill="#1B1A2E"/>' +
      '<circle cx="57" cy="14" r="11" fill="#FFC83D" stroke="#1B1A2E" stroke-width="3"/><path d="M57 9v10M54 12h4.5a2.2 2.2 0 0 1 0 4.4H54" fill="none" stroke="#1B1A2E" stroke-width="2" stroke-linecap="round"/></svg>';
  }
  function sunSvg() {
    return '<svg class="sun" viewBox="0 0 200 200" aria-hidden="true"><g fill="none" stroke="#1B1A2E" stroke-width="3" stroke-linecap="round" opacity=".85">' +
      [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(function (a) { return '<path d="M100 14v22" transform="rotate(' + a + ' 100 100)"/>'; }).join("") +
      '</g><circle cx="100" cy="100" r="46" fill="#FFF3C4" stroke="#1B1A2E" stroke-width="3"/>' +
      '<g stroke="#FF8B4D" stroke-width="5" stroke-linecap="round"><path d="M64 112h72M68 126h64M76 140h48" opacity=".9"/></g></svg>';
  }

  /* ---------- state ---------- */
  var DEFAULTS = { name: "", course: "", target: 0, theme: "light", hide: false, avatar: "" };
  var emptyData = function () { return { savings: [], money: [], notes: [], tasks: [], requests: [], journal: [], lists: [] }; };
  var data = emptyData();
  var settings = Object.assign({}, DEFAULTS);
  var store = null, route = "dashboard", me = null, authMode = "login", needCode = false, pinged = "", admKey = "", loaded = false;
  var adm = { pending: [], decided: [], users: [] };
  var cal = { y: new Date().getFullYear(), m: new Date().getMonth() }, sel = todayStr();
  var ui = { sf: "all", hf: "all", lim: 30, nf: "all", nq: "", period: "week", ek: "expense", tday: todayStr(), jq: "", jmood: 4, jdate: todayStr(), jopen: false, list: null };
  var sheetState = null, lastDay = "", lastHour = -1, toastTimer = null, armed = null, armTimer = null, setChain = Promise.resolve();

  function applySettings(o) {
    settings = Object.assign({}, DEFAULTS, o || {});
    var r = document.documentElement;
    if (settings.theme === "dark" || settings.theme === "light") r.setAttribute("data-theme", settings.theme); else r.removeAttribute("data-theme");
    var dark = settings.theme === "dark" || (settings.theme === "auto" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var m = document.getElementById("themecolor"); if (m) m.setAttribute("content", dark ? "#080C1E" : "#F5EEE0");
  }
  function api(method, url, body) {
    var real = (method === "PUT" || method === "PATCH" || method === "DELETE") ? "POST" : method;   /* some free hosts block PUT/PATCH/DELETE */
    var o = { method: real, credentials: "same-origin", headers: { "X-Requested-With": "studenttrack" } };
    if (real !== method) o.headers["X-Method"] = method;
    if (body !== undefined) { o.headers["Content-Type"] = "application/json"; o.body = JSON.stringify(body); }
    var up = url.replace(/^\/api/, ""), qi = up.indexOf("?"), extra = ""; if (qi >= 0) { extra = "&" + up.slice(qi + 1); up = up.slice(0, qi); }
    return fetch("api.php?r=" + encodeURIComponent(up) + extra, o).then(function (r) {
      return r.text().then(function (txt) {
        var j = null; try { j = JSON.parse(txt); } catch (e) {}
        if (j === null || typeof j !== "object") { var ue = new Error("The server sent an unexpected reply. Check that api.php and config.php are uploaded and the database details are right."); ue.status = r.status || 500; throw ue; }
        if (!r.ok) {
          if (r.status === 401 && me) showAuth("Your session ended. Please log in again.");
          var e = new Error(j.error || "Something went wrong."); e.status = r.status; throw e;
        }
        return j;
      });
    }, function () { var ne = new Error("Can't reach the server. Check your connection."); ne.status = 0; throw ne; });
  }
  function load() {
    return Promise.all([api("GET", "/api/data"), api("GET", "/api/extra").catch(function () { return null; })]).then(function (rs) {
      var r = rs[0]; if (rs[1]) xd = { classes: rs[1].classes || [], grades: rs[1].grades || [], budgets: rs[1].budgets || [], study: rs[1].study || [] };
      data.savings = r.savings; data.money = r.money; data.notes = r.notes; data.tasks = r.tasks; data.requests = r.requests;
      data.journal = r.journal || []; data.lists = r.lists || [];
      var oldAv = settings.avatar, oldTheme = settings.theme; applySettings(r.settings);
      if (me && (oldAv !== settings.avatar || oldTheme !== settings.theme)) renderTop();      // the picture lives in the top bar
      var first = !loaded; loaded = true;
      dataChanged(first);
    });
  }
  function loadAdmin() {
    return api("GET", "/api/admin/overview").then(function (r) {
      var key = JSON.stringify([r.pending, r.decided, r.users]), changed = key !== admKey, first = !loaded;
      admKey = key; r.skew = r.serverNow - Date.now(); adm = r; loaded = true;
      if (changed || route === "users" || first) dataChanged(first);
    });
  }
  function ago(ts) {
    var s = Math.max(0, Math.round((Date.now() + (adm.skew || 0) - ts) / 1000));
    if (s < 45) return "just now";
    var m = Math.round(s / 60); if (m < 60) return m + " min ago";
    var h = Math.round(m / 60); if (h < 24) return h + " hr ago";
    var d = Math.round(h / 24); return d + (d === 1 ? " day ago" : " days ago");
  }
  function ping() { if (me && me.role === "user") api("POST", "/api/ping", { page: route }).catch(function () {}); }
  function userStore() {
    return {
      add: function (path, o) { return api("POST", "/api/" + path, o).then(function (r) { return load().then(function () { return r.id; }); }); },
      patch: function (path, id, p) { return api("PATCH", "/api/" + path + "/" + id, p).then(load); },
      remove: function (path, id) { return api("DELETE", "/api/" + path + "/" + id).then(load); },
      saveSettings: function (p) {
        applySettings(Object.assign({}, settings, p)); dataChanged();
        var snap = Object.assign({}, settings); delete snap.avatar;        // the picture is saved separately
        setChain = setChain.then(function () { return api("PUT", "/api/settings", snap); }).catch(function () {});
        return setChain;
      }
    };
  }
  var USER_ROUTES = ["dashboard", "savings", "spending", "notes", "tasks", "calendar", "schedule", "study", "grades", "journal", "lists", "history", "profile", "chat", "more"];
  var validRoutes = function () { return me && me.role === "admin" ? ["requests", "users", "chat", "profile"] : USER_ROUTES; };

  function showAuth(msg) {
    me = null; store = null; sheetState = null; loaded = false;
    $("sheet").hidden = true; $("sheet").innerHTML = "";
    data = emptyData(); xd = { classes: [], grades: [], budgets: [], study: [] }; pinged = ""; admKey = "";
    applySettings({ theme: "auto" });
    document.body.classList.add("noauth");
    $("auth").hidden = false; renderAuth(msg);
  }
  function renderAuth(msg) {
    var reg = authMode === "register";
    $("auth").innerHTML = '<div class="card auth-card pg"><div class="auth-brand">' + logo() + '<h1>StudentTrack</h1><p>' + (reg ? "Create your private student account." : "Small steps. Big goals. Log in to continue.") + '</p></div>' +
      '<form id="authf" class="form"><div class="seg"><button type="button" data-act="authmode" data-v="login" class="' + (reg ? "" : "on") + '">Log in</button><button type="button" data-act="authmode" data-v="register" class="' + (reg ? "on" : "") + '">Sign up</button></div>' +
      '<div class="field"><label for="a-user">Username</label><input id="a-user" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="20" required></div>' +
      (reg ? '<div class="field"><label for="a-name">Your name (optional)</label><input id="a-name" type="text" maxlength="30" autocomplete="given-name"></div>' : "") +
      (reg && needCode ? '<div class="field"><label for="a-code">Sign-up code</label><input id="a-code" type="text" autocomplete="off" maxlength="60" required></div>' : "") +
      '<div class="field"><label for="a-pass">Password</label><input id="a-pass" type="password" autocomplete="' + (reg ? "new-password" : "current-password") + '" maxlength="128" required>' + (reg ? '<p class="hint">At least 8 characters.</p>' : "") + '</div>' +
      (reg ? '<p class="hint">Heads up: the admin can see when you are online, which page you are on, and short labels of what you do, like “Added a task”. Your amounts, notes, journal and lists stay private.</p>' : "") + '<p class="err" id="a-err" role="alert">' + esc(msg || "") + '</p><button class="btn" id="a-go" type="submit">' + (reg ? "Create account" : "Log in") + '</button></form></div>';
  }
  function start(user, st) {
    me = user; fLoad(); store = me.role === "admin" ? {} : userStore(); loaded = false;
    if (st) applySettings(st);
    document.body.classList.remove("noauth"); $("auth").hidden = true;
    $("mode-note").textContent = "Signed in as @" + me.username + (me.role === "admin" ? " (admin)" : "") + ". Your data is private to this account.";
    setRoute();
    return (me.role === "admin" ? loadAdmin() : load()).catch(function () { toast("Couldn't load your data. Try refreshing."); });
  }
  function boot() {
    api("GET", "/api/me").then(function (r) { start(r.user, r.settings); }, function (er) {
      api("GET", "/api/public").then(function (r) { needCode = !!r.needCode; }, function () {}).then(function () { showAuth(er.status && er.status !== 401 ? er.message : ""); });
    });
  }

  /* ---------- derived ---------- */
  var num = function (x) { return +x.amount || 0; };
  var SIGN = { deposit: 1, to_savings: 1, withdraw: -1, to_wallet: -1 };
  var TYPE_LABEL = { deposit: "Deposit", withdraw: "Withdraw", to_wallet: "Transfer to wallet", to_savings: "Transfer to savings" };
  var KIND_LABEL = { assignment: "Assignment", quiz: "Quiz", project: "Project", exam: "Exam", note: "Note" };
  var DEP_CATS = ["Allowance", "Part-time", "Gift", "Tuition", "Savings", "Others"], WD_CATS = ["Tuition", "Food", "Transport", "School", "Allowance", "Others"];
  var EXP_CATS = ["Food", "Transport", "School", "Tuition", "Load", "Others"], INC_CATS = ["Allowance", "Work", "Gift", "Others"], TAKE_CATS = ["Cash out", "Allowance", "Others"];
  var SUBJECTS = ["IT", "Math", "English", "Science", "Filipino"], TAGS = ["Class", "Study", "Homework", "Personal", "Workout"];
  var PALETTE = ["#3B5BFF", "#8B6CFF", "#26C485", "#FFB020", "#FF5C8F", "#14B8D4", "#FF7A3D", "#7DD3FC"];
  var CAT_COLOR = { Food: "#3B5BFF", Transport: "#8B6CFF", School: "#26C485", Load: "#14B8D4", Others: "#FFB020", Allowance: "#26C485", Work: "#3B5BFF", Gift: "#FF5C8F", Bills: "#FFB020", Tuition: "#FF7A3D" };
  function colorOf(name) { if (CAT_COLOR[name]) return CAT_COLOR[name]; var h = 0; String(name).split("").forEach(function (c) { h = (h * 31 + c.charCodeAt(0)) >>> 0; }); return PALETTE[h % PALETTE.length]; }
  var fmt = function (n) { var w = Math.abs(n - Math.round(n)) < 0.005; return (n < 0 ? "-" : "") + "₱" + Math.abs(n).toLocaleString("en-PH", { minimumFractionDigits: w ? 0 : 2, maximumFractionDigits: 2 }); };
  var money = function (n) { return settings.hide ? "₱ ••••" : fmt(n); };
  /* an amount that counts up from 0 when it scrolls into view */
  var cu = function (n) { return '<b class="num cu" data-to="' + (+n || 0) + '">' + money(n) + '</b>'; };
  function savingsBal() { return data.savings.reduce(function (s, x) { return s + SIGN[x.type] * num(x); }, 0); }
  function walletBal() {
    var b = 0;
    /* expenses are only a log: they never reduce this. Income adds, "take" removes. */
    data.money.forEach(function (x) { if (x.kind === "income") b += num(x); else if (x.kind === "take") b -= num(x); });
    data.savings.forEach(function (x) { if (x.type === "to_wallet") b += num(x); else if (x.type === "to_savings") b -= num(x); });
    return b;
  }
  function weekStart() { var d = new Date(); d.setDate(d.getDate() - d.getDay()); return ymd(d); }
  function inPeriod(date, p) {
    var t = todayStr();
    if (p === "today") return date === t;
    if (p === "week") return date >= addDays(t, -6) && date <= t;      /* rolling last 7 days, so Sunday does not reset to zero */
    if (p === "month") return date.slice(0, 7) === t.slice(0, 7);
    return true;
  }
  function moneySum(kind, p) { return data.money.filter(function (x) { return x.kind === kind && inPeriod(x.date, p); }).reduce(function (s, x) { return s + num(x); }, 0); }
  function byCat(kind, p) {
    var m = {}; data.money.forEach(function (x) { if (x.kind === kind && inPeriod(x.date, p)) m[x.category] = (m[x.category] || 0) + num(x); });
    return Object.keys(m).map(function (k) { return { name: k, value: m[k], color: colorOf(k) }; }).sort(function (a, b) { return b.value - a.value; });
  }
  var tgtPct = function () { return settings.target > 0 ? Math.max(0, Math.min(100, Math.round(savingsBal() / settings.target * 100))) : 0; };
  function streak() {
    var set = {}; data.tasks.concat(data.notes).forEach(function (x) { if (x.done && x.doneDate) set[x.doneDate] = 1; }); xd.study.forEach(function (x) { if (x.minutes >= 10) set[x.date] = 1; });
    var d = todayStr(); if (!set[d]) d = addDays(d, -1);
    var n = 0; while (set[d]) { n++; d = addDays(d, -1); } return n;
  }
  function greet() { var h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; }
  function todayItems() {
    var t = todayStr(), tm = addDays(t, 1), a = [];
    data.tasks.forEach(function (x) { if (x.date === t) a.push({ k: "task", id: x.id, title: x.title, sub: x.tag + (x.time ? " · " + fmtTime(x.time) : ""), done: x.done, today: true, key: x.time || "99:99" }); });
    data.notes.forEach(function (x) {
      if (!x.dueDate) return;
      var o = { k: "note", id: x.id, title: x.title, done: x.done, key: x.dueTime || "99:98" };
      if (x.dueDate === t) { o.sub = x.subject + " · " + KIND_LABEL[x.kind] + " · Due today" + (x.dueTime ? " " + fmtTime(x.dueTime) : ""); o.today = true; a.push(o); }
      else if (x.dueDate === tm && !x.done) { o.sub = x.subject + " · " + KIND_LABEL[x.kind] + " · Due tomorrow"; o.today = false; o.key = "99:99"; a.push(o); }
      else if (x.dueDate < t && !x.done && x.kind !== "note") { o.sub = x.subject + " · " + KIND_LABEL[x.kind] + " · Overdue"; o.today = false; o.key = "00:00"; o.overdue = true; a.push(o); }
    });
    a.sort(function (p, q) { return (p.done - q.done) || (p.key < q.key ? -1 : p.key > q.key ? 1 : 0); });
    return a;
  }
  var todayCount = function (items) { var t = items.filter(function (i) { return i.today; }); return { n: t.length, d: t.filter(function (i) { return i.done; }).length }; };
  function dueInfo(x) {
    if (!x.dueDate) return { t: "No due date", cls: "" };
    var n = diff(x.dueDate), tm = x.dueTime ? " · " + fmtTime(x.dueTime) : "";
    if (x.done) return { t: "Due " + shortDate(x.dueDate), cls: "" };
    if (n < 0) return { t: "Overdue · " + shortDate(x.dueDate), cls: "due" };
    return { t: n === 0 ? "Due today" + tm : n === 1 ? "Due tomorrow" + tm : "Due " + shortDate(x.dueDate) + tm, cls: n <= 1 ? "pend" : "" };
  }

  /* journal + lists */
  var MOODS = [["😞", "Rough"], ["🙁", "Meh"], ["😐", "Okay"], ["🙂", "Good"], ["🤩", "Great"]];
  var PROMPTS = ["What made you smile today?", "One thing you’re proud of this week…", "What’s weighing on your mind right now?", "Who helped you today, and how?", "What did you learn today?", "Something you want to remember about today…", "What would make tomorrow great?", "Three things you’re grateful for:"];
  function journalStreak() {
    var set = {}; data.journal.forEach(function (x) { set[x.date] = 1; });
    var d = todayStr(); if (!set[d]) d = addDays(d, -1);
    var n = 0; while (set[d]) { n++; d = addDays(d, -1); } return n;
  }
  function moodOn(date) {
    var l = data.journal.filter(function (x) { return x.date === date; });
    return l.length ? Math.round(l.reduce(function (s, x) { return s + x.mood; }, 0) / l.length) : 0;
  }
  var LIST_COLORS = ["blue", "orange", "mint", "pink", "yellow", "purple"], LIST_ICONS = ["list", "cart", "gift", "plane", "book", "star", "heart", "home"];
  var LIST_PRESETS = [["Grocery", "cart", "mint"], ["Wishlist", "gift", "pink"], ["Packing", "plane", "blue"], ["Bucket list", "star", "yellow"], ["Study goals", "book", "purple"]];
  var listDone = function (l) { return l.items.filter(function (i) { return i.done; }).length; };
  var LCOLOR = { blue: "t-blue", orange: "t-orange", mint: "t-mint", pink: "t-pink", yellow: "t-yellow", purple: "t-purple" };
  var LSWATCH = { blue: "rgb(var(--blue-s))", orange: "rgb(var(--orange))", mint: "rgb(var(--mint))", pink: "rgb(var(--pink))", yellow: "rgb(var(--yellow))", purple: "rgb(var(--purple))" };

  /* ---------- count-up + scroll reveal ---------- */
  function runCount(el) {
    var to = +el.dataset.to, kind = el.dataset.k || "p", suf = el.dataset.suf || "";
    if (reduceMotion || !isFinite(to) || to === 0 || (kind === "p" && settings.hide)) return;
    var t0 = performance.now(), dur = 950;
    (function step(t) {
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      if (kind === "p") el.textContent = fmt(p < 1 ? Math.round(to * e) : to); else el.textContent = Math.round(to * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  var io = null;
  function reveal(root, animate) {
    var els = root.querySelectorAll(".rv");
    if (io) { io.disconnect(); io = null; }
    root.classList.toggle("static", !animate);
    if (!animate || reduceMotion || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var first = true;
    io = new IntersectionObserver(function (entries) {
      var initial = first; first = false;   /* what is already on screen simply appears; only things scrolled into view later fade in */
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; io.unobserve(el);
        if (!initial) el.classList.add("fx");
        el.classList.add("in");
        el.querySelectorAll(".cu").forEach(runCount);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }
  function burst(btn) {
    if (!btn || reduceMotion) return;
    var cols = ["--mint", "--yellow", "--pink", "--blue-s", "--orange"];
    for (var i = 0; i < 10; i++) {
      var s = document.createElement("i"), a = Math.PI * 2 * i / 10 + Math.random() * 0.5, r = 28 + Math.random() * 24;
      s.className = "confetti"; s.style.setProperty("--x", Math.cos(a) * r + "px"); s.style.setProperty("--y", Math.sin(a) * r + "px"); s.style.setProperty("--r", Math.round(Math.random() * 360) + "deg");
      s.style.background = "rgb(var(" + cols[i % 5] + "))"; btn.appendChild(s);
      (function (n) { setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, 800); })(s);
    }
  }
  var freshCls = function (id) { return ui.newId === id ? " listin" : ""; };

  /* ---------- chrome ---------- */
  var NAV = [["dashboard", "Dashboard", "home"], ["savings", "Savings", "piggy"], ["spending", "Spending", "wallet"], ["notes", "Notes & Assignments", "notes"], ["tasks", "Tasks", "tasks"], ["calendar", "Calendar", "calendar"], ["schedule", "Class Schedule", "clock"], ["study", "Study Timer", "flame"], ["grades", "Grades & GWA", "cap"], ["chat", "Chat", "chat"], ["journal", "Journal", "pen"], ["lists", "Lists", "list"], ["history", "History", "history"], ["profile", "Profile", "user"]];
  var TABS = [["dashboard", "Home", "home"], ["savings", "Savings", "piggy"], ["notes", "Notes", "notes"], ["chat", "Chat", "chat"], ["more", "More", "more"]];
  var ADMIN_NAV = [["requests", "Requests", "shield"], ["users", "Users", "users"], ["chat", "Chat", "chat"], ["profile", "Settings", "sliders"]];
  var navItems = function () { return me && me.role === "admin" ? ADMIN_NAV : NAV; };
  var TITLES = {
    dashboard: ["Dashboard", "Your day at a glance."],
    savings: ["Savings", "Your total savings and every transaction."], spending: ["Spending", "What you spend each day, week and month."],
    notes: ["Notes & Assignments", "Everything you need to finish, in one place."], tasks: ["Daily Tasks", "Plan your day and check things off."],
    calendar: ["Calendar", "Your tasks and deadlines by date."], schedule: ["Class Schedule", "Your week of classes, always at hand."], study: ["Study Timer", "Focus in rounds. Every session counts."], grades: ["Grades & GWA", "Track your subjects and your average."], history: ["Transaction History", "All your savings and spending, newest first."],
    journal: ["Journal", "Write it down. Future you will thank you."], lists: ["Lists", "Groceries, wishlists, packing and more."], chat: ["Chat", "Message your friends and the admin."],
    profile: ["Profile", "Your progress, settings and account."], more: ["More", "Everything else in StudentTrack."],
    requests: ["Deletion requests", "Nothing is deleted until you approve it."], users: ["Users", "Accounts that use StudentTrack."]
  };
  function renderSide() {
    $("side").innerHTML = '<div class="brand">' + logo() + '<div><b>StudentTrack</b><small>Study · Save · Achieve</small></div></div>' +
      '<nav class="nav" aria-label="Menu">' + navItems().map(function (n) { return '<a href="#' + n[0] + '" class="' + (route === n[0] ? "on" : "") + '">' + ic(n[2]) + n[1] + (n[0] === "requests" && adm.pending.length ? '<span class="nb">' + adm.pending.length + '</span>' : "") + (n[0] === "chat" && chatBadge() ? '<span class="nb">' + chatBadge() + '</span>' : "") + '</a>'; }).join("") + '</nav>' +
      '<div class="motto">' + ic("spark") + '<span>“Small steps every day lead to big results.”</span></div>';
  }
  function renderTop() {
    var admin = me && me.role === "admin";
    var titles = route === "profile" && admin ? ["Settings", "Your admin account."] : (TITLES[route] || TITLES.more);
    $("top").innerHTML = '<div class="brand-m">' + logo() + '<div><b>StudentTrack</b><small>Small steps. Big goals.</small></div></div>' +
      '<div class="pgt"><h1>' + titles[0] + '</h1><p>' + titles[1] + '</p></div>' +
      (!admin ? '<form class="gs" id="gsf" role="search"><div class="srch">' + ic("search") + '<input id="gs-q" type="search" placeholder="Search tasks, notes, subjects..." aria-label="Search notes" autocomplete="off" value="' + esc(ui.nq) + '"></div></form>' : '<span class="gs"></span>') +
      '<div class="clockp hidden sm:flex">' + ic("clock") + '<div><b id="c-time"></b><small id="c-date"></small></div></div>';
    tick(true);
  }
  function renderTabs() {
    var admin = me && me.role === "admin";
    var list = admin ? ADMIN_NAV : TABS;
    var cur = !admin && ["spending", "tasks", "history", "journal", "lists", "calendar", "schedule", "study", "grades", "profile", "more"].indexOf(route) >= 0 ? "more" : route, idx = 0;
    list.forEach(function (t, i) { if (t[0] === cur) idx = i; });
    $("tabs").style.setProperty("--n", list.length); $("tabs").style.setProperty("--i", idx);
    $("tabs").innerHTML = list.map(function (t) { return '<a href="#' + t[0] + '" class="' + (cur === t[0] ? "on" : "") + '">' + ic(t[2]) + '<span>' + t[1] + '</span>' + (t[0] === "chat" && chatBadge() ? '<i class="tbn">' + chatBadge() + '</i>' : "") + '</a>'; }).join("");
  }
  function tick(force) {
    var d = new Date(), h = d.getHours();
    var a = $("c-date"), c = $("c-time"), m = $("h-time");
    var ts = (h % 12 || 12) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()) + " " + (h >= 12 ? "PM" : "AM");
    if (c) { c.textContent = ts; if (a) a.textContent = MON[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear(); }
    if (m) m.textContent = ts.replace(/:\d\d (?=[AP]M)/, " ");
    if (force === true) return;
    if (todayStr() !== lastDay) { lastDay = todayStr(); lastHour = h; renderAll(); }
    else if (h !== lastHour) { lastHour = h; renderTop(); }
  }

  /* ---------- shared pieces ---------- */
  function donut(parts, total, label) {
    var C = 2 * Math.PI * 52, off = 0;
    var h = '<div class="dnw"><svg viewBox="0 0 130 130" aria-hidden="true"><circle cx="65" cy="65" r="52" fill="none" stroke="rgb(var(--track))" stroke-width="18"/>';
    parts.forEach(function (p) { var len = total > 0 ? p.value / total * C : 0; h += '<circle class="draw" cx="65" cy="65" r="52" fill="none" stroke="' + p.color + '" stroke-width="18" style="--len:' + Math.max(0, len - 3).toFixed(2) + ";--c:" + C.toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '"/>'; off += len; });
    return h + '</svg><div class="mid"><b class="num">' + money(total) + '</b><small>' + label + '</small></div></div>';
  }
  function legend(parts, total) {
    return '<ul class="leg">' + parts.slice(0, 6).map(function (p) { return '<li><i style="background:' + p.color + '"></i><span>' + esc(p.name) + '</span><b>' + Math.round(p.value / total * 100) + '%</b></li>'; }).join("") + '</ul>';
  }
  function ring(p, color, label, sub) {
    var C = 2 * Math.PI * 26;
    return '<div class="ringc"><div class="rw"><svg viewBox="0 0 62 62" aria-hidden="true"><circle cx="31" cy="31" r="26" fill="none" stroke="rgb(var(--track))" stroke-width="8"/><circle class="draw" cx="31" cy="31" r="26" fill="none" stroke="' + color + '" stroke-width="8" stroke-linecap="round" style="--len:' + (C * Math.min(100, p) / 100).toFixed(1) + ";--c:" + C.toFixed(1) + '"/></svg><b>' + Math.round(p) + '%</b></div>' + label + '<small>' + sub + '</small></div>';
  }
  function itemRow(it) {
    return '<li class="ti-row' + (it.done ? " isdone" : "") + freshCls(it.id) + '"><button class="ck' + (ui.fresh === it.id ? " fresh" : "") + '" role="checkbox" aria-checked="' + it.done + '" aria-label="Mark ' + esc(it.title) + ' as ' + (it.done ? "not done" : "done") + '" data-act="tg" data-k="' + it.k + '" data-id="' + esc(it.id) + '">' + ic("check") + '</button>' +
      '<button class="tb" data-act="edititem" data-k="' + it.k + '" data-id="' + esc(it.id) + '"><b>' + esc(it.title) + '</b><small>' + esc(it.sub) + '</small></button>' +
      (it.overdue ? '<span class="badge due">Overdue</span>' : it.done ? '<span class="badge ok">Done</span>' : it.today ? '<span class="badge pend">Pending</span>' : "") + '</li>';
  }
  function todayCard(cls) {
    var items = todayItems(), c = todayCount(items), shown = items.slice(0, 7);
    return '<section class="card rv ' + (cls || "") + '"><div class="ch"><h2>' + ic("tasks") + 'Today’s Tasks</h2><a class="lnk" href="#tasks">View all</a></div>' +
      (c.n ? '<div class="pct" style="margin-bottom:6px"><div class="bar"><i style="width:' + Math.round(c.d / c.n * 100) + '%"></i></div><b>' + c.d + '/' + c.n + '</b></div>' : "") +
      (shown.length ? '<ul class="rows">' + shown.map(itemRow).join("") + '</ul>' : '<div class="empty"><span class="em">🌤️</span><span>Nothing planned for today.</span></div>') +
      '<div style="margin-top:12px"><button class="btn ghost" data-act="newtask" data-date="' + todayStr() + '">' + ic("plus") + 'Add Task</button></div></section>';
  }
  function noteRow(x) {
    var di = dueInfo(x), od = !x.done && x.dueDate && diff(x.dueDate) < 0;
    return '<li class="ti-row' + (x.done ? " isdone" : "") + freshCls(x.id) + '"><button class="ck' + (ui.fresh === x.id ? " fresh" : "") + '" role="checkbox" aria-checked="' + x.done + '" aria-label="Mark ' + esc(x.title) + ' as ' + (x.done ? "not done" : "done") + '" data-act="tg" data-k="note" data-id="' + esc(x.id) + '">' + ic("check") + '</button>' +
      '<button class="tb" data-act="edititem" data-k="note" data-id="' + esc(x.id) + '"><b>' + esc(x.title) + '</b><small><span class="subj"><i style="background:' + colorOf(x.subject) + '"></i>' + esc(x.subject) + '</span> · ' + KIND_LABEL[x.kind] + (x.kind === "note" && !x.dueDate ? "" : " · " + di.t) + ((x.items || []).length ? " · ☑ " + x.items.filter(function (i) { return i.d; }).length + "/" + x.items.length : "") + '</small></button>' +
      (x.done ? '<span class="badge ok">Done</span>' : od ? '<span class="badge due">Overdue</span>' : '<span class="badge pend">Pending</span>') + '</li>';
  }
  function ledger() {
    var a = [];
    data.savings.forEach(function (x) { a.push({ src: "s", id: x.id, type: x.type, amount: x.amount, date: x.date, category: x.category, note: x.note, createdAt: x.createdAt, pend: x.pendingRequestId }); });
    data.money.forEach(function (x) { a.push({ src: "m", id: x.id, type: x.kind, amount: x.amount, date: x.date, category: x.category, note: x.note, createdAt: x.createdAt }); });
    return a.sort(function (p, q) { return p.date === q.date ? (q.createdAt || 0) - (p.createdAt || 0) : (p.date < q.date ? 1 : -1); });
  }
  function txRow(x, acts) {
    var cls, icon, label, sign;
    if (x.src === "s") { label = TYPE_LABEL[x.type]; cls = x.type === "deposit" ? "g" : x.type === "withdraw" ? "r" : "p"; icon = x.type === "deposit" ? "arrowup" : x.type === "withdraw" ? "arrowdown" : "swap"; sign = x.type === "deposit" ? "+" : x.type === "withdraw" ? "−" : "⇄ "; }
    else { label = x.type === "income" ? "Income" : x.type === "take" ? "Taken from income" : "Expense"; cls = x.type === "income" ? "g" : x.type === "take" ? "p" : "r"; icon = x.type === "income" ? "arrowup" : "arrowdown"; sign = x.type === "income" ? "+" : "−"; }
    var title = x.src === "s" && (x.type === "to_wallet" || x.type === "to_savings") ? label : (x.category || label);
    var sub = (title === label ? "" : label + " · ") + shortDate(x.date) + (x.note ? " · " + x.note : "");
    var a = "";
    if (acts) {
      if (x.src === "s") a = x.pend ? '<button class="sm" data-act="cancelreq" data-req="' + x.pend + '">Cancel request</button>' : '<button class="sm del" data-act="delreq" data-id="' + esc(x.id) + '" aria-label="Request deletion" title="Request deletion">' + ic("trash") + '</button>';
      else a = '<button class="sm del" data-act="del" data-c="money" data-id="' + esc(x.id) + '" aria-label="Delete" title="Delete">' + ic("trash") + '</button>';
    }
    return '<li class="tx"><span class="ti ' + cls + '">' + ic(icon) + '</span><div class="tb"><b>' + esc(title) + '</b><small>' + esc(sub) + '</small></div><div class="ta ' + cls + ' num">' + sign + money(num(x)) + (x.pend ? '<small><span class="badge pend">Deletion pending</span></small>' : "") + '</div>' + (a ? '<div class="tact">' + a + '</div>' : "") + '</li>';
  }
  function calGrid(mini) {
    var first = new Date(cal.y, cal.m, 1), start = first.getDay(), dim = new Date(cal.y, cal.m + 1, 0).getDate(), t = todayStr();
    var map = {};
    data.tasks.forEach(function (x) { (map[x.date] = map[x.date] || { t: 0, n: 0 }).t++; });
    data.notes.forEach(function (x) { if (x.dueDate) (map[x.dueDate] = map[x.dueDate] || { t: 0, n: 0 }).n++; });
    var h = '<div class="cal-h"><button class="ib" data-act="cprev" aria-label="Previous month">' + ic("left") + '</button><b>' + MONTHS[cal.m] + " " + cal.y + '</b><button class="ib" data-act="cnext" aria-label="Next month">' + ic("right") + '</button></div><div class="cg' + (mini ? " mini" : "") + '">';
    DS.forEach(function (d) { h += '<span class="dnm">' + d + '</span>'; });
    for (var i = 0; i < start; i++) h += '<span></span>';
    for (var d = 1; d <= dim; d++) {
      var s = cal.y + "-" + pad(cal.m + 1) + "-" + pad(d), m = map[s];
      h += '<button class="cd' + (s === t ? " today" : "") + (s === sel ? " sel" : "") + '" data-act="seldate" data-date="' + s + '" aria-label="' + longDate(s) + '"><span>' + d + '</span><span class="dots">' + (m && m.t ? "<i></i>" : "") + (m && m.n ? '<i class="n"></i>' : "") + '</span></button>';
    }
    return h + '</div>';
  }
  function quickActions() {
    return '<div class="qa"><button class="g" data-act="newtx" data-v="deposit"><span class="qi">' + ic("plus") + '</span>Deposit</button><button class="r" data-act="newtx" data-v="withdraw"><span class="qi">' + ic("minus") + '</span>Withdraw</button><button class="p" data-act="newtx" data-v="transfer"><span class="qi">' + ic("swap") + '</span>Transfer</button><a class="b" href="#history"><span class="qi">' + ic("list") + '</span>History</a></div>';
  }
  function savingsTile(cls) {
    var bal = savingsBal(), tg = settings.target, pct = tgtPct();
    return '<section class="card t-blue rv flex flex-col justify-between gap-4 ' + (cls || "") + '"><div class="flex items-center gap-4">' + pig("sv-pig") + '<div class="min-w-0"><span class="lab" style="margin-bottom:4px">Total savings</span><div class="sv-amt">' + cu(bal) + '</div>' +
      '<div class="text-sm mt-1 sub">' + (tg > 0 ? "Target: " + money(tg) : '<a class="underline font-bold" href="#profile">Set a savings target</a>') + '</div></div></div>' +
      (tg > 0 ? '<div class="pct"><div class="bar"><i style="width:' + pct + '%"></i></div><b>' + pct + '%</b></div>' : "") +
      '<div class="hidden lg:flex items-center justify-between gap-3 rounded-2xl px-4 py-3" style="background:rgb(255 255 255 / .16);border:2px dashed rgb(255 255 255 / .45)"><span class="font-bold text-sm">Income wallet</span><b class="num font-display text-xl">' + money(walletBal()) + '</b></div>' + quickActions() + '</section>';
  }
  function statTile(color, icon, label, inner, sub, cls, go) {
    return '<div class="card stat rv t-' + color + ' ' + (cls || "") + (go ? ' tap" data-go="' + go + '" role="link" tabindex="0' : '') + '"><span class="si">' + ic(icon) + '</span><div class="min-w-0"><small>' + label + '</small>' + inner + '<em>' + sub + '</em></div></div>';
  }
  var cn = function (n, suf) { return '<b class="num cu" data-k="n" data-to="' + n + '" data-suf="' + suf + '">' + n + suf + '</b>'; };
  function avatar(cls) {
    var n = (settings.name || (me && me.username) || "?").charAt(0).toUpperCase();
    return settings.avatar ? '<img class="' + cls + '" src="' + esc(settings.avatar) + '" alt="Your profile picture">' : '<div class="' + cls + '">' + esc(n) + '</div>';
  }
  var pghead = function () { var t = TITLES[route]; return t && route !== "dashboard" ? '<div class="pghead"><h1>' + t[0] + '</h1><p>' + t[1] + '</p></div>' : ""; };

  /* ---------- views ---------- */
  function vDashboard() {
    var inc = moneySum("income", "week"), ex = moneySum("expense", "week"), bal = savingsBal(), tg = settings.target, pct = tgtPct();
    var incCats = byCat("income", "week").slice(0, 2).map(function (c) { return c.name; }).join(" + ") || "No income yet";
    var exCats = byCat("expense", "week").slice(0, 3).map(function (c) { return c.name; }).join(", ") || "No spending yet";
    var d = new Date(), items = todayItems(), c = todayCount(items), name = (settings.name || (me && me.username) || "Student").trim().split(/\s+/)[0];
    var asg = data.notes.filter(function (x) { return x.kind !== "note"; }), asgDone = asg.filter(function (x) { return x.done; }).length, asgP = asg.length ? asgDone / asg.length * 100 : 0;
    var st = streak(), parts = [asg.length ? asgP : null, tg > 0 ? pct : null, c.n ? c.d / c.n * 100 : null].filter(function (v) { return v !== null; });
    var overall = parts.length ? parts.reduce(function (s, v) { return s + v; }, 0) / parts.length : 0;
    var up = data.notes.filter(function (x) { return !x.done; }).sort(function (a, b) { return (a.dueDate || "9999") < (b.dueDate || "9999") ? -1 : (a.dueDate || "9999") > (b.dueDate || "9999") ? 1 : 0; }).slice(0, 4);
    var cats = byCat("expense", "week"), recent = ledger().slice(0, 5);
    var tk = "STUDY ✦ SAVE ✦ ACHIEVE ✦ SMALL STEPS ✦ BIG GOALS ✦ DISCIPLINE TODAY, FREEDOM TOMORROW ✦ ";
    var hero = '<section class="hero rv col-span-2 lg:col-span-8">' + sunSvg() + '<div class="relative z-10 flex items-start justify-between gap-3"><div class="flex items-center gap-3 min-w-0"><a href="#profile" class="shrink-0" aria-label="Profile">' + avatar("av") + '</a><div class="min-w-0"><div class="hi">' + greet() + '</div><h2 class="truncate">' + esc(name) + '!</h2></div></div>' +
      '<div class="dateticket"><small>' + DS[d.getDay()] + '</small><b>' + MON[d.getMonth()] + ' ' + d.getDate() + '</b><small id="h-time"></small></div></div>' +
      '<div class="relative z-10 mt-3 flex flex-wrap items-center gap-2"><span class="streak">' + ic("flame") + st + (st === 1 ? " day streak" : " day streak") + '</span><span class="text-sm font-semibold opacity-80">Keep going! Your future is worth it.</span></div>' +
      '<div class="ticker" aria-hidden="true"><div>' + tk + tk + '</div></div></section>';
    var tiles = statTile("mint", "wallet", "Income wallet", cu(walletBal()), "Available to take", "col-span-1 lg:col-span-2", "spending") +
      statTile("pink", "arrowdown", "Spent · last 7 days", cu(ex), esc(exCats), "col-span-1 lg:col-span-2", "spending") +
      statTile("yellow", "flame", "Study streak", cn(st, st === 1 ? " day" : " days"), st ? "Keep the fire going" : "Finish a task or study to start", "col-span-1 lg:col-span-2", "tasks") +
      statTile("orange", "tasks", "Today’s goal", c.n ? cn(c.d, "/" + c.n) : '<b class="num">—</b>', c.n ? Math.round(c.d / c.n * 100) + "% done" : "Nothing due today", "col-span-1 lg:col-span-2", "tasks");
    var recentCard = '<section class="card rv col-span-2 lg:col-span-7"><div class="ch"><h2>' + ic("history") + 'Recent activity</h2><a class="lnk" href="#history">View all</a></div>' +
      (recent.length ? '<ul class="rows">' + recent.map(function (x) { return txRow(x, false); }).join("") + '</ul>' : '<div class="empty"><span class="em">🐷</span><span>No transactions yet. Make your first deposit!</span></div>') + '</section>';
    var expCard = '<section class="card rv col-span-2 lg:col-span-4"><div class="ch"><h2>' + ic("chart") + 'Expense overview</h2><a class="lnk" href="#spending">Open</a></div>' +
      (cats.length ? '<div class="dn">' + donut(cats, ex, "Last 7 days") + legend(cats, ex) + '</div>' : '<div class="empty"><span class="em">🧾</span><span>No expenses this week.</span></div>') + '</section>';
    var jtoday = moodOn(todayStr()), js = journalStreak();
    var journalTile = '<button class="card tap rv t-purple col-span-1 lg:col-span-4 text-left flex flex-col justify-between gap-3" data-go="journal" style="min-height:150px"><div class="flex items-center justify-between"><span class="lab" style="margin:0">Journal</span><span class="text-3xl">' + (jtoday ? MOODS[jtoday - 1][0] : "✍️") + '</span></div><div><b class="font-display text-xl leading-tight block">' + (jtoday ? "Logged today" : "How was your day?") + '</b><small class="font-semibold opacity-75">' + (js ? js + (js === 1 ? " day" : " days") + " in a row" : data.journal.length + " entries") + '</small></div></button>';
    var topList = data.lists.slice(0, 2);
    var listsTile = '<button class="card tap rv t-yellow col-span-1 lg:col-span-4 text-left flex flex-col justify-between gap-3" data-go="lists" style="min-height:150px"><div class="flex items-center justify-between"><span class="lab" style="margin:0">Lists</span><span class="text-3xl">📝</span></div><div class="min-w-0">' +
      (topList.length ? topList.map(function (l) { return '<div class="flex items-center justify-between gap-2 text-sm font-bold"><span class="truncate">' + esc(l.title) + '</span><span class="shrink-0 opacity-75">' + listDone(l) + '/' + l.items.length + '</span></div>'; }).join("") : '<b class="font-display text-xl leading-tight block">Make a list</b><small class="font-semibold opacity-75">Grocery, wishlist…</small>') + '</div></button>';
    var notesCard = '<section class="card rv col-span-2 lg:col-span-7"><div class="ch"><h2>' + ic("notes") + 'Up next</h2><button class="sm go" data-act="newnote">' + ic("plus") + 'Add</button></div>' +
      (up.length ? '<ul class="rows">' + up.map(noteRow).join("") + '</ul><div style="margin-top:10px"><a class="lnk" href="#notes">View all notes</a></div>' : '<div class="empty"><span class="em">📚</span><span>No pending notes. Add your first assignment.</span></div>') + '</section>';
    var calCard = '<section class="card rv col-span-2 lg:col-span-5"><div class="ch"><h2>' + ic("calendar") + 'Calendar</h2></div>' + calGrid(true) + '</section>';
    var rings = '<section class="card rv col-span-2 lg:col-span-12"><div class="ch"><h2>' + ic("chart") + 'Progress tracker</h2></div><div class="rings">' + ring(asgP, "#26C485", "Assignments", asgDone + "/" + asg.length) + ring(Math.min(100, st / 7 * 100), "#3B5BFF", "Study streak", st + (st === 1 ? " day" : " days")) + ring(pct, "#8B6CFF", "Savings goal", tg > 0 ? pct + "%" : "no target") + ring(overall, "#FF7A3D", "Overall", "progress") + '</div></section>';
    return '<div class="grid grid-cols-2 gap-3 lg:grid-cols-12 lg:gap-4 pb-2">' + remindCard() + hero + savingsTile("col-span-2 lg:col-span-4 lg:row-span-2") + tiles + todayCard("col-span-2 lg:col-span-5") + recentCard + expCard + journalTile + listsTile + notesCard + calCard + rings + extraTiles() + '</div>';
  }

  function vSavings() {
    var wb = walletBal(), req = data.requests.filter(function (r) { return r.status === "pending" || r.status === "rejected" || r.status === "approved"; }).slice(0, 5);
    var f = ui.sf, list = ledger().filter(function (x) { return x.src === "s" && (f === "all" || (f === "transfer" ? (x.type === "to_wallet" || x.type === "to_savings") : x.type === f)); });
    var shown = list.slice(0, ui.lim);
    var chips = [["all", "All"], ["deposit", "Deposits"], ["withdraw", "Withdrawals"], ["transfer", "Transfers"]].map(function (c) { return '<button class="chip' + (f === c[0] ? " on" : "") + '" data-act="sf" data-v="' + c[0] + '">' + c[1] + '</button>'; }).join("");
    var side = '<div class="flex flex-col gap-4 lg:col-span-5">' + savingsTile("") +
      '<div class="card stat row rv t-yellow"><span class="si">' + ic("wallet") + '</span><div class="min-w-0"><small>Income wallet</small>' + cu(wb) + '<em>Your income you can take. Expenses don’t reduce it.</em></div></div>' +
      (req.length ? '<section class="card rv"><div class="ch"><h2>' + ic("shield") + 'Deletion requests</h2></div><ul class="rows">' + req.map(function (r) {
        var b = r.status === "approved" ? '<span class="badge ok">Approved</span>' : r.status === "rejected" ? '<span class="badge sch">Rejected</span>' : '<span class="badge pend">Waiting for admin</span>';
        return '<li class="rq"><div class="rq-t"><b>' + TYPE_LABEL[r.type] + ' · ' + money(r.amount) + '</b>' + b + '</div><div class="rq-s">' + shortDate(r.date) + (r.adminNote ? " · Admin: " + esc(r.adminNote) : "") + '</div></li>';
      }).join("") + '</ul></section>' : "") + '</div>';
    var main = '<section class="card rv lg:col-span-7"><div class="ch"><h2>' + ic("history") + 'Transactions</h2></div><div class="chips" style="margin-bottom:6px">' + chips + '</div>' +
      (shown.length ? '<ul class="rows">' + shown.map(function (x) { return txRow(x, true); }).join("") + '</ul>' + (list.length > shown.length ? '<div style="margin-top:10px"><button class="btn ghost" data-act="more">Show more</button></div>' : "") : '<div class="empty"><span class="em">🐷</span><span>No transactions here yet.</span></div>') +
      '<p class="hint" style="margin-top:10px">Deleting a saved transaction needs the admin to approve it, so your savings stay safe.</p></section>';
    return pghead() + '<div class="grid gap-4 lg:grid-cols-12 items-start">' + side + main + '</div>';
  }

  function vHistory() {
    var f = ui.hf, list = ledger().filter(function (x) { return f === "all" || (f === "savings" ? x.src === "s" : x.src === "m"); }), shown = list.slice(0, ui.lim);
    var chips = [["all", "All"], ["savings", "Savings"], ["spending", "Spending"]].map(function (c) { return '<button class="chip' + (f === c[0] ? " on" : "") + '" data-act="hf" data-v="' + c[0] + '">' + c[1] + '</button>'; }).join("");
    var h = pghead() + '<section class="card rv"><div class="chips" style="margin-bottom:6px">' + chips + '</div>';
    if (!shown.length) return h + '<div class="empty"><span class="em">🕰️</span><span>Nothing here yet.</span></div></section>';
    var last = "";
    h += '<ul class="rows">' + shown.map(function (x) { var hd = x.date !== last ? '<li class="dayh"><span>' + dayLabel(x.date) + '</span></li>' : ""; last = x.date; return hd + txRow(x, true); }).join("") + '</ul>';
    return h + (list.length > shown.length ? '<div style="margin-top:10px"><button class="btn ghost" data-act="more">Show more</button></div>' : "") + '</section>';
  }

  function vSpending() {
    var p = ui.period, inc = moneySum("income", p), ex = moneySum("expense", p), cats = byCat("expense", p), wb = walletBal();
    var list = data.money.filter(function (x) { return inPeriod(x.date, p); });
    var labels = { today: "Today", week: "Last 7 days", month: "This month", all: "All time" };
    var kind = ui.ek, cc = kind === "income" ? INC_CATS : kind === "take" ? TAKE_CATS : EXP_CATS;
    var form = '<section class="card rv"><div class="ch"><h2>' + ic("plus") + '' + (kind === "income" ? "Add income" : kind === "take" ? "Take from income" : "Add an expense") + '</h2></div><form id="expf" class="form" autocomplete="off">' +
      '<div class="seg" id="e-seg"><button type="button" data-act="ek" data-v="expense" class="' + (kind === "expense" ? "on" : "") + '">Expense</button><button type="button" data-act="ek" data-v="income" class="' + (kind === "income" ? "on" : "") + '">Income</button><button type="button" data-act="ek" data-v="take" class="' + (kind === "take" ? "on" : "") + '">Take</button></div>' + (kind === "take" ? '<p class="hint">Available to take: ' + money(Math.max(0, wb)) + '</p>' : kind === "expense" ? '<p class="hint">Expenses are just a record. They don’t reduce your income.</p>' : "") + '' +
      '<div class="field"><label for="e-amount">Amount</label><div class="money-in"><span>₱</span><input id="e-amount" type="number" inputmode="decimal" min="1" step="any" required placeholder="0.00"></div><div class="chips" style="margin-top:8px">' + [20, 50, 100, 200].map(function (a) { return '<button type="button" class="chip" data-act="eamt" data-v="' + a + '">₱' + a + '</button>'; }).join("") + '</div></div>' +
      '<div class="field"><span class="lab">Category</span><div class="chips" id="e-cats">' + cc.map(function (c, i) { return '<button type="button" class="chip' + (i === 0 ? " on" : "") + '" data-act="cat" data-v="' + c + '">' + c + '</button>'; }).join("") + '<button type="button" class="chip" data-act="catcustom">✎ Type my own</button></div><input type="hidden" id="e-cat" value="' + cc[0] + '"><input id="e-custom" type="text" maxlength="30" placeholder="Type your own, e.g. Printing, Haircut" hidden style="margin-top:8px"></div>' +
      '<div class="field"><label for="e-date">Date</label><input id="e-date" type="date" required value="' + todayStr() + '"><div class="chips" style="margin-top:8px"><button type="button" class="chip" data-act="edt" data-v="0">Today</button><button type="button" class="chip" data-act="edt" data-v="-1">Yesterday</button></div></div>' +
      '<div class="field"><label for="e-note">Note (optional)</label><input id="e-note" type="text" maxlength="80" placeholder="e.g. Lunch, jeep fare"></div>' +
      '<button class="btn" id="e-save" type="submit">' + (kind === "take" ? "Take it" : "Save " + kind) + '</button></form></section>';
    var days = []; for (var i = 6; i >= 0; i--) days.push(addDays(todayStr(), -i));
    var vals = days.map(function (d) { return data.money.filter(function (x) { return x.kind === "expense" && x.date === d; }).reduce(function (s, x) { return s + num(x); }, 0); }), mx = Math.max.apply(null, vals.concat([1]));
    var chart = '<section class="card rv"><div class="ch"><h2>' + ic("chart") + 'Last 7 days</h2></div><div class="bars" role="img" aria-label="Spending for the last 7 days">' + days.map(function (d, i) { return '<div class="' + (d === todayStr() ? "today" : "") + '"><em class="num">' + (vals[i] ? (settings.hide ? "•" : Math.round(vals[i])) : "") + '</em><i style="height:' + Math.max(3, Math.round(vals[i] / mx * 80)) + '%"></i><span>' + DS[P(d).getDay()] + '</span></div>'; }).join("") + '</div></section>';
    var last = "";
    var rows = list.length ? '<ul class="rows">' + list.map(function (x) { var hd = x.date !== last ? '<li class="dayh"><span>' + dayLabel(x.date) + '</span><span class="num">' + money(list.filter(function (y) { return y.date === x.date && y.kind === "expense"; }).reduce(function (s, y) { return s + num(y); }, 0)) + '</span></li>' : ""; last = x.date;
      return hd + txRow({ src: "m", id: x.id, type: x.kind, amount: x.amount, date: x.date, category: x.category, note: x.note }, true); }).join("") + '</ul>' : '<div class="empty"><span class="em">🧾</span><span>No entries for this period.</span></div>';
    var periodSeg = '<div class="seg rv">' + ["today", "week", "month", "all"].map(function (k) { return '<button data-act="period" data-v="' + k + '" class="' + (p === k ? "on" : "") + '">' + { today: "Today", week: "7 days", month: "Month", all: "All" }[k] + '</button>'; }).join("") + '</div>';
    var left = '<div class="flex flex-col gap-4 lg:col-span-5"><div class="card stat row rv t-yellow"><span class="si">' + ic("wallet") + '</span><div class="min-w-0"><small>Income wallet</small>' + cu(wb) + '<em>Income − taken (expenses are separate)</em></div></div>' + form + '</div>';
    var right = '<div class="flex flex-col gap-4 lg:col-span-7">' + periodSeg + '<div class="grid grid-cols-2 gap-3">' + statTile("pink", "arrowdown", "Spent · " + labels[p], cu(ex), "", "") + statTile("mint", "arrowup", "Income · " + labels[p], cu(inc), "", "") + '</div>' +
      (cats.length ? '<section class="card rv"><div class="ch"><h2>By category</h2></div><div class="dn">' + donut(cats, ex, labels[p]) + legend(cats, ex) + '</div></section>' : "") + budgetCard() + chart +
      '<section class="card rv"><div class="ch"><h2>' + ic("list") + 'Entries</h2></div>' + rows + '</section></div>';
    return pghead() + '<div class="grid gap-4 lg:grid-cols-12 items-start">' + left + right + '</div>';
  }

  function notesList() {
    var q = ui.nq.trim().toLowerCase(), f = ui.nf;
    var list = data.notes.filter(function (x) {
      if (f === "pending" && x.done) return false; if (f === "done" && !x.done) return false;
      return !q || (x.title + " " + x.subject + " " + x.body + " " + (x.items || []).map(function (i) { return i.t; }).join(" ") + " " + KIND_LABEL[x.kind]).toLowerCase().indexOf(q) >= 0;
    }).sort(function (a, b) { return (a.done - b.done) || ((a.dueDate || "9999") < (b.dueDate || "9999") ? -1 : (a.dueDate || "9999") > (b.dueDate || "9999") ? 1 : 0) || (b.createdAt - a.createdAt); });
    return list.length ? '<ul class="rows">' + list.map(noteRow).join("") + '</ul>' : '<div class="empty"><span class="em">📚</span><span>' + (q ? "No notes match your search." : f === "done" ? "Nothing checked off yet." : "No notes here. Tap “Add” to start.") + '</span></div>';
  }
  function vNotes() {
    var chips = [["all", "All"], ["pending", "Pending"], ["done", "Done"]].map(function (c) { return '<button class="chip' + (ui.nf === c[0] ? " on" : "") + '" data-act="nf" data-v="' + c[0] + '">' + c[1] + ' <span class="num">' + (c[0] === "all" ? data.notes.length : data.notes.filter(function (x) { return c[0] === "done" ? x.done : !x.done; }).length) + '</span></button>'; }).join("");
    return pghead() + '<section class="card rv"><div class="stack"><div class="srch">' + ic("search") + '<input id="n-q" type="search" placeholder="Search notes and assignments" aria-label="Search notes" autocomplete="off" value="' + esc(ui.nq) + '"></div>' +
      '<div class="chips">' + chips + '</div><div id="nlist">' + notesList() + '</div></div></section>' + fab("newnote", "Add");
  }
  function fab(act, label) { return '<button class="btn fab" style="position:fixed;right:16px;bottom:calc(max(12px, env(safe-area-inset-bottom)) + 82px);width:auto;z-index:35;padding:0 20px" data-act="' + act + '">' + ic("plus") + label + '</button>'; }

  function vTasks() {
    var d = ui.tday, t = todayStr(), ws = addDays(d, -P(d).getDay());
    var tasks = data.tasks.filter(function (x) { return x.date === d; }).sort(function (a, b) { return (a.done - b.done) || ((a.time || "99:99") < (b.time || "99:99") ? -1 : 1); });
    var due = data.notes.filter(function (x) { return x.dueDate === d; });
    var total = tasks.length + due.length, dn = tasks.filter(function (x) { return x.done; }).length + due.filter(function (x) { return x.done; }).length;
    var week = '<div class="week">' + [0, 1, 2, 3, 4, 5, 6].map(function (i) {
      var s = addDays(ws, i), has = data.tasks.some(function (x) { return x.date === s; }) || data.notes.some(function (x) { return x.dueDate === s; });
      return '<button data-act="tday" data-date="' + s + '" class="' + (s === d ? "sel " : "") + (s === t ? "today " : "") + (has ? "has" : "") + '" aria-label="' + longDate(s) + '"><span>' + DS[i] + '</span><b>' + P(s).getDate() + '</b><i></i></button>';
    }).join("") + '</div>';
    var taskRows = tasks.map(function (x) { return itemRow({ k: "task", id: x.id, title: x.title, sub: x.tag + (x.time ? " · " + fmtTime(x.time) : ""), done: x.done, today: true }); }).join("");
    var dueRows = due.map(function (x) { return itemRow({ k: "note", id: x.id, title: x.title, sub: x.subject + " · " + KIND_LABEL[x.kind] + " · Due" + (x.dueTime ? " " + fmtTime(x.dueTime) : ""), done: x.done, today: true }); }).join("");
    return pghead() + '<div class="stack"><section class="card rv"><div class="stack">' + week + '<div class="daynav"><button class="ib" data-act="tshift" data-v="-1" aria-label="Previous day">' + ic("left") + '</button><b>' + dayLabel(d) + '</b><button class="ib" data-act="tshift" data-v="1" aria-label="Next day">' + ic("right") + '</button></div>' +
      (d !== t ? '<button class="btn ghost" data-act="tday" data-date="' + t + '">Jump to today</button>' : "") + '</div></section>' +
      '<section class="card rv"><div class="ch"><h2>' + ic("tasks") + 'Tasks</h2><span class="badge ' + (total && dn === total ? "ok" : "sch") + '">' + dn + '/' + total + ' done</span></div>' +
      '<form id="quickf" class="quick" autocomplete="off"><input id="q-title" type="text" maxlength="80" placeholder="Add a task for this day..." aria-label="New task title" required><button class="btn" type="submit">' + ic("plus") + 'Add</button></form>' +
      (total ? '<ul class="rows" style="margin-top:8px">' + taskRows + dueRows + '</ul>' : '<div class="empty"><span class="em">🌤️</span><span>No tasks for this day. Add one above.</span></div>') +
      '<div style="margin-top:12px"><button class="btn ghost" data-act="newtask" data-date="' + d + '">' + ic("clock") + 'Add task with a time</button></div></section></div>';
  }

  function vCalendar() {
    var tasks = data.tasks.filter(function (x) { return x.date === sel; }).sort(function (a, b) { return (a.time || "99:99") < (b.time || "99:99") ? -1 : 1; }), due = data.notes.filter(function (x) { return x.dueDate === sel; });
    var spent = data.money.filter(function (x) { return x.kind === "expense" && x.date === sel; }).reduce(function (s, x) { return s + num(x); }, 0);
    var rows = tasks.map(function (x) { return itemRow({ k: "task", id: x.id, title: x.title, sub: x.tag + (x.time ? " · " + fmtTime(x.time) : ""), done: x.done, today: true }); }).join("") +
      due.map(function (x) { return itemRow({ k: "note", id: x.id, title: x.title, sub: x.subject + " · " + KIND_LABEL[x.kind] + " · Due" + (x.dueTime ? " " + fmtTime(x.dueTime) : ""), done: x.done, today: true }); }).join("");
    return pghead() + '<div class="grid gap-4 lg:grid-cols-12 items-start"><section class="card rv lg:col-span-7">' + calGrid(false) + '<div class="chips" style="margin-top:14px"><span class="muted text-sm"><span class="subj"><i style="background:rgb(var(--blue-s))"></i>Task</span> &nbsp; <span class="subj"><i style="background:rgb(var(--orange))"></i>Deadline</span></span></div></section>' +
      '<section class="card rv lg:col-span-5"><div class="ch"><h2>' + dayLabel(sel) + '</h2></div>' + (rows ? '<ul class="rows">' + rows + '</ul>' : '<div class="empty"><span class="em">🗓️</span><span>Nothing scheduled.</span></div>') +
      (spent ? '<div class="krow" style="margin-top:8px"><span>Spent this day</span><b class="num">' + money(spent) + '</b></div>' : "") + '<div style="margin-top:12px"><button class="btn" data-act="newtask" data-date="' + sel + '">' + ic("plus") + 'Add Event</button></div></section></div>';
  }

  /* ---------- journal ---------- */
  function journalList() {
    var q = ui.jq.trim().toLowerCase();
    var list = data.journal.filter(function (x) { return !q || (x.title + " " + x.body).toLowerCase().indexOf(q) >= 0; });
    if (!list.length) return '<div class="empty card"><span class="em">📖</span><span>' + (q ? "No entries match your search." : "Your journal is empty. Write your first entry above.") + '</span></div>';
    var last = "", h = "";
    list.forEach(function (x) {
      var d = P(x.date), mk = d.getFullYear() + "-" + d.getMonth();
      if (mk !== last) { last = mk; h += '<div class="monthh">' + MONTHS[d.getMonth()] + " " + d.getFullYear() + '</div>'; }
      h += '<button class="card tap rv jentry' + freshCls(x.id) + '" data-act="jopen" data-id="' + esc(x.id) + '"><div class="jdate"><small>' + DS[d.getDay()] + '</small><b>' + d.getDate() + '</b></div><div class="jbody"><b>' + esc(x.title || "Untitled entry") + '</b><p>' + esc(x.body) + '</p></div><span class="jmood" title="' + MOODS[x.mood - 1][1] + '">' + MOODS[x.mood - 1][0] + '</span></button>';
    });
    return h;
  }
  function vJournal() {
    var st = journalStreak(), days = []; for (var i = 6; i >= 0; i--) days.push(addDays(todayStr(), -i));
    var moods = days.map(moodOn), got = moods.filter(Boolean), avg = got.length ? Math.round(got.reduce(function (s, v) { return s + v; }, 0) / got.length) : 0;
    var strip = '<div class="mstrip">' + days.map(function (d, i) { return '<div><div class="d">' + (moods[i] ? MOODS[moods[i] - 1][0] : '<span style="opacity:.4">·</span>') + '</div><span>' + DS[P(d).getDay()].charAt(0) + '</span></div>'; }).join("") + '</div>';
    var tiles = '<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">' +
      statTile("yellow", "flame", "Journal streak", cn(st, st === 1 ? " day" : " days"), st ? "Nice rhythm" : "Write today to start", "") +
      statTile("purple", "book", "Entries", cn(data.journal.length, ""), "all time", "") +
      statTile("mint", "spark", "Avg mood · 7 days", '<b class="num">' + (avg ? MOODS[avg - 1][0] + " " + MOODS[avg - 1][1] : "—") + '</b>', got.length + (got.length === 1 ? " day logged" : " days logged"), "col-span-2 lg:col-span-1") +
      '<div class="card rv col-span-2 lg:col-span-1 flex flex-col justify-center"><span class="lab">This week</span>' + strip + '</div></div>';
    var composer = '<section class="card rv"><div class="ch"><h2>' + ic("pen") + 'New entry</h2><button class="chip" type="button" data-act="jprompt">💡 Prompt</button></div><form id="jf" class="form" autocomplete="off">' +
      '<div class="field"><span class="lab">How are you feeling?</span><div class="moods" id="j-moods">' + MOODS.map(function (m, i) { return '<button type="button" class="mood' + (ui.jmood === i + 1 ? " on" : "") + '" data-act="jmood" data-v="' + (i + 1) + '" aria-label="' + m[1] + '">' + m[0] + '<small>' + m[1] + '</small></button>'; }).join("") + '</div></div>' +
      '<div class="two"><div class="field"><label for="j-date">Date</label><input id="j-date" type="date" required value="' + esc(ui.jdate) + '"></div><div class="field"><label for="j-title">Title (optional)</label><input id="j-title" type="text" maxlength="80" placeholder="A good day"></div></div>' +
      '<div class="field"><label for="j-body">Your entry</label><p class="hint" id="j-prompt" style="margin:0 0 8px" hidden></p><textarea id="j-body" class="paper" spellcheck="true" maxlength="4000" required placeholder="Write anything. It’s only for you…" style="min-height:140px"></textarea></div>' +
      '<button class="btn" type="submit" id="j-save">' + ic("check") + 'Save entry</button></form></section>';
    return pghead() + '<div class="stack">' + tiles + composer + '<div class="srch rv">' + ic("search") + '<input id="j-q" type="search" placeholder="Search your journal" aria-label="Search journal" autocomplete="off" value="' + esc(ui.jq) + '"></div><div class="stack" id="jlist">' + journalList() + '</div></div>';
  }

  /* ---------- lists ---------- */
  function vLists() {
    var cur = ui.list ? data.lists.filter(function (l) { return l.id === ui.list; })[0] : null;
    if (ui.list && !cur) ui.list = null;
    if (cur) {
      var dn = listDone(cur), tot = cur.items.length, pct = tot ? Math.round(dn / tot * 100) : 0;
      var items = cur.items.slice().sort(function (a, b) { return (a.done - b.done) || (a.createdAt - b.createdAt); });
      return '<div class="stack"><div class="flex items-center gap-3 pt-2"><button class="ib" data-act="lback" aria-label="Back to lists">' + ic("left") + '</button><h1 class="flex-1 min-w-0 truncate font-display font-extrabold text-3xl tracking-tight">' + esc(cur.title) + '</h1><button class="ib" data-act="editlist" aria-label="Edit list">' + ic("edit") + '</button></div>' +
        '<section class="card rv ' + LCOLOR[cur.color] + '"><div class="flex items-center gap-3"><span class="li" style="width:46px;height:46px;flex:none">' + ic(cur.icon) + '</span><div class="flex-1 min-w-0"><b class="font-display text-xl block">' + dn + ' of ' + tot + ' done</b><small class="font-semibold opacity-75">' + (tot && dn === tot ? "All done! 🎉" : tot ? (tot - dn) + " to go" : "Add your first item below") + '</small></div></div>' + (tot ? '<div class="pct" style="margin-top:12px"><div class="bar"><i style="width:' + pct + '%"></i></div><b>' + pct + '%</b></div>' : "") + '</section>' +
        '<section class="card rv"><form id="lif" class="quick" autocomplete="off"><input id="li-text" type="text" maxlength="120" placeholder="Add an item…" aria-label="New item" required><button class="btn" type="submit">' + ic("plus") + 'Add</button></form>' +
        (items.length ? '<ul style="margin-top:8px">' + items.map(function (i) {
          return '<li class="lrow' + (i.done ? " isdone" : "") + freshCls(i.id) + '"><button class="ck' + (ui.fresh === i.id ? " fresh" : "") + '" role="checkbox" aria-checked="' + i.done + '" aria-label="Mark ' + esc(i.text) + ' as ' + (i.done ? "not done" : "done") + '" data-act="lit" data-id="' + esc(i.id) + '">' + ic("check") + '</button><span class="tb"><b>' + esc(i.text) + '</b></span><button class="sm del" data-act="lidel" data-id="' + esc(i.id) + '" aria-label="Delete item">' + ic("trash") + '</button></li>';
        }).join("") + '</ul>' + (dn ? '<div style="margin-top:12px"><button class="btn ghost" data-act="lclear">Clear ' + dn + ' done ' + (dn === 1 ? "item" : "items") + '</button></div>' : "") : '<div class="empty"><span class="em">✨</span><span>Nothing here yet. Type above and press Add.</span></div>') + '</section></div>';
    }
    var cards = data.lists.map(function (l) {
      var dn = listDone(l), tot = l.items.length;
      return '<button class="card tap rv lc ' + LCOLOR[l.color] + '" data-act="lopen" data-id="' + esc(l.id) + '"><span class="li">' + ic(l.icon) + '</span><div class="min-w-0"><b>' + esc(l.title) + '</b><small>' + (tot ? dn + "/" + tot + " done" : "Empty") + '</small>' + (tot ? '<div class="pct" style="margin-top:8px"><div class="bar" style="height:10px"><i style="width:' + Math.round(dn / tot * 100) + '%"></i></div></div>' : "") + '</div></button>';
    }).join("");
    var presets = '<div class="chips">' + LIST_PRESETS.map(function (p, i) { return '<button class="chip" data-act="lpreset" data-v="' + i + '">' + ic(p[1]) + p[0] + '</button>'; }).join("") + '</div>';
    return pghead() + '<div class="stack">' + (data.lists.length ? '<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">' + cards + '<button class="card tap rv lc" data-act="newlist" style="border-style:dashed;align-items:center;justify-content:center;text-align:center;box-shadow:none"><span class="li" style="background:rgb(var(--card2));border-color:rgb(var(--line))">' + ic("plus") + '</span><b>New list</b></button></div>' :
      '<section class="card rv"><div class="empty"><span class="em">📝</span><b class="font-display text-xl" style="color:rgb(var(--ink))">Make your first list</b><span>Start with a preset or make your own.</span></div>' + presets + '<div style="margin-top:14px"><button class="btn" data-act="newlist">' + ic("plus") + 'New list</button></div></section>') + '</div>';
  }

  /* ---------- profile ---------- */
  var crop = null, CS = 240;
  function loadPhoto(file) {
    return new Promise(function (ok, bad) {
      if (!file || !/^image\//.test(file.type)) return bad(new Error("Please choose a photo (JPG or PNG)."));
      var fr = new FileReader();
      fr.onerror = function () { bad(new Error("Could not read that file.")); };
      fr.onload = function () {
        var im = new Image();
        im.onerror = function () { bad(new Error("Could not open that photo.")); };
        im.onload = function () { ok(im); };
        im.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }
  function cropClamp() {
    var sc = crop.s0 * crop.z, w = crop.im.width * sc, h = crop.im.height * sc;
    var mx = Math.max(0, (w - CS) / 2), my = Math.max(0, (h - CS) / 2);   /* the photo always covers the whole circle: no empty edges */
    crop.ox = Math.max(-mx, Math.min(mx, crop.ox)); crop.oy = Math.max(-my, Math.min(my, crop.oy));
  }
  function cropDraw(cv, size) {
    var k = size / CS, sc = crop.s0 * crop.z * k, w = crop.im.width * sc, h = crop.im.height * sc, x = cv.getContext("2d");
    x.fillStyle = "#FFF3C4"; x.fillRect(0, 0, size, size);
    x.drawImage(crop.im, size / 2 - w / 2 + crop.ox * k, size / 2 - h / 2 + crop.oy * k, w, h);
  }
  function openCrop(im) {
    var s0 = Math.max(CS / im.width, CS / im.height), sMin = Math.min(CS / im.width, CS / im.height);
    var zc = sMin / s0;                                                       // zoom at which the whole photo fits
    crop = { im: im, s0: s0, z: 1, zmin: 1, ox: 0, oy: 0 };       // photo fills the whole square, no coloured padding; zoom in to get closer
    cropClamp();
    openSheet({ type: "crop" });
    var cv = $("crop-c"); if (!cv) return;
    cropDraw(cv, CS);
    var drag = null;
    cv.addEventListener("pointerdown", function (e) { drag = { x: e.clientX, y: e.clientY, ox: crop.ox, oy: crop.oy, k: CS / cv.getBoundingClientRect().width }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", function (e) { if (!drag) return; crop.ox = drag.ox + (e.clientX - drag.x) * drag.k; crop.oy = drag.oy + (e.clientY - drag.y) * drag.k; cropClamp(); cropDraw(cv, CS); });
    cv.addEventListener("wheel", function (e) { e.preventDefault(); crop.z = Math.max(crop.zmin, Math.min(3, crop.z * (e.deltaY < 0 ? 1.06 : 0.94))); var z = $("crop-z"); if (z) z.value = crop.z; cropClamp(); cropDraw(cv, CS); }, { passive: false });
    ["pointerup", "pointercancel"].forEach(function (n) { cv.addEventListener(n, function () { drag = null; }); });
  }
  function cropSave() {
    var c = document.createElement("canvas"); c.width = c.height = 256;
    cropDraw(c, 256);
    var q = 0.88, out = c.toDataURL("image/jpeg", q);
    while (out.length > 36000 && q > 0.3) { q -= 0.08; out = c.toDataURL("image/jpeg", q); }
    if (out.length > 36000) { toast("That photo is too big. Try another one."); return Promise.resolve(); }
    return saveAvatar(out).then(function () { crop = null; closeSheet(); });
  }
  function saveAvatar(a) {
    return api("PUT", "/api/avatar", { avatar: a }).then(function () { settings.avatar = a; renderTop(); renderView(); toast(a ? "Profile picture updated." : "Profile picture removed."); });
  }

  function vProfile() {
    var admin = me && me.role === "admin";
    var lo = '<section class="card rv"><div class="ch"><h2>' + ic("logout") + 'Log out</h2></div><p class="muted" style="margin:0 0 12px">Sign out of this device.</p><button class="btn danger" data-act="logoutask" type="button">Log out</button></section>';
    var pw = '<section class="card rv"><div class="ch"><h2>' + ic("shield") + 'Change password</h2></div><form id="pwf" class="form" autocomplete="off"><div class="field"><label for="p-cur">Current password</label><input id="p-cur" type="password" autocomplete="current-password" required maxlength="128"></div><div class="field"><label for="p-new">New password</label><input id="p-new" type="password" autocomplete="new-password" required minlength="8" maxlength="128"><p class="hint">At least 8 characters. Your other devices will be signed out.</p></div><button class="btn" type="submit">Change password</button></form></section>';
    var pfHead = function (title, sub) { return '<section class="card rv"><div class="pf"><div class="avw">' + avatar("av lg") + '<label class="avcam" for="av-file" title="Change picture">' + ic("camera") + '<span class="sr">Change profile picture</span></label><input id="av-file" class="sr" type="file" accept="image/*"></div>' + (settings.avatar ? '<button class="lnk" data-act="avremove" type="button">Remove picture</button>' : '<span class="hint" style="margin:0">Tap the camera to add a photo</span>') + '<h2>' + esc(title) + '</h2><p>' + sub + '</p></div></section>'; };
    if (admin) return pghead() + '<div class="stack">' + pfHead("Admin", "Administrator account") + pw + lo + '</div>';
    var items = todayItems(), c = todayCount(items), st = streak(), ex = moneySum("expense", "week");
    var name = settings.name || me.username;
    var themeSeg = '<div class="seg">' + [["light", "☀️ Cream"], ["dark", "🌙 Night"], ["auto", "Auto"]].map(function (t) { return '<button data-act="theme" data-v="' + t[0] + '" class="' + (settings.theme === t[0] ? "on" : "") + '">' + t[1] + '</button>'; }).join("") + '</div>';
    var goal = '<section class="card rv t-orange"><div class="flex items-center justify-between"><span class="font-display font-extrabold text-lg">Daily goal</span><span class="num font-extrabold text-lg">' + c.d + '/' + c.n + '</span></div><div class="bar" style="margin-top:10px"><i style="width:' + (c.n ? Math.round(c.d / c.n * 100) : 0) + '%"></i></div><p class="hint" style="color:inherit;opacity:.8">' + (c.n ? "Study · Save · Be Better. Finish today’s tasks to keep your streak." : "Add a task or an assignment due today to start your daily goal.") + '</p></section>';
    var tiles = '<div class="grid grid-cols-2 gap-3">' + statTile("blue", "piggy", "Savings", cu(savingsBal()), "", "") + statTile("pink", "wallet", "Spent · 7 days", cu(ex), "", "") + statTile("mint", "tasks", "Tasks done", cn(c.d, " / " + c.n), "", "") + statTile("yellow", "flame", "Streak", cn(st, st === 1 ? " day" : " days"), "", "") + '</div>';
    var set = '<section class="card rv"><div class="ch"><h2>' + ic("sliders") + 'Settings</h2></div><form id="setf" class="form" autocomplete="off"><div class="field"><label for="s-name">Your name</label><input id="s-name" type="text" maxlength="30" value="' + esc(settings.name) + '"></div><div class="field"><label for="s-course">Course and year</label><input id="s-course" type="text" maxlength="40" placeholder="e.g. BSIT (1st Year)" value="' + esc(settings.course) + '"></div><div class="field"><label for="s-target">Savings target (₱)</label><input id="s-target" type="number" inputmode="decimal" min="0" step="any" placeholder="10000" value="' + (settings.target || "") + '"></div><button class="btn" type="submit">Save settings</button></form>' +
      '<div class="field" style="margin-top:18px"><span class="lab">Appearance</span>' + themeSeg + '</div>' +
      '<div class="chips" style="margin-top:14px"><button class="chip' + (settings.hide ? " on" : "") + '" data-act="hide">' + ic(settings.hide ? "eyeoff" : "eye") + ' Hide amounts</button></div>' +
      '<p class="hint" style="margin-top:14px">Privacy: the admin can see when you are online, which page you are on and short labels like “Added a task”. Your amounts, notes, journal, lists and chats stay private: only you and the person you message can read a chat. Deleting a saved transaction needs the admin to approve.</p></section>';
    return pghead() + '<div class="grid gap-4 lg:grid-cols-12 items-start"><div class="flex flex-col gap-4 lg:col-span-5">' + pfHead(name, esc(settings.course || "Add your course below") + " · @" + esc(me.username)) + goal + tiles + '</div><div class="flex flex-col gap-4 lg:col-span-7">' + set + appCard() + backupCard() + pw + lo + '</div></div>';
  }

  function vMore() {
    var l = [["spending", "Spending", "wallet", "t-pink"], ["tasks", "Daily Tasks", "tasks", "t-orange"], ["journal", "Journal", "pen", "t-purple"], ["calendar", "Calendar", "calendar", "t-blue"], ["schedule", "Class Schedule", "clock", "t-mint"], ["study", "Study Timer", "flame", "t-orange"], ["grades", "Grades & GWA", "cap", "t-pink"], ["lists", "Lists", "list", "t-yellow"], ["history", "Transaction History", "history", "t-mint"], ["profile", "Profile & Settings", "user", "t-blue"]];
    return pghead() + '<div class="stack"><div class="menu">' + l.map(function (n) { return '<a href="#' + n[0] + '" class="rv ' + n[3] + '">' + ic(n[2]) + n[1] + '</a>'; }).join("") + '</div><section class="card quote rv">' + ic("cap") + '<span>“Discipline today, freedom tomorrow.”</span></section></div>';
  }

  /* ---------- admin ---------- */
  function fmtDay(ts) { return ts ? shortDate(ymd(new Date(ts))) : ""; }
  function vRequests() {
    var p = adm.pending;
    var pend = '<div class="card rv"><div class="ch"><h2>' + ic("shield") + 'Pending requests</h2></div>' + (p.length ? '<ul class="rows">' + p.map(function (r) {
      return '<li class="req"><div class="req-h"><b>@' + esc(r.username) + '</b><span class="muted">' + fmtDay(r.createdAt) + '</span></div>' +
        '<div class="req-b"><span class="req-amt num">' + fmt(r.amount) + '</span><span>' + esc(TYPE_LABEL[r.type] || r.type) + (r.category ? " · " + esc(r.category) : "") + ' · ' + shortDate(r.date) + (r.note ? " · " + esc(r.note) : "") + '</span></div>' +
        '<p class="req-r">' + (r.reason ? "Reason: “" + esc(r.reason) + "”" : "No reason given.") + '</p>' +
        '<label class="lab" for="note-' + r.id + '">Note to the user (optional)</label><input id="note-' + r.id + '" type="text" maxlength="200" placeholder="e.g. Keep it. This is for your laptop fund.">' +
        '<div class="req-a"><button class="sm" data-act="reject" data-id="' + r.id + '">Reject</button><button class="sm del" data-act="approve" data-id="' + r.id + '">Approve and delete</button></div></li>';
    }).join("") + '</ul>' : '<div class="empty"><span class="em">🛡️</span><span>No pending requests. Every saved transaction is safe for now.</span></div>') + '</div>';
    var d = adm.decided;
    var hist = d.length ? '<div class="card rv"><div class="ch"><h2>' + ic("history") + 'Recent decisions</h2></div><ul class="rows">' + d.map(function (r) {
      var b = r.status === "approved" ? '<span class="badge ok">Approved</span>' : '<span class="badge sch">Rejected</span>';
      return '<li class="rq"><div class="rq-t"><b>@' + esc(r.username) + ' · ' + fmt(r.amount) + '</b>' + b + '</div><div class="rq-s">' + esc(TYPE_LABEL[r.type] || r.type) + ' · ' + shortDate(r.date) + (r.decidedAt ? " · decided " + fmtDay(r.decidedAt) : "") + (r.adminNote ? " · " + esc(r.adminNote) : "") + '</div></li>';
    }).join("") + '</ul></div>' : "";
    return pghead() + '<div class="stack">' + pend + hist + '</div>';
  }
  function vUsers() {
    var u = adm.users, on = u.filter(function (x) { return x.online; }).length;
    return pghead() + '<div class="card rv"><div class="ch"><h2>' + ic("users") + 'Users (' + u.length + ')</h2><span class="badge ' + (on ? "ok" : "sch") + '">' + on + ' active now</span></div>' + (u.length ? '<ul class="rows">' + u.map(function (x) {
      var st = x.online ? '<span class="st on">Active now</span>' : '<span class="st">Offline' + (x.lastSeen ? " · last seen " + ago(x.lastSeen) : " · not seen yet") + '</span>';
      var where = x.pageLabel ? '<div class="where">' + (x.online ? "Viewing: " : "Last page: ") + '<b>' + esc(x.pageLabel) + '</b></div>' : "";
      return '<li class="urow"><span class="dot ' + (x.online ? "on" : "off") + '" aria-hidden="true"></span><div class="ubody"><b>@' + esc(x.username) + '</b> ' + st + where +
        '<div class="muted text-sm">Joined ' + fmtDay(x.createdAt) + ' · ' + x.savings + (x.savings === 1 ? " transaction" : " transactions") + ' · ' + x.notes + (x.notes === 1 ? " note" : " notes") + '</div></div>' +
        '<div class="uacts"><button class="sm" data-act="activity" data-id="' + x.id + '" data-u="' + esc(x.username) + '">Activity</button><button class="sm" data-act="resetpw" data-id="' + x.id + '" data-u="' + esc(x.username) + '">Reset password</button></div></li>';
    }).join("") + '</ul>' : '<div class="empty"><span class="em">👋</span><span>No one has signed up yet. Share the address with a classmate.</span></div>') + '</div>';
  }

  /* ---------- chat: friends, messages, pictures, GIFs and short videos ---------- */
  var chat = { uid: 0, people: [], sig: "", ago: {}, unread: {}, last: {}, reqs: 0, limits: { image: 8388608, video: 26214400 }, with: null, msgs: [], after: 0, since: 0, readUpTo: 0, rq: "", res: [], file: null, fileUrl: "", sending: false, busy: false, prevUnread: null, prevReqs: -1, stick: true, timer: null, shownBadge: -1, vol: 1, groups: [], sg: [], edit: null, info: false, pick: "", gifs: [], gq: "" };
  var ONLINE_MS = 75000;
  IC.info = "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5M12 8h.01";
  IC.smile = "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 14s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01";
  IC.image = "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9h.01";
  IC.sticker = "M20 12V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6zM20 12l-8 8M20 12h-4a4 4 0 0 0-4 4v4";
  IC.thumb = "M7 11v9H4v-9zM7 11l4-7c1.7 0 2.6 1.2 2.1 3L12.3 10H18a2 2 0 0 1 2 2.4l-1.3 6A2 2 0 0 1 16.8 20H7";
  IC.bell = "M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4";
  IC.palette = "M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s-.5-2 1-2H17a4 4 0 0 0 4-4 9 9 0 0 0-9-10zM7.5 11h.01M10 7.5h.01M14.5 7.5h.01";
  IC.shield = "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z";
  IC.photos = "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9h.01";
  var STK = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "🎉", "😎", "🥳", "😍", "🤣", "😭", "😡", "🤔", "👏", "💪", "🙌", "🥺", "😴", "🤝", "✅", "💯", "👌", "😅", "🤗", "😘", "🤩"];
  var EMO = "😀 😃 😄 😁 😆 😅 🤣 😂 🙂 😉 😊 😇 🥰 😍 🤩 😘 😗 😚 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐 🤨 😐 😑 😶 😏 😒 🙄 😬 🤥 😌 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🥵 🥶 🥴 😵 🤯 🤠 🥳 😎 🤓 🧐 😕 😟 🙁 😮 😯 😲 😳 🥺 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 💀 💩 🤡 👻 👽 🤖 ❤️ 🧡 💛 💚 💙 💜 🖤 🤍 💔 💕 💞 💓 💗 💖 💘 💝 💯 ✨ 🔥 🎉 🎊 👍 👎 👌 ✌️ 🤞 🤟 🤘 👈 👉 👆 👇 ✋ 🤚 👋 🤝 🙏 👏 🙌 💪 🫡 🙈 🙉 🙊 🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🍕 🍔 🍟 🌭 🍿 🍩 🍪 🎂 🍰 ☕ 🧋 🍺 ⚽ 🏀 🎮 🎧 📚 ✏️ 💡 🎓".split(" ");
  var THEMES = [["Blue", ""], ["Pink", "219 39 119"], ["Green", "22 163 74"], ["Purple", "124 58 237"], ["Orange", "234 88 12"], ["Red", "220 38 38"], ["Teal", "13 148 136"], ["Slate", "71 85 105"]];
  var CSEC = { info: true, media: true };
  /* mute and colour are kept on this device only */
  function cprefs() { try { return JSON.parse(localStorage.getItem("st_cpref") || "{}"); } catch (e) { return {}; } }
  function cpkey(k) { return (me ? me.id : 0) + "_" + k; }
  function cmuted(k) { var p = cprefs(); return !!(p.mute && p.mute[cpkey(k)]); }
  function ctheme(k) { var p = cprefs(); return (p.theme && p.theme[cpkey(k)]) || 0; }
  function cprefSet(kind, k, v) { var p = cprefs(); p[kind] = p[kind] || {}; if (v) p[kind][cpkey(k)] = v; else delete p[kind][cpkey(k)]; try { localStorage.setItem("st_cpref", JSON.stringify(p)); } catch (e) {} }
  function phoneW() { return window.matchMedia("(max-width:1023px)").matches; }
  function emojiOnly(t) { t = (t || "").trim(); if (!t || t.length > 24) return false; try { return /^(?:\p{Extended_Pictographic}[\ufe0f\u200d\p{Emoji_Modifier}]*|\s)+$/u.test(t) && (t.match(/\p{Extended_Pictographic}/gu) || []).length <= 3; } catch (e) { return false; } }

  function chatReset() { chat.people = []; chat.sig = ""; chat.ago = {}; chat.unread = {}; chat.last = {}; chat.reqs = 0; chat.with = null; chat.msgs = []; chat.after = 0; chat.since = 0; chat.res = []; chat.rq = ""; chat.prevUnread = null; chat.prevReqs = -1; chat.shownBadge = -1; chat.groups = []; chat.sg = []; chat.edit = null; chatClearFile(); }
  function chatBadge() { var n = chat.reqs || 0; for (var k in chat.unread) if (!cmuted(+k)) n += chat.unread[k] || 0; return n; }
  function chatPerson(id) { for (var i = 0; i < chat.people.length; i++) if (chat.people[i].id === id) return chat.people[i]; return null; }
  function chatGroup(id) { for (var i = 0; i < chat.groups.length; i++) if (chat.groups[i].id === id) return chat.groups[i]; return null; }
  function memberName(uid, gid) {
    if (me && uid === me.id) return "You";
    var g = gid ? chatGroup(gid) : null, m = g && g.members.filter(function (x) { return x.id === uid; })[0];
    if (m) return m.name;
    var p = chatPerson(uid); return p ? p.name : "Former member";
  }
  function gAv(g, big) { return '<span class="cav gav g' + (g.id % 6) + (big ? " big" : "") + '"><span class="av sm">👥</span></span>'; }
  function sgHidden() { try { return JSON.parse(localStorage.getItem("st_sg_hide") || "[]"); } catch (e) { return []; } }
  function sgHide(id) { var h = sgHidden(); h.push(id); try { localStorage.setItem("st_sg_hide", JSON.stringify(h.slice(-100))); } catch (e) {} }
  function chatOnline(id) { var a = chat.ago[id]; return a !== undefined && a >= 0 && a < ONLINE_MS; }
  function chatStatus(id) {
    var a = chat.ago[id];
    if (a === undefined || a < 0) return "Offline";
    if (a < ONLINE_MS) return "Online";
    var m = Math.round(a / 60000);
    return "Active " + (m < 60 ? m + "m" : m < 1440 ? Math.round(m / 60) + "h" : Math.round(m / 1440) + "d") + " ago";
  }
  function mediaUrl(name) { return "api.php?r=" + encodeURIComponent("/chat/media/" + name); }
  function avUrl(p) { return "api.php?r=" + encodeURIComponent("/chat/avatar/" + p.id) + "&v=" + p.av; }
  function pAv(p, big, view) {
    var inner = p.av ? '<img class="av sm" alt="" src="api.php?r=' + encodeURIComponent("/chat/avatar/" + p.id) + "&v=" + p.av + '">' : '<span class="av sm">' + esc((p.name || p.username || "?").charAt(0).toUpperCase()) + '</span>';
    return '<span class="cav' + (big ? " big" : "") + (view ? " zoom" : "") + '"' + (view ? ' role="button" tabindex="0" data-act="cprof" data-id="' + p.id + '" aria-label="View profile picture"' : "") + '>' + inner + '<i class="dot' + (chatOnline(p.id) ? " on" : "") + '" data-d="' + p.id + '"></i></span>';
  }
  function chatPrev(l, key) {
    if (!l) return "";
    if (l.kind === "system") return l.body;
    var t = l.kind === "image" ? "📷 Photo" : l.kind === "gif" ? "GIF" : l.kind === "video" ? "🎥 Video" : l.kind === "sticker" ? l.body + " Sticker" : l.kind === "share" ? "📎 Shared " + (/"t":"note"/.test(l.body) ? "a note" : "a task") : l.body;
    if (key < 0) return (l.mine ? "You" : memberName(l.by, -key)) + ": " + t;
    return (l.mine ? "You: " : "") + t;
  }
  function clock(ts) { var d = new Date(ts), h = d.getHours(); return (h % 12 || 12) + ":" + pad(d.getMinutes()) + " " + (h >= 12 ? "PM" : "AM"); }
  function chatDay(ts) {
    var d = new Date(ts), t = todayStr(), s = ymd(d);
    if (s === t) return "Today"; if (s === addDays(t, -1)) return "Yesterday";
    return DS[d.getDay()] + ", " + MON[d.getMonth()] + " " + d.getDate();
  }
  function mb(n) { return Math.round(n / 1048576) + " MB"; }

  /* ---- views ---- */
  function vChat() {
    return '<div class="chat" id="chat" data-th="' + (chat.with ? 1 : 0) + '">' +
      '<aside class="chl card"><div class="chl-h"><div class="srch">' + ic("search") + '<input id="cs-q" type="search" placeholder="Find people by username" aria-label="Find people" autocomplete="off" value="' + esc(chat.rq) + '"></div>' + (me && me.role === "user" ? '<button class="ib" data-act="cgnew" aria-label="New group chat" title="New group chat">' + ic("users") + '</button>' : "") + '</div><div id="cs-res"></div><div id="cl-body" class="cl-body"></div></aside>' +
      '<section class="cht card" id="cht"></section><aside class="cinfo card" id="cinfo" aria-label="Conversation info"></aside></div>';
  }
  function chatMounted() {
    chatPaintList(); chatPaintSearch(); chatPaintThread(true); chatSuggest();
    document.body.classList.toggle("chatting", !!chat.with);
    chatKick();
  }
  function chatPaint() { chatPaintList(); chatHeadUpdate(); }

  function rowReq(p) {
    return '<div class="clr rq2">' + pAv(p) + '<div class="clm"><b>' + esc(p.name) + '</b><small>@' + esc(p.username) + ' wants to be friends</small></div><button class="chip on-ok" data-act="caccept" data-id="' + p.id + '">Accept</button><button class="chip" data-act="cdecline" data-id="' + p.id + '" aria-label="Decline">' + ic("close") + '</button></div>';
  }
  function rowSug(p) {
    return '<div class="clr">' + pAv(p, false, true) + '<div class="clm"><b>' + esc(p.name) + '</b><small>' + (p.mutual ? p.mutual + " mutual friend" + (p.mutual > 1 ? "s" : "") : (p.online ? "Active now" : "@" + esc(p.username))) + '</small></div><button class="chip on-ok" data-act="cadd" data-id="' + p.id + '">' + ic("plus") + 'Add</button><button class="chip" data-act="csgx" data-id="' + p.id + '" aria-label="Hide suggestion">' + ic("close") + '</button></div>';
  }
  function chatPaintList() {
    var box = $("cl-body"); if (!box) return;
    var req = chat.people.filter(function (p) { return p.st === "got"; });
    var sent = chat.people.filter(function (p) { return p.st === "sent"; });
    var con = chat.people.filter(function (p) { return p.st === "friend" || p.st === "admin"; }).map(function (p) { return { key: p.id, p: p }; });
    chat.groups.forEach(function (g) { con.push({ key: -g.id, g: g }); });
    con.sort(function (a, b) { var x = chat.last[a.key], y = chat.last[b.key]; return (y ? y.at : 0) - (x ? x.at : 0) || ((a.p && a.p.st === "admin") ? -1 : 1); });
        var h = "";
    if (req.length) h += '<div class="cl-t">Friend requests</div>' + req.map(rowReq).join("");
    if (con.length) h += '<div class="cl-t">Messages</div>' + con.map(function (it) {
      var l = chat.last[it.key], u = chat.unread[it.key] || 0, p = it.p, g = it.g;
      var sub = l ? esc(chatPrev(l, it.key)) : (g ? g.members.length + " members" : (p.st === "admin" ? "Ask the admin anything" : "Say hi 👋"));
      return '<div class="clr' + (chat.with === it.key ? " on" : "") + '" role="button" tabindex="0" data-act="copen" data-id="' + it.key + '">' + (g ? gAv(g) : pAv(p)) +
        '<div class="clm"><b>' + esc(g ? g.name : p.name) + (p && p.st === "admin" ? ' <span class="adm">ADMIN</span>' : "") + (cmuted(it.key) ? ' <span class="mt">' + ic("mute") + '</span>' : "") + '</b><small class="' + (u ? "unr" : "") + '">' + sub + '</small></div>' +
        '<div class="clx">' + (l ? '<small>' + clock(l.at) + '</small>' : "") + (u ? '<span class="nb' + (cmuted(it.key) ? " mu" : "") + '">' + u + '</span>' : "") + '</div></div>';
    }).join("");
    if (sent.length) h += '<div class="cl-t">Requested</div>' + sent.map(function (p) {
      return '<div class="clr">' + pAv(p) + '<div class="clm"><b>' + esc(p.name) + '</b><small>@' + esc(p.username) + ' · waiting for them</small></div><button class="chip" data-act="cdecline" data-id="' + p.id + '">Cancel</button></div>';
    }).join("");
    if (!h) h = '<div class="empty"><span class="em">💬</span><span>No chats yet. Search a username above to add a friend.</span></div>';
    box.innerHTML = h;
  }
  function chatPaintSearch() {
    var box = $("cs-res"); if (!box) return;
    if (!chat.rq || chat.rq.length < 2) { box.innerHTML = ""; return; }
    var isAdm = me && me.role === "admin";
    box.innerHTML = '<div class="cl-t">Results</div>' + (chat.res.length ? chat.res.map(function (p) {
      var st = isAdm ? "friend" : p.st, a = st === "none" ? '<button class="chip on-ok" data-act="cadd" data-id="' + p.id + '">' + ic("plus") + 'Add</button>' : st === "sent" ? '<span class="muted sm2">Requested</span>' : st === "got" ? '<button class="chip on-ok" data-act="caccept" data-id="' + p.id + '">Accept</button>' : '<button class="chip" data-act="copen" data-id="' + p.id + '">Message</button>';
      return '<div class="clr">' + pAv(p, false, true) + '<div class="clm"><b>' + esc(p.name) + '</b><small>@' + esc(p.username) + '</small></div>' + a + '</div>';
    }).join("") : '<p class="hint" style="margin:6px 4px">No one with that username.</p>');
  }

  function groupStatus(g) {
    var on = 0; g.members.forEach(function (m) { if (me && m.id !== me.id && chatOnline(m.id)) on++; });
    return g.members.length + " members" + (on ? " · " + on + " online" : "");
  }
  function chatPaintThread(fresh) {
    var box = $("cht"); if (!box) return;
    var ch = $("chat"); if (ch) ch.dataset.th = chat.with ? 1 : 0;
    if (!chat.with) { box.innerHTML = '<div class="empty" style="margin:auto"><span class="em">💬</span><span>Pick a chat or add a friend to start talking.</span></div>'; chatPaintInfo(); return; }
    var head, grp = chat.with < 0, g = grp ? chatGroup(-chat.with) : null;
    if (grp) {
      if (!g) g = { id: -chat.with, name: "Group", members: [] };
      head = gAv(g, true) + '<div class="ctn"><b id="ct-name">' + esc(g.name) + '</b><small id="ct-st">' + groupStatus(g) + '</small></div><button class="ib" data-act="cinfo" aria-label="Conversation info" title="Info">' + ic("info") + '</button>';
    } else {
      var p = chatPerson(chat.with) || { id: chat.with, name: "…", username: "", av: 0, st: "friend" };
      head = pAv(p, true, true) + '<div class="ctn"><b id="ct-name">' + esc(p.name) + (p.st === "admin" ? ' <span class="adm">ADMIN</span>' : "") + '</b><small id="ct-st">' + chatStatus(p.id) + '</small></div>' +
        '<button class="ib" data-act="cinfo" aria-label="Conversation info" title="Info">' + ic("info") + '</button>';
    }
    box.innerHTML = '<header class="cth"><button class="ib cback" data-act="cback" aria-label="Back">' + ic("left") + '</button>' + head + '</header>' +
      '<div class="ctm" id="ctm" aria-live="polite"></div><div class="ctprev" id="ct-prev" hidden></div><div class="cedit" id="ct-edit" hidden><span>' + ic("pen") + ' Editing message</span><button type="button" class="chip" data-act="cedcancel">Cancel</button></div>' +
      '<div class="cpk" id="cpk" hidden></div>' +
      '<form id="cmf" class="ctc" autocomplete="off"><button type="button" class="ib cplus" data-act="ctray" aria-label="More options" title="More">' + ic("plus") + '</button>' +
      '<div class="ctools"><button type="button" class="ib" data-act="cattach" aria-label="Send a picture or video" title="Photo or video">' + ic("image") + '</button><button type="button" class="ib" data-act="cpick" data-p="st" aria-label="Stickers" title="Stickers">' + ic("sticker") + '</button><button type="button" class="ib gifb" data-act="cpick" data-p="gif" aria-label="GIF" title="GIF">GIF</button>' + (me && me.role === "user" ? '<button type="button" class="ib" data-act="cshare" aria-label="Share a task or note" title="Share a task or note">' + ic("notes") + '</button>' : "") + '</div>' +
      '<input type="file" id="cm-file" accept="image/*,video/*" hidden>' +
      '<div class="cinp"><textarea id="cm-t" rows="1" maxlength="2000" placeholder="Aa" aria-label="Message"></textarea><button type="button" class="ib emb" data-act="cpick" data-p="em" aria-label="Emoji" title="Emoji">' + ic("smile") + '</button></div>' +
      '<button type="submit" class="ib send" id="cm-send" data-like="1" aria-label="Send a like">' + ic("thumb") + '</button></form>';
    chat.stick = true; chat.pick = ""; chatApplyTheme(); chatSync(); chatPaintFile(); chatPaintEdit(); chatPaintInfo();
  }
  function chatHeadUpdate() {
    if (!chat.with) return;
    var s = $("ct-st");
    if (chat.with < 0) { var g = chatGroup(-chat.with); if (s && g) s.textContent = groupStatus(g); return; }
    if (s) s.textContent = chatStatus(chat.with);
    document.querySelectorAll('.cth .dot').forEach(function (d) { d.classList.toggle("on", chatOnline(chat.with)); });
  }

  function msgHtml(m, prev) {
    var sep = (!prev || ymd(new Date(prev.at)) !== ymd(new Date(m.at))) ? '<div class="cmsep">' + chatDay(m.at) + '</div>' : "";
    if (m.kind === "system") return sep + '<div class="cmsys" data-mid="' + m.id + '" data-up="' + m.up + '">' + esc(m.body) + '</div>';
    var grp = chat.with < 0, inner;
    if (m.kind === "deleted") inner = '<div class="cmb gone">Message removed</div>';
    else if (m.kind === "sticker") inner = '<div class="cmb cmstk">' + esc(m.body) + '</div>';
    else if (m.kind === "share") inner = shareCard(m);
    else if (m.kind === "text" && emojiOnly(m.body)) inner = '<div class="cmb cmstk sm">' + esc(m.body) + '</div>';
    else {
      var media = m.kind === "video" ? '<div class="cmvw"><video class="cmv" controls controlslist="nofullscreen" preload="metadata" playsinline src="' + mediaUrl(m.media) + '"></video><div class="cvol"><button type="button" class="cvm" data-act="cmute" aria-label="Mute">' + ic(chat.vol === 0 ? "mute" : "vol") + '</button><input type="range" class="cvr" min="0" max="1" step="0.05" value="' + chat.vol + '" aria-label="Volume"></div></div>' : (m.media ? '<img class="cmi" alt="Picture" loading="lazy" data-act="cview" data-src="' + esc(mediaUrl(m.media)) + '" src="' + mediaUrl(m.media) + '">' : "");
      inner = '<div class="cmb">' + media + (m.body ? '<span class="cmtx">' + esc(m.body) + '</span>' : "") + '</div>';
    }
    var who = (grp && !m.mine && m.kind !== "deleted" && (!prev || prev.by !== m.by || prev.kind === "system" || sep)) ? '<small class="cby">' + esc(memberName(m.by, -chat.with)) + '</small>' : "";
    var canEdit = m.mine && m.kind !== "deleted" && m.kind !== "sticker" && m.kind !== "share" && (m.kind === "text" || m.body);
    var meta = '<div class="cmeta">' + (m.edited && m.kind !== "deleted" ? '<small class="cedited">edited</small>' : "") + '<small class="cmt">' + clock(m.at) + '</small>' +
      (canEdit ? '<button class="cdel" data-act="cmedit" data-id="' + m.id + '" aria-label="Edit message">' + ic("pen") + '</button>' : "") +
      (m.mine && m.kind !== "deleted" ? '<button class="cdel" data-act="cmdel" data-id="' + m.id + '" aria-label="Unsend">' + ic("trash") + '<span></span></button>' : "") + '</div>';
    var rxb = m.kind !== "deleted" ? '<button type="button" class="rxadd" data-act="rxopen" data-id="' + m.id + '" aria-label="React to this message">🙂</button>' : "";
    var rxs = (m.rx && m.rx.length && m.kind !== "deleted") ? '<div class="rxs">' + m.rx.map(function (r) { return '<button type="button" class="rx' + (r.mine ? " mine" : "") + '" data-act="rxset" data-id="' + m.id + '" data-e="' + r.e + '" aria-label="' + r.e + ' ' + r.n + '">' + r.e + (r.n > 1 ? '<i>' + r.n + '</i>' : "") + '</button>'; }).join("") + '</div>' : "";
    return sep + '<div class="cmw ' + (m.mine ? "mine" : "their") + (rxs ? " hasrx" : "") + '" data-mid="' + m.id + '" data-up="' + m.up + '">' + who + '<div class="cmrow">' + (m.mine ? rxb + inner : inner + rxb) + '</div>' + rxs + meta + '</div>';
  }
  function chatSync() {
    var box = $("ctm"); if (!box) return;
    var near = box.scrollHeight - box.scrollTop - box.clientHeight < 90;
    if (near) chat.stick = true;
    chat.msgs.forEach(function (m, i) {
      var n = box.querySelector('[data-mid="' + m.id + '"]');
      if (!n) box.insertAdjacentHTML("beforeend", msgHtml(m, chat.msgs[i - 1]));
      else if (n.dataset.up !== String(m.up)) { var tmp = document.createElement("div"); tmp.innerHTML = msgHtml(m, chat.msgs[i - 1]); n.replaceWith(tmp.querySelector(".cmw")); }
    });
    box.querySelectorAll(".cseen").forEach(function (x) { x.remove(); });
    var lastMine = null; chat.msgs.forEach(function (m) { if (m.mine && m.kind !== "deleted") lastMine = m; });
    if (lastMine && lastMine.id <= chat.readUpTo) { var w = box.querySelector('[data-mid="' + lastMine.id + '"] .cmeta'); if (w) w.insertAdjacentHTML("afterbegin", '<small class="cseen">Seen ·</small>'); }
    if (!chat.msgs.length && !box.firstChild) box.innerHTML = '<div class="empty" style="margin:auto"><span class="em">👋</span><span>No messages yet. Say hi!</span></div>';
    else { var e0 = box.querySelector(".empty"); if (e0 && chat.msgs.length) e0.remove(); }
    if (chat.stick) box.scrollTop = box.scrollHeight;
    chatPaintMedia();
  }

  /* ---- talking to the server ---- */
  function chatApply(r, withId) {
    chat.ago = r.ago || {}; chat.unread = r.unread || {}; chat.last = r.last || {}; chat.reqs = r.reqs || 0; chat.since = r.t;
    if (r.sig !== chat.sig) { chat.sig = r.sig; chatRoster(); }
    var open = route === "chat" && chat.with;
    if (chat.prevUnread) {
      for (var k in chat.unread) {
        if ((chat.unread[k] || 0) > (chat.prevUnread[k] || 0) && !(open && +k === chat.with) && !cmuted(+k)) {
          var p = +k < 0 ? chatGroup(-k) : chatPerson(+k), l = chat.last[k];
          toast("💬 " + (p ? p.name : "New message") + (l ? ": " + chatPrev(l, +k).replace(/^You: /, "") : "")); break;
        }
      }
      if (chat.reqs > chat.prevReqs && chat.prevReqs >= 0) toast("👋 You have a new friend request");
    }
    chat.prevUnread = JSON.parse(JSON.stringify(chat.unread)); chat.prevReqs = chat.reqs;
    if (withId && withId === chat.with && r.msgs) {
      var changed = false;
      r.msgs.forEach(function (m) {
        var idx = -1; for (var i = 0; i < chat.msgs.length; i++) if (chat.msgs[i].id === m.id) { idx = i; break; }
        if (idx >= 0) { if (chat.msgs[idx].up !== m.up) { chat.msgs[idx] = m; changed = true; } } else { chat.msgs.push(m); changed = true; }
        if (m.id > chat.after) chat.after = m.id;
      });
      chat.msgs.sort(function (a, b) { return a.id - b.id; });
      chat.readUpTo = r.readUpTo || 0;
      if (route === "chat") chatSync();
    }
    var bd = chatBadge();
    if (bd !== chat.shownBadge) { chat.shownBadge = bd; renderSide(); renderTabs(); }
    if (route === "chat") chatPaint();
  }
  function chatPoll() {
    if (!me || chat.busy) return Promise.resolve();
    if (chat.uid !== me.id) { chatReset(); chat.uid = me.id; }
    chat.busy = true;
    var w = route === "chat" ? chat.with : null, url = "/api/chat/poll" + (w ? "?with=" + w + "&after=" + chat.after + "&since=" + chat.since : "");
    return api("GET", url).then(function (r) { chat.busy = false; chatApply(r, w); }).catch(function (e) { chat.busy = false; if (w && e && /not in this group|not friends/i.test(e.message || "")) { toast("You can no longer open that chat."); chatClose(); chatRoster(); } });
  }
  function chatRoster() {
    return api("GET", "/api/chat/roster").then(function (r) {
      chat.people = r.people; chat.groups = r.groups || []; if (r.limits) chat.limits = r.limits;
      if (route === "chat") {
        chatPaintList();
        if (chat.with) {
          var nm = $("ct-name"), nmv = chat.with < 0 ? (chatGroup(-chat.with) || {}).name : (chatPerson(chat.with) || {}).name;
          if (nm && nmv && nm.firstChild) nm.firstChild.nodeValue = nmv;
          chatHeadUpdate();
        }
        chatSuggest();
      }
    }).catch(function () {});
  }
  function chatSuggest() {
    if (!me || me.role !== "user") return;
    /* friend suggestions were removed on purpose: people are found by searching a username */
  }
  function chatKick() {
    clearTimeout(chat.timer);
    var d = 25000;
    if (me && document.visibilityState === "visible") { chatPoll(); d = route === "chat" ? (chat.with ? 3000 : 7000) : 25000; }
    chat.timer = setTimeout(chatKick, d);
  }
  setTimeout(chatKick, 1200);

  function chatOpen(id) {
    chat.with = id; chat.msgs = []; chat.after = 0; chat.since = 0; chat.readUpTo = 0; chat.stick = true; chat.pick = ""; if (phoneW()) chat.info = false;
    if (id > 0 && !chatPerson(id)) { var f = chat.res.filter(function (p) { return p.id === id; })[0]; if (f) chat.people.push({ id: f.id, username: f.username, name: f.name, av: f.av, role: "user", st: "friend" }); }
    chatPaintThread(true); chatPaintList();
    document.body.classList.add("chatting");
    chatKick();
    try { window.scrollTo(0, 0); } catch (e) {}
  }
  function chatClose() { chat.with = null; chat.info = false; chat.pick = ""; chat.msgs = []; chat.edit = null; chatClearFile(); document.body.classList.remove("chatting"); chatPaintThread(); chatPaintList(); chatKick(); }

  /* ---- editing a message you sent ---- */
  function chatPaintEdit() { chatSendMode(); var b = $("ct-edit"); if (b) b.hidden = !chat.edit; var a = document.querySelector('[data-act="cattach"]'); if (a) a.disabled = !!chat.edit; }
  function chatEditStart(id) {
    var m = chat.msgs.filter(function (x) { return x.id === id; })[0], t = $("cm-t"); if (!m || !m.mine || !t) return;
    chatClearFile(); chatPaintFile(); chat.edit = { id: id }; t.value = m.body; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 120) + "px"; chatPaintEdit(); t.focus();
    try { t.setSelectionRange(t.value.length, t.value.length); } catch (e) {}
  }
  function chatEditStop() { chat.edit = null; var t = $("cm-t"); if (t) { t.value = ""; t.style.height = ""; } chatPaintEdit(); }

  /* ---- sending ---- */
  function chatClearFile() { if (chat.fileUrl) { try { URL.revokeObjectURL(chat.fileUrl); } catch (e) {} } chat.file = null; chat.fileUrl = ""; }
  function chatPaintFile(pct) {
    chatSendMode();
    var box = $("ct-prev"); if (!box) return;
    if (!chat.file) { box.hidden = true; box.innerHTML = ""; return; }
    var isV = chat.file.type.indexOf("video/") === 0;
    box.hidden = false;
    box.innerHTML = (isV ? '<video src="' + chat.fileUrl + '" muted playsinline></video>' : '<img alt="" src="' + chat.fileUrl + '">') +
      '<div class="cpi"><b>' + esc(chat.file.name) + '</b><small>' + (chat.file.size / 1048576).toFixed(1) + ' MB' + (pct !== undefined ? " · sending " + pct + "%" : "") + '</small>' + (pct !== undefined ? '<i class="cpbar"><u style="width:' + pct + '%"></u></i>' : "") + '</div>' +
      (chat.sending ? "" : '<button type="button" class="ib" data-act="cfileclear" aria-label="Remove">' + ic("close") + '</button>');
  }
  function chatPick(f) {
    if (!f) return;
    var isV = f.type.indexOf("video/") === 0, isI = f.type.indexOf("image/") === 0;
    if (chat.edit) { toast("Finish or cancel the edit first."); return; }
    if (!isV && !isI) { toast("Pictures, GIFs and videos only."); return; }
    var lim = isV ? chat.limits.video : chat.limits.image;
    if (f.size > lim) { toast((isV ? "Videos" : "Pictures") + " can be up to " + mb(lim) + "."); return; }
    chatClearFile(); chat.file = f; chat.fileUrl = URL.createObjectURL(f); chatPaintFile();
    var t = $("cm-t"); if (t) t.focus();
  }
  function chatSend() {
    var t = $("cm-t"); if (!t || chat.sending || !chat.with) return;
    var txt = t.value.trim(), to = chat.with, file = chat.file;
    if (chat.edit) {
      if (!txt) { toast("Write something, or cancel the edit."); return; }
      chat.sending = true;
      api("PATCH", "/api/chat/messages/" + chat.edit.id, { text: txt }).then(function (r) {
        chat.sending = false;
        for (var i = 0; i < chat.msgs.length; i++) if (chat.msgs[i].id === r.msg.id) chat.msgs[i] = r.msg;
        chatEditStop(); chatSync(); chatPaintList(); chatKick();
      }).catch(function (e) { chat.sending = false; toast(e.message || "Could not save the edit."); });
      return;
    }
    if (!txt && !file) { chatSendExtra({ sticker: "👍" }); return; }
    chat.sending = true;
    var done = function (m) {
      chat.sending = false;
      if (m) {
        if (!chat.msgs.some(function (x) { return x.id === m.id; })) chat.msgs.push(m);
        if (m.id > chat.after) chat.after = m.id;
        chat.last[to] = { mine: true, kind: m.kind, body: m.body.slice(0, 60), at: m.at, by: me.id };
        if (to === chat.with) { t.value = ""; t.style.height = ""; chatClearFile(); chat.stick = true; chatSync(); chatPaintFile(); }
        chatPaintList(); chatKick();
      } else chatPaintFile();
    };
    var fail = function (msg) { chat.sending = false; toast(msg || "Could not send. Try again."); chatPaintFile(); };
    if (!file) {
      api("POST", "/api/chat/send", { to: to, text: txt }).then(function (r) { done(r.msg); }).catch(function (e) { fail(e.message); });
      return;
    }
    var fd = new FormData(); fd.append("to", to); fd.append("text", txt); fd.append("file", file);
    var x = new XMLHttpRequest();
    x.open("POST", "api.php?r=" + encodeURIComponent("/chat/send"));
    x.setRequestHeader("X-Requested-With", "studenttrack");
    x.upload.onprogress = function (e) { if (e.lengthComputable) chatPaintFile(Math.round(e.loaded / e.total * 100)); };
    x.onerror = function () { fail("The upload failed. Check your connection."); };
    x.onload = function () {
      var j = null; try { j = JSON.parse(x.responseText); } catch (er) {}
      if (x.status >= 200 && x.status < 300 && j && j.msg) done(j.msg);
      else fail(j && j.error ? j.error : (x.status === 413 ? "That file is too big for this server." : "Could not send. Try again."));
    };
    chatPaintFile(0); x.send(fd);
  }

  /* ---- Messenger-style bar: like, stickers, emoji, GIFs ---- */
  function chatSendMode() {
    var b = $("cm-send"), t = $("cm-t"); if (!b || !t) return;
    var like = !t.value.trim() && !chat.file && !chat.edit;
    if (b.dataset.like === (like ? "1" : "0")) return;
    b.dataset.like = like ? "1" : "0"; b.setAttribute("aria-label", like ? "Send a like" : "Send"); b.innerHTML = ic(like ? "thumb" : "send");
  }
  function chatSendExtra(body) {
    if (chat.sending || !chat.with || chat.edit) return;
    var to = chat.with; chat.sending = true;
    var d = { to: to }; for (var k in body) d[k] = body[k];
    api("POST", "/api/chat/send", d).then(function (r) {
      chat.sending = false; var m = r.msg;
      chat.last[to] = { mine: true, kind: m.kind, body: m.body.slice(0, 60), at: m.at, by: me.id };
      if (to === chat.with) {
        if (!chat.msgs.some(function (x) { return x.id === m.id; })) chat.msgs.push(m);
        if (m.id > chat.after) chat.after = m.id;
        chat.stick = true; chatSync();
      }
      chatPaintList(); chatKick();
    }).catch(function (er) { chat.sending = false; toast(er.message || "Could not send. Try again."); });
  }
  function insertAtCaret(t, s) {
    var a = t.selectionStart, b = t.selectionEnd; if (a == null) { a = b = t.value.length; }
    if (t.value.length - (b - a) + s.length > 2000) return;
    t.value = t.value.slice(0, a) + s + t.value.slice(b);
    var c = a + s.length; try { t.setSelectionRange(c, c); } catch (e) {}
    t.dispatchEvent(new Event("input", { bubbles: true }));
    if (window.matchMedia("(pointer: fine)").matches) t.focus({ preventScroll: true });
  }
  function chatPaintPick() {
    var box = $("cpk"); if (!box) return;
    var p = chat.pick; box.hidden = !p;
    if (!p) { box.innerHTML = ""; return; }
    var tabs = '<div class="cpt">' + [["em", "Emoji"], ["st", "Stickers"], ["gif", "GIF"]].map(function (t) { return '<button type="button" class="' + (p === t[0] ? "on" : "") + '" data-act="cpick" data-p="' + t[0] + '">' + t[1] + '</button>'; }).join("") + '<button type="button" class="cpx" data-act="cpick" data-p="" aria-label="Close">' + ic("close") + '</button></div>', body = "";
    if (p === "em") body = '<div class="cpg">' + EMO.map(function (e) { return '<button type="button" data-act="cemo" data-e="' + e + '">' + e + '</button>'; }).join("") + '</div>';
    else if (p === "st") body = '<div class="cpg stk">' + STK.map(function (e) { return '<button type="button" data-act="cstk" data-e="' + e + '">' + e + '</button>'; }).join("") + '</div>';
    else if (chat.limits.gif) body = '<div class="cpq"><input id="cg-q" type="search" placeholder="Search GIFs" autocomplete="off" value="' + esc(chat.gq) + '"></div><div class="cpg gifs" id="cg-out"></div>';
    else body = '<div class="cpn"><p>GIF search is not set up on this site yet. You can still send a GIF file from your device.</p><button type="button" class="chip on-ok" data-act="cgifup">' + ic("image") + 'Choose a GIF file</button></div>';
    box.innerHTML = tabs + body;
    if (p === "gif" && chat.limits.gif) chatLoadGifs(chat.gq);
  }
  var gifTimer = null;
  function chatLoadGifs(q) {
    chat.gq = q; var out = $("cg-out"); if (out) out.innerHTML = '<p class="hint" style="grid-column:1/-1;padding:8px">Loading…</p>';
    api("GET", "/api/chat/gifs?q=" + encodeURIComponent(q)).then(function (r) {
      if (q !== chat.gq) return; var o = $("cg-out"); if (!o) return;
      o.innerHTML = r.gifs.length ? r.gifs.map(function (g) { return '<button type="button" data-act="cgif" data-u="' + esc(g.url) + '"><img alt="GIF" loading="lazy" src="' + esc(g.thumb) + '"></button>'; }).join("") : '<p class="hint" style="grid-column:1/-1;padding:8px">No GIFs found.</p>';
    }).catch(function (e) { var o = $("cg-out"); if (o) o.innerHTML = '<p class="hint" style="grid-column:1/-1;padding:8px">' + esc(e.message || "GIFs are not available right now.") + '</p>'; });
  }
  function chatApplyTheme() {
    var c = $("cht"); if (!c) return;
    var t = THEMES[ctheme(chat.with)]; if (t && t[1]) c.style.setProperty("--cmine", t[1]); else c.style.removeProperty("--cmine");
  }

  /* ---- info panel (Messenger style) ---- */
  function chatLinks() {
    var out = [], seen = {};
    chat.msgs.forEach(function (m) { if (m.kind === "deleted" || !m.body) return; (m.body.match(/https?:\/\/[^\s<>"']+/g) || []).forEach(function (u) { if (!seen[u]) { seen[u] = 1; out.push({ u: u, id: m.id }); } }); });
    return out;
  }
  function chatMediaHtml() {
    var med = chat.msgs.filter(function (m) { return m.media && m.kind !== "deleted"; }), lk = chatLinks();
    var h = med.length ? '<div class="cmg">' + med.slice().reverse().map(function (m) {
      return m.kind === "video" ? '<button type="button" class="cmgi" data-act="csjump" data-id="' + m.id + '" aria-label="Video"><video muted preload="metadata" src="' + mediaUrl(m.media) + '#t=0.1"></video><span class="pl">▶</span></button>'
        : '<button type="button" class="cmgi" data-act="cview" data-src="' + esc(mediaUrl(m.media)) + '" aria-label="Picture"><img alt="" loading="lazy" src="' + mediaUrl(m.media) + '"></button>';
    }).join("") + '</div>' : '<p class="hint">No pictures or videos yet.</p>';
    if (lk.length) h += '<div class="cis-t">Links</div>' + lk.slice().reverse().map(function (x) { return '<a class="cln" href="' + esc(x.u) + '" target="_blank" rel="noopener noreferrer">' + esc(x.u) + '</a>'; }).join("");
    return h;
  }
  function chatPaintMedia() {
    var b = $("cis-media"); if (!b) return;
    var sig = chat.msgs.map(function (m) { return m.id + (m.kind === "deleted" ? "x" : ""); }).join(",");
    if (b.dataset.sig === sig) return; b.dataset.sig = sig; b.innerHTML = chatMediaHtml();
  }
  function chatPaintSearchIn() {
    var out = $("cs-out"), q = ($("cs-in") || {}).value; if (!out) return; q = (q || "").trim().toLowerCase();
    if (!q) { out.innerHTML = '<p class="hint">Type a word to look through this chat.</p>'; return; }
    var hits = chat.msgs.filter(function (m) { return m.kind !== "deleted" && m.kind !== "system" && m.body && m.body.toLowerCase().indexOf(q) >= 0; }).slice(-30).reverse();
    out.innerHTML = hits.length ? hits.map(function (m) {
      return '<button type="button" class="csh" data-act="csjump" data-id="' + m.id + '"><b>' + esc(memberName(m.by, chat.with < 0 ? -chat.with : 0)) + '</b><span>' + esc(m.body.length > 90 ? m.body.slice(0, 90) + "…" : m.body) + '</span><small>' + chatDay(m.at) + ' · ' + clock(m.at) + '</small></button>';
    }).join("") : '<p class="hint">No messages with “' + esc(q) + '”.</p>';
  }
  function chatPaintInfo() {
    var box = $("cinfo"), ch = $("chat"); if (!box) return;
    var on = !!(chat.info && chat.with); if (ch) ch.dataset.info = on ? 1 : 0;
    if (!on) { box.innerHTML = ""; return; }
    var keep = $("cs-in") ? $("cs-in").value : "", grp = chat.with < 0, g = grp ? chatGroup(-chat.with) : null, p = grp ? null : chatPerson(chat.with);
    var name = grp ? (g ? g.name : "Group") : (p ? p.name : "…"), key = chat.with, muted = cmuted(key);
    var av = grp ? gAv(g || { id: -chat.with }, true) : pAv(p || { id: chat.with, name: "…", av: 0 }, true, true);
    var sec = function (id, title, icon, inner) { return '<section class="cis' + (CSEC[id] ? " open" : "") + '"><button type="button" class="cish" data-act="csec" data-s="' + id + '">' + ic(icon) + '<b>' + title + '</b>' + ic("right") + '</button><div class="cisb">' + inner + '</div></section>'; };
    var h = '<div class="cinh"><button class="ib cix" data-act="cinfo" aria-label="Close info">' + ic("close") + '</button>' + av + '<b class="cin">' + esc(name) + '</b><small>' + (grp ? groupStatus(g || { members: [] }) : chatStatus(chat.with)) + '</small>' +
      '<div class="cia"><button type="button" data-act="' + (grp ? "cginfo" : "cprof") + '" data-id="' + (grp ? -chat.with : chat.with) + '"><span>' + ic(grp ? "users" : "chat") + '</span>' + (grp ? "People" : "Profile") + '</button>' +
      '<button type="button" data-act="cmutetog"><span>' + ic(muted ? "bell" : "mute") + '</span>' + (muted ? "Unmute" : "Mute") + '</button>' +
      '<button type="button" data-act="cssearch"><span>' + ic("search") + '</span>Search</button></div></div>';
    var infoRows = grp ? '<p class="cir"><span>Members</span><b>' + (g ? g.members.length : 0) + '</b></p>' : '<p class="cir"><span>Username</span><b>@' + esc(p ? p.username : "") + '</b></p><p class="cir"><span>Status</span><b>' + esc(chatStatus(chat.with)) + '</b></p>' + (p && p.st === "admin" ? '<p class="cir"><span>Role</span><b>Admin</b></p>' : "");
    h += sec("info", "Chat info", "info", infoRows);
    h += sec("theme", "Customize chat", "palette", '<div class="csw">' + THEMES.map(function (t, i) { return '<button type="button" class="' + (ctheme(key) === i ? "on" : "") + '" data-act="ctheme" data-t="' + i + '" aria-label="' + t[0] + '" title="' + t[0] + '" style="--sw:' + (t[1] || "var(--blue-s)") + '"></button>'; }).join("") + '</div><p class="hint">Only you see this colour, on this device.</p>');
    if (grp && g) h += sec("members", "Chat members", "users", g.members.map(function (m) { return '<div class="clr cmem">' + pAv(chatPerson(m.id) || m, false, false) + '<div class="clm"><b>' + esc(m.id === (me && me.id) ? m.name + " (you)" : m.name) + '</b></div></div>'; }).join("") + '<button type="button" class="chip" data-act="cginfo" data-id="' + g.id + '" style="margin-top:8px">' + ic("pen") + 'Manage members</button>');
    h += sec("search", "Search in conversation", "search", '<div class="srch">' + ic("search") + '<input id="cs-in" type="search" placeholder="Search messages" autocomplete="off" value="' + esc(keep) + '"></div><div id="cs-out" class="cs-out"></div><p class="hint">Looks through the messages loaded in this chat.</p>');
    h += sec("media", "Media, files and links", "photos", '<div id="cis-media"></div>');
    var pv = '<p class="hint" style="margin-top:0">Only the people in this chat can read these messages.</p>';
    if (!grp && p && p.st === "friend" && p.role !== "admin" && me.role === "user") pv += '<button type="button" class="chip" data-act="cunfriend" data-id="' + p.id + '">Unfriend</button>';
    if (grp) pv += '<button type="button" class="chip" data-act="cgleave">Leave group</button>';
    var adm = chat.people.filter(function (x) { return x.st === "admin"; })[0];
    if (adm && me.role === "user" && chat.with !== adm.id) pv += '<button type="button" class="chip" data-act="copen" data-id="' + adm.id + '">Message the admin for help</button>';
    h += sec("privacy", "Privacy & support", "shield", pv);
    box.innerHTML = h; chatPaintSearchIn(); chatPaintMedia();
  }

  /* ---- events ---- */
  var csTimer = null;
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b) return;
    var act = b.dataset.act, id = +b.dataset.id;
    var reload = function () { return chatRoster().then(function () { return chatPoll(); }); };
    switch (act) {
      case "copen": chatOpen(id); break;
      case "cback": chatClose(); break;
      case "cadd": api("POST", "/api/chat/friends", { to: id }).then(function () { chat.res.forEach(function (p) { if (p.id === id) p.st = "sent"; }); chat.sg = chat.sg.filter(function (p) { return p.id !== id; }); chatPaintSearch(); chatPaintList(); toast("Friend request sent."); return reload(); }).catch(function (er) { toast(er.message); }); break;
      case "caccept": api("POST", "/api/chat/friends/" + id + "/accept", {}).then(function () { chat.res.forEach(function (p) { if (p.id === id) p.st = "friend"; }); chatPaintSearch(); toast("You are now friends."); return reload(); }).catch(function (er) { toast(er.message); }); break;
      case "cdecline": api("DELETE", "/api/chat/friends/" + id).then(reload).catch(function (er) { toast(er.message); }); break;
      case "cunfriend": openSheet({ type: "unfriend", id: id }); break;
      case "cunfriendgo": api("DELETE", "/api/chat/friends/" + id).then(function () { closeSheet(); chatClose(); return reload(); }).catch(function (er) { toast(er.message); }); break;
      case "cgnew": openSheet({ type: "gnew" }); break;
      case "cginfo": openSheet({ type: "ginfo", id: id }); break;
      case "cgrm": api("DELETE", "/api/chat/groups/" + (-chat.with) + "/members/" + id).then(function () { return chatRoster(); }).then(function () { if (sheetState && sheetState.type === "ginfo") renderSheet(); chatPoll(); }).catch(function (er) { toast(er.message); }); break;
      case "cgadd": {
        var ids = [].slice.call(document.querySelectorAll("#sheet .gadd input:checked")).map(function (x) { return +x.value; });
        if (!ids.length) { toast("Pick at least one friend."); break; }
        api("PATCH", "/api/chat/groups/" + (-chat.with), { add: ids }).then(function () { return chatRoster(); }).then(function () { if (sheetState && sheetState.type === "ginfo") renderSheet(); chatPoll(); toast("Added."); }).catch(function (er) { toast(er.message); });
        break;
      }
      case "cgleave":
        if (!b.classList.contains("ask")) { b.classList.add("ask"); b.textContent = "Tap again to leave"; setTimeout(function () { b.classList.remove("ask"); b.textContent = "Leave group"; }, 3000); }
        else api("DELETE", "/api/chat/groups/" + (-chat.with) + "/members/" + me.id).then(function () { closeSheet(); chatClose(); return reload(); }).catch(function (er) { toast(er.message); });
        break;
      case "csgx": sgHide(id); chat.sg = chat.sg.filter(function (p) { return p.id !== id; }); chatPaintList(); break;
      case "cmedit": chatEditStart(id); break;
      case "rxopen": rxOpen(id, b.closest(".cmw")); break;
      case "rxset": rxSet(id, b.dataset.e); break;
      case "cedcancel": chatEditStop(); break;
      case "cattach": if ($("cm-file")) { $("cm-file").accept = "image/*,video/*"; $("cm-file").click(); } break;
      case "cgifup": if ($("cm-file")) { $("cm-file").accept = "image/gif"; $("cm-file").click(); } break;
      case "ctray": { var fm = $("cmf"); if (fm) fm.classList.toggle("tray"); break; }
      case "cpick": { var np = b.dataset.p || ""; chat.pick = (np && chat.pick === np && b.closest("#cmf")) ? "" : np; chatPaintPick(); break; }
      case "cemo": { var tx = $("cm-t"); if (tx) insertAtCaret(tx, b.dataset.e); break; }
      case "cstk": chatSendExtra({ sticker: b.dataset.e }); break;
      case "cgif": chat.pick = ""; chatPaintPick(); chatSendExtra({ gif: b.dataset.u }); break;
      case "cinfo": chat.info = !chat.info; chatPaintInfo(); break;
      case "csec": CSEC[b.dataset.s] = !CSEC[b.dataset.s]; b.parentNode.classList.toggle("open", !!CSEC[b.dataset.s]); break;
      case "cmutetog": cprefSet("mute", chat.with, cmuted(chat.with) ? 0 : 1); chat.shownBadge = -1; chatPaintInfo(); chatPaintList(); renderSide(); renderTabs(); toast(cmuted(chat.with) ? "Muted. You will not get alerts from this chat." : "Unmuted."); break;
      case "ctheme": cprefSet("theme", chat.with, +b.dataset.t || 0); chatApplyTheme(); chatPaintInfo(); break;
      case "cssearch": CSEC.search = true; chatPaintInfo(); if ($("cs-in")) $("cs-in").focus(); break;
      case "csjump": {
        var tn = document.querySelector('#ctm [data-mid="' + id + '"]'); if (!tn) break;
        if (phoneW()) { chat.info = false; chatPaintInfo(); }
        chat.stick = false; tn.scrollIntoView({ block: "center" }); tn.classList.add("flash"); setTimeout(function () { tn.classList.remove("flash"); }, 1800); break;
      }
      case "cfileclear": chatClearFile(); chatPaintFile(); break;
      case "cprof": openSheet({ type: "cprof", id: id }); break;
      case "cmute": {
        var wv = b.closest(".cmvw"), vd = wv && wv.querySelector("video"), rg = wv && wv.querySelector(".cvr");
        if (vd) { var mu = chat.vol > 0; chat.vol = mu ? 0 : 1; vd.muted = false; vd.volume = chat.vol; if (rg) rg.value = chat.vol; b.innerHTML = ic(mu ? "mute" : "vol"); }
        break;
      }
      case "cview": openSheet({ type: "pic", src: b.dataset.src }); break;
      case "cmdel":
        if (!b.classList.contains("ask")) { b.classList.add("ask"); b.querySelector("span").textContent = "Unsend?"; setTimeout(function () { b.classList.remove("ask"); if (b.querySelector("span")) b.querySelector("span").textContent = ""; }, 3000); }
        else api("DELETE", "/api/chat/messages/" + id).then(function () { return chatPoll(); }).catch(function (er) { toast(er.message); });
        break;
    }
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.dataset && (e.target.dataset.act === "copen" || e.target.dataset.act === "cprof") && e.target.getAttribute("role") === "button") { e.preventDefault(); e.target.click(); return; }
    if (e.key === "Escape" && chat.edit && e.target.id === "cm-t") { e.preventDefault(); chatEditStop(); return; }
    if (e.key === "Enter" && !e.shiftKey && e.target.id === "cm-t" && window.matchMedia("(pointer: fine)").matches) { e.preventDefault(); if (e.target.value.trim() || chat.file || chat.edit) chatSend(); }
  });
  document.addEventListener("input", function (e) {
    if (e.target.classList && e.target.classList.contains("cvr")) {
      var w2 = e.target.closest(".cmvw"), v2 = w2 && w2.querySelector("video"), v = parseFloat(e.target.value) || 0;
      chat.vol = v; if (v2) { v2.muted = false; v2.volume = v; }
      var mb2 = w2 && w2.querySelector(".cvm"); if (mb2) mb2.innerHTML = ic(v === 0 ? "mute" : "vol");
      return;
    }
    if (e.target.id === "cm-t") { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; chatSendMode(); }
    if (e.target.id === "cs-in") chatPaintSearchIn();
    if (e.target.id === "cg-q") { var gq = e.target.value.trim(); clearTimeout(gifTimer); gifTimer = setTimeout(function () { chatLoadGifs(gq); }, 350); }
    if (e.target.id === "cs-q") {
      chat.rq = e.target.value.trim(); clearTimeout(csTimer);
      chatPaintList();   /* hide the suggestions while searching */
      if (chat.rq.length < 2) { chat.res = []; chatPaintSearch(); return; }
      csTimer = setTimeout(function () {
        var q = chat.rq;
        api("GET", "/api/chat/people?q=" + encodeURIComponent(q)).then(function (r) { if (q === chat.rq) { chat.res = r.people; chatPaintSearch(); } }).catch(function () {});
      }, 300);
    }
  });
  document.addEventListener("change", function (e) {
    if (e.target.id === "cm-file") { var f = e.target.files && e.target.files[0]; e.target.value = ""; chatPick(f); }
  });
  document.addEventListener("submit", function (e) {
    var f = e.target;
    if (f.id === "cmf") { e.preventDefault(); chatSend(); return; }
    if (f.id === "gnf") {
      e.preventDefault();
      var ids = [].slice.call(f.querySelectorAll("input[type=checkbox]:checked")).map(function (x) { return +x.value; });
      if (!ids.length) { toast("Pick at least one friend."); return; }
      api("POST", "/api/chat/groups", { name: $("gn-name").value.trim(), members: ids }).then(function (r) { closeSheet(); return chatRoster().then(function () { chatOpen(-r.id); }); }).catch(function (er) { toast(er.message); });
    }
    if (f.id === "gnr") {
      e.preventDefault();
      api("PATCH", "/api/chat/groups/" + (-chat.with), { name: $("gr-name").value.trim() }).then(function () { return chatRoster(); }).then(function () { if (sheetState && sheetState.type === "ginfo") renderSheet(); chatPoll(); toast("Saved."); }).catch(function (er) { toast(er.message); });
    }
  });
  /* pictures and videos change the height once they load: keep the newest message in view */
  document.addEventListener("load", function (e) { if (e.target.classList && e.target.classList.contains("cmi") && chat.stick) { var b = $("ctm"); if (b) b.scrollTop = b.scrollHeight; } }, true);
  document.addEventListener("loadedmetadata", function (e) { if (e.target.classList && e.target.classList.contains("cmv")) e.target.volume = chat.vol; if (e.target.classList && e.target.classList.contains("cmv") && chat.stick) { var b = $("ctm"); if (b) b.scrollTop = b.scrollHeight; } }, true);
  document.addEventListener("scroll", function (e) { if (e.target && e.target.id === "ctm") { var b = e.target; chat.stick = b.scrollHeight - b.scrollTop - b.clientHeight < 90; } }, true);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible" && me) chatKick(); });

  /* paste a copied picture (or screenshot) straight into the message box, or drop a file on the chat */
  document.addEventListener("paste", function (e) {
    if (!chat.with || !$("cm-t") || !e.clipboardData) return;
    var files = e.clipboardData.files && e.clipboardData.files.length ? e.clipboardData.files : null, f = null;
    if (files) for (var i = 0; i < files.length; i++) if (/^(image|video)\//.test(files[i].type)) { f = files[i]; break; }
    if (!f && e.clipboardData.items) for (var j = 0; j < e.clipboardData.items.length; j++) { var it = e.clipboardData.items[j]; if (it.kind === "file" && /^(image|video)\//.test(it.type)) { f = it.getAsFile(); break; } }
    if (f) { e.preventDefault(); chatPick(f); }
  });
  document.addEventListener("dragover", function (e) { if (chat.with && e.target.closest && e.target.closest("#cht")) { e.preventDefault(); $("cht").classList.add("drop"); } });
  document.addEventListener("dragleave", function (e) { if (e.target.closest && e.target.closest("#cht") && !e.relatedTarget) $("cht").classList.remove("drop"); });
  document.addEventListener("drop", function (e) {
    if (!chat.with || !e.target.closest || !e.target.closest("#cht")) return;
    e.preventDefault(); $("cht").classList.remove("drop");
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f) chatPick(f);
  });

  /* ---- group sheets ---- */
  function gpick(p) { return '<label class="gpk">' + pAv(p) + '<span class="gpn"><b>' + esc(p.name) + '</b><small>@' + esc(p.username) + '</small></span><input type="checkbox" value="' + p.id + '"></label>'; }
  function chatSheet(s) {
    var fr = chat.people.filter(function (p) { return p.st === "friend" && p.role !== "admin"; });
    if (s.type === "gnew") {
      return '<div class="sh"><h3>New group</h3>' + closeBtn() + '</div><form id="gnf" class="form" autocomplete="off"><div class="field"><label for="gn-name">Group name</label><input id="gn-name" maxlength="40" required placeholder="e.g. Study Squad"></div>' +
        '<div class="field"><span class="lab">Add friends</span>' + (fr.length ? '<div class="gpl">' + fr.map(gpick).join("") + '</div>' : '<p class="hint">You need friends first. Add some using the search box.</p>') + '</div><button class="btn" type="submit"' + (fr.length ? "" : " disabled") + '>Create group</button></form>';
    }
    var g = chatGroup(s.id);
    if (!g) return '<div class="sh"><h3>Group</h3>' + closeBtn() + '</div><p class="hint">This group is no longer available.</p>';
    var mine = g.owner === me.id, ids = g.members.map(function (m) { return m.id; }), can = fr.filter(function (p) { return ids.indexOf(p.id) < 0; });
    return '<div class="sh"><h3>Group</h3>' + closeBtn() + '</div>' +
      '<form id="gnr" class="form" autocomplete="off"><div class="field"><label for="gr-name">Group name</label><input id="gr-name" maxlength="40" required value="' + esc(g.name) + '"></div><button class="btn" type="submit">Save name</button></form>' +
      '<div class="cl-t">' + g.members.length + ' members</div><div class="gml">' + g.members.map(function (m) {
        return '<div class="clr gm">' + pAv(m) + '<div class="clm"><b>' + esc(m.name) + (m.id === me.id ? " (you)" : "") + (m.id === g.owner ? ' <span class="adm">OWNER</span>' : "") + '</b><small>@' + esc(m.username) + '</small></div>' + (mine && m.id !== me.id ? '<button class="chip" data-act="cgrm" data-id="' + m.id + '">Remove</button>' : "") + '</div>';
      }).join("") + '</div>' +
      (can.length ? '<div class="cl-t">Add people</div><div class="gpl gadd">' + can.map(gpick).join("") + '</div><button class="btn" type="button" data-act="cgadd">Add selected</button>' : "") +
      '<button class="btn danger" type="button" data-act="cgleave">Leave group</button>';
  }

  /* ---- reactions: long-press (phone) or right-click / hover button (PC) a message to react with an emoji ---- */
  var RX = ["👍", "❤️", "😂", "😮", "😢", "🙏"], lpTimer = null, lpAt = 0, lpXY = null;
  function rxClose() { var b = $("rxbar"); if (b) b.remove(); }
  function rxOpen(mid, w) {
    var m = chat.msgs.filter(function (x) { return x.id === mid; })[0]; if (!m || m.kind === "deleted" || m.kind === "system" || !w) return;
    rxClose();
    var mineE = ((m.rx || []).filter(function (r) { return r.mine; })[0] || {}).e;
    var bar = document.createElement("div"); bar.id = "rxbar"; bar.setAttribute("role", "toolbar"); bar.setAttribute("aria-label", "Pick a reaction");
    bar.innerHTML = RX.map(function (e) { return '<button type="button" class="' + (e === mineE ? "on" : "") + '" data-act="rxset" data-id="' + mid + '" data-e="' + e + '" aria-label="React ' + e + '">' + e + '</button>'; }).join("");
    document.body.appendChild(bar);
    var anchor = w.querySelector(".cmb") || w, r = anchor.getBoundingClientRect(), bw = bar.offsetWidth, bh = bar.offsetHeight;
    var left = Math.max(8, Math.min(window.innerWidth - bw - 8, r.left + r.width / 2 - bw / 2));
    var top = r.top - bh - 8; if (top < 8) top = Math.min(window.innerHeight - bh - 8, r.bottom + 8);
    bar.style.left = left + "px"; bar.style.top = top + "px";
  }
  function rxSet(mid, e) {
    rxClose();
    var m = chat.msgs.filter(function (x) { return x.id === mid; })[0]; if (!m) return;
    var before = JSON.stringify(m.rx || []), beforeUp = m.up;
    var cur = ((m.rx || []).filter(function (r) { return r.mine; })[0] || {}).e, next = cur === e ? "" : e;
    var rx = (m.rx || []).map(function (r) { return { e: r.e, n: r.n, mine: r.mine }; });
    if (cur) { rx.forEach(function (r) { if (r.e === cur) { r.n--; r.mine = false; } }); rx = rx.filter(function (r) { return r.n > 0; }); }
    if (next) { var f = rx.filter(function (r) { return r.e === next; })[0]; if (f) { f.n++; f.mine = true; } else rx.push({ e: next, n: 1, mine: true }); }
    m.rx = rx; m.up = Date.now(); chatSync();
    api("PUT", "/api/chat/messages/" + mid + "/reaction", { emoji: next }).then(function (r) {
      for (var i = 0; i < chat.msgs.length; i++) if (chat.msgs[i].id === mid) chat.msgs[i] = r.msg;
      chatSync();
    }).catch(function (er) { m.rx = JSON.parse(before); m.up = beforeUp + 1; chatSync(); toast(er.message || "Could not react."); });
  }
  function msgWrap(t) { var w = t.closest && t.closest(".cmw[data-mid]"); return w && !t.closest(".cvol, video, .cvr") ? w : null; }
  document.addEventListener("touchstart", function (e) {
    var w = msgWrap(e.target); if (!w || !e.target.closest(".cmb")) return;
    var t = e.touches[0]; lpXY = [t.clientX, t.clientY]; clearTimeout(lpTimer);
    lpTimer = setTimeout(function () { lpAt = Date.now(); rxOpen(+w.dataset.mid, w); try { if (navigator.vibrate) navigator.vibrate(12); } catch (er) {} }, 420);
  }, { passive: true });
  document.addEventListener("touchmove", function (e) { if (!lpXY) return; var t = e.touches[0]; if (Math.abs(t.clientX - lpXY[0]) > 10 || Math.abs(t.clientY - lpXY[1]) > 10) { clearTimeout(lpTimer); lpXY = null; } }, { passive: true });
  ["touchend", "touchcancel"].forEach(function (n) { document.addEventListener(n, function () { clearTimeout(lpTimer); lpXY = null; }, { passive: true }); });
  document.addEventListener("contextmenu", function (e) {
    var w = msgWrap(e.target); if (!w || !e.target.closest(".cmb")) return;
    e.preventDefault(); lpAt = Date.now(); rxOpen(+w.dataset.mid, w);
  });
  /* the tap that ends a long press must not also open the picture or press a button */
  document.addEventListener("click", function (e) { if (lpAt && Date.now() - lpAt < 700 && e.target.closest && e.target.closest(".cmw")) { e.stopPropagation(); e.preventDefault(); lpAt = 0; } }, true);
  document.addEventListener("click", function (e) { if (!e.target.closest("#rxbar") && !e.target.closest('[data-act="rxopen"]')) rxClose(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { rxClose(); if (chat.pick) { chat.pick = ""; chatPaintPick(); } } });
  document.addEventListener("click", function (e) { if (chat.pick && e.target.isConnected && !e.target.closest("#cpk,#cmf")) { chat.pick = ""; chatPaintPick(); } });
  document.addEventListener("scroll", function () { rxClose(); }, true);
  window.addEventListener("resize", rxClose);

  /* ---- note checklist: Enter adds a line, Backspace on an empty line removes it ---- */
  document.addEventListener("keydown", function (e) {
    var t = e.target; if (!t.classList || !t.classList.contains("nit")) return;
    var row = t.closest(".nirow");
    if (e.key === "Enter") { e.preventDefault(); row.insertAdjacentHTML("afterend", nitemRow("", 0)); row.nextSibling.querySelector(".nit").focus(); }
    else if (e.key === "Backspace" && t.value === "" && row.parentNode.children.length > 1) { e.preventDefault(); var prev = row.previousElementSibling || row.nextElementSibling; row.remove(); if (prev) prev.querySelector(".nit").focus(); }
  });

  /* ---------- sheets ---------- */
  var closeBtn = function () { return '<button class="ib" data-act="close" aria-label="Close">' + ic("close") + '</button>'; };
  function subjectList() { var s = SUBJECTS.slice(); data.notes.forEach(function (x) { if (s.indexOf(x.subject) < 0 && x.subject !== "General") s.push(x.subject); }); return s; }
  function moodPick(cur, act) {
    return '<div class="moods" id="je-moods">' + MOODS.map(function (m, i) { return '<button type="button" class="mood' + (cur === i + 1 ? " on" : "") + '" data-act="' + act + '" data-v="' + (i + 1) + '" aria-label="' + m[1] + '">' + m[0] + '<small>' + m[1] + '</small></button>'; }).join("") + '</div>';
  }
  function nitemRow(t, d) {
    return '<div class="nirow"><button type="button" class="ck" role="checkbox" aria-checked="' + (d ? "true" : "false") + '" aria-label="Done" data-act="nitemtog">' + ic("check") + '</button><input class="nit" type="text" maxlength="120" placeholder="List item" aria-label="List item" value="' + esc(t || "") + '"><button type="button" class="ib" data-act="nitemrm" aria-label="Remove item">' + ic("close") + '</button></div>';
  }
  function collectItems() {
    return [].slice.call(document.querySelectorAll("#n-items .nirow")).map(function (r) { return { t: r.querySelector(".nit").value.trim(), d: r.querySelector(".ck").getAttribute("aria-checked") === "true" ? 1 : 0 }; }).filter(function (i) { return i.t; }).slice(0, 40);
  }
  function sheetBody() {
    var s = sheetState;
    if (s.type === "class") {
      var cl = s.id ? xd.classes.filter(function (x) { return x.id === s.id; })[0] : null, ce = cl || { subject: "", day: s.day != null ? +s.day : new Date().getDay(), start: "08:00", end: "09:30", room: "", color: "blue" };
      return '<div class="sh"><h3>' + (cl ? "Edit class" : "Add class") + '</h3>' + closeBtn() + '</div><form id="classf" class="form" autocomplete="off">' +
        '<div class="field"><label for="c-subject">Subject</label><input id="c-subject" list="c-subj" type="text" maxlength="40" required placeholder="e.g. Computer Programming" value="' + esc(ce.subject) + '"><datalist id="c-subj">' + subjectList().map(function (x) { return '<option value="' + esc(x) + '">'; }).join("") + '</datalist></div>' +
        '<div class="field"><span class="lab">Day</span><div class="chips">' + WK.map(function (d) { return '<button type="button" class="chip' + (ce.day === d ? " on" : "") + '" data-act="pickv" data-t="c-day" data-v="' + d + '">' + DS[d] + '</button>'; }).join("") + '</div><input type="hidden" id="c-day" value="' + ce.day + '"></div>' +
        '<div class="two"><div class="field"><label for="c-start">Starts</label><input id="c-start" type="time" required value="' + esc(ce.start) + '"></div><div class="field"><label for="c-end">Ends</label><input id="c-end" type="time" required value="' + esc(ce.end) + '"></div></div>' +
        '<div class="field"><label for="c-room">Room (optional)</label><input id="c-room" type="text" maxlength="20" placeholder="e.g. Lab 2" value="' + esc(ce.room) + '"></div>' +
        '<div class="field"><span class="lab">Colour</span><div class="chips">' + LIST_COLORS.map(function (k) { return '<button type="button" class="chip' + (ce.color === k ? " on" : "") + '" data-act="pickv" data-t="c-color" data-v="' + k + '" aria-label="' + k + '"><i class="cdot" style="background:' + LSWATCH[k] + '"></i></button>'; }).join("") + '</div><input type="hidden" id="c-color" value="' + esc(ce.color) + '"></div>' +
        '<button class="btn" type="submit">Save</button>' + (cl ? '<button type="button" class="btn danger" data-act="del" data-c="classes" data-id="' + esc(cl.id) + '">Delete</button>' : "") + '</form>';
    }
    if (s.type === "grade") {
      var gr = s.id ? xd.grades.filter(function (x) { return x.id === s.id; })[0] : null, ge = gr || { subject: "", units: 3, grade: "", term: s.term || "" };
      var chipsFor = function (t, vals, cur) { return vals.map(function (x) { return '<button type="button" class="chip' + (String(cur) === String(x) ? " on" : "") + '" data-act="pickv" data-t="' + t + '" data-v="' + x + '">' + x + '</button>'; }).join(""); };
      return '<div class="sh"><h3>' + (gr ? "Edit grade" : "Add grade") + '</h3>' + closeBtn() + '</div><form id="gradef" class="form" autocomplete="off">' +
        '<div class="field"><label for="g-subject">Subject</label><input id="g-subject" list="g-subj" type="text" maxlength="40" required placeholder="e.g. Discrete Math" value="' + esc(ge.subject) + '"><datalist id="g-subj">' + subjectList().map(function (x) { return '<option value="' + esc(x) + '">'; }).join("") + '</datalist></div>' +
        '<div class="two"><div class="field"><label for="g-units">Units</label><input id="g-units" type="number" min="0.5" max="12" step="0.5" required value="' + esc(ge.units) + '"></div><div class="field"><label for="g-grade">Grade (1.00 to 5.00)</label><input id="g-grade" type="number" min="1" max="5" step="0.01" inputmode="decimal" required value="' + esc(ge.grade) + '"></div></div>' +
        '<div class="chips">' + chipsFor("g-units", [1, 2, 3, 5], ge.units) + '</div><div class="chips" style="margin-top:6px">' + chipsFor("g-grade", ["1.00", "1.25", "1.50", "1.75", "2.00", "2.25", "2.50", "2.75", "3.00", "5.00"], ge.grade !== "" ? (+ge.grade).toFixed(2) : "") + '</div>' +
        '<div class="field"><label for="g-term">Term (optional)</label><input id="g-term" type="text" maxlength="20" placeholder="e.g. 1st Sem" value="' + esc(ge.term) + '"></div><div class="chips">' + chipsFor("g-term", ["1st Sem", "2nd Sem", "Summer"], ge.term) + '</div>' +
        '<button class="btn" type="submit">Save</button>' + (gr ? '<button type="button" class="btn danger" data-act="del" data-c="grades" data-id="' + esc(gr.id) + '">Delete</button>' : "") + '</form>';
    }
    if (s.type === "budget") {
      var bc = s.cat || "", bold = xd.budgets.filter(function (x) { return x.category === bc; })[0];
      return '<div class="sh"><h3>' + (bold ? "Edit budget" : "Monthly budget") + '</h3>' + closeBtn() + '</div><form id="budgetf" class="form" autocomplete="off">' +
        '<div class="field"><label for="b-cat">Category</label><input id="b-cat" type="text" maxlength="30" required placeholder="e.g. Food" value="' + esc(bc) + '"' + (bold ? " readonly" : "") + '></div>' +
        (bold ? "" : '<div class="chips">' + EXP_CATS.map(function (k) { return '<button type="button" class="chip" data-act="pickv" data-t="b-cat" data-v="' + k + '">' + k + '</button>'; }).join("") + '</div>') +
        '<div class="field"><label for="b-amt">Limit per month</label><div class="money-in"><span>₱</span><input id="b-amt" type="number" inputmode="decimal" min="1" step="any" required placeholder="0.00" value="' + (bold ? bold.amount : "") + '"></div></div>' +
        '<p class="hint">You get a warning at 80% and when you go over. Only spending in this category counts.</p>' +
        '<button class="btn" type="submit">Save budget</button>' + (bold ? '<button type="button" class="btn danger" data-act="budgetdel" data-cat="' + esc(bc) + '">Remove budget</button>' : "") + '</form>';
    }
    if (s.type === "cshare") {
      var st1 = data.tasks.filter(function (x) { return !x.done; }).slice(0, 12), sn1 = data.notes.filter(function (x) { return !x.done; }).slice(0, 12);
      var shrow = function (t, x, sub) { return '<button type="button" class="shrow" data-act="cshsend" data-t="' + t + '" data-id="' + esc(x.id) + '">' + ic(t === "note" ? "notes" : "tasks") + '<span class="min-w-0"><b class="block truncate">' + esc(x.title) + '</b><small class="muted">' + esc(sub) + '</small></span></button>'; };
      return '<div class="sh"><h3>Share in this chat</h3>' + closeBtn() + '</div><p class="hint" style="margin-top:0">Pick something to send. Friends get a copy they can save. Your original stays private.</p>' +
        '<div class="cis-t">Notes &amp; assignments</div>' + (sn1.length ? sn1.map(function (x) { return shrow("note", x, x.subject + " · " + KIND_LABEL[x.kind]); }).join("") : '<p class="hint">Nothing pending.</p>') +
        '<div class="cis-t">Tasks</div>' + (st1.length ? st1.map(function (x) { return shrow("task", x, shortDate(x.date) + (x.time ? " · " + fmtTime(x.time) : "")); }).join("") : '<p class="hint">Nothing pending.</p>');
    }
    if (s.type === "crop") return '<div class="sh"><h3>Adjust your photo</h3>' + closeBtn() + '</div><p class="muted">Drag the photo to move it. Zoom in to fit your face. The photo always fills the whole circle.</p><div class="cropw"><canvas id="crop-c" width="240" height="240" aria-label="Photo preview"></canvas></div><div class="field"><label for="crop-z">Zoom</label><input id="crop-z" type="range" min="' + crop.zmin + '" max="3" step="0.01" value="' + crop.z + '"></div><button class="btn" data-act="cropsave" type="button">Use this photo</button>';
    if (s.type === "gnew" || s.type === "ginfo") return chatSheet(s);
    if (s.type === "cprof") {
      var cp = chatPerson(s.id) || chat.res.filter(function (x) { return x.id === s.id; })[0];
      if (!cp) return '<div class="sh"><h3>Profile</h3>' + closeBtn() + '</div><p class="hint">Not found.</p>';
      return '<div class="sh"><h3>Profile</h3>' + closeBtn() + '</div><div class="pfv">' + (cp.av ? '<img class="pfbig" alt="Profile picture" src="' + esc(avUrl(cp)) + '">' : '<div class="pfbig ph">' + esc((cp.name || "?").charAt(0).toUpperCase()) + '</div>') +
        '<b>' + esc(cp.name) + (cp.role === "admin" ? ' <span class="adm">ADMIN</span>' : "") + '</b><small>@' + esc(cp.username) + ' · ' + chatStatus(cp.id) + '</small></div>';
    }
    if (s.type === "pic") return '<div class="sh"><h3>Picture</h3>' + closeBtn() + '</div><img class="cmbig" alt="Picture" src="' + esc(s.src) + '">';
    if (s.type === "unfriend") return '<div class="sh"><h3>Unfriend?</h3>' + closeBtn() + '</div><p class="muted">You will not be able to message each other until one of you sends a new request.</p><div class="chips"><button class="btn danger auto" data-act="cunfriendgo" data-id="' + s.id + '">Unfriend</button><button class="btn ghost auto" data-act="close">Cancel</button></div>';
    if (s.type === "logout") return '<div class="sh"><h3>Log out?</h3>' + closeBtn() + '</div><p class="muted">You will need your username and password to get back in.</p><div class="chips"><button class="btn auto" data-act="logout">Log out</button><button class="btn ghost auto" data-act="close">Stay</button></div>';
    if (s.type === "activity") {
      return '<div class="sh"><h3>@' + esc(s.username) + '</h3>' + closeBtn() + '</div><p class="muted">Short labels only. Amounts, titles, journal and lists stay private.</p>' +
        (s.items ? (s.items.length ? '<ul class="rows">' + s.items.map(function (i) { return '<li class="rq"><div class="rq-t"><b>' + esc(i.label) + '</b><span class="muted">' + ago(i.at) + '</span></div></li>'; }).join("") + '</ul>' : '<p class="hint">Nothing yet.</p>') : '<p class="hint">Loading…</p>');
    }
    if (s.type === "resetpw") return '<div class="sh"><h3>Reset password</h3>' + closeBtn() + '</div><p class="muted">Set a new password for <b>@' + esc(s.username) + '</b>. They will be signed out on every device.</p><form id="rpwf" class="form" autocomplete="off"><div class="field"><label for="rp-new">New password</label><input id="rp-new" type="text" autocomplete="off" required minlength="8" maxlength="128"><p class="hint">At least 8 characters. Tell the user privately.</p></div><button class="btn" type="submit">Reset password</button></form>';
    if (s.type === "delreq") {
      var dp = data.savings.filter(function (x) { return x.id === s.id; })[0];
      if (!dp) return '<div class="sh"><h3>Request deletion</h3>' + closeBtn() + '</div><p class="hint">That transaction no longer exists.</p>';
      return '<div class="sh"><h3>Request deletion</h3>' + closeBtn() + '</div><div><div class="krow"><span>Type</span><b>' + TYPE_LABEL[dp.type] + '</b></div><div class="krow"><span>Amount</span><b class="num">' + money(num(dp)) + '</b></div><div class="krow"><span>Date</span><b>' + shortDate(dp.date) + '</b></div></div>' +
        '<p class="muted">An admin has to approve this before it is removed. Until then it stays in your savings.</p><form id="delreqf" class="form"><div class="field"><label for="dr-reason">Why do you want to delete it?</label><textarea id="dr-reason" maxlength="200" rows="3" placeholder="e.g. I typed the wrong amount"></textarea></div><button class="btn" type="submit">Send request to admin</button></form>';
    }
    if (s.type === "tx") {
      var tr = s.t === "transfer", cats = s.t === "deposit" ? DEP_CATS : s.t === "withdraw" ? WD_CATS : null;
      var avail = s.t === "withdraw" || (tr && s.dir === "to_wallet") ? "Available in savings: " + money(savingsBal()) : tr ? "Income wallet: " + money(Math.max(0, walletBal())) : "";
      return '<div class="sh"><h3>Add Transaction</h3>' + closeBtn() + '</div><form id="txf" class="form" autocomplete="off">' +
        '<div class="seg dep">' + [["deposit", "Deposit"], ["withdraw", "Withdraw"], ["transfer", "Transfer"]].map(function (t) { return '<button type="button" data-act="txt" data-v="' + t[0] + '" class="' + (s.t === t[0] ? "on" : "") + '">' + t[1] + '</button>'; }).join("") + '</div>' +
        (tr ? '<div class="field"><span class="lab">Direction</span><div class="seg"><button type="button" data-act="txd" data-v="to_wallet" class="' + (s.dir === "to_wallet" ? "on" : "") + '">Savings → Income wallet</button><button type="button" data-act="txd" data-v="to_savings" class="' + (s.dir === "to_savings" ? "on" : "") + '">Income wallet → Savings</button></div></div>' : "") +
        '<div class="field"><label for="tx-amount">Amount</label><div class="money-in"><span>₱</span><input id="tx-amount" type="number" inputmode="decimal" min="1" step="any" required placeholder="0.00" value="' + esc(s.amount || "") + '"></div>' + (avail ? '<p class="hint">' + avail + '</p>' : "") + '</div>' +
        (cats ? '<div class="field"><label for="tx-cat">Category</label><select id="tx-cat">' + cats.map(function (c) { return '<option' + (s.cat === c ? " selected" : "") + '>' + c + '</option>'; }).join("") + '<option value="__custom">✎ Type my own…</option></select><input id="tx-custom" type="text" maxlength="30" placeholder="Type your own, e.g. Tuition fee, Laptop" hidden style="margin-top:8px"></div>' : "") +
        '<div class="field"><label for="tx-date">Date</label><input id="tx-date" type="date" required value="' + esc(s.date) + '"></div>' +
        '<div class="field"><label for="tx-note">Notes (optional)</label><input id="tx-note" type="text" maxlength="80" placeholder="e.g. allowance, part-time" value="' + esc(s.note || "") + '"></div>' +
        '<button class="btn" id="tx-save" type="submit">Save</button></form>';
    }
    if (s.type === "noteview") {
      var nv = data.notes.filter(function (x) { return x.id === s.id; })[0];
      if (!nv) return '<div class="sh"><h3>Note</h3>' + closeBtn() + '</div><p class="hint">This note is no longer here.</p>';
      var its = nv.items || [], dn = its.filter(function (i) { return i.d; }).length, dinf = dueInfo(nv);
      return '<div class="sh"><h3>' + KIND_LABEL[nv.kind] + '</h3>' + closeBtn() + '</div><article class="nview"><h4>' + esc(nv.title) + '</h4><div class="chips"><span class="subj"><i style="background:' + colorOf(nv.subject) + '"></i>' + esc(nv.subject) + '</span>' +
        (nv.dueDate ? '<span class="badge ' + (dinf.cls || "sch") + '">' + esc(dinf.t) + '</span>' : "") + (nv.done ? '<span class="badge ok">Done</span>' : "") + '</div>' +
        (nv.body ? '<p class="nbody">' + esc(nv.body) + '</p>' : "") +
        (its.length ? '<div class="pct nprog"><div class="bar"><i style="width:' + Math.round(dn / its.length * 100) + '%"></i></div><b>' + dn + '/' + its.length + '</b></div><ul class="nvl">' + its.map(function (it, i) {
          return '<li class="nvi' + (it.d ? " isdone" : "") + '"><button class="ck" role="checkbox" aria-checked="' + (it.d ? "true" : "false") + '" aria-label="' + esc(it.t) + '" data-act="nitem" data-id="' + esc(nv.id) + '" data-i="' + i + '">' + ic("check") + '</button><span>' + esc(it.t) + '</span></li>';
        }).join("") + '</ul>' : "") +
        (!nv.body && !its.length ? '<p class="hint">Nothing written yet. Tap Edit to add notes or a checklist.</p>' : "") + '</article>' +
        '<button class="btn" type="button" data-act="noteedit" data-id="' + esc(nv.id) + '">' + ic("pen") + 'Edit</button>' +
        '<button class="btn ghost" type="button" data-act="tg" data-k="note" data-id="' + esc(nv.id) + '">' + (nv.done ? "Mark as not done" : "Mark as done") + '</button>';
    }
    if (s.type === "note") {
      var n = s.id ? data.notes.filter(function (x) { return x.id === s.id; })[0] : null, e = n || { title: "", subject: "", kind: "assignment", dueDate: "", dueTime: "", body: "", items: [] };
      return '<div class="sh"><h3>' + (n ? "Edit note" : "Add Note / Assignment") + '</h3>' + closeBtn() + '</div><form id="notef" class="form" autocomplete="off">' +
        '<div class="field"><label for="n-title">Title</label><input id="n-title" type="text" maxlength="80" required placeholder="e.g. IT101 - Report" value="' + esc(e.title) + '"></div>' +
        '<div class="field"><label for="n-subject">Subject</label><input id="n-subject" list="subjlist" type="text" maxlength="30" placeholder="e.g. IT" value="' + esc(e.subject === "General" ? "" : e.subject) + '"><datalist id="subjlist">' + subjectList().map(function (x) { return '<option value="' + esc(x) + '">'; }).join("") + '</datalist></div>' +
        '<div class="field"><span class="lab">Type</span><div class="chips" id="n-kinds">' + Object.keys(KIND_LABEL).map(function (k) { return '<button type="button" class="chip' + (e.kind === k ? " on" : "") + '" data-act="nk" data-v="' + k + '">' + KIND_LABEL[k] + '</button>'; }).join("") + '</div><input type="hidden" id="n-kind" value="' + e.kind + '"></div>' +
        '<div class="two"><div class="field"><label for="n-date">Due date</label><input id="n-date" type="date" value="' + esc(e.dueDate) + '"></div><div class="field"><label for="n-time">Time (optional)</label><input id="n-time" type="time" value="' + esc(e.dueTime) + '"></div></div>' +
        '<div class="field"><label for="n-body">Notes (optional)</label><textarea id="n-body" maxlength="2000" style="min-height:110px" placeholder="e.g. Chapter 1-3, send via email">' + esc(e.body) + '</textarea></div>' +
        '<div class="field"><span class="lab">Checklist</span><div id="n-items" class="nitems">' + (e.items || []).map(function (it) { return nitemRow(it.t, it.d); }).join("") + '</div><button type="button" class="btn ghost" data-act="nitemadd">' + ic("plus") + 'Add checklist item</button></div>' +
        '<button class="btn" type="submit">Save</button>' + (n ? '<button type="button" class="btn ghost" data-act="noteviewback" data-id="' + esc(n.id) + '">Cancel</button><button type="button" class="btn danger" data-act="del" data-c="notes" data-id="' + esc(n.id) + '">Delete</button>' : "") + '</form>';
    }
    if (s.type === "task") {
      var tk = s.id ? data.tasks.filter(function (x) { return x.id === s.id; })[0] : null, te = tk || { title: "", date: s.date || todayStr(), time: "", tag: "Personal" };
      return '<div class="sh"><h3>' + (tk ? "Edit task" : "Add Task / Event") + '</h3>' + closeBtn() + '</div><form id="taskf" class="form" autocomplete="off">' +
        '<div class="field"><label for="t-title">Title</label><input id="t-title" type="text" maxlength="80" required placeholder="e.g. Study Math (Quiz)" value="' + esc(te.title) + '"></div>' +
        '<div class="two"><div class="field"><label for="t-date">Date</label><input id="t-date" type="date" required value="' + esc(te.date) + '"></div><div class="field"><label for="t-time">Time (optional)</label><input id="t-time" type="time" value="' + esc(te.time) + '"></div></div>' +
        '<div class="field"><span class="lab">Tag</span><div class="chips" id="t-tags">' + TAGS.map(function (k) { return '<button type="button" class="chip' + (te.tag === k ? " on" : "") + '" data-act="tg2" data-v="' + k + '">' + k + '</button>'; }).join("") + '</div><input type="hidden" id="t-tag" value="' + esc(te.tag) + '"></div>' +
        '<button class="btn" type="submit">Save</button>' + (tk ? '<button type="button" class="btn danger" data-act="del" data-c="tasks" data-id="' + esc(tk.id) + '">Delete</button>' : "") + '</form>';
    }
    if (s.type === "jedit") {
      var je = data.journal.filter(function (x) { return x.id === s.id; })[0];
      if (!je) return '<div class="sh"><h3>Journal entry</h3>' + closeBtn() + '</div><p class="hint">That entry no longer exists.</p>';
      var jm = MOODS[je.mood - 1] || MOODS[2];
      if (s.mode !== "edit") {
        return '<div class="sh"><h3>Journal</h3>' + closeBtn() + '</div>' +
          '<article class="book"><div class="bk-head"><span class="bk-mood" title="' + jm[1] + '">' + jm[0] + '</span><div><small>' + esc(longDate(je.date)) + '</small><h4>' + esc(je.title || "Untitled entry") + '</h4></div></div>' +
          '<div class="bk-pages" id="bk" tabindex="0" aria-label="Journal entry, swipe sideways to turn pages"><div class="bk-text">' + esc(je.body) + '</div></div>' +
          '<div class="bk-nav"><button type="button" class="chip" data-act="jpg" data-v="first" id="bk-first" aria-label="Back to first page">⏮ First</button><button type="button" class="chip" data-act="jpg" data-v="-1" id="bk-prev" aria-label="Previous page">‹</button><span id="bk-count" class="bk-count">Page 1 of 1</span><button type="button" class="chip" data-act="jpg" data-v="1" id="bk-next" aria-label="Next page">›</button></div></article>' +
          '<button type="button" class="btn" data-act="jeditmode">' + ic("pen") + 'Edit entry</button>';
      }
      return '<div class="sh"><h3>Edit entry</h3>' + closeBtn() + '</div><form id="jef" class="form" autocomplete="off">' +
        '<div class="field"><span class="lab">Mood</span>' + moodPick(s.mood || je.mood, "jemood") + '</div>' +
        '<div class="two"><div class="field"><label for="je-date">Date</label><input id="je-date" type="date" required value="' + esc(je.date) + '"></div><div class="field"><label for="je-title">Title</label><input id="je-title" type="text" maxlength="80" value="' + esc(je.title) + '"></div></div>' +
        '<div class="field"><label for="je-body">Entry</label><textarea id="je-body" class="paper" spellcheck="true" maxlength="4000" required style="min-height:220px">' + esc(je.body) + '</textarea></div>' +
        '<button class="btn" type="submit">Save changes</button><button type="button" class="btn ghost" data-act="jreadmode">Cancel</button><button type="button" class="btn danger" data-act="del" data-c="journal" data-id="' + esc(je.id) + '">Delete entry</button></form>';
    }
    if (s.type === "list") {
      var li = s.id ? data.lists.filter(function (x) { return x.id === s.id; })[0] : null, le = li || { title: "", color: "blue", icon: "list" };
      return '<div class="sh"><h3>' + (li ? "Edit list" : "New list") + '</h3>' + closeBtn() + '</div><form id="listf" class="form" autocomplete="off">' +
        '<div class="field"><label for="l-title">Name</label><input id="l-title" type="text" maxlength="40" required placeholder="e.g. Grocery" value="' + esc(le.title) + '"></div>' +
        '<div class="field"><span class="lab">Color</span><div class="swatches" id="l-colors">' + LIST_COLORS.map(function (c) { return '<button type="button" class="swatch' + (le.color === c ? " on" : "") + '" style="background:' + LSWATCH[c] + '" data-act="lcolor" data-v="' + c + '" aria-label="' + c + '"></button>'; }).join("") + '</div><input type="hidden" id="l-color" value="' + le.color + '"></div>' +
        '<div class="field"><span class="lab">Icon</span><div class="icopick" id="l-icons">' + LIST_ICONS.map(function (c) { return '<button type="button" class="' + (le.icon === c ? "on" : "") + '" data-act="licon" data-v="' + c + '" aria-label="' + c + '">' + ic(c) + '</button>'; }).join("") + '</div><input type="hidden" id="l-icon" value="' + le.icon + '"></div>' +
        '<button class="btn" type="submit">Save</button>' + (li ? '<button type="button" class="btn danger" data-act="del" data-c="lists" data-id="' + esc(li.id) + '">Delete list</button>' : "") + '</form>';
    }
    return "";
  }
  function renderSheet() {
    var b = $("sheet");
    if (!sheetState) { b.hidden = true; b.innerHTML = ""; document.body.classList.remove("lock"); return; }
    b.hidden = false; b.innerHTML = '<div class="sheet" role="dialog" aria-modal="true">' + sheetBody() + '</div>';
    document.body.classList.add("lock");
    initBook();
  }
  /* journal "book": text flows into sideways pages; swipe or use the buttons */
  function initBook() {
    var bk = $("bk"); if (!bk) return;
    var cnt = $("bk-count"), t = null;
    function pages() { return Math.max(1, Math.round(bk.scrollWidth / bk.clientWidth)); }
    function cur() { return Math.min(pages(), Math.round(bk.scrollLeft / bk.clientWidth) + 1); }
    function ui2() {
      var n = pages(), c = cur();
      cnt.textContent = "Page " + c + " of " + n;
      $("bk-prev").disabled = c <= 1; $("bk-first").disabled = c <= 1; $("bk-next").disabled = c >= n;
      var nav = bk.parentNode.querySelector(".bk-nav"); if (nav) nav.classList.toggle("single", n === 1);
    }
    bk._go = function (i) { i = Math.max(0, Math.min(pages() - 1, i)); bk.scrollTo({ left: i * bk.clientWidth, behavior: "smooth" }); };
    bk.addEventListener("scroll", function () {
      ui2(); clearTimeout(t);
      t = setTimeout(function () { var w = bk.clientWidth, i = Math.round(bk.scrollLeft / w); if (Math.abs(bk.scrollLeft - i * w) > 1) bk.scrollTo({ left: i * w, behavior: "smooth" }); }, 90);
    }, { passive: true });
    bk.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") { e.preventDefault(); bk._go(cur()); } else if (e.key === "ArrowLeft") { e.preventDefault(); bk._go(cur() - 2); } });
    ui2();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ui2);
    setTimeout(ui2, 120);
  }
  function openSheet(s) { sheetState = s; renderSheet(); }
  function closeSheet() { sheetState = null; renderSheet(); }
  function txKeep() {
    if (!sheetState || sheetState.type !== "tx") return;
    var g = function (id) { return $(id) ? $(id).value : ""; };
    sheetState.amount = g("tx-amount"); sheetState.date = g("tx-date") || sheetState.date; sheetState.note = g("tx-note"); if ($("tx-cat")) sheetState.cat = g("tx-cat");
  }

  /* ---------- render ---------- */
  /* ================= update 14: schedule, study timer, grades, budgets, reminders, backup, install ================= */
  var WK = [1, 2, 3, 4, 5, 6, 0];
  var xd = { classes: [], grades: [], budgets: [], study: [] };
  var foc = { mode: "focus", dur: 25, left: 25 * 60000, running: false, endAt: 0, label: "", brk: 5 };
  var fmtMin = function (m) { m = Math.round(m || 0); return m >= 60 ? Math.floor(m / 60) + "h" + (m % 60 ? " " + (m % 60) + "m" : "") : m + "m"; };
  var hhmm = function (d) { return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
  function studyOn(date) { return xd.study.filter(function (s) { return s.date === date; }).reduce(function (a, s) { return a + s.minutes; }, 0); }
  function studyWeek() { var n = 0; for (var i = 0; i < 7; i++) n += studyOn(addDays(todayStr(), -i)); return n; }
  function nextClass() {
    var d = new Date(), now = hhmm(d), best = null;
    for (var k = 0; k < 7; k++) {
      var dow = (d.getDay() + k) % 7;
      var list = xd.classes.filter(function (c) { return c.day === dow; }).sort(function (a, b) { return a.start < b.start ? -1 : 1; });
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (k === 0 && c.end <= now) continue;
        return { c: c, k: k, now: k === 0 && c.start <= now };
      }
    }
    return best;
  }
  function classWhen(nc) {
    var c = nc.c, t = fmtTime(c.start) + "–" + fmtTime(c.end) + (c.room ? " · " + c.room : "");
    return nc.k === 0 ? (nc.now ? "Now · " : "Today · ") + t : (nc.k === 1 ? "Tomorrow · " : DAYS[c.day] + " · ") + t;
  }
  function gwaOf(list) { var u = 0, w = 0; list.forEach(function (g) { u += g.units; w += g.units * g.grade; }); return u ? w / u : 0; }
  var gradeCls = function (g) { return g <= 1.75 ? "t-mint" : g <= 3 ? "t-yellow" : "t-pink"; };
  function budgetRows() {
    var sp = {};
    data.money.forEach(function (x) { if (x.kind === "expense" && inPeriod(x.date, "month")) sp[x.category] = (sp[x.category] || 0) + num(x); });
    return xd.budgets.map(function (b) { return { cat: b.category, limit: b.amount, spent: sp[b.category] || 0 }; });
  }
  function dueSoon() {
    var t = todayStr(), tm = addDays(t, 1), a = [];
    data.notes.forEach(function (x) {
      if (x.done || !x.dueDate || x.kind === "note") return;
      if (x.dueDate < t) a.push({ k: 0, t: x.title, s: "Overdue · " + shortDate(x.dueDate), c: "due", go: "notes" });
      else if (x.dueDate === t) a.push({ k: 1, t: x.title, s: "Due today" + (x.dueTime ? " · " + fmtTime(x.dueTime) : ""), c: "pend", go: "notes" });
      else if (x.dueDate === tm) a.push({ k: 2, t: x.title, s: "Due tomorrow", c: "", go: "notes" });
    });
    data.tasks.forEach(function (x) { if (!x.done && x.date === t) a.push({ k: 1, t: x.title, s: "Task today" + (x.time ? " · " + fmtTime(x.time) : ""), c: "pend", go: "tasks" }); });
    budgetRows().forEach(function (b) {
      var p = b.spent / b.limit;
      if (p >= 0.8) a.push({ k: p >= 1 ? 0 : 1, t: b.cat + " budget", s: p >= 1 ? "Over budget · " + fmt(b.spent) + " of " + fmt(b.limit) : Math.round(p * 100) + "% used this month", c: p >= 1 ? "due" : "pend", go: "spending" });
    });
    return a.sort(function (p, q) { return p.k - q.k; }).slice(0, 6);
  }
  function remindCard() {
    var r = dueSoon(); if (!r.length) return "";
    return '<section class="card rv col-span-2 lg:col-span-12 remc"><div class="ch"><h2>' + ic("clock") + 'Due soon</h2>' + (remindAvail() && !remindOn() ? '<a class="lnk" href="#profile">Turn on alerts</a>' : "") + '</div><ul class="rows">' +
      r.map(function (x) { return '<li class="remr" data-go="' + x.go + '" role="link" tabindex="0"><b class="min-w-0 truncate">' + esc(x.t) + '</b><em class="rbd ' + x.c + '">' + esc(x.s) + '</em></li>'; }).join("") + '</ul></section>';
  }
  function extraTiles() {
    var nc = nextClass(), tdm = studyOn(todayStr()), g = gwaOf(xd.grades);
    var tile = function (cls, go, lab, emo, big, sub) { return '<button class="card tap rv ' + cls + ' col-span-2 lg:col-span-4 text-left flex flex-col justify-between gap-3" data-go="' + go + '" style="min-height:150px"><div class="flex items-center justify-between"><span class="lab" style="margin:0">' + lab + '</span><span class="text-3xl">' + emo + '</span></div><div class="min-w-0"><b class="font-display text-xl leading-tight block truncate">' + big + '</b><small class="font-semibold opacity-80">' + sub + '</small></div></button>'; };
    return tile("t-blue", "schedule", nc && nc.now ? "Class now" : "Next class", "🎒", nc ? esc(nc.c.subject) : "Add your classes", nc ? esc(classWhen(nc)) : "Build your weekly schedule") +
      tile("t-mint", "study", "Focus today", "⏱️", tdm ? fmtMin(tdm) : "Start a timer", tdm ? "This week: " + fmtMin(studyWeek()) : "Pomodoro study timer") +
      tile("t-pink", "grades", "My GWA", "🎓", xd.grades.length ? g.toFixed(2) : "Add grades", xd.grades.length ? xd.grades.length + " subject" + (xd.grades.length === 1 ? "" : "s") + " · 1.00 is best" : "Track your grades");
  }

  /* --- schedule --- */
  function classRow(c) {
    return '<li><button class="cls" type="button" data-act="editclass" data-id="' + esc(c.id) + '" style="--cc:' + (LSWATCH[c.color] || LSWATCH.blue) + '"><span class="ct"><b>' + fmtTime(c.start) + '</b><small>' + fmtTime(c.end) + '</small></span><span class="cb"><b>' + esc(c.subject) + '</b><small>' + (c.room ? esc(c.room) : "No room set") + '</small></span>' + ic("pen") + '</button></li>';
  }
  function vSchedule() {
    var tdy = new Date().getDay(), sel = ui.sd == null ? tdy : ui.sd;
    var by = function (d) { return xd.classes.filter(function (c) { return c.day === d; }).sort(function (a, b) { return a.start < b.start ? -1 : 1; }); };
    var pills = '<div class="dpills rv">' + WK.map(function (d) { var n = by(d).length; return '<button type="button" data-act="sday" data-v="' + d + '" class="' + (sel === d ? "on" : "") + (d === tdy ? " tdy" : "") + '">' + DS[d] + (n ? '<i>' + n + '</i>' : "") + '</button>'; }).join("") + '</div>';
    var list = by(sel);
    var day = '<section class="card rv"><div class="ch"><h2>' + ic("calendar") + DAYS[sel] + (sel === tdy ? " · Today" : "") + '</h2><button class="sm go" data-act="newclass" data-day="' + sel + '">' + ic("plus") + 'Add class</button></div>' +
      (list.length ? '<ul class="clsl">' + list.map(classRow).join("") + '</ul>' : '<div class="empty"><span class="em">🎒</span><span>No classes on ' + DAYS[sel] + '. Enjoy the free time, or add one.</span></div>') + '</section>';
    var week = '<section class="card rv"><div class="ch"><h2>' + ic("list") + 'Whole week</h2></div><div class="wkg">' + WK.map(function (d) {
      var l = by(d); return '<div class="wkd' + (d === tdy ? " tdy" : "") + '"><b>' + DS[d] + '</b>' + (l.length ? l.map(function (c) { return '<button type="button" data-act="editclass" data-id="' + esc(c.id) + '" style="--cc:' + (LSWATCH[c.color] || LSWATCH.blue) + '"><span>' + fmtTime(c.start) + '</span>' + esc(c.subject) + '</button>'; }).join("") : '<small>—</small>') + '</div>'; }).join("") + '</div></section>';
    return pghead() + '<div class="grid gap-4 lg:grid-cols-12 items-start"><div class="flex flex-col gap-4 lg:col-span-7">' + pills + day + '</div><div class="flex flex-col gap-4 lg:col-span-5">' + week + '</div></div>';
  }

  /* --- study timer --- */
  var FC = 2 * Math.PI * 88;
  function fKey() { return "st_focus_" + (me ? me.id : 0); }
  function fSave() { try { localStorage.setItem(fKey(), JSON.stringify(foc)); } catch (e) {} }
  function fLoad() {
    try { var o = JSON.parse(localStorage.getItem(fKey()) || "null"); if (o && o.dur) foc = Object.assign({ mode: "focus", dur: 25, left: 25 * 60000, running: false, endAt: 0, label: "", brk: 5 }, o); } catch (e) {}
  }
  function fLeft() { return foc.running ? Math.max(0, foc.endAt - Date.now()) : foc.left; }
  function fText(ms) { var s = Math.ceil(ms / 1000); return pad(Math.floor(s / 60)) + ":" + pad(s % 60); }
  function fPaint() {
    var l = fLeft(), t = $("fc-time"); if (!t) return;
    t.textContent = fText(l);
    var r = $("fc-ring"); if (r) r.style.strokeDashoffset = String(FC * (1 - l / (foc.dur * 60000)));
  }
  function fStart() { if (foc.running) return; foc.endAt = Date.now() + foc.left; foc.running = true; fSave(); renderView(); }
  function fPause() { foc.left = fLeft(); foc.running = false; foc.endAt = 0; fSave(); document.title = "StudentTrack"; renderView(); }
  function fReset() { foc.running = false; foc.endAt = 0; foc.left = foc.dur * 60000; fSave(); document.title = "StudentTrack"; renderView(); }
  function fSetDur(m) { m = Math.max(1, Math.min(240, Math.round(m) || 25)); foc.mode = "focus"; foc.dur = m; foc.left = m * 60000; foc.running = false; foc.endAt = 0; fSave(); renderView(); }
  function fLogSession(min) {
    if (min < 1) return Promise.resolve();
    return api("POST", "/api/study", { minutes: Math.min(240, min), date: todayStr(), label: (foc.label || "").trim().slice(0, 40) }).then(load).catch(function (er) { toast(er.message || "Could not save the session."); });
  }
  function beep() {
    try {
      var A = window.AudioContext || window.webkitAudioContext, c = new A();
      [0, 0.28, 0.56].forEach(function (t, i) { var o = c.createOscillator(), g = c.createGain(); o.frequency.value = i === 2 ? 988 : 784; g.gain.value = 0.14; o.connect(g); g.connect(c.destination); o.start(c.currentTime + t); o.stop(c.currentTime + t + 0.2); });
    } catch (e) {}
  }
  function fDone() {
    foc.running = false; foc.endAt = 0; document.title = "StudentTrack"; beep();
    if (foc.mode === "focus") {
      var m = foc.dur; foc.mode = "break"; foc.dur = foc.brk; foc.left = foc.brk * 60000; fSave();
      notify("Focus session done 🎉", m + " minutes saved. Take a " + foc.brk + "-minute break.", "focus");
      fLogSession(m).then(function () { toast("Session saved: " + m + " min 🎉"); renderView(); });
    } else {
      foc.mode = "focus"; foc.dur = Math.max(1, +foc.focusDur || 25); foc.left = foc.dur * 60000; fSave();
      notify("Break is over", "Ready for another round?", "focus"); renderView();
    }
  }
  function fFinishEarly() {
    var el = foc.dur * 60000 - fLeft(), m = Math.floor(el / 60000);
    if (foc.mode !== "focus" || m < 1) { toast("Study at least 1 minute first."); return; }
    foc.running = false; foc.endAt = 0; foc.left = foc.dur * 60000; fSave(); document.title = "StudentTrack";
    fLogSession(m).then(function () { toast("Saved " + m + " min of study."); renderView(); });
  }
  setInterval(function () {
    if (!me || !foc.running) return;
    var l = fLeft(); fPaint();
    if (l > 0) document.title = fText(l) + " · StudentTrack"; else fDone();
  }, 500);
  function vStudy() {
    var tdm = studyOn(todayStr()), wk = studyWeek(), tot = xd.study.reduce(function (a, s) { return a + s.minutes; }, 0);
    var focus = foc.mode === "focus", l = fLeft();
    var subs = subjectList().slice(0, 6);
    var presets = [15, 25, 45, 60].map(function (m) { return '<button type="button" class="chip' + (focus && foc.dur === m ? " on" : "") + '" data-act="fdur" data-v="' + m + '">' + m + ' min</button>'; }).join("");
    var timer = '<section class="card rv fcw ' + (focus ? "" : "brk") + '"><div class="fmode">' + (focus ? "Focus time" : "Break time") + '</div>' +
      '<div class="fring"><svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="88" class="fbg"/><circle id="fc-ring" cx="100" cy="100" r="88" class="fgo" style="stroke-dasharray:' + FC + ';stroke-dashoffset:' + (FC * (1 - l / (foc.dur * 60000))) + '"/></svg><b id="fc-time" class="num">' + fText(l) + '</b></div>' +
      '<div class="fbt">' + (foc.running ? '<button class="btn" data-act="fpause" type="button">Pause</button>' : '<button class="btn" data-act="fstart" type="button">' + (foc.left < foc.dur * 60000 ? "Resume" : "Start") + '</button>') +
      '<button class="btn ghost" data-act="freset" type="button">Reset</button>' + (focus ? '<button class="btn ghost" data-act="ffinish" type="button">Finish &amp; save</button>' : '<button class="btn ghost" data-act="fskip" type="button">Skip break</button>') + '</div>' +
      (focus ? '<div class="field" style="margin-top:14px"><span class="lab">Length</span><div class="chips">' + presets + '</div><div class="two" style="margin-top:8px"><input id="fc-custom" type="number" min="1" max="240" inputmode="numeric" placeholder="Custom minutes"><button class="btn ghost" type="button" data-act="fcustom">Set</button></div></div>' +
        '<div class="field"><label for="fc-label">What are you studying? (optional)</label><input id="fc-label" list="fc-subj" type="text" maxlength="40" placeholder="e.g. Math" value="' + esc(foc.label) + '"><datalist id="fc-subj">' + subs.map(function (s) { return '<option value="' + esc(s) + '">'; }).join("") + '</datalist></div>' : '<p class="hint">Stand up, stretch, drink water. Your next focus round starts after this.</p>') +
      '<p class="hint">Keep this page or the app open while the timer runs. Finished sessions are saved and count toward your streak.</p></section>';
    var days = []; for (var i = 6; i >= 0; i--) days.push(addDays(todayStr(), -i));
    var vals = days.map(studyOn), mx = Math.max.apply(null, vals.concat([1]));
    var chart = '<section class="card rv"><div class="ch"><h2>' + ic("chart") + 'Study this week</h2></div><div class="bars" role="img" aria-label="Minutes studied in the last 7 days">' + days.map(function (d, i) { return '<div class="' + (d === todayStr() ? "today" : "") + '"><em class="num">' + (vals[i] ? vals[i] : "") + '</em><i style="height:' + Math.max(3, Math.round(vals[i] / mx * 80)) + '%"></i><span>' + DS[P(d).getDay()] + '</span></div>'; }).join("") + '</div></section>';
    var stats = '<div class="grid grid-cols-2 gap-3">' + statTile("mint", "clock", "Today", '<b class="num">' + fmtMin(tdm) + '</b>', "", "") + statTile("blue", "calendar", "Last 7 days", '<b class="num">' + fmtMin(wk) + '</b>', "", "") + statTile("yellow", "flame", "Streak", cn(streak(), streak() === 1 ? " day" : " days"), "", "") + statTile("purple", "cap", "All time", '<b class="num">' + fmtMin(tot) + '</b>', "", "") + '</div>';
    var recent = xd.study.slice(0, 8);
    var rows = '<section class="card rv"><div class="ch"><h2>' + ic("list") + 'Recent sessions</h2></div>' + (recent.length ? '<ul class="rows">' + recent.map(function (s) {
      return '<li><div class="min-w-0" style="flex:1"><b class="block truncate">' + esc(s.label || "Study session") + '</b><small class="muted">' + dayLabel(s.date) + '</small></div><b class="num">' + s.minutes + ' min</b><button class="ib" data-act="del" data-c="study" data-id="' + esc(s.id) + '" aria-label="Delete session">' + ic("trash") + '</button></li>'; }).join("") + '</ul>' : '<div class="empty"><span class="em">⏱️</span><span>No sessions yet. Start your first one!</span></div>') + '</section>';
    return pghead() + '<div class="grid gap-4 lg:grid-cols-12 items-start"><div class="flex flex-col gap-4 lg:col-span-5">' + timer + '</div><div class="flex flex-col gap-4 lg:col-span-7">' + stats + chart + rows + '</div></div>';
  }

  /* --- grades --- */
  function vGrades() {
    var all = xd.grades, g = gwaOf(all), units = all.reduce(function (a, x) { return a + x.units; }, 0);
    var terms = []; all.forEach(function (x) { var t = x.term || "No term"; if (terms.indexOf(t) < 0) terms.push(t); });
    var head = '<section class="card rv t-pink gwa"><span class="lab">General weighted average</span><b class="num">' + (all.length ? g.toFixed(2) : "—") + '</b><small>' + (all.length ? units + " units · " + all.length + " subject" + (all.length === 1 ? "" : "s") : "Add your subjects to see your GWA") + '</small></section>';
    var body = terms.map(function (t) {
      var l = all.filter(function (x) { return (x.term || "No term") === t; });
      return '<section class="card rv"><div class="ch"><h2>' + ic("cap") + esc(t) + '</h2><b class="num">GWA ' + gwaOf(l).toFixed(2) + '</b></div><ul class="rows">' + l.map(function (x) {
        return '<li><button type="button" class="glr" data-act="editgrade" data-id="' + esc(x.id) + '"><span class="min-w-0"><b class="block truncate">' + esc(x.subject) + '</b><small class="muted">' + x.units + (x.units === 1 ? " unit" : " units") + '</small></span><em class="gb ' + gradeCls(x.grade) + '">' + x.grade.toFixed(2) + '</em></button></li>'; }).join("") + '</ul></section>';
    }).join("");
    var empty = all.length ? "" : '<section class="card rv"><div class="empty"><span class="em">🎓</span><span>No grades yet. Add a subject with its units and grade.</span></div></section>';
    return pghead() + '<div class="grid gap-4 lg:grid-cols-12 items-start"><div class="flex flex-col gap-4 lg:col-span-5">' + head + '<button class="btn" data-act="newgrade" type="button">' + ic("plus") + ' Add subject grade</button><p class="hint">Philippine scale: 1.00 is the highest and 3.00 is the usual passing line. GWA is weighted by units. Check your school’s rules for exact cutoffs.</p></div><div class="flex flex-col gap-4 lg:col-span-7">' + body + empty + '</div></div>';
  }

  /* --- budgets (shown on Spending) --- */
  function budgetCard() {
    var rows = budgetRows();
    return '<section class="card rv"><div class="ch"><h2>' + ic("wallet") + 'Monthly budgets</h2><button class="sm go" data-act="newbudget">' + ic("plus") + 'Set</button></div>' + (rows.length ? '<ul class="bud">' + rows.map(function (b) {
      var p = b.limit ? b.spent / b.limit : 0, st = p >= 1 ? "over" : p >= 0.8 ? "warn" : "";
      return '<li><button type="button" class="budr ' + st + '" data-act="editbudget" data-cat="' + esc(b.cat) + '"><div class="flex justify-between gap-2"><b>' + esc(b.cat) + '</b><span class="num">' + money(b.spent) + ' / ' + money(b.limit) + '</span></div><div class="bar"><i style="width:' + Math.min(100, Math.round(p * 100)) + '%;animation:none"></i></div><small>' + (p >= 1 ? "Over by " + money(b.spent - b.limit) : money(b.limit - b.spent) + " left · " + Math.round(p * 100) + "% used") + '</small></button></li>'; }).join("") + '</ul>' : '<div class="empty"><span class="em">🎯</span><span>Set a limit for a category, like Food, and get a warning before you overspend.</span></div>') + '</section>';
  }
  function budgetCheck(cat) {
    var b = budgetRows().filter(function (x) { return x.cat === cat; })[0]; if (!b) return "";
    var p = b.spent / b.limit;
    return p >= 1 ? " · ⚠️ Over your " + cat + " budget!" : p >= 0.8 ? " · Heads up: " + Math.round(p * 100) + "% of your " + cat + " budget used" : "";
  }

  /* --- reminders (local notifications) + install + backup --- */
  function remindAvail() { return typeof Notification !== "undefined"; }
  function remindOn() { try { return remindAvail() && Notification.permission === "granted" && localStorage.getItem("st_remind_" + (me ? me.id : 0)) === "1"; } catch (e) { return false; } }
  function notify(title, body, tag) {
    if (!remindOn()) return;
    var o = { body: body, icon: "icon-192.png", badge: "icon-192.png", tag: tag || "st" };
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) navigator.serviceWorker.getRegistration().then(function (r) { if (r && r.showNotification) r.showNotification(title, o); else new Notification(title, o); }).catch(function () { try { new Notification(title, o); } catch (e) {} });
      else new Notification(title, o);
    } catch (e) {}
  }
  function seenGet() { try { return JSON.parse(localStorage.getItem("st_seen") || "{}"); } catch (e) { return {}; } }
  function remindCheck() {
    if (!me || me.role !== "user" || !loaded || !remindOn()) return;
    var seen = seenGet(), t = todayStr(), tm = addDays(t, 1), now = new Date(), nm = now.getHours() * 60 + now.getMinutes(), dirty = false;
    var once = function (k) { if (seen[k]) return false; seen[k] = t; dirty = true; return true; };
    var mins = function (s) { var p = s.split(":"); return +p[0] * 60 + +p[1]; };
    data.tasks.forEach(function (x) { if (!x.done && x.date === t && x.time) { var d = mins(x.time) - nm; if (d >= 0 && d <= 15 && once("t" + x.id + t)) notify("Task in " + (d || "a few") + " min", x.title, "t" + x.id); } });
    xd.classes.forEach(function (c) { if (c.day === now.getDay()) { var d = mins(c.start) - nm; if (d >= 0 && d <= 10 && once("c" + c.id + t)) notify("Class in " + (d || "a few") + " min", c.subject + (c.room ? " · " + c.room : ""), "c" + c.id); } });
    if (now.getHours() >= 7) data.notes.forEach(function (x) {
      if (x.done || !x.dueDate || x.kind === "note") return;
      if (x.dueDate === t && once("n" + x.id + t)) notify("Due today", x.title, "n" + x.id);
      else if (x.dueDate === tm && once("n" + x.id + t)) notify("Due tomorrow", x.title, "n" + x.id);
      else if (x.dueDate < t && once("n" + x.id + t)) notify("Overdue", x.title, "n" + x.id);
    });
    if (dirty) { Object.keys(seen).forEach(function (k) { if (seen[k] < addDays(t, -2)) delete seen[k]; }); try { localStorage.setItem("st_seen", JSON.stringify(seen)); } catch (e) {} }
  }
  setInterval(remindCheck, 60000);
  var installEv = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); installEv = e; if (route === "profile" || route === "more") renderView(); });
  window.addEventListener("appinstalled", function () { installEv = null; toast("StudentTrack was installed."); if (route === "profile") renderView(); });
  var isStandalone = function () { return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true; };
  var isIOS = function () { return /iphone|ipad|ipod/i.test(navigator.userAgent); };
  function appCard() {
    var inst = isStandalone() ? '<p class="muted" style="margin:0 0 10px">✅ You are using the installed app.</p>' : installEv ? '<button class="btn" data-act="pwainstall" type="button">' + ic("plus") + ' Install StudentTrack</button>' :
      '<p class="muted" style="margin:0 0 10px">' + (isIOS() ? "On iPhone: tap the Share button, then “Add to Home Screen”." : "In Chrome, open the ⋮ menu and choose “Install app” or “Add to Home screen”.") + '</p>';
    var rem = !remindAvail() ? '<p class="hint">This browser does not support alerts.</p>' : Notification.permission === "denied" ? '<p class="hint">Alerts are blocked. Allow notifications for this site in your browser settings, then come back.</p>' :
      '<div class="chips" style="margin-top:10px"><button class="chip' + (remindOn() ? " on" : "") + '" data-act="remindtog" type="button">' + ic("clock") + (remindOn() ? " Alerts are on" : " Turn on alerts") + '</button>' + (remindOn() ? '<button class="chip" data-act="remindtest" type="button">Send a test</button>' : "") + '</div>' +
      '<p class="hint">You get an alert before tasks and classes, and for due, overdue and tomorrow’s assignments. Alerts work while the app is open or recently used. Free hosting cannot send alerts to a closed phone.</p>';
    return '<section class="card rv"><div class="ch"><h2>' + ic("spark") + 'App &amp; alerts</h2></div>' + inst + rem + '</section>';
  }
  function backupCard() {
    return '<section class="card rv"><div class="ch"><h2>' + ic("history") + 'Backup</h2></div><p class="muted" style="margin:0 0 12px">Download a copy of your data: savings, spending, notes, tasks, journal, lists, classes, grades and study sessions.</p><div class="chips"><button class="chip" data-act="exportjson" type="button">Download backup (.json)</button><button class="chip" data-act="exportcsv" type="button">Transactions (.csv)</button></div></section>';
  }
  function download(name, text, type) {
    var u = URL.createObjectURL(new Blob([text], { type: type })), a = document.createElement("a");
    a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 2000);
  }
  function exportJson() {
    var st = Object.assign({}, settings); delete st.avatar;
    download("studenttrack-backup-" + todayStr() + ".json", JSON.stringify({ app: "StudentTrack", exportedAt: new Date().toISOString(), user: me.username, settings: st, data: data, schoolTools: xd }, null, 1), "application/json");
    toast("Backup downloaded.");
  }
  function exportCsv() {
    var q = function (v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; }, rows = [["source", "type", "date", "category", "amount", "note"]];
    data.savings.forEach(function (x) { rows.push(["savings", x.type, x.date, x.category, x.amount, x.note]); });
    data.money.forEach(function (x) { rows.push(["spending", x.kind, x.date, x.category, x.amount, x.note]); });
    rows.sort(function (a, b) { return a[0] === "source" ? -1 : b[0] === "source" ? 1 : a[2] < b[2] ? 1 : -1; });
    download("studenttrack-transactions-" + todayStr() + ".csv", "﻿" + rows.map(function (r) { return r.map(q).join(","); }).join("\r\n"), "text/csv");
    toast("CSV downloaded.");
  }
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }

  /* --- hover tooltips (mouse only) --- */
  (function () {
    var tip = null, cur = null;
    function mk() { if (!tip) { tip = document.createElement("div"); tip.className = "tip"; tip.setAttribute("role", "tooltip"); document.body.appendChild(tip); } return tip; }
    function hide() { if (tip) tip.classList.remove("on"); cur = null; }
    function show(el) {
      if (el.hasAttribute("title")) { el.dataset.tip = el.dataset.tip || el.getAttribute("title"); el.removeAttribute("title"); }
      var txt = el.dataset.tip;
      if (!txt) { var al = el.getAttribute("aria-label"); if (!al || (el.textContent || "").trim().replace(/\s+/g, "") !== "") return false; txt = al; }
      var t = mk(); t.textContent = txt; t.style.left = "0px"; t.style.top = "0px";
      var r = el.getBoundingClientRect(), w = t.offsetWidth, h = t.offsetHeight;
      var x = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2)), y = r.top - h - 8; if (y < 8) y = r.bottom + 8;
      t.style.left = x + "px"; t.style.top = y + "px"; t.classList.add("on"); cur = el; return true;
    }
    document.addEventListener("mouseover", function (e) {
      if (!window.matchMedia("(hover:hover)").matches) return;
      var el = e.target.closest && e.target.closest("[data-tip],[title],button[aria-label],a[aria-label]");
      if (!el) { if (cur) hide(); return; }
      if (el === cur) return; hide(); show(el);
    });
    document.addEventListener("mouseout", function (e) { if (cur && (!e.relatedTarget || !cur.contains(e.relatedTarget))) hide(); });
    document.addEventListener("focusin", function (e) { if (e.target.matches && e.target.matches(":focus-visible") && e.target.closest) { var el = e.target.closest("[data-tip],button[aria-label],a[aria-label]"); if (el) show(el); } });
    document.addEventListener("focusout", hide); document.addEventListener("mousedown", hide); document.addEventListener("scroll", hide, true);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
  })();

  /* --- shared cards in chat --- */
  function shareCard(m) {
    var p = null; try { p = JSON.parse(m.body); } catch (e) {}
    if (!p || !p.t) return '<div class="cmb gone">Shared item</div>';
    var note = p.t === "note", meta = note ? [p.subject, KIND_LABEL[p.kind], p.due ? "Due " + shortDate(p.due) + (p.time ? " " + fmtTime(p.time) : "") : ""].filter(Boolean).join(" · ") : [p.tag, p.date ? shortDate(p.date) + (p.time ? " " + fmtTime(p.time) : "") : ""].filter(Boolean).join(" · ");
    var items = note && p.items && p.items.length ? '<ul class="shi">' + p.items.slice(0, 5).map(function (i) { return '<li>' + (i.d ? "☑" : "☐") + " " + esc(i.t || "") + '</li>'; }).join("") + (p.items.length > 5 ? '<li>+ ' + (p.items.length - 5) + ' more</li>' : "") + '</ul>' : "";
    return '<div class="cmb cshr"><div class="shh">' + ic(note ? "notes" : "tasks") + (note ? "Shared note" : "Shared task") + '</div><b>' + esc(p.title || "Untitled") + '</b>' + (meta ? '<small>' + esc(meta) + '</small>' : "") + items +
      (m.mine || me.role === "admin" ? "" : '<button type="button" class="chip" data-act="cshsave" data-id="' + m.id + '">' + ic("plus") + ' Save to my ' + (note ? "notes" : "tasks") + '</button>') + '</div>';
  }

  var VIEWS = { schedule: vSchedule, study: vStudy, grades: vGrades, dashboard: vDashboard, savings: vSavings, spending: vSpending, notes: vNotes, tasks: vTasks, calendar: vCalendar, journal: vJournal, chat: vChat, lists: vLists, history: vHistory, profile: vProfile, more: vMore, requests: vRequests, users: vUsers };
  function renderView(animate) {
    if (route === "chat" && !animate && loaded && $("chat")) { chatPaint(); return; }
    var v = $("view");
    v.innerHTML = loaded ? (VIEWS[route] || vDashboard)() : '<div class="empty"><span class="em">⏳</span><span>Loading your stuff…</span></div>';
    v.classList.remove("pg");
    if (animate && !reduceMotion) { void v.offsetWidth; v.classList.add("pg"); }
    reveal(v, !!animate && loaded);
    if (route === "chat" && loaded) chatMounted(); else document.body.classList.remove("chatting");
    if (ui.newId) { var nid = ui.newId; setTimeout(function () { if (ui.newId === nid) ui.newId = null; }, 900); }
  }
  function renderAll(animate) { if (!me) return; renderSide(); renderTop(); renderView(animate); renderTabs(); }
  function dataChanged(first) {
    if (!me) return;
    renderSide(); renderTabs();
    var typing = document.activeElement && $("view").contains(document.activeElement) && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (!typing) renderView(!!first);
    if (sheetState && sheetState.type === "activity") renderSheet();
  }
  function toast(t) {
    var e = $("toast"); e.hidden = true; void e.offsetWidth; e.textContent = t; e.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { e.hidden = true; }, 2600);
  }
  function setRoute() {
    if (!me) return;
    var r = location.hash.slice(1), ok = validRoutes();
    var next = ok.indexOf(r) >= 0 ? r : ok[0];
    if (next !== route) ui.list = null;
    if (next !== "chat") chat.with = null;
    route = next;
    renderAll(true); try { window.scrollTo(0, 0); } catch (e) {}
    if (route !== pinged) { pinged = route; ping(); }
  }

  /* ---------- events ---------- */
  function disarm() { if (armed) { armed.btn.innerHTML = armed.html; armed.btn.classList.remove("armed"); armed = null; } }
  function fail(er) { toast(er && er.message ? er.message : "Couldn't save. Try again."); }
  function findItem(k, id) { return (k === "task" ? data.tasks : data.notes).filter(function (x) { return x.id === id; })[0]; }
  function curList() { return data.lists.filter(function (l) { return l.id === ui.list; })[0]; }
  function burstAfter(sel) { var el = document.querySelector(sel); if (el) burst(el); }
  document.addEventListener("click", function (e) {
    if (e.target === $("sheet")) { closeSheet(); return; }
    var go = e.target.closest("[data-go]");
    if (go) { location.hash = go.dataset.go; return; }
    var b = e.target.closest("[data-act]"); if (!b) { disarm(); return; }
    var act = b.dataset.act, id = b.dataset.id;
    if (act !== "del" && act !== "approve") disarm();
    switch (act) {
      case "cropsave": cropSave().catch(fail); break;
      case "avremove": saveAvatar("").catch(fail); break;
      case "hide": store && store.saveSettings({ hide: !settings.hide }); renderView(); break;
      case "theme": store && store.saveSettings({ theme: b.dataset.v }); renderView(); break;
      case "sf": ui.sf = b.dataset.v; ui.lim = 30; renderView(); break;
      case "hf": ui.hf = b.dataset.v; ui.lim = 30; renderView(); break;
      case "nf": ui.nf = b.dataset.v; renderView(); break;
      case "more": ui.lim += 30; renderView(); break;
      case "period": ui.period = b.dataset.v; renderView(); break;
      case "ek": ui.ek = b.dataset.v; renderView(); break;
      case "eamt": $("e-amount").value = b.dataset.v; $("e-amount").focus(); break;
      case "edt": $("e-date").value = addDays(todayStr(), +b.dataset.v); break;
      case "catcustom": $("e-cat").value = ""; document.querySelectorAll("#e-cats .chip").forEach(function (c) { c.classList.toggle("on", c === b); }); $("e-custom").hidden = false; $("e-custom").focus(); break;
      case "cat": $("e-cat").value = b.dataset.v; $("e-custom").hidden = true; $("e-custom").value = ""; document.querySelectorAll("#e-cats .chip").forEach(function (c) { c.classList.toggle("on", c === b); }); break;
      case "cprev": cal.m--; if (cal.m < 0) { cal.m = 11; cal.y--; } renderView(); break;
      case "cnext": cal.m++; if (cal.m > 11) { cal.m = 0; cal.y++; } renderView(); break;
      case "seldate": sel = b.dataset.date; var d = P(sel); cal.y = d.getFullYear(); cal.m = d.getMonth(); if (route === "dashboard") location.hash = "calendar"; else renderView(); break;
      case "tday": ui.tday = b.dataset.date; renderView(); break;
      case "tshift": ui.tday = addDays(ui.tday, +b.dataset.v); renderView(); break;
      case "newtx": openSheet({ type: "tx", t: b.dataset.v, dir: "to_wallet", amount: "", date: todayStr(), cat: "", note: "" }); break;
      case "txt": txKeep(); sheetState.t = b.dataset.v; sheetState.cat = ""; renderSheet(); break;
      case "txd": txKeep(); sheetState.dir = b.dataset.v; renderSheet(); break;
      case "pickv": { var pin = $(b.dataset.t); if (pin) pin.value = b.dataset.v; b.parentNode.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("on", c === b); }); break; }
      case "sday": ui.sd = +b.dataset.v; renderView(); break;
      case "newclass": openSheet({ type: "class", day: b.dataset.day }); break;
      case "editclass": openSheet({ type: "class", id: id }); break;
      case "newgrade": openSheet({ type: "grade" }); break;
      case "editgrade": openSheet({ type: "grade", id: id }); break;
      case "newbudget": openSheet({ type: "budget" }); break;
      case "editbudget": openSheet({ type: "budget", cat: b.dataset.cat }); break;
      case "budgetdel": api("PUT", "/api/budgets", { category: b.dataset.cat, amount: 0 }).then(load).then(function () { closeSheet(); toast("Budget removed."); }).catch(fail); break;
      case "fstart": foc.label = ($("fc-label") || {}).value || foc.label; foc.focusDur = foc.mode === "focus" ? foc.dur : foc.focusDur; fStart(); break;
      case "fpause": fPause(); break;
      case "freset": fReset(); break;
      case "ffinish": fFinishEarly(); break;
      case "fskip": foc.mode = "focus"; foc.dur = Math.max(1, +foc.focusDur || 25); fReset(); break;
      case "fdur": foc.focusDur = +b.dataset.v; fSetDur(+b.dataset.v); break;
      case "fcustom": { var cv = parseInt(($("fc-custom") || {}).value, 10); if (cv > 0) { foc.focusDur = cv; fSetDur(cv); } break; }
      case "remindtog":
        if (remindOn()) { try { localStorage.setItem("st_remind_" + me.id, "0"); } catch (e) {} renderView(); break; }
        Notification.requestPermission().then(function (p) { if (p === "granted") { try { localStorage.setItem("st_remind_" + me.id, "1"); } catch (e) {} toast("Alerts are on."); } renderView(); }); break;
      case "remindtest": notify("StudentTrack", "Alerts are working 🎉", "test"); toast("Test sent. Check your notifications."); break;
      case "pwainstall": if (installEv) { installEv.prompt(); installEv.userChoice.then(function () { installEv = null; renderView(); }); } break;
      case "exportjson": exportJson(); break;
      case "exportcsv": exportCsv(); break;
      case "cshare": openSheet({ type: "cshare" }); break;
      case "cshsend": closeSheet(); chatSendExtra({ share: { type: b.dataset.t, id: id } }); break;
      case "cshsave": b.disabled = true; api("POST", "/api/chat/shares/" + id + "/save").then(function (r) { return load().then(function () { b.innerHTML = "Saved ✓"; toast("Saved to your " + (r.what === "note" ? "notes" : "tasks") + "."); }); }).catch(function (er) { b.disabled = false; fail(er); }); break;
      case "newnote": openSheet({ type: "note" }); break;
      case "newtask": openSheet({ type: "task", date: b.dataset.date }); break;
      case "edititem": openSheet({ type: b.dataset.k === "task" ? "task" : "noteview", id: b.dataset.id }); break;
      case "noteviewback": openSheet({ type: "noteview", id: b.dataset.id }); break;
      case "noteedit": openSheet({ type: "note", id: b.dataset.id, back: true }); break;
      case "nitem": {
        var nn = data.notes.filter(function (x) { return x.id === b.dataset.id; })[0], ix = +b.dataset.i; if (!nn || !nn.items || !nn.items[ix]) break;
        nn.items[ix].d = nn.items[ix].d ? 0 : 1; renderSheet(); if (route === "notes" && $("nlist")) $("nlist").innerHTML = notesList();
        api("PATCH", "/api/notes/" + nn.id + "/items", { items: nn.items }).catch(function (er) { nn.items[ix].d = nn.items[ix].d ? 0 : 1; renderSheet(); fail(er); });
        break;
      }
      case "nitemtog": b.setAttribute("aria-checked", b.getAttribute("aria-checked") === "true" ? "false" : "true"); break;
      case "nitemadd": { var box = $("n-items"); if (box && box.children.length < 40) { box.insertAdjacentHTML("beforeend", nitemRow("", 0)); box.lastChild.querySelector(".nit").focus(); } break; }
      case "nitemrm": { var rw = b.closest(".nirow"); if (rw) rw.remove(); break; }
      case "nk": $("n-kind").value = b.dataset.v; document.querySelectorAll("#n-kinds .chip").forEach(function (c) { c.classList.toggle("on", c === b); }); break;
      case "tg2": $("t-tag").value = b.dataset.v; document.querySelectorAll("#t-tags .chip").forEach(function (c) { c.classList.toggle("on", c === b); }); break;
      case "tg":
        if (!store) break;
        var it = findItem(b.dataset.k, id); if (!it) break;
        var nd = !it.done, was = { d: it.done, dd: it.doneDate };
        it.done = nd; it.doneDate = nd ? todayStr() : ""; dataChanged(); if (sheetState && sheetState.type === "noteview") renderSheet();
        if (nd) burstAfter('[data-act="tg"][data-id="' + id + '"]');
        api("POST", "/api/" + (b.dataset.k === "task" ? "tasks" : "notes") + "/" + id + "/done", { done: nd, date: todayStr() }).catch(function (er) { it.done = was.d; it.doneDate = was.dd; dataChanged(); fail(er); });
        break;
      case "delreq": openSheet({ type: "delreq", id: id }); break;
      case "cancelreq": api("DELETE", "/api/delete-requests/" + b.dataset.req).then(load).then(function () { toast("Request cancelled."); }).catch(fail); break;
      case "close": closeSheet(); break;
      case "authmode": authMode = b.dataset.v; renderAuth(); break;
      case "logoutask": openSheet({ type: "logout" }); break;
      case "logout": api("POST", "/api/logout", {}).catch(function () {}).then(function () { authMode = "login"; closeSheet(); location.hash = ""; showAuth(); }); break;
      case "activity":
        openSheet({ type: "activity", id: id, username: b.dataset.u, items: null });
        api("GET", "/api/admin/users/" + id + "/activity").then(function (r) { if (sheetState && sheetState.type === "activity" && sheetState.id === id) { sheetState.items = r.items; renderSheet(); } }).catch(function (er) { closeSheet(); fail(er); });
        break;
      case "resetpw": openSheet({ type: "resetpw", id: id, username: b.dataset.u }); break;
      case "reject": api("POST", "/api/admin/requests/" + id + "/reject", { note: ($("note-" + id) || {}).value || "" }).then(loadAdmin).then(function () { toast("Request rejected. The transaction stays."); }).catch(fail); break;

      /* journal */
      case "jmood": ui.jmood = +b.dataset.v; document.querySelectorAll("#j-moods .mood").forEach(function (m) { m.classList.toggle("on", m === b); }); break;
      case "jemood": if (sheetState) sheetState.mood = +b.dataset.v; document.querySelectorAll("#je-moods .mood").forEach(function (m) { m.classList.toggle("on", m === b); }); break;
      case "jprompt":
        var pr = PROMPTS[Math.floor(Math.random() * PROMPTS.length)], pe = $("j-prompt");
        if (pe) { pe.textContent = "💡 " + pr; pe.hidden = false; }
        if ($("j-body")) $("j-body").focus(); break;
      case "jopen": openSheet({ type: "jedit", id: id, mode: "read" }); break;
      case "jeditmode": if (sheetState) { sheetState.mode = "edit"; renderSheet(); } break;
      case "jreadmode": if (sheetState) { sheetState.mode = "read"; sheetState.mood = 0; renderSheet(); } break;
      case "jpg": var bk2 = $("bk"); if (bk2 && bk2._go) { var w2 = bk2.clientWidth, c2 = Math.round(bk2.scrollLeft / w2); bk2._go(b.dataset.v === "first" ? 0 : c2 + (+b.dataset.v)); } break;

      /* lists */
      case "lopen": ui.list = id; renderView(true); try { window.scrollTo(0, 0); } catch (er) {} break;
      case "lback": ui.list = null; renderView(true); break;
      case "newlist": openSheet({ type: "list" }); break;
      case "editlist": if (ui.list) openSheet({ type: "list", id: ui.list }); break;
      case "lcolor": $("l-color").value = b.dataset.v; document.querySelectorAll("#l-colors .swatch").forEach(function (c) { c.classList.toggle("on", c === b); }); break;
      case "licon": $("l-icon").value = b.dataset.v; document.querySelectorAll("#l-icons button").forEach(function (c) { c.classList.toggle("on", c === b); }); break;
      case "lpreset":
        var pz = LIST_PRESETS[+b.dataset.v]; if (!pz || !store) break;
        store.add("lists", { title: pz[0], icon: pz[1], color: pz[2] }).then(function (nid) { ui.list = nid; ui.newId = nid; renderView(true); toast("List created."); }).catch(fail); break;
      case "lit":
        var cl = curList(); if (!cl || !store) break;
        var li = cl.items.filter(function (x) { return x.id === id; })[0]; if (!li) break;
        var ld = !li.done; li.done = ld; ui.fresh = id; renderView();
        if (ld) burstAfter('[data-act="lit"][data-id="' + id + '"]');
        setTimeout(function () { ui.fresh = null; }, 600);
        api("POST", "/api/list-items/" + id + "/done", { done: ld }).catch(function (er) { li.done = !ld; renderView(); fail(er); });
        break;
      case "lidel": store.remove("list-items", id).catch(fail); break;
      case "lclear": if (ui.list) api("POST", "/api/lists/" + ui.list + "/clear-done", {}).then(load).then(function () { toast("Cleared."); }).catch(fail); break;

      case "del":
      case "approve":
        if (armed && armed.btn === b) {
          var c = b.dataset.c; disarm();
          if (act === "approve") api("POST", "/api/admin/requests/" + id + "/approve", { note: ($("note-" + id) || {}).value || "" }).then(loadAdmin).then(function () { toast("Approved. The transaction was deleted."); }).catch(fail);
          else store.remove(c, id).then(function () { if (c !== "money") closeSheet(); if (c === "lists") ui.list = null; }).catch(fail);
          return;
        }
        disarm(); armed = { btn: b, html: b.innerHTML }; b.textContent = act === "approve" ? "Confirm delete?" : "Are you sure?"; b.classList.add("armed");
        clearTimeout(armTimer); armTimer = setTimeout(disarm, 3000); break;
    }
  });
  document.addEventListener("change", function (e) {
    if (e.target && e.target.id === "tx-cat") { var cu2 = $("tx-custom"); cu2.hidden = e.target.value !== "__custom"; if (!cu2.hidden) cu2.focus(); return; }
    if (!e.target || e.target.id !== "av-file") return;
    var f = e.target.files && e.target.files[0]; e.target.value = "";
    if (!f) return;
    loadPhoto(f).then(openCrop).catch(function (er) { toast(er.message || "Could not use that photo."); });
  });
  document.addEventListener("input", function (e) {
    if (e.target.id === "crop-z" && crop) { crop.z = parseFloat(e.target.value) || 1; cropClamp(); cropDraw($("crop-c"), CS); return; }
    if (e.target.id === "n-q") { ui.nq = e.target.value; if ($("nlist")) { $("nlist").innerHTML = notesList(); reveal($("nlist"), false); } }
    if (e.target.id === "j-q") { ui.jq = e.target.value; if ($("jlist")) { $("jlist").innerHTML = journalList(); reveal($("jlist"), false); } }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sheetState) closeSheet();
    if ((e.key === "Enter" || e.key === " ") && e.target.dataset && e.target.dataset.go && e.target.getAttribute("role") === "link") { e.preventDefault(); location.hash = e.target.dataset.go; }
  });
  document.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, v = function (id) { return ($(id) || {}).value || ""; };
    if (f.id === "authf") {
      var reg = authMode === "register", abtn = $("a-go"); abtn.disabled = true;
      api("POST", reg ? "/api/register" : "/api/login", reg ? { username: v("a-user").trim(), password: v("a-pass"), name: v("a-name"), code: v("a-code") } : { username: v("a-user").trim(), password: v("a-pass") })
        .then(function (r) { return api("GET", "/api/me").then(function (m) { return start(r.user, m.settings); }, function () { return start(r.user); }); })
        .catch(function (er) { abtn.disabled = false; if (!me) $("a-err").textContent = er.message; });
    } else if (f.id === "gsf") {
      ui.nq = v("gs-q"); ui.nf = "all"; if (route === "notes") renderView(); else location.hash = "notes";
    } else if (f.id === "classf") {
      var cr = { subject: v("c-subject").trim(), day: +v("c-day"), start: v("c-start"), end: v("c-end"), room: v("c-room").trim(), color: v("c-color") || "blue" };
      if (!cr.subject) return; if (cr.end <= cr.start) { toast("The class must end after it starts."); return; }
      var cp2 = sheetState.id ? store.patch("classes", sheetState.id, cr) : store.add("classes", cr);
      Promise.resolve(cp2).then(function () { ui.sd = cr.day; closeSheet(); toast("Saved."); }).catch(fail);
    } else if (f.id === "gradef") {
      var gr2 = { subject: v("g-subject").trim(), units: parseFloat(v("g-units")), grade: parseFloat(v("g-grade")), term: v("g-term").trim() };
      if (!gr2.subject || !(gr2.units > 0) || !(gr2.grade >= 1 && gr2.grade <= 5)) { toast("Grades go from 1.00 to 5.00."); return; }
      var gp = sheetState.id ? store.patch("grades", sheetState.id, gr2) : store.add("grades", gr2);
      Promise.resolve(gp).then(function () { closeSheet(); toast("Saved."); }).catch(fail);
    } else if (f.id === "budgetf") {
      var bm = parseFloat(v("b-amt")), bcat = v("b-cat").trim(); if (!bcat || !(bm > 0)) return;
      api("PUT", "/api/budgets", { category: bcat, amount: bm }).then(load).then(function () { closeSheet(); toast("Budget saved" + (budgetCheck(bcat) || ".")); }).catch(fail);
    } else if (f.id === "pwf") {
      api("POST", "/api/password", { current: v("p-cur"), next: v("p-new") }).then(function () { f.reset(); toast("Password changed."); }).catch(fail);
    } else if (f.id === "setf") {
      store.saveSettings({ name: v("s-name").trim(), course: v("s-course").trim(), target: Math.max(0, parseFloat(v("s-target")) || 0) }).then(function () { renderTop(); renderView(); toast("Settings saved."); });
    } else if (f.id === "delreqf") {
      api("POST", "/api/savings/" + sheetState.id + "/delete-request", { reason: v("dr-reason").trim() }).then(load).then(function () { closeSheet(); toast("Request sent to the admin."); }).catch(fail);
    } else if (f.id === "rpwf") {
      api("POST", "/api/admin/users/" + sheetState.id + "/reset-password", { password: v("rp-new") }).then(function () { closeSheet(); toast("Password reset."); }).catch(fail);
    } else if (f.id === "txf") {
      var amt = parseFloat(v("tx-amount")), type = sheetState.t === "transfer" ? sheetState.dir : sheetState.t, sb = $("tx-save");
      if (!(amt > 0) || !v("tx-date")) return;
      sb.disabled = true;
      store.add("savings", { type: type, amount: amt, date: v("tx-date"), category: $("tx-cat") ? (v("tx-cat") === "__custom" ? (v("tx-custom").trim() || "Others") : v("tx-cat")) : "", note: v("tx-note").trim() })
        .then(function () { closeSheet(); toast({ deposit: "Deposited ", withdraw: "Withdrew ", to_wallet: "Moved to wallet: ", to_savings: "Moved to savings: " }[type] + fmt(amt)); })
        .catch(function (er) { sb.disabled = false; fail(er); });
    } else if (f.id === "expf") {
      var ea = parseFloat(v("e-amount")), ed = v("e-date"), kind = ui.ek; if (!(ea > 0) || !ed) return;
      var lastCat = (!$("e-custom").hidden ? v("e-custom").trim() : v("e-cat")) || "Others";
      var ebtn = $("e-save"); ebtn.disabled = true;
      store.add("money", { kind: kind, amount: ea, date: ed, category: (!$("e-custom").hidden ? v("e-custom").trim() : v("e-cat")) || "Others", note: v("e-note").trim() })
        .then(function () {
          if (!inPeriod(ed, ui.period)) ui.period = ["week", "month"].filter(function (k) { return inPeriod(ed, k); })[0] || "all";
          renderView(); toast((kind === "income" ? "Added income: " : "Added expense: ") + fmt(ea) + (kind === "expense" ? budgetCheck(!$("e-custom") || $("e-custom").hidden ? lastCat : lastCat) : ""));
        }).catch(function (er) { ebtn.disabled = false; fail(er); });
    } else if (f.id === "quickf") {
      var title = v("q-title").trim(); if (!title) return;
      store.add("tasks", { title: title, date: ui.tday, time: "", tag: "Personal" }).then(function () { renderView(); var q = $("q-title"); if (q) q.focus(); }).catch(fail);
    } else if (f.id === "notef") {
      var rec = { title: v("n-title").trim(), subject: v("n-subject").trim(), kind: v("n-kind") || "assignment", dueDate: v("n-date"), dueTime: v("n-time"), body: v("n-body").trim(), items: collectItems() };
      if (!rec.title) return;
      var nid = sheetState.id, np = nid ? store.patch("notes", nid, rec) : store.add("notes", rec);
      Promise.resolve(np).then(function () { if (nid) openSheet({ type: "noteview", id: nid }); else closeSheet(); toast("Saved."); }).catch(fail);
    } else if (f.id === "taskf") {
      var tr = { title: v("t-title").trim(), date: v("t-date"), time: v("t-time"), tag: v("t-tag") || "Personal" };
      if (!tr.title || !tr.date) return;
      var tp = sheetState.id ? store.patch("tasks", sheetState.id, tr) : store.add("tasks", tr);
      Promise.resolve(tp).then(function () { closeSheet(); toast("Saved."); }).catch(fail);
    } else if (f.id === "jf") {
      var jr = { date: v("j-date"), mood: ui.jmood, title: v("j-title").trim(), body: v("j-body").trim() };
      if (!jr.body || !jr.date) return;
      var jb = $("j-save"); jb.disabled = true;
      store.add("journal", jr).then(function (nid) { ui.newId = nid; ui.jq = ""; ui.jdate = todayStr(); renderView(); toast("Entry saved " + MOODS[jr.mood - 1][0]); }).catch(function (er) { jb.disabled = false; fail(er); });
    } else if (f.id === "jef") {
      var je = data.journal.filter(function (x) { return x.id === sheetState.id; })[0];
      var er2 = { date: v("je-date"), mood: sheetState.mood || (je ? je.mood : 3), title: v("je-title").trim(), body: v("je-body").trim() };
      if (!er2.body || !er2.date) return;
      store.patch("journal", sheetState.id, er2).then(function () { if (sheetState) { sheetState.mode = "read"; sheetState.mood = 0; renderSheet(); } toast("Saved."); }).catch(fail);
    } else if (f.id === "listf") {
      var lr = { title: v("l-title").trim(), color: v("l-color") || "blue", icon: v("l-icon") || "list" };
      if (!lr.title) return;
      var wasNew = !sheetState.id;
      var lp = sheetState.id ? store.patch("lists", sheetState.id, lr) : store.add("lists", lr);
      Promise.resolve(lp).then(function (nid) { closeSheet(); if (wasNew && nid) { ui.list = nid; ui.newId = nid; renderView(true); } toast("Saved."); }).catch(fail);
    } else if (f.id === "lif") {
      var tx = v("li-text").trim(); if (!tx || !ui.list) return;
      store.add("lists/" + ui.list + "/items", { text: tx }).then(function (nid) { ui.newId = nid; renderView(); var q = $("li-text"); if (q) q.focus(); }).catch(fail);
    }
  });
  window.addEventListener("hashchange", setRoute);

  /* background blobs drift a little as you scroll (cheap: one CSS variable) */
  var scrollTick = false;
  window.addEventListener("scroll", function () {
    if (scrollTick || reduceMotion) return; scrollTick = true;
    requestAnimationFrame(function () { document.documentElement.style.setProperty("--sy", String(window.scrollY || 0)); scrollTick = false; });
  }, { passive: true });

  lastDay = todayStr(); lastHour = new Date().getHours();
  setInterval(tick, 1000);
  /* tell the server this person is still here (and which page), once a minute while the tab is open */
  setInterval(function () { if (document.visibilityState === "visible") ping(); }, 60000);
  setInterval(function () { if (me && me.role === "admin" && document.visibilityState === "visible") loadAdmin().catch(function () {}); }, 20000);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "visible" || !me) return;
    if (me.role === "admin") loadAdmin().catch(function () {}); else ping();
  });
  boot();
})();
