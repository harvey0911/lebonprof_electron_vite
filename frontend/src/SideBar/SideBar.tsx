import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faListCheck,
  faBook,
  faGraduationCap,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import LeBonProfLogo from './LeBonProf.png'; // Import the logo image

const { Sider } = Layout;

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(['']); // State to keep track of selected menu item
  const location = useLocation();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleClick = (key) => {
    setSelectedKeys([key]);
  };

  const currentPath = location.pathname;
  const defaultSelectedKey = currentPath === '/' ? '/Dashboard' : currentPath;

  return (
    <Sider
      // collapsible
      // collapsed={collapsed}
      // onCollapse={toggleCollapsed}
      width={200} // Adjust the width as needed
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1,
      }}
    >
      
      <Menu theme="dark" mode="inline" selectedKeys={[defaultSelectedKey]}>
        
      <div className="logo">
        <img
          src={LeBonProfLogo}
          alt="Logo"
          style={{ backgroundColor: 'white', padding: '20px', maxWidth: '200%', maxHeight: '200%', borderRadius: '50%' }}
        />
      </div>
      <div style={{ height: '40px' }} />
        <Menu.Item key="/Dashboard" icon={<FontAwesomeIcon icon={faBook} />}>
          <Link to="/Dashboard" onClick={() => handleClick('/Dashboard')}>
            Dashboard
          </Link>
        </Menu.Item>
        <Menu.Item key="/Students" icon={<FontAwesomeIcon icon={faUser} />}>
          <Link to="/Students" onClick={() => handleClick('/Students')}>
            Students
          </Link>
        </Menu.Item>
        <Menu.Item key="/Professors" icon={<FontAwesomeIcon icon={faGraduationCap} />}>
          <Link to="/Professors" onClick={() => handleClick('/Professors')}>
            Professors
          </Link>
        </Menu.Item>
        <Menu.Item key="/Tasks" icon={<FontAwesomeIcon icon={faListCheck} />}>
          <Link to="/Tasks">Tasks</Link>
        </Menu.Item>
        {/* Add margin or padding to create a gap between items */}

        <Menu.Item key="/Logout" icon={<FontAwesomeIcon icon={faRightFromBracket} />}>
          <Link to="/" onClick={() => handleClick('/')}>
            Logout
          </Link>
        </Menu.Item>
        <div style={{ height: '290px' }} />
      </Menu>
    </Sider>
  );
};

export default SideBar;
