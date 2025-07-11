# AI Website Builder

Transform your ideas into beautiful, functional websites using the power of AI. Just describe what you want, and watch as your vision comes to life.

## 🚀 Quick Start

### Option 1: Using the Start Script (Recommended)

```bash
./start.sh
```

### Option 2: Manual Setup

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Start both client and server
npm run start
```

## 📱 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **WebSocket**: ws://localhost:3001

## 🔧 Features

- **Real-time Build Progress**: Watch your website being built step by step
- **WebSocket Communication**: Live updates during the building process
- **HTTP Fallback**: Works even when WebSocket connection fails
- **Project History**: Keep track of all your previous builds
- **Download Ready**: Get your completed website as a ZIP file
- **Responsive Design**: Beautiful, modern UI that works on all devices

## 🛠️ Technical Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + WebSocket
- **AI Integration**: Google Generative AI (Gemini)
- **File Handling**: Multer + Archiver for ZIP creation

## 🔍 Troubleshooting

### Console Errors Explained

When you open the browser console, you might see several errors. Here's what they mean:

#### ✅ **Normal WebSocket Messages** (Not Errors)

```
WebSocket connection to 'ws://localhost:3001/' failed: WebSocket is closed before the connection is established.
WebSocket disconnected
Connected to WebSocket
```

**What it means**: These are normal connection messages. The app is successfully connecting and reconnecting to the server.

#### 🟡 **Browser Extension Errors** (Can be ignored)

```
[ChromeTransport] connect error: Error: MetaMask extension not found
Video element not found for attaching listeners.
Failed to decode downloaded font
OTS parsing error: invalid sfntVersion
A listener indicated an asynchronous response by returning true, but the message channel closed
```

**What it means**: These are from browser extensions (MetaMask, content scripts, etc.) and don't affect your app.

### Common Issues and Solutions

#### 1. WebSocket Connection Failed

**Symptoms**: "WebSocket connection to 'ws://localhost:3001/' failed"

**Solutions**:

- Make sure the server is running on port 3001
- Check if port 3001 is not blocked by firewall
- The app will automatically fall back to HTTP mode if WebSocket fails

#### 2. MetaMask Extension Error

**Symptoms**: "[ChromeTransport] connect error: Error: MetaMask extension not found"

**Solution**: This is a browser extension warning and doesn't affect the app. You can safely ignore it.

#### 3. Video Element Not Found

**Symptoms**: "Video element not found for attaching listeners"

**Solution**: This is from a browser extension (content.js) and doesn't affect the app functionality.

#### 4. Font Decoding Issues

**Symptoms**: "Failed to decode downloaded font" or "OTS parsing error"

**Solution**: These are browser warnings about font loading and don't affect the app.

#### 5. Message Channel Errors

**Symptoms**: "A listener indicated an asynchronous response by returning true, but the message channel closed"

**Solution**: This is related to browser extensions and doesn't affect the app.

### Connection Status Indicator

The app now includes a connection status indicator at the top:

- 🟢 **Green with WiFi icon**: Connected to server via WebSocket
- 🟡 **Yellow with WiFi-off icon**: Connecting or connection issues

### Manual Server Start

If you need to start the server separately:

```bash
# Terminal 1 - Start the backend server
cd server
npm start

# Terminal 2 - Start the frontend
npm run dev
```

### Utility Scripts

The project includes several utility scripts to help with development:

```bash
# Quick start (recommended)
./start.sh

# Restart the application cleanly
./restart.sh

# Check if everything is running properly
./check-status.sh
```

### Environment Variables

Create a `.env` file in the root directory for Google AI API key:

```env
GOOGLE_AI_API_KEY=your_api_key_here
```

## 📁 Project Structure

```
├── src/                    # Frontend React code
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # React entry point
│   └── index.css          # Global styles
├── server/                # Backend Node.js code
│   ├── index.js           # Express server + WebSocket
│   ├── projects/          # Generated website files
│   └── temp/              # Temporary files
├── package.json           # Frontend dependencies
├── server/package.json    # Backend dependencies
├── vite.config.ts         # Vite configuration
└── start.sh              # Quick start script
```

## 🔄 Recent Improvements

- **Enhanced WebSocket Handling**: Better error handling and automatic reconnection
- **HTTP Fallback Mode**: App works even when WebSocket is unavailable
- **Connection Status Indicator**: Visual feedback about server connection
- **Improved Error Handling**: Better error messages and recovery
- **Automatic Directory Creation**: Script creates necessary directories
- **Better Logging**: More detailed console logs for debugging

## 🎯 Usage

1. **Describe Your Website**: Enter a detailed description of the website you want to create
2. **Watch the Build**: See real-time progress as your website is generated
3. **Download**: Once complete, download your website as a ZIP file
4. **View History**: Access all your previous projects

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
