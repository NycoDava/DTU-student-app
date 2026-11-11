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
import MyStudies from './screens/MyStudies';
import Grades from './screens/Grades';
import GpaCalculator from './screens/GpaCalculator';
import Studyplanner from './screens/Studyplanner';
import MyCourses from './screens/MyCourses';
import ExamDates from './screens/ExamDates';

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
            <Route path="/student" element={<MyStudies />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/grades/list" element={<Placeholder title="List of grades" back />} />
            <Route path="/grades/calculator" element={<GpaCalculator />} />
            <Route path="/courses" element={<MyCourses />} />
            <Route path="/courses/:courseId" element={<Placeholder title="Course" back />} />
            <Route path="/studyplanner" element={<Studyplanner />} />
            <Route path="/exams" element={<ExamDates />} />
            <Route path="/campus" element={<Placeholder title="Campus" />} />
            <Route path="/dtu" element={<Placeholder title="DTU" />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </UserProvider>
  );
}
