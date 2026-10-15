# Hayati حياتي - Family WebApp 
### Make room for what matters.

Hayati (حياتي) literally means “My Life” in Arabic, and that's what our app is all about - making life a little easier for you and your family.

A family’s money story is made up of everyday choices and meaningful milestones. Hayati brings them into one shared view - so the whole family can plan what’s next with more clarity.

# IMPORTANT LINKS
**Live Prototype :** https://hayatiweb.netlify.app/ `Click`  
**How to access :** Click **"Enter Hayati"**, then select **"Enter as Adult"**.  
*Note: This is a prototype, so no actual login credentials are required.*

## The Problem

Family finances are often scattered across spreadsheets, calendars, banking apps, and conversations. Bills, school costs, savings goals, and special occasions all compete for attention, making it difficult to plan ahead together.

In the UAE, family life follows a rich calendar - from Ramadan and Eid to school terms, national celebrations, and family gatherings. These moments deserve planning, not last-minute stress.

## Our Solution

Hayati is a family finance and planning experience that connects the household budget with the moments it is meant to support. Adults can understand spending and prepare for upcoming costs; children can begin learning how to save, spend, and give.

**One family. One clearer plan.**

## Features

- **Family Dashboard** : See household spending, savings progress, upcoming expenses, and financial priorities in one place.
- **Budgeting & Expense Tracking** : Organize spending by category, set budget limits, and understand where your money goes.
- **Savings Goals** : Set targets for family priorities, track contributions, and follow progress over time.
- **Family Calendar** : Plan important dates alongside their expected costs, with a clearer view of upcoming financial commitments.
- **Bills & Debt Planning** : Keep track of recurring payments, upcoming bills, and debt repayment strategies.
- **Child Mode** : Introduce money management through interactive Save, Spend, and Give jars that encourage thoughtful financial habits.
- **UAE Financial Tools** : Estimate loan repayments, calculate end-of-service gratuity, and explore Zakat calculations.
- **Hayati AI** : Get guidance on budgeting, savings, and planning for the moments that matter to your family.

## Designed for Family Life in the UAE

Hayati is shaped around the way families here plan: together, across generations, and with the year’s important moments in mind. AED-based budgeting, UAE financial tools, and a calendar that includes occasions such as Ramadan, Eid, school terms, and national celebrations help connect everyday money decisions to real family life.

# Tech Stack

- **Frontend:** HTML, CSS, and Vanilla JavaScript
- **Backend:** Node.js and Express
- **AI:** Gemini API, called through a server-side endpoint
- **Deployment:** Netlify Functions with `serverless-http`
- **Prototype data:** Browser `localStorage`

# Design Stack

A calm, editorial interface built with custom CSS, responsive layouts, inline SVG charts and visuals, and subtle motion. Google Fonts bring together **Manrope**, **Bricolage Grotesque**, **Instrument Sans**, and **Reem Kufi**.

We also include an **ADHD-friendly UI** with reduced motion, fewer visual distractions, and clearer keyboard focus, alongside **Dark Mode & Light Mode** for reading comfort.

## Run Locally

**Requirements:** Node.js 20.12 or newer.

Install the project dependencies:

```bash
npm install
```

Create a `.env` file by copying `.env.example`, then add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the app:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Hayati AI requires a valid Gemini API key; the rest of the prototype can be explored without one.

To generate the Netlify build:

```bash
npm run build
```
