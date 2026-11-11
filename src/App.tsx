import { Navigate, Route, Routes } from 'react-router-dom';
import { UserProvider } from './data/currentUser';
import MainLayout from './components/MainLayout';
import Splash from './screens/Splash';
import Login from './screens/Login';
import Home from './screens/Home';
import Placeholder from './screens/Placeholder';

export default function App() {
  return (
    <UserProvider>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route element={<MainLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/announcements" element={<Placeholder title="Study Announcements" />} />
            <Route path="/events" element={<Placeholder title="Upcoming Activities and Deadlines" />} />
            <Route path="/profile" element={<Placeholder title="Profile" />} />
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
