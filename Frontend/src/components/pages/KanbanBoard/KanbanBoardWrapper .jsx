import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import KanbanBoard from './KanbanBoard';

const KanbanBoardWrapper = () => {
  const { projectId } = useParams();
  const location = useLocation();

  console.log("Route projectId:", projectId);
  console.log("Location state:", location.state);

  return <KanbanBoard projectId={projectId} />;
};

export default KanbanBoardWrapper;