import { useState, useCallback } from 'react';
import { RoutePoint } from '@/model/shipments';

interface UseRoutePointsProps {
  onPointRemove?: (pointId: string) => void;
  onPointEdit?: (point: RoutePoint) => void;
}

export const useRoutePoints = ({ onPointRemove, onPointEdit }: UseRoutePointsProps = {}) => {
  const [selectedPoint, setSelectedPoint] = useState<RoutePoint | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pointToDelete, setPointToDelete] = useState<RoutePoint | null>(null);

  const handlePointClick = useCallback((point: RoutePoint, position: { x: number; y: number }) => {
    setSelectedPoint(point);
    setTooltipPosition(position);
  }, []);

  const handleTooltipClose = useCallback(() => {
    setSelectedPoint(null);
    setTooltipPosition(null);
  }, []);

  const handleDeleteClick = useCallback((point: RoutePoint) => {
    setPointToDelete(point);
    setShowDeleteModal(true);
    setSelectedPoint(null);
    setTooltipPosition(null);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (pointToDelete && onPointRemove) {
      onPointRemove(pointToDelete.id);
    }
    setShowDeleteModal(false);
    setPointToDelete(null);
  }, [pointToDelete, onPointRemove]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteModal(false);
    setPointToDelete(null);
  }, []);

  const handlePointEdit = useCallback(
    (point: RoutePoint) => {
      onPointEdit?.(point);
    },
    [onPointEdit]
  );

  return {
    // State
    selectedPoint,
    tooltipPosition,
    showDeleteModal,
    pointToDelete,

    // Handlers
    handlePointClick,
    handleTooltipClose,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handlePointEdit
  };
};
