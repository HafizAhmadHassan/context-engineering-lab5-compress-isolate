export interface Phase3Agent {
  id: string;
  name: string;
  role: string;
  color: string;
  maxTokenBudget: number;
  tools: string[];
  inputSchema: string;
  outputSchema: string;
}

export interface Finding {
  agentId: string;
  severity: "critical" | "warning" | "info";
  line: number;
  message: string;
}

export const PHASE3_AGENTS: Phase3Agent[] = [
  {
    id: "orchestrator",
    name: "Orchestrator",
    role: "Coordinates the review process: splits the diff, dispatches to specialists, merges findings",
    color: "#f97316",
    maxTokenBudget: 2000,
    tools: ["split_diff", "dispatch_review", "merge_findings"],
    inputSchema: `{
  "diff": "string (unified git diff)",
  "specialists": ["style-agent", "security-agent", "performance-agent"],
  "contracts": { "per_agent": "input/output schemas" }
}`,
    outputSchema: `{
  "status": "success | partial | failed",
  "findings": [{ "agentId", "severity", "line", "message" }],
  "summary": "string"
}`,
  },
  {
    id: "style-agent",
    name: "Style Agent",
    role: "Reviews code style, naming conventions, documentation, and adherence to project standards",
    color: "#3b82f6",
    maxTokenBudget: 1500,
    tools: ["lint_check", "style_guide_lookup"],
    inputSchema: `{
  "diff": "string",
  "style_guide": "path to project style guide"
}`,
    outputSchema: `{
  "findings": [{
    "severity": "info | warning",
    "line": "int",
    "rule": "string (style rule id)",
    "message": "string"
  }]
}`,
  },
  {
    id: "security-agent",
    name: "Security Agent",
    role: "Scans for vulnerabilities: SQL injection, XSS, weak crypto, auth bypasses, secrets exposure",
    color: "#ef4444",
    maxTokenBudget: 1500,
    tools: ["cve_lookup", "sast_scan", "secrets_scan"],
    inputSchema: `{
  "diff": "string",
  "severity_threshold": "critical | high | warning"
}`,
    outputSchema: `{
  "findings": [{
    "severity": "critical | warning",
    "line": "int",
    "cwe": "string (CWE id)",
    "message": "string"
  }]
}`,
  },
  {
    id: "performance-agent",
    name: "Performance Agent",
    role: "Analyzes query efficiency, algorithmic complexity, and resource usage in the diff",
    color: "#22c55e",
    maxTokenBudget: 1500,
    tools: ["query_planner", "complexity_analyzer"],
    inputSchema: `{
  "diff": "string",
  "hot_paths": ["string (function/endpoint names)"]
}`,
    outputSchema: `{
  "findings": [{
    "severity": "warning | info",
    "line": "int",
    "impact": "string (latency / throughput)",
    "message": "string"
  }]
}`,
  },
];

