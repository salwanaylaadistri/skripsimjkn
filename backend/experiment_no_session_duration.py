import sqlite3
import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "jkn.db")
conn = sqlite3.connect(DB_PATH)
df = pd.read_sql_query("SELECT * FROM research_logs ORDER BY id", conn)
conn.close()

le = LabelEncoder()
y = le.fit_transform(df["label"])

FITUR_LENGKAP = [
    "session_count", "session_duration", "unique_feature_accessed",
    "feature_frequency", "task_completion_rate", "task_time",
    "error_count", "tutorial_accessed", "shortcut_used"
]

FITUR_TANPA_DURATION = [
    "session_count", "unique_feature_accessed",
    "feature_frequency", "task_completion_rate", "task_time",
    "error_count", "tutorial_accessed", "shortcut_used"
]

def evaluasi(nama, fitur):
    X = df[fitur].values
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    rfc = RandomForestClassifier(
        n_estimators=100, max_depth=5, min_samples_split=4,
        min_samples_leaf=2, max_features="sqrt", random_state=42
    )
    all_true, all_pred = [], []
    accs = []
    for train_idx, test_idx in skf.split(X, y):
        rfc.fit(X[train_idx], y[train_idx])
        pred = rfc.predict(X[test_idx])
        all_true.extend(y[test_idx])
        all_pred.extend(pred)
        accs.append(accuracy_score(y[test_idx], pred))

    print(f"\n{'='*55}")
    print(f"  {nama}")
    print(f"  Fitur ({len(fitur)}): {', '.join(fitur)}")
    print(f"{'='*55}")
    print(f"  Acc per fold : {[round(a,2) for a in accs]}")
    print(f"  Rata-rata    : {np.mean(accs):.4f} ({np.mean(accs)*100:.1f}%)")
    print(f"  Std          : {np.std(accs):.4f}")
    print()
    print(classification_report(all_true, all_pred, target_names=le.classes_))

    rfc.fit(df[fitur].values, y)
    importances = sorted(zip(fitur, rfc.feature_importances_), key=lambda x: -x[1])
    print("  Feature importance:")
    for feat, imp in importances:
        bar = "=" * int(imp * 40)
        print(f"    {feat:30s} {imp:.4f} {bar}")

    return np.mean(accs)

print("EKSPERIMEN 3 — BUANG session_duration (fitur dominan)")
print("Apakah fitur lain cukup kuat tanpa session_duration?")

acc_lengkap = evaluasi("Eksperimen 1 — Semua 9 fitur (baseline)", FITUR_LENGKAP)
acc_tanpa   = evaluasi("Eksperimen 3 — Tanpa session_duration", FITUR_TANPA_DURATION)

print(f"\n{'='*55}")
print(f"  PERBANDINGAN HASIL")
print(f"{'='*55}")
print(f"  Dengan session_duration : {acc_lengkap*100:.1f}%")
print(f"  Tanpa session_duration  : {acc_tanpa*100:.1f}%")
print(f"  Selisih                 : {(acc_lengkap - acc_tanpa)*100:.1f}%")
print()
if acc_tanpa >= 0.90:
    print("  Interpretasi: Fitur lain SANGAT KUAT.")
    print("  session_duration bukan satu-satunya pembeda.")
    print("  Model tetap andal tanpanya.")
elif acc_tanpa >= 0.75:
    print("  Interpretasi: Fitur lain CUKUP KUAT.")
    print("  task_time, error_count, tutorial_accessed bersama-sama")
    print("  mampu menggantikan peran session_duration.")
elif acc_tanpa >= 0.60:
    print("  Interpretasi: Fitur lain LEMAH tanpa session_duration.")
    print("  session_duration adalah fitur kritis di dataset ini.")
    print("  Perlu augmentasi atau data lebih bervariasi.")
else:
    print("  Interpretasi: Model SANGAT bergantung pada session_duration.")
    print("  Tanpanya, model hampir tidak lebih baik dari tebak acak.")
