<template>
  <div class="cover-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          Financial Planner
          <span class="beta-badge">BETA</span>
        </h1>
        <p class="hero-subtitle">Plan your financial future with confidence</p>
        <p class="hero-description">
          A comprehensive retirement planning tool that helps you visualize your financial journey, 
          track wealth growth, and make informed decisions about your future.
        </p>
        <button @click="startPlanning" class="start-button">
          Start Your Financial Plan
          <span class="material-icons">arrow_forward</span>
        </button>
      </div>
    </section>

    <!-- What This App Does -->
    <section class="section">
      <h2 class="section-title">What This App Does</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <span class="material-icons">trending_up</span>
          </div>
          <h3>Wealth Projection</h3>
          <p>Calculate your net worth growth over time, including property assets, savings, and superannuation.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <span class="material-icons">account_balance</span>
          </div>
          <h3>Australian Age Pension</h3>
          <p>Automatically calculates your Australian Age Pension entitlements using current government asset and income test thresholds, updated for your specific circumstances.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <span class="material-icons">pie_chart</span>
          </div>
          <h3>Interactive Charts</h3>
          <p>Visualize your financial plan with dynamic charts showing nominal and inflation-adjusted values.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <span class="material-icons">tune</span>
          </div>
          <h3>Auto-Optimize Expenses</h3>
          <p>Automatically calculate the optimal annual expense amount to maximize your retirement lifestyle while ensuring your wealth lasts until your target age.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <span class="material-icons">calculate</span>
          </div>
          <h3>Australian Tax Integration</h3>
          <p>Automatically calculates income tax, Medicare levy, and superannuation taxes using current 2024-25 Australian tax brackets and thresholds.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <span class="material-icons">security</span>
          </div>
          <h3>Private & Secure</h3>
          <p>Your financial data is stored locally in your browser only. Nothing is saved on our servers - complete privacy guaranteed.</p>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="section">
      <h2 class="section-title">How It Works</h2>
      <div class="steps-container">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Input Your Details</h3>
            <p>Enter your personal profile, current assets, income, expenses, and financial goals.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Calculate Projections</h3>
            <p>Our algorithm calculates year-by-year wealth projections using your growth assumptions.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Visualize Results</h3>
            <p>View interactive charts showing your financial trajectory and key milestones.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h3>Adjust & Plan</h3>
            <p>Modify assumptions and scenarios to optimize your retirement strategy.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Australian Age Pension Explanation -->
    <section class="section pension-section">
      <h2 class="section-title">Australian Age Pension Calculator</h2>
      <div class="pension-explanation">
        <div class="pension-intro">
          <p>
            This financial planner includes an <strong>automatic Australian Age Pension calculator</strong> that 
            determines your pension entitlement based on current government rules and thresholds.
          </p>
        </div>
        
        <div class="pension-details-grid">
          <div class="pension-detail-card">
            <h3>How It Works</h3>
            <ul>
              <li>Calculates pension entitlement for each year of your projection</li>
              <li>Applies both asset test and income test (you receive the lower amount)</li>
              <li>Updates automatically as your wealth and income change over time</li>
              <li>Considers your relationship status and homeowner status</li>
            </ul>
          </div>
          
          <div class="pension-detail-card">
            <h3>Asset & Income Tests (2024)</h3>
            <ul>
              <li><strong>Asset Thresholds:</strong> $301,750 (single homeowner), $543,750 (single non-homeowner), $451,500/$693,500 (couple)</li>
              <li><strong>Assessable Assets:</strong> Financial assets, superannuation (after 67), investment properties. Excludes family home</li>
              <li><strong>Income Test:</strong> Employment income, investment returns, deemed income from financial assets</li>
              <li><strong>Reduction Rate:</strong> Pension reduces $0.50 for every $1 over income threshold</li>
            </ul>
          </div>
          
          <div class="pension-detail-card">
            <h3>Automatic Integration</h3>
            <ul>
              <li>Real-time calculations update as your projected assets change each year</li>
              <li>Seamlessly integrates with your wealth projections and expense optimization</li>
              <li>Accounts for different homeowner status and relationship scenarios</li>
              <li>Provides year-by-year pension entitlement throughout your retirement</li>
            </ul>
          </div>
        </div>
        
        <div class="pension-note">
          <p>
            <strong>Note:</strong> This calculator uses current 2024 Age Pension rules and thresholds. 
            Government policies may change over time, which could affect future pension entitlements.
          </p>
        </div>
      </div>
    </section>

    <!-- Calculation Logic -->
    <section class="section">
      <h2 class="section-title">Our Calculation Methodology</h2>
      <div class="methodology-grid">
        <div class="methodology-card">
          <h3>Asset Growth</h3>
          <ul>
            <li><strong>Property:</strong> 4% annual growth (default, adjustable)</li>
            <li><strong>Financial Assets:</strong> User-defined growth rate</li>
            <li><strong>Superannuation:</strong> Separate growth rate with contributions</li>
          </ul>
        </div>
        <div class="methodology-card">
          <h3>Income & Tax Calculations</h3>
          <ul>
            <li><strong>Australian Income Tax:</strong> Uses current 2024-25 tax brackets with progressive rates (0%, 16%, 30%, 37%, 45%)</li>
            <li><strong>Medicare Levy:</strong> 2% levy with low-income thresholds and phase-in calculations</li>
            <li><strong>Superannuation Tax:</strong> 15% contributions tax plus Division 293 additional tax for high earners</li>
            <li><strong>Net Income:</strong> Gross salary minus income tax and Medicare levy</li>
            <li><strong>Net Financial Asset:</strong> Net savings - Mortgage + After-tax superannuation</li>
          </ul>
        </div>
        <div class="methodology-card">
          <h3>
            Inflation Adjustment
            <span class="coming-soon-badge">Coming Soon</span>
          </h3>
          <ul>
            <li><strong>Real Values:</strong> All projections adjusted for inflation</li>
            <li><strong>Purchasing Power:</strong> Shows today's dollar equivalent</li>
            <li><strong>Default Rate:</strong> 2.5% annual inflation (adjustable)</li>
          </ul>
        </div>
        <div class="methodology-card">
          <h3>Australian Age Pension</h3>
          <ul>
            <li><strong>Dynamic Calculation:</strong> Automatically applies current Australian Government asset and income tests</li>
            <li><strong>Homeowner Status:</strong> Different asset test thresholds for homeowners ($301,750) vs non-homeowners ($543,750) for singles</li>
            <li><strong>Couple Assessment:</strong> Combined asset test limits ($451,500/$693,500) and shared pension entitlements</li>
            <li><strong>Age Requirements:</strong> Pension eligibility from age 67 (current retirement age in Australia)</li>
            <li><strong>Real-time Updates:</strong> Calculations update automatically as your projected assets and income change each year</li>
          </ul>
        </div>
        <div class="methodology-card">
          <h3>Expense Optimization</h3>
          <ul>
            <li><strong>Binary Search Algorithm:</strong> Uses advanced optimization to find the maximum sustainable expense level</li>
            <li><strong>Wealth Preservation:</strong> Ensures your net financial assets never go negative during retirement</li>
            <li><strong>Target Age Planning:</strong> Calculates expenses to last until your specified end age</li>
            <li><strong>Income Integration:</strong> Factors in salary, pension, and investment returns for accurate projections</li>
            <li><strong>Real-time Adjustment:</strong> Automatically recalculates when you change any financial parameters</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Privacy & Data Storage -->
    <section class="section privacy-section">
      <div class="privacy-content">
        <h2 class="privacy-title">
          <span class="material-icons">lock</span>
          Your Data Stays Private
        </h2>
        <div class="privacy-grid">
          <div class="privacy-card">
            <div class="privacy-icon">
              <span class="material-icons">storage</span>
            </div>
            <h3>Local Browser Storage</h3>
            <p>All your financial data is stored directly in your web browser's local storage. This means your sensitive information never leaves your device.</p>
          </div>
          <div class="privacy-card">
            <div class="privacy-icon">
              <span class="material-icons">cloud_off</span>
            </div>
            <h3>No Server Storage</h3>
            <p>We don't save, store, or transmit any of your personal financial information to our servers. Your privacy is completely protected.</p>
          </div>
          <div class="privacy-card">
            <div class="privacy-icon">
              <span class="material-icons">devices</span>
            </div>
            <h3>Device Specific</h3>
            <p>Your data is available only on the device and browser where you entered it. Access from a different device will start fresh.</p>
          </div>
        </div>
        <div class="privacy-note">
          <p>
            <strong>Important:</strong> Since data is stored locally, clearing your browser data or using incognito/private mode 
            will remove your saved information. Consider bookmarking your calculations or taking screenshots for reference.
          </p>
        </div>
      </div>
    </section>

    <!-- Disclaimer -->
    <section class="section disclaimer-section">
      <div class="disclaimer-content">
        <h2 class="disclaimer-title">
          <span class="material-icons">warning</span>
          Important Disclaimer
        </h2>
        <div class="disclaimer-text">
          <div class="beta-notice">
            <p>
              <strong>🚧 BETA VERSION:</strong> This application is currently in beta testing. 
              Features may be incomplete, calculations may contain errors, and functionality may change without notice.
            </p>
          </div>
          <p>
            <strong>This is a financial modeling tool based on assumptions and projections.</strong> 
            The results are estimates only and should not be considered as financial advice.
          </p>
          <ul>
            <li>Asset growth rates, inflation, and market conditions are unpredictable</li>
            <li>Government policies (including age pension rules) may change over time</li>
            <li>Individual circumstances and life events can significantly impact outcomes</li>
            <li>Tax calculations are based on current 2024-25 Australian tax law which may change</li>
          </ul>
          <p>
            <strong>Always consult with qualified financial advisors</strong> before making important 
            financial or retirement planning decisions.
          </p>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="final-cta-section">
      <div class="final-cta-content">
        <h2>Ready to Plan Your Financial Future?</h2>
        <p>Start building your personalized retirement projection today.</p>
        <button @click="startPlanning" class="start-button large">
          Get Started Now
          <span class="material-icons">launch</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function startPlanning() {
  router.push('/home');
}
</script>

