import sqlite3
import os
import pandas as pd
import numpy as np

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "jkn.db")
conn = sqlite3.connect(DB_PATH)
df = pd.read_sql_query("SELECT * FROM research_logs ORDER BY id", conn)
conn.close()

df["label_num"] = (df["label"] == "pemula").astype(int)  # mahir=0, pemula=1

FITUR = ["session_duration", "tutorial_accessed", "task_time"]

print("=" * 60)
print("KORELASI FITUR TERHADAP LABEL (mahir=0, pemula=1)")
print("=" * 60)

print("\n-- Statistik per label --")
for fitur in FITUR:
    mahir  = df[df["label"] == "mahir"][fitur]
    pemula = df[df["label"] == "pemula"][fitur]
    print(f"\n{fitur}:")
    print(f"  Mahir  : min={mahir.min():.1f}  max={mahir.max():.1f}  rata-rata={mahir.mean():.1f}  median={mahir.median():.1f}")
    print(f"  Pemula : min={pemula.min():.1f}  max={pemula.max():.1f}  rata-rata={pemula.mean():.1f}  median={pemula.median():.1f}")

print("\n-- Korelasi Pearson terhadap label --")
for fitur in FITUR:
    r = df[fitur].corr(df["label_num"])
    arah = "positif (makin tinggi -> makin pemula)" if r > 0 else "negatif (makin tinggi -> makin mahir)"
    kuat = "kuat" if abs(r) >= 0.7 else "sedang" if abs(r) >= 0.4 else "lemah"
    print(f"  {fitur:25s}: r = {r:+.4f}  [{kuat}, {arah}]")

print("\n-- Distribusi nilai per label (tiap fitur) --")
for fitur in FITUR:
    print(f"\n{fitur}:")
    bins_mahir  = df[df["label"] == "mahir"][fitur].values
    bins_pemula = df[df["label"] == "pemula"][fitur].values
    semua = sorted(set(list(bins_mahir) + list(bins_pemula)))
    q = np.percentile(df[fitur], [0, 25, 50, 75, 100])
    print(f"  Range semua data : {q[0]:.1f} - {q[4]:.1f}")
    print(f"  Q1={q[1]:.1f}  Median={q[2]:.1f}  Q3={q[3]:.1f}")

    overlap_mahir  = [v for v in bins_mahir  if v in bins_pemula]
    overlap_pemula = [v for v in bins_pemula if v in bins_mahir]
    print(f"  Nilai overlap (ada di kedua kelas): {len(set(overlap_mahir))} nilai unik")
