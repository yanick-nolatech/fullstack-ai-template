"use client";

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Column from './Column';
import { ColumnType, TaskType } from '@/lib/types';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import ColumnDialog from './ColumnDialog';
import TaskDetailDialog from './TaskDetailDialog';
import TaskDialog from './TaskDialog';

export default function Board() {
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<ColumnType | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [isTaskDetailDialogOpen, setIsTaskDetailDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);

  useEffect(() => {
    const columnsQuery = query(collection(db, 'columns'), orderBy('order'));
    const tasksQuery = query(collection(db, 'tasks'));

    const unsubscribeColumns = onSnapshot(columnsQuery, (snapshot) => {
      const columnsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ColumnType));
      setColumns(columnsData);
    });

    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaskType));
      setTasks(tasksData);
    });

    return () => {
      unsubscribeColumns();
      unsubscribeTasks();
    };
  }, []);

  const addColumn = () => {
    setIsColumnDialogOpen(true);
    setEditingColumn(null);
  };

  const addTask = (columnId: string) => {
    setIsTaskDialogOpen(true);
    setEditingTask(null);
    setEditingColumnId(columnId);
  };

  const handleColumnSave = async (columnData: Partial<ColumnType>) => {
    if (editingColumn) {
      await updateDoc(doc(db, 'columns', editingColumn.id), columnData);
    } else {
      await addDoc(collection(db, 'columns'), {
        ...columnData,
        order: columns.length,
      });
    }
    setIsColumnDialogOpen(false);
    setEditingColumn(null);
  };

  const handleTaskSave = async (taskData: Partial<TaskType>) => {
    if (editingTask) {
      await updateDoc(doc(db, 'tasks', editingTask.id), taskData);
    } else if (editingColumnId) {
      await addDoc(collection(db, 'tasks'), {
        ...taskData,
        columnId: editingColumnId,
        status: 'To Do',
      });
    }
    setIsTaskDialogOpen(false);
    setIsTaskDetailDialogOpen(false);
    setEditingTask(null);
    setEditingColumnId(null);
  };

  const handleColumnDelete = async (columnId: string) => {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'columns', columnId));
    
    const tasksToDelete = tasks.filter(task => task.columnId === columnId);
    tasksToDelete.forEach(task => {
      batch.delete(doc(db, 'tasks', task.id));
    });

    await batch.commit();
  };

  const handleTaskDelete = async (taskId: string) => {
    await deleteDoc(doc(db, 'tasks', taskId));
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'column') {
      const newColumnOrder = Array.from(columns);
      const [reorderedColumn] = newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, reorderedColumn);

      const batch = writeBatch(db);
      newColumnOrder.forEach((column, index) => {
        batch.update(doc(db, 'columns', column.id), { order: index });
      });
      await batch.commit();

      return;
    }

    const startColumn = columns.find(col => col.id === source.droppableId);
    const finishColumn = columns.find(col => col.id === destination.droppableId);

    if (!startColumn || !finishColumn) {
      return;
    }

    if (startColumn === finishColumn) {
      // Reordering within the same column
      await updateDoc(doc(db, 'tasks', draggableId), {
        columnId: finishColumn.id,
      });
    } else {
      // Moving from one column to another
      await updateDoc(doc(db, 'tasks', draggableId), {
        columnId: finishColumn.id,
        status: finishColumn.title as TaskType['status'],
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Task Management Board</h1>
      <Button onClick={addColumn} className="mb-4">
        <PlusCircle className="mr-2 h-4 w-4" /> Add Column
      </Button>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="flex space-x-4 overflow-x-auto pb-4">
              {columns.map((column, index) => (
                <Column
                  key={column.id}
                  column={column}
                  tasks={tasks.filter(task => task.columnId === column.id)}
                  index={index}
                  onAddTask={addTask}
                  onEditTask={(task) => {
                    setEditingTask(task);
                    setIsTaskDialogOpen(true);
                  }}
                  onDeleteTask={handleTaskDelete}
                  onEditColumn={() => {
                    setEditingColumn(column);
                    setIsColumnDialogOpen(true);
                  }}
                  onDeleteColumn={handleColumnDelete}
                  onTaskClick={(task) => {
                    setSelectedTask(task);
                    setIsTaskDetailDialogOpen(true);
                  }}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <ColumnDialog
        isOpen={isColumnDialogOpen}
        onClose={() => setIsColumnDialogOpen(false)}
        onSave={handleColumnSave}
        column={editingColumn}
      />
      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        onSave={handleTaskSave}
        task={editingTask}
      />
      <TaskDetailDialog
        isOpen={isTaskDetailDialogOpen}
        onClose={() => setIsTaskDetailDialogOpen(false)}
        onSave={handleTaskSave}
        task={selectedTask}
        currentUser="Current User" // Replace with actual current user
      />
    </div>
  );
}
