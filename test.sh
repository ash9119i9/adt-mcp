#!/bin/sh
# Usage: ./test.sh <PROGRAM>  - calls the MCP tool directly, using the settings in index.js
P="${1:-RSPARAM}"
DIR="$(dirname "$0")"
{
  echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"test","version":"1"}}}'
  echo '{"jsonrpc":"2.0","method":"notifications/initialized"}'
  echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"read_abap_program","arguments":{"program_name":"'"$P"'"}}}'
  sleep 15
} | node "$DIR/index.js" 2>/dev/null | grep '"id":2' | node -e '
  let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
    if (!s) return console.log("No response (timed out?)");
    const r = JSON.parse(s).result;
    console.log(r.isError ? "ERROR: " : "OK:\n", r.content[0].text);
    process.exit(0);
  });'
