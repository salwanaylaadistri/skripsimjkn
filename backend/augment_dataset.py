"""
Script augmentasi data dari 20 data nyata menggunakan:
1. Gaussian Noise  — tambah variasi kecil ke data nyata
2. SMOTE           — interpolasi antar data nyata

Hasil dibandingkan dengan dataset sintetis random yang sudah ada.
"""

import os
import sqlite3
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, r2_score

np.random.seed(42)

# ── 1. Ambil 20 data nyata dari database ──────────────────────────────────────
DB_PATH = os.path.join(os.path.dirname(__file__), "data", "jkn.db")
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row

COLS = [
    "session_count", "session_duration", "unique_feature_accessed",
    "feature_frequency", "task_completion_rate", "task_time",
    "error_count", "tutorial_accessed", "shortcut_used",
    "freq_antrean", "freq_riwayat", "freq_perubahan_data"
]

pemula_ids = [79, 83, 85, 86, 90, 97, 114, 115, 116, 118]
mahir_ids  = [121, 123, 132, 134, 139, 149, 151, 152, 159, 161]

real_rows = []
for rid in pemula_ids:
    r = dict(conn.execute("SELECT * FROM interaction_logs WHERE id=?", (rid,)).fetchone())
    real_rows.append({**{c: r[c] for c in COLS}, "label": "pemula"})

for rid in mahir_ids:
    r = dict(conn.execute("SELECT * FROM interaction_logs WHERE id=?", (rid,)).fetchone())
    real_rows.append({**{c: r[c] for c in COLS}, "label": "mahir"})

conn.close()
df_real = pd.DataFrame(real_rows)
print(f"Data nyata: {len(df_real)} baris")

# ── 2. Gaussian Noise Augmentation ────────────────────────────────────────────
# Kolom integer vs float diperlakukan berbeda
INT_COLS   = ["session_count", "unique_feature_accessed", "error_count",
              "tutorial_accessed", "shortcut_used", "freq_antrean",
              "freq_riwayat", "freq_perubahan_data"]
FLOAT_COLS = ["session_duration", "feature_frequency",
              "task_completion_rate", "task_time"]

def gaussian_augment(df, n_per_sample=3, noise_pct=0.08):
    augmented = []
    for _, row in df.iterrows():
        for _ in range(n_per_sample):
            new_row = row.copy()
            for col in FLOAT_COLS:
                std = abs(row[col]) * noise_pct
                new_row[col] = round(row[col] + np.random.normal(0, std if std > 0 else 0.5), 2)
            for col in INT_COLS:
                std = max(1, abs(row[col]) * noise_pct)
                noise = int(np.random.normal(0, std))
                new_row[col] = max(0, row[col] + noise)
            augmented.append(new_row)
    return pd.DataFrame(augmented)

df_gaussian = gaussian_augment(df_real, n_per_sample=4)

# Clip nilai agar tetap masuk akal
df_gaussian["task_completion_rate"] = df_gaussian["task_completion_rate"].clip(0.0, 1.0)
df_gaussian["session_duration"]     = df_gaussian["session_duration"].clip(10)
df_gaussian["task_time"]            = df_gaussian["task_time"].clip(5)
df_gaussian["error_count"]          = df_gaussian["error_count"].clip(0)
df_gaussian["tutorial_accessed"]    = df_gaussian["tutorial_accessed"].clip(0)
df_gaussian["shortcut_used"]        = df_gaussian["shortcut_used"].clip(0)

print(f"Data Gaussian: {len(df_gaussian)} baris (4x dari 20 nyata)")

# ── 3. SMOTE Manual (interpolasi antar data nyata) ────────────────────────────
def smote_manual(df, label, n_samples=40, k=5):
    subset = df[df["label"] == label][COLS].values.astype(float)
    generated = []
    for _ in range(n_samples):
        idx = np.random.randint(0, len(subset))
        sample = subset[idx]
        # Hitung jarak ke semua sampel lain
        diffs = subset - sample
        dists = np.sqrt((diffs ** 2).sum(axis=1))
        dists[idx] = np.inf
        neighbors = np.argsort(dists)[:k]
        neighbor  = subset[np.random.choice(neighbors)]
        # Interpolasi
        alpha   = np.random.random()
        new_row = sample + alpha * (neighbor - sample)
        # Bulatkan kolom integer
        for i, col in enumerate(COLS):
            if col in INT_COLS:
                new_row[i] = max(0, int(round(new_row[i])))
            else:
                new_row[i] = round(new_row[i], 2)
        generated.append(list(new_row) + [label])
    return pd.DataFrame(generated, columns=COLS + ["label"])

