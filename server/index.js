const express = require('express');
const cors = require('cors');
require('dotenv').config('.env');
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors({
  origin: ['https://ai-builder-ashen.vercel.app'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'your-api-key-here');
console.log('GOOGLE_AI_API_KEY:', process.env.GOOGLE_AI_API_KEY);
// Store active projects and connections
const activeProjects = new Map();
const connections = new Map();

// Enhanced prompts for different project types
const SYSTEM_PROMPTS = {
  react: `You are an expert React developer creating production-ready applications. Create modern, responsive, and visually stunning React applications with:
- Clean, modular component architecture
- Modern React hooks and best practices
- Tailwind CSS for beautiful styling
- Responsive design for all devices
- Interactive elements and smooth animations
- Professional UI/UX design
- Proper error handling and loading states
- Accessibility features
- SEO optimization where applicable`,

  nextjs: `You are an expert Next.js developer creating full-stack applications. Create modern, scalable Next.js applications with:
- App Router architecture (Next.js 13+)
- Server and client components
- API routes for backend functionality
- Database integration (when needed)
- Authentication systems
- Modern styling with Tailwind CSS
- Responsive design and mobile-first approach
- Performance optimizations
- SEO and metadata management
- Professional UI/UX design`,

  static: `You are an expert web developer creating beautiful static websites. Create modern, responsive static websites with:
- Semantic HTML5 structure
- Modern CSS with animations and transitions
- Vanilla JavaScript for interactivity
- Mobile-first responsive design
- Professional typography and spacing
- Beautiful color schemes and gradients
- Smooth animations and micro-interactions
- Cross-browser compatibility
- Fast loading and optimized assets`,

  fullstack: `You are an expert full-stack developer creating complete web applications. Create comprehensive applications with:
- Modern frontend (React/Next.js)
- Robust backend API
- Database design and integration
- User authentication and authorization
- Real-time features (when applicable)
- Professional UI/UX design
- Responsive design for all devices
- Error handling and validation
- Security best practices
- Performance optimization`
};

class WebsiteBuilder {
  constructor(projectId, ws) {
    this.projectId = projectId;
    this.ws = ws;
    this.projectPath = path.join(__dirname, 'projects', projectId);
  }

  sendMessage(type, message, step = null, totalSteps = null) {
    const data = {
      type,
      message,
      projectId: this.projectId,
      step,
      totalSteps
    };

    console.log(`[${this.projectId}] ${type.toUpperCase()}: ${message}`);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }

    // Broadcast to all connections
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  async createProjectStructure() {
    try {
      await fs.mkdir(this.projectPath, { recursive: true });
      this.sendMessage('success', 'Project directory created successfully');
    } catch (error) {
      this.sendMessage('error', `Failed to create project directory: ${error.message}`);
      throw error;
    }
  }

  async generateWebsiteContent(prompt, projectType = 'react', requirements = {}) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const systemPrompt = SYSTEM_PROMPTS[projectType] || SYSTEM_PROMPTS.react;
      
      const enhancedPrompt = `${systemPrompt}
\nUSER REQUEST: ${prompt}\n\nPROJECT REQUIREMENTS:\n- Framework: ${projectType}\n- Features: ${requirements.features?.join(', ') || 'Modern web application'}\n- Styling: ${requirements.styling || 'Tailwind CSS'}\n- Responsive: ${requirements.responsive ? 'Yes' : 'No'}\n- Modern Design: ${requirements.modern ? 'Yes' : 'No'}\n\nIMPORTANT INSTRUCTIONS:\n1. Create a complete, production-ready application\n2. Use modern design principles and beautiful UI\n3. Include proper component structure and organization\n4. Add interactive elements and smooth animations\n5. Ensure mobile responsiveness\n6. Use professional color schemes and typography\n7. Include proper error handling and loading states\n8. Add meaningful content, not just placeholders\n9. Create multiple pages/sections if appropriate\n10. Include proper SEO and accessibility features\n\nGenerate the following files based on the project type:\n\nFOR REACT APPLICATIONS:\n- package.json (with all necessary dependencies)\n- src/App.jsx (main application component)\n- src/index.js (entry point)\n- src/index.css (global styles with Tailwind)\n- src/components/ (individual component files)\n- public/index.html (HTML template)\n\nFOR NEXT.JS APPLICATIONS:\n- package.json (with Next.js dependencies)\n- app/layout.js (root layout)\n- app/page.js (home page)\n- app/globals.css (global styles)\n- components/ (reusable components)\n- lib/ (utility functions)\n- API routes if needed\n\nFOR STATIC WEBSITES:\n- index.html (main HTML file)\n- style.css (comprehensive CSS)\n- script.js (interactive JavaScript)\n- Additional HTML pages if needed\n\nPlease provide complete, working code for each file. Make the design beautiful, modern, and professional.\n\nIMPORTANT: Respond ONLY with code blocks for each file, using the format:\nFile: filename\n\`\`\`language\n...code...\n\`\`\` for every file. Do not include explanations or descriptions outside the code blocks.`;

      // Log the prompt sent to the AI
      console.log('--- AI PROMPT SENT ---');
      console.log(enhancedPrompt);
      console.log('----------------------');

      this.sendMessage('command', 'Generating website content with AI...');
      
      const result = await model.generateContent(enhancedPrompt);
      const response = await result.response;
      const generatedContent = response.text();

      // Log the raw AI response
      console.log('--- RAW AI RESPONSE ---');
      console.log(generatedContent);
      console.log('-----------------------');

      return this.parseGeneratedContent(generatedContent, projectType);
    } catch (error) {
      this.sendMessage('error', `AI generation failed: ${error.message}`);
      throw error;
    }
  }

  parseGeneratedContent(content, projectType) {
    const files = new Map();
    
    // Enhanced parsing logic to extract files from AI response
    const filePatterns = [
      /```(?:json|javascript|jsx|js|html|css|typescript|tsx|ts)\s*(?:\/\/\s*(.+?)\s*)?\n([\s\S]*?)```/g,
      /(?:^|\n)(?:File:|Filename:|Path:)\s*([^\n]+)\n```(?:\w+)?\n([\s\S]*?)```/g,
      /(?:^|\n)([a-zA-Z0-9_\-\/\.]+\.(js|jsx|ts|tsx|html|css|json|md))\s*:?\s*\n```(?:\w+)?\n([\s\S]*?)```/g
    ];

    let matches = [];
    filePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        matches.push(match);
      }
    });

    // Process matches and extract files
    matches.forEach(match => {
      let filename, fileContent;
      
      if (match[1] && match[2]) {
        filename = match[1].trim();
        fileContent = match[2].trim();
      } else if (match[3]) {
        filename = match[1].trim();
        fileContent = match[3].trim();
      }

      if (filename && fileContent) {
        // Clean up filename
        filename = filename.replace(/^[^\w\/\.]/, '').trim();
        if (!filename.includes('.')) {
          // Try to infer file extension
          if (fileContent.includes('<!DOCTYPE html') || fileContent.includes('<html')) {
            filename += '.html';
          } else if (fileContent.includes('export default') || fileContent.includes('import React')) {
            filename += projectType === 'nextjs' ? '.js' : '.jsx';
          } else if (fileContent.includes('{') && fileContent.includes('"name"')) {
            filename = 'package.json';
          } else if (fileContent.includes('@tailwind') || fileContent.includes('body {')) {
            filename += '.css';
          } else {
            filename += '.js';
          }
        }
        
        files.set(filename, fileContent);
      }
    });

    // If no files were parsed, create default structure
    if (files.size === 0) {
      console.log('No files parsed from AI response. Using fallback template.');
      this.createDefaultFiles(files, content, projectType);
    }

    return files;
  }

  createDefaultFiles(files, content, projectType) {
    switch (projectType) {
      case 'react':
        files.set('package.json', this.getDefaultPackageJson('react'));
        files.set('public/index.html', this.getDefaultHTML('React App'));
        files.set('src/index.js', this.getDefaultReactIndex());
        files.set('src/App.jsx', this.getDefaultReactApp(content));
        files.set('src/index.css', this.getDefaultCSS());
        break;
      
      case 'nextjs':
        files.set('package.json', this.getDefaultPackageJson('nextjs'));
        files.set('app/layout.js', this.getDefaultNextLayout());
        files.set('app/page.js', this.getDefaultNextPage(content));
        files.set('app/globals.css', this.getDefaultCSS());
        break;
      
      case 'static':
        files.set('index.html', this.getDefaultStaticHTML(content));
        files.set('style.css', this.getDefaultCSS());
        files.set('script.js', this.getDefaultJS());
        break;
      
      default:
        files.set('index.html', this.getDefaultHTML('Generated Website'));
        files.set('style.css', this.getDefaultCSS());
        files.set('script.js', this.getDefaultJS());
    }
  }

  getDefaultPackageJson(type) {
    const packages = {
      react: {
        "name": "ai-generated-react-app",
        "version": "1.0.0",
        "private": true,
        "dependencies": {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "react-scripts": "5.0.1",
          "@heroicons/react": "^2.0.18",
          "framer-motion": "^10.16.4"
        },
        "scripts": {
          "start": "react-scripts start",
          "build": "react-scripts build",
          "test": "react-scripts test",
          "eject": "react-scripts eject"
        },
        "browserslist": {
          "production": [">0.2%", "not dead", "not op_mini all"],
          "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
        }
      },
      nextjs: {
        "name": "ai-generated-nextjs-app",
        "version": "1.0.0",
        "private": true,
        "scripts": {
          "dev": "next dev",
          "build": "next build",
          "start": "next start",
          "lint": "next lint"
        },
        "dependencies": {
          "next": "14.0.0",
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "@heroicons/react": "^2.0.18",
          "framer-motion": "^10.16.4"
        },
        "devDependencies": {
          "autoprefixer": "^10.4.16",
          "postcss": "^8.4.31",
          "tailwindcss": "^3.3.5"
        }
      }
    };
    
    return JSON.stringify(packages[type] || packages.react, null, 2);
  }

  getDefaultHTML(title) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="root"></div>
    <script src="script.js"></script>
