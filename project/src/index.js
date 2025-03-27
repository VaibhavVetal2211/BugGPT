import React, { useEffect, useState } from 'react';
import socket from './socket';
import ScanProgress from './components/ScanProgress';

function App() {
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    socket.on("scan_progress", (data) => {
      console.log("Scan progress:", data);
      setProgress(data.progress); // Update progress state
      setCurrentTask(data.currentTask); // Update current task state
    });

    socket.on("scan_complete", (data) => {
      console.log("Scan complete:", data);
    });

    return () => {
      socket.off("connect");
      socket.off("scan_progress");
      socket.off("scan_complete");
    };
  }, []);

  return (
    <div className="App">
      <h1>Socket.IO Client</h1>
      <ScanProgress progress={progress} currentTask={currentTask} />
    </div>
  );
}

export default App;