df_smote_pemula = smote_manual(df_real, "pemula", n_samples=40)
df_smote_mahir  = smote_manual(df_real, "mahir",  n_samples=40)
df_smote = pd.concat([df_smote_pemula, df_smote_mahir], ignore_index=True)
print(f"Data SMOTE: {len(df_smote)} baris (40 pemula + 40 mahir)")

# ── 4. Buat 3 versi dataset untuk dibandingkan ────────────────────────────────
# Versi A: dataset random sintetis yang sudah ada (baseline)
df_current = pd.read_csv(os.path.join(os.path.dirname(__file__), "data", "dataset_final.csv"))

# Versi B: data nyata + Gaussian noise
df_b = pd.concat([df_real, df_gaussian], ignore_index=True)
df_b = df_b.sample(frac=1, random_state=42).reset_index(drop=True)

# Versi C: data nyata + SMOTE
df_c = pd.concat([df_real, df_smote], ignore_index=True)
df_c = df_c.sample(frac=1, random_state=42).reset_index(drop=True)

print(f"\nVersi A (random sintetis, baseline) : {len(df_current)} baris")
print(f"Versi B (nyata + Gaussian noise)    : {len(df_b)} baris")
print(f"Versi C (nyata + SMOTE)             : {len(df_c)} baris")

# ── 5. Fungsi evaluasi model ───────────────────────────────────────────────────
RFC_FEAT = [
    "session_count", "session_duration", "unique_feature_accessed",
    "feature_frequency", "task_completion_rate", "task_time",
    "error_count", "tutorial_accessed", "shortcut_used"
]
RFR_FEAT = RFC_FEAT + ["freq_antrean", "freq_riwayat", "freq_perubahan_data"]
RFR_TARG = ["freq_antrean", "freq_riwayat", "freq_perubahan_data"]

def evaluate(df, nama):
    le = LabelEncoder()
    X_rfc = df[RFC_FEAT]
    y_cls = le.fit_transform(df["label"])

    X_tr, X_te, y_tr, y_te = train_test_split(
        X_rfc, y_cls, test_size=0.2, random_state=42, stratify=y_cls
    )

    rfc = RandomForestClassifier(
        n_estimators=100, max_depth=4, min_samples_split=4,
        min_samples_leaf=2, max_features="sqrt", random_state=42
    )
    rfc.fit(X_tr, y_tr)

    acc_train = accuracy_score(y_tr, rfc.predict(X_tr))
    acc_test  = accuracy_score(y_te, rfc.predict(X_te))
    cv        = cross_val_score(rfc, X_rfc, y_cls, cv=5, scoring="accuracy")

    # RFR
    X_rfr = df[RFR_FEAT]
    scaler = MinMaxScaler()
    y_rfr  = scaler.fit_transform(df[RFR_TARG])

    X_tr2, X_te2, y_tr2, y_te2 = train_test_split(
        X_rfr, y_rfr, test_size=0.2, random_state=42
    )
    rfr = RandomForestRegressor(
        n_estimators=100, random_state=42
    )
    rfr.fit(X_tr2, y_tr2)
    r2_train = r2_score(y_tr2, rfr.predict(X_tr2))
    r2_test  = r2_score(y_te2, rfr.predict(X_te2))

    print(f"\n{'='*50}")
    print(f"  {nama} ({len(df)} baris, {df['label'].value_counts().to_dict()})")
    print(f"{'='*50}")
    print(f"  RFC Accuracy TRAIN : {acc_train:.4f}")
    print(f"  RFC Accuracy TEST  : {acc_test:.4f}")
    print(f"  RFC Cross-val      : {cv.mean():.4f} ± {cv.std():.4f}")
    print(f"  RFR R² TRAIN       : {r2_train:.4f}")
    print(f"  RFR R² TEST        : {r2_test:.4f}")
    print(f"  RFR Gap (train-test): {r2_train - r2_test:.4f}")

# ── 6. Bandingkan semua versi ──────────────────────────────────────────────────
print("\n" + "="*50)
print("  PERBANDINGAN 3 VERSI DATASET")
print("="*50)

evaluate(df_current, "Versi A — Random Sintetis (baseline)")
evaluate(df_b,       "Versi B — Nyata + Gaussian Noise")
evaluate(df_c,       "Versi C — Nyata + SMOTE")

# ── 7. Simpan dataset augmentasi terbaik untuk referensi ──────────────────────
df_b.to_csv(os.path.join(os.path.dirname(__file__), "data", "dataset_gaussian.csv"), index=False)
df_c.to_csv(os.path.join(os.path.dirname(__file__), "data", "dataset_smote.csv"),    index=False)
print("\nDataset tersimpan:")
print("  data/dataset_gaussian.csv")
print("  data/dataset_smote.csv")
