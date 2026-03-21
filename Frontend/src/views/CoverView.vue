<template>
  <div class="cover-page">

    <!-- Hero -->
    <header class="hero">
      <div class="hero-inner">
        <p class="hero-eyebrow">Australian Retirement Planner</p>
        <h1 class="hero-headline">See if you can retire<br>comfortably.</h1>
        <p class="hero-sub">Enter your assets, income, and expenses. Get a year-by-year picture of your financial future — including Age Pension.</p>
        <button @click="startPlanning" class="cta-btn" aria-label="Open the retirement simulator">
          Try the Simulation
          <span class="material-icons" aria-hidden="true">arrow_forward</span>
        </button>
      </div>
    </header>

    <main>

      <!-- Benefits -->
      <section class="section benefits-section" aria-labelledby="benefits-heading">
        <h2 id="benefits-heading" class="section-label">What you get</h2>
        <div class="benefits-grid">
          <div class="benefit-tile">
            <div class="benefit-icon" aria-hidden="true">
              <span class="material-icons">show_chart</span>
            </div>
            <h3>A clear retirement timeline</h3>
            <p>Watch your wealth grow (and draw down) year by year, so you know exactly when you can stop working.</p>
          </div>
          <div class="benefit-tile">
            <div class="benefit-icon" aria-hidden="true">
              <span class="material-icons">tune</span>
            </div>
            <h3>An optimised spending plan</h3>
            <p>The calculator finds the highest sustainable annual expense that keeps your money lasting until your target age.</p>
          </div>
          <div class="benefit-tile">
            <div class="benefit-icon" aria-hidden="true">
              <span class="material-icons">account_balance</span>
            </div>
            <h3>Automatic Age Pension</h3>
            <p>Asset and income tests run every year of your projection, so your pension entitlement is always accurate.</p>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="section steps-section" id="how-it-works" aria-labelledby="steps-heading">
        <h2 id="steps-heading" class="section-label">How it works</h2>
        <ol class="steps-list" role="list">
          <li class="step">
            <span class="step-num" aria-hidden="true">1</span>
            <div class="step-body">
              <h3>Enter your details</h3>
              <p>Your age, assets, income, and expenses — takes about two minutes.</p>
            </div>
          </li>
          <li class="step">
            <span class="step-num" aria-hidden="true">2</span>
            <div class="step-body">
              <h3>Run the projection</h3>
              <p>Year-by-year calculations including super, tax, inflation, and Age Pension.</p>
            </div>
          </li>
          <li class="step">
            <span class="step-num" aria-hidden="true">3</span>
            <div class="step-body">
              <h3>Read the chart</h3>
              <p>An interactive chart shows your net wealth trajectory at a glance.</p>
            </div>
          </li>
          <li class="step">
            <span class="step-num" aria-hidden="true">4</span>
            <div class="step-body">
              <h3>Tweak the assumptions</h3>
              <p>Adjust growth rates, retirement age, or expenses and re-run instantly.</p>
            </div>
          </li>
        </ol>
      </section>

      <!-- Age Pension callout -->
      <div class="pension-callout" role="note">
        <span class="material-icons callout-icon" aria-hidden="true">verified</span>
        <p>Includes automatic Age Pension calculations using current Australian Government asset and income test thresholds (Sept 2025 – Mar 2026).</p>
      </div>

      <!-- Privacy strip -->
      <div class="privacy-strip" role="note">
        <span class="material-icons" aria-hidden="true">lock</span>
        <span>Your data never leaves your browser — nothing is stored on our servers.</span>
      </div>

      <!-- FAQ -->
      <section class="section faq-section" id="faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading" class="section-label">Common questions</h2>
        <dl class="faq-list">
          <div class="faq-item">
            <dt>Is my financial data private?</dt>
            <dd>Yes. Everything is saved in your browser only. We never see or store your numbers.</dd>
          </div>
          <div class="faq-item">
            <dt>Is this specific to Australia?</dt>
            <dd>Yes — it uses Australian tax brackets, superannuation rules, and Age Pension thresholds. It is not suitable for other countries.</dd>
          </div>
          <div class="faq-item">
            <dt>How accurate are the projections?</dt>
            <dd>They reflect current rules and your chosen assumptions. Real markets are unpredictable — treat results as a planning guide, not a guarantee.</dd>
          </div>
        </dl>
      </section>

      <!-- Final CTA -->
      <section class="final-cta" aria-labelledby="final-cta-heading">
        <h2 id="final-cta-heading">Ready to see your number?</h2>
        <p>It's free, private, and takes two minutes.</p>
        <button @click="startPlanning" class="cta-btn large" aria-label="Open the retirement simulator">
          Try the Simulation
          <span class="material-icons" aria-hidden="true">arrow_forward</span>
        </button>
      </section>

    </main>

    <!-- Footer disclaimer -->
    <footer class="page-footer">
      <div class="opensource-strip">
        <svg class="github-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        <span>Open source — <a href="https://github.com/rocker8942/FinancialPlanner" target="_blank" rel="noopener noreferrer">view the source code on GitHub</a></span>
      </div>
      <p>This tool provides estimates only and is not financial advice. Always consult a qualified financial adviser before making retirement decisions.</p>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function startPlanning() {
  router.push('/retirementplanner');
}
</script>

