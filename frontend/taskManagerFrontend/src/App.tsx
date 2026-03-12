import { useState } from 'react'
import { Task } from './types';

import './App.css'

function App() {
  const [task,setTask] = useState<string>('');
  const [tasks,setTasks] = useState<Array<Task>>([]);

  return (
    <>
      <button className="bg-gray-500 text-white px-4 py-2 rounded">
        Create Task
      </button>
    </>
  )
}

export default App
