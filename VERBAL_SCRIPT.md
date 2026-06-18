# Sanraksh — 10 Minute Verbal Presentation Script

> **How to use this:** Read it out loud 2-3 times. Don't memorize word for word.
> Just know the flow — Problem → Why it fails → What we built → How it works → Numbers → Close.
> Speak slowly. Pause at the dashes.

---

## OPENING — The Hook
*[0:00 – 0:45] — Slow. Let it land.*

Let me start with a simple question.

Imagine tomorrow morning — it's raining heavily outside.
You drive for Swiggy.
You can't go out.
So you earn nothing that day.

Not because you were sick.
Not because you did something wrong.
Just — rain.

Now imagine that happens 12 times a month.
No savings. No backup. No insurance.

That's the daily life of over 7 and a half million delivery workers in India.

I built something to fix that.
It's called Sanraksh.

---

## THE PROBLEM
*[0:45 – 2:30] — Clear and confident. Hit every number.*

Let me give you some numbers.

7.7 million gig workers in India.
Swiggy, Zomato, Blinkit, Zepto, Dunzo.
They earn 4,000 to 8,000 rupees a week.
That's it. No salary. No PF. Nothing from the platform.

Every month — they lose around 12 working days.
Because of rain. Or bad AQI. Or platform outages. Or curfews.

That adds up to almost 1 lakh rupees lost every year.
Per worker.

And 96% of them — 96 out of every 100 — have zero insurance.

Now you might ask — insurance exists in India. Why can't they just buy it?

I looked at every option.
SBI Life, HDFC Ergo, LIC, ACKO — everything.

And here's why none of it works for them.

First — every plan asks for a salary slip or employment letter.
Gig workers don't have that.

Second — the cheapest plan costs 200 to 300 rupees per month.
That's 6 or 7 percent of their income.
Not affordable.

Third — even if they somehow buy it —
claim settlement takes 14 to 30 days.
These workers need money this week.
Not next month.

So the problem isn't that insurance doesn't exist.
The problem is that insurance was never designed for how gig workers actually live.

---

## THE KEY IDEA
*[2:30 – 3:30] — This is the turning point. Slow down here.*

Here's what I realized.

The things that stop delivery workers from working —
rain, bad air quality, platform crashes, curfews —
these are not hidden events.

They're measurable.
They're tracked by government APIs.
They're on weather services.
You can detect them in real time.

So — why do workers have to file a claim at all?

If the rain crosses a threshold — we already know.
If AQI crosses a limit — we already know.
If the platform goes down — we already know.

The event itself is the proof.

This idea is called parametric insurance.
Instead of "prove that you lost income" —
it says: "when this measurable event happens, we pay."

No form. No claim. No adjuster.
Just — it fires.

---

## WHAT SANRAKSH DOES
*[3:30 – 5:00] — Pick up energy here. This is the good part.*

So what does Sanraksh actually do?

A delivery worker opens the app.
Enters their phone number.
Picks their platform — Swiggy, Zomato, whatever.
Selects their city and earnings range.

That's it.
OTP verified.
Policy is active.
Under 4 minutes.

No salary slip. No documents. Nothing.

Now the system calculates their weekly premium automatically.
Not from a fixed plan.
From their specific profile.

A Mumbai Swiggy rider — 3 platforms, earning around 5,000 per week —
pays 29 rupees per week.

Less than the price of one delivery.

And it gives them 435 rupees of daily coverage.

Now here's the main thing.

When heavy rain hits their zone —
the system detects it.
It finds every active policy in that area.
It runs a fraud check on every single one.
It decides — pay, review, or reject.
And it sends the payout.

All of this — in 22 seconds.

The worker does nothing.
They just get a message:
"Rain detected in your area. Your claim of 800 rupees has been sent to your UPI."

Done.

---

## HOW IT WORKS — TECHNICAL
*[5:00 – 7:15] — Confident but simple. Don't rush.*

Let me explain what's happening inside.

There are three things that make this work.

**First — the automation engine.**

When a disruption is detected, the system pulls signals from five sources.
Weather API. Air quality data. Traffic feeds. Platform health. Civic alerts.

Each source is given a weight based on the event type.
For rain — the weather signal gets 45% of the weight.
For air quality — AQI data takes over.

The system combines them into a single confidence score.
If it's high enough — claims start processing.

Every step is logged. Full audit trail. Nothing hidden.

**Second — dynamic pricing.**

Every worker's premium is calculated by a formula.

It starts at a base rate of 10 rupees.
Then it adds a city risk factor — Mumbai is higher risk than Pune.
Then it adds a platform factor — more platforms means more exposure.
Then a small earnings factor.

