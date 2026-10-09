import os
import json
import numpy as np
from fastembed import TextEmbedding

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_DIR = os.path.join(BASE_DIR, 'vector_db')

class RAGRetriever:
    def __init__(self):
        embeddings_path = os.path.join(DB_DIR, 'embeddings.npy')
        metadata_path = os.path.join(DB_DIR, 'metadata.json')
        
        if not os.path.exists(embeddings_path) or not os.path.exists(metadata_path):
            raise RuntimeError(f"Vector DB not found at {DB_DIR}. Please run ingest.py first.")
            
        self.embeddings = np.load(embeddings_path)
        with open(metadata_path, 'r', encoding='utf-8') as f:
            self.metadata = json.load(f)
            
        # fastembed supports all-MiniLM-L6-v2 natively
        self.embedding_model = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")

    def retrieve(self, query: str, top_k: int = 5) -> list:
        # Generate embedding for the query
        query_embedding_gen = self.embedding_model.embed([query])
        query_vector = list(query_embedding_gen)[0]
        
        # Compute cosine similarity
        # Cosine similarity = dot(A, B) / (norm(A) * norm(B))
        # all-MiniLM-L6-v2 embeddings are typically normalized, but let's be safe.
        norms = np.linalg.norm(self.embeddings, axis=1) * np.linalg.norm(query_vector)
        # Avoid division by zero
        norms[norms == 0] = 1e-10 
        
        similarities = np.dot(self.embeddings, query_vector) / norms
        
        # Get top-k indices
        top_k_indices = np.argsort(similarities)[::-1][:top_k]
        
        formatted_results = []
        for idx in top_k_indices:
            score = float(similarities[idx])
            meta = self.metadata[idx]
            
            # Reconstruct metadata dict without the raw text to match previous contract
            clean_meta = {k: v for k, v in meta.items() if k != 'text'}
            
            formatted_results.append({
                "text": meta['text'],
                "source": meta.get("source", "Unknown"),
                "score": round(score, 4),
                "metadata": clean_meta
            })
            
        return formatted_results
