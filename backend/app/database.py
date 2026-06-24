import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "jkn.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            nik             TEXT NOT NULL UNIQUE,
            nama            TEXT NOT NULL,
            tanggal_lahir   TEXT NOT NULL,
            nomor_hp        TEXT NOT NULL UNIQUE,
            email           TEXT NOT NULL UNIQUE,
            password        TEXT NOT NULL,
            pin             TEXT,
            terms_agreed    INTEGER NOT NULL DEFAULT 0,
            created_at      TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS interaction_logs (
            id                      INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id                 INTEGER,
            timestamp               TEXT NOT NULL,
            session_count           INTEGER NOT NULL,
            session_duration        REAL NOT NULL,
            unique_feature_accessed INTEGER NOT NULL,
            feature_frequency       REAL NOT NULL,
            task_completion_rate    REAL NOT NULL,
            task_time               REAL NOT NULL,
            error_count             INTEGER NOT NULL,
            tutorial_accessed       INTEGER NOT NULL,
            shortcut_used           INTEGER NOT NULL,
            freq_antrean            INTEGER NOT NULL DEFAULT 0,
            freq_riwayat            INTEGER NOT NULL DEFAULT 0,
            freq_perubahan_data     INTEGER NOT NULL DEFAULT 0,
            label                   TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    # Migrasi: tambah kolom baru jika belum ada (untuk database yang sudah ada)
    for col in ["freq_antrean", "freq_riwayat", "freq_perubahan_data"]:
        try:
            cursor.execute(f"ALTER TABLE interaction_logs ADD COLUMN {col} INTEGER NOT NULL DEFAULT 0")
        except Exception:
            pass

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS research_logs (
            id                      INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id                 INTEGER,
            timestamp               TEXT NOT NULL,
            label                   TEXT NOT NULL,
            session_count           INTEGER NOT NULL,
            session_duration        REAL NOT NULL,
            unique_feature_accessed INTEGER NOT NULL,
            feature_frequency       REAL NOT NULL,
            task_completion_rate    REAL NOT NULL,
            task_time               REAL NOT NULL,
            error_count             INTEGER NOT NULL,
            tutorial_accessed       INTEGER NOT NULL,
            shortcut_used           INTEGER NOT NULL,
            freq_antrean            INTEGER NOT NULL DEFAULT 0,
            freq_riwayat            INTEGER NOT NULL DEFAULT 0,
            freq_perubahan_data     INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ab_test_logs (
            id                      INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id                 INTEGER,
            grup                    TEXT NOT NULL,
            partisipan_ke           INTEGER NOT NULL DEFAULT 0,
            timestamp               TEXT NOT NULL,
            session_count           INTEGER NOT NULL,
            session_duration        REAL NOT NULL,
            unique_feature_accessed INTEGER NOT NULL,
            feature_frequency       REAL NOT NULL,
            task_completion_rate    REAL NOT NULL,
            task_time               REAL NOT NULL,
            error_count             INTEGER NOT NULL,
            tutorial_accessed       INTEGER NOT NULL,
            shortcut_used           INTEGER NOT NULL,
            freq_antrean            INTEGER NOT NULL DEFAULT 0,
            freq_riwayat            INTEGER NOT NULL DEFAULT 0,
            freq_perubahan_data     INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    conn.commit()
    conn.close()
    print("Database initialized: jkn.db")
