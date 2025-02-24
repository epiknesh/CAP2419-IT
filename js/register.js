$(document).ready(function() {
    // Validate mobile number
    $('#input_mobile').on('input', function() {
        var value = $(this).val();
        if (value.length > 11) {
            $(this).val(value.slice(0, 11));
        }
    });

    // Clear error messages on input
    $('input, select').on('input change', function() {
        clearErrorMessage($(this).attr('id'));
    });

    // Handle confirmation modal submit button click
    $('#confirmSubmit').on('click', function() {
        submitRegistration();
    });
});

function preregister() {
    clearErrorMessages();
    var isValid = true;

    // Validate required fields
    $('input[required], select[required]').each(function() {
        if ($(this).val().trim() === '') {
            showError($(this).attr('id'), 'This field is required.');
            isValid = false;
        }
    });

    var mobileNumber = $('#input_mobile').val();
    if (!/^\d{11}$/.test(mobileNumber)) {
        showError('input_mobile', 'Please enter a valid 11-digit mobile number.');
        isValid = false;
    }

    var password = $('#input_password').val();
    var confirmPassword = $('#input_confirm_password').val();
    if (password !== confirmPassword) {
        showError('input_confirm_password', 'Password and Confirm Password do not match.');
        isValid = false;
    }

    var role = $('#input_role').val();
    if (role === 'Choose...') {
        showError('input_role', 'Please select a valid role.');
        isValid = false;
    }

    if (isValid) {
        // If all validations pass, show confirmation modal
        $('#confirmationModal').modal('show');
    }
}

function submitRegistration() {
    console.log($('#input_lastname').val());  // Add this line before sending the request

    const accountData = {
        firstName: $('#input_firstname').val(),
        lastName: $('#input_lastname').val(),
        birthdate: $('#input_birthdate').val(),
        mobile: $('#input_mobile').val(),
        email: $('#input_username').val(),
        password: $('#input_password').val(),
        role: $('#input_role').val()
    };

    $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/register', // Change the URL if needed
        contentType: 'application/json',
        data: JSON.stringify(accountData),
        success: function(response) {
            alert(response.message);
            window.location.href = 'main_dashboard.html?tab=team'; // Redirect with tab parameter
        },        
        error: function(xhr) {
            alert(xhr.responseJSON?.message || 'Registration failed');
        }
    });

    $('#confirmationModal').modal('hide');
}

function showError(inputId, message) {
    var inputElement = $('#' + inputId);
    inputElement.addClass('is-invalid');
    var errorElement = $('<div class="error text-danger mt-1"></div>').text(message);
    inputElement.closest('.form-group').append(errorElement);
}

function clearErrorMessages() {
    $('.error').remove();
    $('input, select').removeClass('is-invalid');
}

function clearErrorMessage(inputId) {
    $('#' + inputId).removeClass('is-invalid');
    $('#' + inputId).closest('.form-group').find('.text-danger').remove();
}
