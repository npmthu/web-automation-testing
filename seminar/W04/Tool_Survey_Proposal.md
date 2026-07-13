# Tool Survey Proposal — T02 Web Automation Testing

**CS423/CSC15003 Software Testing · 23KTPM 4 · Stage S1**
**Team:** Group 7 — Lê Hữu Minh Quang (23127108), Đặng Nguyễn Thành Hiếu (23127364), Nguyễn Đăng Khoa (23127393), Nguyễn Phạm Minh Thư (23127307)

## 1. Topic

**T02 — Web Automation Testing.** Scope: automate three EShop flows — Login + lockout (FR-02), Add-to-Cart (FR-07), Checkout (FR-08) — with one traditional framework, then contrast against AI-augmented agentic test generation and self-healing, measuring flakiness over 10 runs on a network-throttled environment.

## 2. Candidate tools

- **Traditional:** Playwright _(main)_ · Cypress _(backup)_ · Selenium 4 _(considered)_
- **AI-augmented:** **GitHub Copilot Agent Mode + Playwright MCP** _(main: agentic test generation + Healer self-healing)_ · Testim Community _(backup AI)_ · Mabl _(considered, dropped — no ongoing free tier, 14-day trial only; conflicts with our 3-week schedule)_

## 3. Comparison matrix

| Criterion          | Playwright                                               | Cypress (backup)                           | Selenium 4         | Copilot + Playwright MCP                                                                                                                                  | Testim Community (backup)             |
| ------------------ | -------------------------------------------------------- | ------------------------------------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **Licence cost**   | Free, OSS (Apache 2.0)                                   | App free (MIT); Cloud free ≈500 results/mo | Free, OSS          | MCP server free & OSS (Microsoft); Copilot Free ≈50 chat req/mo, Student plan if verified before Apr 2026 pause                                           | Free plan ≈1,000 runs/mo, Chrome-only |
| **Learning curve** | Low: codegen + trace-viewer                              | Very low, best DX                          | Highest            | Low setup (VS Code ≥1.99 built-in MCP, one-click config, Node 18+); real skill = prompt-budgeting + auditing agent output                                 | Low: codeless recorder                |
| **EShop fit**      | Multi-browser + network throttling → flakiness milestone | OK, Chrome-family limits                   | OK, slow authoring | Agent drives a real browser on EShop, reads accessibility tree, emits Playwright specs → fits S3-M4 exactly                                               | Record FR-02, mutate DOM              |
| **AI capability**  | None (baseline)                                          | None (baseline)                            | None (baseline)    | Agentic loop Planner→Generator→**Healer** (self-healing); locators grounded in live page state, not guessed from code                                     | Smart Locators (attribute-weight ML)  |
| **Community**      | Very large, Microsoft-backed                             | Large, mature                              | Largest legacy     | First-party Microsoft/GitHub docs; documented failure modes (mis-clicks on ambiguous buttons, skipped state-dependent steps) → evidence for User Guide §6 | Smaller (Tricentis)                   |

## 4. Pick + rationale

**Playwright (traditional) + GitHub Copilot Agent Mode with Playwright MCP (AI).**

- **Zero licence cost, one coherent stack:** the MCP server is official Microsoft OSS and the AI output is plain Playwright TypeScript committed to our repo — tests survive even if Copilot access ends, and no trial-expiry cliff (which eliminated Mabl).
- **Covers both required AI angles in one workflow:** MCP-grounded generation satisfies "rewrite one flow with an AI tool", and the Healer agent satisfies the "self-healing locator" objective via the brief's permitted "Copilot-suggested locator strategy" alternative — so the rule of pairing (traditional + AI feature live) is demonstrated inside a single live session.
- **Strongest teaching contrast:** we can demo the same FR-07 flow three ways — hand-written vs Copilot-only (guessing DOM) vs Copilot+MCP (reading real accessibility tree) — which directly powers the "Locator Brawl" in-class activity and the assertion-diff milestone.

**Risk & mitigation:** Copilot Free caps chat/agent usage and agent sessions consume requests quickly → we will (1) assume that members of the class already verified on the GitHub Student plan (new sign-ups paused since Apr 2026), (2) batch scenarios per agent session, (3) keep Testim Community (free, no expiry) as the fallback.

## 5. AI Disclosure

We used **Claude (Anthropic)** to run web searches and draft the comparison matrix. We manually cross-checked every claim against official/first-party pages: `github.com/microsoft/playwright-mcp` and Microsoft developer blog (MCP server OSS status, agent workflow), GitHub Docs + `github.com/features/copilot/plans` (Copilot Free limits; Apr 2026 pause on new Student/Pro sign-ups), `mabl.com/pricing` (14-day trial, no free tier — contradicting an earlier draft claim), and Testim plan pages. Claims not verifiable on an official page were removed or marked as third-party estimates in the team log.
