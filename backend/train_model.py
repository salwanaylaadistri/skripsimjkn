"""
Script training model RFC (Random Forest Classifier) dan RFR (Random Forest Regressor)
untuk sistem adaptasi UI Mobile JKN.

RFC → memprediksi label: "pemula" atau "mahir"
      Fitur input: 9 atribut interaksi pengguna
      Output: label "pemula" / "mahir"

RFR → memprediksi skor relevansi tiap fitur UI (antrean, riwayat, perubahan_data)
      Dilatih terpisah (3 model) atau multi-output:
        - target antrean       = freq_antrean       (dinormalisasi ke 0-1)
        - target riwayat       = freq_riwayat       (dinormalisasi ke 0-1)
        - target perubahan_data = freq_perubahan_data (dinormalisasi ke 0-1)
      Output: skor relevansi → digunakan untuk urutan tampilan fitur di UI

Fitur RFC (9 atribut):
  session_count, session_duration, unique_feature_accessed, feature_frequency,
  task_completion_rate, task_time, error_count, tutorial_accessed, shortcut_used

Fitur RFR (12 atribut = 9 + 3 freq):
  Sama dengan RFC + freq_antrean, freq_riwayat, freq_perubahan_data
  Target output (multi-output): skor relevansi antrean, riwayat, perubahan_data
"""

import os
import pickle
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    mean_absolute_error, mean_squared_error, r2_score
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "dataset_final.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)

RFC_FEATURES = [
    "session_count", "session_duration", "unique_feature_accessed",
    "feature_frequency", "task_completion_rate", "task_time",
    "error_count", "tutorial_accessed", "shortcut_used"
]

RFR_FEATURES = RFC_FEATURES + ["freq_antrean", "freq_riwayat", "freq_perubahan_data"]

RFR_TARGETS = ["freq_antrean", "freq_riwayat", "freq_perubahan_data"]

# ── 1. Load dan preprocessing ─────────────────────────────────────────────────
print("=" * 60)
print("FASE 3 — TRAINING MODEL RFC + RFR")
print("=" * 60)

df = pd.read_csv(DATA_PATH)
print(f"\nDataset dimuat: {len(df)} baris")
print(f"Distribusi label:\n{df['label'].value_counts().to_string()}")

# ── 2. Training RFC ───────────────────────────────────────────────────────────
print("\n── RFC (Random Forest Classifier) ──")

X_rfc = df[RFC_FEATURES]
le = LabelEncoder()
y_cls = le.fit_transform(df["label"])   # pemula=0, mahir=1
print(f"Encoding label: {dict(zip(le.classes_, le.transform(le.classes_)))}")

X_rfc_train, X_rfc_test, y_cls_train, y_cls_test = train_test_split(
    X_rfc, y_cls, test_size=0.2, random_state=42, stratify=y_cls
)
print(f"Train: {len(X_rfc_train)} baris | Test: {len(X_rfc_test)} baris")

# GridSearchCV — cari hyperparameter terbaik
# cv=5 dengan dataset kecil, scoring=accuracy
# Parameter dibatasi agar tidak overfit ke cross-val
param_grid = {
    "max_depth":         [4, 5, 6, 7, 8],
    "min_samples_split": [4, 6, 8],
    "min_samples_leaf":  [2, 3, 4],
    "max_features":      ["sqrt", "log2"],
}

grid_search = GridSearchCV(
    RandomForestClassifier(n_estimators=100, random_state=42),
    param_grid,
    cv=5,
    scoring="accuracy",
    n_jobs=-1,
    verbose=0,
)
grid_search.fit(X_rfc_train, y_cls_train)

print(f"Parameter terbaik (GridSearchCV):")
for k, v in grid_search.best_params_.items():
    print(f"  {k:20s} = {v}")
print(f"Best cross-val score   : {grid_search.best_score_:.4f}")

rfc = grid_search.best_estimator_
rfc.fit(X_rfc_train, y_cls_train)

y_pred_cls = rfc.predict(X_rfc_test)
acc = accuracy_score(y_cls_test, y_pred_cls)
cv_scores = cross_val_score(rfc, X_rfc, y_cls, cv=5, scoring="accuracy")

