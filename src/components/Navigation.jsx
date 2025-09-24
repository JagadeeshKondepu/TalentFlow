import React from 'react';
import { NavLink } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';

const Navigation = () => {
  return (
    <nav className="nav">
      <div className="nav-links" style={{flexDirection: 'column', alignItems: 'center'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px'}}>
          <h1 className="font-bold text-2xl" style={{color: 'var(--color-navText)', textShadow: '2px 2px 4px rgba(0,0,0,0.3)'}}>🎯 TALENT FLOW</h1>
          <ThemeSwitcher />
        </div>
        <ul className="nav-pills">
          <li>
            <NavLink to="/jobs" className="nav-link">
              💼 Jobs
            </NavLink>
          </li>
          <li>
            <NavLink to="/candidates" className="nav-link">
              👥 Candidates
            </NavLink>
          </li>
          <li>
            <NavLink to="/assessments" className="nav-link">
              📝 Assessments
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;