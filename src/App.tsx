import React from 'react';
import logo from './logo.svg';
import './App.css';
import PreviewContainer from './components/PreviewContainer';

function App() {
  return (
    <div className="App">
      <div className='MainContainer'>
        <PreviewContainer/>
        <div>Hola mundo </div>
      </div>
    </div>
  );
}

export default App;
