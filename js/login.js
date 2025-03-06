async function prelogin() {
  clearErrorMessage();

  var username = document.getElementById("input_username").value;
  var password = document.getElementById("input_password").value;

  if (username === "" || password === "") {
      displayMessage('Email and password cannot be empty.', 'both');
      return;
  }

  try {
      const response = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: username, password: password })
      });

      const data = await response.json();

      if (response.ok) {
          localStorage.setItem('token', data.token); // Store token
          localStorage.setItem('user', JSON.stringify(data.user)); // Store user details
          
          window.location.href = 'main_dashboard.html'; // Redirect on success
      } else {
          displayMessage(data.message, 'both'); // Show error message
      }

  } catch (error) {
      console.error('Login error:', error);
      displayMessage('Server error. Try again later.', 'both');
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