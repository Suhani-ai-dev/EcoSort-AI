#!/usr/bin/env python3
"""
EcoSort AI — Dataset Preparation
Downloads Kaggle Garbage Classification dataset and remaps to 10-category taxonomy.

Usage:
    python training/dataset_prep.py [--data-dir ./data] [--seed 42]

Dataset: Garbage Classification (Kaggle)
URL: https://www.kaggle.com/datasets/asdasdasasdas/garbage-classification

Download methods:
  Method 1 (Kaggle CLI — requires ~/.kaggle/kaggle.json):
      kaggle datasets download -d asdasdasasdas/garbage-classification -p ./data/raw --unzip

  Method 2 (direct URL — no credentials needed):
      Handled automatically by this script using urllib.request.
      Fallback URL: https://storage.googleapis.com/kaggle-data-sets/81794/189368/bundle/archive.zip
"""

import argparse
import os
import random
import shutil
import zipfile
import urllib.request
from collections import defaultdict
from pathlib import Path

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

FALLBACK_URL = (
    "https://storage.googleapis.com/kaggle-data-sets/81794/189368/bundle/archive.zip"
)

KAGGLE_TO_TAXONOMY: dict[str, str] = {
    "cardboard":   "Paper",
    "paper":       "Paper",
    "plastic":     "Plastic",
    "glass":       "Glass",
    "metal":       "Metal",
    "trash":       "General",
    "clothes":     "Textile",
    "shoes":       "Textile",
    "biological":  "Food/Organic",
    "battery":     "E-Waste",
    "white-glass": "Glass",
    "brown-glass": "Glass",
}

# Train / Val / Test split ratios
TRAIN_RATIO = 0.70
VAL_RATIO   = 0.20
# TEST_RATIO  = 0.10  (remainder)


# ---------------------------------------------------------------------------
# Download helpers
# ---------------------------------------------------------------------------

def _progress_hook(block_num: int, block_size: int, total_size: int) -> None:
    downloaded = block_num * block_size
    if total_size > 0:
        pct = min(100.0, downloaded / total_size * 100)
        print(f"\r  Downloading … {pct:5.1f}%", end="", flush=True)


def download_dataset(raw_dir: Path, zip_path: Path) -> None:
    """
    Try the Kaggle CLI first; fall back to direct URL download.
    The zip is extracted into *raw_dir*.
    """
    if zip_path.exists():
        print(f"[dataset_prep] Archive already present at {zip_path}; skipping download.")
    else:
        # --- Method 1: Kaggle CLI ---
        kaggle_json = Path.home() / ".kaggle" / "kaggle.json"
        if shutil.which("kaggle") and kaggle_json.exists():
            print("[dataset_prep] Downloading via Kaggle CLI …")
            raw_dir.mkdir(parents=True, exist_ok=True)
            exit_code = os.system(
                f'kaggle datasets download -d asdasdasasdas/garbage-classification '
                f'-p "{raw_dir}" --unzip'
            )
            if exit_code == 0:
                print("[dataset_prep] Kaggle CLI download complete.")
                return  # already unzipped by kaggle CLI
            print("[dataset_prep] Kaggle CLI failed; falling back to direct URL.")

        # --- Method 2: Direct URL ---
        print(f"[dataset_prep] Downloading archive from {FALLBACK_URL} …")
        raw_dir.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(FALLBACK_URL, zip_path, reporthook=_progress_hook)
        print()  # newline after progress bar

    # Extract zip
    print(f"[dataset_prep] Extracting {zip_path} → {raw_dir} …")
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(raw_dir)
    print("[dataset_prep] Extraction complete.")


# ---------------------------------------------------------------------------
# Remap + process
# ---------------------------------------------------------------------------

def find_class_dirs(raw_dir: Path) -> dict[str, Path]:
    """
    Walk *raw_dir* to locate directories whose names match KAGGLE_TO_TAXONOMY keys.
    Returns mapping of kaggle_class_name → directory path.
    """
    found: dict[str, Path] = {}
    for dirpath in raw_dir.rglob("*"):
        if dirpath.is_dir() and dirpath.name.lower() in KAGGLE_TO_TAXONOMY:
            found[dirpath.name.lower()] = dirpath
    return found


