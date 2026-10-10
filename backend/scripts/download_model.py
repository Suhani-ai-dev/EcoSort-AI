#!/usr/bin/env python3
"""
EcoSort AI — Model Download Utility

Downloads a pre-exported waste_classifier.h5 checkpoint.

NOTE: Replace MODEL_DOWNLOAD_URL with your actual hosted model URL
(e.g. a public Google Drive export, Hugging Face Hub model, or GitHub Release asset).
Set the MODEL_DOWNLOAD_URL environment variable before running this script.

Usage:
    MODEL_DOWNLOAD_URL=https://example.com/waste_classifier.h5 \\
        python scripts/download_model.py [--output ./models/waste_classifier.h5]
"""

import argparse
import os
import urllib.request
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Read from environment — MUST be set before running this script.
# Example values:
#   Hugging Face Hub:   https://huggingface.co/<user>/<repo>/resolve/main/waste_classifier.h5
#   GitHub Release:     https://github.com/<user>/<repo>/releases/download/<tag>/waste_classifier.h5
#   Google Drive (direct export):
#     https://drive.google.com/uc?export=download&id=<FILE_ID>
MODEL_DOWNLOAD_URL: str = os.environ.get("MODEL_DOWNLOAD_URL", "")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _progress_hook(block_num: int, block_size: int, total_size: int) -> None:
    """Print a simple download progress bar to stdout."""
    downloaded = block_num * block_size
    if total_size > 0:
        pct = min(100.0, downloaded / total_size * 100)
        bar_len = 40
        filled = int(bar_len * pct / 100)
        bar = "█" * filled + "░" * (bar_len - filled)
        print(f"\r  [{bar}] {pct:5.1f}%  ({downloaded:,} / {total_size:,} bytes)",
              end="", flush=True)
    else:
        # Total size unknown
        print(f"\r  Downloaded {downloaded:,} bytes …", end="", flush=True)


def download_model(url: str, output_path: Path) -> None:
    """Download *url* to *output_path*, creating parent directories as needed."""
    if not url:
        print(
            "[download_model] MODEL_DOWNLOAD_URL is not set.\n"
            "  EcoSort AI includes built-in zero-config demo classification using\n"
            "  pre-trained EfficientNetB0 ImageNet weights automatically.\n\n"
            "  To use a custom trained model:\n"
            "    1. Set MODEL_DOWNLOAD_URL=<url> and rerun this script, OR\n"
            "    2. Run training:\n"
            "       python training/dataset_prep.py\n"
            "       python training/train.py --output-path ./models/waste_classifier.h5"
        )
        return

    output_path.parent.mkdir(parents=True, exist_ok=True)

    if output_path.exists():
        print(f"[download_model] Model already present at {output_path}; skipping.")
        return

    print(f"[download_model] Downloading model from:\n  {url}")
    print(f"[download_model] Saving to: {output_path}\n")

    tmp_path = output_path.with_suffix(".h5.tmp")
    try:
        urllib.request.urlretrieve(url, tmp_path, reporthook=_progress_hook)
        print()  # newline after progress bar
        tmp_path.rename(output_path)
    except Exception:
        if tmp_path.exists():
            tmp_path.unlink()
        raise

    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"[download_model] Download complete — {size_mb:.1f} MB saved to {output_path}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="EcoSort AI — Download pre-trained waste_classifier.h5",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--output",
        default="./models/waste_classifier.h5",
        help="Destination path for the downloaded model file",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    output_path = Path(args.output)
    download_model(MODEL_DOWNLOAD_URL, output_path)


if __name__ == "__main__":
    main()
