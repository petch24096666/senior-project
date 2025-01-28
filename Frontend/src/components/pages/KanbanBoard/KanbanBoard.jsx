import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from "@mui/material";

const initialData = {
  columns: {
    "column-1": { id: "column-1", title: "To Do", taskIds: ["task-1", "task-2"] },
    "column-2": { id: "column-2", title: "In Progress", taskIds: ["task-3"] },
    "column-3": { id: "column-3", title: "Review", taskIds: ["task-4"] },
    "column-4": { id: "column-4", title: "Done", taskIds: ["task-5"] },
  },
  tasks: {
    "task-1": { id: "task-1", content: "Redesign homepage layout" },
    "task-2": { id: "task-2", content: "User interview sessions" },
    "task-3": { id: "task-3", content: "API Integration" },
    "task-4": { id: "task-4", content: "Bug testing" },
    "task-5": { id: "task-5", content: "User authentication" },
  },
  columnOrder: ["column-1", "column-2", "column-3", "column-4"],
};

const KanbanBoard = () => {
  const [data, setData] = useState(initialData);

  const handleDragEnd = (result) => {
  const { source, destination, draggableId, type } = result;
  if (!destination) return;

  if (type === "COLUMN") {
    const newColumnOrder = Array.from(data.columnOrder);
    const [movedColumn] = newColumnOrder.splice(source.index, 1);
    newColumnOrder.splice(destination.index, 0, movedColumn);

    setData((prevData) => ({
      ...prevData,
      columnOrder: newColumnOrder,
    }));
  } else {
    const sourceColumn = data.columns[source.droppableId];
    const destColumn = data.columns[destination.droppableId];

    // Clone the source task IDs and remove the dragged task
    const sourceTaskIds = [...sourceColumn.taskIds];
    sourceTaskIds.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceTaskIds.splice(destination.index, 0, draggableId);

      setData((prevData) => ({
        ...prevData,
        columns: {
          ...prevData.columns,
          [sourceColumn.id]: { ...sourceColumn, taskIds: sourceTaskIds },
        },
      }));
    } else {
      // Move the task to a different column
      const destTaskIds = [...destColumn.taskIds];
      destTaskIds.splice(destination.index, 0, draggableId);

      setData((prevData) => ({
        ...prevData,
        columns: {
          ...prevData.columns,
          [sourceColumn.id]: { ...sourceColumn, taskIds: sourceTaskIds },
          [destColumn.id]: { ...destColumn, taskIds: destTaskIds },
        },
      }));
    }
  }
};

  return (
<Box p={3}>
<Typography variant="h4" fontWeight="bold" sx={{ fontFamily: "Inter, sans-serif", fontSize: "24px", fontWeight: "700", lineHeight: "24px", margin: 0 }}>Projects/Website Redesign Project</Typography>
  <Typography variant="subtitle1" sx={{ fontFamily: "Inter, sans-serif", fontSize: "16px", fontWeight: "400", lineHeight: "20px", color: "#6B7280", marginTop: "8px" }}>Manage tasks and monitor progress efficiently.</Typography>
  <Box sx={{ overflowX: "auto", mt: 3 }}>
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
        {(provided) => (
          <Box {...provided.droppableProps} ref={provided.innerRef} sx={{ display: "flex", gap: 3 }}>
            {data.columnOrder.map((columnId, index) => {
              const column = data.columns[columnId];
              return (
                <Draggable key={column.id} draggableId={column.id} index={index}>
                  {(providedColumn) => (
                    <Box ref={providedColumn.innerRef} {...providedColumn.draggableProps} {...providedColumn.dragHandleProps} sx={{ backgroundColor: "#f4f5f7", borderRadius: "8px", padding: 2, minWidth: "300px", flexShrink: 0 }}>
                      <Typography variant="h6" fontWeight="bold">{column.title}</Typography>
                      <Droppable droppableId={column.id} type="TASK">
                        {(providedTask) => (
                          <Box ref={providedTask.innerRef} {...providedTask.droppableProps} sx={{ minHeight: "100px" }}>
                            {column.taskIds.map((taskId, idx) => (
                              <Draggable key={taskId} draggableId={taskId} index={idx}>
                                {(providedTaskItem) => (
                                  <Card ref={providedTaskItem.innerRef} {...providedTaskItem.draggableProps} {...providedTaskItem.dragHandleProps} sx={{ mb: 2, backgroundColor: "#fff", boxShadow: 1 }}>
                                    <CardContent>
                                      <Typography>{data.tasks[taskId].content}</Typography>
                                    </CardContent>
                                  </Card>
                                )}
                              </Draggable>
                            ))}
                            {providedTask.placeholder}
                          </Box>
                        )}
                      </Droppable>
                    </Box>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  </Box>
</Box>
  );
};

export default KanbanBoard;
