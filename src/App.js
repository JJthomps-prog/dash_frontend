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
    category: 'A'
  });
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null); // State to hold timeout ID

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
        console.log(error.response.data.error);
        setError('Failed to fetch data');
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
    clearTimeout(searchTimeout); // Clear previous timeout

    if (searchQuery) {
      setSearchTimeout(setTimeout(() => {
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
      }, 300)); // Debounce time set to 300ms, adjust as needed
    } else {
      fetchData();
      setSearchNotFound(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting data:', newProject);
    axios.post('https://dashdash.azurewebsites.net/createData', newProject)
      .then(response => {
        console.log('Create Response:', response);
        fetchData(); // Refresh data after creating new project
        setNewProject({ name: '', users: 0, dashboards: 0, category: 'A' });
      })
      .catch(error => {
        console.log(error.response.data.error);
      });
  };

  return (
    <div className="App">
      {error ? (
        <p>{error}</p>
      ) : data ? (
        <div>
          <div className='Welcome'>
            <p style={{ fontSize: '30px', fontWeight: 'bold' }}>Hello Sarah!</p>
            <p>Here you can find your projects and dashboards</p>
          </div>
          <div className='searchbar'>
            <input
              type="text"
              onChange={handleSearchChange}
              placeholder="Search for a keyword"
              className="search-input"
            />
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M21 21l-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
            </svg>
          </div>
          <p className='my-project-title'>My Projects</p>
          <div className='Project'>
            {searchNotFound ? (<p>Search Not Found</p>) : (data.map((project, index) => (
              <div className={`project-item project-${project.category}`} key={index}>
                <div className='project-item-front'></div>
                <div className='project-category'><div>{project.category}</div></div>
                <div className='project-name'>{project.name}</div>
                <div className='project-users'>{project.users} Users</div>
                <div className='project-dashboards'><div>{project.dashboards} Dashboards</div></div>
                <div className='delete-button'><button onClick={() => handleDelete(project.name)}>Delete</button></div>
              </div>
            )))}
          </div>
          <form onSubmit={handleSubmit}>
            Name:<input
              type="text"
              name="name"
              value={newProject.name}
              onChange={handleInputChange}
              placeholder="Name"
              required
            />
            Users:<input
              type="number"
              name="users"
              value={newProject.users}
              onChange={handleInputChange}
              placeholder="Users"
              required
            />
            Dashboards:<input
              type="number"
              name="dashboards"
              value={newProject.dashboards}
              onChange={handleInputChange}
              placeholder="Dashboards"
              required
            />
            Category:
            <select
              name="category"
              value={newProject.category}
              onChange={handleInputChange}
              required
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F">F</option>
            </select>
            <button type="submit">Add Project</button>
          </form>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
