# 🧠 Gemini Mentorship Workflow Overview

## 🔄 **Sequential Agent Workflow**

The Gemini mentorship workflow uses a **4-agent sequential pipeline** powered by Google's Gemini models:

```
User Input → Agent 1 → Agent 2 → Agent 3 → Agent 4 → Final Results
```

## 🤖 **Agent Architecture**

### **Agent 1: Scoping Agent (Mentor)**
- **Role**: Research scope definition
- **Input**: User's academic request
- **Output**: Clear research scope with:
  - Research question
  - 3-4 objectives
  - Scope boundaries
  - Expected results
  - Importance explanation

### **Agent 2: Analyst Agent**
- **Role**: Methodology and risk assessment
- **Input**: Research scope from Agent 1
- **Output**: Analysis report with:
  - Research methods
  - Key metrics with targets
  - Baseline vs stretch goals
  - Risk assessment and solutions

### **Agent 3: Resource Mapper (Coach)**
- **Role**: Learning resource planning
- **Input**: Research scope + Analysis report
- **Output**: Resource map with:
  - 6-8 essential skills
  - Specific courses/books
  - Skill levels (Beginner/Intermediate/Advanced)
  - Why each skill matters

### **Agent 4: Planner Agent (Lead Mentor)**
- **Role**: Project timeline and success criteria
- **Input**: All previous outputs
- **Output**: Final report with:
  - Success criteria
  - 30-day goals
  - 60-day goals
  - 90-day goals

## 🔧 **Technical Implementation**

### **LangGraph State Management**
```python
class GraphState(TypedDict):
    user_input: str
    research_scope: str
    analyst_report: str
    resource_map: str
    final_report: str
```

### **Gemini Model Configuration**
```python
def build_llm(model_name: str = "gemini-2.0-flash", temperature: float = 0.0):
    return ChatGoogleGenerativeAI(
        model=model_name, 
        temperature=temperature,
        google_api_key=os.getenv("GEMINI_API_KEY")
    )
```

### **Workflow Graph Structure**
```python
graph = StateGraph(GraphState)
graph.add_node("mentor_scoper", node_mentor_scope)
graph.add_node("data_analyst", node_analyst_quant)
graph.add_node("skill_coach", node_skill_coach)
graph.add_node("lead_mentor", node_lead_mentor_synthesis)

# Sequential flow
graph.set_entry_point("mentor_scoper")
graph.add_edge("mentor_scoper", "data_analyst")
graph.add_edge("data_analyst", "skill_coach")
graph.add_edge("skill_coach", "lead_mentor")
graph.add_edge("lead_mentor", END)
```

## 🎯 **Available Gemini Models**

1. **Gemini 2.0 Flash** (Default)
   - Fastest response time
   - Good for most academic tasks
   - Cost-effective

2. **Gemini 2.5 Flash**
   - Enhanced reasoning
   - Better for complex analysis
   - Balanced performance

3. **Gemini 2.5 Pro**
   - Highest quality output
   - Best for detailed research planning
   - Most comprehensive analysis

## 📊 **Workflow Benefits**

### **Sequential Processing**
- Each agent builds on previous outputs
- Context is maintained throughout
- No information loss between steps

### **Specialized Expertise**
- Each agent has specific expertise
- Focused prompts for each task
- Optimized for academic guidance

### **Comprehensive Output**
- Research scope and objectives
- Methodology and metrics
- Learning resources and skills
- Timeline and success criteria

## 🚀 **Usage Examples**

### **Input**: "I want to research machine learning in healthcare"
### **Output**:
1. **Research Scope**: Focused question about ML applications in medical diagnosis
2. **Analyst Report**: Methodology using deep learning, metrics for accuracy
3. **Resource Map**: Skills in Python, TensorFlow, medical imaging, statistics
4. **Final Report**: 30/60/90-day goals for learning and research

## 🔄 **API Integration**

### **Endpoint**: `/api/run-gemini-mentorship`
### **Method**: POST
### **Parameters**:
- `user_input`: Academic request
- `model`: Gemini model selection

### **Response**:
```json
{
  "research_scope": "...",
  "analyst_report": "...",
  "resource_map": "...",
  "final_report": "...",
  "model_used": "gemini-2.0-flash"
}
```

## 🎨 **User Interface**

The mentorship workflow is accessible through:
- **Tab**: "Academic Mentorship"
- **Input**: Text area for academic requests
- **Model Selection**: Dropdown for Gemini models
- **Output**: 4 collapsible result cards

## ⚡ **Performance**

- **Response Time**: 30-60 seconds
- **Model**: Gemini 2.0 Flash (default)
- **API**: Google Generative AI
- **Processing**: Sequential agent execution

## 🔧 **Configuration**

### **Environment Variables**
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### **Model Selection**
Users can choose from:
- `gemini-2.0-flash` (default)
- `gemini-2.5-flash`
- `gemini-2.5-pro`

## 🎯 **Best Practices**

1. **Clear Input**: Provide specific academic goals
2. **Model Selection**: Use Flash for speed, Pro for quality
3. **Iterative Use**: Refine requests based on outputs
4. **Resource Follow-up**: Use suggested resources actively

---

**🧠 Gemini Mentorship Workflow** - AI-powered academic guidance through specialized agent collaboration
