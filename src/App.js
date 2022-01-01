import React, { useState, useEffect } from 'react';
import './App.css';
import { API, Storage } from 'aws-amplify';
// import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';

import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
import MediaCard from './components/AudioCards'
import AdminPanel from './components/Admin/adminForm'
import Home from './components/test'

const initialFormState = { name: '', description: '' }

function App() {
  const [activePage, setactivePage] = useState("Admin");

  useEffect(() => {
    // fetchNotes();
  }, []);

  const activeView = (event,page) => {
    setactivePage(page);
  }
  return (
    <div className="App">
      {
        activePage === "Home" ? <MediaCard active={true} activeView={activeView} /> :
          activePage === "Admin" ? <AdminPanel active={true} activeView={activeView} /> : null
      }
    </div>
  );
}

// export default withAuthenticator(App);
export default App;