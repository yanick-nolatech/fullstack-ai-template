export type CommentType = {
  id: string;
  content: string;
  author: string;
  createdAt: string;
};

export type AttachmentType = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
};

export interface TaskType {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate: string;
  status: 'To Do' | 'In Progress' | 'Done';
  columnId: string;
  assignees?: string[];
  comments?: CommentType[];
  attachments?: AttachmentType[];
}

export interface ColumnType {
  id: string;
  title: string;
  order: number;
}
