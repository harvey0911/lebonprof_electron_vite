import React, { useState } from 'react';
import { Col, Container, Image, Row, Button, Spinner, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import LeBonProfLogo from './LeBonProf.png';

function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (event: { currentTarget: any; preventDefault: () => void; stopPropagation: () => void; }) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      setValidated(true);
      return;
    }

    event.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <Container fluid>
      {loading && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999
        }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
      <Row className="justify-content-center align-items-center" style={{ height: '100vh', overflow: 'hidden' }}>
        <Col xs={12} md={6} className="text-center">
          <Image src={LeBonProfLogo} rounded style={{ maxWidth: '80%', maxHeight: '80%' }} />
        </Col>
        <Col xs={12} md={6}>
          <Form noValidate validated={validated} onSubmit={handleLogin}>
            <div className="p-4 border rounded shadow-sm">
              <h2 className="text-center mb-4">Login</h2>
              <Form.Group controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Enter username"
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a username.
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formPassword" className="mt-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  required
                  type="password"
                  placeholder="Password"
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a password.
                </Form.Control.Feedback>
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100 mt-4">
                Login
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default LandingPage;
