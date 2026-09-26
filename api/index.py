"""Entrada de Vercel: expone la app FastAPI de backend/ como función Python.

vercel.json reescribe /api/* hacia aquí; FastAPI recibe la ruta original.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app  # noqa: E402,F401
