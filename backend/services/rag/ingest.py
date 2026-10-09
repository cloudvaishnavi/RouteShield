import os
import json
import uuid
import numpy as np
from typing import List
from fastembed import TextEmbedding

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS_DIR = os.path.join(BASE_DIR, 'documents')
DB_DIR = os.path.join(BASE_DIR, 'vector_db')

def extract_text(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()
    text = ""
    if ext in ['.txt', '.md', '.csv']:
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
    elif ext == '.pdf':
        try:
            import pypdf
            with open(file_path, 'rb') as f:
                reader = pypdf.PdfReader(f)
                text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
        except ImportError:
            print("pypdf not installed, cannot read pdf")
    return text

import re

def chunk_text(text: str, max_chunk_size: int = 600, overlap_size: int = 150) -> List[str]:
    # Split text into paragraphs first
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    
    chunks = []
    current_chunk = ""
    
    for p in paragraphs:
        # If adding the paragraph exceeds max size, and we already have content, save the chunk
        if len(current_chunk) + len(p) > max_chunk_size and current_chunk:
            chunks.append(current_chunk.strip())
            # For overlap, keep the last sentence(s) of the previous chunk
            sentences = re.split(r'(?<=[.!?]) +', current_chunk)
            current_chunk = ""
            if sentences and overlap_size > 0:
                # keep adding sentences from the end until overlap_size is reached
                overlap_text = ""
                for s in reversed(sentences):
                    if len(overlap_text) + len(s) < overlap_size:
                        overlap_text = s + " " + overlap_text
                    else:
                        break
                current_chunk = overlap_text.strip() + " " if overlap_text else ""
                
        # If a single paragraph is larger than max_chunk_size, split by sentences
        if len(p) > max_chunk_size:
            sentences = re.split(r'(?<=[.!?]) +', p)
            for s in sentences:
                if len(current_chunk) + len(s) > max_chunk_size and current_chunk:
                    chunks.append(current_chunk.strip())
                    current_chunk = s + " "
                else:
                    current_chunk += s + " "
        else:
            current_chunk += p + "\n\n"
            
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
        
    return chunks

def ingest_documents():
    if not os.path.exists(DB_DIR):
        os.makedirs(DB_DIR)
        
    print("Loading embedding model (fastembed: sentence-transformers/all-MiniLM-L6-v2)...")
    # fastembed supports all-MiniLM-L6-v2 natively
    embedding_model = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    docs_to_add = []
    metadatas_to_add = []
    
    if not os.path.exists(DOCS_DIR):
        print(f"Directory {DOCS_DIR} does not exist.")
        return

    for filename in os.listdir(DOCS_DIR):
        file_path = os.path.join(DOCS_DIR, filename)
        if not os.path.isfile(file_path):
            continue
            
        print(f"Processing {filename}...")
        text = extract_text(file_path)
        if not text.strip():
            continue
            
        chunks = chunk_text(text)
        for i, chunk in enumerate(chunks):
            docs_to_add.append(chunk)
            metadatas_to_add.append({
                "id": f"{filename}_chunk_{i}_{uuid.uuid4().hex[:6]}",
                "source": filename,
                "chunk_index": i,
                "text": chunk
            })
            
    if docs_to_add:
        print(f"Generating embeddings for {len(docs_to_add)} chunks...")
        # fastembed returns an iterable of numpy arrays
        embeddings_gen = embedding_model.embed(docs_to_add)
        embeddings_list = list(embeddings_gen)
        
        # Convert to a single numpy array
        embeddings_matrix = np.vstack(embeddings_list)
        
        # Save embeddings
        np.save(os.path.join(DB_DIR, 'embeddings.npy'), embeddings_matrix)
        
        # Save metadata
        with open(os.path.join(DB_DIR, 'metadata.json'), 'w', encoding='utf-8') as f:
            json.dump(metadatas_to_add, f, indent=2)
            
        print(f"Ingestion complete! Saved {len(docs_to_add)} chunks.")
    else:
        print("No documents found to ingest.")

if __name__ == "__main__":
    ingest_documents()