<style scoped>
.cover-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: 4rem 0 6rem;
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
  border-radius: 1rem;
  margin-bottom: 4rem;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: #14b8a6;
  margin-bottom: 1rem;
  line-height: 1.1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.beta-badge {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  animation: pulse-beta 2s infinite;
}

@keyframes pulse-beta {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
  }
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #d1d5db;
  margin-bottom: 1.5rem;
  font-weight: 300;
}

.hero-description {
  font-size: 1.125rem;
  color: #9ca3af;
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.start-button {
  background: linear-gradient(135deg, #14b8a6 0%, #059669 100%);
  border: none;
  color: white;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 0.75rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(20, 184, 166, 0.3);
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(20, 184, 166, 0.4);
}

.start-button.large {
  padding: 1.25rem 2.5rem;
  font-size: 1.25rem;
}

/* Sections */
.section {
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #f3f4f6;
  text-align: center;
  margin-bottom: 3rem;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: #374151;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  background: linear-gradient(135deg, #14b8a6 0%, #059669 100%);
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.feature-icon .material-icons {
  font-size: 2rem;
  color: white;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f3f4f6;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #9ca3af;
  line-height: 1.6;
}

/* Steps */
.steps-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

/* Australian Age Pension Section */
.pension-section {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
  border-radius: 1rem;
  padding: 3rem 2rem;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.pension-explanation {
  max-width: 1000px;
  margin: 0 auto;
}

.pension-intro {
  text-align: center;
  margin-bottom: 3rem;
}

.pension-intro p {
  font-size: 1.125rem;
  color: #d1d5db;
  line-height: 1.7;
}

.pension-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.pension-detail-card {
  background: #1f2937;
  padding: 2rem;
  border-radius: 1rem;
  border-left: 4px solid #22c55e;
}

.pension-detail-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #22c55e;
  margin-bottom: 1rem;
}

.pension-detail-card ul {
  list-style: none;
  padding: 0;
}

.pension-detail-card li {
  color: #d1d5db;
  margin-bottom: 0.75rem;
  line-height: 1.6;
  position: relative;
  padding-left: 1rem;
}

.pension-detail-card li::before {
  content: '•';
  color: #22c55e;
  position: absolute;
  left: 0;
}

.pension-detail-card strong {
  color: #f3f4f6;
}

.pension-note {
  background: #374151;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border-left: 4px solid #f59e0b;
  text-align: center;
}

.pension-note p {
  color: #fbbf24;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
}

.pension-note strong {
  color: #fef3c7;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.step-number {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f3f4f6;
  margin-bottom: 0.5rem;
}

.step-content p {
  color: #9ca3af;
  line-height: 1.6;
}

/* Methodology Grid */
.methodology-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.methodology-card {
  background: #374151;
  padding: 2rem;
  border-radius: 1rem;
  border-left: 4px solid #14b8a6;
}

.methodology-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #14b8a6;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.coming-soon-badge {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  white-space: nowrap;
}

.methodology-card ul {
  list-style: none;
  padding: 0;
}

.methodology-card li {
  color: #d1d5db;
  margin-bottom: 0.75rem;
  line-height: 1.6;
  position: relative;
  padding-left: 1rem;
}

.methodology-card li::before {
  content: '•';
  color: #14b8a6;
  position: absolute;
  left: 0;
}

.methodology-card strong {
  color: #f3f4f6;
}

/* Privacy Section */
.privacy-section {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%);
  border-radius: 1rem;
  padding: 3rem 2rem;
  border: 1px solid rgba(59, 130, 246, 0.2);
  margin: 3rem 0;
}

.privacy-content {
  max-width: 1000px;
  margin: 0 auto;
}

.privacy-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  color: #60a5fa;
  margin-bottom: 2rem;
  justify-content: center;
}

