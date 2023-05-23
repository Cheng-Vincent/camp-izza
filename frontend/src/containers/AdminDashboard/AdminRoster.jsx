import React, { useState, useEffect } from "react";
import Axios from "axios";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";
import HeaderLogo from "../../components/HeaderLogo/HeaderLogo";
import CustomButton from "../../components/CustomButton";

const AdminRoster = () => {
  const [roster, setRoster] = useState();

  useEffect(() => {
    Axios.get(process.env.REACT_APP_YSS_BACKEND_SERVER + "/getRoster").then(
      (response) => {
        setRoster(response.data);
      }
    );
  }, []);

  const formatDate = (dateToFormat) => {
    const date = new Date(dateToFormat);
    let m = (date.getMonth() + 1).toString().padStart(2, 0);
    let d = date.getDate().toString().padStart(2, 0);
    return `${date.getFullYear()}-${m}-${d}`;
  };

  const handleCSVDownload = () => {
    let csv = [];
    // add headers
    csv.push(Object.getOwnPropertyNames(roster[0]).join(","));
    // add data
    roster.forEach((row) => {
      csv.push(Object.values(row).join(","));
    });

    let downloadLink = document.createElement("a");
    downloadLink.id = "download-csv";
    downloadLink.href =
      "data:text/plain;charset=utf-8," + encodeURIComponent(csv.join("\n"));
    downloadLink.download = "roster.csv";
    document.body.appendChild(downloadLink);
    document.querySelector("#download-csv").click();
  };

  return (
    <div class="body">
      <Row className="mt-3">
        <HeaderLogo href="/admin" />
      </Row>
      <div className="admin-container mx-auto py-3">
        <Row className="mx-auto mt-3">
          <Col className="text-left">
            <CustomButton text="Back" href="/admin" />
          </Col>
        </Row>

        <Row className="text-center mx-auto mb-3">
          <Col>
            <h1 style={{ fontSize: "1.7rem", color: "#e2e4ee" }}>Roster</h1>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col className="text-center">
            <Container
              as={Button}
              variant="light"
              style={{
                "border-radius": "15px",
                width: "10rem",
                border: "3px solid #5489b8",
              }}
              onClick={handleCSVDownload}
              disabled={!roster || roster.length < 1}
            >
              <h2 className="my-1 mx-auto" style={{ fontSize: "0.9rem" }}>
                Download .csv
              </h2>
            </Container>
          </Col>
        </Row>
        <Row>
          {!roster || roster.length === 0 ? (
            <Col>
              <Spinner animation="border" role="status"></Spinner>
            </Col>
          ) : (
            <Table size="sm" variant="light" hover responsive bordered striped>
              <thead>
                <tr>
                  {Object.getOwnPropertyNames(roster[0]).map((column) => (
                    <th>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roster.map((entry) => (
                  <tr>
                    {Object.values(entry).map((cell, i) => (
                      <td>{i != 2 && i != 8 ? cell : formatDate(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Row>
      </div>
    </div>
  );
};

export default AdminRoster;
