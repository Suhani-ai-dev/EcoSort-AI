"""
EcoSort AI — Model Loader
Loads the fine-tuned EfficientNetB0 model once at application startup.
Provides an intelligent pre-trained EfficientNetB0 baseline with taxonomy mapping
when custom weights are not yet fine-tuned, ensuring 100% demo readiness.
"""
import io
import os
from pathlib import Path
from typing import Tuple

import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow.keras.applications.efficientnet import preprocess_input, decode_predictions

from models.carbon_map import CLASS_NAMES, SUB_CATEGORY_MAP

_model: tf.keras.Model | None = None  # global singleton
_is_custom_10class: bool = False

# Mapping from common ImageNet class tokens/synsets to EcoSort (category, sub_category)
IMAGENET_TO_TAXONOMY: dict[str, tuple[str, str]] = {
    # Plastic
    "water_bottle": ("Plastic", "pet_bottle"),
    "pop_bottle": ("Plastic", "pet_bottle"),
    "pill_bottle": ("Plastic", "hdpe"),
    "plastic_bag": ("Plastic", "plastic_bag"),
    "water_jug": ("Plastic", "hdpe"),
    "lotion": ("Plastic", "hdpe"),
    "shampoo": ("Plastic", "hdpe"),
    "packet": ("Plastic", "plastic_bag"),
    "nipple": ("Plastic", "pet_bottle"),
    "bucket": ("Plastic", "hdpe"),
    "cup": ("Plastic", "pet_bottle"),

    # Paper
    "carton": ("Paper", "cardboard"),
    "cardboard": ("Paper", "cardboard"),
    "envelope": ("Paper", "office_paper"),
    "paper_towel": ("Paper", "tissue"),
    "toilet_tissue": ("Paper", "tissue"),
    "newspaper": ("Paper", "newspaper"),
    "comic_book": ("Paper", "newspaper"),
    "book_jacket": ("Paper", "office_paper"),
    "menu": ("Paper", "office_paper"),
    "binder": ("Paper", "cardboard"),
    "notebook": ("Paper", "office_paper"),
    "paper": ("Paper", "office_paper"),
    "web_site": ("Paper", "office_paper"),

    # Glass
    "wine_bottle": ("Glass", "colored_glass"),
    "beer_bottle": ("Glass", "colored_glass"),
    "goblet": ("Glass", "clear_glass"),
    "beer_glass": ("Glass", "clear_glass"),
    "beaker": ("Glass", "clear_glass"),
    "sunglasses": ("Glass", "clear_glass"),
    "sunglass": ("Glass", "clear_glass"),
    "magnifying_glass": ("Glass", "clear_glass"),
    "whiskey_jug": ("Glass", "colored_glass"),
    "cocktail_shaker": ("Glass", "clear_glass"),

    # Metal
    "can_opener": ("Metal", "steel_can"),
    "tin_can": ("Metal", "steel_can"),
    "beer_can": ("Metal", "aluminium_can"),
    "soda_can": ("Metal", "aluminium_can"),
    "pot": ("Metal", "steel_can"),
    "frying_pan": ("Metal", "steel_can"),
    "pan": ("Metal", "steel_can"),
    "nail": ("Metal", "steel_can"),
    "screw": ("Metal", "steel_can"),
    "safety_pin": ("Metal", "steel_can"),
    "iron": ("Metal", "steel_can"),
    "dumbbell": ("Metal", "steel_can"),
    "wrench": ("Metal", "steel_can"),
    "hammer": ("Metal", "steel_can"),
    "chain": ("Metal", "steel_can"),
    "thimble": ("Metal", "aluminium_can"),
    "hook": ("Metal", "steel_can"),
    "brass": ("Metal", "steel_can"),
    "foil": ("Metal", "foil"),

    # Food/Organic
    "banana": ("Food/Organic", "fruit_peel"),
    "apple": ("Food/Organic", "fruit_peel"),
    "orange": ("Food/Organic", "fruit_peel"),
    "lemon": ("Food/Organic", "fruit_peel"),
    "strawberry": ("Food/Organic", "fruit_peel"),
    "pineapple": ("Food/Organic", "fruit_peel"),
    "fig": ("Food/Organic", "fruit_peel"),
    "pomegranate": ("Food/Organic", "fruit_peel"),
    "custard_apple": ("Food/Organic", "fruit_peel"),
    "jackfruit": ("Food/Organic", "fruit_peel"),
    "broccoli": ("Food/Organic", "cooked_food"),
    "cauliflower": ("Food/Organic", "cooked_food"),
    "cabbage": ("Food/Organic", "cooked_food"),
    "head_cabbage": ("Food/Organic", "cooked_food"),
    "cucumber": ("Food/Organic", "fruit_peel"),
    "bell_pepper": ("Food/Organic", "fruit_peel"),
    "mushroom": ("Food/Organic", "cooked_food"),
    "artichoke": ("Food/Organic", "cooked_food"),
    "zucchini": ("Food/Organic", "cooked_food"),
    "butternut_squash": ("Food/Organic", "cooked_food"),
    "spaghetti_squash": ("Food/Organic", "cooked_food"),
    "pizza": ("Food/Organic", "cooked_food"),
    "cheeseburger": ("Food/Organic", "cooked_food"),
    "bagel": ("Food/Organic", "cooked_food"),
    "pretzel": ("Food/Organic", "cooked_food"),
    "hotdog": ("Food/Organic", "cooked_food"),
    "bakery": ("Food/Organic", "cooked_food"),
    "mashed_potato": ("Food/Organic", "cooked_food"),
    "meat_loaf": ("Food/Organic", "cooked_food"),
    "corn": ("Food/Organic", "cooked_food"),
    "potpie": ("Food/Organic", "cooked_food"),
    "hay": ("Food/Organic", "garden_waste"),

    # E-Waste
    "cellular_telephone": ("E-Waste", "phone"),
    "dial_telephone": ("E-Waste", "phone"),
    "laptop": ("E-Waste", "phone"),
    "notebook": ("E-Waste", "phone"),
    "computer_keyboard": ("E-Waste", "circuit_board"),
    "mouse": ("E-Waste", "charger"),
    "monitor": ("E-Waste", "circuit_board"),
    "screen": ("E-Waste", "circuit_board"),
    "television": ("E-Waste", "circuit_board"),
    "hard_disc": ("E-Waste", "circuit_board"),
    "modem": ("E-Waste", "charger"),
    "printer": ("E-Waste", "circuit_board"),
    "iPod": ("E-Waste", "phone"),
    "tape_player": ("E-Waste", "charger"),
    "radio": ("E-Waste", "charger"),
    "joystick": ("E-Waste", "charger"),
    "cassette": ("E-Waste", "charger"),
    "cd_player": ("E-Waste", "circuit_board"),
    "vacuum": ("E-Waste", "charger"),
    "toaster": ("E-Waste", "charger"),

    # Medical
    "syringe": ("Medical", "syringe"),
    "stethoscope": ("Medical", "medicine_packaging"),
    "band_aid": ("Medical", "mask"),
    "bandage": ("Medical", "mask"),
    "pill": ("Medical", "medicine_packaging"),
    "medicine": ("Medical", "medicine_packaging"),

    # Hazardous
    "aerosol_can": ("Hazardous", "chemical_container"),
    "gasmask": ("Hazardous", "solvent"),
    "lighter": ("Hazardous", "solvent"),
    "matchstick": ("Hazardous", "paint"),
    "torch": ("Hazardous", "chemical_container"),

    # Textile
    "jersey": ("Textile", "clothing"),
    "trench_coat": ("Textile", "clothing"),
    "cardigan": ("Textile", "clothing"),
    "suit": ("Textile", "clothing"),
    "jean": ("Textile", "clothing"),
    "sock": ("Textile", "clothing"),
    "shoe": ("Textile", "shoes"),
    "running_shoe": ("Textile", "shoes"),
    "sneaker": ("Textile", "shoes"),
    "sandal": ("Textile", "shoes"),
    "boot": ("Textile", "shoes"),
    "mitten": ("Textile", "clothing"),
    "glove": ("Textile", "clothing"),
    "tie": ("Textile", "clothing"),
    "wool": ("Textile", "fabric_scraps"),
    "velvet": ("Textile", "fabric_scraps"),
    "quilt": ("Textile", "fabric_scraps"),
    "pillow": ("Textile", "fabric_scraps"),
    "umbrella": ("Textile", "fabric_scraps"),
    "apron": ("Textile", "clothing"),
    "cloak": ("Textile", "clothing"),
    "kimono": ("Textile", "clothing"),
    "scarf": ("Textile", "clothing"),
}


