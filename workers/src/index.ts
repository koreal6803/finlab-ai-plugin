/**
 * FinLab MCP Server for Cloudflare Workers
 * Provides FinLab documentation via Model Context Protocol (Streamable HTTP)
 */

import { DOCS } from './docs';

interface Env {
  FEEDBACK: KVNamespace;
}

interface Feedback {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  message: string;
  context?: string;
  timestamp: string;
}

interface McpRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface McpResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string };
}

interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// Available tools
const TOOLS: Tool[] = [
  {
    name: 'list_documents',
    description: 'List all available FinLab documentation files',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_document',
    description: 'Get the full content of a FinLab documentation file',
    inputSchema: {
      type: 'object',
      properties: {
        doc_name: {
          type: 'string',
          description: 'Name of the document (without .md extension). Available: ' + Object.keys(DOCS).join(', '),
        },
      },
      required: ['doc_name'],
    },
  },
  {
    name: 'search_finlab_docs',
    description: 'Search for a keyword or phrase in all FinLab documentation',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search term to look for (case-insensitive)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_factor_examples',
    description: 'Get factor/strategy examples from the documentation',
    inputSchema: {
      type: 'object',
      properties: {
        factor_type: {
          type: 'string',
          description: 'Type of factor: all, value, momentum, technical, quality, ml',
          default: 'all',
        },
      },
    },
  },
];

// Tool implementations
function listDocuments(): string {
  const docs = Object.entries(DOCS).map(([name, content]) => {
    const firstLine = content.split('\n').find(l => l.trim())?.replace(/^#+\s*/, '').trim() || '';
    return `- **${name}**: ${firstLine}`;
  });
  return '## Available FinLab Documents\n\n' + docs.join('\n');
}

function getDocument(docName: string): string {
  if (docName in DOCS) {
    return DOCS[docName];
  }
  return `Document '${docName}' not found.\n\nAvailable documents: ${Object.keys(DOCS).join(', ')}`;
}

function searchDocs(query: string): string {
  const queryLower = query.toLowerCase();
  const results: { file: string; line: number; match: string }[] = [];

  for (const [name, content] of Object.entries(DOCS)) {
    if (!content.toLowerCase().includes(queryLower)) continue;

    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(queryLower)) {
        const start = Math.max(0, i - 2);
        const end = Math.min(lines.length, i + 6);
        results.push({
          file: name,
          line: i + 1,
          match: lines.slice(start, end).join('\n'),
        });
      }
    }
  }

  if (results.length === 0) {
    return `No results found for '${query}'`;
  }

  let output = `## Search Results: ${query}\n\n`;
  for (const r of results.slice(0, 10)) {
    output += `### ${r.file} (line ${r.line})\n\`\`\`\n${r.match}\n\`\`\`\n\n`;
  }
  return output;
}

function getFactorExamples(factorType: string = 'all'): string {
  const content = DOCS['factor-examples'];
  if (!content) return 'factor-examples not found';

  if (factorType === 'all') return content;

  const sections = content.split('\n## ');
  const matching = sections.filter(s => s.toLowerCase().includes(factorType.toLowerCase()));

  if (matching.length === 0) {
    return `No examples found for factor type '${factorType}'. Try: value, momentum, technical, quality, ml`;
  }

  return matching.map(s => '## ' + s).join('\n\n');
}

const DEPRECATION_NOTICE = `⚠️ DEPRECATION NOTICE: This MCP server will be retired soon. Please switch to the FinLab Skill for a better experience (richer documentation, faster responses, no network dependency).

To upgrade, run:
  npx skills add koreal6803/finlab-ai -a claude-code -y

After installing, you can remove this MCP server from your config.
---

`;

function handleToolCall(name: string, args: Record<string, unknown>): string {
  let result: string;
  switch (name) {
    case 'list_documents':
      result = listDocuments();
      break;
    case 'get_document':
      result = getDocument(args.doc_name as string);
      break;
    case 'search_finlab_docs':
      result = searchDocs(args.query as string);
      break;
    case 'get_factor_examples':
      result = getFactorExamples((args.factor_type as string) || 'all');
      break;
    default:
      return `Unknown tool: ${name}`;
  }
  return DEPRECATION_NOTICE + result;
}

function handleMcpRequest(request: McpRequest): McpResponse {
  const { id, method, params } = request;

  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          serverInfo: {
            name: 'finlab-docs',
            version: '1.0.0',
          },
          capabilities: {
            tools: {},
          },
        },
      };

    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id,
        result: { tools: TOOLS },
      };

    case 'tools/call':
      const toolName = (params as { name: string }).name;
      const toolArgs = (params as { arguments?: Record<string, unknown> }).arguments || {};
      const content = handleToolCall(toolName, toolArgs);
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: content }],
        },
      };

    default:
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method not found: ${method}` },
      };
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Install script
    if (url.pathname === '/install.sh') {
      const script = `#!/bin/sh
set -e

REPO="koreal6803/finlab-ai"
SKILL_SRC="finlab-plugin/skills/finlab"

# --- Colors ---
RED="\\033[0;31m"
GREEN="\\033[0;32m"
YELLOW="\\033[0;33m"
CYAN="\\033[0;36m"
BOLD="\\033[1m"
RESET="\\033[0m"

