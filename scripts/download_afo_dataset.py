import kagglehub
from pathlib import Path

def download_afo_dataset():
    print("=" * 60)
    print("COASTX - AFO (Aerial Dataset of Floating Objects) Downloader")
    print("=" * 60)
    print("[INFO] Requesting dataset: jangsienicajzkowy/afo-aerial-dataset-of-floating-objects")
    
    path = kagglehub.dataset_download(
        "jangsienicajzkowy/afo-aerial-dataset-of-floating-objects"
    )
    
    dataset_path = Path(path)
    print(f"\n[OK] Dataset downloaded/verified successfully!")
    print(f"[INFO] Path to dataset files: {dataset_path.resolve()}")
    
    if dataset_path.exists():
        files = list(dataset_path.rglob("*"))
        file_count = sum(1 for f in files if f.is_file())
        dir_count = sum(1 for f in files if f.is_dir())
        print(f"[INFO] Total files in dataset: {file_count}")
        print(f"[INFO] Total directories: {dir_count}")
    
    return path

if __name__ == "__main__":
    download_afo_dataset()
