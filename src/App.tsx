import React, { useState, useEffect, useRef } from 'react';
import { Download, Zap, Code, Globe, Sparkles, Terminal, CheckCircle, AlertCircle, Clock, Wifi, WifiOff, Rocket, Layers, Database, Palette, Settings, Eye, Star, Trash2, RefreshCw, Play, Pause, Monitor, Smartphone, Tablet, Wand2, Brain, CloudLightning as Lightning, Cpu, Gem } from 'lucide-react';

interface BuildMessage {
  type: 'start' | 'command' | 'success' | 'error' | 'complete' | 'warning' | 'info';
  message: string;
  projectId?: string;
  step?: number;
  totalSteps?: number;
}

interface Project {
  id: string;
  prompt: string;
  status: 'building' | 'completed' | 'failed';
  messages: BuildMessage[];
  createdAt: Date;
  type: 'react' | 'nextjs' | 'static' | 'fullstack';
  preview?: string;
}

const projectTypes = [
  { 
    id: 'react', 
    name: 'React App', 
    icon: <Code className="w-6 h-6" />, 
    description: 'Modern React application with hooks, components, and beautiful UI',
    color: 'from-blue-500 via-blue-600 to-cyan-500',
    features: ['Components', 'Hooks', 'Responsive', 'Animations']
  },
  { 
    id: 'nextjs', 
    name: 'Next.js App', 
    icon: <Rocket className="w-6 h-6" />, 
    description: 'Full-stack Next.js application with SSR, API routes, and database',
    color: 'from-gray-700 via-gray-800 to-black',
    features: ['SSR', 'API Routes', 'Database', 'SEO']
  },
  { 
    id: 'static', 
    name: 'Static Website', 
    icon: <Globe className="w-6 h-6" />, 
    description: 'Beautiful static website with HTML, CSS, and interactive JavaScript',
    color: 'from-green-500 via-emerald-500 to-teal-500',
    features: ['Fast Loading', 'SEO Ready', 'Mobile First', 'Interactive']
  },
  { 
    id: 'fullstack', 
    name: 'Full-Stack App', 
    icon: <Database className="w-6 h-6" />, 
    description: 'Complete application with frontend, backend, database, and auth',
    color: 'from-purple-500 via-pink-500 to-rose-500',
    features: ['Frontend', 'Backend', 'Database', 'Authentication']
  }
];

const examplePrompts = [
  {
    title: "E-commerce Platform",
    prompt: "Create a modern e-commerce website for selling electronics with product catalog, shopping cart, user authentication, payment integration, order tracking, and admin dashboard",
    type: "fullstack"
  },
  {
    title: "Social Media Dashboard",
    prompt: "Build a social media dashboard with user profiles, posts, comments, real-time notifications, messaging system, and analytics",
    type: "nextjs"
  },
  {
    title: "Portfolio Website",
    prompt: "Design a stunning portfolio website for a photographer with image galleries, contact form, blog, testimonials, and booking system",
    type: "static"
  },
  {
    title: "Task Management App",
    prompt: "Create a task management application with drag-and-drop functionality, team collaboration, project timelines, and progress tracking",
    type: "react"
  },
  {
    title: "Restaurant Website",
    prompt: "Build a restaurant website with menu display, online ordering, reservation system, location map, and customer reviews",
    type: "nextjs"
  },
  {
    title: "Fitness Tracking App",
    prompt: "Design a fitness tracking application with workout plans, progress charts, social features, and nutrition tracking",
    type: "react"
  },
  {
    title: "Real Estate Platform",
    prompt: "Create a real estate platform with property listings, search filters, virtual tours, agent profiles, and mortgage calculator",
    type: "fullstack"
  },
  {
    title: "Learning Management System",
    prompt: "Build an online learning platform with course creation, video streaming, quizzes, progress tracking, and certificates",
    type: "fullstack"
  }
];

