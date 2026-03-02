import Button from 'react-bootstrap/Button';

interface ToolbarProps {
  onToolChange: (tool: string) => void;
}

const Toolbar = ({ onToolChange }: ToolbarProps) => {
  return (
    <div>
      <Button onClick={() => onToolChange('pen')}>Pen</Button>
      <Button onClick={() => onToolChange('eraser')}>Eraser</Button>
      <Button onClick={() => onToolChange('text')}>Text</Button>
    </div>
  );
};

export default Toolbar;
