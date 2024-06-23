import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    users: 0,
    dashboards: 0,
    category: ''
  });
  const [searchNotFound, setSearchNotFound] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios.get('https://dashdash.azurewebsites.net/getAllData')
      .then(response => {
        console.log('Full Response:', response);
        console.log('Data:', response.data);
        if (response.data) {
          setData(response.data);
        } else {
          setError('Unexpected response structure');
        }
      })
      .catch(error => {
        console.log(error.response.data.error)
      });
  };

  const handleDelete = (name) => {
    const confirmed = window.confirm(`Are you sure you want to delete the project "${name}"?`);
    if (confirmed) {
      axios.delete(`https://dashdash.azurewebsites.net/getDataByName/${name}`)
        .then(response => {
          console.log('Delete Response:', response);
          fetchData(); // Refresh data after deletion
        })
        .catch(error => {
          console.log(error.response.data.error);
        });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prevState => ({
      ...prevState,
      [name]: name === 'users' || name === 'dashboards' ? parseInt(value, 10) : value
    }));
  };

  const handleSearchChange = (e) => {
    const searchQuery = e.target.value.trim().toLowerCase();
    if (searchQuery) {
      axios.get(`https://dashdash.azurewebsites.net/getDataByName/${searchQuery}`)
        .then(response => {
          console.log('Search Response:', response);
          if (response.data && response.data.length > 0) {
            setData(response.data);
            setSearchNotFound(false);
          } else {
            setSearchNotFound(true);
            setData([]);
          }
        })
        .catch(error => {
          console.log(error.response.data.error);
          setSearchNotFound(true);
          setData([]);
        });
    } else {
      fetchData();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting data:', newProject);
    axios.post('https://dashdash.azurewebsites.net/createData', newProject)
      .then(response => {
        console.log('Create Response:', response);
        fetchData(); // Refresh data after creating new project
        setNewProject({ name: '', users: 0, dashboards: 0, category: '' });
      })
      .catch(error => {
        console.log(error.response.data.error)
      });
  };

  return (
    <div className="App">
      {error ? (
        <p>{error}</p>
      ) : data ? (
        <div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              value={newProject.name}
              onChange={handleInputChange}
              placeholder="Name"
              required
            />
            <input
              type="number"
              name="users"
              value={newProject.users}
              onChange={handleInputChange}
              placeholder="Users"
              required
            />
            <input
              type="number"
              name="dashboards"
              value={newProject.dashboards}
              onChange={handleInputChange}
              placeholder="Dashboards"
              required
            />
            <input
              type="text"
              name="category"
              value={newProject.category}
              onChange={handleInputChange}
              placeholder="Category"
              required
            />
            <button type="submit">Add Project</button>
          </form>
          <input
            type="text"
            onChange={handleSearchChange}
            placeholder="Search by name"
          />
          <div className='Project'>
            {searchNotFound ? (<p>Search Not Found</p>) :(data.map((project, index) => (
              <div className="project-item" key={index}>
                <p>Name: {project.name}</p>
                <p>Users: {project.users}</p>
                <p>Dashboards: {project.dashboards}</p>
                <p>Category: {project.category}</p>
                <button onClick={() => handleDelete(project.name)}>Delete</button>
              </div>
            )))}
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
