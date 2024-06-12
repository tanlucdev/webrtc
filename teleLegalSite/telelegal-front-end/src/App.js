import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css';
// import { socketConnection } from './webRTCutilities/socketConnection'
import MainVideoPage from './videoComponents/MainVideoPage'
import ProDashboard from './siteComponents/ProDashboard';
import ProMainVideoPage from './videoComponents/ProMainVideoPage'
import Rules from './siteComponents/Rules';

const Home = () => <h1>Hello, Home Page</h1>
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" Component={Home} />
        <Route path="/join-video" Component={MainVideoPage} />
        <Route path="/dashboard" Component={ProDashboard} />
        <Route path="/join-video-pro" Component={ProMainVideoPage} />
        <Route path="/rules" Component={Rules} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
