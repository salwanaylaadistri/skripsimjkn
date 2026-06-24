from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from app.database import init_db, get_connection
from app.models import InteractionRecord, RegisterRequest, LoginRequest, ResetPasswordRequest, SetPinRequest, VerifyPinRequest, PredictRequest, DeleteAccountRequest, ResearchLogRequest, AbTestRecord
import pickle
import os
import numpy as np
import pandas as pd

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

def load_models():
    with open(os.path.join(MODEL_DIR, "rfc_model.pkl"),    "rb") as f: rfc    = pickle.load(f)
    with open(os.path.join(MODEL_DIR, "rfr_model.pkl"),    "rb") as f: rfr    = pickle.load(f)
    with open(os.path.join(MODEL_DIR, "label_encoder.pkl"),"rb") as f: le     = pickle.load(f)
    with open(os.path.join(MODEL_DIR, "rfr_scaler.pkl"),   "rb") as f: scaler = pickle.load(f)
    return rfc, rfr, le, scaler

rfc_model, rfr_model, label_encoder, rfr_scaler = load_models()

app = FastAPI(title="Mobile JKN AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

@app.get("/")
def root():
    return {"status": "ok", "message": "Mobile JKN AI Backend is running"}

# ── Auth ──────────────────────────────────────────────

@app.post("/register")
def register(data: RegisterRequest):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE nik = ?", (data.nik,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="NIK sudah digunakan oleh akun lain.")

    cursor.execute("SELECT id FROM users WHERE nomor_hp = ?", (data.nomor_hp,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Nomor handphone sudah digunakan oleh akun lain.")

    cursor.execute("SELECT id FROM users WHERE email = ?", (data.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Alamat email sudah digunakan oleh akun lain.")

    cursor.execute("""
        INSERT INTO users (nik, nama, tanggal_lahir, nomor_hp, email, password, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        data.nik, data.nama, data.tanggal_lahir,
        data.nomor_hp, data.email, data.password,
        datetime.now(timezone.utc).isoformat(),
    ))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    return {"status": "registered", "user_id": user_id, "nama": data.nama}

@app.post("/login")
def login(data: LoginRequest):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, nama, terms_agreed, pin FROM users WHERE nik = ? AND password = ?",
        (data.nik, data.password)
    )
    user = cursor.fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="NIK atau password salah")
    return {
        "status": "ok",
        "user_id": user["id"],
        "nama": user["nama"],
        "terms_agreed": bool(user["terms_agreed"]),
        "has_pin": user["pin"] is not None,
    }

@app.post("/agree-terms/{user_id}")
def agree_terms(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET terms_agreed = 1 WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()
    return {"status": "ok"}

# ── Password Reset ────────────────────────────────────

@app.get("/check-nik/{nik}")
def check_nik(nik: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT nomor_hp FROM users WHERE nik = ?", (nik,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="NIK tidak ditemukan.")
    hp: str = row["nomor_hp"]
    masked = hp[:4] + "*" * (len(hp) - 7) + hp[-3:]
    return {"nomor_hp_masked": masked}

@app.get("/has-pin/{user_id}")
def has_pin(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT pin FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="User tidak ditemukan.")
    return {"has_pin": row["pin"] is not None}

@app.post("/set-pin")
def set_pin(data: SetPinRequest):
    if len(data.pin) != 6 or not data.pin.isdigit():
        raise HTTPException(status_code=400, detail="PIN harus 6 digit angka.")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET pin = ? WHERE id = ?", (data.pin, data.user_id))
    conn.commit()
    conn.close()
    return {"status": "ok"}

@app.post("/verify-pin")
def verify_pin(data: VerifyPinRequest):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT pin FROM users WHERE id = ?", (data.user_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="User tidak ditemukan.")
    if row["pin"] != data.pin:
        raise HTTPException(status_code=400, detail="PIN salah.")
    return {"status": "ok"}

@app.post("/reset-password")
def reset_password(data: ResetPasswordRequest):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE nik = ?", (data.nik,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="NIK tidak ditemukan.")
    cursor.execute("UPDATE users SET password = ? WHERE nik = ?", (data.new_password, data.nik))
    conn.commit()
    conn.close()
    return {"status": "ok"}

# ── Interaction ───────────────────────────────────────

@app.post("/interaction")
def save_interaction(data: InteractionRecord):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO interaction_logs (
            user_id, timestamp, session_count, session_duration,
            unique_feature_accessed, feature_frequency,
            task_completion_rate, task_time, error_count,
            tutorial_accessed, shortcut_used,
            freq_antrean, freq_riwayat, freq_perubahan_data, label
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.user_id,
        datetime.now(timezone.utc).isoformat(),
        data.session_count,
        data.session_duration,
        data.unique_feature_accessed,
        data.feature_frequency,
        data.task_completion_rate,
        data.task_time,
        data.error_count,
        data.tutorial_accessed,
        data.shortcut_used,
        data.freq_antrean,
        data.freq_riwayat,
        data.freq_perubahan_data,
        data.label,
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"status": "saved", "id": new_id}

@app.get("/interaction")
def get_all_interactions():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM interaction_logs ORDER BY id DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"count": len(rows), "data": rows}

@app.post("/ab-test")
def save_ab_test(data: AbTestRecord):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO ab_test_logs (
            user_id, grup, timestamp, session_count, session_duration,
            unique_feature_accessed, feature_frequency,
            task_completion_rate, task_time, error_count,
            tutorial_accessed, shortcut_used,
            freq_antrean, freq_riwayat, freq_perubahan_data, partisipan_ke
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.user_id, data.grup,
        datetime.now(timezone.utc).isoformat(),
        data.session_count, data.session_duration,
        data.unique_feature_accessed, data.feature_frequency,
        data.task_completion_rate, data.task_time, data.error_count,
        data.tutorial_accessed, data.shortcut_used,
        data.freq_antrean, data.freq_riwayat, data.freq_perubahan_data,
        data.partisipan_ke,
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"status": "saved", "id": new_id}

@app.get("/ab-test")
def get_ab_test_logs():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ab_test_logs ORDER BY id DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    grup_a = [r for r in rows if r["grup"] == "A"]
    grup_b = [r for r in rows if r["grup"] == "B"]
    return {"total": len(rows), "grup_a": len(grup_a), "grup_b": len(grup_b), "data": rows}

@app.post("/predict")
def predict(data: PredictRequest):
    rfc_features = pd.DataFrame([{
        "session_count":           data.session_count,
        "session_duration":        data.session_duration,
        "unique_feature_accessed": data.unique_feature_accessed,
        "feature_frequency":       data.feature_frequency,
        "task_completion_rate":    data.task_completion_rate,
        "task_time":               data.task_time,
        "error_count":             data.error_count,
        "tutorial_accessed":       data.tutorial_accessed,
        "shortcut_used":           data.shortcut_used,
    }])
    rfr_features = pd.DataFrame([{
        "session_count":           data.session_count,
        "session_duration":        data.session_duration,
        "unique_feature_accessed": data.unique_feature_accessed,
        "feature_frequency":       data.feature_frequency,
        "task_completion_rate":    data.task_completion_rate,
        "task_time":               data.task_time,
        "error_count":             data.error_count,
        "tutorial_accessed":       data.tutorial_accessed,
        "shortcut_used":           data.shortcut_used,
        "freq_antrean":            data.freq_antrean,
        "freq_riwayat":            data.freq_riwayat,
        "freq_perubahan_data":     data.freq_perubahan_data,
    }])

    label_encoded = rfc_model.predict(rfc_features)[0]
    label = label_encoder.inverse_transform([label_encoded])[0]
    confidence = float(np.max(rfc_model.predict_proba(rfc_features)[0]))

    rfr_raw = rfr_model.predict(rfr_features)[0]
    rfr_clipped = np.clip(rfr_raw, 0.0, 1.0)

    scores = {
        "antrean":        round(float(rfr_clipped[0]), 4),
        "riwayat":        round(float(rfr_clipped[1]), 4),
        "perubahan_data": round(float(rfr_clipped[2]), 4),
    }

    sorted_features = sorted(scores.items(), key=lambda x: -x[1])
    feature_order = [f for f, _ in sorted_features]

    return {
        "label":         label,
        "confidence":    round(confidence, 4),
        "scores":        scores,
        "feature_order": feature_order,
    }

@app.delete("/delete-account")
def delete_account(data: DeleteAccountRequest):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE id = ? AND password = ?", (data.user_id, data.password))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=401, detail="Password salah.")
    cursor.execute("DELETE FROM interaction_logs WHERE user_id = ?", (data.user_id,))
    cursor.execute("DELETE FROM users WHERE id = ?", (data.user_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}

# ── Research Logs ─────────────────────────────────────
@app.post("/research")
def save_research_log(data: ResearchLogRequest):
    if data.label not in ("pemula", "mahir"):
        raise HTTPException(status_code=400, detail="Label harus 'pemula' atau 'mahir'.")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO research_logs (
            user_id, timestamp, label,
            session_count, session_duration,
            unique_feature_accessed, feature_frequency,
            task_completion_rate, task_time, error_count,
            tutorial_accessed, shortcut_used,
            freq_antrean, freq_riwayat, freq_perubahan_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.user_id,
        datetime.now(timezone.utc).isoformat(),
        data.label,
        data.session_count, data.session_duration,
        data.unique_feature_accessed, data.feature_frequency,
        data.task_completion_rate, data.task_time, data.error_count,
        data.tutorial_accessed, data.shortcut_used,
        data.freq_antrean, data.freq_riwayat, data.freq_perubahan_data,
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"status": "saved", "id": new_id}

@app.get("/research")
def get_research_logs():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM research_logs ORDER BY id")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    pemula = [r for r in rows if r["label"] == "pemula"]
    mahir   = [r for r in rows if r["label"] == "mahir"]
    return {
        "total":  len(rows),
        "pemula": len(pemula),
        "mahir":  len(mahir),
        "data":   rows,
    }

@app.get("/research/by-user/{user_id}")
def get_research_by_user(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM research_logs WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Data research tidak ditemukan untuk user ini.")
    return dict(row)

@app.delete("/research/{log_id}")
def delete_research_log(log_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM research_logs WHERE id = ?", (log_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Data tidak ditemukan.")
    cursor.execute("DELETE FROM research_logs WHERE id = ?", (log_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted", "id": log_id}

@app.delete("/ab-test/{log_id}")
def delete_ab_test_log(log_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM ab_test_logs WHERE id = ?", (log_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Data tidak ditemukan.")
    cursor.execute("DELETE FROM ab_test_logs WHERE id = ?", (log_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted", "id": log_id}

@app.delete("/ab-test")
def delete_all_ab_test_logs():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM ab_test_logs")
    conn.commit()
    count = cursor.rowcount
    conn.close()
    return {"status": "deleted_all", "count": count}

@app.delete("/interaction/{log_id}")
def delete_interaction_log(log_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM interaction_logs WHERE id = ?", (log_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Data tidak ditemukan.")
    cursor.execute("DELETE FROM interaction_logs WHERE id = ?", (log_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted", "id": log_id}

@app.get("/user/{user_id}")
def get_user(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nik, nama, nomor_hp, email FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="User tidak ditemukan.")
    return dict(row)

@app.get("/users")
def get_all_users():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nik, nama, tanggal_lahir, nomor_hp, email, created_at FROM users ORDER BY id DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return {"count": len(rows), "data": rows}
