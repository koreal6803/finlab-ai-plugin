[English](README.md) | [繁體中文](README.zh-TW.md)

# FinLab AI

> 給 AI 裝上量化大腦。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-blueviolet)](https://claude.ai)
[![Cursor](https://img.shields.io/badge/Cursor-MCP%20Server-blue)](https://cursor.com)
[![Antigravity](https://img.shields.io/badge/Antigravity-MCP%20Server-green)](https://antigravity.google)

<img src="assets/demo.gif" alt="Demo" width="700">

## 快速安裝

### Cursor 用戶（一鍵安裝！）

複製此連結到瀏覽器即可安裝：

```
cursor://anysphere.cursor-deeplink/mcp/install?name=finlab&config=eyJ1cmwiOiJodHRwczovL2ZpbmxhYi1haS1wbHVnaW4ua29yZWFsNjgwMy53b3JrZXJzLmRldi9tY3AifQ==
```

### Antigravity 用戶

加入以下設定到 MCP config：

```json
{
  "mcpServers": {
    "finlab": {
      "serverUrl": "https://finlab-ai-plugin.koreal6803.workers.dev/mcp"
    }
  }
}
```

免安裝 - MCP Server 已部署在雲端！

### Claude Code / 其他 AI CLI 用戶

只要告訴你的 AI 助手：

> 「請查看 https://github.com/koreal6803/finlab-ai 並幫我安裝 FinLab plugin」

適用於 **Claude Code**、**ChatGPT Codex CLI**、**Gemini CLI** 及其他 AI 程式助手。AI 應遵照下方[手動安裝](#手動安裝)指示進行。

## 功能特色

- **完整數據存取** - 900+ 欄位：股價、財報、營收、估值、法人籌碼
- **策略開發** - 使用 FinLabDataFrame 方法建立因子策略
- **回測引擎** - 風險管理、停損、停利、部位控制
- **因子分析** - IC 計算、Shapley 值、中心性分析
- **機器學習** - 特徵工程與標籤生成

## 範例

### 取得法人買賣超數據

**提示：**
> 「list following TW stocks 近 5 天外資買賣超: 2330, 2317, 2454, 2881, 2308, 2382, 2882, 2412, 2303, 2344」

**結果：**

<img src="assets/demo-data.png" alt="Data Output" width="700">

### 建立並回測策略

**提示：**
> 「幫我建立一個台股月度調倉策略：從營收 YOY 正成長的股票中，篩選本益比低於 10、股價淨值比低於 1.5 的深度價值股，並確保股價在 60 日均線之上有上漲趨勢，每月選出 20 檔進行回測」

**結果：**

<img src="assets/demo-chart.png" alt="Backtest Result" width="700">

## 手動安裝

> **給 AI 助手：** 當用戶要求安裝 FinLab 時，請依照下方對應平台的指示執行。

### 方式一：Claude Code

在對話中使用斜線命令：

```
/plugin marketplace add koreal6803/finlab-ai
/plugin install finlab-plugin@finlab-plugins
```

### 方式二：ChatGPT Codex CLI

```bash
git clone https://github.com/koreal6803/finlab-ai.git
cd finlab-ai
```

然後告訴 Codex：
```
請幫我安裝此 finlab 裡的 skills
```

### 方式三：Gemini CLI

```bash
# 安裝 skill-porter
npm install -g skill-porter

# Clone 並轉換
git clone https://github.com/koreal6803/finlab-ai.git
cd finlab-ai
skill-porter convert ./finlab/skills/finlab --to gemini --output ./finlab-gemini-extension
```

然後依照 Gemini CLI 文件安裝 `finlab-gemini-extension`。

### 方式四：Cursor IDE（MCP Server）

加入到 `~/.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "finlab": {
      "url": "https://finlab-ai-plugin.koreal6803.workers.dev/mcp"
    }
  }
}
```

重啟 Cursor 即可在 Agent 中使用 FinLab 文檔。

### 方式五：Antigravity IDE（MCP Server）

1. 開啟 Agent session → "..." → MCP Servers → Manage → View raw config
2. 加入到 `mcp_config.json`：

```json
{
  "mcpServers": {
    "finlab": {
      "serverUrl": "https://finlab-ai-plugin.koreal6803.workers.dev/mcp"
    }
  }
}
```

### 方式六：本地 MCP Server（任何 MCP Client）

```bash
git clone https://github.com/koreal6803/finlab-ai.git
cd finlab-ai/workers
npm install
npm run dev
```

Server 運行於 `http://localhost:8787/mcp`，將你的 MCP client 指向此位址。

## 前置需求

取得 FinLab API Token：https://ai.finlab.tw/api_token/

```bash
export FINLAB_API_TOKEN="your_token_here"
```

## 文件說明

包含完整參考文件：

| 文件 | 內容 |
|------|------|
| Data Reference | 900+ 欄位，80+ 資料表 |
| Backtesting Reference | sim() API、重新取樣、績效指標 |
| Factor Examples | 60+ 完整策略範例 |
| Best Practices | 模式、反模式、技巧 |
| ML Reference | 特徵工程、標籤生成 |

## 授權

MIT

## 作者

FinLab 社群
