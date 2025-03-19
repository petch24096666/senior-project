import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import axios from "axios";
import AddTaskModal from "./AddTask"; // นำเข้าคอมโพเนนต์ AddTaskModal

const url = import.meta.env.VITE_BACKEND_URL;

const Task = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // โหลดข้อมูลจากเซิร์ฟเวอร์
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${url}/api/task`);
      setTasks(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ฟังก์ชันเพิ่ม Task และให้มันอยู่ด้านบนสุด
  const handleTaskCreated = async (newTask) => {
    try {
      const response = await axios.get(`${url}/api/task`);
      setTasks(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // ฟังก์ชันอัปเดต UI และ Database หลังจาก Drag & Drop
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
      const otherTasks = tasks.filter(
        task => task.task_status !== source.droppableId && task.task_status !== destination.droppableId
      );
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
  
  

  return (
    <div style={{ padding: "32px", maxWidth: "90%", margin: "auto" }}>
      {/* Header และปุ่ม Add Task */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1>Task Management</h1>
        <button 
          style={{
            padding: "10px 20px",
            backgroundColor: "#4F46E5",
            color: "#fff",
            borderRadius: "8px",
            cursor: "pointer",
          }}
          onClick={() => setIsModalOpen(true)}
        >
          + Add Task
        </button>
      </div>

      {/* Modal สำหรับเพิ่ม Task */}
      {isModalOpen && <AddTaskModal onClose={() => setIsModalOpen(false)} onTaskCreated={handleTaskCreated} />}

      {/* Drag & Drop Context */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
          {["To Do", "In Progress", "Review", "Done"].map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    background: snapshot.isDraggingOver ? "#E3E8EF" : "#F8F9FA",
                    padding: "15px",
                    borderRadius: "8px",
                    minWidth: "280px",
                    minHeight: "200px",
                  }}
                >
                  <h2>{status}</h2>
                  {tasks
                    .filter((task) => task.task_status === status)
                    .map((task, index) => (
                      <Draggable key={task.task_id} draggableId={task.task_id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              background: "white",
                              padding: "15px",
                              borderRadius: "8px",
                              marginBottom: "10px",
                              boxShadow: snapshot.isDragging
                                ? "0px 10px 15px rgba(0, 0, 0, 0.2)"
                                : "0px 4px 6px rgba(0, 0, 0, 0.1)",
                              cursor: "grab",
                              userSelect: "none",
                            }}
                          >
                            <h3>{task.task_name}</h3>
                            <p>{task.task_description}</p>
                            <span>Due: {task.task_due_date}</span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Task;
