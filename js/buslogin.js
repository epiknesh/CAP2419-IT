// buslogin.js
document.getElementById('loginSubmit').addEventListener('click', preLogin);

async function preLogin() {
    const username = document.getElementById('input_username').value;
    const password = document.getElementById('input_password').value;

    // Basic validation
    if (!username || !password) {
        showError('Please fill in all fields');
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

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            localStorage.setItem('token', result.token); // Store token
            window.location.href = 'bushome.html'; // Redirect to dashboard or home page
        } else {
            showError(result.message);
        }
    } catch (error) {
        showError('An error occurred. Please try again.');
    }
}

function showError(message) {
    const errorMessage = document.getElementById('error_message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}
