"""
Evaluasi RFR (Random Forest Regressor) dari research_logs
Stratified 5-Fold pada fitur, KFold biasa pada target regresi
"""

import sqlite3
import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import StratifiedKFold
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "jkn.db")
conn = sqlite3.connect(DB_PATH)
df = pd.read_sql_query("SELECT * FROM research_logs ORDER BY id", conn)
conn.close()

RFR_FEATURES = [
    "session_count", "session_duration", "unique_feature_accessed",
    "feature_frequency", "task_completion_rate", "task_time",
    "error_count", "tutorial_accessed", "shortcut_used",
    "freq_antrean", "freq_riwayat", "freq_perubahan_data"
]

RFR_TARGETS = ["freq_antrean", "freq_riwayat", "freq_perubahan_data"]

print("=" * 62)
print("  EVALUASI RFR (Random Forest Regressor)")
print("  Data: 60 data organik | Stratified 5-Fold")
print("=" * 62)

print(f"\nDistribusi nilai target (sebelum normalisasi):")
for t in RFR_TARGETS:
    print(f"  {t:25s}: min={df[t].min():.1f}  max={df[t].max():.1f}  mean={df[t].mean():.2f}  median={df[t].median():.1f}")

X = df[RFR_FEATURES].values
scaler = MinMaxScaler()
y_raw = df[RFR_TARGETS].values
y = scaler.fit_transform(y_raw)

le = LabelEncoder()
y_strat = le.fit_transform(df["label"])

skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

fold_mae  = {t: [] for t in RFR_TARGETS}
fold_rmse = {t: [] for t in RFR_TARGETS}
fold_r2   = {t: [] for t in RFR_TARGETS}
fold_r2_train = {t: [] for t in RFR_TARGETS}

print(f"\n{'='*62}")
print(f"  HASIL PER FOLD")
print(f"{'='*62}")

for fold, (train_idx, test_idx) in enumerate(skf.split(X, y_strat), 1):
    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

    rfr = RandomForestRegressor(
        n_estimators=100, max_depth=None,
        min_samples_split=2, min_samples_leaf=1,
        random_state=42
    )
    rfr.fit(X_train, y_train)

    pred_test  = rfr.predict(X_test)
    pred_train = rfr.predict(X_train)

    print(f"\n  Fold {fold} (train={len(train_idx)}, test={len(test_idx)}):")
    print(f"  {'Target':<22} {'MAE':>7} {'RMSE':>7} {'R2 Train':>9} {'R2 Test':>9}")
    print(f"  {'-'*56}")
    for i, t in enumerate(RFR_TARGETS):
        mae  = mean_absolute_error(y_test[:, i], pred_test[:, i])
        rmse = np.sqrt(mean_squared_error(y_test[:, i], pred_test[:, i]))
        r2t  = r2_score(y_test[:, i], pred_test[:, i])
        r2tr = r2_score(y_train[:, i], pred_train[:, i])
        fold_mae[t].append(mae)
        fold_rmse[t].append(rmse)
        fold_r2[t].append(r2t)
        fold_r2_train[t].append(r2tr)
        print(f"  {t:<22} {mae:>7.4f} {rmse:>7.4f} {r2tr:>9.4f} {r2t:>9.4f}")

print(f"\n{'='*62}")
print(f"  RINGKASAN RATA-RATA 5 FOLD")
print(f"{'='*62}")
print(f"  {'Target':<22} {'MAE':>7} {'RMSE':>7} {'R2 Train':>9} {'R2 Test':>9} {'Gap R2':>8}")
print(f"  {'-'*62}")
for t in RFR_TARGETS:
    mae_m  = np.mean(fold_mae[t])
    rmse_m = np.mean(fold_rmse[t])
    r2_m   = np.mean(fold_r2[t])
    r2tr_m = np.mean(fold_r2_train[t])
    gap    = r2tr_m - r2_m
    print(f"  {t:<22} {mae_m:>7.4f} {rmse_m:>7.4f} {r2tr_m:>9.4f} {r2_m:>9.4f} {gap:>+8.4f}")

print(f"\n{'='*62}")
print(f"  FEATURE IMPORTANCE (RFR — dilatih di semua 60 data)")
print(f"{'='*62}")
rfr_full = RandomForestRegressor(n_estimators=100, random_state=42)
rfr_full.fit(X, y)
ranked = sorted(zip(RFR_FEATURES, rfr_full.feature_importances_), key=lambda x: -x[1])
for feat, imp in ranked:
    bar = "=" * int(imp * 40)
    print(f"  {feat:30s} {imp:.4f} {bar}")

print(f"\n{'='*62}")
print(f"  CONTOH PREDIKSI SKOR RELEVANSI (10 sampel)")
print(f"{'='*62}")
rfr_full.fit(X, y)
preds = rfr_full.predict(X)
preds_raw = scaler.inverse_transform(preds)
print(f"  {'Label':<8} | {'pred_antrean':>12} | {'pred_riwayat':>12} | {'pred_perubahan':>14} | {'urutan fitur'}")
print(f"  {'-'*70}")
for i in range(10):
    label = df["label"].iloc[i]
    scores = preds_raw[i]
    order = np.argsort(-scores)
    nama_fitur = ["antrean", "riwayat", "perubahan"]
    urutan = " > ".join([nama_fitur[o] for o in order])
    print(f"  {label:<8} | {scores[0]:>12.2f} | {scores[1]:>12.2f} | {scores[2]:>14.2f} | {urutan}")
