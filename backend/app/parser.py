import fitz  # PyMuPDF
from docx import Document
import io

def parse_pdf(file_bytes):
    text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text

def parse_docx(file_bytes):
    doc = Document(io.BytesIO(file_bytes))
    text = "\n".join([para.text for para in doc.paragraphs])
    return text

def extract_text(file_content, filename):
    ext = filename.split(".")[-1].lower()
    if ext == "pdf":
        return parse_pdf(file_content)
    elif ext == "docx":
        return parse_docx(file_content)
    elif ext == "txt":
        return file_content.decode("utf-8")
    else:
        raise ValueError("Unsupported file format")