info()  { printf "\${CYAN}%s\${RESET}\\n" "$1"; }
ok()    { printf "\${GREEN}%s\${RESET}\\n" "$1"; }
warn()  { printf "\${YELLOW}%s\${RESET}\\n" "$1"; }
err()   { printf "\${RED}%s\${RESET}\\n" "$1" >&2; }

# --- Detect target ---
detect_target() {
  if command -v claude >/dev/null 2>&1; then
    echo "claude-code"
  elif command -v codex >/dev/null 2>&1; then
    echo "codex"
  elif command -v gemini >/dev/null 2>&1; then
    echo "gemini-cli"
  else
    echo ""
  fi
}

skill_dir() {
  case "$1" in
    claude-code) echo "\$HOME/.claude/skills/finlab" ;;
    codex)       echo "\$HOME/.codex/skills/finlab" ;;
    gemini-cli)  echo "\$HOME/.gemini/skills/finlab" ;;
  esac
}

# --- Main ---
printf "\\n\${BOLD}  FinLab AI Installer\${RESET}\\n"
printf "  ────────────────────\\n\\n"

TARGET=\$(detect_target)

if [ -z "\$TARGET" ]; then
  err "No supported AI CLI found."
  echo ""
  echo "  Please install one of:"
  echo "    - Claude Code:  npm install -g @anthropic-ai/claude-code"
  echo "    - Codex CLI:    npm install -g @openai/codex"
  echo "    - Gemini CLI:   npm install -g @anthropic-ai/gemini-cli"
  echo ""
  exit 1
fi

info "Detected: \$TARGET"

# Install uv if missing (needed to run Python code)
if ! command -v uv >/dev/null 2>&1; then
  info "Installing uv (Python package manager)..."
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="\$HOME/.local/bin:\$PATH"
  if command -v uv >/dev/null 2>&1; then
    ok "uv installed successfully."
  else
    warn "uv installation failed. You can install it later: https://docs.astral.sh/uv/"
  fi
else
  info "uv: already installed."
fi

# Try npx first
if command -v npx >/dev/null 2>&1; then
  info "Installing via npx..."
  if npx skills add "\$REPO" -a "\$TARGET" -y 2>/dev/null; then
    echo ""
    ok "Done! FinLab AI skill installed for \$TARGET."
    echo ""
    echo "  Start your CLI and try: /finlab"
    echo ""
    exit 0
  fi
  warn "npx method failed, falling back to git clone..."
fi

# Fallback: git clone
if ! command -v git >/dev/null 2>&1; then
  err "git is not installed. Please install git or Node.js and try again."
  exit 1
fi

DEST=\$(skill_dir "\$TARGET")
info "Installing via git clone -> \$DEST"

TMP=\$(mktemp -d)
trap 'rm -rf "\$TMP"' EXIT

git clone --depth 1 "https://github.com/\$REPO.git" "\$TMP/finlab-ai" 2>/dev/null

mkdir -p "\$(dirname "\$DEST")"
rm -rf "\$DEST"
cp -r "\$TMP/finlab-ai/\$SKILL_SRC" "\$DEST"

echo ""
ok "Done! FinLab AI skill installed for \$TARGET."
echo ""
echo "  Installed to: \$DEST"
echo "  Start your CLI and try: /finlab"
echo ""
`;
      return new Response(script, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // Health check
    if (url.pathname === '/health' || url.pathname === '/') {
      return new Response(JSON.stringify({ status: 'ok', server: 'finlab-mcp' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Feedback DELETE endpoint - /feedback/{id}
    if (url.pathname.startsWith('/feedback/') && request.method === 'DELETE') {
      const id = url.pathname.slice('/feedback/'.length);
      if (!id) {
        return new Response(JSON.stringify({ error: 'id required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      await env.FEEDBACK.delete(`feedback:${id}`);
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Feedback endpoint - POST to submit, GET to retrieve
    if (url.pathname === '/feedback') {
      if (request.method === 'POST') {
        try {
          const body = await request.json() as { type?: string; message: string; context?: string };
          if (!body.message) {
            return new Response(JSON.stringify({ error: 'message is required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
          }
          const feedback: Feedback = {
            id: crypto.randomUUID(),
            type: (['bug', 'feature', 'improvement', 'other'].includes(body.type || '')
              ? body.type : 'other') as Feedback['type'],
            message: body.message,
            context: body.context,
            timestamp: new Date().toISOString(),
          };
          await env.FEEDBACK.put(`feedback:${feedback.id}`, JSON.stringify(feedback), {
            expirationTtl: 30 * 24 * 60 * 60,  // 30 days
          });
          return new Response(JSON.stringify({ success: true, id: feedback.id }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
      }
      if (request.method === 'GET') {
        const list = await env.FEEDBACK.list({ prefix: 'feedback:' });
        const feedbacks: Feedback[] = [];
        for (const key of list.keys) {
          const val = await env.FEEDBACK.get(key.name);
          if (val) feedbacks.push(JSON.parse(val));
        }
        feedbacks.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        return new Response(JSON.stringify(feedbacks), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // MCP endpoint
    if (url.pathname === '/mcp' || url.pathname === '/sse') {
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
      }

      try {
        const body = await request.json() as McpRequest;
        const response = handleMcpRequest(body);
        return new Response(JSON.stringify(response), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (e) {
        return new Response(JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: { code: -32700, message: 'Parse error' },
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    return new Response('Not found', { status: 404 });
  },
};
