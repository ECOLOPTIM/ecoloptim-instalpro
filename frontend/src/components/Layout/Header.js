import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user } = useAuth();

  return (
    <HeaderContainer>
      <Left>
        <Time>{new Date().toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Time>
      </Left>
      <Right>
        <NotificationIcon>🔔</NotificationIcon>
        <UserInfo>
          <UserName>{user?.nume_complet || user?.username}</UserName>
          <UserRole>{user?.rol}</UserRole>
        </UserInfo>
      </Right>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  background: white;
  padding: 15px 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Left = styled.div``;

const Time = styled.div`
  color: #666;
  font-size: 14px;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const NotificationIcon = styled.div`
  font-size: 24px;
  cursor: pointer;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 10px;
    height: 10px;
    background: #f44336;
    border-radius: 50%;
    border: 2px solid white;
  }
`;

const UserInfo = styled.div`
  text-align: right;
`;

const UserName = styled.div`
  font-weight: bold;
  font-size: 14px;
  color: #333;
`;

const UserRole = styled.div`
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
`;

export default Header;