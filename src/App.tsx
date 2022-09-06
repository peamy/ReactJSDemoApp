import React from 'react';
import { BrowserRouter, Link } from 'react-router-dom';
import { Router } from './Router';

function App() {
  return (
    <div>
      <BrowserRouter>
        <nav>
          <Link to={"/"}>Home</Link>
          <Link to={"/faq"}>Faq</Link>
        </nav>
        <Router />
      </BrowserRouter>
    </div>
  );
}

export default App;
