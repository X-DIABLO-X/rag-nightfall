"""
Extract text from a PDF file page-by-page using pypdf.

Returns a list of dicts: [{"page_num": int, "text": str}, ...]
Only pages with meaningful text content are included.
"""

import os

from pypdf import PdfReader


def extract_pages(pdf_path: str, file_name: str | None = None) -> list[dict]:
    """
    Open the PDF at pdf_path and extract text for each page.

    Returns:
        List of {"page_num": int (1-based), "text": str} for non-empty pages.

    Raises:
        ValueError: if the PDF has no extractable text (e.g. scanned image PDF).
    """
    reader = PdfReader(pdf_path)
    pages: list[dict] = []
    resolved_file_name = file_name or os.path.basename(pdf_path)

    for page_index, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        text = _clean(text)
        if text:
            pages.append(
                {
                    "file_name": resolved_file_name,
                    "page_num": page_index,
                    "text": text,
                }
            )

    if not pages:
        raise ValueError(
            "No readable text found. The PDF may be a scanned image. "
            "Please use a text-based PDF."
        )

    return pages


def _clean(text: str) -> str:
    """Collapse excessive whitespace while preserving paragraph breaks."""
    import re

    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()
