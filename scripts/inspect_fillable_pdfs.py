import argparse
import hashlib
import json
import os
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "data" / "acroform-forensics" / "generated"
SUMMARY_PATH = OUTPUT_DIR / "phase-1a-pdf-forensics.json"
AM_MANIFEST_PATH = OUTPUT_DIR / "am-widget-manifest.json"
PM_MANIFEST_PATH = OUTPUT_DIR / "pm-widget-manifest.json"

FORMS = {
    "AM": {
        "name": "Ölüm Öncesi Formu",
        "sourceFileName": "Ante Mortem (yellow) INTERPOL DVI form (2018, fillable) - Missing person.pdf",
        "env": "DVI_AM_PDF",
        "expected": {
            "pageCount": 18,
            "widgetCount": 2006,
            "uniqueFieldNameCount": 1687,
            "hasTextLayer": True,
            "hasWidgets": True,
        },
        "manifestPath": AM_MANIFEST_PATH,
    },
    "PM": {
        "name": "Ölüm Sonrası Formu",
        "sourceFileName": "Post Mortem (pink) INTERPOL DVI form (2018, fillable) - Unidentified human remains.pdf",
        "env": "DVI_PM_PDF",
        "expected": {
            "pageCount": 19,
            "widgetCount": 2026,
            "uniqueFieldNameCount": 1693,
            "hasTextLayer": True,
            "hasWidgets": True,
        },
        "manifestPath": PM_MANIFEST_PATH,
    },
}


def import_fitz():
    try:
        import fitz
    except ImportError as exc:
        raise SystemExit("PyMuPDF bulunamadı. Yerelde bundled Python runtime veya PyMuPDF kurulu Python kullanılmalı.") from exc

    return fitz


def file_hash(path):
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def resolve_source(definition):
    env_value = os.environ.get(definition["env"])
    candidates = []
    if env_value:
        candidates.append(Path(env_value))

    candidates.extend(
        [
            Path.home() / "Desktop" / definition["sourceFileName"],
            ROOT / "pdf-sources" / definition["sourceFileName"],
            ROOT / "fixtures" / definition["sourceFileName"],
        ]
    )

    for candidate in candidates:
        if candidate.exists():
            return candidate

    raise FileNotFoundError(f"Kaynak PDF bulunamadı: {definition['sourceFileName']}")


def rect_to_list(rect):
    return [round(rect.x0, 3), round(rect.y0, 3), round(rect.x1, 3), round(rect.y1, 3)]


def clean_text(value):
    return " ".join(value.split())


def nearby_labels(words, rect):
    labels = []
    for x0, y0, x1, y1, text, *_ in words:
        text = clean_text(text)
        if not text:
            continue

        same_band = y0 <= rect.y1 + 6 and y1 >= rect.y0 - 6
        left_side = x1 <= rect.x0 and x1 >= rect.x0 - 190
        above = y1 <= rect.y0 and y1 >= rect.y0 - 42 and x1 >= rect.x0 - 24 and x0 <= rect.x1 + 160

        if same_band and left_side:
            labels.append({"text": text, "where": "left", "distance": round(rect.x0 - x1, 3)})
        elif above:
            labels.append({"text": text, "where": "above", "distance": round(rect.y0 - y1, 3)})

    labels.sort(key=lambda item: (item["where"] != "left", item["distance"], item["text"]))
    compact = []
    seen = set()
    for item in labels:
        key = (item["text"], item["where"])
        if key in seen:
            continue
        seen.add(key)
        compact.append(item)
        if len(compact) == 8:
            break
    return compact


def widget_button_states(widget):
    if not hasattr(widget, "button_states"):
        return None

    states = widget.button_states()
    if states is None:
        return None

    return states


