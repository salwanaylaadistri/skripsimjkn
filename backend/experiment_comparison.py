"""
4 Eksperimen perbandingan RFC vs XGBoost
dengan Stratified 5-Fold Cross Validation
Data: 60 data organik dari research_logs
"""

import sqlite3
import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix
)
from xgboost import XGBClassifier

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "jkn.db")
conn = sqlite3.connect(DB_PATH)
df = pd.read_sql_query("SELECT * FROM research_logs ORDER BY id", conn)
conn.close()

le = LabelEncoder()
y = le.fit_transform(df["label"])  # mahir=0, pemula=1

FITUR_9 = [
    "session_count", "session_duration", "unique_feature_accessed",
    "feature_frequency", "task_completion_rate", "task_time",
    "error_count", "tutorial_accessed", "shortcut_used"
]

FITUR_8 = [
    "session_count", "unique_feature_accessed",
    "feature_frequency", "task_completion_rate", "task_time",
    "error_count", "tutorial_accessed", "shortcut_used"
]

def buat_model(nama_model):
    if nama_model == "RFC":
        return RandomForestClassifier(
            n_estimators=100, max_depth=5, min_samples_split=4,
            min_samples_leaf=2, max_features="sqrt", random_state=42
        )
    else:
        return XGBClassifier(
            n_estimators=100, max_depth=4, learning_rate=0.1,
            subsample=0.8, colsample_bytree=0.8,
            use_label_encoder=False, eval_metric="logloss",
            random_state=42, verbosity=0
        )

def jalankan_eksperimen(nomor, nama_model, fitur, label_fitur):
    print(f"\n{'='*62}")
    print(f"  EKSPERIMEN {nomor}: {nama_model} | Fitur: {label_fitur}")
    print(f"{'='*62}")

    X = df[fitur].values
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    fold_results = []
    all_true, all_pred = [], []

    print(f"\n  {'Fold':<6} {'Train':>6} {'Test':>6} {'Acc Train':>10} {'Acc Test':>10} {'Gap':>8}")
    print(f"  {'-'*50}")

    for fold, (train_idx, test_idx) in enumerate(skf.split(X, y), 1):
        X_train, X_test = X[train_idx], X[test_idx]
        y_train, y_test = y[train_idx], y[test_idx]

        model = buat_model(nama_model)
        model.fit(X_train, y_train)

        pred_train = model.predict(X_train)
        pred_test  = model.predict(X_test)

        acc_train = accuracy_score(y_train, pred_train)
        acc_test  = accuracy_score(y_test,  pred_test)
        gap       = acc_train - acc_test

        fold_results.append({
            "fold": fold,
            "acc_train": acc_train,
            "acc_test": acc_test,
            "gap": gap,
            "precision": precision_score(y_test, pred_test, average="macro", zero_division=0),
            "recall":    recall_score(y_test, pred_test, average="macro", zero_division=0),
            "f1":        f1_score(y_test, pred_test, average="macro", zero_division=0),
        })

        all_true.extend(y_test)
        all_pred.extend(pred_test)

        print(f"  {fold:<6} {len(train_idx):>6} {len(test_idx):>6} {acc_train:>10.4f} {acc_test:>10.4f} {gap:>+8.4f}")

    acc_trains = [r["acc_train"] for r in fold_results]
    acc_tests  = [r["acc_test"]  for r in fold_results]
    precisions = [r["precision"] for r in fold_results]
    recalls    = [r["recall"]    for r in fold_results]
    f1s        = [r["f1"]        for r in fold_results]
    gaps       = [r["gap"]       for r in fold_results]

    print(f"\n  B. RINGKASAN METRIK")
    print(f"  {'Metrik':<22} {'Rata-rata':>10} {'Std':>8}")
    print(f"  {'-'*42}")
    print(f"  {'Accuracy (train)':<22} {np.mean(acc_trains):>10.4f} {np.std(acc_trains):>8.4f}")
    print(f"  {'Accuracy (test)':<22} {np.mean(acc_tests):>10.4f} {np.std(acc_tests):>8.4f}")
    print(f"  {'Precision (macro)':<22} {np.mean(precisions):>10.4f} {np.std(precisions):>8.4f}")
    print(f"  {'Recall (macro)':<22} {np.mean(recalls):>10.4f} {np.std(recalls):>8.4f}")
    print(f"  {'F1-score (macro)':<22} {np.mean(f1s):>10.4f} {np.std(f1s):>8.4f}")
    print(f"  {'Train-Test Gap':<22} {np.mean(gaps):>+10.4f} {np.std(gaps):>8.4f}")

    print(f"\n  C. CLASSIFICATION REPORT (gabungan semua fold)")
    print(classification_report(all_true, all_pred, target_names=le.classes_, digits=4))

    print(f"  D. CONFUSION MATRIX (gabungan semua fold)")
    cm = confusion_matrix(all_true, all_pred)
    print(f"               | pred mahir | pred pemula")
    for i, row in enumerate(cm):
        print(f"  aktual {le.classes_[i]:6s}: {row[0]:>10}   {row[1]:>11}")

    print(f"\n  E. FEATURE IMPORTANCE ({nama_model})")
    model_full = buat_model(nama_model)
    model_full.fit(X, y)
    if nama_model == "RFC":
        importances = model_full.feature_importances_
    else:
        importances = model_full.feature_importances_
    ranked = sorted(zip(fitur, importances), key=lambda x: -x[1])
    for feat, imp in ranked:
        bar = "=" * int(imp * 40)
        print(f"    {feat:30s} {imp:.4f} {bar}")

    return {
        "nomor": nomor,
        "model": nama_model,
        "fitur": label_fitur,
        "acc_test":  round(np.mean(acc_tests), 4),
        "precision": round(np.mean(precisions), 4),
        "recall":    round(np.mean(recalls), 4),
        "f1":        round(np.mean(f1s), 4),
        "gap":       round(np.mean(gaps), 4),
        "std":       round(np.std(acc_tests), 4),
    }

