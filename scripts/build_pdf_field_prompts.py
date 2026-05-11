import argparse
import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "pdf-field-prompts" / "pdf-field-prompts.json"
REPORT = ROOT / "docs" / "app" / "phase-5a-fix6-pdf-prompts.md"

FORMS = {
    "AM": {
        "file": "Ante Mortem (yellow) INTERPOL DVI form (2018, fillable) - Missing person.pdf",
        "env": "DVI_AM_PDF",
        "expectedFields": 1687,
        "expectedWidgets": 2006,
    },
    "PM": {
        "file": "Post Mortem (pink) INTERPOL DVI form (2018, fillable) - Unidentified human remains.pdf",
        "env": "DVI_PM_PDF",
        "expectedFields": 1693,
        "expectedWidgets": 2026,
    },
}

CONTACT_SUFFIX_LABELS = {
    "301": ("Street / No.", "Cadde, sokak ve kapı numarası"),
    "302": ("Street / No. detail", "Cadde, sokak ve kapı numarası devamı"),
    "303": ("Postcode / Town", "Posta kodu, il veya ilçe"),
    "304": ("Postcode / Town detail", "Posta kodu, il veya ilçe devamı"),
    "305": ("State / Country", "Eyalet, bölge veya ülke"),
    "306": ("State / Country detail", "Eyalet, bölge veya ülke devamı"),
    "307": ("Phone", "Telefon numarası"),
    "308": ("Email", "E-posta adresi"),
}

ALPHA_OPTION_LABELS = {
    "A": ("Data not available", "Veri mevcut değil seçeneği"),
    "B": ("Attachment", "Ek belge var seçeneği"),
    "C": ("Further info on supplementary page", "Ek bilgi sayfasında devam seçeneği"),
}

PHRASE_TRANSLATIONS = {
    "Responsible agency": "Sorumlu kurum veya birim",
    "INTERPOL NCB:": "INTERPOL ulusal merkez bürosu",
    "Police file No:": "Polis dosya numarası",
    "Information given by": "Bilgiyi veren kişi",
    "Point of contact": "İrtibat kurulacak kişi",
    "Name": "Ad soyad",
    "Relationship": "Yakınlık ilişkisi",
    "Partner": "Eş veya partner",
    "Date:": "Tarih",
    "Date": "Tarih",
    "No": "Hayır seçeneği",
    "Yes": "Evet seçeneği",
    "Where:": "Nerede",
    "Where": "Nerede",
    "Specify:": "Açıklama",
    "Specify": "Açıklama",
    "Family name:": "Soyadı",
    "First name(s):": "Adı veya adları",
    "Date of birth:": "Doğum tarihi",
    "Age": "Yaş",
    "Male": "Erkek seçeneği",
    "Female": "Kadın seçeneği",
    "Other": "Diğer seçeneği",
    "Unknown": "Bilinmiyor seçeneği",
    "Place of disaster:": "Afet yeri",
    "Nature of disaster:": "Afetin niteliği",
    "Date of disaster:": "Afet tarihi",
    "Body part": "Vücut bölümü",
    "Photographs taken": "Fotoğraf çekildi",
    "Exhibits": "Bulgular veya emanetler",
    "Prints taken from": "İz alınan bölüm",
    "External examination": "Dış muayene",
    "Partial autopsy": "Kısmi otopsi",
    "Full autopsy": "Tam otopsi",
    "Pathologist name": "Patolog adı",
    "Dental examination": "Dental inceleme",
    "Odontologist name": "Odontolog adı",
    "Samples taken": "Örnek alındı",
    "Images": "Görüntüler",
    "Images (specify):": "Görüntüler, açıklama",
    "Not Possible": "Mümkün değil seçeneği",
    "Not available": "Mevcut değil seçeneği",
    "Enclosed complete": "Eksiksiz eklendi seçeneği",
    "Remarks": "Açıklamalar",
    "Street / No.": "Cadde, sokak ve kapı numarası",
    "Postcode / Town": "Posta kodu, il veya ilçe",
    "State / Country": "Eyalet, bölge veya ülke",
    "Phone / Email": "Telefon veya e-posta",
    "Phone": "Telefon numarası",
    "Email": "E-posta adresi",
}