.privacy-title .material-icons {
  color: #3b82f6;
  font-size: 2.5rem;
}

.privacy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.privacy-card {
  background: #1f2937;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.privacy-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.privacy-icon .material-icons {
  font-size: 2rem;
  color: white;
}

.privacy-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #60a5fa;
  margin-bottom: 1rem;
}

.privacy-card p {
  color: #d1d5db;
  line-height: 1.6;
}

.privacy-note {
  background: #374151;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border-left: 4px solid #3b82f6;
  text-align: center;
}

.privacy-note p {
  color: #93c5fd;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
}

.privacy-note strong {
  color: #dbeafe;
}

/* Disclaimer Section */
.disclaimer-section {
  background: #451a03;
  border: 2px solid #ea580c;
  border-radius: 1rem;
  padding: 2rem;
  margin: 3rem 0;
}

.disclaimer-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #fed7aa;
  margin-bottom: 1.5rem;
  justify-content: center;
}

.disclaimer-title .material-icons {
  color: #ea580c;
  font-size: 2rem;
}

.disclaimer-text {
  color: #fed7aa;
  line-height: 1.7;
}

.disclaimer-text p {
  margin-bottom: 1rem;
}

.disclaimer-text ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.disclaimer-text li {
  margin-bottom: 0.5rem;
}

.disclaimer-text strong {
  color: #fef3c7;
}

.beta-notice {
  background: linear-gradient(135deg, #7c2d12 0%, #92400e 100%);
  border: 2px solid #f59e0b;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.beta-notice p {
  color: #fbbf24;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.6;
}

.beta-notice strong {
  color: #fef3c7;
  font-size: 1.1rem;
}

/* Final CTA */
.final-cta-section {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.final-cta-content h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #f3f4f6;
  margin-bottom: 1rem;
}

.final-cta-content p {
  font-size: 1.125rem;
  color: #9ca3af;
  margin-bottom: 2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.25rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .features-grid,
  .methodology-grid {
    grid-template-columns: 1fr;
  }
  
  .steps-container {
    grid-template-columns: 1fr;
  }
  
  .step {
    flex-direction: column;
    text-align: center;
  }
}
</style>