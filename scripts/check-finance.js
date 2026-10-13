// Self-check for the finance math in assets/hayati-data.js. Run: node scripts/check-finance.js
const assert = require("node:assert/strict");
const H = require("../assets/hayati-data.js");

const st = H.seed(new Date(2026, 9, 14)); // 14 Oct 2026
const oct = H.monthSummary(st, "2026-10");

// Only template days <= 14 land in October; school (1450 + 620) is over its 2000 limit.
assert.equal(oct.cats.find((c) => c.k === "school").spent, 2070);
assert.deepEqual(oct.over.map((c) => c.k), ["school"]);
assert.equal(oct.saved, 1250);
assert.equal(oct.spent, oct.cats.reduce((n, c) => n + c.spent, 0));
assert.ok(H.monthSummary(st, "2026-09").spent > oct.spent);

// Expenses: validation, rounding, removal.
assert.throws(() => H.addExpense(st, { amt: 0, cat: "groceries" }));
assert.throws(() => H.addExpense(st, { amt: 10, cat: "nope" }));
H.addExpense(st, { amt: "12.345", cat: "groceries", d: "2026-10-14", who: "Noura" });
const added = st.expenses.at(-1);
assert.equal(added.amt, 12.35);
H.removeExpense(st, added.id);
assert.ok(!st.expenses.some((x) => x.id === added.id));

// Contributions to goals and occasions update totals and the month's "saved".
H.contribute(st, "goal", "g1", 100);
assert.equal(st.goals[0].saved, 9900);
const hatta = H.events(st).find((e) => e.t === "Family weekend in Hatta");
H.contribute(st, "occ", hatta.k, 300);
H.setOccBudget(st, hatta.k, 2000);
const hatta2 = H.events(st).find((e) => e.k === hatta.k);
assert.equal(hatta2.s, 1200);
assert.equal(hatta2.b, 2000);

// Expenses tagged to an occasion show up as "spent" on it.
const salem = H.events(st).find((e) => e.t === "Salem's birthday");
assert.equal(salem.spent, 150);

// Kid jars: 300 Eidiya + 20 allowance split 50/30/20, minus 30 spent and 45 given.
let jars = H.kidJars(st);
assert.deepEqual([jars.save, jars.spend, jars.give, jars.given], [160, 66, 19, 45]);
H.kidAdd(st, "in", 33, "Gift");
jars = H.kidJars(st);
assert.equal(jars.save + jars.spend + jars.give, 160 + 66 + 19 + 33);
assert.throws(() => H.kidAdd(st, "give", 1000), /Give jar/);

// The child AI context never carries the parents' budgets.
const kidCtx = H.aiContext("child", st);
assert.ok(!("thisMonth" in kidCtx) && !("savingsGoals" in kidCtx));
assert.ok(JSON.stringify(H.aiContext("adult", st)).length < 5000);

// Monthly saving: AED 900 still missing, ~4 months away -> 225/month; past or funded -> 0.
const occ = { d: "2027-02-14", b: 1800, s: 900 };
assert.equal(H.monthlyNeed(occ, "2026-10-14"), 225);
assert.equal(H.monthlyNeed({ ...occ, s: 1800 }, "2026-10-14"), 0);
assert.equal(H.monthlyNeed(occ, "2027-03-01"), 0);
assert.equal(H.monthlyNeed({ d: "2026-10-20", b: 500, s: 0 }, "2026-10-14"), 500);

// Zakat: nisab = 85 g x price; 2.5% only at or above it.
assert.deepEqual(H.zakat({ cash: 40000, gold: 0, debts: 6000, goldPrice: 400 }), { wealth: 34000, nisab: 34000, due: 850 });
assert.equal(H.zakat({ cash: 30000, goldPrice: 400 }).due, 0);
assert.equal(H.zakat({ cash: 100, debts: 500 }).wealth, 0);

// Insights flag the over-limit category and never return more than three tips.
const fresh = H.seed(new Date(2026, 9, 14));
const tips = H.insights(fresh, "2026-10-14");
assert.ok(tips.length >= 1 && tips.length <= 3);
assert.equal(tips[0].tone, "warn");
assert.match(tips[0].text, /School/);

// Backup round-trip works; tampered files are rejected before anything is written.
const backup = JSON.parse(JSON.stringify({ app: "hayati", version: 1, finance: fresh, events: [{ d: "2026-11-20", t: "Visit", c: "family", tent: 0, b: 750, s: 0, time: "" }], preferences: { theme: "dark", evil: "<x>" } }));
assert.equal(H.importAll(backup).expenses.length, fresh.expenses.length);
assert.equal(H.customEvents()[0].t, "Visit");
const bad = (mut) => {
  const b = JSON.parse(JSON.stringify(backup));
  mut(b);
  assert.throws(() => H.importAll(b), /not valid/);
};
bad((b) => (b.app = "other"));
bad((b) => (b.events[0].c = "unknown"));
bad((b) => (b.finance.expenses[0].amt = -5));
bad((b) => (b.finance.expenses[0].d = "yesterday"));
bad((b) => (b.finance.kid.split.save = 90));
bad((b) => (b.finance.goals = "lots"));
assert.equal(H.load().expenses.length, fresh.expenses.length);

console.log("finance checks passed");
