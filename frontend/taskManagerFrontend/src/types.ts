export interface Board{
    id: number;
    teamId: number;
    team: Team ;
    tasks: Task[];
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
    id: number;
    title: string;
    status: TaskStatus;
    boardId: number;
    board: Board;
}

export interface Team{
    id: number;
    name: string;
    users: User[];
    boards: Board[];
}

export interface User{
    id: number
    email: string;
    passwordHash: string;
    teams?: Team[]
}