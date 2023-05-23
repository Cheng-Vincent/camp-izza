import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

const CustomButton = ({ text, href, onClick, rem = "5rem" }) => {
  const style = {
    "border-radius": "15px",
    width: rem,
    border: "3px solid #5489b8",
  };

  return (
    <Container
      as={Button}
      variant="light"
      style={style}
      onClick={onClick}
      href={href}
    >
      <h2 className="my-1 mx-auto" style={{ fontSize: "0.9rem" }}>
        {text}
      </h2>
    </Container>
  );
};

export default CustomButton;
