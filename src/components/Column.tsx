import React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import Task from './Task';
import { ColumnType, TaskType } from '@/lib/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ColumnProps {
  column: ColumnType;
  tasks: TaskType[];
  index: number;
  updateColumn: (columnId: string, updates: Partial<ColumnType>) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
  addTask: (columnId: string) => void;
  updateTask: (taskId: string, updates: Partial<TaskType>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  openColumnDialog: (column: ColumnType) => void;
  openTaskDialog: (task: TaskType | null, columnId: string) => void;
}

export default function Column({
  column,
  tasks,
  index,
  updateColumn,
  deleteColumn,
  addTask,
  updateTask,
  deleteTask,
  openColumnDialog,
  openTaskDialog
}: ColumnProps) {
  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="bg-gray-800 p-4 rounded-lg min-w-[300px]"
        >
          <div {...provided.dragHandleProps} className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{column.title}</h2>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={() => openColumnDialog(column)}>
                <PlusCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => deleteColumn(column.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Droppable droppableId={column.id} type="task">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-2 min-h-[100px] ${
                  snapshot.isDraggingOver ? 'bg-gray-700' : ''
                }`}
              >
                {tasks.map((task, index) => (
                  <Task
                    key={task.id}
                    task={task}
                    index={index}
                    updateTask={updateTask}
                    deleteTask={deleteTask}
                    openTaskDialog={openTaskDialog}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <Button onClick={() => addTask(column.id)} className="w-full mt-4">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      )}
    </Draggable>
  );
}
