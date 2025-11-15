#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
from urllib.parse import urlparse, parse_qs

PORT = 8000
DATA_FILE = 'todos.json'

def load_todos():
    if not os.path.exists(DATA_FILE):
        return {}
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def save_todos(todos):
    with open(DATA_FILE, 'w') as f:
        json.dump(todos, f)

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        if self.path.startswith('/api/todos'):
            todos = load_todos()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(list(todos.values())).encode())
        else:
            super().do_GET()
    
    def do_POST(self):
        if self.path.startswith('/api/todos'):
            length = int(self.headers['Content-Length'])
            body = json.loads(self.rfile.read(length))
            todos = load_todos()
            todo_id = 1 if not todos else max(map(int, todos.keys())) + 1
            todo = {'id': todo_id, 'title': body['title'], 'completed': False}
            todos[str(todo_id)] = todo
            save_todos(todos)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(todo).encode())
    
    def do_PUT(self):
        if self.path.startswith('/api/todos/'):
            todo_id = self.path.split('/')[-1]
            length = int(self.headers['Content-Length'])
            body = json.loads(self.rfile.read(length))
            todos = load_todos()
            if todo_id in todos:
                todos[todo_id].update(body)
                save_todos(todos)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(todos[todo_id]).encode())
    
    def do_DELETE(self):
        if self.path.startswith('/api/todos/'):
            todo_id = self.path.split('/')[-1]
            todos = load_todos()
            if todo_id in todos:
                del todos[todo_id]
                save_todos(todos)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'message': 'Todo deleted'}).encode())

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server running at http://localhost:{PORT}")
    httpd.serve_forever()