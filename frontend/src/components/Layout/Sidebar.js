import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <SidebarContainer>
      <Logo>
        <LogoIcon>🏗️</LogoIcon>
        <LogoText>Ecoloptim InstalPro</LogoText>
      </Logo>

      <UserInfo>
        <UserAvatar>{user?.nume_complet?.charAt(0) || user?.username?.charAt(0) || '?'}</UserAvatar>
        <UserName>{user?.nume_complet || user?.username}</UserName>
        <UserRole>{user?.rol}</UserRole>
      </UserInfo>

      <Nav>
        <NavItem to="/dashboard">
          <NavIcon>📊</NavIcon>
          <NavText>Dashboard</NavText>
        </NavItem>

        <NavItem to="/clienti">
          <NavIcon>👥</NavIcon>
          <NavText>Clienți</NavText>
        </NavItem>

        <NavItem to="/lucrari">
          <NavIcon>🏗️</NavIcon>
          <NavText>Lucrări</NavText>
        </NavItem>

        <NavItem to="/materiale">
          <NavIcon>📦</NavIcon>
          <NavText>Materiale</NavText>
        </NavItem>

        <NavItem to="/angajati">
          <NavIcon>👷</NavIcon>
          <NavText>Angajați</NavText>
        </NavItem>

        <NavItem to="/financiar">
          <NavIcon>💰</NavIcon>
          <NavText>Financiar</NavText>
        </NavItem>

        <NavItem to="/rapoarte">
          <NavIcon>📈</NavIcon>
          <NavText>Rapoarte</NavText>
        </NavItem>

        <NavItem to="/setari">
          <NavIcon>⚙️</NavIcon>
          <NavText>Setări</NavText>
        </NavItem>
      </Nav>

      <LogoutButton onClick={logout}>
        <NavIcon>🚪</NavIcon>
        <NavText>Logout</NavText>
      </LogoutButton>
    </SidebarContainer>
  );
};

// Styled Components
const SidebarContainer = styled.div`
  width: 260px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  box-shadow: 4px 0 15px rgba(0,0,0,0.1);
`;

const Logo = styled.div`
  padding: 25px 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255,255,255,0.1);
`;

const LogoIcon = styled.div`
  font-size: 48px;
  margin-bottom: 10px;
`;

const LogoText = styled.div`
  font-size: 16px;
  font-weight: bold;
`;

const UserInfo = styled.div`
  padding: 25px 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255,255,255,0.1);
`;

const UserAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  margin: 0 auto 15px;
  border: 3px solid rgba(255,255,255,0.3);
`;

const UserName = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const UserRole = styled.div`
  font-size: 13px;
  opacity: 0.8;
  text-transform: uppercase;
`;

const Nav = styled.nav`
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 15px 25px;
  color: white;
  text-decoration: none;
  transition: background 0.3s;
  gap: 15px;

  &:hover {
    background: rgba(255,255,255,0.1);
  }

  &.active {
    background: rgba(255,255,255,0.2);
    border-left: 4px solid white;
  }
`;

const NavIcon = styled.span`
  font-size: 22px;
  width: 30px;
  text-align: center;
`;

const NavText = styled.span`
  font-size: 15px;
  font-weight: 500;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  padding: 15px 25px;
  background: rgba(0,0,0,0.2);
  color: white;
  border: none;
  cursor: pointer;
  gap: 15px;
  font-size: 15px;
  transition: background 0.3s;

  &:hover {
    background: rgba(0,0,0,0.3);
  }
`;

export default Sidebar;