document.getElementById('registerSubmit').addEventListener('click', preRegister);

async function preRegister() {
    const username = document.getElementById('input_username').value;
    const firstName = document.getElementById('input_firstname').value;
    const lastName = document.getElementById('input_lastname').value;
    const email = document.getElementById('input_email').value;
    const phoneNumber = document.getElementById('input_phone').value;
    const password = document.getElementById('input_password').value;
    const profilePic = document.getElementById('input_profile_pic').files[0];

    // Basic validation
    if (!username || !firstName || !lastName || !email || !phoneNumber || !password) {
        showError('Please fill in all fields.');
        return;
    }

    // Validate email format
    const emailPattern = /^[a-zA-Z0-9._-]+@gmail\.com$/;
    if (!emailPattern.test(email)) {
        showError('Please enter a valid Gmail address.');
        return;
    }

    // Validate phone number (starts with '09' and has length of 11)
    const phonePattern = /^09\d{9}$/;
    if (!phonePattern.test(phoneNumber)) {
        showError('Please enter a valid phone number starting with 09 and 11 digits long.');
        return;
    }

    // Validate password strength (simple check for length)
    if (password.length < 6) {
        showError('Password must be at least 6 characters long.');
        return;
    }

    // Validate profile picture
    if (!profilePic) {
        showError('Please upload a profile picture.');
        return;
    }

    // Validate file type (only image files)
    const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validFileTypes.includes(profilePic.type)) {
        showError('Please upload a valid image file (JPEG, PNG, JPG).');
        return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('email', email);
    formData.append('phoneNumber', phoneNumber);
    formData.append('password', password);
    formData.append('profile_picture', profilePic);

    try {
        const response = await fetch('http://localhost:3000/busregister', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            window.location.href = 'buslogin.html'; // Redirect to login page
        } else {
            // Handle specific error messages from the API
            if (result.message.includes('username already exists')) {
                showError('Username already exists. Please choose another one.');
            } else if (result.message.includes('email already registered')) {
                showError('This email is already registered. Please use another one.');
            } else if (result.message.includes('phone number already registered')) {
                showError('This phone number is already registered. Please use another one.');
            } else {
                showError(result.message || 'An unexpected error occurred during registration.');
            }
        }
    } catch (error) {
        // Handle network or other unexpected errors
        if (error.name === 'TypeError') {
            showError('Network error. Please check your internet connection.');
        } else {
            showError('An error occurred. Please try again.');
        }
    }
}

function showError(message) {
    const errorMessage = document.getElementById('error_message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}
