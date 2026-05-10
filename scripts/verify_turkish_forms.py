import glob
import hashlib
import json
import sys
import unicodedata
from pathlib import Path

import fitz


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "data" / "form-forensics" / "generated"
DESKTOP = Path.home() / "Desktop"

FORMS = [
    {
        "formType": "AM",
        "name": "Ölüm Öncesi Formu",
        "patterns": [
            "DVI-*Ante Mortem*Formu.pdf",
            "DVI-*Ölüm öncesi*Formu.pdf",
            "DVI-*Ölüm öncesi*Formu.pdf",
        ],
        "expectedPages": 18,
        "manifestFile": "am-page-manifest.json",
    },
    {
        "formType": "PM",
        "name": "Ölüm Sonrası Formu",
        "patterns": [
            "DVI-*Post Mortem*Formu.pdf",
            "DVI-*Ölüm Sonrası*Formu.pdf",
            "DVI-*Ölüm Sonrası*Formu.pdf",
        ],
        "expectedPages": 16,
        "manifestFile": "pm-page-manifest.json",
    },
]


def normalized(value: str) -> str:
    return unicodedata.normalize("NFC", value)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def resolve_form(patterns: list[str]) -> Path:
    matches: list[Path] = []
    for pattern in patterns:
        matches.extend(Path(match) for match in glob.glob(str(DESKTOP / pattern)))

    unique = sorted({match.resolve() for match in matches}, key=lambda item: normalized(str(item)))
    if len(unique) != 1:
        printable = [str(item) for item in unique]
        raise FileNotFoundError(
            f"Beklenen tek PDF bulunamadı. Eşleşme sayısı={len(unique)} eşleşmeler={printable}"
        )

    return unique[0]


def widget_count(page: fitz.Page) -> int:
    widgets = page.widgets()
    if widgets is None:
        return 0

    return sum(1 for _ in widgets)


def inspect_form(definition: dict) -> dict:
    path = resolve_form(definition["patterns"])
    document = fitz.open(path)
    pages = []
    total_widgets = 0
    total_text_chars = 0
    inventory_status = (
        "alan envanteri tamamlandı"
        if definition["formType"] in {"AM", "PM"}
        else "sayfa doğrulandı; alan envanteri bekliyor"
    )
    planned_inventory_phase = "Phase 1B" if definition["formType"] == "AM" else "Phase 1C"

    for index, page in enumerate(document):
        text = page.get_text("text") or ""
        text_chars = len(text.strip())
        page_widgets = widget_count(page)
        total_widgets += page_widgets
        total_text_chars += text_chars
        pages.append(
            {
                "formType": definition["formType"],
                "pageNumber": index + 1,
                "width": round(page.rect.width, 2),
                "height": round(page.rect.height, 2),
                "textCharCount": text_chars,
                "widgetCount": page_widgets,
                "inventoryStatus": inventory_status,
                "plannedInventoryPhase": planned_inventory_phase,
            }
        )

    result = {
        "formType": definition["formType"],
        "name": definition["name"],
        "sourcePath": str(path),
        "sourcePathNfc": normalized(str(path)),
        "sha256": sha256_file(path),
        "pageCount": document.page_count,
        "expectedPageCount": definition["expectedPages"],
        "pageCountMatchesExpected": document.page_count == definition["expectedPages"],
        "widgetCount": total_widgets,
        "hasAcroFormWidgets": total_widgets > 0,
        "textCharCount": total_text_chars,
        "hasTextLayer": total_text_chars > 0,
        "metadata": document.metadata,
        "pages": pages,
    }
    document.close()
    return result


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    inspected = [inspect_form(definition) for definition in FORMS]
    failures = []

    for item in inspected:
        if not item["pageCountMatchesExpected"]:
            failures.append(
                f"{item['formType']} sayfa sayısı beklenen değerle eşleşmiyor: "
                f"{item['pageCount']} != {item['expectedPageCount']}"
            )
        if item["widgetCount"] != 0:
            failures.append(f"{item['formType']} AcroForm widget sayısı 0 değil.")
        if item["hasTextLayer"]:
            failures.append(f"{item['formType']} metin katmanı boş değil.")

        manifest_name = next(
            definition["manifestFile"]
            for definition in FORMS
            if definition["formType"] == item["formType"]
        )
        (OUTPUT_DIR / manifest_name).write_text(
            json.dumps(item["pages"], ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    summary = {
        "phase": "Phase 1D",
        "version": "0.1.3",
        "buildId": "phase-1d-v0.1.3-20260510",
        "forms": inspected,
        "failures": failures,
    }

    summary_path = OUTPUT_DIR / "phase-1d-pdf-forensics.json"
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))

    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
