import shutil
import subprocess
from typing import Any, Dict, Optional, List
import psutil


def get_ram_info() -> Dict[str, Any]:
    mem = psutil.virtual_memory()
    total_gb = round(mem.total / (1024**3), 2)
    available_gb = round(mem.available / (1024**3), 2)
    used_gb = round(mem.used / (1024**3), 2)
    return {
        "total_bytes": mem.total,
        "total_gb": total_gb,
        "available_gb": available_gb,
        "used_gb": used_gb,
        "usage_percent": mem.percent,
    }


def get_cpu_info() -> Dict[str, Any]:
    logical_cores = psutil.cpu_count(logical=True) or 1
    physical_cores = psutil.cpu_count(logical=False) or logical_cores
    return {
        "logical_cores": logical_cores,
        "physical_cores": physical_cores,
        "cpu_usage_percent": psutil.cpu_percent(interval=0.1),
    }


def get_gpu_info() -> Dict[str, Any]:
    # 1. Try PyTorch CUDA if installed
    try:
        import torch

        if torch.cuda.is_available():
            device_count = torch.cuda.device_count()
            devices = []
            for i in range(device_count):
                props = torch.cuda.get_device_properties(i)
                total_mb = round(props.total_memory / (1024**2))
                devices.append(
                    {
                        "index": i,
                        "name": torch.cuda.get_device_name(i),
                        "vram_total_mb": total_mb,
                    }
                )
            name = devices[0]["name"] if devices else "Unknown GPU"
            vendor = "NVIDIA" if "NVIDIA" in name.upper() else "AMD"
            return {
                "available": True,
                "vendor": vendor,
                "name": name,
                "vram_total_mb": devices[0]["vram_total_mb"] if devices else None,
                "vram_free_mb": None,
                "count": device_count,
                "devices": devices,
                "details": f"Detected {device_count} GPU(s) via PyTorch",
            }
    except Exception:
        pass

    # 2. Try nvidia-smi CLI
    if shutil.which("nvidia-smi"):
        try:
            cmd = [
                "nvidia-smi",
                "--query-gpu=name,memory.total,memory.free",
                "--format=csv,noheader,nounits",
            ]
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=3)
            if res.returncode == 0 and res.stdout.strip():
                lines = [
                    line.strip()
                    for line in res.stdout.strip().split("\n")
                    if line.strip()
                ]
                devices = []
                for idx, line in enumerate(lines):
                    parts = [p.strip() for p in line.split(",")]
                    if len(parts) >= 3:
                        name, total_mem, free_mem = parts[0], parts[1], parts[2]
                        devices.append(
                            {
                                "index": idx,
                                "name": name,
                                "vram_total_mb": (
                                    int(total_mem) if total_mem.isdigit() else None
                                ),
                                "vram_free_mb": (
                                    int(free_mem) if free_mem.isdigit() else None
                                ),
                            }
                        )
                if devices:
                    return {
                        "available": True,
                        "vendor": "NVIDIA",
                        "name": devices[0]["name"],
                        "vram_total_mb": devices[0]["vram_total_mb"],
                        "vram_free_mb": devices[0].get("vram_free_mb"),
                        "count": len(devices),
                        "devices": devices,
                        "details": f"Detected {len(devices)} NVIDIA GPU(s) via nvidia-smi",
                    }
        except Exception:
            pass

    # 3. Try rocm-smi CLI
    if shutil.which("rocm-smi"):
        try:
            res = subprocess.run(
                ["rocm-smi", "--showname"],
                capture_output=True,
                text=True,
                timeout=3,
            )
            if res.returncode == 0 and res.stdout.strip():
                return {
                    "available": True,
                    "vendor": "AMD",
                    "name": "AMD ROCm GPU",
                    "vram_total_mb": None,
                    "vram_free_mb": None,
                    "count": 1,
                    "devices": [],
                    "details": "Detected AMD GPU via rocm-smi",
                }
        except Exception:
            pass

    # 4. Sane fallback when run in container without GPU or on CPU-only machines
    return {
        "available": False,
        "vendor": None,
        "name": None,
        "vram_total_mb": None,
        "vram_free_mb": None,
        "count": 0,
        "devices": [],
        "details": "no dedicated GPU detected",
    }


def get_hardware_info() -> Dict[str, Any]:
    return {
        "ram": get_ram_info(),
        "cpu": get_cpu_info(),
        "gpu": get_gpu_info(),
    }