def import_fitz():
    try:
        import fitz
    except ImportError as exc:
        raise SystemExit("PyMuPDF bulunamadı.") from exc
    return fitz


def resolve_pdf(definition):
    candidates = []
    if os.environ.get(definition["env"]):
        candidates.append(Path(os.environ[definition["env"]]))
    candidates.extend([Path.home() / "Desktop" / definition["file"], ROOT / "pdf-sources" / definition["file"]])
    for candidate in candidates:
        if candidate.exists():
            return candidate
    raise FileNotFoundError(definition["file"])


def clean_text(value):
    return " ".join(str(value or "").replace("•", " ").split()).strip()


def line_items(words):
    lines = []
    for word in words:
        x0, y0, x1, y1, text, *_ = word
        text = clean_text(text)
        if not text:
            continue
        center = (y0 + y1) / 2
        target = None
        for line in lines:
            if abs(line["center"] - center) <= 2.8:
                target = line
                break
        if target is None:
            target = {"center": center, "words": []}
            lines.append(target)
        target["words"].append((x0, y0, x1, y1, text))

    output = []
    for line in lines:
        words_sorted = sorted(line["words"], key=lambda item: item[0])
        output.append(
            {
                "text": clean_text(" ".join(item[4] for item in words_sorted)),
                "x0": min(item[0] for item in words_sorted),
                "y0": min(item[1] for item in words_sorted),
                "x1": max(item[2] for item in words_sorted),
                "y1": max(item[3] for item in words_sorted),
                "center": line["center"],
            }
        )
    return output


def words_phrase(words):
    return clean_text(" ".join(item[4] for item in sorted(words, key=lambda word: word[0])))


def side_phrase(words, rect, side):
    center = (rect.y0 + rect.y1) / 2
    candidates = []
    for x0, y0, x1, y1, text, *_ in words:
        text = clean_text(text)
        if not text:
            continue
        word_center = (y0 + y1) / 2
        if abs(word_center - center) > 6.2:
            continue
        if side == "left" and x1 <= rect.x0 + 1 and x1 >= rect.x0 - 240:
            candidates.append((x0, y0, x1, y1, text))
        if side == "right" and x0 >= rect.x1 - 1 and x0 <= rect.x1 + 260:
            candidates.append((x0, y0, x1, y1, text))
    return words_phrase(candidates)


def above_phrase(lines, rect):
    candidates = []
    for line in lines:
        horizontal_overlap = line["x1"] >= rect.x0 - 12 and line["x0"] <= rect.x1 + 80
        vertical_distance = rect.y0 - line["y1"]
        if horizontal_overlap and 0 <= vertical_distance <= 36:
            candidates.append((vertical_distance, abs(line["x0"] - rect.x0), line["text"]))
    if not candidates:
        return ""
    candidates.sort(key=lambda item: (item[0], item[1]))
    return clean_text(candidates[0][2])


def contact_suffix_prompt(field_name, left_text):
    suffix = field_name.split(".")[-1]
    if suffix not in CONTACT_SUFFIX_LABELS:
        return None
    normalized = left_text.lower()
    contact_markers = ["street", "postcode", "state", "country", "phone", "email"]
    if any(marker in normalized for marker in contact_markers):
        return CONTACT_SUFFIX_LABELS[suffix]
    return None


def alpha_option_prompt(field_name):
    match = re.search(r"\.([ABC])$", field_name)
    if not match:
        return None
    return ALPHA_OPTION_LABELS.get(match.group(1))


def translate_prompt(prompt):
    prompt = clean_text(prompt)
    if not prompt:
        return ""
    if prompt in PHRASE_TRANSLATIONS:
        return PHRASE_TRANSLATIONS[prompt]
    stripped = prompt.rstrip(":")
    if stripped in PHRASE_TRANSLATIONS:
        return PHRASE_TRANSLATIONS[stripped]
    return ""


