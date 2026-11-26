#!/usr/bin/env node
// Minimal SAP ABAP ADT MCP server (POC) - one tool: read an ABAP report's source.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ---- SAP connection settings (POC: hardcoded here - do not commit/share this file with real credentials) ----
const SAP_URL = "https://your-sap-host:44300"; // ADT host + HTTP(S) port, no trailing path
const SAP_USER = "YOUR_USER";
const SAP_PASSWORD = "YOUR_PASSWORD";
const SAP_CLIENT = "100";
const SAP_LANGUAGE = "EN";
const SAP_INSECURE = true; // true = accept self-signed TLS certificates
// ------------------------------------------------------------------------------------------------------------

// Allow self-signed certificates (common on dev/sandbox SAP systems).
if (SAP_INSECURE) process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const baseUrl = SAP_URL.replace(/\/+$/, "");
const authHeader = "Basic " + Buffer.from(`${SAP_USER}:${SAP_PASSWORD}`).toString("base64");

async function adtGet(path, accept = "text/plain") {
  const url = new URL(baseUrl + path);
  if (SAP_CLIENT) url.searchParams.set("sap-client", SAP_CLIENT);
  url.searchParams.set("sap-language", SAP_LANGUAGE);

  const res = await fetch(url, { headers: { Authorization: authHeader, Accept: accept } });
  const body = await res.text();
  if (!res.ok) throw new Error(`ADT ${res.status} ${res.statusText} for ${path}\n${body.slice(0, 500)}`);
  return body;
}

const server = new McpServer({ name: "sap-adt-mcp", version: "0.1.0" });

server.registerTool(
  "read_abap_program",
  {
    title: "Read ABAP program",
    description: "Read the source code of an ABAP report/program (SE38) from the SAP system via ADT.",
    inputSchema: { program_name: z.string().describe("Program name, e.g. ZHELLO_WORLD") },
  },
  async ({ program_name }) => {
    const name = program_name.trim().toUpperCase();
    try {
      const source = await adtGet(`/sap/bc/adt/programs/programs/${encodeURIComponent(name.toLowerCase())}/source/main`);
      return { content: [{ type: "text", text: source }] };
    } catch (err) {
      return { isError: true, content: [{ type: "text", text: `Failed to read program ${name}: ${err.message}${err.cause ? ` (${err.cause.code ?? err.cause.message})` : ""}` }] };
    }
  }
);

await server.connect(new StdioServerTransport());
console.error(`sap-adt-mcp running (system: ${baseUrl}, client: ${SAP_CLIENT ?? "default"})`);
