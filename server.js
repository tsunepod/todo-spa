const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const dataFile = path.join(__dirname, 'public', 'todos.json');

function loadTodos() {
    if (!fs.existsSync(dataFile)) return {};
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function saveTodos(todos) {
    fs.writeFileSync(dataFile, JSON.stringify(todos));
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (req.url.startsWith('/api/todos')) {
        const todos = loadTodos();
        
        if (req.method === 'GET') {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(Object.values(todos)));
        } else if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                const input = JSON.parse(body);
                const id = Object.keys(todos).length === 0 ? 1 : Math.max(...Object.keys(todos).map(Number)) + 1;
                const todo = {id, title: input.title, completed: false, created_at: new Date().toISOString()};
                todos[id] = todo;
                saveTodos(todos);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(todo));
            });
        } else if (req.method === 'PUT') {
            const id = new URL(req.url, `http://localhost`).searchParams.get('id');
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                const input = JSON.parse(body);
                if (todos[id]) {
                    todos[id].title = input.title ?? todos[id].title;
                    todos[id].completed = input.completed ?? todos[id].completed;
                    saveTodos(todos);
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(todos[id]));
                }
            });
        } else if (req.method === 'DELETE') {
            const id = new URL(req.url, `http://localhost`).searchParams.get('id');
            if (todos[id]) {
                delete todos[id];
                saveTodos(todos);
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({message: 'Todo deleted'}));
            }
        }
    } else {
        const filePath = req.url === '/' ? '/index.html' : req.url;
        const fullPath = path.join(__dirname, 'public', filePath);
        
        fs.readFile(fullPath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not Found');
            } else {
                const ext = path.extname(fullPath);
                const contentType = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css'}[ext] || 'text/plain';
                res.writeHead(200, {'Content-Type': contentType});
                res.end(data);
            }
        });
    }
});

server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));