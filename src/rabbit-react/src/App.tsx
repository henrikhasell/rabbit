import React from 'react';
import Header from './Header';
import NavigationBar from './NavigationBar';
import PoemDisplay from './PoemDisplay';
import './style.scss';

function App() {
  return (
    <div className="App">
        <NavigationBar/>
        <Header/>
        <PoemDisplay/>
    </div>
  );
}

export default App;