def load_model(model_path: str) -> None:
    """Load model into the global singleton. Call once at startup."""
    global _model, _is_custom_10class

    if os.path.exists(model_path):
        try:
            print(f"[model_loader] Loading custom model weights from {model_path} ...")
            _model = tf.keras.models.load_model(model_path)
            # Check output shape to distinguish custom 10-class model from full backbone
            if hasattr(_model, "output_shape") and _model.output_shape[-1] == 10:
                _is_custom_10class = True
                print("[model_loader] Loaded custom fine-tuned 10-class model.")
                return
            else:
                _is_custom_10class = False
                print("[model_loader] Model loaded (using ImageNet feature mapping).")
                return
        except Exception as e:
            print(f"[model_loader] Warning: Could not load {model_path}: {e}")

    # Fallback to pre-trained EfficientNetB0 on ImageNet
    print("[model_loader] Initialising pre-trained EfficientNetB0 backbone (ImageNet) ...")
    _model = tf.keras.applications.EfficientNetB0(weights="imagenet")
    _is_custom_10class = False
    print("[model_loader] EfficientNetB0 baseline loaded successfully.")


def is_loaded() -> bool:
    return _model is not None


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Resize to 224x224, apply EfficientNetB0 preprocessing, add batch dim."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224), Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)
    arr = preprocess_input(arr)
    return np.expand_dims(arr, axis=0)  # shape: (1, 224, 224, 3)


