from langchain_community.document_loaders import WebBaseLoader

def test_loader():
    url = "https://dhruvpatelofficial.vercel.app/"
    print(f"Testing WebBaseLoader with {url}...")
    try:
        loader = WebBaseLoader(url)
        docs = loader.load()
        print(f"✅ Success! Content length: {len(docs[0].page_content)}")
        print(f"Snippet: {docs[0].page_content[:100].strip()}...")
    except Exception as e:
        print(f"❌ Failed: {e}")

if __name__ == "__main__":
    test_loader()
