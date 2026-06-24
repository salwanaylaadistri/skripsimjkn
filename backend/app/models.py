from pydantic import BaseModel
from typing import Optional

class InteractionRecord(BaseModel):
    user_id:                 Optional[int] = None
    session_count:           int
    session_duration:        float
    unique_feature_accessed: int
    feature_frequency:       float
    task_completion_rate:    float
    task_time:               float
    error_count:             int
    tutorial_accessed:       int
    shortcut_used:           int
    freq_antrean:            int = 0
    freq_riwayat:            int = 0
    freq_perubahan_data:     int = 0
    label:                   Optional[str] = None

class RegisterRequest(BaseModel):
    nik:            str
    nama:           str
    tanggal_lahir:  str
    nomor_hp:       str
    email:          str
    password:       str

class LoginRequest(BaseModel):
    nik:      str
    password: str

class ResetPasswordRequest(BaseModel):
    nik:          str
    new_password: str

class SetPinRequest(BaseModel):
    user_id: int
    pin:     str

class VerifyPinRequest(BaseModel):
    user_id: int
    pin:     str

class ResearchLogRequest(BaseModel):
    user_id:                 Optional[int] = None
    label:                   str
    session_count:           int
    session_duration:        float
    unique_feature_accessed: int
    feature_frequency:       float
    task_completion_rate:    float
    task_time:               float
    error_count:             int
    tutorial_accessed:       int
    shortcut_used:           int
    freq_antrean:            int = 0
    freq_riwayat:            int = 0
    freq_perubahan_data:     int = 0

class AbTestRecord(BaseModel):
    user_id:                 Optional[int] = None
    grup:                    str
    partisipan_ke:           int = 0
    session_count:           int
    session_duration:        float
    unique_feature_accessed: int
    feature_frequency:       float
    task_completion_rate:    float
    task_time:               float
    error_count:             int
    tutorial_accessed:       int
    shortcut_used:           int
    freq_antrean:            int = 0
    freq_riwayat:            int = 0
    freq_perubahan_data:     int = 0

class DeleteAccountRequest(BaseModel):
    user_id: int
    password: str

class PredictRequest(BaseModel):
    session_count:           int
    session_duration:        float
    unique_feature_accessed: int
    feature_frequency:       float
    task_completion_rate:    float
    task_time:               float
    error_count:             int
    tutorial_accessed:       int
    shortcut_used:           int
    freq_antrean:            int = 0
    freq_riwayat:            int = 0
    freq_perubahan_data:     int = 0
