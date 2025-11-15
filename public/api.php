<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataFile = __DIR__ . '/todos.json';

function loadTodos() {
    global $dataFile;
    if (!file_exists($dataFile)) {
        return [];
    }
    return json_decode(file_get_contents($dataFile), true) ?: [];
}

function saveTodos($todos) {
    global $dataFile;
    file_put_contents($dataFile, json_encode($todos));
}

$method = $_SERVER['REQUEST_METHOD'];
$todos = loadTodos();

switch ($method) {
    case 'GET':
        echo json_encode(array_values($todos));
        break;
        
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $id = empty($todos) ? 1 : max(array_keys($todos)) + 1;
        $todo = [
            'id' => $id,
            'title' => $input['title'],
            'completed' => false,
            'priority' => $input['priority'] ?? 'medium',
            'due_date' => $input['due_date'] ?? null,
            'created_at' => date('Y-m-d H:i:s')
        ];
        $todos[$id] = $todo;
        saveTodos($todos);
        echo json_encode($todo);
        break;
        
    case 'PUT':
        $id = (int)$_GET['id'];
        $input = json_decode(file_get_contents('php://input'), true);
        if (isset($todos[$id])) {
            $todos[$id]['title'] = $input['title'] ?? $todos[$id]['title'];
            $todos[$id]['completed'] = $input['completed'] ?? $todos[$id]['completed'];
            $todos[$id]['priority'] = $input['priority'] ?? $todos[$id]['priority'];
            $todos[$id]['due_date'] = $input['due_date'] ?? $todos[$id]['due_date'];
            saveTodos($todos);
            echo json_encode($todos[$id]);
        }
        break;
        
    case 'DELETE':
        $id = (int)$_GET['id'];
        if (isset($todos[$id])) {
            unset($todos[$id]);
            saveTodos($todos);
            echo json_encode(['message' => 'Todo deleted']);
        }
        break;
}
?>