"""
Three-agent academic mentorship workflow using LangGraph (StateGraph) with Gemini via LangChain.

Flow (strictly sequential): Mentor (scope) -> Analyst (quant) -> Coach (resources) -> Mentor (final synthesis)

All LLM calls use ChatGoogleGenerativeAI and rely on GEMINI_API_KEY (passed explicitly).
"""

import os
import argparse
from typing import TypedDict

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END


class GraphState(TypedDict):
    """Centralized state passed between all nodes."""

    user_input: str
    research_scope: str
    analyst_report: str
    resource_map: str
    final_report: str


def build_llm(model_name: str = "gemini-2.0-flash", temperature: float = 0.0) -> ChatGoogleGenerativeAI:
    """Create a ChatGoogleGenerativeAI instance using GEMINI_API_KEY environment variable."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. Please export your Gemini API key before running."
        )
    return ChatGoogleGenerativeAI(model=model_name, temperature=temperature, api_key=api_key)


def node_mentor_scope(state: GraphState) -> dict:
    """Scoping Agent: Refines broad topic into clear research scope.

    Writes: research_scope
    """
    llm = build_llm()
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a helpful learning assistant. Create a SIMPLE, BEGINNER-FRIENDLY learning plan. Use everyday language, not academic jargon.\n\n"
                "Provide:\n"
                "1. **What You'll Learn:** One clear learning goal in simple terms\n"
                "2. **What You'll Do:** 3-4 practical activities you can actually do\n"
                "3. **What You'll Need:** Basic tools and resources (free/cheap options)\n"
                "4. **What You'll Create:** Something concrete you'll build or achieve\n"
                "5. **Why It Matters:** How this helps you in real life\n\n"
                "Write in easy wording and understandable language. No complex academic language!",
            ),
            (
                "human",
                "I want to learn: \"{user_input}\"\n\n"
                "Help me create a simple learning plan:",
            ),
        ]
    )
    chain = prompt | llm
    result = chain.invoke({"user_input": state["user_input"]})
    content = result.content if hasattr(result, "content") else str(result)
    return {"research_scope": content.strip()}


def node_analyst_quant(state: GraphState) -> dict:
    """Analyst Agent: Provides methodology, metrics, and risk assessment.

    Writes: analyst_report
    """
    llm = build_llm()
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a practical learning coach. Give SIMPLE, ACTIONABLE advice. Use everyday language.\n\n"
                "Provide:\n"
                "1. **How to Start:** Simple first steps anyone can do\n"
                "2. **How to Track Progress:** Easy ways to see if you're learning\n"
                "3. **What Success Looks Like:** Clear goals (beginner vs advanced)\n"
                "4. **Common Problems:** What might go wrong and simple fixes\n\n"
                "Write in easy wording and understandable language. No complex academic language!",
            ),
            (
                "human",
                "Learning plan: \"{research_scope}\"\n\n"
                "Give me practical advice on how to succeed:",
            ),
        ]
    )
    chain = prompt | llm
    result = chain.invoke(
        {"research_scope": state.get("research_scope", ""), "user_input": state["user_input"]}
    )
    content = result.content if hasattr(result, "content") else str(result)
    return {"analyst_report": content.strip()}


def node_skill_coach(state: GraphState) -> dict:
    """Resource Mapper Agent: Creates learning resources table.

    Writes: resource_map
    """
    llm = build_llm()
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a helpful learning guide. Give SIMPLE, PRACTICAL resources. Focus on FREE or CHEAP options.\n\n"
                "Provide 5-6 essential things to learn:\n"
                "For each one, give:\n"
                "- What to learn (in simple terms)\n"
                "- Where to learn it (free websites, YouTube, books under $20)\n"
                "- How long it takes (realistic time estimates)\n"
                "- Why it's useful (one simple sentence)\n\n"
                "Write like you're recommending resources to a friend. No expensive courses!",
            ),
            (
                "human",
                "Learning plan: {research_scope}\n\n"
                "What should I learn and where can I find it for free or cheap?",
            ),
        ]
    )
    chain = prompt | llm
    result = chain.invoke(
        {
            "research_scope": state.get("research_scope", ""),
            "analyst_report": state.get("analyst_report", ""),
        }
    )
    content = result.content if hasattr(result, "content") else str(result)
    return {"resource_map": content.strip()}


def node_lead_mentor_synthesis(state: GraphState) -> dict:
    """Planner Agent: Creates project roadmap with timeline.

    Writes: final_report
    """
    llm = build_llm()
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a friendly learning buddy. Create a SIMPLE, REALISTIC timeline. Use everyday language.\n\n"
                "Provide:\n"
                "1. **What Success Looks Like:** 2-3 simple things you'll be able to do\n"
                "2. **First Month:** What to focus on first (start small!)\n"
                "3. **Second Month:** What to add next\n"
                "4. **Third Month:** What to master by the end\n\n"
                "Write like you're planning with a friend. Keep it simple and achievable!",
            ),
            (
                "human",
                "Learning plan: {research_scope}\n"
                "Practical advice: {analyst_report}\n"
                "Resources: {resource_map}\n\n"
                "Create a simple timeline for me:",
            ),
        ]
    )
    chain = prompt | llm
    result = chain.invoke(
        {
            "user_input": state["user_input"],
            "research_scope": state.get("research_scope", ""),
            "analyst_report": state.get("analyst_report", ""),
            "resource_map": state.get("resource_map", ""),
        }
    )
    content = result.content if hasattr(result, "content") else str(result)
    return {"final_report": content.strip()}


def build_graph() -> any:
    """Construct a strict sequential StateGraph with four nodes."""
    graph = StateGraph(GraphState)

    graph.add_node("mentor_scoper", node_mentor_scope)
    graph.add_node("data_analyst", node_analyst_quant)
    graph.add_node("skill_coach", node_skill_coach)
    graph.add_node("lead_mentor", node_lead_mentor_synthesis)

    graph.set_entry_point("mentor_scoper")
    graph.add_edge("mentor_scoper", "data_analyst")
    graph.add_edge("data_analyst", "skill_coach")
    graph.add_edge("skill_coach", "lead_mentor")
    graph.add_edge("lead_mentor", END)

    return graph.compile()


def run_workflow(user_request: str) -> GraphState:
    """Run the full workflow and return final state."""
    app = build_graph()
    initial_state: GraphState = {
        "user_input": user_request,
        "research_scope": "",
        "analyst_report": "",
        "resource_map": "",
        "final_report": "",
    }
    final_state: GraphState = app.invoke(initial_state)  # type: ignore
    return final_state


def _print_state(state: GraphState) -> None:
    print("=== Research Scope ===")
    print(state.get("research_scope", ""))
    print()
    print("=== Analyst Report ===")
    print(state.get("analyst_report", ""))
    print()
    print("=== Resource Map ===")
    print(state.get("resource_map", ""))
    print()
    print("=== Final Report ===")
    print(state.get("final_report", ""))


def main() -> None:
    if not os.getenv("GEMINI_API_KEY"):
        raise RuntimeError(
            "GEMINI_API_KEY is not set. Please export your Gemini API key before running."
        )

    parser = argparse.ArgumentParser(
        description=(
            "Run the Gemini mentorship workflow (Mentor → Analyst → Coach → Mentor) "
            "using LangGraph and Google GenAI."
        )
    )
    parser.add_argument(
        "user_input",
        type=str,
        help="Initial request, e.g., 'Analyze this paper and recommend courses'.",
    )
    parser.add_argument(
        "--model",
        type=str,
        default="gemini-2.0-flash",
        help="Gemini model for all nodes (default: gemini-2.0-flash)",
    )
    args = parser.parse_args()

    # Allow model override via CLI by temporarily monkey-patching build_llm.
    def _build_llm_override(model_name: str = args.model, temperature: float = 0.0) -> ChatGoogleGenerativeAI:  # type: ignore
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not set.")
        return ChatGoogleGenerativeAI(model=model_name, temperature=temperature, api_key=api_key)

    global build_llm  # type: ignore
    build_llm = _build_llm_override  # type: ignore

    state = run_workflow(args.user_input)
    _print_state(state)


if __name__ == "__main__":
    main()


