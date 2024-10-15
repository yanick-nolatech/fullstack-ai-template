# Task Manager with Real-Time Collaboration App

## Frontend requirements

- A board with columns and tasks
- Drag and drop functionality for tasks between columns.
 -Drag and drop functionality for reordering columns.
-Ability to add new tasks and columns.
- Ability to edit task details (title, description, priority, due date).
- Ability to delete tasks and columns.
- Color-coding of tasks based on priority.
- Basic styling and layout.
- Minimalistic and modern look.
- The delete and add buttons should be icons.
- nice dark blue theme.

I want the home page to match the styling and animations from the code below. Feel free to use the code as a template to generate the frontend.

```tsx
"use client"

import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { PlusCircle, Trash2, Edit2, Calendar, UserPlus, Paperclip, MessageSquare } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Task = {
  id: string
  title: string
  description: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  dueDate: string
  status: 'To Do' | 'In Progress' | 'Done'
}

type Column = {
  id: string
  title: string
  taskIds: string[]
}

export default function Board() {
  const [tasks, setTasks] = useState<{ [key: string]: Task }>({
    'task-1': { id: 'task-1', title: 'Create login page', description: 'Implement user authentication', priority: 'High', dueDate: '2023-07-30', status: 'To Do' },
    'task-2': { id: 'task-2', title: 'Design database schema', description: 'Create ERD for the application', priority: 'Medium', dueDate: '2023-08-15', status: 'In Progress' },
    'task-3': { id: 'task-3', title: 'Write unit tests', description: 'Increase code coverage to 80%', priority: 'Low', dueDate: '2023-08-30', status: 'To Do' },
  })

  const [columns, setColumns] = useState<{ [key: string]: Column }>({
    'column-1': { id: 'column-1', title: 'To Do', taskIds: ['task-1', 'task-3'] },
    'column-2': { id: 'column-2', title: 'In Progress', taskIds: ['task-2'] },
    'column-3': { id: 'column-3', title: 'Done', taskIds: [] },
  })

  const [columnOrder, setColumnOrder] = useState(['column-1', 'column-2', 'column-3'])

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result

    if (!destination) {
      return
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    if (type === 'column') {
      const newColumnOrder = Array.from(columnOrder)
      newColumnOrder.splice(source.index, 1)
      newColumnOrder.splice(destination.index, 0, draggableId)

      setColumnOrder(newColumnOrder)
      return
    }

    const start = columns[source.droppableId]
    const finish = columns[destination.droppableId]

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds)
      newTaskIds.splice(source.index, 1)
      newTaskIds.splice(destination.index, 0, draggableId)

      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      }

      setColumns({
        ...columns,
        [newColumn.id]: newColumn,
      })
    } else {
      const startTaskIds = Array.from(start.taskIds)
      startTaskIds.splice(source.index, 1)
      const newStart = {
        ...start,
        taskIds: startTaskIds,
      }

      const finishTaskIds = Array.from(finish.taskIds)
      finishTaskIds.splice(destination.index, 0, draggableId)
      const newFinish = {
        ...finish,
        taskIds: finishTaskIds,
      }

      setColumns({
        ...columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      })

      setTasks({
        ...tasks,
        [draggableId]: { ...tasks[draggableId], status: finish.title as Task['status'] },
      })
    }
  }

  const addTask = (columnId: string) => {
    const newTaskId = `task-${Date.now()}`
    const newTask: Task = {
      id: newTaskId,
      title: 'New Task',
      description: '',
      priority: 'Medium',
      dueDate: '',
      status: columns[columnId].title as Task['status'],
    }

    setTasks({ ...tasks, [newTaskId]: newTask })
    setColumns({
      ...columns,
      [columnId]: { ...columns[columnId], taskIds: [...columns[columnId].taskIds, newTaskId] },
    })
  }

  const deleteTask = (taskId: string, columnId: string) => {
    const newTasks = { ...tasks }
    delete newTasks[taskId]
    setTasks(newTasks)

    const newColumns = { ...columns }
    newColumns[columnId].taskIds = newColumns[columnId].taskIds.filter(id => id !== taskId)
    setColumns(newColumns)
  }

  const addColumn = () => {
    const newColumnId = `column-${Date.now()}`
    const newColumn: Column = {
      id: newColumnId,
      title: 'New Column',
      taskIds: [],
    }

    setColumns({ ...columns, [newColumnId]: newColumn })
    setColumnOrder([...columnOrder, newColumnId])
  }

  const deleteColumn = (columnId: string) => {
    const newColumns = { ...columns }
    delete newColumns[columnId]
    setColumns(newColumns)

    const newColumnOrder = columnOrder.filter(id => id !== columnId)
    setColumnOrder(newColumnOrder)

    // Delete all tasks in the column
    const tasksToDelete = columns[columnId].taskIds
    const newTasks = { ...tasks }
    tasksToDelete.forEach(taskId => delete newTasks[taskId])
    setTasks(newTasks)
  }

  const updateTask = (taskId: string, updatedTask: Partial<Task>) => {
    setTasks({ ...tasks, [taskId]: { ...tasks[taskId], ...updatedTask } })
  }

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
              {columnOrder.map((columnId, index) => {
                const column = columns[columnId]
                const columnTasks = column.taskIds.map(taskId => tasks[taskId])

                return (
                  <Draggable key={column.id} draggableId={column.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-gray-800 p-4 rounded-lg min-w-[300px]"
                      >
                        <div {...provided.dragHandleProps} className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-semibold">{column.title}</h2>
                          <Button variant="ghost" size="icon" onClick={() => deleteColumn(column.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Droppable droppableId={column.id} type="task">
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                              {columnTasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided) => (
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
                                    >
                                      <div className="flex justify-between items-start">
                                        <h3 className="font-medium">{task.title}</h3>
                                        <div className="flex space-x-2">
                                          <Dialog>
                                            <DialogTrigger asChild>
                                              <Button variant="ghost" size="icon">
                                                <Edit2 className="h-4 w-4" />
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                              <DialogHeader>
                                                <DialogTitle>Edit Task</DialogTitle>
                                              </DialogHeader>
                                              <div className="space-y-4">
                                                <Input
                                                  value={task.title}
                                                  onChange={(e) => updateTask(task.id, { title: e.target.value })}
                                                  placeholder="Task Title"
                                                />
                                                <Textarea
                                                  value={task.description}
                                                  onChange={(e) => updateTask(task.id, { description: e.target.value })}
                                                  placeholder="Task Description"
                                                />
                                                <Select
                                                  value={task.priority}
                                                  onValueChange={(value) => updateTask(task.id, { priority: value as Task['priority'] })}
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
                                                  value={task.dueDate}
                                                  onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                                                />
                                              </div>
                                            </DialogContent>
                                          </Dialog>
                                          <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id, column.id)}>
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                      <div className="mt-2 text-sm text-gray-400">{task.description}</div>
                                      <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                                        <div className="flex space-x-2">
                                          <Calendar className="h-4 w-4" />
                                          <span>{task.dueDate}</span>
                                        </div>
                                        <div className="flex space-x-2">
                                          <UserPlus className="h-4 w-4" />
                                          <Paperclip className="h-4 w-4" />
                                          <MessageSquare className="h-4 w-4" />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
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
                )
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
```
