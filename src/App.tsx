import { Navigate, Route, Routes } from 'react-router-dom';
import Splash from './screens/Splash';
import Login from './screens/Login';
import Home from './screens/Home';

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