<style scoped>
/* ── Layout ────────────────────────────────────────────────── */
.cover-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
}

/* ── Hero ──────────────────────────────────────────────────── */
.hero {
  padding: 6rem 0 5rem;
  text-align: center;
}

.hero-inner {
  max-width: 620px;
  margin: 0 auto;
}

.hero-eyebrow {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent-text);
  margin: 0 0 1.25rem;
}

.hero-headline {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  line-height: 1.08;
  color: var(--text-primary);
  margin: 0 0 1.5rem;
  letter-spacing: -0.02em;
}

.hero-sub {
  font-size: 1.125rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 0 2.5rem;
}

/* ── CTA Button ────────────────────────────────────────────── */
.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #14b8a6 0%, #059669 100%);
  color: #fff;
  font-size: 1.0625rem;
  font-weight: 700;
  padding: 0.9rem 2rem;
  border: none;
  border-radius: 0.625rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 18px rgba(13, 148, 136, 0.35);
  letter-spacing: 0.01em;
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(13, 148, 136, 0.45);
}

.cta-btn.large {
  font-size: 1.125rem;
  padding: 1.1rem 2.5rem;
}

/* ── Shared Section Styles ─────────────────────────────────── */
.section {
  margin-bottom: 5rem;
}

.section-label {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent-text);
  margin: 0 0 2.5rem;
  text-align: center;
}

/* ── Benefits ──────────────────────────────────────────────── */
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.benefit-tile {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 2rem 1.75rem;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.benefit-tile:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(13, 148, 136, 0.15);
}

.benefit-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.benefit-icon .material-icons {
  font-size: 1.5rem;
  color: var(--accent-text);
}

.benefit-tile h3 {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.75rem;
  line-height: 1.3;
}

.benefit-tile p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.65;
  margin: 0;
}

/* ── Steps ─────────────────────────────────────────────────── */
.steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.step-num {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #14b8a6 0%, #059669 100%);
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-body h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.4rem;
}

.step-body p {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.65;
  margin: 0;
}

/* ── Age Pension Callout ───────────────────────────────────── */
.pension-callout {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  background: linear-gradient(135deg, rgba(13, 148, 136, 0.08) 0%, rgba(13, 148, 136, 0.04) 100%);
  border: 1px solid rgba(13, 148, 136, 0.25);
  border-radius: 0.875rem;
  padding: 1.5rem 1.75rem;
  margin-bottom: 5rem;
}

.callout-icon {
  font-size: 1.5rem;
  color: var(--accent-text);
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.pension-callout p {
  font-size: 0.9375rem;
  color: var(--text-label);
  line-height: 1.65;
  margin: 0;
}

/* ── Privacy Strip ─────────────────────────────────────────── */
.privacy-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 5rem;
  padding: 0.875rem 1.25rem;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.privacy-strip .material-icons {
  font-size: 1.1rem;
  color: var(--accent-text);
}

/* ── FAQ ───────────────────────────────────────────────────── */
.faq-list {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.faq-item {
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.faq-item:first-child {
  border-top: 1px solid var(--border-color);
}

.faq-item dt {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.faq-item dd {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.65;
  margin: 0;
}

/* ── Final CTA ─────────────────────────────────────────────── */
.final-cta {
  text-align: center;
  padding: 4.5rem 2rem;
  background: linear-gradient(135deg, rgba(13, 148, 136, 0.07) 0%, rgba(13, 148, 136, 0.03) 100%);
  border-radius: 1.25rem;
  border: 1px solid rgba(13, 148, 136, 0.18);
  margin-bottom: 3rem;
}

.final-cta h2 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 0.75rem;
  letter-spacing: -0.02em;
}

.final-cta p {
  font-size: 1.0625rem;
  color: var(--text-secondary);
  margin: 0 0 2rem;
}

/* ── Footer ────────────────────────────────────────────────── */
.page-footer {
  text-align: center;
  padding-bottom: 1.5rem;
}

.opensource-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  padding: 0.875rem 1.25rem;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.github-icon {
  flex-shrink: 0;
  color: var(--accent-text);
}

.opensource-strip a {
  color: var(--accent-text);
  text-decoration: none;
}

.opensource-strip a:hover {
  text-decoration: underline;
}

.page-footer p {
  font-size: 0.8125rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
  max-width: 560px;
  margin-inline: auto;
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 768px) {
  .hero {
    padding: 4rem 0 3.5rem;
  }

  .benefits-grid {
    grid-template-columns: 1fr;
  }

  .steps-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .cover-page {
    padding: 0 1rem 3rem;
  }

  .hero {
    padding: 3rem 0 2.5rem;
  }

  .cta-btn {
    width: 100%;
    justify-content: center;
  }

  .cta-btn.large {
    width: 100%;
    justify-content: center;
  }

  .pension-callout {
    flex-direction: column;
    gap: 0.625rem;
  }
}
</style>