def predict(image_bytes: bytes) -> Tuple[str, float, str]:
    """
    Run inference on image bytes.
    Returns: (category, confidence, sub_category)
    """
    global _model
    if _model is None:
        load_model("./models/waste_classifier.h5")

    if _model is None:
        raise RuntimeError("Model could not be initialized.")

    arr = preprocess_image(image_bytes)

    if _is_custom_10class:
        preds = _model.predict(arr, verbose=0)  # shape: (1, 10)
        idx = int(np.argmax(preds[0]))
        confidence = float(preds[0][idx])
        category = CLASS_NAMES[idx]
        return category, confidence, ""

    # ImageNet classification with semantic taxonomy mapping
    preds = _model.predict(arr, verbose=0)
    decoded_list = decode_predictions(preds, top=10)[0]

    # Search top predictions for an item matching our taxonomy
    for _, class_name, score in decoded_list:
        clean_name = class_name.lower()
        if clean_name in IMAGENET_TO_TAXONOMY:
            category, sub_cat = IMAGENET_TO_TAXONOMY[clean_name]
            return category, float(score), sub_cat

        # Substring / keyword heuristic
        for key, (cat, sub_cat) in IMAGENET_TO_TAXONOMY.items():
            if key in clean_name or clean_name in key:
                return cat, float(score), sub_cat

    # If none of the top-10 specifically matched, take top prediction as General
    top_score = float(decoded_list[0][2]) if decoded_list else 0.5
    return "General", top_score, "mixed"
