import { useState, useEffect } from 'react'
import type { Task } from './types';
import { createTask, getTasks } from './api/task';

import './App.css'

function App() {
  const [tasks, setTasks] = useState<Array<Task>>([]);
  const [title, setTitle] = useState('');
  const [boardId, setBoardId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const taskList = await getTasks();
        setTasks(taskList);
      } catch {
        setError('Failed to load tasks.');
      }
    };

    loadTasks();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const parsedBoardId = Number(boardId);
    const parsedTeamId = Number(teamId);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!Number.isInteger(parsedBoardId) || parsedBoardId <= 0) {
      setError('Board ID must be a positive number.');
      return;
    }

    if (!Number.isInteger(parsedTeamId) || parsedTeamId <= 0) {
      setError('Team ID must be a positive number.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newTask = await createTask(title.trim(), parsedBoardId, parsedTeamId);
      setTasks((currentTasks) => [...currentTasks, newTask]);
      setTitle('');
      setBoardId('');
      setTeamId('');
    } catch {
      setError('Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <section className="rounded border border-gray-200 p-4 shadow-sm">
        <h1 className="mb-4 text-2xl font-semibold">Task Manager</h1>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            className="w-full rounded border border-gray-300 px-3 py-2"
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <input
            className="w-full rounded border border-gray-300 px-3 py-2"
            type="number"
            placeholder="Board ID"
            value={boardId}
            onChange={(event) => setBoardId(event.target.value)}
          />
          <input
            className="w-full rounded border border-gray-300 px-3 py-2"
            type="number"
            placeholder="Team ID"
            value={teamId}
            onChange={(event) => setTeamId(event.target.value)}
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            className="rounded bg-gray-700 px-4 py-2 text-white disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Add Task'}
          </button>
        </form>
      </section>

      <section className="space-y-2">
        <p>Total tasks: {tasks.length}</p>
        {tasks.length === 0 ? (
          <p className="text-gray-500">No tasks yet.</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="rounded border border-gray-300 p-3"
            >
              <h3 className="font-semibold">{task.title}</h3>
              <p className="text-sm text-gray-600">Status: {task.status}</p>
              <p className="text-sm text-gray-600">Board ID: {task.boardId}</p>
            </div>
          ))
        )}
      </section>
    </main>
  )
}

export default App
