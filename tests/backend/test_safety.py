import pytest
import mongomock
from unittest.mock import patch
from backend.app import create_app
from backend.services.safety_service import SafetyService
from backend.config.config import Config

@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    return app

@pytest.fixture
def client(app):
    return app.test_client()

@patch('backend.services.safety_service.SafetyService.get_db')
def test_location_missing_coords(mock_get_db, client):
    response = client.post('/api/safety/location', json={"driver_id": "test1"})
    assert response.status_code == 400
    data = response.get_json()
    assert data["success"] is False
    assert data["error"]["code"] == "INVALID_INPUT"

@patch('backend.services.safety_service.SafetyService.get_db')
@patch('backend.services.safety_service.SafetyService.update_location')
@patch('backend.services.safety_service.SafetyService.get_zones')
def test_location_update_success(mock_get_zones, mock_update, mock_get_db, client):
    mock_update.return_value = {"incident_id": "123", "status": "ACTIVE"}
    mock_get_zones.return_value = [{"enabled": True}]
    response = client.post('/api/safety/location', json={"lat": 12.0, "lng": 77.0})
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["incident"]["incident_id"] == "123"
    assert data["zones_active"] is True

@patch('backend.services.safety_service.SafetyService.get_db')
@patch('backend.services.safety_service.SafetyService.update_location')
@patch('backend.services.safety_service.SafetyService.get_zones')
def test_location_no_zones(mock_get_zones, mock_update, mock_get_db, client):
    mock_update.return_value = None
    mock_get_zones.return_value = []
    response = client.post('/api/safety/location', json={"lat": 12.0, "lng": 77.0})
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["zones_active"] is False
    assert data.get("incident") is None
