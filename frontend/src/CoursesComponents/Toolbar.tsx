import React from 'react';
import Button from 'react-bootstrap/Button';
import { useNavigate
 } from 'react-router-dom';
const Toolbar = ({ onToolChange }) => {

const navigate = useNavigate();

  return (
    <div>
      <Button onClick={() => onToolChange('pen')}>Pen</Button>
      <Button onClick={() => onToolChange('eraser')}>Eraser</Button>
      <Button onClick={() => onToolChange('text')}>Text</Button>
      

      {/* Add buttons for other tools */}
    </div>
  );
};

export default Toolbar;
