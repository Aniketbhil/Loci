from typing import Any, Dict, List, Optional
from app.data.model_catalog import MODEL_CATALOG
from app.services.hardware import get_hardware_info


def recommend_models(
    ram_gb: Optional[float] = None,
    vram_gb: Optional[float] = None,
    gpu_available: Optional[bool] = None,
) -> Dict[str, Any]:
    # 1. Fetch system hardware if overrides are not provided
    sys_hw = get_hardware_info()

    effective_ram = ram_gb if ram_gb is not None else sys_hw["ram"]["total_gb"]
    is_gpu = gpu_available if gpu_available is not None else sys_hw["gpu"]["available"]

    effective_vram = 0.0
    if is_gpu:
        if vram_gb is not None:
            effective_vram = vram_gb
        elif sys_hw["gpu"].get("vram_total_mb"):
            effective_vram = round(sys_hw["gpu"]["vram_total_mb"] / 1024.0, 2)

    hw_summary = {
        "total_ram_gb": effective_ram,
        "vram_gb": effective_vram if is_gpu else None,
        "gpu_available": is_gpu,
        "details": f"Evaluating for {effective_ram}GB RAM"
        + (f" and {effective_vram}GB VRAM" if is_gpu else " (CPU/RAM fallback)"),
    }

    tiers = ["Fast & light", "Balanced", "Most capable"]
    tier_recommendations = []

    for tier in tiers:
        models_in_tier = [m for m in MODEL_CATALOG if m["tier"] == tier]

        # Determine which models meet requirements
        valid_models = []
        for m in models_in_tier:
            meets_vram = is_gpu and (effective_vram >= m["min_vram_gb"])
            meets_ram = effective_ram >= m["min_ram_gb"]
            meets_req = meets_vram or meets_ram

            valid_models.append({
                "model": m,
                "meets": meets_req,
            })

        # Selection strategy per tier:
        # Pick the best model in this tier
        fitting_models = [v for v in valid_models if v["meets"]]
        if fitting_models:
            # Pick largest/best model in tier that fits
            selected = max(fitting_models, key=lambda x: x["model"]["param_size_billions"])
        else:
            # Pick smallest model in tier even if requirements aren't fully met
            selected = min(valid_models, key=lambda x: x["model"]["param_size_billions"])

        m = selected["model"]
        meets = selected["meets"]

        if meets:
            if is_gpu and effective_vram >= m["min_vram_gb"]:
                reason = f"Excellent fit for {effective_vram}GB VRAM (Requires {m['min_vram_gb']}GB VRAM)."
            else:
                reason = f"Fits system memory of {effective_ram}GB RAM (Requires {m['min_ram_gb']}GB RAM)."
        else:
            reason = f"Hardware constrained: Requires {m['min_ram_gb']}GB RAM / {m['min_vram_gb']}GB VRAM."

        tier_recommendations.append({
            "tier": tier,
            "tier_label": tier,
            "model": m,
            "meets_hardware_requirements": meets,
            "reason": reason,
        })

    return {
        "hardware_summary": hw_summary,
        "recommendations": tier_recommendations,
    }
