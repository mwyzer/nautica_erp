import json
import logging
import math
import os
from pathlib import Path
from typing import Dict, Any, List, Optional

from app.config import settings

logger = logging.getLogger(__name__)

KB_DIR = Path(__file__).parent.parent / "rag" / "knowledge_base"
CACHE_FILE = Path(__file__).parent.parent / "rag" / "vector_cache.json"


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Calculates cosine similarity between two vector embeddings."""
    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_v1 = math.sqrt(sum(a * a for a in v1))
    norm_v2 = math.sqrt(sum(b * b for b in v2))
    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0
    return dot_product / (norm_v1 * norm_v2)


class MaritimeRAGService:
    """Maritime Regulatory RAG Engine grounded in SOLAS, MARPOL, STCW, and ISM Code."""

    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY") or settings.GEMINI_API_KEY
        self.client = None
        self.chunks: List[Dict[str, Any]] = []
        self._init_client()
        self.initialize_knowledge_base()

    def _init_client(self):
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize GenAI client for RAG: {e}")

    def _parse_and_chunk_documents(self) -> List[Dict[str, Any]]:
        """Parses markdown knowledge base files into section-based chunks."""
        chunks = []
        if not KB_DIR.exists():
            logger.warning(f"Knowledge base directory {KB_DIR} not found.")
            return chunks

        for file_path in KB_DIR.glob("*.md"):
            try:
                content = file_path.read_text(encoding="utf-8")
                doc_title = file_path.stem.replace("_", " ").upper()
                
                # Split by markdown section headers
                sections = content.split("\n## ")
                for i, sec in enumerate(sections):
                    clean_sec = sec.strip()
                    if not clean_sec:
                        continue
                    
                    lines = clean_sec.split("\n")
                    sec_title = lines[0].replace("#", "").strip()
                    sec_body = "\n".join(lines[1:]).strip()

                    chunks.append({
                        "chunk_id": f"{file_path.stem}_{i}",
                        "source": file_path.name,
                        "document": doc_title,
                        "section": sec_title,
                        "text": f"Document: {doc_title}\nSection: {sec_title}\n\n{sec_body}",
                        "summary": f"{doc_title} — {sec_title}",
                    })
            except Exception as e:
                logger.error(f"Error parsing {file_path}: {e}")
        return chunks

    def _embed_text(self, text: str) -> Optional[List[float]]:
        """Generates embedding for a single text using Gemini."""
        if not self.client:
            self._init_client()
        if not self.client:
            return None

        try:
            res = self.client.models.embed_content(
                model="gemini-embedding-001",
                contents=text
            )
            if res and res.embeddings and len(res.embeddings) > 0:
                return res.embeddings[0].values
        except Exception as e:
            logger.warning(f"Embedding error: {e}")
        return None

    def initialize_knowledge_base(self):
        """Loads cached embeddings or generates new vectors for all chunks."""
        raw_chunks = self._parse_and_chunk_documents()
        cached_data = {}
        if CACHE_FILE.exists():
            try:
                with open(CACHE_FILE, "r", encoding="utf-8") as f:
                    cached_data = json.load(f)
            except Exception as e:
                logger.warning(f"Failed reading vector cache: {e}")

        updated_cache = {}
        processed_chunks = []
        for chk in raw_chunks:
            cid = chk["chunk_id"]
            if cid in cached_data and "embedding" in cached_data[cid]:
                chk["embedding"] = cached_data[cid]["embedding"]
            else:
                emb = self._embed_text(chk["text"])
                if emb:
                    chk["embedding"] = emb
                    updated_cache[cid] = {"embedding": emb, "summary": chk["summary"]}

            processed_chunks.append(chk)

        # Save any new embeddings to disk cache
        if updated_cache:
            cached_data.update(updated_cache)
            try:
                CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
                with open(CACHE_FILE, "w", encoding="utf-8") as f:
                    json.dump(cached_data, f)
                logger.info(f"Saved {len(updated_cache)} embeddings to {CACHE_FILE}")
            except Exception as e:
                logger.warning(f"Failed writing vector cache: {e}")

        self.chunks = processed_chunks
        logger.info(f"Maritime RAG initialized with {len(self.chunks)} regulatory chunks.")

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Vector semantic search over maritime regulatory documents."""
        query_emb = self._embed_text(query)

        scored_chunks = []
        if query_emb:
            for chk in self.chunks:
                emb = chk.get("embedding")
                if emb:
                    sim = cosine_similarity(query_emb, emb)
                    scored_chunks.append({**chk, "similarity_score": round(sim, 4)})
        else:
            # Fallback keyword relevance if embedding unavailable
            q_terms = [t for t in query.lower().split() if len(t) > 3]
            for chk in self.chunks:
                text_lower = chk["text"].lower()
                matches = sum(1 for t in q_terms if t in text_lower)
                score = matches / max(1, len(q_terms))
                scored_chunks.append({**chk, "similarity_score": round(score, 4)})

        scored_chunks.sort(key=lambda x: x.get("similarity_score", 0.0), reverse=True)
        return scored_chunks[:top_k]

    async def answer_query(self, query: str, top_k: int = 3) -> Dict[str, Any]:
        """Executes full Retrieval-Augmented Generation on the query."""
        results = self.search(query, top_k=top_k)
        if not results:
            return {
                "query": query,
                "answer": "Tidak ditemukan dokumen regulasi maritim yang sesuai dalam basis pengetahuan.",
                "citations": [],
                "sources": [],
                "is_rag_grounded": False
            }

        context_str = "\n\n---\n\n".join(
            [f"[Sumber: {r['document']} - {r['section']}]\n{r['text']}" for r in results]
        )

        system_instruction = (
            "Anda adalah Captain Gemini, Chief Marine Superintendent dan Ahli Hukum Regulasi Maritim Internasional. "
            "Jawab pertanyaan pengguna secara akurat, profesional, dan berwibawa berdasarkan Dokumen Konvensi Maritim yang dilampirkan. "
            "Sebutkan nomor aturan/bab spesifik (seperti SOLAS Ch. II-1/Reg. 29, MARPOL Annex VI Reg. 14, STCW Sec. A-VIII/1) "
            "sebagai rujukan resmi hukum maritim."
        )

        prompt = f"""
Pertanyaan Superintendent:
{query}

DOKUMEN RESMI REGULASI MARITIM (KNOWLEDGE BASE):
{context_str}

Instruksi:
Jawab pertanyaan di atas secara rinci dan langsung mengutip pasal/ketentuan regulasi maritim yang berlaku dari teks di atas.
"""
        from app.services.agent_service import nautical_agent
        reply = await nautical_agent._call_gemini(prompt, system_instruction, timeout=7.0)
        
        citations = [f"{r['document']} ({r['section']})" for r in results]
        sources = [
            {
                "document": r["document"],
                "section": r["section"],
                "source_file": r["source"],
                "similarity": r.get("similarity_score", 0.0),
                "excerpt": r["text"][:250] + "..."
            }
            for r in results
        ]

        if not reply:
            # Deterministic fallback summary from retrieved chunks
            reply = f"Berdasarkan {citations[0]}:\n" + results[0]["text"][:400] + "..."

        return {
            "query": query,
            "answer": reply,
            "citations": citations,
            "sources": sources,
            "is_rag_grounded": True
        }


# Singleton instance
maritime_rag = MaritimeRAGService()
