from flask import request
from backend.services.rag.rag_service import query_rag, generate_context
from backend.utils.response import success_response, error_response

def handle_rag_explanation():
    try:
        data = request.get_json(silent=True)
        if data is None:
            return error_response('INVALID_INPUT', 'Malformed or missing JSON payload.', status_code=400)
        
        if not isinstance(data, dict):
            return error_response('INVALID_INPUT', 'JSON payload must be an object.', status_code=400)

        origin = data.get('origin', '')
        destination = data.get('destination', '')
        transport_mode = data.get('transport_mode', '')
        risk_level = data.get('risk_level', '')
        question = data.get('question', '')
        
        if not isinstance(question, str):
            return error_response('INVALID_INPUT', 'Question must be a string.', status_code=400)
            
        if len(question) > 500:
            return error_response('INVALID_INPUT', 'Question must not exceed 500 characters.', status_code=400)
        
        # Construct a relevant retrieval query
        if question and question.strip():
            query = question.strip()
        else:
            query_parts = []
            if origin and destination:
                query_parts.append(f"Shipment from {origin} to {destination}.")
            if transport_mode:
                query_parts.append(f"Transport mode: {transport_mode}.")
            if risk_level:
                query_parts.append(f"Risk level: {risk_level}.")
            query = " ".join(query_parts)
            if not query.strip():
                query = "General supply chain disruption risks and mitigation."
                
        # Retrieve passages
        results = query_rag(query, top_k=5)
        
        # Relevance filtering: 
        # Irrelevant questions score below 0.10. Relevant typically score 0.20+
        RELEVANCE_THRESHOLD = 0.15
        filtered_results = [r for r in results if r['score'] >= RELEVANCE_THRESHOLD]
        
        relevant_evidence_found = len(filtered_results) > 0
        
        # Format response
        if relevant_evidence_found:
            explanation = "No LLM provider configured. Raw retrieved evidence shown below."
        else:
            explanation = "No relevant evidence was found for this query in the knowledge base."
            
        context_lines = []
        for res in filtered_results:
            context_lines.append(f"SOURCE: {res['source']}")
            context_lines.append(f"RELEVANCE: {res['score']}")
            context_lines.append(f"\n{res['text']}\n")
        formatted_ctx = "\n".join(context_lines) if relevant_evidence_found else "No relevant context found."

        rag_data = {
            "explanation": explanation,
            "is_llm_generated": False,
            "relevant_evidence_found": relevant_evidence_found,
            "retrieved_passages": filtered_results,
            "formatted_context": formatted_ctx
        }
        
        return success_response(data=rag_data)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return error_response('RAG_ERROR', str(e), status_code=500)
