
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function Navbarcomponent(){

    const { courseId } = useParams();

const navigate= useNavigate();

    function navigateToCourseInformation(courseId: number) {
        navigate(`/course/${courseId}`);
    }

    function navigateToAttendance(courseId: number) {
        navigate(`/attendance/${courseId}`);
    }

    function navigateToPayment(courseId: number) {
        navigate(`/payment/${courseId}`);
    }





    return (<>
    <Navbar expand="lg" className="bg-body-tertiary" >
                <Container fluid>
                    <Navbar.Brand href="#">Dashboard</Navbar.Brand>
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
                                    navigateToCourseInformation(parsedCourseId);
                                }
                            }}>Course information</Nav.Link>
                            <Nav.Link onClick={() => {
                                const parsedCourseId = courseId ? parseInt(courseId, 10) : NaN;
                                if (!isNaN(parsedCourseId)) {
                                    navigateToAttendance(parsedCourseId);
                                }
                            }}>Attendance</Nav.Link>
                            <Nav.Link onClick={() => {
                                const parsedCourseId = courseId ? parseInt(courseId, 10) : NaN;
                                if (!isNaN(parsedCourseId)) {
                                    navigateToPayment(parsedCourseId);
                                }
                            }}>Payment</Nav.Link>



                            <NavDropdown title="Link" id="navbarScrollingDropdown">
                                <NavDropdown.Item href="#action3">Action</NavDropdown.Item>
                                <NavDropdown.Item href="#action4">Another action</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="#action5">
                                    Something else here
                                </NavDropdown.Item>
                            </NavDropdown>
                            <Nav.Link href="#" disabled>
                                Link
                            </Nav.Link>
                        </Nav>
                        <Form className="d-flex">
                            <Form.Control
                                type="search"
                                placeholder="Search"
                                className="me-2"
                                aria-label="Search"
                            />
                            <Button variant="outline-success">Search</Button>
                        </Form>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
    
    
    </>);
}
export default Navbarcomponent;