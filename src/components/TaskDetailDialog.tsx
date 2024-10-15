import React, { useState, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TaskType, CommentType, AttachmentType } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { X, Paperclip, Send } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface TaskDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<TaskType>) => Promise<void>;
  task: TaskType | null;
  currentUser: string;
}

export default function TaskDetailDialog({ isOpen, onClose, onSave, task, currentUser }: TaskDetailDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskType['priority']>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskType['status']>('To Do');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [newAssignee, setNewAssignee] = useState('');
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState<AttachmentType[]>([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setDueDate(task.dueDate);
      setStatus(task.status);
      setAssignees(task.assignees || []);
      setComments(task.comments || []);
      setAttachments(task.attachments || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setDueDate('');
      setStatus('To Do');
      setAssignees([]);
      setComments([]);
      setAttachments([]);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ title, description, priority, dueDate, status, assignees, comments, attachments });
    onClose();
  };

  const handleAddAssignee = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newAssignee.trim()) {
      e.preventDefault();
      setAssignees(prev => [...new Set([...prev, newAssignee.trim()])]);
      setNewAssignee('');
    }
  };

  const handleRemoveAssignee = (assignee: string) => {
    setAssignees(prev => prev.filter(a => a !== assignee));
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: CommentType = {
        id: uuidv4(),
        content: newComment.trim(),
        author: currentUser,
        createdAt: new Date().toISOString(),
      };
      setComments(prev => [...prev, comment]);
      setNewComment('');
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Here you would typically upload the file to your storage service (e.g., Firebase Storage)
      // For this example, we'll just create a mock attachment
      const attachment: AttachmentType = {
        id: uuidv4(),
        name: file.name,
        url: URL.createObjectURL(file), // In a real app, this would be the download URL from your storage service
        uploadedAt: new Date().toISOString(),
      };
      setAttachments(prev => [...prev, attachment]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] bg-gray-800 text-white overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-grow">
          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task Title"
              className="bg-gray-700 text-white placeholder-gray-400 border-gray-600"
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task Description"
              className="bg-gray-700 text-white placeholder-gray-400 border-gray-600"
            />
            <div>
              <Label htmlFor="priority" className="text-white">Priority</Label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskType['priority'])}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-sm rounded-md bg-gray-700 text-white border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-gray-700 text-white border-gray-600"
            />
            <div>
              <Label htmlFor="status" className="text-white">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskType['status'])}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-sm rounded-md bg-gray-700 text-white border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Assignees</Label>
              <Input
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                onKeyDown={handleAddAssignee}
                placeholder="Type assignee name and press Enter"
                className="bg-gray-700 text-white placeholder-gray-400 border-gray-600"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {assignees.map(assignee => (
                  <div key={assignee} className="flex items-center bg-blue-900 text-blue-300 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                    {assignee}
                    <button
                      type="button"
                      onClick={() => handleRemoveAssignee(assignee)}
                      className="ml-1.5 text-blue-400 hover:text-blue-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Comments</Label>
              <div className="max-h-40 overflow-y-auto space-y-2 bg-gray-700 p-2 rounded">
                {comments.map(comment => (
                  <div key={comment.id} className="bg-gray-600 p-2 rounded">
                    <p className="text-sm font-medium text-blue-300">{comment.author}</p>
                    <p className="text-sm text-gray-300">{comment.content}</p>
                    <p className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-grow bg-gray-700 text-white placeholder-gray-400 border-gray-600"
                />
                <Button type="button" onClick={handleAddComment} className="ml-2 bg-blue-600 hover:bg-blue-700">
                  <Send size={16} />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="max-h-40 overflow-y-auto space-y-2 bg-gray-700 p-2 rounded">
                {attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center justify-between bg-gray-600 p-2 rounded">
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">
                      {attachment.name}
                    </a>
                    <span className="text-xs text-gray-400">{new Date(attachment.uploadedAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center">
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  className="flex-grow bg-gray-700 text-white border-gray-600"
                />
                <Button type="button" className="ml-2 bg-blue-600 hover:bg-blue-700">
                  <Paperclip size={16} />
                </Button>
              </div>
            </div>
          </form>
        </div>
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSubmit}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}