import { Navigate, Route, Routes } from 'react-router-dom';
import { UserProvider } from './data/currentUser';
import MainLayout from './components/MainLayout';
import Splash from './screens/Splash';
import Login from './screens/Login';
import Home from './screens/Home';
import Placeholder from './screens/Placeholder';
import Events from './screens/Events';
import Announcements from './screens/Announcements';
import Profile from './screens/Profile';

export default function App() {
  return (
    <UserProvider>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route element={<MainLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/events" element={<Events />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/student" element={<Placeholder title="Grades and progress" />} />
            <Route path="/campus" element={<Placeholder title="Campus" />} />
            <Route path="/dtu" element={<Placeholder title="DTU" />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </UserProvider>
  );
}
