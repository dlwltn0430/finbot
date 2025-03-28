#!/bin/bash

alembic upgrade head
poetry run uvicorn app.main:app \
  --port 8088 --host 0.0.0.0
