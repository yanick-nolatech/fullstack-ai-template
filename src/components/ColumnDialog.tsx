import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ColumnType } from '@/lib/types';

interface ColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (columnData: Partial<ColumnType>) => Promise<void>;
  column: ColumnType | null;
}

export default function ColumnDialog({ isOpen, onClose, onSave, column }: ColumnDialogProps) {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (column) {
      setTitle(column.title);
    } else {
      setTitle('');
    }
  }, [column]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ title });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{column ? 'Edit Column' : 'Add New Column'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Column Title"
          />
          <Button type="submit">Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
