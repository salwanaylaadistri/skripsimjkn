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

FITUR_TANPA_LABEL = [
    "session_count", "feature_frequency",
    "task_completion_rate", "unique_feature_accessed", "shortcut_used"
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

print("EKSPERIMEN 2 — UJI KETERGANTUNGAN FITUR LABEL")
print("Apakah model mengandalkan aturan label atau perilaku nyata?")

acc_lengkap = evaluasi("Eksperimen 1 — Semua 9 fitur (baseline)", FITUR_LENGKAP)
acc_tanpa   = evaluasi("Eksperimen 2 — Tanpa 4 fitur pembentuk label", FITUR_TANPA_LABEL)

print(f"\n{'='*55}")
print(f"  PERBANDINGAN HASIL")
print(f"{'='*55}")
print(f"  Dengan 4 fitur label : {acc_lengkap*100:.1f}%")
print(f"  Tanpa 4 fitur label  : {acc_tanpa*100:.1f}%")
print(f"  Selisih              : {(acc_lengkap - acc_tanpa)*100:.1f}%")
print()
if acc_tanpa >= 0.80:
    print("  Interpretasi: Perilaku pengguna KONSISTEN.")
    print("  Model tidak semata mengandalkan aturan label.")
    print("  Fitur sekunder (session_count, shortcut, dll) juga membedakan kelas.")
elif acc_tanpa >= 0.60:
    print("  Interpretasi: Perilaku CUKUP konsisten tapi tidak sempurna.")
    print("  Model sebagian mengandalkan aturan label.")
    print("  Perlu lebih banyak data agar fitur sekunder lebih informatif.")
else:
    print("  Interpretasi: Model SANGAT bergantung pada aturan label.")
    print("  Fitur sekunder tidak cukup membedakan pemula vs mahir.")
    print("  Data perlu diperkaya dengan variasi perilaku yang lebih beragam.")
