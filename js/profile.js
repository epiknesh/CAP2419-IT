document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        window.location.href = 'login.html'; // Redirect if not logged in
        return;
    }

    console.log("Loaded user data:", user);

     // Profile picture elements
     const profileDropdownImg = document.querySelector('#profileDropdown img');
     const profileSectionImg = document.querySelector('#profile-pic');
 
     // Set profile pictures from user data
     if (profileDropdownImg && profileSectionImg) {
         const profilePicUrl = user.pic ? user.pic : 'img/people.png'; // Fallback if no pic
         profileDropdownImg.src = profilePicUrl;
         profileSectionImg.src = profilePicUrl;
     }

    // Populate form fields with user data
    document.getElementById('input_firstname').value = user.firstName || "";
    document.getElementById('input_lastname').value = user.lastName || "";
    document.getElementById('input_birthdate').value = user.birthdate ? user.birthdate.split('T')[0] : "";
    document.getElementById('input_username').value = user.email || "";
    document.getElementById('input_mobile').value = user.mobile || "";

    // Load profile picture if available
    if (user.profilePicture) {
        document.getElementById('profile-pic').src = user.profilePicture;
    }

    document.getElementById('edit-pic-btn').addEventListener('click', () => {
        document.getElementById('profile-pic-input').click();
    });

    document.getElementById('profile-pic-input').addEventListener('change', uploadProfilePicture);
});

async function uploadProfilePicture(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);
    formData.append("id", JSON.parse(localStorage.getItem('user')).id);

    try {
        const response = await fetch('http://localhost:3000/upload-profile-picture', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            alert("Profile picture updated successfully!");
            document.getElementById('profile-pic').src = data.profilePicture;
            
            // Update local storage with the new profile picture
            let user = JSON.parse(localStorage.getItem('user'));
            user.profilePicture = data.profilePicture;
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        alert("An error occurred while uploading the profile picture.");
    }
}

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
