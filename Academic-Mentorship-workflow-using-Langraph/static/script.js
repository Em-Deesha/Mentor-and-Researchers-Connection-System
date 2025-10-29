// Global variables
let currentTool = 'research-hub';

// Tool switching functionality
function switchTool(tool) {
    currentTool = tool;
    
    // Update active button
    document.querySelectorAll('.workflow-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.workflow-btn').classList.add('active');
    
    // Show/hide appropriate sections
    if (tool === 'research-hub') {
        document.getElementById('research-hub-section').style.display = 'block';
        document.getElementById('mentorship-section').style.display = 'none';
    } else {
        document.getElementById('research-hub-section').style.display = 'none';
        document.getElementById('mentorship-section').style.display = 'block';
    }
    
    // Clear previous results
    clearResults();
}


// Clear results and errors
function clearResults() {
    document.getElementById('results').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    
    // Reset all cards to collapsed state
    document.querySelectorAll('.result-card').forEach(card => {
        const content = card.querySelector('.card-content');
        const expandIcon = card.querySelector('.expand-icon');
        
        content.classList.remove('expanded');
        expandIcon.style.transform = 'rotate(0deg)';
    });
}

// Show loading state
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

// Hide loading state
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Show error
function showError(message) {
    document.getElementById('error').style.display = 'flex';
    document.getElementById('error-message').textContent = message;
    hideLoading();
}

// Hide error
function hideError() {
    document.getElementById('error').style.display = 'none';
}

// Toggle card expansion
function toggleCard(section) {
    const card = document.querySelector(`[data-section="${section}"]`);
    const content = card.querySelector('.card-content');
    const expandIcon = card.querySelector('.expand-icon');
    
    const isExpanded = content.classList.contains('expanded');
    
    if (isExpanded) {
        content.classList.remove('expanded');
        expandIcon.style.transform = 'rotate(0deg)';
    } else {
        content.classList.add('expanded');
        expandIcon.style.transform = 'rotate(180deg)';
    }
}

// Display paper analysis results
function displayPaperResults(data) {
    // Populate each card with content
    const sections = [
        { key: 'summary', id: 'summary_content' },
        { key: 'key_concepts', id: 'key_concepts_content' },
        { key: 'related_resources', id: 'related_resources_content' },
        { key: 'professor_suggestions', id: 'professor_suggestions_content' }
    ];
    
    sections.forEach(section => {
        const element = document.getElementById(section.id);
        if (element && data[section.key]) {
            element.innerHTML = formatTextContent(data[section.key], section.key);
        }
    });
    
    // Show paper analysis results
    document.getElementById('paper-analysis-results').style.display = 'block';
    document.getElementById('mentorship-results').style.display = 'none';
    
    // Show results section with animation
    showResultsSection();
}

// Display mentorship results
function displayMentorshipResults(data) {
    // Populate each card with content
    const sections = [
        { key: 'research_scope', id: 'research_scope_content' },
        { key: 'analyst_report', id: 'analyst_report_content' },
        { key: 'resource_map', id: 'resource_map_content' },
        { key: 'final_report', id: 'final_report_content' }
    ];
    
    sections.forEach(section => {
        const element = document.getElementById(section.id);
        if (element && data[section.key]) {
            element.innerHTML = formatTextContent(data[section.key], section.key);
        }
    });
    
    // Show mentorship results
    document.getElementById('paper-analysis-results').style.display = 'none';
    document.getElementById('mentorship-results').style.display = 'block';
    
    // Show results section with animation
    showResultsSection();
}

// Show results section with animation
function showResultsSection() {
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'flex';
    resultsSection.style.opacity = '0';
    resultsSection.style.transform = 'translateY(30px)';
    
    // Animate in
    setTimeout(() => {
        resultsSection.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        resultsSection.style.opacity = '1';
        resultsSection.style.transform = 'translateY(0)';
    }, 100);
    
    hideLoading();
}

