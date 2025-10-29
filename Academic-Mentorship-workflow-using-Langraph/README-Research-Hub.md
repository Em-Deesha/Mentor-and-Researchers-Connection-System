# 🔬 Multi-Tool Research Hub

A sophisticated AI-powered research paper analysis system that automatically processes uploaded papers and provides comprehensive insights including summarization, concept extraction, resource suggestions, and professor recommendations.

## 🌟 Features

### **Paper Analysis Workflow:**

1. **📄 Paper Summarizer** - Creates comprehensive summaries of research papers
2. **🧠 Concept Extractor** - Identifies and explains key concepts and terminology
3. **📚 Resource Suggester** - Recommends learning materials and related resources
4. **👨‍🏫 Professor Matcher** - Suggests relevant academic mentors and researchers

### **Supported File Formats:**

* **PDF** - Research papers and documents
* **DOCX/DOC** - Word documents
* **TXT** - Plain text files

### **Dual Interface:**

* **Research Hub** - Paper analysis and AI insights
* **Academic Mentorship** - Original mentorship workflow

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/Em-Deesha/Academic-Mentorship-workflow-using-Langraph.git
cd Academic-Mentorship-workflow-using-Langraph

# Set up your API keys in .env file
echo "OPENAI_API_KEY=your_openai_key_here" > .env
echo "GEMINI_API_KEY=your_gemini_key_here" >> .env

# Run with Docker
./run-docker.sh
```

### Option 2: Local Python

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY=your_key_here
export GEMINI_API_KEY=your_key_here

# Run application
python3 app.py
```

## 🌐 Access Application

* **URL**: http://localhost:8080
* **Features**: Paper analysis + Academic mentorship
* **UI**: Professional dark mode with responsive design

## 📋 What You Get

### **Paper Analysis Results:**

#### **1. Paper Summary:**
* Clear overview of the research
* Main research question and findings
* Methodology and significance
* Key conclusions

#### **2. Key Concepts:**
* Core concepts with definitions
* Technical terminology
* Research methods used
* Theoretical frameworks
* Essential background knowledge

#### **3. Related Resources:**
* Essential textbooks
* Online courses and MOOCs
* Seminal research papers
* Tools and software
* Relevant datasets
* Key conferences

#### **4. Professor Suggestions:**
* Domain experts in the field
* Institution recommendations
* Research groups and labs
* Collaboration opportunities
* Academic networks

## 🎯 How to Use

### **Paper Analysis:**

1. **Upload Paper** - Select a PDF, DOCX, or TXT file
2. **AI Processing** - System automatically extracts text and analyzes content
3. **Get Insights** - Receive comprehensive analysis with 4 key sections
4. **Explore Resources** - Access suggested learning materials and mentors

### **Academic Mentorship:**

1. **Switch to Mentorship** - Use the toggle to access mentorship features
2. **Enter Request** - Describe your academic goals
3. **Get Guidance** - Receive structured research planning and resources

## 🛠️ Technical Stack

### **Backend:**
* **LangGraph** - Agent orchestration framework
* **LangChain** - LLM integration and tools
* **Flask** - Web framework
* **PyPDF2** - PDF text extraction
* **python-docx** - Word document processing

### **Frontend:**
* **HTML5/CSS3** - Modern web standards
* **JavaScript** - Interactive functionality
* **Responsive Design** - Mobile-first approach
* **Dark Mode** - Professional UI theme

### **AI Models:**
* **OpenAI** - GPT-4o-mini, GPT-4
* **Google Gemini** - Gemini 2.0 Flash

## 📁 Project Structure

```
Multi-Tool Research Hub/
├── app.py                          # Flask web application
├── research_hub_workflow.py         # Paper analysis workflow
├── mentorship_workflow.py          # Original mentorship workflow
├── gemini_mentorship_workflow.py   # Gemini mentorship workflow
├── requirements.txt                # Python dependencies
├── templates/
│   └── index.html                  # Main web interface
├── static/
│   ├── style.css                   # Dark mode styling
│   └── script.js                   # Interactive functionality
└── README-Research-Hub.md          # This file
```

## 🔧 Configuration

### **Environment Variables:**

```bash
# Required API Keys
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Optional Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

### **API Key Setup:**

1. **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/)
2. **Gemini**: Get your API key from [Google AI Studio](https://makersuite.google.com/)

## 🎉 Features Showcase

### **Paper Analysis:**
* ✅ **Automatic Text Extraction** - PDF, DOCX, TXT support
* ✅ **AI-Powered Summarization** - Clear, academic summaries
* ✅ **Concept Extraction** - Key terms and definitions
* ✅ **Resource Recommendations** - Learning materials and courses
* ✅ **Professor Matching** - Academic mentor suggestions

### **Professional UI:**
* ✅ **Dark Mode Theme** - Modern, sophisticated design
* ✅ **Responsive Layout** - Works on all devices
* ✅ **Interactive Cards** - Collapsible sections
* ✅ **Smooth Animations** - Fade-in and slide-up effects
* ✅ **File Upload** - Drag-and-drop interface

### **Production Ready:**
* ✅ **Docker Support** - Cross-platform compatibility
* ✅ **Security Best Practices** - File validation and cleanup
* ✅ **Error Handling** - Comprehensive error management
* ✅ **Logging** - Persistent log files

## 🔍 Troubleshooting

### **Common Issues:**

1. **API Key Problems:**
   ```bash
   # Check if keys are set
   cat .env
   # Test API keys
   python3 -c "import os; print('OpenAI:', bool(os.getenv('OPENAI_API_KEY')))"
   ```

2. **File Upload Issues:**
   - Ensure file is under 16MB
   - Check file format (PDF, DOCX, DOC, TXT)
   - Verify file contains readable text

3. **Docker Issues:**
   ```bash
   # Check Docker status
   docker --version
   docker-compose --version
   # Fix permissions (Linux)
   sudo usermod -aG docker $USER
   ```

## 📊 Performance

### **Response Times:**
* **Paper Analysis**: ~30-60 seconds
* **File Processing**: ~2-5 seconds
* **Text Extraction**: ~1-3 seconds

### **Resource Usage:**
* **Memory**: ~200-400MB
* **CPU**: Low usage during processing
* **Storage**: ~100MB for application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

* **LangGraph** - For the powerful agent orchestration framework
* **LangChain** - For seamless LLM integration
* **OpenAI** - For providing advanced language models
* **Google** - For the Gemini AI model
* **Flask** - For the lightweight web framework

---

**Built with ❤️ using LangGraph, LangChain, and modern web technologies**

🔬 **Multi-Tool Research Hub** - Transforming academic research with AI
