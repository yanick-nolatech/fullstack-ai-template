export interface TaskType {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate: string;
  status: 'To Do' | 'In Progress' | 'Done';
  columnId: string;
  assignees: string[];
  comments: string[];
  attachments: string[];
  labels: string[];
  createdAt: string;
}

export interface ColumnType {
  id: string;
  title: string;
  taskIds: string[];
  order: number;
}
