"use client";

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Column from './Column';
import { ColumnType, TaskType } from '@/lib/types';
import { initializeFirebase, db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  Firestore,
  writeBatch
} from 'firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import ColumnDialog from './ColumnDialog';
import TaskDialog from './TaskDialog';

export default function Board() {
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const { user } = useAuth();
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<ColumnType | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [firestore, setFirestore] = useState<Firestore | null>(null);

  useEffect(() => {
    const fs = initializeFirebase();
    setFirestore(fs);
  }, []);

  useEffect(() => {
    if (!user || !firestore) return;

    const columnsQuery = query(collection(firestore, 'columns'), orderBy('order'));
    const unsubscribeColumns = onSnapshot(columnsQuery, (snapshot) => {
      const columnsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ColumnType));
      setColumns(columnsData);
    });

    const tasksQuery = query(collection(firestore, 'tasks'));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaskType));
      setTasks(tasksData);
    });

    return () => {
      unsubscribeColumns();
      unsubscribeTasks();
    };
  }, [user, firestore]);

  const updateTask = async (taskId: string, updates: Partial<TaskType>) => {
    if (!firestore) return;
    await updateDoc(doc(firestore, 'tasks', taskId), updates);
  };

  const deleteTask = async (taskId: string) => {
    if (!firestore) return;
    await deleteDoc(doc(firestore, 'tasks', taskId));
  };

  const addColumn = async () => {
    if (!firestore) return;
    const newColumn: Partial<ColumnType> = {
      title: 'New Column',
      taskIds: [],
      order: columns.length,
    };
    await addDoc(collection(firestore, 'columns'), newColumn);
  };

  const updateColumn = async (columnId: string, updates: Partial<ColumnType>) => {
    if (!firestore) return;
    await updateDoc(doc(firestore, 'columns', columnId), updates);
  };

  const deleteColumn = async (columnId: string) => {
    if (!firestore) return;
    await deleteDoc(doc(firestore, 'columns', columnId));
    // You may want to delete all tasks associated with this column as well
  };

  const handleColumnSave = async (columnData: Partial<ColumnType>) => {
    if (editingColumn) {
      await updateColumn(editingColumn.id, columnData);
    } else {
      await addColumn();
    }
    setIsColumnDialogOpen(false);
  };

  const openTaskDialog = (task: TaskType | null, columnId: string) => {
    setEditingTask(task);
    setEditingColumnId(columnId);
    setIsTaskDialogOpen(true);
  };

  const handleTaskSave = async (taskData: Partial<TaskType>) => {
    if (!firestore) return;
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
    } else {
      const newTask: Partial<TaskType> = {
        ...taskData,
        columnId: editingColumnId,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(firestore, 'tasks'), newTask);
      const newTaskWithId = { id: docRef.id, ...newTask } as TaskType;
      setTasks([...tasks, newTaskWithId]);

      // Update the column's taskIds
      const updatedColumn = columns.find(col => col.id === editingColumnId);
      if (updatedColumn) {
        const updatedTaskIds = [...updatedColumn.taskIds, docRef.id];
        await updateDoc(doc(firestore, 'columns', editingColumnId), { taskIds: updatedTaskIds });
      }
    }
    setIsTaskDialogOpen(false);
    setEditingColumnId(null);
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

      const updatedColumns = newColumnOrder.map((col, index) => ({
        ...col,
        order: index,
      }));

      setColumns(updatedColumns);

      // Update the order in Firestore
      const batch = firestore ? firestore.batch() : null;
      updatedColumns.forEach((col) => {
        if (firestore && batch) {
          const colRef = doc(firestore, 'columns', col.id);
          batch.update(colRef, { order: col.order });
        }
      });
      if (batch) await batch.commit();

      return;
    }

    // Moving tasks
    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);

    if (sourceColumn && destColumn) {
      if (sourceColumn.id === destColumn.id) {
        // Moving within the same column
        const newTaskIds = Array.from(sourceColumn.taskIds);
        newTaskIds.splice(source.index, 1);
        newTaskIds.splice(destination.index, 0, draggableId);

        const updatedColumn = {
          ...sourceColumn,
          taskIds: newTaskIds,
        };

        setColumns(columns.map(col => 
          col.id === updatedColumn.id ? updatedColumn : col
        ));

        // Update in Firestore
        if (firestore) {
          await updateDoc(doc(firestore, 'columns', updatedColumn.id), {
            taskIds: newTaskIds,
          });
        }
      } else {
        // Moving to a different column
        const sourceTaskIds = Array.from(sourceColumn.taskIds);
        sourceTaskIds.splice(source.index, 1);
        const newSourceColumn = {
          ...sourceColumn,
          taskIds: sourceTaskIds,
        };

        const destTaskIds = Array.from(destColumn.taskIds || []);
        destTaskIds.splice(destination.index, 0, draggableId);
        const newDestColumn = {
          ...destColumn,
          taskIds: destTaskIds,
        };

        setColumns(columns.map(col => 
          col.id === newSourceColumn.id ? newSourceColumn :
          col.id === newDestColumn.id ? newDestColumn : col
        ));

        // Update task's columnId
        setTasks(tasks.map(task =>
          task.id === draggableId ? { ...task, columnId: destColumn.id } : task
        ));

        // Update in Firestore
        if (firestore) {
          const batch = writeBatch(firestore);
          batch.update(doc(firestore, 'columns', newSourceColumn.id), {
            taskIds: sourceTaskIds,
          });
          batch.update(doc(firestore, 'columns', newDestColumn.id), {
            taskIds: destTaskIds,
          });
          batch.update(doc(firestore, 'tasks', draggableId), {
            columnId: newDestColumn.id,
          });
          await batch.commit();
        }
      }
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
                  updateColumn={updateColumn}
                  deleteColumn={deleteColumn}
                  addTask={(columnId) => openTaskDialog(null, columnId)}
                  updateTask={updateTask}
                  deleteTask={deleteTask}
                  openColumnDialog={(column) => {
                    setEditingColumn(column);
                    setIsColumnDialogOpen(true);
                  }}
                  openTaskDialog={openTaskDialog}
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
        task={editingTask}
        onSave={handleTaskSave}
        columnId={editingColumnId}
      />
    </div>
  );
}