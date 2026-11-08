import json, os, sys, urllib.request, urllib.error

env_path = os.path.expanduser("~/.config/cloudflare/dns.env")
for line in open(env_path):
    line = line.strip()
    if line.startswith("export "):
        line = line[7:]
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip("'\""))

TOKEN = os.environ["CLOUDFLARE_API_TOKEN"]
ZONE = os.environ["CLOUDFLARE_ZONE_ID"]
ACCT = "c6a262e51d3ee3a0ff1f41f27ef14283"
TUNNEL = "097a02d0-0a50-4629-bf6c-e01cbe9f2b4a"
NEW = [
    {"hostname": "knowledge.integ.life", "service": "http://localhost:18512", "originRequest": {}},
]

def api(method, path, body=None):
    req = urllib.request.Request(
        "https://api.cloudflare.com/client/v4" + path, method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        try:
            return json.load(e)
        except Exception:
            return {"success": False, "errors": [{"message": str(e)}]}

r = api("GET", f"/accounts/{ACCT}/cfd_tunnel/{TUNNEL}/configurations")
assert r.get("success"), r.get("errors")
result = r["result"]
with open(os.path.expanduser("~/tunnel-config-backup-knowledge.json"), "w") as f:
    json.dump(result, f, ensure_ascii=False, indent=1)
cfg = result["config"]
ingress = cfg.get("ingress") or []
hosts = [x.get("hostname") for x in ingress]
print("current version:", result.get("version"), "rules:", len(ingress))
for n in NEW:
    assert n["hostname"] not in hosts, f"already present: {n['hostname']}"

assert ingress and ingress[-1].get("hostname") is None and "404" in str(ingress[-1].get("service")), "unexpected tail rule"
new_ingress = ingress[:-1] + NEW + ingress[-1:]
new_cfg = dict(cfg)
new_cfg["ingress"] = new_ingress

r2 = api("PUT", f"/accounts/{ACCT}/cfd_tunnel/{TUNNEL}/configurations", {"config": new_cfg})
print("PUT success:", r2.get("success"), (r2.get("errors") or [{}])[0].get("message", ""))
if not r2.get("success"):
    sys.exit(1)
print("new version:", (r2.get("result") or {}).get("version"))

r3 = api("GET", f"/accounts/{ACCT}/cfd_tunnel/{TUNNEL}/configurations")
ing3 = ((r3.get("result") or {}).get("config") or {}).get("ingress") or []
print("rules after:", len(ing3))
for rule in ing3:
    if rule.get("hostname") == "knowledge.integ.life":
        print("  OK", rule.get("hostname"), "->", rule.get("service"))

name = "knowledge.integ.life"
ex = api("GET", f"/zones/{ZONE}/dns_records?name={name}")
recs = ex.get("result") or []
if recs:
    print("DNS exists:", name, recs[0].get("type"), recs[0].get("content"))
else:
    cr = api("POST", f"/zones/{ZONE}/dns_records", {
        "type": "CNAME", "name": name,
        "content": f"{TUNNEL}.cfargotunnel.com", "proxied": True, "ttl": 1})
    print("DNS create", name, cr.get("success"), (cr.get("errors") or [{}])[0].get("message", ""))
print("DONE")
