import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";
import { useHistory, Link } from "react-router-dom";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();
  const login = localStorage.getItem('username');
  function handleLogout(){
    localStorage.removeItem('username');
    localStorage.removeItem('token');
window.location.reload();
  }
  return (
    <Box className="header">
      <Box className="header-title">
        <img src="logo_light.svg" alt="QKart-icon"></img>
      </Box>
      {children}
      {hasHiddenAuthButtons &&
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => history.push("/", { from: "/login" })}
        >
          Back to explore
      </Button>}
        {!hasHiddenAuthButtons ?
        !login ?
        <Stack direction="row" spacing={2}>
          <Button onClick={()=>history.push("/login",{from:'header'})}>Login</Button>
          <Button variant="contained" onClick={()=>history.push("/register",{from:'header'})}>Register</Button>
        </Stack> :
        <Stack direction="row" spacing={2}>
          <Avatar alt={login} src="public/avatar.png " />{login}
          <Button onClick={handleLogout}>Logout</Button>
        </Stack>
        :""
      }
      


    </Box>
  );
};

export default Header;
