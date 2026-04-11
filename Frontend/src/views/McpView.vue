<template>
  <div class="mcp-page">
    <!-- Hero Header -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-badge">
          <span class="material-icons badge-icon">hub</span>
          <span>MCP Integration</span>
        </div>
        <h1 class="hero-title">Connect AI to Your Financial Plan</h1>
        <p class="hero-subtitle">
          Use the <strong>retirement-planner-mcp</strong> server to run retirement projections
          and expense optimizations directly from Claude, Cursor, or any MCP-compatible AI client.
        </p>
      </div>
    </div>

    <div class="page-content">
      <!-- What is MCP? -->
      <section class="info-section">
        <h2 class="section-title">
          <span class="material-icons section-icon">help_outline</span>
          What is MCP?
        </h2>
        <div class="info-card">
          <p>
            <strong>Model Context Protocol (MCP)</strong> is an open standard that lets AI assistants
            call external tools and data sources. Once connected, your AI client can calculate
            retirement projections and optimize expenses using the same algorithms that power this app —
            all from a natural language prompt.
          </p>
          <a
            href="https://modelcontextprotocol.io"
            target="_blank"
            rel="noopener noreferrer"
            class="learn-more-link"
          >
            Learn more at modelcontextprotocol.io
            <span class="material-icons link-icon">open_in_new</span>
          </a>
        </div>
      </section>

      <!-- Setup Instructions -->
      <section class="info-section">
        <h2 class="section-title">
          <span class="material-icons section-icon">settings</span>
          Setup
        </h2>
        <div class="setup-grid">
          <!-- Claude Desktop -->
          <div class="setup-card">
            <div class="setup-card-header">
              <span class="material-icons setup-icon">smart_toy</span>
              <h3>Claude Desktop</h3>
            </div>
            <p class="setup-desc">Add to your <code>claude_desktop_config.json</code>:</p>
            <p class="setup-path">
              <strong>macOS:</strong> <code>~/Library/Application Support/Claude/claude_desktop_config.json</code><br />
              <strong>Windows:</strong> <code>%APPDATA%\Claude\claude_desktop_config.json</code>
            </p>
            <div class="code-block-wrapper">
              <pre class="code-block">{{ claudeConfig }}</pre>
              <button class="copy-btn" @click="copy('claude')">
                <span class="material-icons">{{ copied === 'claude' ? 'check' : 'content_copy' }}</span>
                {{ copied === 'claude' ? 'Copied!' : 'Copy' }}
              </button>
            </div>
          </div>

          <!-- Cursor -->
          <div class="setup-card">
            <div class="setup-card-header">
              <span class="material-icons setup-icon">code</span>
              <h3>Cursor</h3>
            </div>
            <p class="setup-desc">
              Add to <code>.cursor/mcp.json</code> in your project, or <code>~/.cursor/mcp.json</code> globally:
            </p>
            <div class="code-block-wrapper" style="margin-top: 2.6rem">
              <pre class="code-block">{{ cursorConfig }}</pre>
              <button class="copy-btn" @click="copy('cursor')">
                <span class="material-icons">{{ copied === 'cursor' ? 'check' : 'content_copy' }}</span>
                {{ copied === 'cursor' ? 'Copied!' : 'Copy' }}
              </button>
            </div>
            <p class="setup-note">Restart Cursor after saving. Tools appear automatically.</p>
          </div>
        </div>
      </section>

      <!-- Available Tools -->
      <section class="info-section">
        <h2 class="section-title">
          <span class="material-icons section-icon">build</span>
          Available Tools
        </h2>
        <div class="tools-grid">
          <div class="tool-card">
            <div class="tool-header">
              <span class="material-icons tool-icon">calculate</span>
              <code class="tool-name">calculate-retirement-plan</code>
            </div>
            <p class="tool-desc">
              Calculates a complete retirement financial plan with year-by-year projections covering
              income, expenses, superannuation growth, age pension eligibility, property equity,
              and inflation-adjusted net wealth.
            </p>
            <div class="tool-outputs">
              <span class="output-label">Returns:</span>
              <span class="output-tag">Summary</span>
              <span class="output-tag">Final wealth</span>
              <span class="output-tag">Final net savings</span>
              <span class="output-tag">Year-by-year projections</span>
            </div>
          </div>

          <div class="tool-card">
            <div class="tool-header">
              <span class="material-icons tool-icon">tune</span>
              <code class="tool-name">optimize-expense</code>
            </div>
            <p class="tool-desc">
              Finds the optimal annual (and monthly) living expense that depletes wealth to
              approximately zero by the plan end age. Uses binary search with cash flow
              sustainability checks.
            </p>
            <div class="tool-outputs">
              <span class="output-label">Returns:</span>
              <span class="output-tag">Optimal annual expense</span>
              <span class="output-tag">Optimal monthly expense</span>
              <span class="output-tag">Final wealth at death age</span>
              <span class="output-tag">Convergence info</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Example Prompts -->
      <section class="info-section">
        <h2 class="section-title">
          <span class="material-icons section-icon">chat</span>
          Example Prompts
        </h2>
        <div class="prompts-grid">
          <div v-for="(prompt, idx) in examplePrompts" :key="idx" class="prompt-card">
            <span class="material-icons prompt-quote-icon">format_quote</span>
            <p class="prompt-text">{{ prompt }}</p>
            <button class="copy-btn prompt-copy-btn" @click="copy('prompt-' + idx)">
              <span class="material-icons">{{ copied === 'prompt-' + idx ? 'check' : 'content_copy' }}</span>
              {{ copied === 'prompt-' + idx ? 'Copied!' : 'Copy prompt' }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const copied = ref<string | null>(null)

const claudeConfig = `{
  "mcpServers": {
    "retirement-planner": {
      "command": "npx",
      "args": ["-y", "retirement-planner-mcp"]
    }
  }
}`

const cursorConfig = `{
  "mcpServers": {
    "retirement-planner": {
      "command": "npx",
      "args": ["-y", "retirement-planner-mcp"]
    }
  }
}`

const examplePrompts = [
  'Calculate a retirement plan for a 40-year-old couple in Australia. Combined salary $180k, savings $200k, super $350k, mortgage $400k on a $800k home, expenses $90k/year. They want to retire at 60.',
  "What's the maximum I can spend each year if I'm 35, earning $120k, have $150k in super, $80k savings, no property, and want to retire at 65?"
]

function copy(key: string) {
  let text = ''
  if (key === 'claude' || key === 'cursor') {
    text = claudeConfig
  } else {
    const idx = parseInt(key.replace('prompt-', ''))
    text = examplePrompts[idx]
  }
  navigator.clipboard.writeText(text).then(() => {
    copied.value = key
    setTimeout(() => { copied.value = null }, 2000)
  })
}
</script>

<style scoped>
.mcp-page {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* Hero */
.hero-section {
  background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
  padding: 3rem 2rem;
  color: white;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.badge-icon {
  font-size: 1rem;
}

.hero-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  margin: 0 0 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.05rem;
  line-height: 1.6;
  opacity: 0.92;
  max-width: 620px;
  margin: 0;
}

/* Page content */
.page-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* Sections */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.section-icon {
  color: var(--accent-text);
  font-size: 1.3rem;
}

/* Info card */
.info-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  line-height: 1.7;
  font-size: 0.97rem;
  color: var(--text-secondary);
}

.info-card strong {
  color: var(--text-primary);
}

.learn-more-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.75rem;
  color: var(--accent-text);
  font-weight: 500;
  font-size: 0.9rem;
  text-decoration: none;
}

