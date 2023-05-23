import React from "react";
import Card from "react-bootstrap/Card";
import Placeholder from 'react-bootstrap/Placeholder';
import Container from "react-bootstrap/Container";
import "../PlaceholderCard/PlaceholderCard.css";

const PlaceholderCard = () => {
    return (
        <Card className="dashboard-card mb-3" border="light" id="placeholder-card" as={Container} style={{ width: '20rem' }}>
            <Card.Body>
                <Placeholder as={Card.Title} animation="glow">
                    <Placeholder className="w-100" />
                </Placeholder>
                <Placeholder as={Card.Text} animation="glow">
                    <Placeholder className="w-75" />
                </Placeholder>
                <Placeholder as={Card.Text} animation="glow">
                    <Placeholder className="w-50" />
                </Placeholder>
                <Placeholder as={Card.Text} animation="glow">
                    <Placeholder className="w-75" />
                </Placeholder>
            </Card.Body>
        </Card>
    );
};

export default PlaceholderCard;