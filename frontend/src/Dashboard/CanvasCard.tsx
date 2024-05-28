import React, { useState, useEffect } from 'react'; // Import useEffect
import Whiteboard from '../CoursesComponents/Whiteboard';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import axiosapi from '../api';

interface Session {
  SessionID: number | undefined;
  courseId: string | undefined;
  Title: string | undefined;
}

const CanvasCard = (props: Session) => {
  const { courseId, SessionID } = props;
  const [Title, setTitle] = useState(props.Title || ''); // Initialize with props.Title if available
  const [oldTitle, setOldTitle] = useState(Title || '');
  const [isHovered, setIsHovered] = useState(false);
  const [editableTitle, setEditableTitle] = useState(Title);
  const [show, setShow] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const navigate = useNavigate();

  // useEffect(() => {
  //   setEditableTitle(Title); // Update editableTitle when Title prop changes
  // }, [Title])
  
  useEffect(() => {
    setOldTitle(Title || '');
    setEditableTitle(Title || ''); // Update editableTitle when Title prop changes
  }, [Title]);

  const openCanvas = () => {
    navigate(`/Canvas/${SessionID}`);
  };

  const handleShow = () => {
    setShow(true);
    console.log('Received props:', { courseId, SessionID, Title });
    
  };

  const handleClose = () => {
    setShow(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      console.log(Title);
      await axiosapi.delete(`/deleteSession/${encodeURIComponent(Title)}`);
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error('Error deleting session', error);
    }
  };
  
  // const SaveChanges = async () => {
  //   try {
  //     await axiosapi.put(`/updateSessionTitle/${SessionID}`, {
  //       title: editableTitle,
  //     }); 
  //     setShow(false);
  //     setTitle(editableTitle); // Update Title with the new title value
  //   } catch (error) {
  //     console.error('Error updating session title', error);
  //   }
  // };


  const SaveChanges = async () => {
    try {
      // Send courseId and oldTitle to the backend
      await axiosapi.put(`/updateSessionTitle/${courseId}`, {
        oldTitle: oldTitle,
        newTitle: editableTitle,
      }); 

      setShow(false);
      setTitle(editableTitle); // Update Title with the new title value
      console.log('Received props:', { oldTitle, editableTitle });
    } catch (error) {
      console.error('Error updating session title', error);
    }
};



  return (
    <>
      <Card
        className="bg-light"
        style={{
          transition: 'transform 0.2s',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          cursor: isHovered ? 'pointer' : 'default',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card.Header>{Title}</Card.Header>
        <Card.Body onClick={openCanvas}>
          {/* Card body content */}
        </Card.Body>

        <div style={{ paddingLeft: '5vw' }}>
          <Dropdown style={{ alignSelf: 'flex-end', marginLeft: '5vw' }}>
            <Dropdown.Toggle variant="Secondary" id="dropdown-basic">
              ...
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <NavDropdown.Item onClick={handleDelete}>
                Delete <FontAwesomeIcon icon={faTrash} />
              </NavDropdown.Item>
              <NavDropdown.Item onClick={handleShow}>
                Rename <FontAwesomeIcon icon={faPen} />
              </NavDropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Card>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Rename Session</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Enter new title"
            value={editableTitle}
            onChange={(e) => setEditableTitle(e.target.value)}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={SaveChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteConfirmation} onHide={() => setShowDeleteConfirmation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this Canvas session?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CanvasCard;
