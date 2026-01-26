try:
    import prisma
    with open("prisma_check_success.txt", "w") as f:
        f.write("Imported prisma successfully")
except ImportError:
    with open("prisma_check_error.txt", "w") as f:
        f.write("ImportError: prisma not found")
except Exception as e:
    with open("prisma_check_error.txt", "w") as f:
        f.write(f"Error: {e}")
