"""
Evaluasi RFC menggunakan 60 data organik dari research_logs
dengan Stratified 5-Fold Cross Validation.

Script ini HANYA evaluasi — tidak menyimpan atau menimpa model apapun.
"""

import sqlite3
import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "jkn.db")

RFC_FEATURES = [
    "session_count", "session_duration", "unique_feature_accessed",
    "feature_frequency", "task_completion_rate", "task_time",
    "error_count", "tutorial_accessed", "shortcut_used"
]

# ── 1. Load data dari research_logs ──────────────────────────────────────────
conn = sqlite3.connect(DB_PATH)
df = pd.read_sql_query("SELECT * FROM research_logs ORDER BY id", conn)
conn.close()

print("=" * 60)
print("EVALUASI 60 DATA ORGANIK — Stratified 5-Fold Cross Validation")
print("=" * 60)
print(f"\nTotal data  : {len(df)} baris")
print(f"Distribusi  : pemula={sum(df['label']=='pemula')}, mahir={sum(df['label']=='mahir')}")
print(f"\nStatistik fitur utama:")
print(df[["session_duration", "task_time", "error_count", "tutorial_accessed"]].describe().round(2).to_string())

# ── 2. Persiapan fitur dan label ─────────────────────────────────────────────
X = df[RFC_FEATURES].values
le = LabelEncoder()
y = le.fit_transform(df["label"])  # pemula=0, mahir=1
print(f"\nEncoding: {dict(zip(le.classes_, le.transform(le.classes_)))}")

# ── 3. Stratified 5-Fold Cross Validation ────────────────────────────────────
print("\n── Stratified 5-Fold Cross Validation ──")

skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

rfc = RandomForestClassifier(
    n_estimators=100,
    max_depth=5,
    min_samples_split=4,
    min_samples_leaf=2,
    max_features="sqrt",
    random_state=42
)

fold_results = []
all_y_true = []
all_y_pred = []

for fold, (train_idx, test_idx) in enumerate(skf.split(X, y), 1):
    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

    rfc.fit(X_train, y_train)
    y_pred = rfc.predict(X_test)

    acc_train = accuracy_score(y_train, rfc.predict(X_train))
    acc_test  = accuracy_score(y_test, y_pred)

    fold_results.append({
        "fold": fold,
        "train_size": len(train_idx),
        "test_size": len(test_idx),
        "acc_train": acc_train,
        "acc_test": acc_test,
        "gap": acc_train - acc_test,
    })

    all_y_true.extend(y_test)
    all_y_pred.extend(y_pred)

    print(f"  Fold {fold}: train={len(train_idx)} | test={len(test_idx)} | "
          f"acc_train={acc_train:.4f} | acc_test={acc_test:.4f} | gap={acc_train-acc_test:+.4f}")

# ── 4. Ringkasan hasil ────────────────────────────────────────────────────────
acc_tests  = [r["acc_test"]  for r in fold_results]
acc_trains = [r["acc_train"] for r in fold_results]
gaps       = [r["gap"]       for r in fold_results]

print(f"\n── Ringkasan ──")
print(f"  Rata-rata acc TRAIN : {np.mean(acc_trains):.4f} ± {np.std(acc_trains):.4f}")
print(f"  Rata-rata acc TEST  : {np.mean(acc_tests):.4f} ± {np.std(acc_tests):.4f}")
print(f"  Rata-rata gap       : {np.mean(gaps):+.4f}")
print()

# ── 5. Interpretasi overfitting ───────────────────────────────────────────────
gap = np.mean(gaps)
print("── Interpretasi ──")
if gap < 0.05:
    print("  Status: TIDAK OVERFITTING (gap < 5%)")
elif gap < 0.10:
    print("  Status: OVERFITTING RINGAN (gap 5-10%) — masih dapat diterima")
else:
    print("  Status: OVERFITTING (gap > 10%) — perlu augmentasi atau tuning")

acc_mean = np.mean(acc_tests)
if acc_mean >= 0.90:
    print(f"  Akurasi: BAIK ({acc_mean*100:.1f}%)")
elif acc_mean >= 0.75:
    print(f"  Akurasi: CUKUP ({acc_mean*100:.1f}%) — bisa ditingkatkan dengan augmentasi")
else:
    print(f"  Akurasi: RENDAH ({acc_mean*100:.1f}%) — perlu lebih banyak data atau tuning")

# ── 6. Classification report gabungan semua fold ──────────────────────────────
print(f"\n── Classification Report (gabungan semua fold) ──")
print(classification_report(all_y_true, all_y_pred, target_names=le.classes_))

print(f"── Confusion Matrix (gabungan semua fold) ──")
cm = confusion_matrix(all_y_true, all_y_pred)
print(f"             | prediksi pemula | prediksi mahir")
for i, row in enumerate(cm):
    print(f"  aktual {le.classes_[i]:5s}: {row[0]:15d}   {row[1]:14d}")

# ── 7. Feature importance (dilatih di semua data) ─────────────────────────────
print(f"\n── Feature Importance (dilatih di semua 60 data) ──")
rfc.fit(X, y)
importances = sorted(zip(RFC_FEATURES, rfc.feature_importances_), key=lambda x: -x[1])
for feat, imp in importances:
    bar = "█" * int(imp * 40)
    print(f"  {feat:30s} {imp:.4f} {bar}")
