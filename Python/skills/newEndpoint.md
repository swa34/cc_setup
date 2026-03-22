---
name: new-endpoint
description: Scaffold a new FastAPI endpoint with tests
---

Create a new FastAPI router for the given resource:

1. Create src/my_app/routes/{name}.py with CRUD endpoints
2. Create tests/test*routes/test*{name}.py with tests
3. Create src/my_app/models/{name}.py with Pydantic schemas
4. Register the router in src/my_app/main.py
5. Run: uv run pytest tests/test*routes/test*{name}.py
