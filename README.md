<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/English-blue?style=for-the-badge" alt="English"></a>
  <a href="README.zh-TW.md"><img src="https://img.shields.io/badge/繁體中文-red?style=for-the-badge" alt="繁體中文"></a>
</p>

<p align="center">
  <img src="assets/banner.png" alt="FinLab AI Plugin Banner" width="800">
</p>

# FinLab AI Plugin

> AI-powered quantitative trading skill for Taiwan stock market (台股)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-blueviolet)](https://claude.ai)
[![Cursor](https://img.shields.io/badge/Cursor-MCP%20Server-blue)](https://cursor.com)
[![Antigravity](https://img.shields.io/badge/Antigravity-MCP%20Server-green)](https://antigravity.google)

<p align="center">
  <img src="assets/demo.gif" alt="Demo" width="700">
</p>

## Quick Install

### For Cursor Users (One-Click!)

<a href="cursor://anysphere.cursor-deeplink/mcp/install?name=finlab&config=eyJ1cmwiOiJodHRwczovL2ZpbmxhYi1haS1wbHVnaW4ua29yZWFsNjgwMy53b3JrZXJzLmRldi9tY3AifQ%3D%3D">
  <img src="https://cursor.com/deeplink/mcp-install-dark.svg" alt="Install in Cursor" height="32">
</a>

### For Cursor / Antigravity IDE Users (Manual)

Add this to your MCP config (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "finlab": {
      "url": "https://finlab-ai-plugin.koreal6803.workers.dev/mcp"
    }
  }
}
```

No installation needed - the MCP server is hosted remotely!

### For Claude Code / Other AI CLI Users

Simply tell your AI assistant:

> "Please look at https://github.com/koreal6803/finlab-ai-plugin and install the FinLab skill for me"

This works with **Claude Code**, **ChatGPT Codex CLI**, **Gemini CLI**, and other AI coding assistants.

## Features

- **Comprehensive Data Access** - 900+ data columns: prices, financials, revenue, valuations, institutional trading
- **Strategy Development** - Factor-based strategies using FinLabDataFrame methods
- **Backtesting Engine** - Risk management, stop-loss, take-profit, position sizing
- **Factor Analysis** - IC calculation, Shapley values, centrality analysis
- **Machine Learning** - Feature engineering and label generation for ML models

## Examples

### Fetch Institutional Trading Data

**Prompt:**
> "List following TW stocks 近 5 天外資買賣超: 2330, 2317, 2454, 2881, 2308, 2382, 2882, 2412, 2303, 2344"

**Result:**

<img src="assets/demo-data.png" alt="Data Output" width="700">

### Build & Backtest a Strategy

**Prompt:**
> "Build a monthly rebalancing strategy for Taiwan stocks: select stocks with positive revenue YoY growth, P/E ratio below 10, P/B ratio below 1.5 (deep value), and price above 60-day moving average (uptrend). Pick top 20 stocks monthly and backtest."

**Result:**

<img src="assets/demo-chart.png" alt="Backtest Result" width="700">

## Manual Installation

### Option 1: Claude Code

```bash
# Add marketplace
/plugin marketplace add koreal6803/finlab-ai-plugin

# Install plugin
/plugin install finlab-plugin@finlab-plugins
```

### Option 2: ChatGPT Codex CLI

```bash
git clone https://github.com/koreal6803/finlab-ai-plugin.git
cd finlab-ai-plugin
```

Then tell Codex:
```
請幫我安裝此finlab-plugin 裡的 skills
```

### Option 3: Gemini CLI

```bash
# Install skill-porter
npm install -g skill-porter

# Clone and convert
git clone https://github.com/koreal6803/finlab-ai-plugin.git
cd finlab-ai-plugin
skill-porter convert ./finlab-plugin/skills/finlab --to gemini --output ./finlab-gemini-extension
```

Then install the generated `finlab-gemini-extension` following Gemini CLI docs.

### Option 4: Cursor IDE (MCP Server)

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "finlab": {
      "url": "https://finlab-ai-plugin.koreal6803.workers.dev/mcp"
    }
  }
}
```

Restart Cursor and start using FinLab documentation in your Agent.

### Option 5: Antigravity IDE (MCP Server)

1. Open Agent session → "..." → MCP Servers → Manage → View raw config
2. Add to `mcp_config.json`:

```json
{
  "mcpServers": {
    "finlab": {
      "url": "https://finlab-ai-plugin.koreal6803.workers.dev/mcp"
    }
  }
}
```

### Option 6: Local MCP Server (Any MCP Client)

```bash
# Clone and install
git clone https://github.com/koreal6803/finlab-ai-plugin.git
cd finlab-ai-plugin
pip install -e .

# Run the MCP server
python -m mcp_server
```

Configure your MCP client to use stdio transport with command `python -m mcp_server`.

## Prerequisites

Get your FinLab API token: https://ai.finlab.tw/api_token/

```bash
export FINLAB_API_TOKEN="your_token_here"
```

## Documentation

The plugin includes comprehensive reference docs:

| Document | Content |
|----------|---------|
| Data Reference | 900+ columns across 80+ tables |
| Backtesting Reference | sim() API, resampling, metrics |
| Factor Examples | 60+ complete strategy examples |
| Best Practices | Patterns, anti-patterns, tips |
| ML Reference | Feature engineering, labels |

## License

MIT

## Author

FinLab Community
