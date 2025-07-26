import React from "react";
import Chatbot from "./components/Chatbot";
import './App.css';

function App() {
    const userId = 1; //
  return (
   <div className="App">
      <Chatbot userId={userId} />
    </div>
  );
}

export default App;
