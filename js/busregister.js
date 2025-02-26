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
        showError('Please fill in all fields');
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
