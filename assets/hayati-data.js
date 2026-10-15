(function (root) {
  const CAT = {
    religious: ["Religious", "#9F8FE0"],
    national: ["National", "#3FBF9C"],
    cultural: ["Cultural", "#E8B765"],
    school: ["School", "#6F9BEA"],
    family: ["Family", "#EE7FAA"],
  };
  const SPEND = {
    groceries: ["Groceries", "#B97C73", 3500],
    bills: ["Bills & utilities", "#BC9D72", 2400],
    school: ["School", "#8C7FC1", 2000],
    transport: ["Transport", "#75A963", 1200],
    health: ["Health", "#6FA6B1", 600],
    home: ["Home", "#5D87C4", 800],
    dining: ["Eating out", "#AD8294", 900],
    giving: ["Giving & Sadaqa", "#B08BAA", 500],
  };
  const FAM = [
    ["Ahmed", "Father", "#9F8FE0"],
    ["Noura", "Mother", "#EE7FAA"],
    ["Salem", "Son", "#6F9BEA"],
    ["Latifa", "Daughter", "#E8B765"],
    ["Zayed", "Son", "#3FBF9C"],
    ["Jiddo Khalid", "Grandfather", "#B3A4F2"],
  ];
  const BASE = [
    ["2026-01-01", "New Year's Day", "national"],
    ["2026-02-18", "Ramadan begins", "religious", 1, 3200, 2400],
    ["2026-03-20", "Eid Al Fitr", "religious", 1, 4500, 3900],
    ["2026-03-21", "Mother's Day", "cultural"],
    ["2026-05-26", "Arafat Day", "religious", 1],
    ["2026-05-27", "Eid Al Adha", "religious", 1, 5200, 5200],
    ["2026-06-16", "Islamic New Year", "religious", 1],
    ["2026-07-04", "Summer break begins", "school", 0, 12000, 12000],
    ["2026-08-24", "Back to school", "school", 0, 3800, 3800],
    ["2026-08-25", "Prophet's Birthday", "religious", 1],
    ["2026-08-28", "Emirati Women's Day", "national"],
    ["2026-10-20", "Parent-teacher meeting", "school"],
    ["2026-10-29", "Salem's birthday", "family", 0, 400, 400],
    ["2026-11-03", "UAE Flag Day", "national"],
    ["2026-11-08", "Diwali", "cultural"],
    ["2026-11-14", "Latifa's birthday", "family", 0, 600, 350],
    ["2026-12-01", "Commemoration Day", "national"],
    ["2026-12-02", "UAE National Day", "national", 0, 1500, 600],
    ["2026-12-12", "Family weekend in Hatta", "family", 0, 1800, 900],
    ["2026-12-18", "Winter break begins", "school"],
    ["2026-12-19", "Dubai Shopping Festival", "cultural", 0, 2000, 500],
    ["2026-12-25", "Christmas", "cultural"],
    ["2027-01-01", "New Year's Day", "national"],
    ["2027-02-08", "Ramadan begins", "religious", 1, 3400, 600],
    ["2027-03-10", "Eid Al Fitr", "religious", 1, 4800, 900],
    ["2027-05-16", "Arafat Day", "religious", 1],
    ["2027-05-17", "Eid Al Adha", "religious", 1, 5400, 1200],
    ["2027-06-06", "Islamic New Year", "religious", 1],
    ["2027-08-15", "Prophet's Birthday", "religious", 1],
    ["2027-12-01", "Commemoration Day", "national"],
    ["2027-12-02", "UAE National Day", "national", 0, 1600, 0],
  ].map((a) => ({ d: a[0], t: a[1], c: a[2], tent: a[3] || 0, b: a[4] || 0, s: a[5] || 0 }));

  const KEY = "hayati.finance",
    EVENTS_KEY = "hayati-events",
    VERSION = 1;
  const memory = {};
  const store = {
    get(k) {
      try {
        return root.localStorage ? root.localStorage.getItem(k) : (memory[k] ?? null);
      } catch {
        return memory[k] ?? null;
      }
    },
    set(k, v) {
      memory[k] = v;
      try {
        if (root.localStorage) root.localStorage.setItem(k, v);
      } catch {}
    },
    remove(k) {
      delete memory[k];
      try {
        if (root.localStorage) root.localStorage.removeItem(k);
      } catch {}
    },
  };

  const pad = (n) => String(n).padStart(2, "0");
  const iso = (dt) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  const today = () => iso(new Date());
  const ym = (d) => d.slice(0, 7);
  const money = (n) => Math.round(Number(n) * 100) / 100;
  const validAmount = (n) => Number.isFinite(Number(n)) && Number(n) > 0 && Number(n) < 1e7;
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const keyOf = (e) => e.d + "|" + e.t;
  const aed = (n) =>
    "AED " + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });

  const MONTH_TEMPLATE = [
    [1, "bills", 1150, "Ahmed", "DEWA electricity & water"],
    [1, "bills", 389, "Ahmed", "Home internet"],
    [2, "groceries", 640, "Noura", "Carrefour weekly shop"],
    [3, "transport", 300, "Ahmed", "Salik top-up"],
    [4, "school", 1450, "Noura", "School bus, term 1"],
    [5, "dining", 210, "Noura", "Family dinner out"],
    [6, "health", 180, "Noura", "Pharmacy"],
    [8, "groceries", 720, "Noura", "Lulu weekly shop"],
    [9, "giving", 200, "Ahmed", "Friday Sadaqa"],
    [10, "transport", 260, "Ahmed", "Fuel"],
    [11, "dining", 340, "Ahmed", "Weekend brunch"],
    [12, "school", 620, "Noura", "Uniforms and books"],
    [13, "home", 250, "Noura", "Cleaning supplies"],
    [14, "groceries", 580, "Noura", "Carrefour weekly shop"],
    [15, "dining", 420, "Noura", "Dinner for Jiddo Khalid's visit"],
    [16, "health", 95, "Ahmed", "Vitamins"],
    [18, "transport", 240, "Ahmed", "Fuel"],
    [20, "groceries", 690, "Noura", "Lulu weekly shop"],
    [22, "dining", 180, "Salem", "Shawarma night"],
    [23, "home", 380, "Ahmed", "AC service"],
    [25, "giving", 150, "Noura", "Mosque donation"],
    [26, "groceries", 610, "Noura", "Carrefour weekly shop"],
    [27, "transport", 250, "Ahmed", "Fuel"],
  ];

  function seed(now = new Date()) {
    const y = now.getFullYear(),
      m = now.getMonth(),
      dayNow = now.getDate(),
      lastPrev = new Date(y, m, 0).getDate();
    const expenses = [];
    MONTH_TEMPLATE.forEach((r, i) => {
      expenses.push({
        id: "p" + i,
        d: iso(new Date(y, m - 1, Math.min(r[0], lastPrev))),
        cat: r[1],
        amt: r[2],
        who: r[3],
        note: r[4],
      });
      if (r[0] <= dayNow)
        expenses.push({ id: "c" + i, d: iso(new Date(y, m, r[0])), cat: r[1], amt: r[2], who: r[3], note: r[4] });
    });
    const nextOcc = BASE.find((e) => e.b > 0 && e.d >= iso(now));
    if (nextOcc)
      expenses.push({
        id: "o1",
        d: iso(now),
        cat: "home",
        amt: 150,
        who: "Noura",
        note: "Early shopping for " + nextOcc.t,
        occ: keyOf(nextOcc),
      });
    const limits = {};
    Object.keys(SPEND).forEach((k) => (limits[k] = SPEND[k][2]));
    return {
      v: VERSION,
      limits,
      expenses,
      goals: [
        { id: "g1", t: "Hajj for Jiddo Khalid", target: 25000, saved: 9800 },
        { id: "g2", t: "Emergency fund", target: 15000, saved: 11200 },
        { id: "g3", t: "Family car upgrade", target: 40000, saved: 12500 },
      ],
      contribs: [
        { id: "k1", d: iso(new Date(y, m, 1)), amt: 500, kind: "goal", ref: "g2" },
        { id: "k2", d: iso(new Date(y, m, Math.min(7, dayNow))), amt: 750, kind: "goal", ref: "g1" },
      ],
      occ: {},
      kid: {
        name: "Latifa",
        split: { save: 50, spend: 30, give: 20 },
        goal: { t: "A new bicycle", target: 250 },
        log: [
          { id: "e1", d: iso(new Date(y, m - 1, 3)), type: "in", amt: 300, note: "Eidiya", parts: { save: 150, spend: 90, give: 60 } },
          { id: "e2", d: iso(new Date(y, m, 1)), type: "in", amt: 20, note: "Weekly allowance", parts: { save: 10, spend: 6, give: 4 } },
          { id: "e3", d: iso(new Date(y, m - 1, 12)), type: "spend", amt: 30, note: "Art supplies" },
          { id: "e4", d: iso(new Date(y, m - 1, 20)), type: "give", amt: 45, note: "Sadaqa box at the mosque" },
        ],
      },
    };
  }

  function load() {
    try {
      const st = JSON.parse(store.get(KEY) || "null");
      if (st && st.v === VERSION) return st;
    } catch {}
    const st = seed();
    save(st);
    return st;
  }
  function save(st) {
    store.set(KEY, JSON.stringify(st));
    return st;
  }
  function reset() {
    store.remove(KEY);
    return load();
  }

  function customEvents() {
    try {
      const list = JSON.parse(store.get(EVENTS_KEY) || "[]");
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }
  function addEvent(ev) {
    const list = customEvents();
    list.push(ev);
    store.set(EVENTS_KEY, JSON.stringify(list));
  }

  function events(st = load()) {
    const spent = {};
    st.expenses.forEach((x) => {
      if (x.occ) spent[x.occ] = money((spent[x.occ] || 0) + x.amt);
    });
    return BASE.concat(customEvents())
      .map((e) => {
        const k = keyOf(e),
          o = st.occ[k] || {};
        return { ...e, k, b: Number(o.b ?? e.b) || 0, s: Number(o.s ?? e.s) || 0, spent: spent[k] || 0 };
      })
      .sort((a, b) => (a.d + (a.time || "") < b.d + (b.time || "") ? -1 : 1));
  }

  function monthSummary(st, month) {
    const list = st.expenses.filter((x) => ym(x.d) === month);
    const cats = Object.keys(SPEND).map((k) => {
      const spent = money(list.filter((x) => x.cat === k).reduce((n, x) => n + x.amt, 0));
      const limit = Number(st.limits[k]) || 0;
      return { k, label: SPEND[k][0], color: SPEND[k][1], spent, limit, over: limit > 0 && spent > limit };
    });
    return {
      month,
      expenses: list.sort((a, b) => (a.d < b.d ? 1 : -1)),
      cats,
      spent: money(cats.reduce((n, c) => n + c.spent, 0)),
      limit: money(cats.reduce((n, c) => n + c.limit, 0)),
      saved: money(st.contribs.filter((c) => ym(c.d) === month).reduce((n, c) => n + c.amt, 0)),
      over: cats.filter((c) => c.over),
    };
  }

  function addExpense(st, x) {
    if (!validAmount(x.amt) || !SPEND[x.cat]) throw new Error("Enter an amount and a category.");
    st.expenses.push({
      id: uid(),
      d: x.d || today(),
      cat: x.cat,
      amt: money(x.amt),
      who: String(x.who || "").slice(0, 40),
      note: String(x.note || "").slice(0, 80),
      ...(x.occ ? { occ: x.occ } : {}),
    });
    return save(st);
  }
  function removeExpense(st, id) {
    st.expenses = st.expenses.filter((x) => x.id !== id);
    return save(st);
  }
  function setLimit(st, cat, amt) {
    if (!SPEND[cat] || !(Number(amt) >= 0)) throw new Error("Enter a valid limit.");
    st.limits[cat] = money(amt);
    return save(st);
  }
  function setOccBudget(st, k, b) {
    if (!(Number(b) >= 0)) throw new Error("Enter a valid budget.");
    const e = events(st).find((x) => x.k === k);
    if (!e) throw new Error("Occasion not found.");
    st.occ[k] = { b: money(b), s: e.s };
    return save(st);
  }
  function contribute(st, kind, ref, amt) {
    if (!validAmount(amt)) throw new Error("Enter an amount.");
    if (kind === "goal") {
      const g = st.goals.find((x) => x.id === ref);
      if (!g) throw new Error("Goal not found.");
      g.saved = money(g.saved + Number(amt));
    } else {
      const e = events(st).find((x) => x.k === ref);
      if (!e) throw new Error("Occasion not found.");
      st.occ[ref] = { b: e.b, s: money(e.s + Number(amt)) };
    }
    st.contribs.push({ id: uid(), d: today(), amt: money(amt), kind, ref });
    return save(st);
  }
  function addGoal(st, t, target) {
    if (!String(t).trim() || !validAmount(target)) throw new Error("Enter a name and a target.");
    st.goals.push({ id: uid(), t: String(t).trim().slice(0, 60), target: money(target), saved: 0 });
    return save(st);
  }
  function removeGoal(st, id) {
    st.goals = st.goals.filter((g) => g.id !== id);
    return save(st);
  }

  function kidJars(st) {
    const j = { save: 0, spend: 0, give: 0, received: 0, given: 0, spent: 0 };
    st.kid.log.forEach((x) => {
      if (x.type === "in") {
        j.received += x.amt;
        j.save += x.parts.save;
        j.spend += x.parts.spend;
        j.give += x.parts.give;
      } else if (x.type === "spend") {
        j.spend -= x.amt;
        j.spent += x.amt;
      } else if (x.type === "give") {
        j.give -= x.amt;
        j.given += x.amt;
      }
    });
    Object.keys(j).forEach((k) => (j[k] = money(j[k])));
    return j;
  }
  function kidAdd(st, type, amt, note) {
    if (!validAmount(amt) || !["in", "spend", "give"].includes(type)) throw new Error("Enter an amount.");
    const a = money(amt),
      entry = { id: uid(), d: today(), type, amt: a, note: String(note || "").slice(0, 60) };
    if (type === "in") {
      const s = st.kid.split,
        save = money((a * s.save) / 100),
        give = money((a * s.give) / 100);
      entry.parts = { save, spend: money(a - save - give), give };
    } else {
      const jars = kidJars(st);
      if (a > jars[type]) throw new Error(`Only ${aed(jars[type])} left in your ${type === "give" ? "Give" : "Spend"} jar.`);
    }
    st.kid.log.push(entry);
    return save(st);
  }

  // How much to put aside each month so an occasion is fully funded on the day.
  function monthlyNeed(e, t = today()) {
    const left = Math.max(0, e.b - e.s);
    if (!left || e.d < t) return 0;
    const days = (new Date(e.d + "T00:00") - new Date(t + "T00:00")) / 864e5;
    return Math.ceil(left / Math.max(1, Math.floor(days / 30.44)));
  }

  // Up to three plain-language tips from this month's numbers. Works offline.
  function insights(st, t = today()) {
    const sum = monthSummary(st, ym(t)),
      day = +t.slice(8),
      dim = new Date(+t.slice(0, 4), +t.slice(5, 7), 0).getDate(),
      out = [];
    if (sum.over.length) {
      const by = sum.over.reduce((n, c) => n + c.spent - c.limit, 0);
      out.push({
        tone: "warn",
        text: `${sum.over.map((c) => c.label).join(" and ")} ${sum.over.length === 1 ? "is" : "are"} ${aed(by)} over the monthly limit.`,
      });
    }
    if (day >= 5) {
      const pace = sum.cats
        // Bills and school fees land once a month, so projecting their pace is misleading.
        .filter((c) => !c.over && c.limit > 0 && c.spent > 0 && !["bills", "school"].includes(c.k))
        .map((c) => ({ c, projected: Math.round((c.spent / day) * dim) }))
        .filter((x) => x.projected > x.c.limit * 1.05)
        .sort((a, b) => b.projected - b.c.limit - (a.projected - a.c.limit))[0];
      if (pace)
        out.push({
          tone: "warn",
          text: `${pace.c.label} is on pace for ${aed(pace.projected)} this month, ${aed(pace.projected - pace.c.limit)} over its limit.`,
        });
    }
    const occ = events(st)
      .filter((e) => e.d >= t && e.b > e.s)
      .map((e) => ({ e, need: monthlyNeed(e, t) }))
      .sort((a, b) => b.need - a.need)[0];
    if (occ)
      out.push({
        tone: "tip",
        text: `Put aside ${aed(occ.need)} a month for ${occ.e.t} to be fully ready by ${new Date(occ.e.d + "T00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long" })}.`,
      });
    const goal = st.goals
      .filter((g) => g.saved < g.target)
      .sort((a, b) => b.saved / b.target - a.saved / a.target)[0];
    if (goal)
      out.push({
        tone: "ok",
        text: `${goal.t} is ${Math.round((goal.saved / goal.target) * 100)}% funded, only ${aed(goal.target - goal.saved)} to go.`,
      });
    if (!sum.over.length && out.every((x) => x.tone !== "warn"))
      out.unshift({ tone: "ok", text: "Every category is within its limit so far this month." });
    return out.slice(0, 3);
  }

  /* ---------- Backup: export / validated import ---------- */
  const PREF_KEY = "hayati.preferences",
    PLUS_KEY = "hayati-fin-plus"; // debts, bills, assets and cards from finance-plus.js
  function exportAll() {
    const read = (k) => {
      try {
        return JSON.parse(store.get(k) || "null");
      } catch {
        return null;
      }
    };
    const plus = read(PLUS_KEY);
    return { app: "hayati", version: VERSION, exported: new Date().toISOString(), finance: load(), events: customEvents(), preferences: read(PREF_KEY) || {}, ...(plus ? { plus } : {}) };
  }

  // Backup files come from outside the app, so every field is checked and rebuilt.
  function importAll(data) {
    const fail = (what) => {
        throw new Error(`This backup file is not valid (${what}).`);
      },
      isObj = (x) => x && typeof x === "object" && !Array.isArray(x),
      isDate = (x) => typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x),
      str = (x, max, what, min = 0) => {
        if (x === undefined && min === 0) return "";
        if (typeof x !== "string" || x.length > max || x.trim().length < min) fail(what);
        return x;
      },
      num = (x, what, positive) => {
        if (!Number.isFinite(x) || x < 0 || x >= 1e7 || (positive && x === 0)) fail(what);
        return money(x);
      },
      list = (x, max, what) => {
        if (!Array.isArray(x) || x.length > max) fail(what);
        return x;
      };
    if (!isObj(data) || data.app !== "hayati" || data.version !== VERSION) fail("not a Hayati backup");
    const f = data.finance;
    if (!isObj(f) || f.v !== VERSION || !isObj(f.limits) || !isObj(f.occ) || !isObj(f.kid)) fail("finance");
    const limits = {};
    Object.keys(SPEND).forEach((k) => (limits[k] = f.limits[k] === undefined ? SPEND[k][2] : num(f.limits[k], "limits")));
    const occ = {};
    Object.entries(f.occ).forEach(([k, o]) => {
      str(k, 120, "occasion budgets");
      if (!isObj(o)) fail("occasion budgets");
      occ[k] = { b: num(o.b, "occasion budgets"), s: num(o.s, "occasion budgets") };
    });
    const k = f.kid;
    if (!isObj(k.split) || !isObj(k.goal)) fail("kid jars");
    const split = { save: num(k.split.save, "jar split"), spend: num(k.split.spend, "jar split"), give: num(k.split.give, "jar split") };
    if (split.save + split.spend + split.give !== 100) fail("jar split");
    const finance = {
      v: VERSION,
      limits,
      occ,
      expenses: list(f.expenses, 5000, "expenses").map((x) => {
        if (!isObj(x) || !isDate(x.d) || !SPEND[x.cat]) fail("expenses");
        return {
          id: str(x.id, 40, "expenses", 1),
          d: x.d,
          cat: x.cat,
          amt: num(x.amt, "expenses", true),
          who: str(x.who, 40, "expenses"),
          note: str(x.note, 80, "expenses"),
          ...(x.occ ? { occ: str(x.occ, 120, "expenses") } : {}),
        };
      }),
      goals: list(f.goals, 50, "goals").map((g) => {
        if (!isObj(g)) fail("goals");
        return { id: str(g.id, 40, "goals", 1), t: str(g.t, 60, "goals", 1), target: num(g.target, "goals", true), saved: num(g.saved, "goals") };
      }),
      contribs: list(f.contribs, 5000, "savings history").map((c) => {
        if (!isObj(c) || !isDate(c.d) || !["goal", "occ"].includes(c.kind)) fail("savings history");
        return { id: str(c.id, 40, "savings history", 1), d: c.d, amt: num(c.amt, "savings history", true), kind: c.kind, ref: str(c.ref, 120, "savings history", 1) };
      }),
      kid: {
        name: str(k.name, 40, "kid jars", 1),
        split,
        goal: { t: str(k.goal.t, 60, "kid goal", 1), target: num(k.goal.target, "kid goal", true) },
        log: list(k.log, 2000, "kid history").map((x) => {
          if (!isObj(x) || !isDate(x.d) || !["in", "spend", "give"].includes(x.type)) fail("kid history");
          const e = { id: str(x.id, 40, "kid history", 1), d: x.d, type: x.type, amt: num(x.amt, "kid history", true), note: str(x.note, 60, "kid history") };
          if (x.type === "in") {
            if (!isObj(x.parts)) fail("kid history");
            e.parts = { save: num(x.parts.save, "kid history"), spend: num(x.parts.spend, "kid history"), give: num(x.parts.give, "kid history") };
          }
          return e;
        }),
      },
    };
    const evs = list(data.events, 500, "calendar events").map((e) => {
      if (!isObj(e) || !isDate(e.d) || !CAT[e.c] || ![0, 1].includes(e.tent ?? 0)) fail("calendar events");
      const time = e.time ?? "";
      if (time && !/^\d{2}:\d{2}$/.test(time)) fail("calendar events");
      return { d: e.d, t: str(e.t, 80, "calendar events", 1), c: e.c, tent: e.tent ?? 0, b: num(e.b ?? 0, "calendar events"), s: num(e.s ?? 0, "calendar events"), time };
    });
    const p = isObj(data.preferences) ? data.preferences : {},
      prefs = {},
      pick = (key, ok) => {
        if (p[key] !== undefined && ok(p[key])) prefs[key] = p[key];
      };
    pick("theme", (x) => ["light", "dark"].includes(x));
    pick("textSize", (x) => ["small", "medium", "large"].includes(x));
    pick("highContrast", (x) => typeof x === "boolean");
    pick("adhdFriendly", (x) => typeof x === "boolean");
    pick("effects", (x) => ["auto", "full", "reduced"].includes(x));
    pick("name", (x) => typeof x === "string" && x.length <= 80);
    pick("email", (x) => typeof x === "string" && x.length <= 120);
    // Debts, bills and cards. Their ids, colours and types land in HTML attributes, so only known shapes get in.
    let plus = null;
    if (data.plus !== undefined) {
      const x = data.plus,
        id = (v, what) => (typeof v === "string" && /^[\w-]{1,40}$/.test(v) ? v : fail(what)),
        oneOf = (v, opts, what) => (opts.includes(v) ? v : fail(what)),
        day = (v, what) => (Number.isInteger(v) && v >= 1 && v <= 31 ? v : fail(what));
      if (!isObj(x) || !isObj(x.assets) || !isObj(x.paid ?? {}) || !isObj(x.chk ?? {})) fail("debts and bills");
      const assets = {};
      ["cash", "savings", "invest", "gold", "other"].forEach((k) => (assets[k] = num(x.assets[k] ?? 0, "assets")));
      plus = {
        sample: x.sample === true,
        income: num(x.income ?? 0, "income"),
        gold: num(x.gold ?? 0, "gold price"),
        extra: num(x.extra ?? 0, "extra payment"),
        assets,
        debts: list(x.debts, 100, "debts").map((d) => {
          if (!isObj(d)) fail("debts");
          return {
            id: id(d.id, "debts"),
            n: str(d.n, 60, "debts", 1),
            t: oneOf(d.t, ["loan", "card", "bnpl", "mortgage", "family"], "debts"),
            bal: num(d.bal, "debts"),
            orig: num(d.orig ?? d.bal, "debts"),
            apr: num(d.apr, "debts"),
            pay: num(d.pay, "debts"),
            limit: num(d.limit ?? 0, "debts"),
            day: day(d.day, "debts"),
          };
        }),
        bills: list(x.bills, 200, "bills").map((b) => {
          if (!isObj(b)) fail("bills");
          return {
            id: id(b.id, "bills"),
            n: str(b.n, 60, "bills", 1),
            amt: num(b.amt, "bills", true),
            f: oneOf(b.f, ["m", "y"], "bills"),
            day: day(b.day, "bills"),
            cat: oneOf(b.cat, ["home", "utilities", "transport", "insurance", "school", "fun", "other"], "bills"),
            ...(b.mo !== undefined ? { mo: Number.isInteger(b.mo) && b.mo >= 0 && b.mo <= 12 ? b.mo : fail("bills") } : {}),
          };
        }),
        paid: Object.fromEntries(Object.keys(x.paid ?? {}).filter((k) => /^[\w-]{1,40}:\d{4}-\d{2}$/.test(k) && x.paid[k] === true).map((k) => [k, true])),
        chk: Object.fromEntries(Object.keys(x.chk ?? {}).filter((k) => /^\d{1,2}$/.test(k)).map((k) => [k, x.chk[k] === true])),
        virtualCards: list(x.virtualCards ?? [], 50, "cards").map((c) => {
          if (!isObj(c)) fail("cards");
          return {
            id: id(c.id, "cards"),
            preset: id(c.preset, "cards"),
            name: str(c.name, 60, "cards", 1),
            color: typeof c.color === "string" && /^#[0-9a-f]{6}$/i.test(c.color) ? c.color : fail("cards"),
            account: oneOf(c.account, ["cash", "savings", "invest", "other"], "cards"),
          };
        }),
      };
    }
    // Everything checked: now write.
    save(finance);
    store.set(EVENTS_KEY, JSON.stringify(evs));
    store.set(PREF_KEY, JSON.stringify(prefs));
    if (plus) store.set(PLUS_KEY, JSON.stringify(plus));
    return finance;
  }

  // Compact family data for Hayati AI. Children never receive the parents' budgets.
  function aiContext(role, st = load()) {
    const t = today(),
      jars = kidJars(st),
      pocketMoney = {
        child: st.kid.name,
        jars: { save: jars.save, spend: jars.spend, give: jars.give },
        split: st.kid.split,
        totalGivenAsSadaqa: jars.given,
        goal: { item: st.kid.goal.t, cost: st.kid.goal.target, saved: jars.save },
      };
    const upcoming = events(st).filter((e) => e.d >= t);
    if (role === "child")
      return {
        today: t,
        child: st.kid.name,
        pocketMoney,
        upcomingDays: upcoming.slice(0, 8).map((e) => ({ name: e.t, date: e.d })),
      };
    const thisMonth = monthSummary(st, ym(t)),
      prev = new Date(t + "T00:00");
    prev.setDate(0);
    return {
      today: t,
      currency: "AED",
      family: FAM.map((f) => `${f[0]} (${f[1].toLowerCase()})`),
      thisMonth: {
        spent: thisMonth.spent,
        limit: thisMonth.limit,
        savedTowardGoals: thisMonth.saved,
        byCategory: thisMonth.cats.map((c) => ({ category: c.label, spent: c.spent, limit: c.limit })),
        overLimit: thisMonth.over.map((c) => c.label),
        recentExpenses: thisMonth.expenses
          .slice(0, 8)
          .map((x) => ({ date: x.d, amount: x.amt, category: SPEND[x.cat][0], who: x.who, note: x.note })),
      },
      lastMonthSpent: monthSummary(st, ym(iso(prev))).spent,
      savingsGoals: st.goals.map((g) => ({ name: g.t, target: g.target, saved: g.saved })),
      occasions: upcoming
        .filter((e) => e.b > 0)
        .slice(0, 9)
        .map((e) => ({
          name: e.t + (e.tent ? " (tentative)" : ""),
          date: e.d,
          budget: e.b,
          saved: e.s,
          alreadySpent: e.spent,
          monthlyToSave: monthlyNeed(e, t),
        })),
      pocketMoney,
    };
  }

  const api = {
    CAT, SPEND, FAM, BASE, KEY, aed, today, ym, keyOf,
    seed, load, save, reset, events, addEvent, customEvents,
    monthSummary, addExpense, removeExpense, setLimit, setOccBudget,
    contribute, addGoal, removeGoal, kidJars, kidAdd, aiContext,
    monthlyNeed, insights, exportAll, importAll,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.HayatiData = api;
})(typeof window !== "undefined" ? window : globalThis);
