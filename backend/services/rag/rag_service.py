from typing import List, Dict, Any
from .retriever import RAGRetriever

# Lazy initialization to avoid loading models until needed
_retriever = None

def get_retriever():
    global _retriever
    if _retriever is None:
        _retriever = RAGRetriever()
    return _retriever

def query_rag(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Retrieve relevant logistics knowledge for a given query.
    
    Returns a list of dictionaries with keys:
    - text: The retrieved text chunk
    - source: The source filename
    - score: The calculated relevance score (1.0 is highest)
    - metadata: Additional metadata
    """
    retriever = get_retriever()
    return retriever.retrieve(query, top_k=top_k)

def generate_context(query: str, top_k: int = 5) -> str:
    """
    Generate a formatted context string from retrieved documents.
    This context is suitable for passing to an LLM or backend.
    """
    results = query_rag(query, top_k=top_k)
    
    if not results:
        return "No relevant context found."
        
    context_lines = []
    for res in results:
        context_lines.append(f"SOURCE: {res['source']}")
        context_lines.append(f"RELEVANCE: {res['score']}")
        context_lines.append(f"\n{res['text']}\n")
        
    return "\n".join(context_lines)