</body>
</html>`;
  }

  getDefaultReactIndex() {
    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
  }

  getDefaultReactApp(content) {
    return `import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={\`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 transition-opacity duration-1000 \${isLoaded ? 'opacity-100' : 'opacity-0'}\`}>
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4 animate-fade-in">
            AI Generated React App
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            This beautiful React application was created by AI based on your requirements.
          </p>
        </header>
        
        <main className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">Welcome to Your App</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              ${content.substring(0, 200)}...
            </p>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Get Started
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;`;
  }

  getDefaultNextLayout() {
    return `import './globals.css'

export const metadata = {
  title: 'AI Generated Next.js App',
  description: 'Created by AI Website Builder',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-inter antialiased">
        {children}
      </body>
    </html>
  )
}`;
  }

  getDefaultNextPage(content) {
    return `'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className={\`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 transition-opacity duration-1000 \${isLoaded ? 'opacity-100' : 'opacity-0'}\`}>
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 animate-fade-in">
            AI Generated Next.js App
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            This modern Next.js application was created by AI based on your requirements.
          </p>
        </header>
        
        <main className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8 mb-8 transform hover:scale-105 transition-all duration-300">
            <h2 className="text-3xl font-semibold text-white mb-6">Welcome to Your App</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              ${content.substring(0, 200)}...
            </p>
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Get Started
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}`;
  }

  getDefaultStaticHTML(content) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Generated Website</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body class="font-inter antialiased">
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div class="container mx-auto px-4 py-8">
            <header class="text-center mb-12">
                <h1 class="text-5xl font-bold text-gray-800 mb-4 animate-fade-in">
                    AI Generated Website
                </h1>
                <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                    This beautiful website was created by AI based on your requirements.
                </p>
            </header>
            
            <main class="max-w-4xl mx-auto">
                <div class="bg-white rounded-2xl shadow-xl p-8 mb-8 transform hover:scale-105 transition-transform duration-300">
                    <h2 class="text-3xl font-semibold text-gray-800 mb-6">Welcome</h2>
                    <p class="text-gray-600 leading-relaxed mb-6">
                        ${content.substring(0, 200)}...
                    </p>
                    <button onclick="showAlert()" class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                        Get Started
                    </button>
                </div>
            </main>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>`;
  }

  getDefaultCSS() {
    return `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    color: #333;
    overflow-x: hidden;
}

