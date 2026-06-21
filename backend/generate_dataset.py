"""
Script untuk generate dataset sintetis Mobile JKN.
Hasilnya digabung dengan data nyata dari pengujian manual.

Range berdasarkan Dreyfus + Nielsen + data nyata:
  Pemula: session_count 1-5, session_duration 120-900, unique_feature 1-2,
          feature_frequency 1-4, task_completion_rate 0.00-0.65,
          task_time 91-300, error_count 3-10, tutorial_accessed 2-15,
          shortcut_used 0-1,
          freq_antrean 0-2, freq_riwayat 0-1, freq_perubahan_data 0-3

  Mahir:  session_count 6-20, session_duration 30-119, unique_feature 3,
          feature_frequency 5-15, task_completion_rate 0.66-1.00,
          task_time 20-90, error_count 0-2, tutorial_accessed 0-1,
          shortcut_used 2-6,
          freq_antrean 1-4, freq_riwayat 1-3, freq_perubahan_data 2-6

Noise realistis (intra-class variation):
  Pemula bisa sesekali cepat, pakai shortcut, atau sedikit error
  Mahir bisa sesekali lama, error lebih, atau buka tutorial
  Probabilitas kecil (10-25%) agar label tetap mencerminkan kelas yang benar
"""

import random
import csv
import os

random.seed(42)

def generate_pemula():
    session_count          = random.randint(1, 5)
    session_duration       = random.randint(120, 900)
    unique_feature         = random.randint(1, 2)
    feature_frequency      = random.randint(1, 4)
    task_completion_rate   = round(random.uniform(0.00, 0.65), 2)
    task_time              = random.randint(91, 300)
    error_count            = random.randint(3, 10)
    tutorial_accessed      = random.randint(2, 15)
    shortcut_used          = random.randint(0, 1)
    freq_antrean           = random.randint(0, 2)
    freq_riwayat           = random.randint(0, 1)
    freq_perubahan_data    = random.randint(0, 3)

    # 30% kemungkinan task_time cepat (task simpel seperti lihat riwayat)
    if random.random() < 0.30:
        task_time = random.randint(30, 90)

    # 25% kemungkinan pakai shortcut sekali (tidak sengaja / coba-coba)
    if random.random() < 0.25:
        shortcut_used = 1

    # 25% kemungkinan error lebih sedikit (task mudah)
    if random.random() < 0.25:
        error_count = random.randint(1, 2)

    # 20% kemungkinan session_duration lebih singkat (cepat keluar)
    if random.random() < 0.20:
        session_duration = random.randint(60, 119)

    return [session_count, session_duration, unique_feature, feature_frequency,
            task_completion_rate, task_time, error_count, tutorial_accessed,
            shortcut_used, freq_antrean, freq_riwayat, freq_perubahan_data, "pemula"]

def generate_mahir():
    session_count          = random.randint(6, 20)
    session_duration       = random.randint(30, 119)
    unique_feature         = 3
    feature_frequency      = random.randint(5, 15)
    task_completion_rate   = round(random.uniform(0.66, 1.00), 2)
    task_time              = random.randint(20, 90)
    error_count            = random.randint(0, 2)
    tutorial_accessed      = random.randint(0, 1)
    shortcut_used          = random.randint(2, 6)
    freq_antrean           = random.randint(1, 4)
    freq_riwayat           = random.randint(1, 3)
    freq_perubahan_data    = random.randint(2, 6)

    # 25% kemungkinan session_duration lebih lama (banyak task dikerjakan)
    if random.random() < 0.25:
        session_duration = random.randint(120, 200)

    # 25% kemungkinan error lebih (salah ketik / fitur tidak familiar)
    if random.random() < 0.25:
        error_count = random.randint(3, 5)

    # 20% kemungkinan buka tutorial sekali (fitur baru)
    if random.random() < 0.20:
        tutorial_accessed = random.randint(1, 2)

    # 20% kemungkinan task_time lebih lama (task kompleks)
    if random.random() < 0.20:
        task_time = random.randint(91, 140)

    return [session_count, session_duration, unique_feature, feature_frequency,
            task_completion_rate, task_time, error_count, tutorial_accessed,
            shortcut_used, freq_antrean, freq_riwayat, freq_perubahan_data, "mahir"]

HEADER = [
    "session_count", "session_duration", "unique_feature_accessed",
    "feature_frequency", "task_completion_rate", "task_time",
    "error_count", "tutorial_accessed", "shortcut_used",
    "freq_antrean", "freq_riwayat", "freq_perubahan_data", "label"
]

# Generate 40 pemula + 40 mahir (+ 10 nyata per kelas = 50 per kelas)
rows = []
for _ in range(40):
    rows.append(generate_pemula())
for _ in range(40):
    rows.append(generate_mahir())

random.shuffle(rows)

out_path = os.path.join(os.path.dirname(__file__), "data", "dataset_sintetis.csv")
with open(out_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(HEADER)
    writer.writerows(rows)

print(f"Dataset sintetis berhasil dibuat: {out_path}")
print(f"Total baris: {len(rows)} (40 pemula + 40 mahir)")
