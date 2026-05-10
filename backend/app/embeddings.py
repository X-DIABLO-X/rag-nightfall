"""
Lightweight retrieval store with a pure-Python BM25-style scorer.
"""

from __future__ import annotations

import json
import math
import os
import re
from collections import Counter

from config import STORAGE_DIR


def _tokenize(text: str) -> list[str]:
    return re.findall(r"\w+", text.lower())


class FAISSStore:
    """
    Drop-in replacement for the previous FAISS vector store.
    Internally uses a pure-Python BM25-style scorer.
    """

    def __init__(self, session_id: str) -> None:
        self.session_id = session_id
        self.session_dir = os.path.join(STORAGE_DIR, session_id)
        self._chunks: list[dict] = []
        self._doc_tokens: list[list[str]] = []
        self._doc_freqs: list[Counter[str]] = []
        self._idf: dict[str, float] = {}
        self._avg_doc_len = 0.0

    def build(self, chunks: list[dict]) -> None:
        self._chunks = [dict(c) for c in chunks]
        self._reindex()

    def save(self) -> None:
        os.makedirs(self.session_dir, exist_ok=True)
        with open(self._chunks_path(), "w", encoding="utf-8") as f:
            json.dump(self._chunks, f, ensure_ascii=False)

    @classmethod
    def load(cls, session_id: str) -> "FAISSStore":
        store = cls(session_id)
        with open(store._chunks_path(), "r", encoding="utf-8") as f:
            store._chunks = json.load(f)
        store._reindex()
        return store

    @classmethod
    def exists(cls, session_id: str) -> bool:
        store = cls(session_id)
        return os.path.isfile(store._chunks_path())

    def delete(self) -> None:
        import shutil
        if os.path.isdir(self.session_dir):
            shutil.rmtree(self.session_dir)

    def search(self, query: str, top_k: int = 5) -> list[tuple[dict, float]]:
        if not self._chunks:
            return []

        query_terms = _tokenize(query)
        if not query_terms:
            return []

        scores: list[tuple[int, float]] = []
        k1 = 1.5
        b = 0.75

        for idx, freq in enumerate(self._doc_freqs):
            doc_len = max(len(self._doc_tokens[idx]), 1)
            score = 0.0
            for term in query_terms:
                term_freq = freq.get(term, 0)
                if term_freq == 0:
                    continue
                idf = self._idf.get(term, 0.0)
                denom = term_freq + k1 * (1 - b + b * doc_len / max(self._avg_doc_len, 1.0))
                score += idf * (term_freq * (k1 + 1)) / denom
            if score > 0:
                scores.append((idx, score))

        if not scores:
            return []

        scores.sort(key=lambda item: item[1], reverse=True)
        top_scores = scores[:top_k]
        max_score = top_scores[0][1]

        return [
            (self._chunks[idx], score / max_score)
            for idx, score in top_scores
        ]

    def _reindex(self) -> None:
        self._doc_tokens = [_tokenize(chunk["text"]) for chunk in self._chunks]
        self._doc_freqs = [Counter(tokens) for tokens in self._doc_tokens]

        total_len = sum(len(tokens) for tokens in self._doc_tokens)
        self._avg_doc_len = total_len / len(self._doc_tokens) if self._doc_tokens else 0.0

        document_count = len(self._doc_tokens)
        term_document_counts: Counter[str] = Counter()
        for tokens in self._doc_tokens:
            term_document_counts.update(set(tokens))

        self._idf = {
            term: math.log(1 + (document_count - count + 0.5) / (count + 0.5))
            for term, count in term_document_counts.items()
        }

    def _chunks_path(self) -> str:
        return os.path.join(self.session_dir, "chunks.json")
