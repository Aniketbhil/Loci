import glob
import os
import re
import shutil
import subprocess
import sys
from typing import Any, Dict, List, Optional
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


def _read_sysfs_amd_vram() -> Optional[int]:
    """Attempt to read AMD VRAM in MB from Linux /sys/class/drm sysfs entries."""
    try:
        paths = glob.glob("/sys/class/drm/card*/device/mem_info_vram_total")
        for p in paths:
            if os.path.exists(p):
                with open(p, "r") as f:
                    val = f.read().strip()
                    if val.isdigit():
                        bytes_val = int(val)
                        return round(bytes_val / (1024 * 1024))
    except Exception:
        pass
    return None


def _check_linux_lspci() -> Optional[Dict[str, Any]]:
    """Check Linux lspci for AMD / Radeon graphics controllers."""
    lspci_bin = shutil.which("lspci") or "/usr/bin/lspci" or "/sbin/lspci"
    if not os.path.exists(lspci_bin):
        return None

    try:
        res = subprocess.run([lspci_bin], capture_output=True, text=True, timeout=3)
        if res.returncode != 0 or not res.stdout:
            return None

        lines = res.stdout.splitlines()
        for line in lines:
            line_lower = line.lower()
            if any(k in line_lower for k in ["vga", "3d controller", "display controller"]):
                if any(vendor in line_lower for vendor in ["amd", "radeon", "advanced micro devices", "ati"]):
                    parts = line.split(":", 2)
                    raw_name = parts[-1].strip() if len(parts) >= 3 else line
                    cleaned_name = re.sub(r"^VGA compatible controller:\s*", "", raw_name, flags=re.I)
                    cleaned_name = re.sub(r"^3D controller:\s*", "", cleaned_name, flags=re.I)
                    cleaned_name = re.sub(r"^Display controller:\s*", "", cleaned_name, flags=re.I)

                    vram_mb = _read_sysfs_amd_vram()
                    card_name = cleaned_name or "AMD Radeon Graphics"
                    return {
                        "available": True,
                        "vendor": "amd",
                        "name": card_name,
                        "vram_total_mb": vram_mb,
                        "vram_free_mb": None,
                        "count": 1,
                        "devices": [
                            {
                                "index": 0,
                                "name": card_name,
                                "vram_total_mb": vram_mb,
                            }
                        ],
                        "details": f"Detected {card_name} via lspci",
                    }
    except Exception:
        pass
    return None


def _check_windows_wmi() -> Optional[Dict[str, Any]]:
    """Check Windows WMI / PowerShell for GPU devices."""
    if sys.platform != "win32":
        return None

    try:
        ps_cmd = "Get-CimInstance Win32_VideoController | Select-Object Name, AdapterRAM | ConvertTo-Json"
        res = subprocess.run(
            ["powershell", "-Command", ps_cmd],
            capture_output=True,
            text=True,
            timeout=4,
        )
        if res.returncode == 0 and res.stdout.strip():
            import json

            data = json.loads(res.stdout)
            if isinstance(data, dict):
                data = [data]
            for item in data:
                name = item.get("Name", "")
                name_lower = name.lower()
                if any(k in name_lower for k in ["amd", "radeon", "ati"]):
                    adapter_ram = item.get("AdapterRAM")
                    vram_mb = (
                        round(adapter_ram / (1024 * 1024))
                        if isinstance(adapter_ram, int) and adapter_ram > 0
                        else None
                    )
                    return {
                        "available": True,
                        "vendor": "amd",
                        "name": name,
                        "vram_total_mb": vram_mb,
                        "vram_free_mb": None,
                        "count": 1,
                        "devices": [
                            {"index": 0, "name": name, "vram_total_mb": vram_mb}
                        ],
                        "details": f"Detected {name} via Win32_VideoController",
                    }
    except Exception:
        pass
    return None


def _check_macos_profiler() -> Optional[Dict[str, Any]]:
    """Check macOS system_profiler for GPU devices."""
    if sys.platform != "darwin":
        return None

    try:
        res = subprocess.run(
            ["system_profiler", "SPDisplaysDataType"],
            capture_output=True,
            text=True,
            timeout=4,
        )
        if res.returncode == 0 and res.stdout:
            lines = res.stdout.splitlines()
            chipset = None
            vram_mb = None
            for line in lines:
                if "Chipset Model:" in line:
                    chipset = line.split(":", 1)[1].strip()
                if "VRAM" in line and ":" in line:
                    val_str = line.split(":", 1)[1].strip()
                    match = re.search(r"(\d+)\s*(GB|MB)", val_str, re.I)
                    if match:
                        num, unit = int(match.group(1)), match.group(2).upper()
                        vram_mb = num * 1024 if unit == "GB" else num

            if chipset:
                vendor = (
                    "amd"
                    if any(k in chipset.lower() for k in ["amd", "radeon"])
                    else (
                        "apple"
                        if "apple" in chipset.lower()
                        else "nvidia" if "nvidia" in chipset.lower() else "unknown"
                    )
                )
                return {
                    "available": True,
                    "vendor": vendor,
                    "name": chipset,
                    "vram_total_mb": vram_mb,
                    "vram_free_mb": None,
                    "count": 1,
                    "devices": [
                        {"index": 0, "name": chipset, "vram_total_mb": vram_mb}
                    ],
                    "details": f"Detected {chipset} via system_profiler",
                }
    except Exception:
        pass
    return None


def get_gpu_info() -> Dict[str, Any]:
    # 1. Try PyTorch CUDA / ROCm if installed
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
            vendor = "nvidia" if "NVIDIA" in name.upper() else "amd"
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
                        "vendor": "nvidia",
                        "name": devices[0]["name"],
                        "vram_total_mb": devices[0]["vram_total_mb"],
                        "vram_free_mb": devices[0].get("vram_free_mb"),
                        "count": len(devices),
                        "devices": devices,
                        "details": f"Detected {len(devices)} NVIDIA GPU(s) via nvidia-smi",
                    }
        except Exception:
            pass

    # 3. Try rocm-smi CLI for AMD GPUs
    if shutil.which("rocm-smi"):
        try:
            res = subprocess.run(
                ["rocm-smi", "--showid", "--showname"],
                capture_output=True,
                text=True,
                timeout=3,
            )
            if res.returncode == 0 and res.stdout.strip():
                vram_mb = _read_sysfs_amd_vram()
                return {
                    "available": True,
                    "vendor": "amd",
                    "name": "AMD ROCm GPU",
                    "vram_total_mb": vram_mb,
                    "vram_free_mb": None,
                    "count": 1,
                    "devices": [
                        {"index": 0, "name": "AMD ROCm GPU", "vram_total_mb": vram_mb}
                    ],
                    "details": "Detected AMD GPU via rocm-smi",
                }
        except Exception:
            pass

    # 4. Try Linux lspci detection for AMD / Radeon
    lspci_gpu = _check_linux_lspci()
    if lspci_gpu:
        return lspci_gpu

    # 5. Try Windows WMI / PowerShell detection
    win_gpu = _check_windows_wmi()
    if win_gpu:
        return win_gpu

    # 6. Try macOS system_profiler detection
    mac_gpu = _check_macos_profiler()
    if mac_gpu:
        return mac_gpu

    # 7. Sane fallback when run in container without GPU or on CPU-only machines
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
