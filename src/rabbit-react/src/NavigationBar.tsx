import { Link } from 'react-router-dom';
import { Nav, Navbar } from 'react-bootstrap';
import React from 'react';

const NavigationBar: React.FC = () => (
  <Navbar bg="light" className="border-bottom" expand="md" sticky="top">
    <Navbar.Brand>🐰 Down The Rabbit-Hole<sup>2.0</sup></Navbar.Brand>
    <Navbar.Toggle aria-controls="rabbit-navbar-collapse"/>
    <Navbar.Collapse id="rabbit-navbar-collapse" className="ml-auto">
      <Nav className="ml-auto">
        <Nav.Link as={Link} to="/">The Rabbit</Nav.Link>
        <Nav.Link as={Link} to="/calendar">News Database</Nav.Link>
        <Nav.Link as={Link} to="/about">About This Site</Nav.Link>
      </Nav>
    </Navbar.Collapse>
  </Navbar>
);

export default NavigationBar;
