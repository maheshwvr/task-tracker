'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';

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


  async function addTask() {
    const title = newTask.trim();
    if (!title) return;

    // 1) insert into DB and return the row we created
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, completed: false })
      .select()
      .single();

    // 2) handle error
    if (error) {
      console.error('Failed to insert task:', error);
      return;
    }

    // 3) update local state with the row returned by Supabase
    setTasks([...tasks, data as Task]);
    setNewTask('');
  }

  async function toggleTask(id: string) {
    // 1) Find the task we’re toggling
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    // 2) Compute the new completed value
    const nextCompleted = !target.completed;

    // 3) Optimistically update local UI
    const prevTasks = tasks;
    const optimistic = tasks.map((t) =>
      t.id === id ? { ...t, completed: nextCompleted } : t
    );
    setTasks(optimistic);

    // 4) Persist to Supabase
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: nextCompleted })
      .eq('id', id)
      .select()
      .single();

    // 5) Handle errors (rollback UI if needed)
    if (error) {
      console.error('Failed to toggle task:', error);
      setTasks(prevTasks); // rollback
      return;
    }

    // 6) (Optional) trust server as source of truth
    setTasks((cur) => cur.map((t) => (t.id === id ? (data as Task) : t)));
  }

  async function deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete task:', error);
      return;
    }

    // remove locally after DB confirms delete
    setTasks(tasks.filter((t) => t.id !== id));

    // if you were editing this one, exit edit mode
    if (editingId === id) {
      setEditingId(null);
      setEditingTitle("");
    }
  }
  
  function startEdit (task: Task) {
    setEditingId(task.id);
    setEditingTitle(task.title);
  }

  async function saveEdit() {
    if (!editingId) return;

    const trimmed = editingTitle.trim();
    if (!trimmed) {
      setEditingId(null);
      setEditingTitle("");
      return;
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({ title: trimmed })
      .eq('id', editingId)
      .select()
      .single();

  if (error) {
    console.error('Failed to update task:', error);
    return; // keep UI in edit mode so user can retry/fix
  }

  setTasks(tasks.map(t => (t.id === editingId ? (data as Task) : t)));
  setEditingId(null);
  setEditingTitle("");
  };

  function cancelEdit() {
    setEditingId(null);
    setEditingTitle("");
  };

  useEffect(() => {
    async function loadTasks() {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error(error);
      } else {
        setTasks(data as Task[]);
      }
    }

    loadTasks();
  }, []);

  
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
              <form
                onSubmit={(e) => {
                    e.preventDefault(); // no page refresh
                    saveEdit();
                }}
              >
                <input 
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  autoFocus
                />

              </form>
            ) : (
              <label>{task.title}</label>
            )}
        </label>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        
        {editingId === task.id ? (
          <>
            <button 
            onClick={saveEdit}
            style = {{
              cursor: 'pointer'
            }}         
            >
              Save
            </button>

            <button 
            onClick={cancelEdit}
            style = {{
              cursor: 'pointer'
            }}         
            >
              Cancel
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
        </div>
        </li>
    ))}
    </ul>
    </section>
  );
}
