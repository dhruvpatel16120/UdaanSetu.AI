# RAG Knowledge Base Guide - UdaanSetu.AI

This guide explains how to manage the Retrieval-Augmented Generation (RAG) system for the career mentor.

## 1. Setup

Ensure all dependencies are installed:

```bash
pip install -r requirements.txt
```

## 2. Building the Index

The `build_knowledge_base.py` script scans the `app/data/` folder for JSON and CSV files and creates a FAISS vector index.

**To build the index:**

```bash
python scripts/build_knowledge_base.py
```

**To build and run a test query:**

```bash
python scripts/build_knowledge_base.py --test --test-query "How to become a web developer?"
```

## 3. Adding New Data

To increase the bot's knowledge:

1.  **JSON**: Add new entries to `app/data/careers.json`, `skills.json`, etc.
2.  **CSV**: Add CSV files. The script is pre-configured to handle `dataset.csv` and `gujarat_job_market.csv`.
3.  **PDF/Text**: You can add text files and update the `load_career_data` method in `scripts/build_knowledge_base.py` to include them.

After adding data, **always re-run the build script** to update the `indexes/` folder.

## 4. How it Works

1.  **rag_engine.py**: Uses `SentenceTransformer` (all-MiniLM-L6-v2) to convert text into 384-dimensional vectors.
2.  **FAISS**: Stores these vectors in a local flat index for lightning-fast similarity searching.
3.  **chat_mentor.py**: When a user asks a question, the engine retrieves the top 3 most relevant "chunks" of data and injects them into the Gemini prompt.