# ── A. Konfigurasi ────────────────────────────────────────────────────────────
print("=" * 62)
print("  RINGKASAN KONFIGURASI EKSPERIMEN")
print("=" * 62)
print(f"  Dataset        : research_logs (60 baris, 30 pemula + 30 mahir)")
print(f"  Evaluasi       : Stratified 5-Fold Cross Validation")
print(f"  Augmentasi     : Tidak ada")
print(f"  Random state   : 42 (konsisten semua eksperimen)")
print(f"  Preprocessing  : LabelEncoder untuk target, fitur numerik langsung")
print(f"  RFC params     : n_estimators=100, max_depth=5, min_samples_split=4,")
print(f"                   min_samples_leaf=2, max_features=sqrt")
print(f"  XGB params     : n_estimators=100, max_depth=4, learning_rate=0.1,")
print(f"                   subsample=0.8, colsample_bytree=0.8")
print()
print(f"  Eksperimen 1: RFC  | 9 fitur (lengkap)")
print(f"  Eksperimen 2: XGB  | 9 fitur (lengkap)")
print(f"  Eksperimen 3: RFC  | 8 fitur (tanpa session_duration)")
print(f"  Eksperimen 4: XGB  | 8 fitur (tanpa session_duration)")

# ── Jalankan 4 eksperimen ─────────────────────────────────────────────────────
hasil = []
hasil.append(jalankan_eksperimen(1, "RFC", FITUR_9, "9 fitur (lengkap)"))
hasil.append(jalankan_eksperimen(2, "XGB", FITUR_9, "9 fitur (lengkap)"))
hasil.append(jalankan_eksperimen(3, "RFC", FITUR_8, "8 fitur (tanpa session_duration)"))
hasil.append(jalankan_eksperimen(4, "XGB", FITUR_8, "8 fitur (tanpa session_duration)"))

# ── F. Tabel perbandingan ─────────────────────────────────────────────────────
print(f"\n{'='*62}")
print(f"  F. TABEL PERBANDINGAN AKHIR")
print(f"{'='*62}")
print(f"  {'Eks':>4} {'Model':>6} {'Fitur':<34} {'Acc':>6} {'Prec':>6} {'Rec':>6} {'F1':>6} {'Gap':>7}")
print(f"  {'-'*75}")
for h in hasil:
    print(f"  {h['nomor']:>4} {h['model']:>6} {h['fitur']:<34} {h['acc_test']:>6.4f} {h['precision']:>6.4f} {h['recall']:>6.4f} {h['f1']:>6.4f} {h['gap']:>+7.4f}")
