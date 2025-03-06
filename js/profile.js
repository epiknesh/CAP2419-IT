document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        window.location.href = 'login.html'; // Redirect if not logged in
        return;
    }

    console.log("Loaded user data:", user);

    // Populate form fields with user data
    document.getElementById('input_firstname').value = user.firstName || "";
    document.getElementById('input_lastname').value = user.lastName || "";
    document.getElementById('input_birthdate').value = user.birthdate ? user.birthdate.split('T')[0] : "";
    document.getElementById('input_username').value = user.email || "";
    document.getElementById('input_mobile').value = user.mobile || "";

    // Attach event listener to save button
    document.getElementById('save-btn').addEventListener('click', updateProfile);
});

async function updateProfile() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        alert("User data not found. Please log in again.");
        return;
    }

    const updatedData = {
        id: user.id,
        firstName: document.getElementById('input_firstname').value.trim(),
        lastName: document.getElementById('input_lastname').value.trim(),
        birthdate: document.getElementById('input_birthdate').value.trim(),
        email: document.getElementById('input_username').value.trim(),
        mobile: document.getElementById('input_mobile').value.trim()
    };

    try {
        const response = await fetch('http://localhost:3000/update-profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            localStorage.setItem('user', JSON.stringify(data.user)); // Update local storage
            window.location.reload(); // Refresh to reflect changes
        } else {
            alert(data.message); // Show error message
        }

    } catch (error) {
        console.error("Error updating profile:", error);
        alert("An error occurred while updating the profile.");
    }
}
