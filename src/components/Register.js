import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { useHistory, Link } from "react-router-dom";

import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";

const Register = () => {
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [formDataValues, setformDataValues] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  })
  const [progress,setProgress] =useState(true);
  const handleInput = (e) => {
    if (e.target.name === 'username') {
      setformDataValues({
        ...formDataValues,
        username: e.target.value
      })
    } else if (e.target.name === 'password') {
      setformDataValues({
        ...formDataValues,
        password: e.target.value
      })
    } else {
      setformDataValues({
        ...formDataValues,
        confirmPassword: e.target.value
      })

    }
    console.log(formDataValues);
  }


  /**
   * Definition for register handler
   * - Function to be called when the user clicks on the register button or submits the register form
   *
   * @param {{ username: string, password: string, confirmPassword: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/register"
   *
   * Example for successful response from backend for the API call:
   * HTTP 201
   * {
   *      "success": true,
   * }
   *
   * Example for failed response from backend for the API call:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Username is already taken"
   * }
   */
  const register = async (formData) => {

    try {

      const header = { 'Access-Control-Allow-Credentials': true }
      const response = await axios.post(`${config.endpoint}/auth/register`, formData, { crossDomain: true, 'Content-Type': 'application/json', });
      if (response.status === 201) {
        enqueueSnackbar("Registered successfully");
        history.push("/login",{from:"/register"});
        return {
          "success": true,
        }
      } else if (response === 400) {
        enqueueSnackbar("Something went wrong")
        return {
          "success": false,
          "message": "Username is already taken"
        }
      }


    } catch (e) {
      console.log(e.request)
    }
  };

  // TODO: CRIO_TASK_MODULE_REGISTER - Implement user input validation logic
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string, confirmPassword: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that username field is not less than 6 characters in length - "Username must be at least 6 characters"
   * -    Check that password field is not an empty value - "Password is a required field"
   * -    Check that password field is not less than 6 characters in length - "Password must be at least 6 characters"
   * -    Check that confirmPassword field has the same value as password field - Passwords do not match
   */
  const validateInput = (data) => {
    setProgress(false);
    
    let status = "";
    let isValid = false;
    if (formDataValues.username === "") {
      enqueueSnackbar("Username is a required field");
    } else if (formDataValues.username.length < 6) {
      enqueueSnackbar("Username must be at least 6 characters");
    }
    else {
      if (formDataValues.password === "") {
        enqueueSnackbar("Password is a required field");

      } else if (formDataValues.password.length < 5) {
        enqueueSnackbar("Password must be at least 6 characters");
      }
      if (formDataValues.confirmPassword === "") {
        enqueueSnackbar("confirmPassword is a required field");

      } else if (formDataValues.confirmPassword.length < 5) {
        enqueueSnackbar("confirmPassword must be at least 6 characters");
      }
      if (formDataValues.username.length > 5 && formDataValues.confirmPassword.length > 5 && formDataValues.password.length > 5) {
        if (formDataValues.password === formDataValues.confirmPassword) {
          const formData = {
            username: formDataValues.username,
            password: formDataValues.password
          }
          status = register(formData);
          if(status.success === true){
            setProgress(true);
            enqueueSnackbar(" Registered successfully");

          }else{
            setProgress(false);
            enqueueSnackbar(" Registered successfully Username is already taken");
          }
          isValid = true;
        } else {
          enqueueSnackbar("confirmPassword do not match to Password");

        }
      }

    }

    return isValid;

  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            fullWidth
            onChange={handleInput}
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            onChange={handleInput}
          />
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            onChange={handleInput}
          />
          {progress ? <Button className="button" variant="contained" onClick={validateInput}>
            Register Now
           </Button> :<CircularProgress />
          }
          <p className="secondary-action">
            Already have an account?{" "}
            <Link className="link" to="/login">
              Login here
             </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
