#!/usr/bin/env python3
"""
Simple HTTP server for serving static files
Pure HTML+CSS+JS application - no dependencies required
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

# Configuration
PORT = 3000
HOST = 'localhost'

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler to serve index.html for root requests"""
    
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_GET(self):
        # Serve index.html for root path
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()

def main():
    """Start the HTTP server"""
    # Change to the directory containing this script
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    print(f"Starting Otomono Jerseys Server...")
    print(f"Serving files from: {script_dir}")
    print(f"Server running at: http://{HOST}:{PORT}")
    print(f"Main page: http://{HOST}:{PORT}/index.html")
    print(f"Services page: http://{HOST}:{PORT}/services.html")
    print(f"Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        with socketserver.TCPServer((HOST, PORT), CustomHTTPRequestHandler) as httpd:
            # Try to open browser automatically
            try:
                webbrowser.open(f'http://{HOST}:{PORT}')
                print(f"Opened browser automatically")
            except:
                print(f"Could not open browser automatically")
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print(f"\nServer stopped by user")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"Port {PORT} is already in use")
            print(f"Try a different port or stop the existing server")
        else:
            print(f"Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

