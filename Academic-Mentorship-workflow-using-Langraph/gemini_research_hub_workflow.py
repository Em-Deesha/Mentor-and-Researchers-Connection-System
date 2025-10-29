"""
Multi-Tool Research Hub workflow using LangGraph with Google Gemini.
Features: Paper summarization, concept extraction, resource suggestions, and professor matching.
"""

import os
import argparse
from typing import TypedDict
from PyPDF2 import PdfReader
from docx import Document

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END


class ResearchHubState(TypedDict):
    """State for the research hub workflow."""
    
    paper_text: str
    paper_title: str
    summary: str
    key_concepts: str
    related_resources: str
    professor_suggestions: str


def build_llm(model_name: str = "gemini-2.0-flash", temperature: float = 0.0) -> ChatGoogleGenerativeAI:
    """Create a ChatGoogleGenerativeAI instance."""
    return ChatGoogleGenerativeAI(
        model=model_name, 
        temperature=temperature,
        google_api_key=os.getenv("GEMINI_API_KEY")
    )


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file."""
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise Exception(f"Error reading PDF: {str(e)}")


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file."""
    try:
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        raise Exception(f"Error reading DOCX: {str(e)}")


def node_paper_summarizer(state: ResearchHubState) -> dict:
    """Summarize the uploaded paper."""
    llm = build_llm()
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You are an expert academic paper summarizer. Create a comprehensive yet concise summary of the research paper.\n\n"
            "Provide:\n"
            "1. **Paper Overview:** Brief description of what the paper is about\n"
            "2. **Main Research Question:** The primary question being investigated\n"
            "3. **Key Findings:** 3-4 most important results or conclusions\n"
            "4. **Methodology:** How the research was conducted (brief)\n"
            "5. **Significance:** Why this research matters\n\n"
            "Keep the summary clear, academic, and accessible to students."
        ),
        (
            "human",
            "Please summarize this research paper:\n\n{paper_text}"
        )
    ])
    
    chain = prompt | llm
    result = chain.invoke({"paper_text": state["paper_text"]})
    content = result.content if hasattr(result, "content") else str(result)
    return {"summary": content.strip()}


def node_concept_extractor(state: ResearchHubState) -> dict:
    """Extract key concepts and terminology from the paper."""
    llm = build_llm()
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You are an expert at extracting key concepts from academic papers. Identify and explain the most important concepts, terms, and ideas.\n\n"
            "Provide:\n"
            "1. **Core Concepts:** 5-7 main concepts with brief definitions\n"
            "2. **Technical Terms:** Important terminology students should know\n"
            "3. **Research Methods:** Key methodologies used\n"
            "4. **Theoretical Framework:** Main theories or frameworks referenced\n"
            "5. **Domain Knowledge:** Essential background knowledge needed\n\n"
            "Format as a clear, organized list with explanations."
        ),
        (
            "human",
            "Extract key concepts from this paper:\n\n{paper_text}"
        )
    ])
    
    chain = prompt | llm
    result = chain.invoke({"paper_text": state["paper_text"]})
    content = result.content if hasattr(result, "content") else str(result)
    return {"key_concepts": content.strip()}


def node_resource_suggester(state: ResearchHubState) -> dict:
    """Suggest related learning resources based on the paper."""
    llm = build_llm()
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You are an expert academic advisor. Based on the paper content, suggest comprehensive learning resources.\n\n"
            "Provide:\n"
            "1. **Essential Textbooks:** 3-4 key textbooks for background knowledge\n"
            "2. **Online Courses:** 2-3 relevant online courses or MOOCs\n"
            "3. **Research Papers:** 3-4 seminal papers students should read\n"
            "4. **Tools & Software:** Important tools or software mentioned\n"
            "5. **Datasets:** Relevant datasets for practice\n"
            "6. **Conferences:** Key conferences in this field\n\n"
            "Format as an organized list with brief descriptions of why each resource is valuable."
        ),
        (
            "human",
            "Based on this research paper, suggest learning resources:\n\n"
            "Paper: {paper_text}\n"
            "Key Concepts: {key_concepts}"
        )
    ])
    
    chain = prompt | llm
    result = chain.invoke({
        "paper_text": state["paper_text"],
        "key_concepts": state.get("key_concepts", "")
    })
    content = result.content if hasattr(result, "content") else str(result)
    return {"related_resources": content.strip()}


