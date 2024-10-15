import React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import Task from './Task';
import { ColumnType, TaskType } from '@/lib/types';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ColumnProps {
  column: ColumnType;
  tasks: TaskType[];
  index: number;
  onAddTask: (columnId: string) => void;
  onEditTask: (task: TaskType) => void;
  onDeleteTask: (taskId: string, columnId: string) => void;
  onEditColumn: (column: ColumnType) => void;
  onDeleteColumn: (columnId: string) => void;
  onTaskClick: (task: TaskType) => void;
}

export default function Column({
  column,
  tasks,
  index,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onEditColumn,
  onDeleteColumn,
  onTaskClick
}: ColumnProps) {
  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="bg-gray-800 p-4 rounded-lg shadow-lg min-w-[300px]"
        >
          <div {...provided.dragHandleProps} className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">{column.title}</h2>
            <div>
              <Button onClick={() => onEditColumn(column)} size="sm" variant="ghost">
                <Edit2 size={16} />
              </Button>
              <Button onClick={() => onDeleteColumn(column.id)} size="sm" variant="ghost" className="text-red-500">
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
          <Droppable droppableId={column.id} type="task">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {tasks.map((task, index) => (
                  <Task
                    key={task.id}
                    task={task}
                    index={index}
                    onEdit={() => onEditTask(task)}
                    onDelete={() => onDeleteTask(task.id, column.id)}
                    onClick={() => onTaskClick(task)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <Button onClick={() => onAddTask(column.id)} className="w-full mt-4">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      )}
    </Draggable>
  );
}
