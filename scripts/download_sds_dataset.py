import kagglehub
from pathlib import Path

def download_sds_dataset():
    print("=" * 60)
    print("COASTX - SDS (Satellite / Shoreline Detection) Downloader")
    print("=" * 60)
    print("[INFO] Requesting dataset: ubiratanfilho/sds-dataset")
    
    path = kagglehub.dataset_download("ubiratanfilho/sds-dataset")
    
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
    download_sds_dataset()