def node_professor_matcher(state: ResearchHubState) -> dict:
    """Suggest professors and researchers in the paper's domain."""
    llm = build_llm()
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You are an expert at connecting students with relevant academic mentors. Based on the paper's domain, suggest professors and researchers.\n\n"
            "Provide:\n"
            "1. **Domain Experts:** 3-4 well-known researchers in this field\n"
            "2. **Institution Suggestions:** Universities with strong programs in this area\n"
            "3. **Research Groups:** Active research groups or labs\n"
            "4. **Collaboration Opportunities:** How students might connect with these experts\n"
            "5. **Academic Networks:** Professional organizations or societies\n\n"
            "Include brief descriptions of why each suggestion is relevant and how students might benefit from connecting with them."
        ),
        (
            "human",
            "Based on this research paper, suggest relevant professors and academic connections:\n\n"
            "Paper: {paper_text}\n"
            "Key Concepts: {key_concepts}\n"
            "Summary: {summary}"
        )
    ])
    
    chain = prompt | llm
    result = chain.invoke({
        "paper_text": state["paper_text"],
        "key_concepts": state.get("key_concepts", ""),
        "summary": state.get("summary", "")
    })
    content = result.content if hasattr(result, "content") else str(result)
    return {"professor_suggestions": content.strip()}


def build_research_hub_graph() -> any:
    """Construct the research hub workflow graph."""
    graph = StateGraph(ResearchHubState)
    
    # Add nodes
    graph.add_node("paper_summarizer", node_paper_summarizer)
    graph.add_node("concept_extractor", node_concept_extractor)
    graph.add_node("resource_suggester", node_resource_suggester)
    graph.add_node("professor_matcher", node_professor_matcher)
    
    # Set up the workflow
    graph.set_entry_point("paper_summarizer")
    graph.add_edge("paper_summarizer", "concept_extractor")
    graph.add_edge("concept_extractor", "resource_suggester")
    graph.add_edge("resource_suggester", "professor_matcher")
    graph.add_edge("professor_matcher", END)
    
    return graph.compile()


def run_research_hub_workflow(paper_text: str, paper_title: str = "Uploaded Paper") -> ResearchHubState:
    """Run the complete research hub workflow."""
    app = build_research_hub_graph()
    initial_state: ResearchHubState = {
        "paper_text": paper_text,
        "paper_title": paper_title,
        "summary": "",
        "key_concepts": "",
        "related_resources": "",
        "professor_suggestions": ""
    }
    final_state: ResearchHubState = app.invoke(initial_state)
    return final_state


def process_uploaded_file(file_path: str, filename: str) -> str:
    """Process uploaded file and extract text."""
    file_extension = filename.lower().split('.')[-1]
    
    if file_extension == 'pdf':
        return extract_text_from_pdf(file_path)
    elif file_extension in ['docx', 'doc']:
        return extract_text_from_docx(file_path)
    else:
        raise Exception(f"Unsupported file type: {file_extension}")


def main():
    """Main function for testing the workflow."""
    if not os.getenv("GEMINI_API_KEY"):
        raise RuntimeError("GEMINI_API_KEY is not set. Please configure your Gemini API key.")
    
    parser = argparse.ArgumentParser(description="Run the research hub workflow")
    parser.add_argument("paper_text", type=str, help="Text content of the research paper")
    parser.add_argument("--model", type=str, default="gemini-2.0-flash", help="Gemini model to use")
    args = parser.parse_args()
    
    # Override the model if specified
    def _build_llm_override(model_name: str = args.model, temperature: float = 0.0) -> ChatGoogleGenerativeAI:
        return ChatGoogleGenerativeAI(model=model_name, temperature=temperature)
    
    global build_llm
    build_llm = _build_llm_override
    
    state = run_research_hub_workflow(args.paper_text)
    
    print("=== Paper Summary ===")
    print(state.get("summary", ""))
    print("\n=== Key Concepts ===")
    print(state.get("key_concepts", ""))
    print("\n=== Related Resources ===")
    print(state.get("related_resources", ""))
    print("\n=== Professor Suggestions ===")
    print(state.get("professor_suggestions", ""))


if __name__ == "__main__":
    main()
