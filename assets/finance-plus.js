
(function () {
  "use strict";
  var FK = "hayati-fin-plus", clamp = function (x, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, x)); };
  var uid = function () { return "x" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); };
  var money = function (n) { return "AED " + Math.round(n).toLocaleString("en-US"); };
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var isoD = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  var cn = function (n, suf) { return '<span class="cn" data-n="' + Math.round(n) + '" data-pre="AED " data-suf="' + (suf || "") + '">AED 0' + (suf || "") + "</span>"; };
  var DT = { loan: "Loan", card: "Credit card", bnpl: "Buy now pay later", mortgage: "Mortgage", family: "Family loan" };
  var BC = { home: ["Home", "#5D87C4"], utilities: ["Utilities", "#BC9D72"], transport: ["Transport", "#75A963"], insurance: ["Insurance", "#6FA6B1"], school: ["School", "#8C7FC1"], fun: ["Subscriptions", "#AD8294"], other: ["Other", "#B08BAA"] };

  function seed() {
    return { sample: true, income: 28000, gold: 400, extra: 500,
      assets: { cash: 9000, savings: 34000, invest: 12000, gold: 6000, other: 0 },
      debts: [
        { id: uid(), n: "Car loan", t: "loan", bal: 38000, orig: 52000, apr: 4.5, pay: 1450, day: 5 },
        { id: uid(), n: "Personal loan", t: "loan", bal: 12000, orig: 20000, apr: 8.5, pay: 900, day: 12 },
        { id: uid(), n: "Credit card", t: "card", bal: 6500, orig: 6500, apr: 36, pay: 600, limit: 20000, day: 20 },
        { id: uid(), n: "Tabby purchase", t: "bnpl", bal: 1200, orig: 1600, apr: 0, pay: 400, day: 25 }],
      bills: [
        { id: uid(), n: "Rent", amt: 6500, f: "m", day: 1, cat: "home" }, { id: uid(), n: "DEWA", amt: 650, f: "m", day: 10, cat: "utilities" },
        { id: uid(), n: "Internet and mobile", amt: 520, f: "m", day: 15, cat: "utilities" }, { id: uid(), n: "Salik and fuel", amt: 450, f: "m", day: 5, cat: "transport" },
        { id: uid(), n: "Netflix and Shahid", amt: 80, f: "m", day: 20, cat: "fun" }, { id: uid(), n: "Car insurance", amt: 2400, f: "y", mo: 3, day: 14, cat: "insurance" }],
      paid: {}, chk: {} };
  }
  var F; try { F = JSON.parse(localStorage.getItem(FK)); } catch (e) {} if (!F || !F.debts) F = seed();
  if (!Array.isArray(F.virtualCards)) F.virtualCards = [];
  var save = function () { try { localStorage.setItem(FK, JSON.stringify(F)); } catch (e) {} };

  var VC_COLORS = ["#202124", "#5940b8", "#3678d8", "#139bad", "#23a66b", "#e0b51b", "#e97522", "#d94c55", "#d74791", "#153f8c", "#242424", "#087f86", "#19885b", "#c6243b", "#a50c32", "#17469b", "#007d55"];
  var VC_ACCOUNTS = [["cash", "Cash & current accounts"], ["savings", "Savings & deposits"], ["invest", "Investments"], ["other", "Property & other"]];
  var VC_PRESETS = [
    { id: "visa", name: "Visa", brand: "VISA", kind: "Global network", color: "#153f8c" },
    { id: "mastercard", name: "Mastercard", brand: "mastercard", kind: "Global network", color: "#242424" },
    { id: "uaeswitch", name: "UAE Switch", brand: "UAE SWITCH", kind: "UAE payment network", color: "#087f86" },
    { id: "jaywan", name: "Jaywan", brand: "JAYWAN", kind: "UAE national card scheme", color: "#19885b" },
    { id: "enbd", name: "Emirates NBD", brand: "ENBD", kind: "UAE bank", color: "#c6243b" },
    { id: "adcb", name: "ADCB", brand: "ADCB", kind: "UAE bank", color: "#a50c32" },
    { id: "fab", name: "First Abu Dhabi Bank", brand: "FAB", kind: "UAE bank", color: "#17469b" },
    { id: "dib", name: "Dubai Islamic Bank", brand: "DIB", kind: "UAE bank", color: "#007d55" }
  ];
  function cardFace(name, brand, color, presetId, preview) {
    return '<div class="vc-face' + (preview ? " vc-live" : "") + '"' + (preview ? ' id="vc-live"' : "") + ' style="--vc:' + color + '"><div class="vc-card-top"><span>VIRTUAL CARD</span><i class="vc-chip" aria-hidden="true"></i><svg class="vc-tap" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5a10 10 0 0 0 0 14M12 8a6 6 0 0 0 0 8M16 10a3 3 0 0 0 0 4"/></svg></div><div class="vc-card-number">•••• &nbsp;•••• &nbsp;•••• &nbsp;••••</div><div class="vc-card-bottom"><span class="vc-cardholder"><small>Cardholder</small><b' + (preview ? ' id="vc-live-name"' : "") + '>' + esc(name) + '</b></span><b class="vc-brand vc-brand-' + (presetId || "custom") + '">' + brand + '</b></div></div>';
  }
  function virtualCardMarkup() {
    var presets = VC_PRESETS.slice(0, 2).map(function (p) {
      return '<div class="vc-preset"><button class="vc-choice" type="button" data-act="vc-add" data-k="' + p.id + '" aria-label="Add ' + p.name + ' card">' + cardFace("Hayati Member", p.brand, p.color, p.id) + '<span class="vc-caption"><span><b>' + p.name + '</b><small>' + p.kind + '</small></span><i>Add</i></span></button></div>';
    }).join("");
    var cards = F.virtualCards.map(function (c) {
      var acct = VC_ACCOUNTS.find(function (a) { return a[0] === c.account; });
      var preset = VC_PRESETS.find(function (p) { return p.id === c.preset; });
      return '<div class="vc-preset vc-owned">' + cardFace(c.name, preset ? preset.brand : "H", c.color, preset ? preset.id : "custom") + '<div class="vc-caption"><span><b>' + esc(c.name) + '</b><small>' + (acct ? acct[1] : "Tracked account") + '</small></span><button class="ghost" data-act="vc-remove" data-k="' + c.id + '" aria-label="Remove ' + esc(c.name) + '">Remove</button></div></div>';
    }).join("");
    var more = VC_PRESETS.length - 2;
    return '<div class="vc-section"><div class="vc-head"><h3>Card Library</h3><button class="ghost vc-more" type="button" data-act="vc-more">Show more <span aria-hidden="true">↗</span></button></div><div class="vc-grid">' + presets + cards + '</div><div class="vc-info"><div><span>Global networks</span><b>Visa · Mastercard</b></div><div><span>UAE payments</span><b>UAESWITCH · Jaywan</b></div><div><span>Local issuers</span><b>Emirates NBD · ADCB · FAB · DIB</b></div><div><span>Linkable balances</span><b>Cash · savings · investments · other</b></div><div><span>Your cards</span><b>' + F.virtualCards.length + ' saved</b></div></div></div>';
  }
  function closeCardPicker() {
    var d = document.getElementById("vc-picker"); if (!d || !d.open) return;
    d.classList.add("is-closing"); setTimeout(function () { if (d.open) d.close(); d.classList.remove("is-closing"); }, 180);
  }
  function openCardPicker() {
    var d = document.getElementById("vc-picker");
    if (!d) {
      d = document.createElement("dialog"); d.id = "vc-picker"; d.className = "vc-picker"; d.setAttribute("aria-labelledby", "vc-picker-title");
      d.innerHTML = '<div class="vc-picker-shell"><header class="vc-picker-head"><div><small>HAYATI · CARDS</small><h2 id="vc-picker-title">Choose a card</h2></div><button class="vc-picker-close" type="button" aria-label="Close card picker">×</button></header><p class="vc-picker-sub">Select a network or UAE card style to add.</p><div class="vc-picker-grid"></div><p class="vc-picker-foot">Card designs are local trackers; no bank connection is made.</p></div>';
      document.body.appendChild(d);
      d.querySelector(".vc-picker-close").addEventListener("click", closeCardPicker);
      d.addEventListener("click", function (e) { if (e.target === d) closeCardPicker(); });
    }
    d.querySelector(".vc-picker-grid").innerHTML = VC_PRESETS.slice(2).map(function (p) {
      return '<button class="vc-picker-choice" type="button" data-act="vc-select" data-k="' + p.id + '">' + cardFace("Hayati Member", p.brand, p.color, p.id) + '<span class="vc-picker-caption"><b>' + p.name + '</b><small>' + p.kind + '</small><i aria-hidden="true">＋</i></span></button>';
    }).join("");
    d.showModal();
    var cur = document.getElementById("cur");
    if (cur && cur.showPopover && cur.hasAttribute("popover") && cur.matches(":popover-open")) try { cur.hidePopover(); cur.showPopover(); } catch (e) {}
    var firstChoice = d.querySelector(".vc-picker-choice"); if (firstChoice) firstChoice.focus({ preventScroll: true });
  }
  function openVirtualCardForm(presetId) {
    var preset = VC_PRESETS.find(function (p) { return p.id === presetId; }) || VC_PRESETS[0];
    var fields = [
      { name: "name", label: "Card name", type: "text", required: true, maxlength: 32, value: preset.name, placeholder: "e.g. Everyday spending" },
      { name: "color", label: "Card color", type: "select", value: preset.color, options: VC_COLORS.map(function (c, i) { return [c, (["Midnight", "Violet", "Blue", "Teal", "Green", "Gold", "Orange", "Red", "Pink"][i] || "Card finish " + (i + 1))]; }) },
      { name: "account", label: "Link to tracked account", type: "select", value: "cash", options: VC_ACCOUNTS.map(function (a) { return [a[0], a[1] + " · " + money(F.assets[a[0]] || 0)]; }) }
    ];
    openForm("Create a virtual card", fields, function (v) {
      if (!v.name.trim()) throw new Error("Give your card a name.");
      F.virtualCards.push({ id: uid(), preset: preset.id, name: v.name.trim(), color: VC_COLORS.indexOf(v.color) >= 0 ? v.color : preset.color, account: v.account });
      save(); return "Virtual card created.";
    }, "Create card");
    var fieldsEl = document.getElementById("flds");
    fieldsEl.insertAdjacentHTML("afterbegin", cardFace("Hayati Member", preset.brand, preset.color, preset.id, true) + '<p class="vc-note">Preview only. This does not issue a payment card or add it to Apple Wallet.</p>');
  }
  function updateVirtualPreview() {
    var box = document.getElementById("vc-live"); if (!box) return;
    var name = document.querySelector('#flds input[name="name"]'), color = document.querySelector('#flds select[name="color"]');
    document.getElementById("vc-live-name").textContent = name && name.value.trim() || "Hayati Member";
    box.style.setProperty("--vc", color && color.value || VC_COLORS[0]);
  }

  
  function sim(debts, extra, strat) {
    var ds = debts.filter(function (d) { return d.bal > 0; }).map(function (d) { return { id: d.id, n: d.n, b: d.bal, r: d.apr / 1200, p: d.pay }; });
    var months = 0, interest = 0, order = [], paidAt = {};
    while (ds.some(function (d) { return d.b > 0.005; }) && months < 600) {
      months++;
      var pool = extra;
      ds.forEach(function (d) { if (d.b > 0) { var i = d.b * d.r; d.b += i; interest += i; } });
      ds.forEach(function (d) { if (d.b > 0.005) { d.b -= Math.min(d.p, d.b); } else pool += d.p; });
      if (strat !== "min") {
        var act = ds.filter(function (d) { return d.b > 0.005; }).sort(strat === "avalanche" ? function (a, b) { return b.r - a.r; } : function (a, b) { return a.b - b.b; });
        for (var k = 0; k < act.length && pool > 0; k++) { var pay = Math.min(pool, act[k].b); act[k].b -= pay; pool -= pay; }
      }
      ds.forEach(function (d) { if (d.b <= 0.005 && paidAt[d.id] === undefined) { d.b = 0; paidAt[d.id] = months; order.push(d); } });
    }
    return { months: months, interest: interest, order: order, paidAt: paidAt, done: !ds.some(function (d) { return d.b > 0.005; }) };
  }
  var after = function (m) { var d = new Date(); d.setMonth(d.getMonth() + m); return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" }); };
  var dPay = function () { return F.debts.filter(function (d) { return d.bal > 0; }).reduce(function (a, d) { return a + d.pay; }, 0); };
  var billsM = function () { return F.bills.reduce(function (a, b) { return a + (b.f === "y" ? b.amt / 12 : b.amt); }, 0); };
  var assetsT = function () { var a = F.assets; return a.cash + a.savings + a.invest + a.gold + a.other; };
  var liab = function () { return F.debts.reduce(function (a, d) { return a + d.bal; }, 0); };
  function dueInfo(b) {
    var t = new Date(TODAY + "T00:00"), y = t.getFullYear(), m = t.getMonth();
    var mk = function (yy, mm) { return new Date(yy, mm, Math.min(b.day, new Date(yy, mm + 1, 0).getDate())); }, d, key;
    if (b.f === "m") { d = mk(y, m); key = b.id + ":" + y + "-" + pad(m + 1); if (F.paid[key]) d = mk(y, m + 1); }
    else { d = mk(y, (b.mo || 1) - 1); key = b.id + ":" + y; if (F.paid[key]) d = mk(y + 1, (b.mo || 1) - 1); }
    return { d: d, iso: isoD(d), days: Math.round((d - t) / 864e5), key: key, paid: !!F.paid[key] };
  }
  function health() {
    var inc = F.income || 0, pay = dPay(), dbr = inc ? pay / inc * 100 : 0;
    var ess = billsM() + pay + ((st.limits && st.limits.groceries) || 0), months = ess ? (F.assets.cash + F.assets.savings) / ess : 0;
    var prev = H.monthSummary(st, shiftMonth(month, -1)).spent || H.monthSummary(st, month).spent || 0;
    var rate = inc ? (prev ? (inc - prev) / inc : 0.1) : 0;
    var cards = F.debts.filter(function (d) { return d.t === "card" && d.limit; }), lim = cards.reduce(function (a, d) { return a + d.limit; }, 0), used = cards.reduce(function (a, d) { return a + d.bal; }, 0), util = lim ? used / lim : 0;
    var dueNow = F.bills.filter(function (b) { return b.f === "m" && b.day <= +TODAY.slice(8); }), paidNow = dueNow.filter(function (b) { return F.paid[b.id + ":" + TODAY.slice(0, 7)]; });
    var P = [
      { k: "dbr", label: "Debt load", max: 25, pts: 25 * (1 - clamp((dbr - 30) / 20)), tip: "Debt payments are " + Math.round(dbr) + "% of income. Aim for under 30%. Pay the highest-interest debt first." },
      { k: "em", label: "Emergency fund", max: 25, pts: 25 * clamp(months / 6), tip: "Your savings cover " + months.toFixed(1) + " months of essentials. Build toward 6." },
      { k: "sav", label: "Savings rate", max: 20, pts: 20 * clamp(rate / 0.2), tip: "You keep about " + Math.round(Math.max(0, rate) * 100) + "% of income. Aim for 20%." },
      { k: "util", label: "Card use", max: 15, pts: 15 * (1 - clamp((util - 0.3) / 0.5)), tip: "Cards are " + Math.round(util * 100) + "% used. Keep it under 30% and pay in full." },
      { k: "bill", label: "Bills on time", max: 15, pts: dueNow.length ? 15 * paidNow.length / dueNow.length : 15, tip: "Mark each bill as paid so nothing slips. Late fees add up." }];
    var score = Math.round(P.reduce(function (a, p) { return a + p.pts; }, 0));
    return { score: score, parts: P, dbr: dbr, months: months, ess: ess, label: score >= 80 ? "Strong" : score >= 60 ? "Good" : score >= 40 ? "Needs attention" : "At risk" };
  }

  
  var ask2 = function (cls, chips, line) { return askCard(cls, chips, line); };
  function debtsPanel() {
    var inc = F.income, pay = dPay(), dbr = inc ? pay / inc * 100 : 0, total = liab();
    var rows = F.debts.map(function (d) {
      var r = sim([d], 0, "min"), prog = d.orig ? clamp(1 - d.bal / d.orig) : 0, u = d.t === "card" && d.limit ? d.bal / d.limit : null;
      return '<div class="row"><div class="rt"><span class="grow">' + esc(d.n) + ' <span class="tag">' + DT[d.t] + "</span></span><b>" + aed(d.bal) + "</b></div>" + bar(Math.round(prog * 100)) +
        '<div class="bm"><span>' + d.apr + "% APR · " + aed(d.pay) + " a month · due day " + d.day + "</span><span>" + (d.bal <= 0 ? "Paid off" : r.done ? "Free by " + after(r.months) : '<b class="bad">Payment too low</b>') + "</span></div>" +
        (u !== null ? '<div class="bm"><span>Card use ' + Math.round(u * 100) + "% of " + aed(d.limit) + '</span><span class="' + (u > 0.3 ? "bad" : "") + '">' + (u > 0.3 ? "Above the 30% guide" : "Healthy") + "</span></div>" : "") +
        '<div class="acts"><button class="btn sm" data-act="debt-pay" data-k="' + d.id + '">Record payment</button><button class="ghost" data-act="debt-edit" data-k="' + d.id + '">Edit</button><button class="ghost" data-act="debt-del" data-k="' + d.id + '" aria-label="Remove ' + esc(d.n) + '">Remove</button></div></div>';
    }).join("") || '<p class="empty">No debts recorded. That is great news, or add one to track it.</p>';
    var A = 251.33, zones = [[0, 0.5, "#3FBF9C"], [0.5, 1 / 6, "#E8B765"], [2 / 3, 1 / 6, "#EF9A5B"], [5 / 6, 1 / 6, "#D9534F"]];
    var gauge = '<svg class="gauge" viewBox="0 0 200 120" role="img" aria-label="Debt to income ' + Math.round(dbr) + ' percent">' + zones.map(function (z) { return '<path d="M20 100A80 80 0 0 1 180 100" fill="none" stroke="' + z[2] + '" stroke-width="14" stroke-dasharray="' + (z[1] * A - 2).toFixed(1) + " " + A + '" stroke-dashoffset="' + (-z[0] * A).toFixed(1) + '"/>'; }).join("") +
      '<g class="nd" style="--a:' + (-90 + clamp(dbr / 60) * 180).toFixed(1) + 'deg"><path d="M100 100L100 38" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="100" cy="100" r="7" fill="currentColor"/></g></svg>';
    var zl = dbr <= 30 ? "Comfortable" : dbr <= 40 ? "Watch it" : dbr <= 50 ? "Stretched" : "Over the 50% cap";
    var activeDebts = F.debts.filter(function (d) { return d.bal > 0 && d.pay > 0; }).sort(function (a, b) { return b.pay - a.pay; });
    var paymentItems = activeDebts.slice(0, 3).map(function (d, i) {
      return { n: d.n, pay: d.pay, c: ["#9f8fe0", "#7fcdb7", "#e8b765"][i] };
    });
    if (activeDebts.length > 3) paymentItems.push({ n: "Other debts", pay: activeDebts.slice(3).reduce(function (n, d) { return n + d.pay; }, 0), c: "#ef9a5b" });
    var paymentBreakdown = '<section class="card debt-breakdown"><div class="db-head"><div><span class="db-kicker">Payment mix</span><h3>Monthly by debt</h3></div><b>' + aed(pay) + '</b></div><div class="db-items">' +
      (paymentItems.length ? paymentItems.map(function (d) {
        return '<div class="db-item"><div class="db-label"><span>' + esc(d.n) + '</span><b>' + aed(d.pay) + '</b></div><div class="db-track"><i style="--w:' + (pay ? Math.min(100, d.pay / pay * 100) : 0).toFixed(1) + '%;--c:' + d.c + '"></i></div></div>';
      }).join("") : '<p class="db-empty">Add a monthly payment to see your breakdown.</p>') + '</div><p class="db-foot">Share of your total monthly debt payments</p></section>';
    return '<div class="debt-overview c12"><section class="card debt-list"><h3>Loans and debts <em>' + aed(total) + " owed</em></h3>" + rows + '<div class="acts"><button class="btn sm" data-act="debt-add">+ Add a debt</button></div></section>' +
      '<div class="debt-insights"><section class="card center dti-card"><h3>Debt-to-income <em>' + zl + "</em></h3>" + gauge + '<div class="big" style="margin:-6px 0 6px">' + cn(dbr, "").replace("AED ", "").replace('data-pre="AED "', 'data-pre=""').replace('data-suf=""', 'data-suf="%"') + "</div>" +
      '<p class="ss">' + money(pay) + " of " + money(inc) + " goes to debt every month. UAE banks generally cap total debt payments at 50% of income, and under 30% is comfortable.</p>" +
      '<div class="acts" style="justify-content:center"><button class="ghost" data-act="income">Set monthly income</button></div></section>' + paymentBreakdown + '</div></div>' +
      '<section class="card c12"><h3>Payoff planner <em>Find your debt-free date</em></h3><div class="plan-top"><label for="extra">Extra you can add each month: <b id="extraV">' + money(F.extra) + '</b></label><input type="range" id="extra" min="0" max="5000" step="100" value="' + F.extra + '" aria-label="Extra monthly payment"></div><div id="planOut"></div></section>' +
      ask2("c12", [["Which debt first?", "Which of my debts should I pay off first and why?"], ["Is this loan worth it?", "How do I know if a car loan is worth it?"], ["Escape card interest", "How do I stop paying 36% credit card interest?"]], "Hayati explains the strategy in plain words. Your numbers here stay on this device.");
  }
  function plannerOut() {
    var ex = F.extra || 0, m = sim(F.debts, 0, "min"), s = sim(F.debts, ex, "snowball"), a = sim(F.debts, ex, "avalanche"), best = a.interest <= s.interest ? "avalanche" : "snowball";
    var col = function (title, r, key, note) {
      var saved = m.done && r.done ? m.interest - r.interest : null;
      return '<div class="cmp' + (key === best ? " best" : "") + '">' + (key === best ? '<span class="badge">Saves the most</span>' : "") + "<h4>" + title + '</h4><div class="big">' + (r.done ? after(r.months) : "Never") + '</div><p class="ss">' + (r.done ? "Debt-free in " + Math.floor(r.months / 12) + "y " + r.months % 12 + "m" : "Payments do not cover interest") + "</p><dl><dt>Total interest</dt><dd>" + (r.done ? money(r.interest) : "n/a") + "</dd><dt>You save</dt><dd>" + (saved === null ? "n/a" : money(saved)) + "</dd></dl><p class=\"ss\">" + note + "</p></div>";
    };
    var chosen = best === "avalanche" ? a : s, mx = Math.max.apply(null, chosen.order.map(function (d) { return chosen.paidAt[d.id]; }).concat([1]));
    var tl = chosen.order.map(function (d, i) { return '<div class="po"><span>' + (i + 1) + ". " + esc(d.n) + '</span><div class="bar"><i class="bf" style="--w:' + (chosen.paidAt[d.id] / mx * 100).toFixed(0) + '%"></i></div><b>' + after(chosen.paidAt[d.id]) + "</b></div>"; }).join("");
    $("#planOut").innerHTML = '<div class="cmps">' + col("Minimum only", m, "min", "What happens if you change nothing.") + col("Snowball", s, "snowball", "Smallest balance first. Quick wins keep you motivated.") + col("Avalanche", a, "avalanche", "Highest interest first. Cheapest overall.") + "</div>" + (tl ? '<h3 class="sub">Payoff order with ' + (best === "avalanche" ? "avalanche" : "snowball") + "</h3>" + tl : "");
  }
  function billsPanel(includeAsk) {
    var info = F.bills.map(function (b) { return { b: b, i: dueInfo(b) }; }).sort(function (x, y) { return x.i.d - y.i.d; });
    var monthly = billsM(), soon = info.filter(function (x) { return !x.i.paid && x.i.days <= 7; }), soonT = soon.reduce(function (a, x) { return a + x.b.amt; }, 0);
    var dueNow = F.bills.filter(function (b) { return b.f === "m"; }), paidN = dueNow.filter(function (b) { return F.paid[b.id + ":" + TODAY.slice(0, 7)]; }).length;
    var rows = info.map(function (x) {
      var b = x.b, i = x.i, c = BC[b.cat] || BC.other, st2 = i.paid ? '<span class="tag ok">Paid</span>' : i.days < 0 ? '<span class="tag bad">Overdue</span>' : i.days === 0 ? '<span class="tag warn">Due today</span>' : '<span class="tag">In ' + i.days + " days</span>";
      return '<div class="xp bill-row" style="--bill-color:' + c[1] + '">' + tile(i.iso, c[1]) + '<div class="xn"><b>' + esc(b.n) + "</b><span>" + c[0] + " · " + (b.f === "y" ? "yearly" : "monthly") + " · " + st2 + '</span></div><span class="xa">' + aed(b.amt) + '</span><span class="acts bill-actions" style="margin:0">' +
        (i.paid ? '<button class="ghost" data-act="bill-undo" data-k="' + b.id + '">Undo</button>' : '<button class="btn sm" data-act="bill-paid" data-k="' + b.id + '">Mark paid</button>') + '<button class="del" data-act="bill-del" data-k="' + b.id + '" aria-label="Delete ' + esc(b.n) + '">' + X + "</button></span></div>";
    }).join("") || '<p class="empty">No bills yet. Add rent, DEWA, school fees and subscriptions.</p>';
    var byCat = {}; F.bills.forEach(function (b) { byCat[b.cat] = (byCat[b.cat] || 0) + (b.f === "y" ? b.amt / 12 : b.amt); });
    var cats = Object.keys(byCat).sort(function (a, b) { return byCat[b] - byCat[a]; }), yearly = F.bills.filter(function (b) { return b.f === "y"; }).reduce(function (a, b) { return a + b.amt; }, 0);
    var catMax = cats.length ? byCat[cats[0]] : 0;
    var catChart = cats.map(function (k) { var category = BC[k] || BC.other; return '<div class="bill-cat-row"><div class="bill-cat-top"><span><i style="--cat-color:' + category[1] + '"></i>' + esc(category[0]) + '</span><b>' + money(byCat[k]) + '</b></div><div class="bill-cat-track"><i style="--w:' + (catMax ? byCat[k] / catMax * 100 : 0).toFixed(1) + '%;--cat-color:' + category[1] + '"></i></div></div>'; }).join("");
    var paidPct = dueNow.length ? Math.round(paidN / dueNow.length * 100) : 0;
    return `<div class="bill-overview"><section class="card bill-schedule"><h3>Upcoming bills <em>${paidN} of ${dueNow.length} monthly paid</em></h3><div class="bill-summary"><div><span>Due in 7 days</span><b>${money(soonT)}</b><small>${soon.length} ${soon.length === 1 ? "bill" : "bills"}</small></div><div><span>Monthly paid</span><b>${paidPct}%</b><small>${paidN} of ${dueNow.length} bills</small></div></div><div class="bill-paid-track" role="img" aria-label="${paidPct}% of monthly bills paid"><i style="--w:${paidPct}%"></i></div>${rows}<div class="acts"><button class="btn sm" data-act="bill-add">+ Add a bill</button></div></section>` +
      '<section class="card c5 bill-costs"><h3>Fixed costs</h3><div class="big">' + cn(monthly) + "<small>a month</small></div>" +
      (cats.length ? '<div class="bill-cat-chart" role="img" aria-label="Monthly fixed costs by category">' + catChart + '</div>' : '<p class="empty">Add bills to see your monthly cost breakdown.</p>') +
      (yearly ? '<div class="bill-reserve"><span>Yearly bill reserve</span><b>' + money(yearly / 12) + ' / month</b><small>Set aside monthly for ' + money(yearly) + ' in annual bills</small></div>' : '') + "</section></div>" +
      (includeAsk === false ? "" : ask2("c12", [["Cut my bills", "Which of my regular bills could I reduce?"], ["Plan school fees", "Help me plan for school fees across the year."]], "Hayati can suggest where fixed costs can be trimmed."));
  }
  var CHK = ["Health insurance for every family member (mandatory in Dubai and Abu Dhabi)", "Emergency fund of 3 to 6 months of essentials", "Life cover for every earner", "A registered will, so your family is protected", "Credit cards paid in full each month", "Know your end-of-service gratuity", "A retirement and long-term investing plan", "Renewals (Emirates ID, visa, car, insurance) saved in the calendar"];
  function wealthPanel(includeAsk) {
    var h = health(), A = assetsT(), L = liab(), nw = A - L, a = F.assets;
    var parts = h.parts.map(function (p) { return '<div class="row" style="padding:10px 0"><div class="rt"><span class="grow">' + p.label + "</span><span class=\"ss\">" + Math.round(p.pts) + " / " + p.max + "</span></div>" + bar(Math.round(p.pts / p.max * 100), p.pts / p.max < 0.4) + "</div>"; }).join("");
    var worst = h.parts.slice().sort(function (x, y) { return x.pts / x.max - y.pts / y.max; })[0];
    var assetsRows = [["Cash", a.cash], ["Savings", a.savings], ["Investments", a.invest], ["Gold", a.gold], ["Property and other", a.other]].map(function (r) { return '<div class="legend" style="margin-bottom:8px"><div><span>' + r[0] + "</span><span>" + money(r[1]) + "</span></div></div>"; }).join("");
    var em = clamp(h.months / 6), done = CHK.filter(function (_, i) { return F.chk[i]; }).length;
    var healthCard = '<section class="card center"><h3>Financial health <em>' + h.label + '</em></h3><div class="rw"><svg class="ring" viewBox="0 0 160 160" aria-hidden="true"><defs><linearGradient id="rg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9f8fe0"/><stop offset="1" stop-color="#7fe0c3"/></linearGradient></defs><circle class="rt0" cx="80" cy="80" r="68"/><circle class="rf" stroke="url(#rg2)" cx="80" cy="80" r="68" style="--p:' + h.score + '"/></svg><div class="rc"><b>' + '<span class="cn" data-n="' + h.score + '" data-pre="" data-suf="">0</span></b><small>out of 100</small></div></div><div style="text-align:left">' + parts + '</div><div class="alert' + (h.score >= 70 ? " ok" : "") + '" style="text-align:left"><b>Biggest win:</b> ' + worst.tip + "</div></section>";
    var netWorthCard = '<section class="card"><h3>Net worth <em>' + (F.sample ? "Sample numbers" : "Assets minus debts") + '</em></h3><div class="big ' + (nw < 0 ? "negw" : "") + '">' + cn(Math.abs(nw)).replace("AED 0", (nw < 0 ? "-" : "") + "AED 0") + "</div>" +
      '<div class="split" role="img" aria-label="Assets versus debts"><i style="--f:' + A + ';background:linear-gradient(90deg,#9f8fe0,#7fe0c3)"></i><i style="--f:' + L + ';background:linear-gradient(90deg,#f0a07a,#d9534f)"></i></div><div class="bm"><span>Assets ' + money(A) + '</span><span>Debts ' + money(L) + '</span></div>' +
      '<div style="margin-top:18px">' + assetsRows + '</div><div class="acts"><button class="btn sm" data-act="assets">Update my assets</button></div></section>';
    var emergencyCard = '<section class="card"><h3>Emergency fund <em>' + h.months.toFixed(1) + ' months covered</em></h3><div class="meter"><i class="mf" style="--w:' + (em * 100).toFixed(0) + '%"></i><b style="left:50%"></b></div><div class="bm"><span>0</span><span>3 months</span><span>6 months</span></div><p class="ss" style="margin-top:14px">Essentials come to about <b>' + money(h.ess) + "</b> a month (bills, debt payments and groceries). " + (h.months >= 6 ? "You are fully covered." : "A 6-month cushion is <b>" + money(h.ess * 6) + "</b>. You are " + money(Math.max(0, h.ess * 6 - (a.cash + a.savings))) + " away.") + "</p></section>";
    var checklistCard = '<section class="card"><h3>Every adult should <em>' + done + " of " + CHK.length + '</em></h3><div class="chk">' + CHK.map(function (t, i) { return '<label class="ck"><input type="checkbox" data-act="chk" data-k="' + i + '"' + (F.chk[i] ? " checked" : "") + "><span>" + t + "</span></label>"; }).join("") + "</div></section>";
    return '<div class="wealth-overview"><div class="wealth-column">' + healthCard + emergencyCard + '</div><div class="wealth-column">' + netWorthCard + checklistCard + '</div></div>' +
      (includeAsk === false ? "" : ask2("c12", [["Raise my score", "How can I raise my financial health score fastest?"], ["Build an emergency fund", "Make a plan to build a 6-month emergency fund."]], "Your score uses debts, savings, cards, bills and spending."));
  }
  function billsWealthPanel() {
    return billsPanel(false) + wealthPanel(false) + ask2("c12", [["Improve my finances", "What should I focus on first to improve my family's finances?"], ["Plan for upcoming costs", "Help me plan for upcoming bills and build a stronger emergency fund."]], "Bills, assets, debts and financial health in one place.");
  }
  function toolsPanel() {
    var fld = function (id, label, val, step) { return '<label class="fld" for="' + id + '">' + label + '<input id="' + id + '" data-calc type="number" min="0" step="' + (step || "any") + '" inputmode="decimal" value="' + val + '"></label>'; };
    return '<section class="card tool-card c7"><h3>Loan calculator <em>Cars, personal loans, mortgages</em></h3><div class="two">' + fld("lc-a", "Loan amount (AED)", 80000) + fld("lc-r", "Interest rate (% a year)", 5.2) + fld("lc-y", "Years", 4, "0.5") + fld("lc-x", "Extra each month (AED)", 0) + '</div><div class="out" id="lc-o"></div></section>' +
      '<section class="card tool-card c5"><h3>End-of-service gratuity <em>UAE estimate</em></h3><div class="two">' + fld("eg-s", "Basic monthly salary (AED)", 12000) + fld("eg-y", "Years of service", 6.5, "0.1") + '</div><div class="out" id="eg-o"></div><p class="ss" style="margin-top:12px">Simplified: 21 days of basic pay per year for the first 5 years, 30 days after, capped at 2 years of pay. Your contract and MOHRE have the final say.</p></section>' +
      '<section class="card c12"><h3>Zakat calculator <em>2.5% of wealth held a full lunar year</em></h3><div class="two three">' + fld("zk-c", "Cash and savings (AED)", F.assets.cash + F.assets.savings) + fld("zk-i", "Investments (AED)", F.assets.invest) + fld("zk-g", "Gold you own (grams)", 60) + fld("zk-p", "Gold price (AED per gram)", F.gold) + fld("zk-o", "Other zakatable wealth (AED)", 0) + fld("zk-d", "Debts due this year (AED)", 0) + '</div><div class="out" id="zk-o2"></div><p class="ss" style="margin-top:12px">The nisab is 85 grams of gold. Enter today\'s gold price for an accurate figure, and ask a scholar for special cases.</p></section>' +
      ask2("c12", [["Explain gratuity", "Explain how end-of-service gratuity works in the UAE."], ["Should I pay debt or invest?", "Should I pay off debt or invest first?"]], "General guidance only, not financial advice.");
  }
  function calcs() {
    var g = function (id) { var e = document.getElementById(id); return e ? Math.max(0, parseFloat(e.value) || 0) : null; };
    if (g("lc-a") !== null) {
      var P = g("lc-a"), r = g("lc-r") / 1200, n = Math.max(1, Math.round(g("lc-y") * 12)), x = g("lc-x"), p = r ? P * r / (1 - Math.pow(1 + r, -n)) : P / n, tot = p * n;
      var b = P, m = 0, it = 0; while (b > 0.5 && m < 1200) { var i = b * r; it += i; b = b + i - Math.min(b + i, p + x); m++; }
      $("#lc-o").innerHTML = '<div class="kv"><span>Monthly payment</span><b>' + money(p) + '</b></div><div class="kv"><span>Total interest</span><b>' + money(tot - P) + '</b></div><div class="kv"><span>Total you will pay</span><b>' + money(tot) + "</b></div>" + (x ? '<div class="kv good"><span>With the extra: done in ' + Math.floor(m / 12) + "y " + m % 12 + 'm</span><b>Saves ' + money(Math.max(0, tot - P - it)) + "</b></div>" : "") + (F.income ? '<div class="kv"><span>Adds to debt-to-income</span><b>+' + Math.round(p / F.income * 100) + "% (now " + Math.round((dPay() + p) / F.income * 100) + "%)</b></div>" : "");
    }
    if (g("eg-s") !== null) {
      var S = g("eg-s"), Y = g("eg-y"), days = Y < 1 ? 0 : Math.min(Y, 5) * 21 + Math.max(0, Y - 5) * 30, amt = Math.min(S / 30 * days, S * 24);
      $("#eg-o").innerHTML = '<div class="big" style="margin:0 0 10px">' + money(amt) + '</div><div class="kv"><span>Days of pay earned</span><b>' + days.toFixed(0) + '</b></div><div class="kv"><span>Daily wage</span><b>' + money(S / 30) + "</b></div>" + (Y < 1 ? '<p class="ss">Gratuity starts after 1 year of service.</p>' : S / 30 * days > S * 24 ? '<p class="ss">The 2-year cap applies.</p>' : "");
    }
    if (g("zk-c") !== null) {
      var price = g("zk-p"); if (price) { F.gold = price; save(); }
      var w = g("zk-c") + g("zk-i") + g("zk-g") * price + g("zk-o") - g("zk-d"), nis = 85 * price, due = w >= nis && nis > 0 ? w * 0.025 : 0;
      $("#zk-o2").innerHTML = '<div class="kv"><span>Zakatable wealth</span><b>' + money(Math.max(0, w)) + '</b></div><div class="kv"><span>Nisab (85 g gold)</span><b>' + money(nis) + '</b></div><div class="kv ' + (due ? "good" : "") + '"><span>' + (due ? "Zakat due" : "Below the nisab, no zakat due") + "</span><b>" + money(due) + "</b></div>";
    }
  }

  
  var num = function (v, name, min) { var n = parseFloat(v); if (isNaN(n) || n < (min || 0)) throw new Error("Enter a valid " + name + "."); return n; };
  function debtForm(d) {
    d = d || {};
    openForm(d.id ? "Edit debt" : "Add a debt", [
      { name: "n", label: "Name", type: "text", required: true, maxlength: 40, value: d.n || "", placeholder: "e.g. Car loan" },
      { name: "t", label: "Type", type: "select", value: d.t || "loan", options: Object.keys(DT).map(function (k) { return [k, DT[k]]; }) },
      { name: "bal", label: "Amount still owed (AED)", type: "number", required: true, value: d.bal === undefined ? "" : d.bal },
      { name: "apr", label: "Interest rate (% a year, 0 if none)", type: "number", required: true, value: d.apr === undefined ? "" : d.apr },
      { name: "pay", label: "Monthly payment (AED)", type: "number", required: true, value: d.pay === undefined ? "" : d.pay },
      { name: "limit", label: "Credit limit (cards only, optional)", type: "number", value: d.limit || "" },
      { name: "day", label: "Due day of the month", type: "number", max: 31, required: true, value: d.day || 1 }], function (v) {
      if (!v.n.trim()) throw new Error("Give the debt a name.");
      var o = { n: v.n.trim(), t: v.t, bal: num(v.bal, "amount"), apr: num(v.apr, "rate"), pay: num(v.pay, "payment"), limit: v.limit ? num(v.limit, "limit") : 0, day: clamp(Math.round(num(v.day, "day", 1)), 1, 31, 1) };
      if (d.id) { Object.assign(F.debts.find(function (x) { return x.id === d.id; }), o); } else { o.id = uid(); o.orig = o.bal; F.debts.push(o); }
      F.sample = false; save(); return d.id ? "Debt updated." : "Debt added.";
    });
  }
  function billForm() {
    openForm("Add a bill", [
      { name: "n", label: "Name", type: "text", required: true, maxlength: 40, placeholder: "e.g. School fees" },
      { name: "amt", label: "Amount (AED)", type: "number", required: true },
      { name: "f", label: "How often", type: "select", value: "m", options: [["m", "Every month"], ["y", "Once a year"]] },
      { name: "day", label: "Due day of the month", type: "number", max: 31, required: true, value: 1 },
      { name: "mo", label: "Month (yearly bills only, 1 to 12)", type: "number", max: 12, value: "" },
      { name: "cat", label: "Category", type: "select", value: "home", options: Object.keys(BC).map(function (k) { return [k, BC[k][0]]; }) }], function (v) {
      if (!v.n.trim()) throw new Error("Give the bill a name.");
      var b = { id: uid(), n: v.n.trim(), amt: num(v.amt, "amount"), f: v.f, day: Math.round(num(v.day, "day", 1)), cat: v.cat };
      if (b.f === "y") b.mo = clamp(Math.round(num(v.mo, "month", 1)), 1, 12, 1);
      F.bills.push(b); F.sample = false; save(); return "Bill added.";
    });
  }
  var catKey = function (bc) {
    var ks = Object.entries(H.SPEND), rx = { home: /home|rent|hous/i, utilities: /util|bill|dewa/i, transport: /transp|car|fuel/i, insurance: /insur|health/i, school: /school|educ/i, fun: /fun|enter|leisure|subscr/i }[bc];
    var hit = rx && ks.find(function (e) { return rx.test(e[1][0]) || rx.test(e[0]); }); return hit ? hit[0] : ks[0][0];
  };
  var A2 = {
    "vc-add": function (presetId) { openVirtualCardForm(presetId); },
    "vc-more": function () { openCardPicker(); },
    "vc-select": function (presetId) { closeCardPicker(); setTimeout(function () { openVirtualCardForm(presetId); }, 180); },
    "vc-remove": function (id) { F.virtualCards = F.virtualCards.filter(function (c) { return c.id !== id; }); save(); render(); toast("Virtual card removed."); },
    "debt-add": function () { debtForm(); },
    "debt-edit": function (id) { debtForm(F.debts.find(function (d) { return d.id === id; })); },
    "debt-del": function (id) { var d = F.debts.find(function (x) { return x.id === id; }); F.debts = F.debts.filter(function (x) { return x.id !== id; }); save(); render(); toast("Removed " + d.n + "."); },
    "debt-pay": function (id) {
      var d = F.debts.find(function (x) { return x.id === id; });
      openForm("Payment on " + d.n, [{ name: "amt", label: "Amount paid (AED)", type: "number", required: true, value: d.pay }], function (v) {
        var a = num(v.amt, "amount"); d.bal = Math.max(0, d.bal - a); F.sample = false; save();
        return d.bal ? aed(a) + " paid. " + aed(d.bal) + " to go." : "Fully paid off. Well done!";
      }, "Record payment");
    },
    income: function () { openForm("Monthly household income", [{ name: "amt", label: "Income after tax (AED)", type: "number", required: true, value: F.income || "" }], function (v) { F.income = num(v.amt, "income", 1); F.sample = false; save(); return "Income saved."; }); },
    "bill-add": function () { billForm(); },
    "bill-paid": function (id) {
      var b = F.bills.find(function (x) { return x.id === id; }), i = dueInfo(b); F.paid[i.key] = true; save();
      try { H.addExpense(st, { amt: b.amt, cat: catKey(b.cat), note: "Bill: " + b.n, who: "Noura", d: TODAY, occ: "" }); } catch (e) {}
      render(); toast(b.n + " marked paid and added to Expenses.");
    },
    "bill-undo": function (id) { var b = F.bills.find(function (x) { return x.id === id; }); delete F.paid[dueInfo(b).key]; save(); render(); toast("Marked unpaid. Delete the expense in Expenses if you logged it."); },
    "bill-del": function (id) { F.bills = F.bills.filter(function (x) { return x.id !== id; }); save(); render(); toast("Bill deleted."); },
    assets: function () {
      var a = F.assets; openForm("My assets", ["cash:Cash in hand and current accounts", "savings:Savings and deposits", "invest:Investments", "gold:Gold and jewellery", "other:Property and other"].map(function (s) { var p = s.split(":"); return { name: p[0], label: p[1] + " (AED)", type: "number", value: a[p[0]] }; }), function (v) {
        Object.keys(a).forEach(function (k) { a[k] = num(v[k] === "" ? 0 : v[k], k); }); F.sample = false; save(); return "Assets updated.";
      });
    },
    chk: function (i, el) {  }
  };
  Object.keys(A2).forEach(function (k) { ACTIONS[k] = A2[k]; });
  document.addEventListener("input", function (e) { if (e.target.closest && e.target.closest("#flds") && (e.target.name === "name" || e.target.name === "color")) updateVirtualPreview(); });
  document.addEventListener("change", function (e) { if (e.target.closest && e.target.closest("#flds") && e.target.name === "color") updateVirtualPreview(); });
  document.addEventListener("change", function (e) { var t = e.target; if (t.matches && t.matches('input[data-act="chk"]')) { F.chk[t.dataset.k] = t.checked; save(); var n = CHK.filter(function (_, i) { return F.chk[i]; }).length, h = t.closest(".card").querySelector("h3 em"); if (h) h.textContent = n + " of " + CHK.length; } });
  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.id === "extra") { F.extra = +t.value; save(); document.getElementById("extraV").textContent = money(F.extra); plannerOut(); }
    else if (t.hasAttribute && t.hasAttribute("data-calc")) calcs();
  });

  
  var occasionTab = TABS.splice(TABS.findIndex(function (t) { return t[0] === "occasions"; }), 1)[0];
  TABS.push(["debts", "Debts"], ["bills", "Bills"], occasionTab, ["tools", "Tools"]);
  var PANELS = { debts: debtsPanel, bills: billsWealthPanel, tools: toolsPanel };
  var R0 = render, io;
  function count(el) {
    var n = +el.dataset.n, pre = el.dataset.pre, suf = el.dataset.suf, t0 = performance.now(), reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
    (function f(t) { var k = reduce ? 1 : Math.min(1, (t - t0) / 1400); el.textContent = pre + Math.round(n * (1 - Math.pow(1 - k, 3))).toLocaleString("en-US") + suf; if (k < 1) requestAnimationFrame(f); })(t0);
  }
  function post() {
    var where = Array.prototype.find.call(document.querySelectorAll("#app .card h3"), function (h) { return h.textContent.trim() === "Where the money went"; });
    if (where && !where.parentElement.querySelector(".vc-section")) where.parentElement.insertAdjacentHTML("beforeend", virtualCardMarkup());
    document.querySelectorAll("#app .g12 .card").forEach(function (c, i) { c.classList.add("rv"); c.style.setProperty("--d", i); });
    if (io) io.disconnect();
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; e.target.classList.add("in"); e.target.querySelectorAll(".cn").forEach(count); io.unobserve(e.target); }); }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
    document.querySelectorAll("#app .card.rv").forEach(function (c) { io.observe(c); });
    if (document.getElementById("planOut")) plannerOut();
    calcs();
  }
  render = function () {
    if (role !== "child" && PANELS[tab]) {
      var sum = H.monthSummary(st, month);
      document.body.classList.remove("child"); header(sum); stats(sum); tabbar();
      document.getElementById("app").innerHTML = '<div class="g12' + (tab === "tools" ? " tools-grid" : tab === "budget" ? " budget-grid" : "") + '">' + PANELS[tab](sum) + "</div>";
    } else R0();
    post();
  };
  document.addEventListener("pointermove", function (e) { var c = e.target.closest && e.target.closest(".card"); if (!c) return; var r = c.getBoundingClientRect(); c.style.setProperty("--mx", e.clientX - r.left + "px"); c.style.setProperty("--my", e.clientY - r.top + "px"); });
  var au = [].slice.call(document.querySelectorAll(".au i"));
  addEventListener("scroll", function () { au.forEach(function (a, i) { a.style.marginTop = scrollY * (0.05 + i * 0.03) + "px"; }); }, { passive: true });

  var css = document.createElement("style");
  css.textContent = ".card{overflow:hidden}.card::before{content:'';position:absolute;inset:0;background:radial-gradient(340px circle at var(--mx,50%) var(--my,0%),rgba(255,255,255,.85),transparent 62%);opacity:0;transition:opacity .4s;pointer-events:none}.card:hover::before{opacity:1}.card>*{position:relative}" +
    ".rv{opacity:0;transform:translateY(28px);filter:blur(6px);transition:opacity .9s var(--ease),transform .9s var(--ease),filter .9s var(--ease);transition-delay:calc(var(--d,0)*80ms)}.rv.in{opacity:1;transform:none;filter:none}" +
    ".rv:not(.in) .bf,.rv:not(.in) .jar::before{animation:none;transform:scaleX(0)}.rv.in .bf{animation:grow 1.1s var(--ease) .25s both}.rf{transition:stroke-dashoffset 1.8s var(--ease) .2s}.rv:not(.in) .rf{stroke-dashoffset:427.3}" +
    ".tag{display:inline-block;font-size:11px;padding:1px 9px;border-radius:99px;background:rgba(0,0,0,.06);color:#55555c;font-weight:500}.tag.ok{background:rgba(63,191,156,.16);color:#1f6f58}.tag.bad{background:rgba(217,83,79,.12);color:#b13d39}.tag.warn{background:rgba(232,183,101,.2);color:#8a6420}" +
    ".gauge{width:min(100%,300px);display:block;margin:0 auto}.nd{color:var(--ink);transform:rotate(-90deg);transform-origin:100px 100px;transition:transform 1.8s cubic-bezier(.3,1.3,.4,1) .3s}.rv.in .nd{transform:rotate(var(--a))}" +
    ".plan-top{display:grid;gap:10px;margin-bottom:18px;font-size:14px}.plan-top input{width:100%;accent-color:#9f8fe0}.cmps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}@media(max-width:820px){.cmps{grid-template-columns:1fr}}" +
    ".cmp{position:relative;padding:20px;border-radius:20px;background:rgba(255,255,255,.55);box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)}.cmp.best{box-shadow:inset 0 0 0 1.5px #9f8fe0;background:rgba(159,143,224,.1)}.cmp h4{font:500 13px 'Manrope';color:var(--mut);margin-bottom:6px}.cmp .big{margin:0 0 4px}.cmp dl{display:grid;grid-template-columns:1fr auto;gap:6px 10px;margin:14px 0;font-size:13px}.cmp dd{font-weight:600;text-align:right}.badge{position:absolute;top:-10px;right:14px;font-size:11px;font-weight:600;padding:3px 10px;border-radius:99px;background:#9f8fe0;color:#fff}" +
    ".sub{font:500 13px 'Manrope';color:var(--mut);margin:22px 0 10px}.po{display:grid;grid-template-columns:minmax(110px,170px) 1fr 80px;gap:14px;align-items:center;font-size:13px;margin-bottom:10px}.po .bar{margin:0}.po .bf{background:#7e829c}.po b{text-align:right;font-weight:600}" +
    ".split{display:flex;height:14px;border-radius:9px;overflow:hidden;gap:2px;margin:6px 0 8px}.split i{flex:var(--f) 1 0;transition:flex 1s var(--ease)}.negw{color:var(--red)}" +
    ".debt-overview{grid-column:span 12;display:grid;grid-template-columns:minmax(0,7fr) minmax(300px,5fr);gap:16px;align-items:stretch}.debt-list{min-width:0}.debt-insights{min-width:0;display:flex;flex-direction:column;gap:16px;align-self:stretch}.dti-card{flex:none}.debt-breakdown{flex:1;min-height:200px;display:flex;flex-direction:column;text-align:left}.db-head,.db-label{display:flex;justify-content:space-between;align-items:center;gap:10px}.db-head{margin-bottom:9px;color:var(--mut);font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase}.db-head h3{margin:3px 0 0;color:var(--ink);font:600 19px/1.15 'Manrope';letter-spacing:-.03em;text-transform:none}.db-head b,.db-label b{color:var(--ink);font-size:12px;letter-spacing:0}.db-kicker{font-size:10px;color:var(--mut)}.db-items{display:flex;flex:1;flex-direction:column;justify-content:space-evenly;gap:10px;padding-top:8px}.db-label{margin-bottom:5px;font-size:12px}.db-label span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.db-track{height:7px;border-radius:99px;background:rgba(0,0,0,.06);overflow:hidden}.db-track i{display:block;width:var(--w);height:100%;border-radius:inherit;background:var(--c)}.db-foot{margin-top:12px;padding-top:10px;border-top:1px solid var(--rule);color:var(--mut);font-size:11px}.db-empty{align-self:center;margin:auto 0;color:var(--mut);font-size:12px}@media(max-width:760px){.debt-overview{grid-template-columns:minmax(0,1fr)}.debt-insights{align-self:auto}.debt-breakdown{min-height:190px}}" +
    ".meter{position:relative;height:14px;border-radius:9px;background:rgba(0,0,0,.07);overflow:hidden;margin-top:6px}.mf{display:block;height:100%;width:var(--w);border-radius:9px;background:linear-gradient(90deg,#f0a07a,#e8b765,#7fe0c3);transform-origin:left;animation:grow 1.2s var(--ease) .3s both}.rv:not(.in) .mf{animation:none;transform:scaleX(0)}.meter b{position:absolute;top:0;bottom:0;width:2px;background:rgba(0,0,0,.35)}" +
    ".chk{display:grid;gap:4px}.ck{display:flex;gap:12px;align-items:flex-start;padding:9px 6px;border-radius:12px;font-size:14px;line-height:1.4}.ck:hover{background:rgba(0,0,0,.04)}.ck input{appearance:none;flex:none;width:22px;height:22px;margin-top:1px;border-radius:7px;border:1.5px solid rgba(0,0,0,.25);display:grid;place-items:center;background:#fff;transition:all .25s var(--ease)}.ck input:checked{background:#9f8fe0;border-color:#9f8fe0}.ck input:checked::after{content:'';width:6px;height:11px;border:solid #fff;border-width:0 2.5px 2.5px 0;transform:rotate(45deg) translate(-1px,-1px)}.ck input:checked+span{color:var(--mut);text-decoration:line-through}" +
    ".two{display:grid;grid-template-columns:1fr 1fr;gap:12px}.two.three{grid-template-columns:repeat(3,minmax(0,1fr))}@media(max-width:640px){.two,.two.three{grid-template-columns:1fr}}.out{margin-top:16px;display:grid;gap:2px}.kv{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-top:1px solid var(--rule);font-size:14px}.kv b{font:600 15px 'Manrope'}.kv.good b{color:#2f8f73}" +
    "@media(max-width:560px){.po{grid-template-columns:1fr 70px}.po .bar{grid-column:1/-1;order:3}}" +
    ":is(html[data-theme='dark'],html[data-hy='dark']) :is(.cmp,.ck input){background:rgba(255,255,255,.06);box-shadow:inset 0 0 0 1px rgba(255,255,255,.1)}:is(html[data-theme='dark'],html[data-hy='dark']) .cmp.best{background:rgba(159,143,224,.18)}:is(html[data-theme='dark'],html[data-hy='dark']) .tag{background:rgba(255,255,255,.1);color:#cfcfd8}:is(html[data-theme='dark'],html[data-hy='dark']) .nd{color:#f3f3f6}:is(html[data-theme='dark'],html[data-hy='dark']) .meter,:is(html[data-theme='dark'],html[data-hy='dark']) .ck input{background:rgba(255,255,255,.1)}:is(html[data-theme='dark'],html[data-hy='dark']) .card::before{background:radial-gradient(340px circle at var(--mx,50%) var(--my,0%),rgba(255,255,255,.07),transparent 62%)}";
  css.textContent += ":is(html[data-theme='dark'],html[data-hy='dark']) .db-track{background:rgba(255,255,255,.1)}";
  css.textContent += ".vc-section{margin-top:24px;padding-top:20px;border-top:1px solid var(--rule)}.vc-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}.vc-head h4{margin:0;font:600 16px 'Manrope';letter-spacing:-.02em}.vc-head p,.vc-note{margin:4px 0 0;color:var(--mut);font-size:11px;line-height:1.5}.vc-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.vc-item{min-width:0;padding:9px;border-radius:15px;background:rgba(127,127,127,.055);box-shadow:inset 0 0 0 1px var(--rule)}.vc-face,.vc-live{height:92px;padding:13px 14px;border-radius:12px;background:linear-gradient(145deg,color-mix(in srgb,var(--vc) 82%,white),var(--vc) 65%,color-mix(in srgb,var(--vc) 76%,black));color:#fff;display:flex;align-items:flex-end;justify-content:space-between;box-shadow:0 8px 18px color-mix(in srgb,var(--vc) 20%,transparent);font-size:12px;font-weight:600;overflow:hidden}.vc-face b,.vc-live b{font:700 21px 'Manrope';opacity:.9}.vc-meta{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:9px 2px 0}.vc-meta span{min-width:0;display:grid;gap:3px}.vc-meta b{font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.vc-meta small{font-size:10px;color:var(--mut)}.vc-meta button{font-size:10px;padding:3px 5px;flex:none}.vc-empty{margin:0;padding:14px 0 0;color:var(--mut);font-size:12px}.vc-note{margin-top:12px}.vc-live{height:150px;padding:18px 20px;margin-bottom:14px;border-radius:16px;font-size:17px}.vc-live b{font-size:28px}@media(max-width:560px){.vc-head{align-items:flex-start;flex-direction:column}.vc-list{grid-template-columns:1fr}.vc-face{height:100px}}:is(html[data-theme='dark'],html[data-hy='dark']) .vc-item{background:rgba(255,255,255,.035)}";
  css.textContent += ".vc-section{grid-column:span 12;margin:0;min-width:0;padding:24px 26px;border-radius:22px;background:var(--paper,rgba(255,255,255,.72))}.vc-head{margin-bottom:20px}.vc-head h3{margin:5px 0 3px}.vc-head p{font-size:12px}.vc-eyebrow{font-size:10px;letter-spacing:.13em;color:var(--mut);font-weight:700}.vc-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.vc-preset{min-width:0;padding:10px;border-radius:17px;background:rgba(127,127,127,.045);box-shadow:inset 0 0 0 1px var(--rule);transition:transform .25s var(--ease),box-shadow .25s var(--ease)}.vc-preset:hover{transform:translateY(-3px);box-shadow:inset 0 0 0 1px rgba(127,127,127,.2),0 12px 26px rgba(0,0,0,.06)}.vc-face{height:116px;padding:14px 15px;border-radius:13px;background-color:var(--vc)}.vc-brand{display:flex;align-items:center;justify-content:flex-end;min-width:45px;font:bold italic 17px/1 Arial,sans-serif;letter-spacing:-.05em;text-shadow:0 1px 2px rgba(0,0,0,.12)}.vc-brand-mastercard{font-size:13px;font-style:normal;letter-spacing:-.07em}.vc-meta{padding:10px 2px 1px}.vc-meta b{font-size:12px}.vc-meta small{font-size:10px}.vc-meta button{font-size:11px;padding:4px 8px}.vc-owned{box-shadow:inset 0 0 0 1.5px rgba(89,64,184,.28)}.vc-note{margin-top:16px;font-size:10px}.vc-live{height:154px}.vc-live .vc-brand{font-size:23px}.vc-live .vc-brand-mastercard{font-size:16px}@media(max-width:1000px){.vc-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:720px){.vc-section{padding:19px 16px}.vc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.vc-face{height:104px}}@media(max-width:460px){.vc-grid{grid-template-columns:1fr}.vc-face{height:124px}}:is(html[data-theme='dark'],html[data-hy='dark']) .vc-section{background:rgba(255,255,255,.035)}:is(html[data-theme='dark'],html[data-hy='dark']) .vc-preset{background:rgba(255,255,255,.025)}";
  css.textContent += "#app .budget-grid > .vc-section{padding:24px 26px;border:0;border-radius:22px;background:rgba(255,255,255,.72);box-shadow:0 12px 34px rgba(20,20,30,.055)}#app .budget-grid > .vc-section::after{display:none}:is(html[data-theme='dark'],html[data-hy='dark']) #app .budget-grid > .vc-section{background:rgba(255,255,255,.035);box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}";
  css.textContent += "#app .budget-grid .card.c5 .vc-section{grid-column:auto;position:relative;margin-top:20px;padding:18px 0 0;border:0;border-radius:0;background:transparent;box-shadow:none}.vc-section::before{content:'';position:absolute;top:0;left:10px;right:10px;height:1px;background:var(--rule)}.vc-section .vc-head{margin-bottom:13px}.vc-section .vc-head h3{margin:4px 0;font-size:18px;letter-spacing:-.025em}.vc-section .vc-head p{font-size:11px}.vc-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.vc-preset{padding:7px;border-radius:14px}.vc-face,.vc-live{width:100%;height:auto;min-height:0;aspect-ratio:1.586;display:flex;flex-direction:column;align-items:stretch;justify-content:space-between;padding:11px 12px;border-radius:11px;background-image:radial-gradient(ellipse at 88% 10%,rgba(255,255,255,.22),transparent 50%),linear-gradient(145deg,color-mix(in srgb,var(--vc) 82%,white),var(--vc) 65%,color-mix(in srgb,var(--vc) 76%,black));box-shadow:0 7px 15px color-mix(in srgb,var(--vc) 22%,transparent);color:#fff}.vc-card-top,.vc-card-bottom{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0}.vc-card-top small{font-size:7px;letter-spacing:.13em;opacity:.76}.vc-chip{position:relative;display:block;flex:none;width:25px;height:18px;border-radius:4px;background:linear-gradient(135deg,#f4e5a1,#c6a94e 55%,#f3dea0);box-shadow:inset 0 0 0 1px rgba(85,66,20,.25)}.vc-chip::before{content:'';position:absolute;inset:3px 7px;border-left:1px solid rgba(94,73,25,.35);border-right:1px solid rgba(94,73,25,.35)}.vc-chip::after{content:'';position:absolute;left:3px;right:3px;top:8px;border-top:1px solid rgba(94,73,25,.35)}.vc-card-bottom{align-items:flex-end}.vc-card-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:clamp(10px,1vw,13px);font-weight:600}.vc-brand{flex:none;min-width:0;font-size:clamp(12px,1.3vw,17px);font:bold italic 17px/1 Arial,sans-serif;letter-spacing:-.05em;text-shadow:0 1px 2px rgba(0,0,0,.12)}.vc-brand-mastercard{font-size:11px;font-style:normal;letter-spacing:-.07em}.vc-meta{gap:4px;padding:7px 1px 0}.vc-meta span{gap:2px}.vc-meta b{font-size:10px}.vc-meta small{font-size:9px}.vc-meta button{font-size:10px;padding:3px 6px}.vc-note{font-size:9px;line-height:1.45}.vc-live{max-width:440px;margin:0 auto 14px;padding:18px 20px}.vc-live .vc-card-top small{font-size:9px}.vc-live .vc-chip{width:32px;height:23px}.vc-live .vc-card-name{font-size:16px}.vc-live .vc-brand{font-size:23px}.vc-live .vc-brand-mastercard{font-size:15px}@media(max-width:560px){#app .budget-grid .card.c5 .vc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.vc-preset{padding:6px}.vc-face{padding:9px}.vc-meta small{font-size:8px}}:is(html[data-theme='dark'],html[data-hy='dark']) #app .budget-grid .card.c5 .vc-section{background:transparent;box-shadow:none}";
  css.textContent += "#app .budget-grid .card.c5 .vc-section{margin-top:22px;padding-top:18px}.vc-section .vc-head{display:flex;align-items:center;justify-content:space-between;margin:0 0 14px}.vc-section .vc-head h3{margin:0;font:600 17px/1.2 'Manrope';letter-spacing:-.02em;text-transform:none}.vc-section .vc-head::after{display:none}.vc-more{padding:3px 0;color:var(--mut);font-size:11px;background:none;border:0;box-shadow:none}.vc-more:hover{color:var(--ink);background:none}.vc-grid{display:flex;flex-direction:column;gap:13px}.vc-preset,.vc-preset:hover{padding:0;border-radius:0;background:transparent;box-shadow:none;transform:none}.vc-choice{display:block;width:100%;padding:0;border:0;background:transparent;color:inherit;text-align:left;cursor:pointer}.vc-choice:focus-visible{outline:2px solid #5940b8;outline-offset:4px;border-radius:12px}.vc-face,.vc-live{position:relative;width:100%;height:auto;min-height:0;aspect-ratio:1.586;display:flex;flex-direction:column;align-items:stretch;justify-content:space-between;padding:15px 17px;border-radius:14px;background-color:var(--vc);background-image:radial-gradient(ellipse at 87% 8%,rgba(255,255,255,.24),transparent 46%),linear-gradient(145deg,color-mix(in srgb,var(--vc) 84%,white),var(--vc) 60%,color-mix(in srgb,var(--vc) 75%,black));box-shadow:0 8px 20px rgba(18,22,35,.15);color:#fff;overflow:hidden}.vc-card-top{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:10px}.vc-card-top>span{font-size:9px;font-weight:600;letter-spacing:.1em;opacity:.78}.vc-chip{width:31px;height:23px;border-radius:5px;background:linear-gradient(135deg,#f4e5a1,#c6a94e 55%,#f3dea0);box-shadow:inset 0 0 0 1px rgba(85,66,20,.25)}.vc-chip::before{inset:4px 9px}.vc-chip::after{top:10px}.vc-tap{width:18px;height:18px;fill:none;stroke:rgba(255,255,255,.8);stroke-width:1.6;stroke-linecap:round}.vc-card-number{font:500 11px/1.2 'Manrope',Arial,sans-serif;letter-spacing:.12em;color:rgba(255,255,255,.82);white-space:nowrap}.vc-card-bottom{align-items:flex-end}.vc-cardholder{display:grid;gap:3px;min-width:0}.vc-cardholder small{font-size:7px;text-transform:uppercase;letter-spacing:.1em;opacity:.72}.vc-cardholder b{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:600}.vc-brand{display:flex;align-items:center;justify-content:flex-end;flex:none;min-width:0;font:bold italic 22px/1 Arial,sans-serif;letter-spacing:-.06em;text-shadow:0 1px 2px rgba(0,0,0,.12)}.vc-brand-mastercard{position:relative;width:40px;height:22px;font-size:0}.vc-brand-mastercard::before,.vc-brand-mastercard::after{content:'';position:absolute;top:2px;width:20px;height:20px;border-radius:50%}.vc-brand-mastercard::before{left:0;background:#eb001b}.vc-brand-mastercard::after{left:13px;background:#f79e1b;mix-blend-mode:screen}.vc-brand-uaeswitch{font-size:12px;font-style:normal;letter-spacing:.03em}.vc-caption{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 2px 0}.vc-caption>span{display:grid;gap:2px;min-width:0}.vc-caption b{font-size:11px;font-weight:600}.vc-caption small{color:var(--mut);font-size:9px}.vc-caption i{font-size:10px;font-style:normal;color:var(--mut)}.vc-owned .vc-face{box-shadow:0 0 0 1.5px rgba(89,64,184,.35),0 8px 20px rgba(18,22,35,.15)}.vc-owned .vc-caption{padding-top:8px}.vc-owned .vc-caption button{font-size:10px}.vc-live{max-width:460px;margin:0 auto 14px;padding:20px 22px}.vc-live .vc-card-top>span{font-size:10px}.vc-live .vc-chip{width:38px;height:28px}.vc-live .vc-card-number{font-size:14px}.vc-live .vc-cardholder b{font-size:14px}.vc-live .vc-cardholder small{font-size:8px}.vc-live .vc-brand{font-size:28px}.vc-live .vc-brand-mastercard{font-size:0}.vc-note{margin-top:12px}:is(html[data-theme='dark'],html[data-hy='dark']) .vc-face,:is(html[data-theme='dark'],html[data-hy='dark']) .vc-live{box-shadow:0 8px 20px rgba(0,0,0,.35)}";
  css.textContent += "#app .budget-grid{align-items:stretch}#app .budget-grid>.card.c7,#app .budget-grid>.card.c5{align-self:stretch}#app .budget-grid>.card.c5{display:flex;flex-direction:column}#app .budget-grid>.card.c5 .vc-section{display:flex;flex:1;flex-direction:column;margin-top:16px;padding-top:14px}#app .budget-grid>.card.c5 .vc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-block:auto}.vc-section .vc-head{margin-bottom:10px}.vc-section .vc-face{padding:10px 12px;border-radius:11px;box-shadow:0 5px 13px rgba(18,22,35,.12)}.vc-section .vc-card-top>span{font-size:7px}.vc-section .vc-chip{width:23px;height:17px}.vc-section .vc-chip::before{inset:3px 7px}.vc-section .vc-chip::after{top:7px}.vc-section .vc-tap{width:14px;height:14px}.vc-section .vc-card-number{font-size:9px;letter-spacing:.09em}.vc-section .vc-cardholder small{font-size:6px}.vc-section .vc-cardholder b{font-size:9px}.vc-section .vc-brand{font-size:17px}.vc-section .vc-brand-mastercard{width:30px;height:17px;font-size:0}.vc-section .vc-brand-mastercard::before,.vc-section .vc-brand-mastercard::after{width:15px;height:15px;top:1px}.vc-section .vc-brand-mastercard::after{left:10px}.vc-section .vc-brand-uaeswitch{font-size:9px}.vc-caption{padding-top:5px}.vc-caption b{font-size:10px}.vc-caption small{font-size:8px}.vc-caption i{font-size:9px}.vc-choice{transition:transform .2s ease}.vc-choice:hover{transform:translateY(-2px)}.vc-note{margin-top:8px;font-size:8px}.vc-picker{width:min(820px,calc(100vw - 32px));max-height:min(88dvh,900px);padding:0;border:1px solid rgba(255,255,255,.55);border-radius:26px;background:rgba(250,250,252,.96);color:var(--ink);box-shadow:0 34px 110px rgba(10,12,25,.28);overflow:auto;overscroll-behavior:contain;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);animation:vcPickerIn .34s cubic-bezier(.2,.8,.2,1) both}.vc-picker[open]::backdrop{background:rgba(13,15,24,.42);backdrop-filter:blur(3px);animation:vcBackdropIn .28s ease both}.vc-picker.is-closing{animation:vcPickerOut .18s ease both}.vc-picker.is-closing::backdrop{animation:vcBackdropOut .18s ease both}.vc-picker-shell{padding:clamp(22px,4vw,38px)}.vc-picker-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}.vc-picker-head small{color:var(--mut);font-size:9px;letter-spacing:.15em;font-weight:600}.vc-picker-head h2{margin:5px 0 0;font:600 26px/1.15 'Manrope';letter-spacing:-.045em}.vc-picker-sub{margin:8px 0 22px;color:var(--mut);font-size:12px}.vc-picker-close{width:32px;height:32px;display:grid;place-items:center;border:0;border-radius:50%;background:rgba(0,0,0,.055);font-size:22px;line-height:1;color:var(--mut);transition:background .2s,color .2s}.vc-picker-close:hover{background:rgba(0,0,0,.1);color:var(--ink)}.vc-picker-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px 16px}.vc-picker-choice{padding:0;border:0;background:transparent;text-align:left;color:inherit;cursor:pointer;transition:transform .2s ease}.vc-picker-choice:hover{transform:translateY(-3px)}.vc-picker-choice .vc-face{aspect-ratio:1.586}.vc-picker-caption{display:grid;grid-template-columns:1fr auto;gap:3px 10px;align-items:center;padding:9px 2px 0}.vc-picker-caption b{font-size:12px;font-weight:600}.vc-picker-caption small{grid-column:1;color:var(--mut);font-size:10px}.vc-picker-caption i{grid-column:2;grid-row:1/3;font-style:normal;color:var(--mut);font-size:16px}.vc-picker-foot{margin-top:22px;padding-top:14px;border-top:1px solid var(--rule);color:var(--mut);font-size:10px}@keyframes vcPickerIn{from{opacity:0;transform:translateY(12px) scale(.985);filter:blur(5px)}to{opacity:1;transform:none;filter:none}}@keyframes vcPickerOut{to{opacity:0;transform:translateY(8px) scale(.99);filter:blur(3px)}}@keyframes vcBackdropIn{from{opacity:0}to{opacity:1}}@keyframes vcBackdropOut{to{opacity:0}}@media(max-width:760px){#app .budget-grid>.card.c5 .vc-grid{gap:8px}.vc-picker-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:15px 12px}}@media(max-width:460px){.vc-picker-grid{grid-template-columns:1fr}.vc-picker{border-radius:20px}.vc-picker-shell{padding:20px}.vc-picker-sub{margin-bottom:16px}}:is(html[data-theme='dark'],html[data-hy='dark']) .vc-picker{background:rgba(30,30,34,.96);color:#f5f5f7;border-color:rgba(255,255,255,.1)}:is(html[data-theme='dark'],html[data-hy='dark']) .vc-picker-close{background:rgba(255,255,255,.09);color:#d8d8df}";
  css.textContent += "@media(prefers-reduced-motion:reduce){.vc-picker,.vc-picker::backdrop,.vc-picker-choice,.vc-choice{animation:none!important;transition:none!important;transform:none!important}}";
  css.textContent += "#app .budget-grid>.card.c5 .vc-grid{margin:0;align-content:start}.vc-choice .vc-face{max-width:390px}.vc-info{display:grid;gap:0;margin-top:16px}.vc-info>div{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:9px 2px;border-top:1px solid var(--rule);font-size:10px;line-height:1.35}.vc-info>div span{color:var(--mut);white-space:nowrap}.vc-info>div b{text-align:right;font-weight:500}.vc-picker-choice .vc-face{max-width:none}@media(max-width:560px){.vc-info>div{align-items:flex-start;flex-direction:column;gap:3px}}";
  css.textContent += "#app .budget-grid .card.c5 .vc-section .vc-head h3{margin:0 0 14px;font:500 13px 'Manrope',sans-serif;color:var(--mut);letter-spacing:.035em;text-transform:none}";
  css.textContent += "#app .budget-grid>.card.c5 .vc-section,.vc-info,.vc-info>div{min-width:0}.vc-info>div{align-items:flex-start;gap:8px 12px}.vc-info>div span{flex:0 0 auto;white-space:normal}.vc-info>div b{flex:0 1 62%;min-width:0;overflow-wrap:anywhere}";
  css.textContent += ".bill-schedule,.bill-costs{min-width:0}.bill-summary{display:grid;grid-template-columns:1fr 1fr;margin:2px 0 10px;padding:13px 0;border-top:1px solid var(--rule);border-bottom:0}.bill-summary>div{display:grid;gap:3px}.bill-summary>div+div{padding-left:18px;border-left:1px solid var(--rule)}.bill-summary span{color:var(--mut);font-size:10px;letter-spacing:.035em}.bill-summary b{font:600 18px/1.1 'Manrope';letter-spacing:-.025em}.bill-summary small{color:var(--mut);font-size:10px}.bill-paid-track{height:5px;margin:8px 0 11px;border-radius:99px;background:rgba(127,127,127,.12);overflow:hidden}.bill-paid-track i{display:block;width:var(--w);height:100%;border-radius:inherit;background:#628c88;transition:width .7s var(--ease)}.bill-row{grid-template-columns:44px minmax(0,1fr) auto auto!important;gap:11px;padding:12px 0}.bill-row .xd{width:42px;height:42px;padding:7px 0;border-radius:12px}.bill-row .xn{display:grid;gap:3px}.bill-row .xn span{font-size:10px;line-height:1.35}.bill-row .xa{font-size:13px}.bill-actions{gap:4px;align-items:center}.bill-actions .btn.sm{padding:6px 9px;font-size:10px}.bill-actions .del{width:28px;height:28px}.bill-costs .big{margin-bottom:2px}.bill-costs .share{margin:17px 0 10px}.bill-costs .legend{gap:7px}.bill-costs .legend>div{font-size:11px}.bill-costs .alert{margin-top:18px}@media(max-width:560px){.bill-summary>div+div{padding-left:12px}.bill-row{grid-template-columns:38px minmax(0,1fr) auto!important;gap:9px}.bill-row .xd{width:36px;height:38px}.bill-row .xa{grid-column:2;grid-row:2;text-align:left;font-size:12px}.bill-row .bill-actions{grid-column:3;grid-row:1/3;flex-direction:column}.bill-actions .btn.sm{font-size:9px;padding:5px 7px}}:is(html[data-theme='dark'],html[data-hy='dark']) .bill-paid-track{background:rgba(255,255,255,.1)}";
  css.textContent += ".bill-overview{grid-column:span 12;display:grid;grid-template-columns:minmax(0,1.4fr) minmax(300px,1fr);gap:16px;align-items:stretch;min-width:0}.bill-overview>.bill-schedule,.bill-overview>.bill-costs{grid-column:auto;height:100%}@media(max-width:760px){.bill-overview{grid-template-columns:minmax(0,1fr)}}";
  css.textContent += ".wealth-overview{grid-column:span 12;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;align-items:stretch;min-width:0}.wealth-column{display:grid;grid-template-rows:auto minmax(0,1fr);height:100%;align-content:stretch;gap:16px;min-width:0}.wealth-column>.card{grid-column:auto;min-width:0}.bill-cat-chart{display:grid;gap:14px;margin:19px 0 16px}.bill-cat-row{display:grid;gap:6px}.bill-cat-top{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:11px}.bill-cat-top span{display:flex;align-items:center;gap:8px;min-width:0}.bill-cat-top span i{width:9px;height:9px;flex:none;border-radius:50%;background:var(--cat-color)}.bill-cat-top b{flex:none;font-size:11px;font-weight:600}.bill-cat-track{height:6px;border-radius:99px;background:rgba(127,127,127,.12);overflow:hidden}.bill-cat-track i{display:block;width:var(--w);height:100%;border-radius:inherit;background:var(--cat-color)}.bill-reserve{display:grid;gap:4px;margin-top:auto;padding:13px 14px;border-radius:14px;background:rgba(127,127,127,.07)}.bill-reserve span,.bill-reserve small{color:var(--mut);font-size:10px}.bill-reserve b{font:600 15px 'Manrope'}@media(max-width:760px){.wealth-overview{grid-template-columns:minmax(0,1fr)}.wealth-column{grid-template-rows:auto;height:auto}.wealth-column>.card:last-child{height:auto}}:is(html[data-theme='dark'],html[data-hy='dark']) .bill-cat-track{background:rgba(255,255,255,.1)}:is(html[data-theme='dark'],html[data-hy='dark']) .bill-reserve{background:rgba(255,255,255,.055)}";
  css.textContent += ".wealth-column{display:flex;flex-direction:column;height:auto;min-height:0}.wealth-column>.card:last-child{flex:1}.bill-costs{display:flex;flex-direction:column}.bill-cat-chart{flex:1;align-content:space-evenly}@media(max-width:760px){.wealth-column>.card:last-child{flex:none}}";
  document.head.appendChild(css);

  if (PANELS[location.hash.slice(1)]) tab = location.hash.slice(1);
  render();
})();
