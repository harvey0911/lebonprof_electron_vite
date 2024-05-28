import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import Toolbar from './Toolbar';
import axios from 'axios';
import SideBar from '../SideBar/SideBar';

const Whiteboard = () => {
  const canvasRef = useRef(null);
  const [activeTool, setActiveTool] = useState('pen');
  const [whiteboardContent, setWhiteboardContent] = useState('');

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      height: window.innerHeight,
      width: window.innerWidth,
    });

    // Add event listeners or custom logic as needed
    // Use activeTool state to determine the currently selected tool

    // Load saved whiteboard content when the component mounts
    fetchWhiteboardContent();

    return () => {
      // Clean up Fabric.js instance if needed
      canvas.dispose();
    };
  }, [activeTool]);

  const handleToolChange = (tool) => {
    setActiveTool(tool);
  };

  const fetchWhiteboardContent = async () => {
    try {
      const response = await axios.get('http://localhost:5000/fetch_whiteboard');
      setWhiteboardContent(response.data.whiteboardContent || '');
    } catch (error) {
      console.error('Error fetching whiteboard content:', error);
    }
  };

  const saveWhiteboardContent = async () => {
    const canvas = canvasRef.current;

    // Serialize canvas objects to JSON
    const jsonContent = canvas.toJSON();

    try {
      await axios.post('http://localhost:5000/save_whiteboard', {
        whiteboardContent: jsonContent,
      });
      console.log('Whiteboard content saved successfully');
    } catch (error) {
      console.error('Error saving whiteboard content:', error);
    }
  };

  return (
    <>

    

      <Toolbar onToolChange={handleToolChange} onSave={saveWhiteboardContent} />
      <canvas ref={canvasRef} style={{ border: '1px solid #ddd' }} />


    </>
  );
};

export default Whiteboard;
