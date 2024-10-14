import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Edit2, Trash2, Calendar, UserPlus, Paperclip, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskType } from '@/lib/types';
import { db } from '@/lib/firebase/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import TaskDialog from './TaskDialog';

interface TaskProps {
  task: TaskType;
  index: number;
  updateTask: (taskId: string, updates: Partial<TaskType>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  openTaskDialog: (task: TaskType) => void;
}

export default function Task({ task, index, updateTask, deleteTask, openTaskDialog }: TaskProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleDelete = () => {
    deleteTask(task.id);
  };

  const getTaskColor = () => {
    if (task.status === 'Done') return 'border-green-500';
    if (new Date(task.dueDate) < new Date()) return 'border-red-500';
    switch (task.priority) {
      case 'Urgent': return 'border-purple-500';
      case 'High': return 'border-yellow-500';
      case 'Medium': return 'border-blue-500';
      default: return 'border-gray-500';
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          className={`bg-gray-700 p-3 rounded ${getTaskColor()} border-l-4`}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{task.title}</h3>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={() => openTaskDialog(task)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-400">{task.description}</div>
          <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
            <div className="flex space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex space-x-2">
              <UserPlus className="h-4 w-4" />
              <Paperclip className="h-4 w-4" />
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <TaskDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            task={task}
            updateTask={updateTask}
          />
        </div>
      )}
    </Draggable>
  );
}