.animate-fade-in {
    animation: fadeIn 1s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-slide-up {
    animation: slideUp 0.8s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(50px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-bounce-in {
    animation: bounceIn 1s ease-out;
}

@keyframes bounceIn {
    0% {
        opacity: 0;
        transform: scale(0.3);
    }
    50% {
        opacity: 1;
        transform: scale(1.05);
    }
    70% {
        transform: scale(0.9);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.gradient-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.glass-effect {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    transform: translateY(0);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
    .container {
        padding: 0 16px;
    }
    
    h1 {
        font-size: 2.5rem;
    }
    
    h2 {
        font-size: 2rem;
    }
}`;
  }

  getDefaultJS() {
    return `// Enhanced JavaScript for interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
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

    // Add loading animation
    const elements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    });

    elements.forEach(el => observer.observe(el));

    // Add hover effects to buttons
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Add parallax effect to hero sections
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.parallax');
        if (parallax) {
            const speed = scrolled * 0.5;
            parallax.style.transform = \`translateY(\${speed}px)\`;
        }
    });
});

function showAlert() {
    alert('Hello! This website was generated by AI. Pretty amazing, right?');
}

// Add some interactive features
function toggleMenu() {
    const menu = document.querySelector('.mobile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add typing effect
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect if element exists
const typeElement = document.querySelector('.typewriter');
if (typeElement) {
    const text = typeElement.textContent;
    typeWriter(typeElement, text);
}`;
  }

  async writeFiles(files) {
    let fileCount = 0;
    const totalFiles = files.size;

    for (const [filename, content] of files) {
      try {
        const filePath = path.join(this.projectPath, filename);
        const dir = path.dirname(filePath);
        
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(filePath, content, 'utf8');
        
        fileCount++;
        this.sendMessage('success', `Created ${filename}`, fileCount, totalFiles);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        this.sendMessage('error', `Failed to create ${filename}: ${error.message}`);
      }
    }
  }

  async buildWebsite(prompt, projectType = 'react', requirements = {}) {
    try {
      this.sendMessage('start', `Starting ${projectType} project generation...`);
      
      // Step 1: Create project structure
      this.sendMessage('command', 'Creating project structure...', 1, 5);
      await this.createProjectStructure();
      
      // Step 2: Generate content with AI
      this.sendMessage('command', 'Generating website content with AI...', 2, 5);
      const files = await this.generateWebsiteContent(prompt, projectType, requirements);
      
      // Step 3: Write files
      this.sendMessage('command', 'Writing project files...', 3, 5);
      await this.writeFiles(files);
      
      // Step 4: Finalize
      this.sendMessage('command', 'Finalizing project...', 4, 5);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 5: Complete
      this.sendMessage('complete', `${projectType} project generated successfully! Your website is ready for download.`, 5, 5);
      
    } catch (error) {
      this.sendMessage('error', `Build failed: ${error.message}`);
      throw error;
    }
  }
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  const connectionId = uuidv4();
  connections.set(connectionId, ws);
  
  console.log('New WebSocket connection:', connectionId);
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'build_website') {
        const { prompt, projectId, projectType = 'react', requirements = {} } = data;
        
        if (!prompt) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Prompt is required',
            projectId
          }));
          return;
        }
        
        const finalProjectId = projectId || uuidv4();
        const builder = new WebsiteBuilder(finalProjectId, ws);
        activeProjects.set(finalProjectId, builder);
        
        // Start building in background
        builder.buildWebsite(prompt, projectType, requirements).catch(error => {
          console.error('Build error:', error);
        });
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });
  
  ws.on('close', () => {
    connections.delete(connectionId);
    console.log('WebSocket connection closed:', connectionId);
  });
});

// HTTP API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/build', async (req, res) => {
  try {
    const { prompt, projectId, projectType = 'react', requirements = {} } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const finalProjectId = projectId || uuidv4();
    const builder = new WebsiteBuilder(finalProjectId, null);
    activeProjects.set(finalProjectId, builder);
    
    // Start building in background
    builder.buildWebsite(prompt, projectType, requirements).catch(error => {
      console.error('Build error:', error);
    });
    
    res.json({
      success: true,
      projectId: finalProjectId,
      message: 'Website generation started. Connect to WebSocket for real-time updates.'
    });
  } catch (error) {
    console.error('API build error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/download/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const projectPath = path.join(__dirname, 'projects', projectId);
    
    // Check if project exists
    try {
      await fs.access(projectPath);
    } catch {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Create ZIP file
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    res.attachment(`website-${projectId}.zip`);
    archive.pipe(res);
    
    archive.directory(projectPath, false);
    await archive.finalize();
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to create download' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 AI Website Builder server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
  console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
});