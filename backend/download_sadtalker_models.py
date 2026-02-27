"""
Download SadTalker Model Checkpoints
This script downloads the required model files for realistic avatar generation
"""

import os
import urllib.request
from pathlib import Path
import sys

print("🔽 SadTalker Model Downloader")
print("=" * 60)

CHECKPOINT_DIR = Path(__file__).parent / "SadTalker" / "checkpoints"
CHECKPOINT_DIR.mkdir(exist_ok=True, parents=True)

# Model URLs from SadTalker releases
MODELS = {
    "mapping_00109-model.pth.tar": "https://github.com/OpenTalker/SadTalker/releases/download/v0.0.2-rc/mapping_00109-model.pth.tar",
    "mapping_00229-model.pth.tar": "https://github.com/OpenTalker/SadTalker/releases/download/v0.0.2-rc/mapping_00229-model.pth.tar",
    "SadTalker_V0.0.2_256.safetensors": "https://github.com/OpenTalker/SadTalker/releases/download/v0.0.2-rc/SadTalker_V0.0.2_256.safetensors",
    "SadTalker_V0.0.2_512.safetensors": "https://github.com/OpenTalker/SadTalker/releases/download/v0.0.2-rc/SadTalker_V0.0.2_512.safetensors",
}

def download_file(url, destination):
    """Download a file with progress"""
    try:
        print(f"\n📥 Downloading: {destination.name}")
        print(f"   From: {url}")
        
        def show_progress(block_num, block_size, total_size):
            downloaded = block_num * block_size
            percent = min(downloaded * 100 / total_size, 100)
            bar_length = 40
            filled = int(bar_length * percent / 100)
            bar = '█' * filled + '░' * (bar_length - filled)
            sys.stdout.write(f'\r   [{bar}] {percent:.1f}% ({downloaded / 1024 / 1024:.1f}MB / {total_size / 1024 / 1024:.1f}MB)')
            sys.stdout.flush()
        
        urllib.request.urlretrieve(url, destination, show_progress)
        print(f"\n   ✅ Downloaded successfully!")
        return True
    except Exception as e:
        print(f"\n   ❌ Error: {e}")
        return False

def main():
    print(f"\n📁 Checkpoint directory: {CHECKPOINT_DIR}")
    print(f"\n⚠️  This will download approximately 2-3 GB of files")
    print(f"   Make sure you have stable internet connection\n")
    
    response = input("Continue? (y/n): ")
    if response.lower() != 'y':
        print("❌ Download cancelled")
        return
    
    success_count = 0
    for filename, url in MODELS.items():
        destination = CHECKPOINT_DIR / filename
        
        if destination.exists():
            size_mb = destination.stat().st_size / 1024 / 1024
            if size_mb > 1:  # If file is larger than 1MB, assume it's complete
                print(f"\n✅ {filename} already exists ({size_mb:.1f}MB)")
                success_count += 1
                continue
        
        if download_file(url, destination):
            success_count += 1
    
    print("\n" + "=" * 60)
    print(f"\n📊 Summary: {success_count}/{len(MODELS)} files downloaded")
    
    if success_count == len(MODELS):
        print("\n🎉 All models downloaded successfully!")
        print("\n✅ Next steps:")
        print("   1. Install requirements: pip install -r SadTalker/requirements.txt")
        print("   2. Test generation: python quick_test.py")
    else:
        print("\n⚠️  Some models failed to download")
        print("   Try manual download from:")
        print("   https://github.com/OpenTalker/SadTalker/releases/tag/v0.0.2-rc")

if __name__ == "__main__":
    main()
