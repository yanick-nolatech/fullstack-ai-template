import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TaskType } from '@/lib/types';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskType | null;
  onSave: (taskData: Partial<TaskType>) => Promise<void>;
  columnId?: string;
}

export default function TaskDialog({ isOpen, onClose, task, onSave, columnId }: TaskDialogProps) {
  const [editedTask, setEditedTask] = useState<Partial<TaskType>>({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'To Do',
    columnId: columnId || '',
  });

  useEffect(() => {
    if (task) {
      setEditedTask({
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : new Date().toISOString().split('T')[0],
        status: task.status,
        columnId: task.columnId,
      });
    } else {
      setEditedTask({
        title: '',
        description: '',
        priority: 'Medium',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'To Do',
        columnId: columnId || '',
      });
    }
  }, [task, columnId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: keyof TaskType, value: string) => {
    setEditedTask(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(editedTask);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="title"
            value={editedTask.title}
            onChange={handleChange}
            placeholder="Task Title"
          />
          <Textarea
            name="description"
            value={editedTask.description}
            onChange={handleChange}
            placeholder="Task Description"
          />
          <Select
            value={editedTask.priority}
            onValueChange={(value) => handleSelectChange('priority', value as TaskType['priority'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            name="dueDate"
            value={editedTask.dueDate}
            onChange={handleChange}
          />
          <Button type="submit">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