Final premium is always between 10 and 60 rupees per week.
And it's different for every worker.

**Third — fraud detection using machine learning.**

Before any payout goes out — every claim is scored.

The model checks five things.

One — how many times has this worker claimed in the last 30 days?
Too many times is suspicious.

Two — is their GPS location actually in the disrupted zone?

Three — are other workers in the same area also claiming?
If nobody else is affected, that's a red flag.

Four — is the claim amount consistent with their history?

Five — what time was the claim filed? Any suspicious patterns?

These five signals produce a fraud score between 0 and 1.

Below 0.35 — auto approved. Money sent.
Between 0.35 and 0.70 — goes to a human for review.
Above 0.70 — automatically rejected.

The model hits 94.2% precision.
Meaning 94 out of 100 fraud flags are correct.
And 72.4% of all claims — paid automatically. No human needed.

---

## THE TECH STACK
*[7:15 – 7:50] — Quick. Confident. Don't get stuck here.*

Quick word on what it's built with.

The backend is Python with FastAPI.
Database is SQLite for local development, PostgreSQL for production.
The machine learning uses XGBoost — that's the fraud detection model.

The frontend is Next.js 14 with TypeScript.
There are 15 pages — a worker dashboard and a full admin dashboard.
The admin can run disruption simulations, see fraud scores live, and view a risk map of every city.

The whole system runs on Docker.
One command — everything starts.

CI/CD is set up on GitHub Actions.
Every code push runs automated tests.
Frontend auto-deploys on Vercel.

It's live. You can open it right now.

---

## THE RESULTS
*[7:50 – 8:30] — Slow down. Let numbers breathe.*

Let me give you the results.

22.3 seconds.
That's the average time from disruption detected — to payout sent.

72.4% of claims — settled automatically. Zero human involvement.

94.2% fraud detection precision.

API response time — 45 milliseconds on average.

Backend test coverage — 82%.

Frontend Lighthouse score — 92 out of 100.

These are not estimates.
These are measured from actual simulation runs with real data.

---

## WHAT COMES NEXT
*[8:30 – 9:15]*

The technology is ready.

To go live, three things are needed.

One — regulatory approval.
IRDAI, India's insurance regulator, has a sandbox specifically for products like this.
Parametric insurance has documented guidelines.
The path is clear.

Two — a platform partner.
Swiggy or Zomato or Blinkit.
The premium can be deducted directly from what the platform pays the worker every week.
No separate payment needed.

Three — a UPI payments partner.
PhonePe or Paytm or a direct NPCI integration.
For real-time payouts.

Everything else is built.

---

## CLOSING
*[9:15 – 10:00] — Slow. Clear. Strong.*

Let me come back to where I started.

7.7 million people.
Going to work every day.
With nothing protecting them.

Every rainstorm is a financial crisis.
Every platform crash. Every AQI alert. Every curfew.
No buffer. No backup. No safety net.

The reason isn't that insurance is impossible for them.
The reason is — nobody built the right kind.

Sanraksh is the right kind.

Automatic. Instant. Affordable.

29 rupees a week.
22 seconds to settle.
Zero forms to fill.

The technology exists.
The problem is real.
The market is 7.7 million people.

That's Sanraksh.

Thank you.

---

## Quick Reference — The Flow

```
HOOK        → Rain story (45 sec)
PROBLEM     → 7.7M workers, 96% uninsured, why insurance fails (1:45)
KEY IDEA    → Parametric — event = proof, no claim needed (1:00)
SOLUTION    → What Sanraksh does, 22 seconds, zero forms (1:30)
TECHNICAL   → Automation engine + Pricing + Fraud ML (2:15)
TECH STACK  → Fast mention of tools (35 sec)
RESULTS     → 22.3s, 72.4%, 94.2%, 82% coverage (40 sec)
NEXT STEPS  → IRDAI + Platform + UPI (45 sec)
CLOSE       → Back to the story. Strong ending. (45 sec)
```

## Numbers to Remember

| What | Number |
|---|---|
| Gig workers in India | 7.7 million |
| Uninsured | 96% |
| Disruption days per month | ~12 |
| Annual income lost | ₹96,000–₹1,44,000 |
| Weekly premium (example) | ₹29/week |
| Daily coverage | ₹435/day |
| Avg settlement time | 22.3 seconds |
| Auto-approval rate | 72.4% |
| Fraud precision | 94.2% |
| Test coverage | 82% |
| Lighthouse score | 92/100 |