export const PR_DIFF = `diff --git a/app/api/orders.py b/app/api/orders.py
--- a/app/api/orders.py
+++ b/app/api/orders.py
@@ -10,15 +10,17 @@ from flask import Flask, request, jsonify
 
 app = Flask(__name__)
 
-Order = db.Model
-orders_schema = OrderSchema()
-
 @app.route("/orders", methods=["POST"])
 def create_order():
-    order = Order(**request.json)
-    db.session.add(order)
-    db.session.commit()
-    return orders_schema.dump(order), 201
+    conn = sqlite3.connect("orders.db")
+    cur = conn.cursor()
+    data = request.json
+    cur.execute(
+        f"INSERT INTO orders VALUES (NULL, '{data['customer']}', '{data['total']}')"
+    )
+    conn.commit()
+    order_id = cur.lastrowid
+    conn.close()
+    return {"id": order_id}, 201
 
 @app.route("/orders/<int:order_id>", methods=["GET"])
 def get_order(order_id):
-    order = Order.query.get_or_404(order_id)
-    return orders_schema.dump(order)
+    conn = sqlite3.connect("orders.db")
+    cur = conn.cursor()
+    cur.execute(f"SELECT * FROM orders WHERE id = {order_id}")
+    row = cur.fetchone()
+    conn.close()
+    return {"id": row[0], "customer": row[1], "total": row[2]}
+
+@app.route("/orders/search", methods=["GET"])
+def search_orders():
+    q = request.args.get("q")
+    conn = sqlite3.connect("orders.db")
+    cur = conn.cursor()
+    cur.execute(f"SELECT * FROM orders WHERE customer LIKE '%{q}%'")
+    rows = cur.fetchall()
+    conn.close()
+    return jsonify(rows)
+
+@app.route("/orders/<int:order_id>/receipt", methods=["GET"])
+def receipt(order_id):
+    conn = sqlite3.connect("orders.db")
+    cur = conn.cursor()
+    cur.execute(f"SELECT * FROM orders WHERE id = {order_id}")
+    row = cur.fetchone()
+    conn.close()
+    token = hashlib.md5(f"{order_id}-{row[2]}".encode()).hexdigest()
+    return {"receipt_token": token}
+
+@app.route("/orders/bulk", methods=["POST"])
+def bulk_orders():
+    conn = sqlite3.connect("orders.db")
+    cur = conn.cursor()
+    for o in request.json["orders"]:
+        cur.execute(f"INSERT INTO orders VALUES (NULL, '{o['customer']}', '{o['total']}')")
+    conn.commit()
+    conn.close()
+    return {"status": "ok"}, 201
+
+@app.route("/orders/clear", methods=["POST"])
+def clear_orders():
+    conn = sqlite3.connect("orders.db")
+    cur = conn.cursor()
+    cur.execute("DELETE FROM orders")
+    conn.commit()
+    conn.close()
+    return {"status": "cleared"}
+
+@app.route("/orders", methods=["DELETE"])
+def delete_orders():
+    conn = sqlite3.connect("orders.db")
+    cur = conn.cursor()
+    cur.execute("DELETE FROM orders WHERE 1=1")
+    conn.commit()
+    conn.close()
+    return {"status": "deleted"}
+
+def make_token():
+    import random
+    token = "".join(random.choices("abcdef0123456789", k=16))
+    return token`;

export const MULTI_AGENT_FINDINGS: Finding[] = [
  { agentId: "security-agent", severity: "critical", line: 19, message: "SQL injection via f-string interpolation of request JSON into INSERT statement" },
  { agentId: "security-agent", severity: "critical", line: 36, message: "Weak MD5 hashing used for receipt tokens — insecure and predictable" },
  { agentId: "performance-agent", severity: "warning", line: 56, message: "N+1 query pattern in bulk insert loop — opens a new connection per order" },
  { agentId: "style-agent", severity: "info", line: 37, message: "Mixed ORM and raw SQL; inconsistent with project conventions" },
  { agentId: "security-agent", severity: "critical", line: 52, message: "SQL injection in LIKE clause of search endpoint — unescaped user input" },
  { agentId: "security-agent", severity: "critical", line: 58, message: "Auth bypass: search and receipt endpoints have no authentication" },
  { agentId: "security-agent", severity: "warning", line: 62, message: "Secrets / internal paths exposed in error output" },
  { agentId: "performance-agent", severity: "warning", line: 74, message: "Connection not closed on exception path — resource leak" },
  { agentId: "style-agent", severity: "info", line: 78, message: "Magic constant SQL repeated; extract to a helper" },
  { agentId: "performance-agent", severity: "warning", line: 22, message: "Connection opened per request; consider a connection pool" },
  { agentId: "security-agent", severity: "critical", line: 45, message: "Mass assignment risk: DELETE with 1=1 could wipe all records" },
  { agentId: "style-agent", severity: "info", line: 88, message: "make_token uses psuedo-random — prefer secrets module" },
];

export const SINGLE_AGENT_FINDINGS = [
  { severity: "critical", line: 19, message: "SQL injection via f-string interpolation" },
  { severity: "critical", line: 36, message: "MD5 weak hashing" },
  { severity: "warning", line: 56, message: "N+1 query in bulk insert" },
  { severity: "info", line: 37, message: "Mixed ORM/SQL" },
];

export const CONTRACT_VALIDATION = [
  { agentId: "orchestrator", valid: true, errors: [] },
  { agentId: "style-agent", valid: true, errors: [] },
  { agentId: "security-agent", valid: true, errors: [] },
  { agentId: "performance-agent", valid: false, errors: [{ text: "Output schema missing 'severity' field in findings" }] },
];
