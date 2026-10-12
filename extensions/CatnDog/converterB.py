#!/usr/bin/env python3
"""
convert_pets.py

- Resizes every PNG under the source folder to 64x64 (preserving the
  individual sprite, transparent padding to keep aspect ratio).
- Writes results to an output folder mirroring the structure.
- Prints a base64 data URI built from "cat/Idle (1).png" to use as the
  extension's menuIconURI.

Usage:
    python convert_pets.py [SRC_DIR] [OUT_DIR]

Defaults:
    SRC_DIR = png
    OUT_DIR = png_64
"""

import sys
import base64
from pathlib import Path
from io import BytesIO

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required. Install with:  pip install Pillow")

TARGET_SIZE = (64, 64)
ICON_RELATIVE = Path("cat") / "Idle (1).png"


def resize_to_canvas(img: Image.Image, size=TARGET_SIZE) -> Image.Image:
    """Scale img to fit inside `size`, keeping aspect ratio,
    centered on a transparent canvas."""
    img = img.convert("RGBA")

    # Scale to fit within the target box.
    src_w, src_h = img.size
    target_w, target_h = size
    scale = min(target_w / src_w, target_h / src_h)
    new_w = max(1, round(src_w * scale))
    new_h = max(1, round(src_h * scale))

    resized = img.resize((new_w, new_h), Image.NEAREST)  # NEAREST keeps pixel art crisp

    # Paste centered onto a transparent 64x64 canvas.
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    offset = ((target_w - new_w) // 2, (target_h - new_h) // 2)
    canvas.paste(resized, offset, resized)
    return canvas


def convert_all(src_dir: Path, out_dir: Path) -> int:
    count = 0
    for path in sorted(src_dir.rglob("*.png")):
        rel = path.relative_to(src_dir)
        out_path = out_dir / rel
        out_path.parent.mkdir(parents=True, exist_ok=True)

        with Image.open(path) as img:
            converted = resize_to_canvas(img)
            converted.save(out_path, "PNG")

        print(f"  {rel}")
        count += 1
    return count


def make_icon_data_uri(out_dir: Path) -> str:
    icon_path = out_dir / ICON_RELATIVE
    if not icon_path.exists():
        return ""
    with Image.open(icon_path) as img:
        img = resize_to_canvas(img)  # already 64x64 but ensures consistency
        buf = BytesIO()
        img.save(buf, "PNG")
        encoded = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/png;base64,{encoded}"


def main():
    src_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("png")
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("png_64")

    if not src_dir.is_dir():
        sys.exit(f"Source directory not found: {src_dir}")

    print(f"Converting PNGs in '{src_dir}' -> '{out_dir}' (64x64)...")
    n = convert_all(src_dir, out_dir)
    print(f"Done. Converted {n} images.\n")

    print("Icon data URI (from cat/Idle (1).png):\n")
    uri = make_icon_data_uri(src_dir)  # use original for best quality source
    if uri:
        print(uri)
        print()
        print("Paste into CatnDog.js, e.g.:")
        print('  const petIcon = "' + uri[:60] + '...";')
    else:
        print(f"Could not find {ICON_RELATIVE} to build the icon.")


if __name__ == "__main__":
    main()