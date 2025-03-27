import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import axios from "axios";
import AddTaskModal from "./AddTask";

const url = import.meta.env.VITE_BACKEND_URL;

const styles = {
  container: {
    padding: "32px 22px",
    maxWidth: "calc(100% - 44px)",
    margin: "0 auto",
    zoom: "0.85",
  },
  headerWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "22px",
  },
  headerTitle: {
    fontFamily: "Inter, sans-serif",
    fontSize: "20px",
    fontWeight: "700",
    lineHeight: "28px",
    margin: 0,
  },
  headerDescription: {
    fontFamily: "Inter, sans-serif",
    fontSize: "14px",
    fontWeight: "400",
    color: "#6B7280",
    marginTop: "4px",
  },
  addButton: {
    fontFamily: "Inter, sans-serif",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "#4F46E5",
    color: "#FFFFFF",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "20px",
    cursor: "pointer",
    border: "none",
  },
  boardWrapper: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    alignItems: "flex-start",
    overflowX: "auto",
  },
  column: {
    background: "#F8F9FA",
    padding: "16px",
    borderRadius: "10px",
    minWidth: "270px",
    minHeight: "200px",
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
    transition: "background 0.3s ease",
    flex: "1",
  },
  columnTitleWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  columnTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
    fontFamily: "Inter, sans-serif",
  },
  columnCount: {
    fontSize: "13px",
    fontWeight: "400",
    color: "#9CA3AF",
    fontFamily: "Inter, sans-serif",
  },
  taskCard: {
    background: "#FFFFFF",
    padding: "16px",
    borderRadius: "10px",
    marginBottom: "12px",
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
    fontFamily: "Inter, sans-serif",
    transition: "all 0.2s ease",
  },
  taskHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
  },
  tag: {
    fontSize: "12px",
    padding: "2px 8px",
    borderRadius: "4px",
    fontWeight: "600",
  },
  dueDate: {
    fontSize: "12px",
    color: "#6B7280",
  },
  taskTitle: {
    fontSize: "15px",
    fontWeight: "600",
    margin: "4px 0",
    color: "#111827",
  },
  taskDesc: {
    fontSize: "14px",
    color: "#6B7280",
    marginBottom: "10px",
  },
  taskFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commentCount: {
    fontSize: "13px",
    color: "#6B7280",
  },
};

const getTagColor = (label) => {
  switch (label) {
    case "QA": return "#BFDBFE";
    case "Dev": return "#D1FAE5";
    case "Design": return "#E9D5FF";
    case "Research": return "#FDE68A";
    default: return "#E5E7EB";
  }
};

const getTagTextColor = (bgColor) => {
  return {
    "#BFDBFE": "#1E3A8A",
    "#D1FAE5": "#065F46",
    "#E9D5FF": "#6B21A8",
    "#FDE68A": "#92400E",
    "#E5E7EB": "#374151"
  }[bgColor] || "#111827";
};

const Task = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${url}/api/task`);
      setTasks(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleTaskCreated = async () => {
    try {
      const response = await axios.get(`${url}/api/task`);
      setTasks(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceTasks = tasks.filter(task => task.task_status === source.droppableId);
    const destinationTasks = tasks.filter(task => task.task_status === destination.droppableId);
    const [movedTask] = sourceTasks.splice(source.index, 1);
    movedTask.task_status = destination.droppableId;

    if (source.droppableId === destination.droppableId) {
      sourceTasks.splice(destination.index, 0, movedTask);
      const otherTasks = tasks.filter(task => task.task_status !== source.droppableId);
      setTasks([...otherTasks, ...sourceTasks]);
    } else {
      destinationTasks.splice(destination.index, 0, movedTask);
      const otherTasks = tasks.filter(task => task.task_status !== source.droppableId && task.task_status !== destination.droppableId);
      setTasks([...otherTasks, ...sourceTasks, ...destinationTasks]);
    }

    try {
      await axios.put(`${url}/api/task/${movedTask.task_id}`, {
        task_status: destination.droppableId,
      });
    } catch (error) {
      console.error("Failed to update task status:", error);
      fetchTasks();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerWrapper}>
        <div>
          <h1 style={styles.headerTitle}>Projects/Website Redesign Project</h1>
          <p style={styles.headerDescription}>
            Manage tasks and monitor progress efficiently.
          </p>
        </div>
        <button style={styles.addButton} onClick={() => setIsModalOpen(true)}>
          + Add Task
        </button>
      </div>

      {isModalOpen && <AddTaskModal onClose={() => setIsModalOpen(false)} onTaskCreated={handleTaskCreated} />}

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={styles.boardWrapper}>
          {["To Do", "In Progress", "Review", "Done"].map((status) => {
            const taskCount = tasks.filter((task) => task.task_status === status).length;
            return (
              <Droppable key={status} droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      ...styles.column,
                      background: snapshot.isDraggingOver ? "#E3E8EF" : "#F8F9FA",
                    }}
                  >
                    <div style={styles.columnTitleWrapper}>
                      <span style={styles.columnTitle}>{status}</span>
                      <span style={styles.columnCount}>{taskCount}</span>
                    </div>
                    {tasks.filter((task) => task.task_status === status).map((task, index) => {
                      const bgColor = getTagColor(task.task_label);
                      const textColor = getTagTextColor(bgColor);
                      return (
                        <Draggable key={task.task_id} draggableId={task.task_id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...styles.taskCard,
                                boxShadow: snapshot.isDragging ? "0px 4px 8px rgba(0, 0, 0, 0.15)" : styles.taskCard.boxShadow,
                                transform: snapshot.isDragging ? "scale(1.03)" : "scale(1)",
                                ...provided.draggableProps.style,
                              }}
                            >
                              <div style={styles.taskHeader}>
                                <span style={{
                                  ...styles.tag,
                                  backgroundColor: bgColor,
                                  color: textColor,
                                }}>{task.task_label}</span>
                                <span style={styles.dueDate}>Due {formatDate(task.task_due_date)}</span>
                              </div>
                              <h3 style={styles.taskTitle}>{task.task_name}</h3>
                              <p style={styles.taskDesc}>{task.task_description}</p>
                              <div style={styles.taskFooter}>
                                <span style={styles.commentCount}>💬 {task.task_comments || 0}</span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Task;
