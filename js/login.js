function prelogin(){
  
  // Clear previous error message
  clearErrorMessage();

  // Retrieve values from login.html
  var username = document.getElementById("input_username").value;
  var password = document.getElementById("input_password").value;

  

  // Check if username and password are empty
  if (username == "" && password == ""){
    displayMessage('Email and password cannot be empty.', 'both');
    return;
  } else if (username == ""){
    displayMessage('Email cannot be empty.', 'username');
  }else if (password == ""){
    displayMessage('Password cannot be empty.', 'password');
  }

}

function displayMessage(message,type){
  // Display error message
  var error_message = document.getElementById("error_message");
  error_message.innerHTML = message;
  error_message.className = 'alert alert-danger mb-5';

  // Make the input border red if there is an error
  if (type == 'both'){
    document.getElementById("input_username").style.borderColor = "red";
    document.getElementById("input_password").style.borderColor = "red";
  } else if (type == 'username'){
    document.getElementById("input_username").style.borderColor = "red";
  } else if (type == 'password'){
    document.getElementById("input_password").style.borderColor = "red";
  }

}

function clearErrorMessage(){
  // Clear error message
  var error_message = document.getElementById("error_message");
  error_message.innerHTML = "";
  error_message.className = '';

  // Clear the red border
  document.getElementById("input_username").style.borderColor = "";
  document.getElementById("input_password").style.borderColor = "";
}

// Show password functionm
document.querySelector('.toggle-input_password').addEventListener('click', function () {
  var passwordField = document.getElementById('input_password');
  var type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordField.setAttribute('type', type);
  this.classList.toggle('bi-eye-slash-fill');
  this.classList.toggle('bi-eye-fill');
});


// TO DO HERE:
// 1. Add the function to check if the email is valid or not through database
// 2, Add the function to check if the password is correct or not through database
// 3. Add the function to redirect to the dashboard page if the login is successful