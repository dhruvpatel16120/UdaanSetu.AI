"""
Knowledge Base Builder for UdaanSetu.AI
Wrapper for the RAGEngine build process.
"""

import os
import sys
import logging
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.services.rag_engine import get_rag_engine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Build UdaanSetu.AI Knowledge Base")
    parser.add_argument(
        '--test',
        action='store_true',
        help='Run test search after building'
    )
    parser.add_argument(
        '--test-query',
        type=str,
        default='What are the best careers in technology?',
        help='Query to use for testing'
    )
    
    args = parser.parse_args()
    
    logger.info("=" * 60)
    logger.info("Starting Knowledge Base Build Process")
    logger.info("=" * 60)
    
    try:
        # Initialize engine (without loading index since we're building it)
        from app.services.rag_engine import RAGEngine
        engine = RAGEngine() 
        
        # Build index (this scans data/ directory)
        result_msg = engine.build_index()
        logger.info(result_msg)
        
        if args.test:
            logger.info(f"\nTesting search with query: '{args.test_query}'")
            results = engine.search(args.test_query, k=3)
            
            if not results:
                logger.warning("No results found in test search.")
            else:
                for i, res in enumerate(results, 1):
                    logger.info(f"\n--- Result {i} (Score: {res['score']:.4f}) ---")
                    logger.info(f"Source: {res['metadata'].get('source')}")
                    logger.info(f"Content: {res['content'][:200]}...")
        
        logger.info("\n✅ Knowledge base build process complete!")
        
    except Exception as e:
        logger.error(f"Error building knowledge base: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
