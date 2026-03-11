import express, { Request, Response } from "express";

const router = express.Router();

type Board = {
    id: number;
    teamId: number;
};

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

type Task = {
    id: number;
    title: string;
    status: TaskStatus;
    boardId: number;
};

const allowedStatuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
let boards: Board[] = [];
let tasks: Task[] = [];
let nextId = 1;

// Get tasks
router.get('/tasks', (_req: Request, res: Response) => {
    res.status(200).json(tasks);
});

// Get task by id
router.get('/tasks/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const task = tasks.find((item) => item.id === id);

    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json(task);
});

// Create task
router.post('/tasks', (req: Request, res: Response) => {
    const title = req.body?.title;
    const boardId = Number(req.body?.boardId);
    const boardPayload = req.body?.board as Board | undefined;
    const incomingStatus = req.body?.status as TaskStatus | undefined;

    if (!title) {
        return res.status(400).json({ message: 'title is required' });
    }

    if (!Number.isInteger(boardId) || boardId <= 0) {
        return res.status(400).json({ message: 'boardId is required and must be a positive integer' });
    }

    if (incomingStatus && !allowedStatuses.includes(incomingStatus)) {
        return res.status(400).json({ message: 'status must be TODO, IN_PROGRESS, or DONE' });
    }

    if (boardPayload) {
        if (!Number.isInteger(boardPayload.id) || !Number.isInteger(boardPayload.teamId)) {
            return res.status(400).json({ message: 'board must include valid id and teamId' });
        }

        const boardIndex = boards.findIndex((item) => item.id === boardPayload.id);
        if (boardIndex === -1) {
            boards.push(boardPayload);
        } else {
            boards[boardIndex] = boardPayload;
        }
    }

    const board = boards.find((item) => item.id === boardId);
    if (!board) {
        return res.status(400).json({ message: 'board not found; include board details in request body as board: { id, teamId }' });
    }

    const newTask = {
        id: nextId++,
        title,
        status: incomingStatus ?? "TODO",
        boardId
    };

    tasks.push(newTask);
    return res.status(201).json({
        ...newTask,
        board
    });
});

// Update task
router.put('/tasks/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = tasks.findIndex((item) => item.id === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }

    const currentTask = tasks[index];
    tasks[index] = {
        ...currentTask,
        title: req.body?.title ?? currentTask.title,
        status: req.body?.status ?? currentTask.status,
        boardId: req.body?.boardId ?? currentTask.boardId
    };

    const board = boards.find((item) => item.id === tasks[index].boardId) ?? null;
    return res.status(200).json({
        ...tasks[index],
        board
    });
});

// Delete task
router.delete('/tasks/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = tasks.findIndex((item) => item.id === id);

    if (index === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }

    tasks.splice(index, 1);
    return res.status(204).send();
});

export default router;