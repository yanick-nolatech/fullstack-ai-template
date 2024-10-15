import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { TaskType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, UserCircle } from 'lucide-react';

interface TaskProps {
  task: TaskType;
  index: number;
  updateTask: (taskId: string, updates: Partial<TaskType>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  openTaskDialog: (task: TaskType | null, columnId: string) => void;
  openTaskDetailDialog: (task: TaskType) => void;
}

export default function Task({ task, index, updateTask, deleteTask, openTaskDialog, openTaskDetailDialog }: TaskProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-gray-700 p-3 rounded ${
            task.status === 'Done' ? 'border-l-4 border-green-500' :
            new Date(task.dueDate) < new Date() ? 'border-l-4 border-red-500' :
            task.priority === 'Urgent' ? 'border-l-4 border-purple-500' :
            task.priority === 'High' ? 'border-l-4 border-yellow-500' :
            task.priority === 'Medium' ? 'border-l-4 border-blue-500' :
            'border-l-4 border-gray-500'
          }`}
          onClick={() => openTaskDetailDialog(task)}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{task.title}</h3>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={(e) => {
                e.stopPropagation();
                openTaskDialog(task, task.columnId);
              }}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={(e) => {
                e.stopPropagation();
                deleteTask(task.id);
              }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-400">{task.description}</div>
          <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
            <span>{task.dueDate}</span>
            <span>{task.priority}</span>
          </div>
          {task.assignees && task.assignees.length > 0 && (
            <div className="mt-2 flex space-x-1">
              {task.assignees.map(assignee => (
                <UserCircle key={assignee} className="h-5 w-5 text-gray-400" title={assignee} />
              ))}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
