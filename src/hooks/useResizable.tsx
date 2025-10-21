"use client";

import React, { useRef, useState, useCallback } from 'react';

interface UseResizableProps {
  initialHeight?: number;
  minHeight?: number;
  maxHeight?: number;
}

export const useResizable = ({ 
  initialHeight = 200, 
  minHeight = 100, 
  maxHeight = 800 
}: UseResizableProps = {}) => {
  const [height, setHeight] = useState(initialHeight);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = height;
    
    // Cambiar el cursor del documento
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }, [height]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaY = e.clientY - startYRef.current;
    const newHeight = startHeightRef.current + deltaY;
    
    // Aplicar límites de altura
    const constrainedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
    setHeight(constrainedHeight);
  }, [isResizing, minHeight, maxHeight]);

  const handleMouseUp = useCallback(() => {
    if (!isResizing) return;
    
    setIsResizing(false);
    
    // Restaurar el cursor del documento
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [isResizing]);

  // Agregar event listeners globales
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return {
    height,
    isResizing,
    containerRef,
    handleMouseDown,
  };
};
