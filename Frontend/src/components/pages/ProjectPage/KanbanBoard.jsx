import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Button,
  TextField,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const initialData = {
  columns: {
    "column-1": { id: "column-1", title: "TO DO", taskIds: ["task-1"] },
    "column-2": { id: "column-2", title: "IN PROGRESS", taskIds: [] },
    "column-3": { id: "column-3", title: "DONE", taskIds: [] },
  },
  tasks: {
    "task-1": { id: "task-1", content: "Sample Task" },
  },
  columnOrder: ["column-1", "column-2", "column-3"],
};

const KanbanBoard = () => {
  const [data, setData] = useState(initialData);
  const [isAddingTask, setIsAddingTask] = useState(null);
  const [newTask, setNewTask] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const handleOpenMenu = (event, taskId) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(taskId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleDeleteTask = (taskId, columnId) => {
    setData((prevData) => {
      const newTasks = { ...prevData.tasks };
      delete newTasks[taskId];

      const newTaskIds = prevData.columns[columnId].taskIds.filter(
        (id) => id !== taskId
      );

      return {
        ...prevData,
        tasks: newTasks,
        columns: {
          ...prevData.columns,
          [columnId]: {
            ...prevData.columns[columnId],
            taskIds: newTaskIds,
          },
        },
      };
    });
    handleCloseMenu();
  };

  const handleAddTask = (columnId) => {
    if (!newTask.trim()) return;
    const newTaskId = `task-${Object.keys(data.tasks).length + 1}`;
    const newTaskObject = { id: newTaskId, content: newTask };

    setData((prevData) => ({
      ...prevData,
      tasks: { ...prevData.tasks, [newTaskId]: newTaskObject },
      columns: {
        ...prevData.columns,
        [columnId]: {
          ...prevData.columns[columnId],
          taskIds: [...prevData.columns[columnId].taskIds, newTaskId],
        },
      },
    }));
    setNewTask("");
    setIsAddingTask(null);
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId, type } = result;
    if (!destination) return;

    if (type === "COLUMN") {
      const newColumnOrder = Array.from(data.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      setData((prevData) => ({
        ...prevData,
        columnOrder: newColumnOrder,
      }));
      return;
    }

    const sourceColumn = data.columns[source.droppableId];
    const destColumn = data.columns[destination.droppableId];

    if (sourceColumn === destColumn) {
      const newTaskIds = Array.from(sourceColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...sourceColumn,
        taskIds: newTaskIds,
      };

      setData((prevData) => ({
        ...prevData,
        columns: {
          ...prevData.columns,
          [newColumn.id]: newColumn,
        },
      }));
    } else {
      const sourceTaskIds = Array.from(sourceColumn.taskIds);
      sourceTaskIds.splice(source.index, 1);

      const destTaskIds = Array.from(destColumn.taskIds);
      destTaskIds.splice(destination.index, 0, draggableId);

      setData((prevData) => ({
        ...prevData,
        columns: {
          ...prevData.columns,
          [sourceColumn.id]: {
            ...sourceColumn,
            taskIds: sourceTaskIds,
          },
          [destColumn.id]: {
            ...destColumn,
            taskIds: destTaskIds,
          },
        },
      }));
    }
  };

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    const newColIndex = data.columnOrder.length + 1;
    const newColumnId = `column-${newColIndex}`;

    setData((prevData) => ({
      ...prevData,
      columns: {
        ...prevData.columns,
        [newColumnId]: {
          id: newColumnId,
          title: newColumnTitle,
          taskIds: [],
        },
      },
      columnOrder: [...prevData.columnOrder, newColumnId],
    }));

    setNewColumnTitle("");
    setIsAddingColumn(false);
  };

  return (
    <Box p={2}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId="all-columns"
          direction="horizontal"
          type="COLUMN"
        >
          {(provided) => (
            <Box
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{
                display: "flex",
                gap: 2,
                overflowX: "auto",
              }}
            >
              {data.columnOrder.map((columnId, index) => {
                const column = data.columns[columnId];
                return (
                  <Draggable
                    key={column.id}
                    draggableId={column.id}
                    index={index}
                  >
                    {(providedColumn) => (
                      <Box
                        ref={providedColumn.innerRef}
                        {...providedColumn.draggableProps}
                        {...providedColumn.dragHandleProps}
                        sx={{
                          backgroundColor: "#f4f5f7",
                          borderRadius: "8px",
                          padding: 2,
                          minWidth: "300px",
                          maxWidth: "300px",
                          flexShrink: 0,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ mb: 2, fontWeight: "bold" }}
                        >
                          {column.title}
                        </Typography>

                        <Droppable droppableId={column.id} type="TASK">
                          {(providedTask) => (
                            <Box
                              {...providedTask.droppableProps}
                              ref={providedTask.innerRef}
                              sx={{ minHeight: "300px" }}
                            >
                              {column.taskIds.map((taskId, idx) => {
                                const task = data.tasks[taskId];
                                return (
                                  <Draggable
                                    key={task.id}
                                    draggableId={task.id}
                                    index={idx}
                                  >
                                    {(providedDraggable) => (
                                      <Card
                                        ref={providedDraggable.innerRef}
                                        {...providedDraggable.draggableProps}
                                        {...providedDraggable.dragHandleProps}
                                        sx={{
                                          mb: 2,
                                          backgroundColor: "#ffffff",
                                        }}
                                      >
                                        <CardContent
                                          sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                          }}
                                        >
                                          <Typography>
                                            {task.content}
                                          </Typography>
                                          <IconButton
                                            size="small"
                                            onClick={(e) =>
                                              handleOpenMenu(e, task.id)
                                            }
                                          >
                                            <MoreVertIcon />
                                          </IconButton>
                                          <Menu
                                            anchorEl={anchorEl}
                                            open={
                                              Boolean(anchorEl) &&
                                              selectedTask === task.id
                                            }
                                            onClose={handleCloseMenu}
                                          >
                                            <MenuItem
                                              onClick={() =>
                                                handleDeleteTask(
                                                  task.id,
                                                  column.id
                                                )
                                              }
                                            >
                                              Delete Task
                                            </MenuItem>
                                          </Menu>
                                        </CardContent>
                                      </Card>
                                    )}
                                  </Draggable>
                                );
                              })}
                              {providedTask.placeholder}
                            </Box>
                          )}
                        </Droppable>

                        {isAddingTask === column.id ? (
                          <Box mt={2}>
                            <TextField
                              placeholder="What needs to be done?"
                              value={newTask}
                              onChange={(e) => setNewTask(e.target.value)}
                              size="small"
                              fullWidth
                            />
                            <Box
                              display="flex"
                              justifyContent="flex-end"
                              mt={1}
                            >
                              <Button
                                onClick={() => handleAddTask(column.id)}
                                variant="contained"
                                size="small"
                                sx={{ mr: 1 }}
                              >
                                Create
                              </Button>
                              <Button
                                onClick={() => setIsAddingTask(null)}
                                variant="outlined"
                                size="small"
                              >
                                Cancel
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Button
                            onClick={() => setIsAddingTask(column.id)}
                            variant="text"
                            sx={{ mt: 2, textTransform: "none" }}
                          >
                            + Create
                          </Button>
                        )}
                      </Box>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}

              {isAddingColumn ? (
                <Box
                  sx={{
                    backgroundColor: "#f4f5f7",
                    borderRadius: "8px",
                    padding: 2,
                    minWidth: "300px",
                    maxWidth: "300px",
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <TextField
                    placeholder="New Column Name"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    size="small"
                  />
                  <Box display="flex" justifyContent="flex-end" gap={1}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleAddColumn}
                    >
                      Create
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setIsAddingColumn(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    backgroundColor: "#f4f5f7",
                    borderRadius: "8px",
                    padding: 2,
                    minWidth: "150px",
                    height: "fit-content",
                    flexShrink: 0,
                  }}
                >
                  <Button
                    variant="text"
                    onClick={() => setIsAddingColumn(true)}
                    sx={{ textTransform: "none" }}
                  >
                    + Add Column
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
};

export default KanbanBoard;
