from typing import List, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.rag_service import maritime_rag

router = APIRouter(prefix="/rag", tags=["Maritime Regulation RAG"])


class RAGQueryRequest(BaseModel):
    query: str
    top_k: int = 3


class RAGSource(BaseModel):
    document: str
    section: str
    source_file: str
    similarity: float
    excerpt: str


class RAGQueryResponse(BaseModel):
    query: str
    answer: str
    citations: List[str]
    sources: List[RAGSource]
    is_rag_grounded: bool


@router.post("/query", response_model=RAGQueryResponse)
async def query_maritime_rag(payload: RAGQueryRequest):
    """
    Executes Semantic RAG search and AI synthesis over SOLAS, MARPOL, STCW, and ISM regulations.
    """
    result = await maritime_rag.answer_query(payload.query, top_k=payload.top_k)
    return RAGQueryResponse(
        query=result["query"],
        answer=result["answer"],
        citations=result["citations"],
        sources=result["sources"],
        is_rag_grounded=result["is_rag_grounded"],
    )


@router.get("/documents")
async def list_rag_documents():
    """
    Returns list of all indexed maritime convention documents in the RAG knowledge base.
    """
    return {
        "total_chunks": len(maritime_rag.chunks),
        "indexed_documents": [
            {
                "id": c["chunk_id"],
                "document": c["document"],
                "section": c["section"],
                "source": c["source"]
            }
            for c in maritime_rag.chunks
        ]
    }
