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

console.log("finance checks passed");
