import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "jkn.db")
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row

tables = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print("Tables:", tables)

rows = conn.execute("SELECT user_id, label, freq_antrean, freq_riwayat, freq_perubahan_data FROM research_logs ORDER BY user_id").fetchall()
print(f"Total research_logs: {len(rows)}")
for r in rows:
    uid = r["user_id"]
    lbl = r["label"]
    ant = r["freq_antrean"]
    riw = r["freq_riwayat"]
    ubh = r["freq_perubahan_data"]
    dom = max([(ant, "antrean"), (riw, "riwayat"), (ubh, "perubahan_data")], key=lambda x: x[0])[1]
    print(f"  user_id={uid:3d}  label={lbl:6s}  dominant={dom}")
conn.close()