def prompt_for_widget(widget, words, lines):
    field_name = widget.field_name or ""
    rect = widget.rect
    left = side_phrase(words, rect, "left")
    right = side_phrase(words, rect, "right")
    above = above_phrase(lines, rect)

    contact = contact_suffix_prompt(field_name, " ".join([left, above]))
    if contact:
        return contact[0], contact[1], "contact-suffix"

    alpha = alpha_option_prompt(field_name)
    if alpha:
        return alpha[0], alpha[1], "abc-option"

    if widget.field_type_string == "CheckBox" and right:
        translated = translate_prompt(right)
        return right, translated, "checkbox-right"

    for source, kind in [(left, "left"), (above, "above"), (right, "right")]:
        translated = translate_prompt(source)
        if translated:
            return source, translated, kind

    return "", "", "unresolved"


def build_prompts():
    fitz = import_fitz()
    result = {
        "phase": "Phase 5A-Fix6",
        "version": "0.5.6",
        "buildId": "phase-5a-fix6-v0.5.6-20260512",
        "forms": [],
        "fields": {},
    }

    for form_type, definition in FORMS.items():
        doc = fitz.open(resolve_pdf(definition))
        field_prompts = {}
        widget_count = 0
        prompt_count = 0
        for page_index, page in enumerate(doc):
            words = page.get_text("words") or []
            lines = line_items(words)
            for widget_index, widget in enumerate(page.widgets() or []):
                widget_count += 1
                prompt_en, prompt_tr, source = prompt_for_widget(widget, words, lines)
                key = f"{form_type}:{widget.field_name}"
                current = field_prompts.get(key)
                if current and current.get("promptTr"):
                    continue
                if prompt_tr:
                    prompt_count += 1
                field_prompts[key] = {
                    "formType": form_type,
                    "fieldName": widget.field_name,
                    "pageNumber": page_index + 1,
                    "pageWidgetIndex": widget_index,
                    "promptEn": prompt_en,
                    "promptTr": prompt_tr,
                    "source": source,
                }

        result["fields"].update(field_prompts)
        result["forms"].append(
            {
                "formType": form_type,
                "fieldCount": len(field_prompts),
                "widgetCount": widget_count,
                "promptCount": sum(1 for item in field_prompts.values() if item.get("promptTr")),
                "expectedFields": definition["expectedFields"],
                "expectedWidgets": definition["expectedWidgets"],
            }
        )

    return result


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def report_markdown(data):
    rows = "\n".join(
        f"| {item['formType']} | {item['fieldCount']} | {item['widgetCount']} | {item['promptCount']} |"
        for item in data["forms"]
    )
    return f"""# Phase 5A-Fix6 PDF Alan Prompt Denetimi

Bu rapor, fillable AM/PM PDF'lerdeki widget konumları ile görünür PDF metni yeniden okunarak üretilen alan promptlarını özetler.

| Form | Unique alan | PDF widget | PDF'den net prompt |
| --- | ---: | ---: | ---: |
{rows}
"""


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    data = build_prompts()

    failures = []
    for form in data["forms"]:
        if form["fieldCount"] != form["expectedFields"]:
            failures.append(f"{form['formType']} fieldCount beklenen değerle uyuşmuyor")
        if form["widgetCount"] != form["expectedWidgets"]:
            failures.append(f"{form['formType']} widgetCount beklenen değerle uyuşmuyor")

    if args.write:
        write_json(OUTPUT, data)
        REPORT.parent.mkdir(parents=True, exist_ok=True)
        REPORT.write_text(report_markdown(data), encoding="utf-8")
    else:
        if not OUTPUT.exists():
            failures.append("PDF prompt çıktısı yok")
        else:
            current = json.loads(OUTPUT.read_text(encoding="utf-8"))
            if current != data:
                failures.append("PDF prompt çıktısı güncel değil")

    if failures:
        raise SystemExit("\n".join(failures))

    total_prompts = sum(item["promptCount"] for item in data["forms"])
    print(f"PDF alan prompt doğrulaması geçti. prompt={total_prompts}")


if __name__ == "__main__":
    main()