def inspect_form(form_type, definition):
    fitz = import_fitz()
    source_path = resolve_source(definition)
    document = fitz.open(source_path)

    widgets = []
    text_char_count = 0
    page_widget_counts = []
    field_names = []
    widget_type_counts = Counter()

    for page_index, page in enumerate(document):
        page_text = page.get_text("text") or ""
        text_char_count += len(page_text)
        words = page.get_text("words") or []
        page_widgets = list(page.widgets() or [])
        page_widget_counts.append({"pageNumber": page_index + 1, "widgetCount": len(page_widgets)})

        for widget_index, widget in enumerate(page_widgets):
            field_name = widget.field_name or ""
            field_names.append(field_name)
            widget_type = widget.field_type_string or str(widget.field_type)
            widget_type_counts[widget_type] += 1
            widgets.append(
                {
                    "formType": form_type,
                    "pageNumber": page_index + 1,
                    "pageWidgetIndex": widget_index,
                    "fieldName": field_name,
                    "fieldType": widget_type,
                    "fieldTypeCode": widget.field_type,
                    "rect": rect_to_list(widget.rect),
                    "fieldFlags": widget.field_flags,
                    "fieldValue": widget.field_value,
                    "buttonStates": widget_button_states(widget),
                    "nearbyLabelCandidates": nearby_labels(words, widget.rect),
                }
            )

    duplicate_groups = []
    for field_name, count in sorted(Counter(field_names).items()):
        if field_name and count > 1:
            duplicate_groups.append({"fieldName": field_name, "count": count})

    duplicate_lookup = {item["fieldName"]: item["count"] for item in duplicate_groups}
    for widget in widgets:
        duplicate_count = duplicate_lookup.get(widget["fieldName"], 1)
        widget["duplicateGroup"] = {
            "isDuplicate": duplicate_count > 1,
            "instanceCount": duplicate_count,
        }

    summary = {
        "formType": form_type,
        "formName": definition["name"],
        "sourceFileName": definition["sourceFileName"],
        "sha256": file_hash(source_path),
        "pageCount": len(document),
        "textCharCount": text_char_count,
        "hasTextLayer": text_char_count > 0,
        "widgetCount": len(widgets),
        "hasWidgets": len(widgets) > 0,
        "uniqueFieldNameCount": len(set(field_names)),
        "duplicateFieldNameCount": len(duplicate_groups),
        "widgetTypeCounts": dict(sorted(widget_type_counts.items())),
        "pageWidgetCounts": page_widget_counts,
        "duplicateFieldGroups": duplicate_groups,
    }

    return summary, widgets


def validate_summary(summary, expected):
    failures = []
    for key, value in expected.items():
        if summary.get(key) != value:
            failures.append(f"{summary['formType']} {key}: beklenen={value}, mevcut={summary.get(key)}")

    if summary["textCharCount"] <= 0:
        failures.append(f"{summary['formType']} textCharCount sıfırdan büyük olmalı")

    return failures


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def inspect_all():
    generated = {
        "phase": "Phase 1A",
        "version": "0.1.5",
        "buildId": "phase-1a-v0.1.5-20260510",
        "sourceStrategy": "fillable INTERPOL AcroForm PDF",
        "forms": [],
    }
    all_failures = []

    for form_type, definition in FORMS.items():
        summary, widgets = inspect_form(form_type, definition)
        all_failures.extend(validate_summary(summary, definition["expected"]))
        generated["forms"].append(summary)
        write_json(definition["manifestPath"], widgets)

    write_json(SUMMARY_PATH, generated)

    if all_failures:
        raise SystemExit("\n".join(all_failures))

    print("Fillable PDF forensics üretildi.")


def verify_generated():
    failures = []
    if not SUMMARY_PATH.exists():
        raise SystemExit(f"Forensics özeti bulunamadı: {SUMMARY_PATH}")

    summary = json.loads(SUMMARY_PATH.read_text(encoding="utf-8"))
    forms_by_type = {item["formType"]: item for item in summary.get("forms", [])}

    for form_type, definition in FORMS.items():
        form_summary = forms_by_type.get(form_type)
        if form_summary is None:
            failures.append(f"{form_type} özeti eksik")
            continue

        failures.extend(validate_summary(form_summary, definition["expected"]))

        manifest_path = definition["manifestPath"]
        if not manifest_path.exists():
            failures.append(f"{form_type} widget manifest eksik: {manifest_path}")
            continue

        widgets = json.loads(manifest_path.read_text(encoding="utf-8"))
        if len(widgets) != definition["expected"]["widgetCount"]:
            failures.append(f"{form_type} manifest widget sayısı hatalı: {len(widgets)}")

        required_widget_keys = {
            "formType",
            "pageNumber",
            "pageWidgetIndex",
            "fieldName",
            "fieldType",
            "rect",
            "buttonStates",
            "nearbyLabelCandidates",
            "duplicateGroup",
        }
        for index, widget in enumerate(widgets[:25]):
            missing = required_widget_keys.difference(widget)
            if missing:
                failures.append(f"{form_type} widget[{index}] eksik alanlar: {', '.join(sorted(missing))}")

    if failures:
        raise SystemExit("\n".join(failures))

    print("Fillable PDF forensics doğrulaması geçti.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--verify-generated", action="store_true")
    args = parser.parse_args()

    if args.verify_generated:
        verify_generated()
    else:
        inspect_all()


if __name__ == "__main__":
    main()
