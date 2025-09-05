'use client';

import { useState } from 'react';
import Button from '@/components/Button';

  type Task = { 
    id: string; 
    title: string; 
    completed: boolean; 
};

export default function TaskApp() {
  // 1. Define state: an array of strings (tasks).
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");


  function addTask() {
    // 2. Add a new task to the array
    if (newTask) {
        const newTaskObj: Task = {
            id: crypto.randomUUID(),
            title: newTask,
            completed: false,
        };
        setTasks([...tasks, newTaskObj]);
        setNewTask("")
    }
  }

  function toggleTask(id: string) {
    const updated = tasks.map((task) => {{
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        } else {
            return task;
        }
    }});
    setTasks(updated);
  }

  function deleteTask(id: string) {
    const remaining = tasks.filter((task) => task.id !== id );
    setTasks(remaining);
  }
  
  function startEdit (task: Task) {
    setEditingId(task.id);
    setEditingTitle(task.title);
  }

  function saveEdit (editingId: string) {
    const edited = tasks.map((task) => {
      if (editingId === null) {
        return task;
    }});
    }
  }

 
  
  return (
    <section style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Task Tracker</h1>

      <form
        onSubmit={(e) => {
            e.preventDefault(); // no page refresh
            addTask();
        }}
      >
        <input 
            placeholder='Enter a task...'
            value = {newTask}
            onChange = {(e) => setNewTask(e.target.value)}
        />

        <Button label="Add Task" />
      </form>

    <ul style={{ listStyle: 'none', padding: 0, marginTop: 12 }}>
    {tasks.map((task) => (
        <li
          key={task.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 0',
          }}
        >
        <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleTask(task.id)}
            aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
            style = {{
              cursor: 'pointer'
            }} 
        />
        <label
            onClick={() => toggleTask(task.id)}
            style={{
            textDecoration: task.completed ? 'line-through' : 'none',
            cursor: 'pointer',
            userSelect: 'none',
            }}
        >
            {editingId === task.id ? (
              <input
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                autoFocus
              />
            ) : (
              <label>{task.title}</label>
            )}
        </label>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <button 
          onClick={() => startEdit(task)}
          
          style = {{
            cursor: 'pointer'
          }} 

        >
            Edit
          </button>
        <button 
          onClick={() => deleteTask(task.id)}
          style = {{
            cursor: 'pointer'
          }} 
        >
          Delete
        </button>
        </div>
        </li>
    ))}
    </ul>
    </section>
  );
}
