'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';

  type Task = { 
    id: string; 
    title: string; 
    completed: boolean; 
    user_id: string;
};

export default function TaskApp() {
  // 1. Define state: an array of strings (tasks).
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [animatingTask, setAnimatingTask] = useState<string | null>(null);


  async function addTask() {
    const title = newTask.trim();
    if (!title || !userId) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, completed: false, user_id: userId }) // include user_id
      .select()
      .single();

    if (error) {
      console.error('Failed to insert task:', error);
      return;
    }

    setTasks([...tasks, data as Task]);
    setNewTask('');
  }

  async function toggleTask(id: string) {
    // 1) Find the task we’re toggling
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    // 2) Compute the new completed value
    const nextCompleted = !target.completed;

    // 3) Start animation if completing task
    if (nextCompleted) {
      setAnimatingTask(id);
      setTimeout(() => setAnimatingTask(null), 800); // Animation duration
    }

    // 4) Optimistically update local UI
    const prevTasks = tasks;
    const optimistic = tasks.map((t) =>
      t.id === id ? { ...t, completed: nextCompleted } : t
    );
    setTasks(optimistic);

    // 5) Persist to Supabase
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: nextCompleted })
      .eq('id', id)
      .select()
      .single();

    // 6) Handle errors (rollback UI if needed)
    if (error) {
      console.error('Failed to toggle task:', error);
      setTasks(prevTasks); // rollback
      return;
    }

    // 7) (Optional) trust server as source of truth
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
    if (!userId) return; // wait until we know the user
    (async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error(error);
      } else {
        setTasks(data as Task[]);
      }
    })();
  }, [userId]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setUserId(data.user?.id ?? null);
    })();
    return () => { active = false; };
  }, []);


  
  return (
    <div className="content-wrapper">
      <form
        onSubmit={(e) => {
            e.preventDefault();
            addTask();
        }}
        style={{ marginBottom: '2rem' }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
              placeholder='Enter a task...'
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="form-input"
              style={{ flex: 1 }}
          />
          <Button label="Add Task" icon={<FaPlus />} size="large" type="submit" />
        </div>
      </form>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tasks.map((task) => (
            <li key={task.id} className="task-item">
              <div
                className={`custom-checkbox ${task.completed ? 'checked' : ''} ${animatingTask === task.id ? 'checking' : ''}`}
                onClick={() => toggleTask(task.id)}
                aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                role="checkbox"
                aria-checked={task.completed}
              />
              
              {editingId === task.id ? (
                <form
                  onSubmit={(e) => {
                      e.preventDefault();
                      saveEdit();
                  }}
                  style={{ flex: 1 }}
                >
                  <input 
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="form-input"
                    autoFocus
                  />
                </form>
              ) : (
                <span
                  className={`task-label ${task.completed ? 'completed' : ''}`}
                  onClick={() => toggleTask(task.id)}
                >
                  {task.title}
                </span>
              )}

              <div className="task-actions">
                {editingId === task.id ? (
                  <>
                    <Button 
                      icon={<FaSave />}
                      onClick={saveEdit}
                      size="small"
                      variant="primary"
                    />
                    <Button 
                      icon={<FaTimes />}
                      onClick={cancelEdit}
                      size="small"
                      variant="danger"
                    />
                  </>
                ) : (
                  <>
                    <Button 
                      icon={<FaEdit />}
                      onClick={() => startEdit(task)}
                      size="small"
                      variant="secondary"
                    />
                    <Button 
                      icon={<FaTrash />}
                      onClick={() => deleteTask(task.id)}
                      size="small"
                      variant="danger"
                    />          
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>

        {tasks.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 1rem',
            color: 'var(--muted)'
          }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No tasks yet</p>
            <p className="text-muted">Add your first task to get started</p>
          </div>
        )}
    </div>
  );
}