.learn-more-link:hover {
  text-decoration: underline;
}

.link-icon {
  font-size: 0.9rem;
}

/* Setup grid */
.setup-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.setup-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.setup-card-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.setup-card-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.setup-icon {
  color: var(--accent-text);
  font-size: 1.4rem;
}

.setup-desc,
.setup-path,
.setup-note {
  font-size: 0.87rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.setup-path code {
  font-size: 0.8rem;
  background: var(--bg-primary);
  padding: 0.1em 0.3em;
  border-radius: 4px;
}

.setup-note {
  font-style: italic;
  margin-top: 0.25rem;
}

/* Code block */
.code-block-wrapper {
  position: relative;
}

.code-block {
  background: #111827;
  color: #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.8rem;
  line-height: 1.6;
  overflow-x: auto;
  margin: 0;
  white-space: pre;
  font-family: 'Courier New', Courier, monospace;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.5rem;
  padding: 0.3rem 0.75rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
}

.copy-btn:hover {
  border-color: var(--accent-text);
  color: var(--accent-text);
}

.copy-btn .material-icons {
  font-size: 0.95rem;
}

/* Tools grid */
.tools-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.tool-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.tool-icon {
  color: var(--accent-text);
  font-size: 1.4rem;
}

.tool-name {
  font-size: 0.9rem;
  background: var(--bg-primary);
  padding: 0.2em 0.5em;
  border-radius: 6px;
  color: var(--accent-text);
  font-weight: 600;
}

.tool-desc {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.tool-outputs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.25rem;
}

.output-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.output-tag {
  font-size: 0.78rem;
  background: rgba(13, 148, 136, 0.12);
  color: var(--accent-text);
  border: 1px solid rgba(13, 148, 136, 0.25);
  border-radius: 999px;
  padding: 0.15em 0.6em;
}

/* Prompts grid */
.prompts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.prompt-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--accent-text);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.prompt-quote-icon {
  color: var(--accent-text);
  font-size: 1.8rem;
  opacity: 0.5;
}

.prompt-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  font-style: italic;
}

.prompt-copy-btn {
  align-self: flex-start;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section {
    padding: 2rem 1.25rem;
  }

  .page-content {
    padding: 1.5rem 1rem;
    gap: 2rem;
  }

  .setup-grid,
  .tools-grid,
  .prompts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
