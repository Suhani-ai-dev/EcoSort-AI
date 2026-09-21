#!/usr/bin/env python3
"""
EcoSort AI — EfficientNetB0 Fine-tuning
Two-phase transfer learning:
  Phase 1 (epochs 1-5):  Freeze EfficientNetB0 base, train classification head only
  Phase 2 (epochs 6-15): Unfreeze top 30 layers of EfficientNetB0, fine-tune at low LR

Output: waste_classifier.h5 (saved to --output-path, default ./models/waste_classifier.h5)

Requirements:
    tensorflow>=2.16, pillow, numpy

Usage:
    python training/train.py [--data-dir ./data] [--output-path ./models/waste_classifier.h5]
                             [--epochs-phase1 5] [--epochs-phase2 10]
"""

import argparse
import os
from pathlib import Path

import tensorflow as tf
from tensorflow.keras import layers, Model
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.applications.efficientnet import preprocess_input

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

IMAGE_SIZE  = (224, 224)
BATCH_SIZE  = 32
NUM_CLASSES = 10


# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------

def build_dataset(
    directory: str,
    augment: bool,
    image_size: tuple[int, int] = IMAGE_SIZE,
    batch_size: int = BATCH_SIZE,
) -> tf.data.Dataset:
    """
    Load images from *directory* using image_dataset_from_directory.
    Applies EfficientNetB0 preprocessing (and optional augmentation) as
    a mapped step so the pipeline stays fully on-device.
    """
    ds = tf.keras.utils.image_dataset_from_directory(
        directory,
        image_size=image_size,
        batch_size=batch_size,
        label_mode="categorical",
        shuffle=augment,         # shuffle only during training
        seed=42,
    )

    # Data augmentation (training only)
    augmentation = tf.keras.Sequential(
        [
            layers.RandomFlip("horizontal_and_vertical"),
            layers.RandomRotation(0.1),
            layers.RandomZoom(0.1),
        ],
        name="augmentation",
    )

    def preprocess(images: tf.Tensor, labels: tf.Tensor):
        if augment:
            images = augmentation(images, training=True)
        images = preprocess_input(images)
        return images, labels

    ds = ds.map(preprocess, num_parallel_calls=tf.data.AUTOTUNE)
    return ds.prefetch(tf.data.AUTOTUNE)


# ---------------------------------------------------------------------------
# Model construction
# ---------------------------------------------------------------------------

def build_model(num_classes: int = NUM_CLASSES) -> tuple[Model, Model]:
    """
    Returns (full_model, base_model) where base_model is the EfficientNetB0
    feature extractor so its trainability can be toggled between phases.
    """
    base_model = EfficientNetB0(
        include_top=False,
        weights="imagenet",
        input_shape=(IMAGE_SIZE[0], IMAGE_SIZE[1], 3),
    )
    base_model.trainable = False  # frozen for Phase 1

    inputs = tf.keras.Input(shape=(IMAGE_SIZE[0], IMAGE_SIZE[1], 3))
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D(name="gap")(x)
    x = layers.BatchNormalization(name="bn")(x)
    x = layers.Dropout(0.3, name="drop1")(x)
    x = layers.Dense(256, activation="relu", name="fc1")(x)
    x = layers.Dropout(0.2, name="drop2")(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="predictions")(x)

    model = Model(inputs, outputs, name="ecosort_efficientnetb0")
    return model, base_model


# ---------------------------------------------------------------------------
# Training helpers
# ---------------------------------------------------------------------------

def make_callbacks(checkpoint_path: str) -> list:
    return [
        tf.keras.callbacks.ModelCheckpoint(
            filepath=checkpoint_path,
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1,
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy",
            patience=3,
            restore_best_weights=True,
            verbose=1,
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=2,
            min_lr=1e-7,
            verbose=1,
        ),
    ]


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="EcoSort AI — EfficientNetB0 Fine-tuning",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--data-dir",
        default="./data",
        help="Root data directory (expects train/ and val/ sub-directories)",
    )
    parser.add_argument(
        "--output-path",
        default="./models/waste_classifier.h5",
        help="Where to save the final trained model (.h5 format)",
    )
    parser.add_argument(
        "--epochs-phase1",
        type=int,
        default=5,
        help="Epochs for Phase 1 (frozen base, head-only training)",
    )
    parser.add_argument(
        "--epochs-phase2",
        type=int,
        default=10,
        help="Epochs for Phase 2 (partial unfreeze fine-tuning)",
    )
    return parser.parse_args()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    args = parse_args()
    data_dir     = Path(args.data_dir)
    output_path  = Path(args.output_path)
    train_dir    = str(data_dir / "train")
    val_dir      = str(data_dir / "val")
    test_dir     = str(data_dir / "test")

    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Intermediate checkpoint used by ModelCheckpoint
    best_ckpt = str(output_path.with_suffix("")) + "_best.h5"

    # ------------------------------------------------------------------
    # Data pipelines
    # ------------------------------------------------------------------
    print("[train] Building data pipelines …")
    train_ds = build_dataset(train_dir, augment=True)
    val_ds   = build_dataset(val_dir,   augment=False)

    # ------------------------------------------------------------------
    # Build model
    # ------------------------------------------------------------------
    print("[train] Building model …")
    model, base_model = build_model(NUM_CLASSES)
    model.summary(line_length=90)

    # ------------------------------------------------------------------
    # Phase 1 — train classification head only
    # ------------------------------------------------------------------
    print(
        f"\n[train] ═══ Phase 1: frozen base, training head for "
        f"{args.epochs_phase1} epochs (lr=1e-3) ═══"
    )
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs_phase1,
        callbacks=make_callbacks(best_ckpt),
    )

    # ------------------------------------------------------------------
    # Phase 2 — unfreeze top 30 layers, fine-tune at low LR
    # ------------------------------------------------------------------
    print(
        f"\n[train] ═══ Phase 2: unfreezing top 30 layers, fine-tuning for "
        f"{args.epochs_phase2} epochs (lr=1e-5) ═══"
    )
    base_model.trainable = True

    # Freeze all base layers except the last 30
    for layer in base_model.layers[:-30]:
        layer.trainable = False

    trainable_count = sum(1 for l in base_model.layers if l.trainable)
    print(
        f"[train] Base model: {len(base_model.layers)} layers total, "
        f"{trainable_count} unfrozen for fine-tuning."
    )

    # Recompile at lower learning rate
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs_phase1 + args.epochs_phase2,
        initial_epoch=args.epochs_phase1,
        callbacks=make_callbacks(best_ckpt),
    )

    # ------------------------------------------------------------------
    # Load best weights (saved by ModelCheckpoint) and evaluate on test set
    # ------------------------------------------------------------------
    if os.path.exists(best_ckpt):
        print(f"[train] Loading best checkpoint from {best_ckpt} …")
        model.load_weights(best_ckpt)

    if os.path.isdir(test_dir):
        print("\n[train] Evaluating on test set …")
        test_ds = build_dataset(test_dir, augment=False)
        test_loss, test_acc = model.evaluate(test_ds, verbose=1)
        print(f"[train] Test accuracy: {test_acc:.4f}  |  Test loss: {test_loss:.4f}")
    else:
        print(f"[train] Test directory not found at {test_dir}; skipping evaluation.")

    # ------------------------------------------------------------------
    # Save final model
    # ------------------------------------------------------------------
    print(f"\n[train] Saving final model → {output_path}")
    model.save(str(output_path))
    print("[train] Done.")


if __name__ == "__main__":
    main()
