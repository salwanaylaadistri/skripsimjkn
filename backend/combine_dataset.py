"""
Script untuk menggabungkan dataset sintetis dengan data real dari pengujian manual.
- 10 data real pemula (user_id=1): label pemula
- 10 data real mahir (user_id=2): label mahir
- 60 data sintetis: label dari generate_dataset.py
Total: 80 baris
"""

import csv
import sqlite3
import random
import os

random.seed(42)

HEADER = [
    "session_count", "session_duration", "unique_feature_accessed",
    "feature_frequency", "task_completion_rate", "task_time",
    "error_count", "tutorial_accessed", "shortcut_used",
    "freq_antrean", "freq_riwayat", "freq_perubahan_data", "label"
]

# ── 1. Ambil data real dari database ──────────────────────────────────────────
conn = sqlite3.connect(os.path.join(os.path.dirname(__file__), "data", "jkn.db"))
conn.row_factory = sqlite3.Row

pemula_ids = [79, 83, 85, 86, 90, 97, 114, 115, 116, 118]   # user_id=1
mahir_ids  = [121, 123, 132, 134, 139, 149, 151, 152, 159, 161]  # user_id=2

real_rows = []

for row_id in pemula_ids:
    r = conn.execute("SELECT * FROM interaction_logs WHERE id = ?", (row_id,)).fetchone()
    if r is None:
        print(f"WARNING: id={row_id} tidak ditemukan di database!")
        continue
    real_rows.append([
        r["session_count"], r["session_duration"], r["unique_feature_accessed"],
        r["feature_frequency"], r["task_completion_rate"], r["task_time"],
        r["error_count"], r["tutorial_accessed"], r["shortcut_used"],
        r["freq_antrean"], r["freq_riwayat"], r["freq_perubahan_data"],
        "pemula"
    ])

for row_id in mahir_ids:
    r = conn.execute("SELECT * FROM interaction_logs WHERE id = ?", (row_id,)).fetchone()
    if r is None:
        print(f"WARNING: id={row_id} tidak ditemukan di database!")
        continue
    real_rows.append([
        r["session_count"], r["session_duration"], r["unique_feature_accessed"],
        r["feature_frequency"], r["task_completion_rate"], r["task_time"],
        r["error_count"], r["tutorial_accessed"], r["shortcut_used"],
        r["freq_antrean"], r["freq_riwayat"], r["freq_perubahan_data"],
        "mahir"
    ])

conn.close()
print(f"Data real: {len(real_rows)} baris (10 pemula + 10 mahir)")

# ── 2. Baca dataset sintetis ───────────────────────────────────────────────────
sintetis_path = os.path.join(os.path.dirname(__file__), "data", "dataset_sintetis.csv")
sintetis_rows = []
with open(sintetis_path, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        sintetis_rows.append([
            int(row["session_count"]),
            int(row["session_duration"]),
            int(row["unique_feature_accessed"]),
            int(row["feature_frequency"]),
            float(row["task_completion_rate"]),
            int(row["task_time"]),
            int(row["error_count"]),
            int(row["tutorial_accessed"]),
            int(row["shortcut_used"]),
            int(row["freq_antrean"]),
            int(row["freq_riwayat"]),
            int(row["freq_perubahan_data"]),
            row["label"]
        ])
print(f"Data sintetis: {len(sintetis_rows)} baris")

# ── 3. Gabungkan dan acak ──────────────────────────────────────────────────────
all_rows = real_rows + sintetis_rows
random.shuffle(all_rows)
print(f"Total gabungan: {len(all_rows)} baris")

# ── 4. Simpan ke dataset_final.csv ────────────────────────────────────────────
out_path = os.path.join(os.path.dirname(__file__), "data", "dataset_final.csv")
with open(out_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(HEADER)
    writer.writerows(all_rows)

print(f"Dataset final disimpan: {out_path}")

# ── 5. Verifikasi distribusi label ────────────────────────────────────────────
pemula_count = sum(1 for r in all_rows if r[-1] == "pemula")
mahir_count  = sum(1 for r in all_rows if r[-1] == "mahir")
print(f"Distribusi: pemula={pemula_count}, mahir={mahir_count}")
