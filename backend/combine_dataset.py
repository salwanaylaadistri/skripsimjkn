"""
Script untuk membuat dataset_final.csv dari 60 data organik research_logs.
Data real dari pengujian skenario pemula (30) dan mahir (30).
"""

import csv
import sqlite3
import os

HEADER = [
    "session_count", "session_duration", "unique_feature_accessed",
    "feature_frequency", "task_completion_rate", "task_time",
    "error_count", "tutorial_accessed", "shortcut_used",
    "freq_antrean", "freq_riwayat", "freq_perubahan_data", "label"
]

conn = sqlite3.connect(os.path.join(os.path.dirname(__file__), "data", "jkn.db"))
conn.row_factory = sqlite3.Row

rows = conn.execute("SELECT * FROM research_logs ORDER BY id").fetchall()
conn.close()

all_rows = []
for r in rows:
    all_rows.append([
        r["session_count"],
        r["session_duration"],
        r["unique_feature_accessed"],
        r["feature_frequency"],
        r["task_completion_rate"],
        r["task_time"],
        r["error_count"],
        r["tutorial_accessed"],
        r["shortcut_used"],
        r["freq_antrean"],
        r["freq_riwayat"],
        r["freq_perubahan_data"],
        r["label"],
    ])

out_path = os.path.join(os.path.dirname(__file__), "data", "dataset_final.csv")
with open(out_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(HEADER)
    writer.writerows(all_rows)

pemula = sum(1 for r in all_rows if r[-1] == "pemula")
mahir  = sum(1 for r in all_rows if r[-1] == "mahir")
print(f"Dataset final disimpan: {out_path}")
print(f"Total: {len(all_rows)} baris | pemula={pemula} | mahir={mahir}")