// Handle paper upload form submission
async function handlePaperUpload() {
    const form = document.getElementById('paper-upload-form');
    const formData = new FormData(form);
    
    // Show loading
    showLoading();
    clearResults();
    
    try {
        const response = await fetch('/api/analyze-paper', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        displayPaperResults(data);
        
    } catch (error) {
        console.error('Error:', error);
        showError(`Failed to analyze paper: ${error.message}`);
    }
}

// Handle mentorship form submission
async function handleMentorshipSubmit() {
    const form = document.getElementById('workflow-form');
    const formData = new FormData(form);
    
    // Show loading
    showLoading();
    clearResults();
    
    try {
        // Use Gemini mentorship endpoint
        const response = await fetch('/api/run-gemini-mentorship', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        displayMentorshipResults(data);
        
    } catch (error) {
        console.error('Error:', error);
        showError(`Failed to run workflow: ${error.message}`);
    }
}

// Format text content for better display
function formatTextContent(text, section) {
    if (!text) return '';
    
    // Special formatting for Resource Map (mentorship)
    if (section === 'resource_map') {
        return formatResourceMap(text);
    }
    
    // Convert markdown-style formatting to HTML
    let formatted = text
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
        // Headers
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
        // Lists
        .replace(/^\* (.*$)/gm, '<li>$1</li>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        // Wrap in paragraphs
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
    
    // Wrap consecutive list items in ul/ol tags
    formatted = formatted
        .replace(/(<li>.*<\/li>)/gs, (match) => {
            const lines = match.split('<br>');
            const listItems = lines.filter(line => line.includes('<li>'));
            if (listItems.length > 0) {
                return '<ul>' + listItems.join('') + '</ul>';
            }
            return match;
        });
    
    return formatted;
}

// Format Resource Map as HTML table
function formatResourceMap(text) {
    if (!text) return '';
    
    // Split text into lines and parse skill entries
    const lines = text.split('\n').filter(line => line.trim());
    const skills = [];
    
    let currentSkill = {};
    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('- ') || line.match(/^\d+\./)) {
            // Start of new skill
            if (currentSkill.name) {
                skills.push(currentSkill);
            }
            currentSkill = {
                name: line.replace(/^[-•]\s*|\d+\.\s*/, '').trim(),
                resource: '',
                level: '',
                importance: ''
            };
        } else if (line.includes('Level:') || line.includes('level:')) {
            currentSkill.level = line.replace(/.*[Ll]evel:\s*/, '').trim();
        } else if (line.includes('Why') || line.includes('Important') || line.includes('important')) {
            currentSkill.importance = line.replace(/.*[Ww]hy.*?:\s*/, '').replace(/.*[Ii]mportant.*?:\s*/, '').trim();
        } else if (line.includes('Resource') || line.includes('Course') || line.includes('Book')) {
            currentSkill.resource = line.replace(/.*[Rr]esource.*?:\s*/, '').replace(/.*[Cc]ourse.*?:\s*/, '').replace(/.*[Bb]ook.*?:\s*/, '').trim();
        } else if (line.length > 10 && !line.startsWith('**') && !line.includes(':')) {
            // Likely a resource title
            if (!currentSkill.resource) {
                currentSkill.resource = line;
            }
        }
    }
    
    // Add the last skill
    if (currentSkill.name) {
        skills.push(currentSkill);
    }
    
    // If no structured data found, return formatted text
    if (skills.length === 0) {
        return formatTextContent(text);
    }
    
    // Create HTML table
    let tableHTML = `
        <div class="resource-table-container">
            <table class="resource-table">
                <thead>
                    <tr>
                        <th>Focus Area</th>
                        <th>Resource Title</th>
                        <th>Level</th>
                        <th>Why it Matters</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    skills.forEach(skill => {
        tableHTML += `
            <tr>
                <td><strong>${skill.name || 'N/A'}</strong></td>
                <td>${skill.resource || 'N/A'}</td>
                <td><span class="level-badge">${skill.level || 'N/A'}</span></td>
                <td>${skill.importance || 'N/A'}</td>
            </tr>
        `;
    });
    
    tableHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    return tableHTML;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize with research hub tool
    document.getElementById('research-hub-section').style.display = 'block';
    document.getElementById('mentorship-section').style.display = 'none';
    
    // Paper upload form submission
    const paperForm = document.getElementById('paper-upload-form');
    if (paperForm) {
        paperForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handlePaperUpload();
        });
    }
    
    // Mentorship form submission
    const mentorshipForm = document.getElementById('workflow-form');
    if (mentorshipForm) {
        mentorshipForm.addEventListener('submit', function(e) {
        e.preventDefault();
            handleMentorshipSubmit();
    });
    }
    
    // Add smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add keyboard navigation for cards
    document.querySelectorAll('.card-header').forEach(header => {
        header.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const section = this.closest('.result-card').dataset.section;
                toggleCard(section);
            }
        });
        
        // Make headers focusable
        header.setAttribute('tabindex', '0');
        header.setAttribute('role', 'button');
        header.setAttribute('aria-expanded', 'false');
    });
    
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe result cards for scroll animations
    document.querySelectorAll('.result-card').forEach(card => {
        observer.observe(card);
    });
});

// Add smooth transitions for all interactive elements
document.addEventListener('DOMContentLoaded', function() {
    // Add focus styles for accessibility
    const focusableElements = document.querySelectorAll('button, input, textarea, select, [tabindex]');
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid #14b8a6';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
});