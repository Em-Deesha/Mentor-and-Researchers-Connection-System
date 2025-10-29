# 🔬 Multi-Tool Research Hub

A clean, AI-powered research assistant that helps students analyze papers and get academic guidance using Google Gemini.

## 🌟 Features

### **📄 Paper Analysis**
- Upload PDF, DOCX, or TXT files
- AI summarization and concept extraction
- Resource suggestions and professor recommendations

### **🎓 Academic Mentorship**
- Simple learning plans for any topic
- Step-by-step guidance with timelines
- Free/cheap resource recommendations

## 🚀 Quick Start

### **1. Install Dependencies**
```bash
pip install -r requirements.txt
```

### **2. Set Your Gemini API Key**
```bash
export GEMINI_API_KEY=your_gemini_api_key_here
```

### **3. Run the Application**
```bash
python3 app.py
```

### **4. Open in Browser**
Visit: http://localhost:8080

## 🎯 How to Use

### **Paper Analysis (Default)**
1. Upload a research paper (PDF/DOCX/TXT)
2. Get AI-powered analysis with 4 sections:
   - Paper Summary
   - Key Concepts
   - Related Resources
   - Professor Suggestions

### **Academic Mentorship**
1. Switch to "Academic Mentorship" tab
2. Enter your learning goal (e.g., "I want to learn Python")
3. Choose Gemini model (2.0 Flash, 2.5 Flash, or 2.5 Pro)
4. Get structured learning plan with timeline

## 🛠️ Technical Stack

- **Backend**: Flask + LangGraph + Gemini AI
- **Frontend**: HTML/CSS/JavaScript (Dark Mode)
- **File Processing**: PyPDF2 + python-docx
- **AI**: Google Gemini (2.0 Flash, 2.5 Flash, 2.5 Pro)

## 📁 Project Structure

```
Multi-Tool Research Hub/
├── app.py                          # Flask application
├── gemini_mentorship_workflow.py   # Mentorship workflow
├── gemini_research_hub_workflow.py # Paper analysis workflow
├── requirements.txt                # Dependencies
├── templates/index.html            # Web interface
├── static/
│   ├── style.css                   # Dark mode styling
│   └── script.js                   # Interactive functionality
└── README.md                       # This file
```

## 🔧 Configuration

### **Environment Variables**
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### **Gemini Models**
- **Gemini 2.0 Flash**: Fastest, good for most tasks
- **Gemini 2.5 Flash**: Enhanced reasoning
- **Gemini 2.5 Pro**: Highest quality output

## 🎉 Features

- ✅ **Simple Interface**: Easy to use, no complex setup
- ✅ **Gemini AI**: Powered by Google's latest models
- ✅ **File Upload**: PDF, DOCX, TXT support
- ✅ **Dark Mode**: Professional, modern design
- ✅ **Responsive**: Works on desktop and mobile
- ✅ **Clean Code**: No unused dependencies

## 🚀 Ready to Use!

Your Multi-Tool Research Hub is now clean, simple, and ready to help with academic research and learning!

---

**🔬 Multi-Tool Research Hub** - Clean, simple, and powerful AI research assistance