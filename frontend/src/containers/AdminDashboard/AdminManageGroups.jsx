import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Badge,
  Card,
  ListGroup,
  Tabs,
  Tab,
  TabPane,
  Spinner,
} from "react-bootstrap";
import { useHistory } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import HeaderLogo from "../../components/HeaderLogo/HeaderLogo";
import CustomButton from "../../components/CustomButton";

const AdminManageGroups = () => {
  const [groupName, setGroupName] = useState("");
  const [capacity, setCapacity] = useState(0);
  const [groupType, setGroupType] = useState("");
  const [groupList, setGroupList] = useState([]);
  const [formValidated, setFormValidated] = useState(false);
  const [gender, setGender] = useState("");
  const [grade, setGrade] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  //isEditing: This state variable is used to determine whether the user is currently editing a group. It helps control the rendering of the editing form.
  //When isEditing is true, the editing form is displayed for the selected group.
  //When isEditing is false, the editing form is not rendered.

  // editedGroup: This state variable holds the data of the group being edited. It contains the id, name, and capacity of the group.
  // When the user edits any of these fields in the form, the corresponding value is updated in the editedGroup state.
  // This state is then used to update the group information when the user submits the form.

  // editingGroupId: This state variable stores the id of the group being edited. It is used to determine which group should display the editing form.
  // When editingGroupId matches the id of a group, the editing form is rendered for that group.
  // If editingGroupId is null, the editing form is not displayed.

  const [isEditing, setIsEditing] = useState(false);
  const [editedGroup, setEditedGroup] = useState({
    id: null,
    name: "",
    capacity: 0,
    type: "",
  });
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [updateFormValidated, setUpdateFormValidated] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    // Fetch groups data
    axios
      .get(process.env.REACT_APP_YSS_BACKEND_SERVER + "/groupdisplayforadmin")
      .then((response) => {
        const familyList = [];
        const busList = [];
        const cabinList = [];

        response.data.familyList.forEach((family) => {
          family.type = "Family";
          familyList.push(family);
        });

        response.data.busList.forEach((bus) => {
          bus.type = "Bus";
          busList.push(bus);
        });

        response.data.cabinList.forEach((cabin) => {
          cabin.type = "Cabin";
          cabinList.push(cabin);
        });
        //The spread operator ... is used to destructure the familyList array inside the Promise.all callback function.
        // Promise.all resolves to an array of resolved values from each promise passed to it.
        // In this case, Promise.all([familyListPromise, busListPromise, cabinListPromise]) returns an array containing familyList, busList, and cabinList.
        // By using the spread operator, setGroupList is being set to an array containing all the elements of familyList, busList, and cabinList combined.
        const mergedList = [...familyList, ...busList, ...cabinList];
        setGroupList(mergedList);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  }, []);

  const fetchGroupList = () => {
    axios
      .get(process.env.REACT_APP_YSS_BACKEND_SERVER + "/groupdisplayforadmin")
      .then((response) => {
        const familyList = [];
        const busList = [];
        const cabinList = [];

        response.data.familyList.forEach((family) => {
          family.type = "Family";
          familyList.push(family);
        });

        response.data.busList.forEach((bus) => {
          bus.type = "Bus";
          busList.push(bus);
        });

        response.data.cabinList.forEach((cabin) => {
          cabin.type = "Cabin";
          cabinList.push(cabin);
        });

        const mergedList = [...familyList, ...busList, ...cabinList];
        setGroupList(mergedList);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
    }
    setFormValidated(true);

    // Only proceed with form submission if it's valid
    if (form.checkValidity() === true) {
      const payload = {
        groupType,
        groupName,
        capacity,
        ...(groupType === "Cabin" && { gender }),
        ...(groupType === "Family" && { grade }),
      };
      // Make an API call to create the group with the provided details
      createGroup(payload);
    }
  };

  const createGroup = (payload) => {
    axios
      .post(process.env.REACT_APP_YSS_BACKEND_SERVER + "/creategroup", payload)
      .then((response) => {
        // Handle success, e.g., show a success message or update the group list
        alert(response.data.message);
        setIsLoading(true);
        fetchGroupList();
        // Clear the input values
        setGroupType("");
        setGroupName("");
        setCapacity("");
        if (payload.groupType === "Cabin") {
          setGender("");
        } else if (payload.groupType === "Family") {
          setGrade("");
        }
        //navigate('/admin');
      })
      .catch((error) => {
        // Handle error, e.g., show an error message
        console.error("Error creating group:", error);
      });
  };

  const handleEditGroup = (group) => {
    setEditingGroupId(group.id);
    setEditedGroup({
      id: group.id,
      name: group.name,
      capacity: group.capacity,
      type: group.type,
    });
    setIsEditing(true);
  };

  const handleCancelUpdate = () => {
    setIsEditing(false);
    setEditingGroupId(null);
    setEditedGroup({
      id: null,
      name: "",
      capacity: 0,
    });
  };

  const handleUpdateGroup = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
    }
    setUpdateFormValidated(true);

    // Only proceed with form submission if it's valid
    if (form.checkValidity() === true) {
      const payload = {
        groupId: editedGroup.id,
        groupType: editedGroup.type,
        groupName: editedGroup.name,
        capacity: editedGroup.capacity,
        ...(editedGroup.type === "Cabin" && { gender: editedGroup.gender }),
        ...(editedGroup.type === "Family" && { grade: editedGroup.grade }),
      };
      // Make an API call to update the group with the provided details
      updateGroup(payload);
    }
  };

  const updateGroup = (payload) => {
    axios
      .put(
        `${process.env.REACT_APP_YSS_BACKEND_SERVER}/editgroup/${payload.groupId}`,
        payload
      )
      .then((response) => {
        // Handle success, e.g., show a success message or update the group list
        alert(response.data.message);
        setIsEditing(false);
        setEditingGroupId(null);
        // Refresh the group list if needed
        setIsLoading(true);
        fetchGroupList();
      })
      .catch((error) => {
        // Handle error, e.g., show an error message
        console.error("Error updating group:", error);
      });
  };

  const handleDeleteGroup = (groupId, groupType) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this group?"
    );
    if (confirmDelete) {
      // Make an API call to delete the group
      axios
        .delete(
          process.env.REACT_APP_YSS_BACKEND_SERVER + "/deletegroup/" + groupId,
          { data: { groupType } }
        )
        .then((response) => {
          // Handle success, e.g., show a success message or update the group list
          alert(response.data.message);
          // Update the groupList state to trigger a re-render
          setGroupList((prevGroupList) =>
            prevGroupList.filter((group) => group.id !== groupId)
          );
        })
        .catch((error) => {
          // Handle error, e.g., show an error message
          console.error("Error deleting group:", error);
        });
    }
  };

  const renderGroupList = (groups) => {
    if (isLoading) {
      return (
        <div className="loading-spinner mt-4">
          <Spinner animation="border" variant="primary" />
          <span>Loading...</span>
        </div>
      );
    }
    return (
      <ListGroup>
        {groups.map((group) => (
          <ListGroup.Item key={group.id}>
            <div>
              <strong>{group.name}</strong> ({group.type})
              {group.isFull && <span className="text-danger"> - Full</span>}
            </div>
            <div>Capacity: {group.capacity}</div>
            {group.type === "Family" && <div>Grade: {group.grade}</div>}
            {group.type === "Cabin" && <div>Gender: {group.gender}</div>}
            <div>
              Members:
              <ListGroup>
                {group.members.map((member) => (
                  <ListGroup.Item
                    key={`${group.id}-${member.firstName}-${member.lastName}`}
                  >
                    {member.firstName} {member.lastName}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
            {!editingGroupId && (
              <div>
                <Button onClick={() => handleEditGroup(group)}>Edit</Button>
                <Button
                  onClick={() => handleDeleteGroup(group.id, group.type)}
                  variant="danger"
                >
                  Delete
                </Button>
              </div>
            )}

            {editingGroupId === group.id && (
              <Form
                onSubmit={handleUpdateGroup}
                noValidate
                validated={updateFormValidated}
              >
                <Form.Group controlId={`formGroupName-${group.id}`}>
                  <Form.Label>Group Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter group name"
                    value={editedGroup.name}
                    onChange={(e) =>
                      setEditedGroup({ ...editedGroup, name: e.target.value })
                    }
                    required
                    minLength={1}
                    maxLength={255}
                  />
                  {/* Add validation and logical warnings here */}
                </Form.Group>

                <Form.Group controlId={`formGroupCapacity-${group.id}`}>
                  <Form.Label>Group Capacity</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter group capacity"
                    value={editedGroup.capacity}
                    onChange={(e) =>
                      setEditedGroup({
                        ...editedGroup,
                        capacity: e.target.value,
                      })
                    }
                    required
                    min={0}
                    // Add any other capacity restrictions here
                  />
                  {/* Add validation and logical warnings here */}
                </Form.Group>

                {group.type === "Cabin" && (
                  <Form.Group controlId={`formGroupGender-${group.id}`}>
                    <Form.Label>Group Gender</Form.Label>
                    <Form.Select
                      value={editedGroup.gender}
                      onChange={(e) =>
                        setEditedGroup({
                          ...editedGroup,
                          gender: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="m">Male</option>
                      <option value="f">Female</option>
                    </Form.Select>
                    {/* Add validation and logical warnings here */}
                  </Form.Group>
                )}

                {group.type === "Family" && (
                  <Form.Group controlId={`formGroupGrade-${group.id}`}>
                    <Form.Label>Group Grade</Form.Label>
                    <Form.Select
                      value={editedGroup.grade}
                      onChange={(e) =>
                        setEditedGroup({
                          ...editedGroup,
                          grade: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select Grade</option>
                      <option value="9">9th grade</option>
                      <option value="10">10th grade</option>
                      <option value="11">11th grade</option>
                      <option value="12">12th grade</option>
                    </Form.Select>
                    {/* Add validation and logical warnings here */}
                  </Form.Group>
                )}

                <div>
                  <Button variant="secondary" onClick={handleCancelUpdate}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Update
                  </Button>
                </div>
              </Form>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>
    );
  };

  return (
    <div class="body pb-5">
      <Row className="mt-3">
        <HeaderLogo href="/admin" />
      </Row>

      <div className="admin-container mx-auto py-3 mb-5">
        <Row className="mx-auto mt-3">
          <Col className="text-left">
            <CustomButton text="Back" href="/admin" />
          </Col>
        </Row>
        <Row className="text-center mx-auto mb-4">
          <Col>
            <h1 style={{ fontSize: "1.7rem", color: "#e2e4ee" }}>
              Manage Groups
            </h1>
          </Col>
        </Row>

        <Row>
          <Col>
            <div className="existing-groups-content">
              {/*<h2>Existing Groups</h2>*/}

              <Tabs defaultActiveKey="family" id="group-tabs" fill>
                <Tab eventKey="family" title="Family Groups">
                  <Tab.Content className="tab-content-container">
                    {renderGroupList(
                      groupList.filter((group) => group.type === "Family")
                    )}
                  </Tab.Content>
                </Tab>
                <Tab eventKey="bus" title="Bus Groups">
                  <Tab.Content className="tab-content-container">
                    {renderGroupList(
                      groupList.filter((group) => group.type === "Bus")
                    )}
                  </Tab.Content>
                </Tab>
                <Tab eventKey="cabin" title="Cabin Groups">
                  <Tab.Content className="tab-content-container">
                    {renderGroupList(
                      groupList.filter((group) => group.type === "Cabin")
                    )}
                  </Tab.Content>
                </Tab>
              </Tabs>
            </div>
          </Col>
          <Col md={4} className="mt-4-custom">
            <div className="form-section">
              <h2 style={{ fontSize: "1.5rem", color: "#e2e4ee" }}>
                Create New Group
              </h2>
              <Form
                onSubmit={handleSubmit}
                noValidate
                validated={formValidated}
              >
                <Form.Group controlId="formGroupType">
                  <Form.Label style={{ color: "#e2e4ee" }}>
                    Group Type
                  </Form.Label>
                  <Form.Select
                    required
                    value={groupType}
                    onChange={(e) => setGroupType(e.target.value)}
                  >
                    <option value="">Select Group Type</option>
                    <option value="Family">Family</option>
                    <option value="Bus">Bus</option>
                    <option value="Cabin">Cabin</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select a group type.
                  </Form.Control.Feedback>
                </Form.Group>

                {groupType === "Cabin" && (
                  <Form.Group controlId="formGroupGender">
                    <Form.Label style={{ color: "#e2e4ee" }}>
                      Cabin Gender
                    </Form.Label>
                    <Form.Select
                      required
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="">Select Gender</option>
                      <option value="m">Male</option>
                      <option value="f">Female</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Please select a gender for the cabin.
                    </Form.Control.Feedback>
                  </Form.Group>
                )}
                {groupType === "Family" && (
                  <Form.Group controlId="formGroupGrade">
                    <Form.Label style={{ color: "#e2e4ee" }}>
                      Family Grade
                    </Form.Label>
                    <Form.Select
                      placeholder="Enter the grade for family"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      required
                    >
                      <option value="">Select the grade for family</option>
                      <option value="9">9th grade</option>
                      <option value="10">10th grade</option>
                      <option value="11">11th grade</option>
                      <option value="12">12th grade</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Please select a grade between 9th and 12th.
                    </Form.Control.Feedback>
                  </Form.Group>
                )}

                <Form.Group controlId="formGroupName">
                  <Form.Label style={{ color: "#e2e4ee" }}>
                    Group Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                    minLength={1} // Update this value according to your requirements
                    maxLength={255} // Update this value according to your requirements
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid group name.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="formGroupCapacity">
                  <Form.Label style={{ color: "#e2e4ee" }}>
                    Group Capacity
                  </Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter group capacity"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                    min={0} // Update this value according to your requirements
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid group capacity.
                  </Form.Control.Feedback>
                </Form.Group>

                <Button variant="primary" type="submit" className="mt-2">
                  Create
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AdminManageGroups;
