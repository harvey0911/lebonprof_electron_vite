import React, { useState, useEffect } from 'react';
import CanvasCard from './CanvasCard';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useParams, useNavigate } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import { faPlus, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axiosapi from '../api';
import Modal from 'react-bootstrap/Modal';


interface Session {
  SessionID: number | undefined;
  courseId: string | undefined;
  Title: string | undefined;
}


function Files() {
  const [canvasCards, setCanvasCards] = useState<Session[]>([]);
 // const [canvasCards, setCanvasCards] = React.useState<React.ReactNode[]>([]);
  const { courseId } = useParams();
  const [title1,settitle1]= useState('');
  const navigate = useNavigate();
  const [show, setShow] = useState(false);



  useEffect(() => {
    const fetchSessions = async () => {
      try {
        if (courseId) {
          const sessionsResponse = await axiosapi.get(`/fetchSessions/${courseId}`);
          const sessions = sessionsResponse.data;

          // You can declare a normal array of CanvasCard components
          const canvasCardArray = sessions.map((session: { sessionId: number; Title: string }) => (
            <CanvasCard
              key={session.sessionId}
              courseId={courseId}
              SessionID={session.sessionId}
              Title={session.Title}
            />
          ));

          // Set the array directly without using state
          setCanvasCards(canvasCardArray);
        }
      } catch (error) {
        console.error('Error fetching sessions', error);
      }
    };

    fetchSessions();
  }, [canvasCards,courseId]);


  const addWhiteboardCard = async () => {
    try {
      // Insert a new session into the database with an empty whiteboard
      const response = await axiosapi.post('/AddSession', {
        courseId,
        title: title1, // Set a default title or fetch from user input
        whiteboardContent: '', // You can set initial content here
      });

      const newSession = response.data;
      console.log(newSession.sessionId)



    } catch (error) {
      console.error('Error adding whiteboard session', error);
    }
  };







  const handleClose=()=> {
  
  
  
    setShow(false);
  
  
  }

  const handleShow = () => {
    setShow(true);
  
  }

  function navigateToCourseInformation() {
    navigate(`/course/${courseId}`);
  }

  function navigateToAttendance() {
    navigate(`/attendance/${courseId}`);
  }

  function navigateToPayment() {
    navigate(`/payment/${courseId}`);
  }

  function navigateToFiles() {
    navigate(`/files/${courseId}`);
  }

  function navigateToDashBoard(){
    navigate(`/Dashboard`);
}

  const SaveChanges= async () => {

    handleClose();
    
    addWhiteboardCard();
  
};



const handleCloseX=()=>{
  setShow(false);
}





  return (
    <>

      <Navbar expand="lg" className="bg-dark fixed-top">
        <Container fluid>
          <Navbar.Brand  onClick={navigateToDashBoard} className="text-light">Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav
              className="me-auto my-2 my-lg-0"
              style={{ maxHeight: '100px' }}
              navbarScroll
            >


              <Nav.Link onClick={() => {
                const parsedCourseId = courseId ? parseInt(courseId, 10) : NaN;
                if (!isNaN(parsedCourseId)) {
                  navigateToCourseInformation();
                }
              }} className="text-light">Course information</Nav.Link>

              <Nav.Link onClick={() => {
                const parsedCourseId = courseId ? parseInt(courseId, 10) : NaN;
                if (!isNaN(parsedCourseId)) {
                  navigateToAttendance();
                }
              }} className="text-light">Attendance</Nav.Link>

              <Nav.Link onClick={() => {
                const parsedCourseId = courseId ? parseInt(courseId, 10) : NaN;
                if (!isNaN(parsedCourseId)) {
                  navigateToFiles();
                }
              }} className="text-light">Files</Nav.Link>


              <Nav.Link onClick={() => {
                const parsedCourseId = courseId ? parseInt(courseId, 10) : NaN;
                if (!isNaN(parsedCourseId)) {
                  navigateToPayment();
                }
              }} className="text-light">Payment</Nav.Link>




            </Nav>
            <Form className="d-flex">
              <Form.Control
                type="search"
                placeholder="Search"
                className="me-2"
                aria-label="Search"
              />
              <Button variant="outline-success" className="text-light">Search</Button>
            </Form>
          </Navbar.Collapse>
        </Container>
      </Navbar>




      <Container style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '7px' }}>
        <Card className="bg-dark text-white">
          <Card.Body onClick={handleShow}>
            <Card.Title>New Whiteboard</Card.Title>


            <FontAwesomeIcon icon={faPlus} style={{ transform: 'scale(1.5)' }} />
          </Card.Body>
        </Card>


        


        {canvasCards}










      </Container>






      <Modal show={show} onHide={handleCloseX}>
        <Modal.Header closeButton>
          <Modal.Title> Session Title</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Normal text"
            onChange={(e) => settitle1(e.target.value)}
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




    </>
  );
}

export default Files;