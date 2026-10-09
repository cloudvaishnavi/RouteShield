import os
import sys

# Ensure src module is in path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from backend.services.rag.rag_service import query_rag, generate_context

def test_queries():
    queries = [
        "How can severe weather affect shipment delays?",
        "What are common risks associated with high geopolitical risk?",
        "What are common strategies for rerouting disrupted shipments?"
    ]
    
    for query in queries:
        print("========================================")
        print("QUERY")
        print("========================================")
        print(f"{query}\n")
        
        results = query_rag(query, top_k=2)
        print("Retrieved Documents:\n")
        for i, res in enumerate(results, 1):
            print(f"{i}. Source: {res['source']}")
            print(f"   Score: {res['score']}")
            print(f"   Text: {res['text'].strip()}\n")
            
        print("========================================")
        print("GENERATED CONTEXT")
        print("========================================")
        context = generate_context(query, top_k=2)
        print(f"{context}\n\n")

if __name__ == "__main__":
    test_queries()
