# adt-mcp

Minimal MCP server (POC) for SAP ABAP Development Tools (ADT).

## Tool
- `read_abap_program` – reads the source code of an ABAP report/program via `/sap/bc/adt/programs/programs/<name>/source/main`.

## Setup
1. `npm install`
2. Set the SAP connection constants at the top of `index.js` (URL, user, password, client).
   **Do not commit real credentials.**
3. Test: `./test.sh RSPARAM`
4. Use with Claude Code: run `claude` in this folder (`.mcp.json` registers the `sap-adt` server).
