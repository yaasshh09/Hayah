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
        })),
      pocketMoney,
    };
  }

  const api = {
    CAT, SPEND, FAM, BASE, KEY, aed, today, ym, keyOf,
    seed, load, save, reset, events, addEvent, customEvents,
    monthSummary, addExpense, removeExpense, setLimit, setOccBudget,
    contribute, addGoal, removeGoal, kidJars, kidAdd, aiContext,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.HayatiData = api;
})(typeof window !== "undefined" ? window : globalThis);
