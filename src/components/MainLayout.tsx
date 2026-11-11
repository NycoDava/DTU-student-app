import { Outlet } from 'react-router-dom';
import TabBar from './TabBar';

/** Every main screen: scrollable content on top, fixed tab bar at the bottom. */
export default function MainLayout() {
  return (
    <div className="main-layout">
      <div className="main-layout__content">
        <Outlet />
      </div>
      <TabBar />
    </div>
  );
}