print(f"Accuracy (test set)  : {acc:.4f} ({acc*100:.2f}%)")
print(f"Cross-val accuracy   : {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
print(f"\nClassification Report:")
print(classification_report(y_cls_test, y_pred_cls, target_names=le.classes_))
print(f"Confusion Matrix:")
cm = confusion_matrix(y_cls_test, y_pred_cls)
print(f"  {'':8s} | {le.classes_[0]:8s} | {le.classes_[1]:8s}")
for i, row in enumerate(cm):
    print(f"  {le.classes_[i]:8s}: {row[0]:4d}     {row[1]:4d}")

print(f"\nFeature Importance (RFC):")
importances = sorted(zip(RFC_FEATURES, rfc.feature_importances_), key=lambda x: -x[1])
for feat, imp in importances:
    bar = "█" * int(imp * 40)
    print(f"  {feat:30s} {imp:.4f} {bar}")

# ── 3. Training RFR (Multi-Output Relevance Score) ────────────────────────────
print("\n── RFR (Random Forest Regressor — Relevansi Fitur UI) ──")

X_rfr = df[RFR_FEATURES]
y_raw = df[RFR_TARGETS]

# Normalisasi target ke 0-1 menggunakan MinMaxScaler
scaler = MinMaxScaler()
y_scaled = scaler.fit_transform(y_raw)
y_rfr = pd.DataFrame(y_scaled, columns=RFR_TARGETS)

X_rfr_train, X_rfr_test, y_rfr_train, y_rfr_test = train_test_split(
    X_rfr, y_rfr, test_size=0.2, random_state=42
)

rfr = RandomForestRegressor(
    n_estimators=100,
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    random_state=42
)
rfr.fit(X_rfr_train, y_rfr_train)

y_pred_rfr = rfr.predict(X_rfr_test)

print(f"\nMetrik per target (skor relevansi ternormalisasi 0-1):")
for i, target in enumerate(RFR_TARGETS):
    mae  = mean_absolute_error(y_rfr_test.iloc[:, i], y_pred_rfr[:, i])
    rmse = np.sqrt(mean_squared_error(y_rfr_test.iloc[:, i], y_pred_rfr[:, i]))
    r2   = r2_score(y_rfr_test.iloc[:, i], y_pred_rfr[:, i])
    print(f"  {target:22s} MAE={mae:.4f}  RMSE={rmse:.4f}  R²={r2:.4f}")

print(f"\nContoh prediksi skor relevansi (5 sampel dari test set):")
print(f"  {'Label':8s} | {'antrean':8s} | {'riwayat':8s} | {'perubahan':10s}")
labels_test = le.inverse_transform(rfc.predict(X_rfr_test[RFC_FEATURES]))
for lbl, pred in list(zip(labels_test[:5], y_pred_rfr[:5])):
    print(f"  {lbl:8s} | {pred[0]:.4f}   | {pred[1]:.4f}   | {pred[2]:.4f}")

print(f"\nFeature Importance (RFR — gabungan multi-output):")
importances_r = sorted(zip(RFR_FEATURES, rfr.feature_importances_), key=lambda x: -x[1])
for feat, imp in importances_r:
    bar = "█" * int(imp * 40)
    print(f"  {feat:30s} {imp:.4f} {bar}")

# ── 4. Simpan model ───────────────────────────────────────────────────────────
rfc_path    = os.path.join(MODEL_DIR, "rfc_model.pkl")
rfr_path    = os.path.join(MODEL_DIR, "rfr_model.pkl")
le_path     = os.path.join(MODEL_DIR, "label_encoder.pkl")
scaler_path = os.path.join(MODEL_DIR, "rfr_scaler.pkl")

with open(rfc_path,    "wb") as f: pickle.dump(rfc,    f)
with open(rfr_path,    "wb") as f: pickle.dump(rfr,    f)
with open(le_path,     "wb") as f: pickle.dump(le,     f)
with open(scaler_path, "wb") as f: pickle.dump(scaler, f)

print(f"\n── Model tersimpan ──")
print(f"  RFC          : {rfc_path}")
print(f"  RFR          : {rfr_path}")
print(f"  LabelEncoder : {le_path}")
print(f"  RFR Scaler   : {scaler_path}")
print("\nFase 3 selesai.")
