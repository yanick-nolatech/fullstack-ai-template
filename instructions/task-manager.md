# Task Manager with Real-Time Collaboration App

## Path system prompt

You are an expert in TypeScript, Next.js App Router, React, and Tailwind. Follow @Next.js docs for Data Fetching, Rendering, and Routing.

## App description

Build a task management app (similar to Trello or Asana) where users can create, assign, and track tasks in real-time.

## App flow and functionality

The flow of the app is as follows:

- User opens the app, and there is a board with tasks divided into columns for each stage of the task (e.g. "To Do", "In Progress", "Done").
- Users can create new tasks, edit existing tasks, delete and move tasks between columns.
- Users can create new, edit, update and delete columns. If a column if deleted, all tasks within that columns are deleted.
- If the user clicks a task card, they can view and edit the task details.
- Users can assign tasks to themselves or other users, tasks can be assigned to one or multiple users from a team.
- Users can add comments to tasks.
- Users can add attachments to tasks.
- Users can set and update task priorities (e.g., Urgent, High, Medium, Low).
- Users can set deadlines for tasks and display countdown timers to the due date.
- Users Categorize tasks using labels or tags (e.g., "Urgent", "Bug", "Feature").
- If they task is completed, then the color of task card changes to green. However, if the task is delayed passed the due date, then the color of task card changes to red.
- Users can drag and drop tasks between different statuses or project columns.
- Users can drag and drop columns to change the order they appear

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

This application is set-up with existing configuration for Firebase. Implement all the functionality in the flow above while using the existing codebase as a starting point, but fully modify the codebase to fit the flow and functionality described above.

@Codebase