function App() {
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState<'react' | 'nextjs' | 'static' | 'fullstack'>('react');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildMessages, setBuildMessages] = useState<BuildMessage[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiUrl = 'https://aibuilder-1.onrender.com'

  const connectWebSocket = () => {
    try {
      const wsUrl = 'wss://aibuilder-1.onrender.com'

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('Connected to WebSocket');
        setWsConnected(true);
        setWsError(null);
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
          reconnectTimeout.current = null;
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const data: BuildMessage = JSON.parse(event.data);
          setBuildMessages(prev => [...prev, data]);
          
          if (data.step && data.totalSteps) {
            setBuildProgress((data.step / data.totalSteps) * 100);
          }

          if (data.type === 'complete' && data.projectId) {
            setIsBuilding(false);
            setBuildProgress(100);
            setCurrentProject(prev => prev && prev.id === data.projectId ? { ...prev, status: 'completed' } : prev);
          } else if (data.type === 'error') {
            setIsBuilding(false);
            if (currentProject) {
              setCurrentProject(prev => prev ? { ...prev, status: 'failed' } : null);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected', event.code);
        setWsConnected(false);
        
        if (event.code !== 1000) {
          setWsError('Connection lost. Attempting to reconnect...');
          reconnectTimeout.current = setTimeout(() => {
            connectWebSocket();
          }, 3000);
        }
      };

      ws.current.onerror = (error) => {
        console.log('WebSocket error:', error);
        setWsError('Connection failed. Retrying...');
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setWsError('Failed to connect to server');
    }
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close(1000);
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [buildMessages]);

  const generateWebsite = async () => {
    if (!prompt.trim()) return;

    const projectId = `project-${Date.now()}`;
    const newProject: Project = {
      id: projectId,
      prompt,
      status: 'building',
      messages: [],
      createdAt: new Date(),
      type: selectedType
    };

    setCurrentProject(newProject);
    setProjects(prev => [newProject, ...prev]);
    setIsBuilding(true);
    setBuildMessages([]);
    setBuildProgress(0);

    try {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: 'build_website',
          prompt,
          projectId,
          projectType: selectedType,
          requirements: {
            features: ['Modern Design', 'Responsive', 'Interactive'],
            styling: 'Tailwind CSS',
            responsive: true,
            modern: true
          }
        }));
      } else {
        // Fallback to HTTP API
        const response = await fetch(`${apiUrl}/api/build`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            projectId,
            projectType: selectedType,
            requirements: {
              features: ['Modern Design', 'Responsive', 'Interactive'],
              styling: 'Tailwind CSS',
              responsive: true,
              modern: true
            }
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to start build');
        }

        setBuildMessages([{
          type: 'info',
          message: 'Build started via HTTP. WebSocket connection will provide updates when available.',
          projectId
        }]);
      }
    } catch (error) {
      console.error('Error starting build:', error);
      setBuildMessages([{
        type: 'error',
        message: `Failed to start build: ${error instanceof Error ? error.message : 'Unknown error'}`,
        projectId
      }]);
      setIsBuilding(false);
    }
  };

  const downloadProject = async (projectId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/download/${projectId}`);
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `website-${projectId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download project');
    }
  };

  const useExamplePrompt = (example: typeof examplePrompts[0]) => {
    setPrompt(example.prompt);
    setSelectedType(example.type as any);
    setShowExamples(false);
  };

  const getMessageIcon = (type: BuildMessage['type']) => {
    switch (type) {
      case 'start': return <Play className="w-4 h-4 text-blue-500" />;
      case 'command': return <Terminal className="w-4 h-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'complete': return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <Brain className="w-12 h-12 text-blue-400" />
              <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Website Builder
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Transform your ideas into stunning, production-ready websites using the power of AI. 
            Just describe what you want, and watch your vision come to life.
          </p>
          
          {/* Connection Status */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm">
            {wsConnected ? (
              <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                <Wifi className="w-4 h-4" />
                <span>Connected to server</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
                <WifiOff className="w-4 h-4" />
                <span>{wsError || 'Connecting to server...'}</span>
              </div>
            )}
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Project Type Selection */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Choose Project Type
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projectTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id as any)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left group hover:scale-105 ${
                      selectedType === type.id
                        ? 'border-blue-400 bg-blue-400/10'
                        : 'border-white/20 bg-white/5 hover:border-white/30'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${type.color} p-2 mb-3 text-white`}>
                      {type.icon}
                    </div>
                    <h4 className="font-semibold text-white mb-1">{type.name}</h4>
                    <p className="text-sm text-gray-400 mb-3">{type.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {type.features.map((feature) => (
                        <span key={feature} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Describe Your Website
                </h3>
                <button
                  onClick={() => setShowExamples(!showExamples)}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Examples
                </button>
              </div>

              {showExamples && (
                <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Example Prompts:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {examplePrompts.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => useExamplePrompt(example)}
                        className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white text-sm">{example.title}</span>
                          <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${
                            projectTypes.find(t => t.id === example.type)?.color
                          } text-white`}>
                            {projectTypes.find(t => t.id === example.type)?.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{example.prompt}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your dream website in detail... The more specific you are, the better the result!"
                className="w-full h-32 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
              />

              <button
                onClick={generateWebsite}
                disabled={isBuilding || !prompt.trim()}
                className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed group"
              >
                {isBuilding ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Building Your Website...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Generate Website
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column - Output */}
          <div className="space-y-6">
            {/* Build Progress */}
            {isBuilding && (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 animate-pulse" />
                    Building Progress
                  </h3>
                  <span className="text-blue-400 font-mono">{Math.round(buildProgress)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out relative"
                    style={{ width: `${buildProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Build Messages */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Build Console
              </h3>
              <div className="bg-black/30 rounded-xl p-4 h-64 overflow-y-auto font-mono text-sm">
                {buildMessages.length === 0 ? (
                  <div className="text-gray-500 italic">Ready to build your website...</div>
                ) : (
                  buildMessages.map((message, index) => (
                    <div key={index} className="flex items-start gap-2 mb-2">
                      {getMessageIcon(message.type)}
                      <span className="text-gray-300 flex-1">{message.message}</span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Current Project */}
            {currentProject && (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Gem className="w-5 h-5" />
                    Current Project
                  </h3>
                  {currentProject.status === 'completed' && (
                    <button
                      onClick={() => downloadProject(currentProject.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Type:</span>
                    <span className={`px-2 py-1 rounded-full text-xs bg-gradient-to-r ${
                      projectTypes.find(t => t.id === currentProject.type)?.color
                    } text-white`}>
                      {projectTypes.find(t => t.id === currentProject.type)?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      currentProject.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      currentProject.status === 'building' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {currentProject.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Prompt:</span>
                    <p className="text-gray-300 text-sm mt-1 line-clamp-3">{currentProject.prompt}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project History */}
        {projects.length > 1 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Project History
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(1).map((project) => (
                <div key={project.id} className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs bg-gradient-to-r ${
                      projectTypes.find(t => t.id === project.type)?.color
                    } text-white`}>
                      {projectTypes.find(t => t.id === project.type)?.name}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      project.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      project.status === 'building' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{project.prompt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {project.createdAt.toLocaleDateString()}
                    </span>
                    {project.status === 'completed' && (
                      <button
                        onClick={() => downloadProject(project.id)}
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
