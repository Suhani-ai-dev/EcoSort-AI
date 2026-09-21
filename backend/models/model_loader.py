"""
EcoSort AI — Model Loader
Loads the fine-tuned EfficientNetB0 model once at application startup.
"""
import io

import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow.keras.applications.efficientnet import preprocess_input

_model = None  # global singleton


def load_model(model_path: str) -> None:
    """Load model into the global singleton. Call once at startup."""
    global _model
    _model = tf.keras.models.load_model(model_path)


def is_loaded() -> bool:
    return _model is not None


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Resize to 224x224, apply EfficientNetB0 preprocessing, add batch dim."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224), Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)
    arr = preprocess_input(arr)
    return np.expand_dims(arr, axis=0)  # shape: (1, 224, 224, 3)


def predict(image_bytes: bytes) -> tuple[str, float]:
    """
    Run inference on image bytes.
    Returns: (predicted_class_name, confidence_score)
    """
    if _model is None:
        raise RuntimeError("Model not loaded. Call load_model() first.")
    from models.carbon_map import CLASS_NAMES
    arr = preprocess_image(image_bytes)
    preds = _model.predict(arr, verbose=0)  # shape: (1, 10)
    idx = int(np.argmax(preds[0]))
    confidence = float(preds[0][idx])
    return CLASS_NAMES[idx], confidence
