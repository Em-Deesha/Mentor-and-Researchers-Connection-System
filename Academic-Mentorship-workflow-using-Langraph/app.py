"""
Flask web application for the Multi-Tool Research Hub.
Provides a web interface for paper analysis with AI-powered insights.
"""

import os
import json
import tempfile
from flask import Flask, render_template, request, jsonify
from werkzeug.exceptions import BadRequest
from werkzeug.utils import secure_filename

# Import our workflow modules
from gemini_mentorship_workflow import run_workflow as run_gemini_workflow
from gemini_research_hub_workflow import run_research_hub_workflow, process_uploaded_file

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Serve the main page."""
    return render_template('index.html')

@app.route('/api/run-gemini-mentorship', methods=['POST'])
def run_gemini_mentorship():
    """Run the Gemini mentorship workflow via API."""
    try:
        # Get form data
        user_input = request.form.get('user_input', '').strip()
        
        if not user_input:
            return jsonify({'error': 'User input is required'}), 400
        
        # Check if Gemini API key is available
        if not os.getenv('GEMINI_API_KEY'):
            return jsonify({'error': 'GEMINI_API_KEY is not set. Please configure your Gemini API key.'}), 400
        
        # Run the Gemini mentorship workflow
        result = run_gemini_workflow(user_input)
        
        # Return the result
        return jsonify({
            'research_scope': result.get('research_scope', ''),
            'analyst_report': result.get('analyst_report', ''),
            'resource_map': result.get('resource_map', ''),
            'final_report': result.get('final_report', ''),
            'model_used': 'gemini-2.5-pro'
        })
        
    except Exception as e:
        app.logger.error(f"Gemini mentorship workflow error: {str(e)}")
        return jsonify({'error': f'Workflow execution failed: {str(e)}'}), 500


@app.route('/api/analyze-paper', methods=['POST'])
def analyze_paper():
    """Analyze uploaded research paper."""
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload PDF, DOCX, or TXT files.'}), 400
        
        # Check if Gemini API key is available
        if not os.getenv('GEMINI_API_KEY'):
            return jsonify({'error': 'GEMINI_API_KEY is not set. Please configure your Gemini API key.'}), 400
        
        # Save uploaded file temporarily
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        try:
            # Extract text from the file
            paper_text = process_uploaded_file(file_path, filename)
            
            if not paper_text.strip():
                return jsonify({'error': 'Could not extract text from the file. Please ensure the file contains readable text.'}), 400
            
            # Run the research hub workflow
            result = run_research_hub_workflow(paper_text, filename)
            
            # Clean up temporary file
            os.remove(file_path)
            
            # Return the result
            return jsonify({
                'paper_title': result.get('paper_title', filename),
                'summary': result.get('summary', ''),
                'key_concepts': result.get('key_concepts', ''),
                'related_resources': result.get('related_resources', ''),
                'professor_suggestions': result.get('professor_suggestions', '')
            })
            
        except Exception as e:
            # Clean up temporary file on error
            if os.path.exists(file_path):
                os.remove(file_path)
            raise e
        
    except Exception as e:
        app.logger.error(f"Paper analysis error: {str(e)}")
        return jsonify({'error': f'Paper analysis failed: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    gemini_available = bool(os.getenv('GEMINI_API_KEY'))
    
    return jsonify({
        'status': 'healthy',
        'gemini_configured': gemini_available,
        'workflows_available': {
            'research_hub': gemini_available,
            'mentorship': gemini_available
        }
    })

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Load environment variables from .env file if it exists
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=8080, debug=True)
