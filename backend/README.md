# Face Recognition Backend

FastAPI Python backend for face recognition processing, embeddings, and API services.

## Setup

```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `GET /`: API welcome and index
- `GET /docs`: Swagger UI documentation
- `GET /api/health`: Health status check
- `POST /api/recognize`: Face recognition endpoint
