document.getElementById('loginSubmit').addEventListener('click', preLogin);

async function preLogin() {
    const username = document.getElementById('input_username').value;
    const password = document.getElementById('input_password').value;

    // Basic validation
    if (!username || !password) {
        showError('Please fill in all fields.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/buslogin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        // Check if response status is ok
        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            localStorage.setItem('token', result.token); // Store token
            window.location.href = 'bushome.html'; // Redirect to home page
        } else {
            // Handle specific server errors returned from the API
            if (result.message.includes('incorrect password')) {
                showError('Incorrect password. Please try again.');
            } else if (result.message.includes('user not found')) {
                showError('User not found. Please check your username.');
            } else {
                showError(result.message || 'An unexpected error occurred.');
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

fetch('/buslogin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
})
.then(response => response.json())
.then(data => {
    if (data.token) {
        localStorage.setItem('user', JSON.stringify(data.user)); // Store user data
    } else {
        alert(data.message);
    }
})
.catch(error => console.error('Error:', error));
