import pytest
from unittest.mock import patch
from backend.app import create_app
from backend.services.rag.retriever import RAGRetriever

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_relevant_questions(client):
    queries = [
        "What weather-related disruptions could affect this shipment?",
        "What alternative transport options are available when roads are disrupted?",
        "How can trade sanctions and regional conflicts affect shipping routes?",
        "Why is carrier reliability important for on-time delivery?",
        "How can supply-chain resilience reduce disruption impacts?"
    ]
    for q in queries:
        resp = client.post('/api/rag/explain', json={'question': q})
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['success'] is True
        assert data['is_llm_generated'] is False
        assert data['relevant_evidence_found'] is True
        assert len(data['retrieved_passages']) > 0

def test_dynamic_contextual_question(client):
    dynamic_q = "What are the anticipated supply chain disruptions and historical risks for road transport experiencing heavy rain weather with a high risk level? What are common mitigation or rerouting strategies?"
    resp = client.post('/api/rag/explain', json={'question': dynamic_q})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['success'] is True
    assert data['relevant_evidence_found'] is True
    # Should fetch weather risks
    assert any("weather" in p['source'].lower() for p in data['retrieved_passages'])
    # Should fetch mitigation/rerouting
    assert any("rerouting" in p['source'].lower() or "resilience" in p['source'].lower() for p in data['retrieved_passages'])

def test_unrelated_question(client):
    resp = client.post('/api/rag/explain', json={'question': 'What is the best programming language for developing a mobile game?'})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['success'] is True
    assert data['relevant_evidence_found'] is False
    assert len(data['retrieved_passages']) == 0

def test_input_validation(client):
    # Missing question fallback
    resp = client.post('/api/rag/explain', json={'origin': 'A', 'destination': 'B'})
    assert resp.status_code == 200
    
    # Empty string question falls back to context
    resp = client.post('/api/rag/explain', json={'origin': 'A', 'destination': 'B', 'question': '   '})
    assert resp.status_code == 200
    
    # Malformed JSON
    resp = client.post('/api/rag/explain', data='{bad json', content_type='application/json')
    assert resp.status_code == 400
    assert resp.get_json()['error']['code'] == 'INVALID_INPUT'
    
    # Unsupported input types
    resp = client.post('/api/rag/explain', json=['not a dict'])
    assert resp.status_code == 400
    
    # Bad question type
    resp = client.post('/api/rag/explain', json={'question': 123})
    assert resp.status_code == 400
    
    # Exactly 500 question (accepted)
    # Even if it contains garbage 'a', it should return 200 (though likely 0 passages retrieved)
    q_500 = 'a' * 500
    resp = client.post('/api/rag/explain', json={'question': q_500})
    assert resp.status_code == 200
    assert resp.get_json()['success'] is True
    
    # Very long question (501)
    long_q = 'a' * 501
    resp = client.post('/api/rag/explain', json={'question': long_q})
    assert resp.status_code == 400
    err_json = resp.get_json()
    assert err_json['success'] is False
    assert err_json['error']['code'] == 'INVALID_INPUT'
    assert err_json['error']['message'] == 'Question must not exceed 500 characters.'

@patch('backend.services.rag.rag_service.get_retriever')
def test_infrastructure_failure(mock_get_retriever, client):
    mock_get_retriever.side_effect = Exception("Vector DB not found")
    resp = client.post('/api/rag/explain', json={'question': 'test'})
    assert resp.status_code == 500
    data = resp.get_json()
    assert data['success'] is False
    assert data['error']['code'] == 'RAG_ERROR'
    assert 'Vector DB not found' in data['error']['message']

def test_api_contract(client):
    resp = client.post('/api/rag/explain', json={'question': 'disruptions'})
    data = resp.get_json()
    assert 'success' in data
    assert 'message' in data
    assert 'explanation' in data
    assert 'formatted_context' in data
    assert 'is_llm_generated' in data
    assert 'retrieved_passages' in data
    assert 'relevant_evidence_found' in data
