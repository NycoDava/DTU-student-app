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
import Campus from './screens/Campus';
import Food from './screens/Food';
import Library from './screens/Library';
import MapScreen from './screens/MapScreen';
import Dtu from './screens/Dtu';
import { DtuEvents, DtuNews } from './screens/DtuLists';
import Services from './screens/Services';
import Contact from './screens/Contact';
import { CareerHub, StudentLife, StudyAbroad, Wellbeing } from './screens/ServicePages';
import { venues, venues101 } from './data/venues';
import CourseLayout from './screens/course/CourseLayout';
import { ClasslistTab, MyCourseTab } from './screens/course/MyCourseTab';
import { ContentTab, ModuleView } from './screens/course/ContentTab';
import { AssignmentsTab } from './screens/course/AssignmentsTab';

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
            <Route path="/courses/:courseId" element={<CourseLayout />}>
              <Route index element={<MyCourseTab />} />
              <Route path="classlist" element={<ClasslistTab />} />
              <Route path="content" element={<ContentTab />} />
              <Route path="content/:path" element={<ModuleView />} />
              <Route path="assignments" element={<AssignmentsTab />} />
            </Route>
            <Route path="/studyplanner" element={<Studyplanner />} />
            <Route path="/exams" element={<ExamDates />} />
            <Route path="/campus" element={<Campus />} />
            <Route path="/campus/food" element={<Food venues={venues} />} />
            <Route path="/campus/food/101" element={<Food venues={venues101} compact />} />
            <Route path="/campus/library" element={<Library />} />
            <Route path="/dtu" element={<Dtu />} />
            <Route path="/dtu/news" element={<DtuNews />} />
            <Route path="/dtu/events" element={<DtuEvents />} />
            <Route path="/dtu/services" element={<Services />} />
            <Route path="/dtu/services/abroad" element={<StudyAbroad />} />
            <Route path="/dtu/services/career" element={<CareerHub />} />
            <Route path="/dtu/services/life" element={<StudentLife />} />
            <Route path="/dtu/services/wellbeing" element={<Wellbeing />} />
            <Route path="/dtu/contact" element={<Contact />} />
          </Route>
          <Route path="/campus/map" element={<MapScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </UserProvider>
  );
}
