<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;

class TodoController extends Controller
{
    public function index()
    {
        return Todo::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $request->validate(['title' => 'required|string|max:255']);
        
        return Todo::create([
            'title' => $request->title,
            'completed' => false
        ]);
    }

    public function update(Request $request, Todo $todo)
    {
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'completed' => 'sometimes|boolean'
        ]);
        
        $todo->update($request->only(['title', 'completed']));
        return $todo;
    }

    public function destroy(Todo $todo)
    {
        $todo->delete();
        return response()->json(['message' => 'Todo deleted']);
    }
}