def remap_to_processed(class_dirs: dict[str, Path], processed_dir: Path) -> None:
    """
    Copy images from each Kaggle class directory into processed/{taxonomy_category}/
    with flat filenames: {kaggle_class}_{original_stem}{suffix}
    """
    processed_dir.mkdir(parents=True, exist_ok=True)
    for kaggle_class, src_dir in class_dirs.items():
        taxonomy_cat = KAGGLE_TO_TAXONOMY[kaggle_class]
        dest_dir = processed_dir / taxonomy_cat
        dest_dir.mkdir(parents=True, exist_ok=True)
        images = [
            f for f in src_dir.iterdir()
            if f.is_file() and f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
        ]
        for img_path in images:
            flat_name = f"{kaggle_class}_{img_path.stem}{img_path.suffix}"
            dest = dest_dir / flat_name
            if not dest.exists():
                shutil.copy2(img_path, dest)
    print(f"[dataset_prep] Images remapped → {processed_dir}")


# ---------------------------------------------------------------------------
# Train / Val / Test split
# ---------------------------------------------------------------------------

def split_dataset(
    processed_dir: Path,
    train_dir: Path,
    val_dir: Path,
    test_dir: Path,
    seed: int,
) -> dict[str, dict[str, int]]:
    """
    Split each category in *processed_dir* into train/val/test by ratio.
    Returns per-category counts for reporting.
    """
    rng = random.Random(seed)
    stats: dict[str, dict[str, int]] = {}

    for cat_dir in sorted(processed_dir.iterdir()):
        if not cat_dir.is_dir():
            continue
        category = cat_dir.name
        images = sorted(cat_dir.iterdir())
        rng.shuffle(images)

        n = len(images)
        n_train = int(n * TRAIN_RATIO)
        n_val   = int(n * VAL_RATIO)
        # remainder goes to test

        splits = {
            "train": (images[:n_train],              train_dir / category),
            "val":   (images[n_train:n_train + n_val], val_dir  / category),
            "test":  (images[n_train + n_val:],        test_dir / category),
        }

        counts: dict[str, int] = {}
        for split_name, (split_images, dest_dir) in splits.items():
            dest_dir.mkdir(parents=True, exist_ok=True)
            for img_path in split_images:
                dest = dest_dir / img_path.name
                if not dest.exists():
                    shutil.copy2(img_path, dest)
            counts[split_name] = len(split_images)

        stats[category] = counts

    return stats


# ---------------------------------------------------------------------------
# Reporting
# ---------------------------------------------------------------------------

def print_stats(stats: dict[str, dict[str, int]]) -> None:
    print("\n[dataset_prep] Class distribution after split:")
    header = f"{'Category':<16} {'Train':>7} {'Val':>7} {'Test':>7} {'Total':>8}"
    print(header)
    print("-" * len(header))
    grand: dict[str, int] = defaultdict(int)
    for category, counts in sorted(stats.items()):
        total = sum(counts.values())
        print(
            f"{category:<16} {counts.get('train', 0):>7} "
            f"{counts.get('val', 0):>7} {counts.get('test', 0):>7} {total:>8}"
        )
        for split, n in counts.items():
            grand[split] += n
    print("-" * len(header))
    grand_total = sum(grand.values())
    print(
        f"{'TOTAL':<16} {grand.get('train', 0):>7} "
        f"{grand.get('val', 0):>7} {grand.get('test', 0):>7} {grand_total:>8}"
    )


# ---------------------------------------------------------------------------
# CLI entry-point
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="EcoSort AI — Dataset Preparation",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--data-dir",
        default="./data",
        help="Root directory for all dataset files",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for reproducible train/val/test splits",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    data_dir = Path(args.data_dir)

    raw_dir       = data_dir / "raw"
    zip_path      = data_dir / "archive.zip"
    processed_dir = data_dir / "processed"
    train_dir     = data_dir / "train"
    val_dir       = data_dir / "val"
    test_dir      = data_dir / "test"

    # Step 1 — Download & extract
    download_dataset(raw_dir, zip_path)

    # Step 2 — Locate Kaggle class directories
    print("[dataset_prep] Scanning for class directories …")
    class_dirs = find_class_dirs(raw_dir)
    if not class_dirs:
        raise RuntimeError(
            f"No Kaggle class directories found under {raw_dir}. "
            "Check that the archive extracted correctly."
        )
    print(f"[dataset_prep] Found classes: {sorted(class_dirs.keys())}")

    # Step 3 — Remap to taxonomy
    remap_to_processed(class_dirs, processed_dir)

    # Step 4 — Split into train / val / test
    print(f"[dataset_prep] Splitting with seed={args.seed} …")
    stats = split_dataset(processed_dir, train_dir, val_dir, test_dir, seed=args.seed)

    # Step 5 — Report
    print_stats(stats)
    print(
        f"\n[dataset_prep] Done.\n"
        f"  Train → {train_dir}\n"
        f"  Val   → {val_dir}\n"
        f"  Test  → {test_dir}\n"
    )


if __name__ == "__main__":
    main()
