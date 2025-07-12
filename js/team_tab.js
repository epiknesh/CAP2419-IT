document.addEventListener("DOMContentLoaded", function () {
    // Ensure the DOM is fully loaded before attaching event listeners
    const teamTab = document.querySelector('#sidebar .side-menu.top li:nth-child(2) a');



    teamTab.addEventListener('click', async function (event) {
        event.preventDefault(); // Prevent default link behavior
        const mainContent = document.querySelector('#content main');

        const user = JSON.parse(localStorage.getItem('user'));
        if (["2", "3", "4", "5", "6"].includes(user.role)) {
            showAlert('You do not have permission to access this page.', 'danger');
            return;
        }
        

        // Show a loading message immediately
        mainContent.innerHTML = `
            <div class="loading-message" style="text-align: center; padding: 20px;">
                <h3>Loading team members...</h3>
            </div>
        `;

        try {
            const response = await fetch('/accounts'); 
            const accounts = await response.json();

            // Role mapping
            const roleMapping = {
                "1": "Admin",
                "2": "Driver",
                "3": "Controller",
                "4": "Dispatcher",
                "5": "Maintenance",
                "6": "Cashier"
            };

        // Generate table rows dynamically
        let tableRows = accounts.map(account => `
            <tr>
                <td>
                    <img src="${account.profilePicture || 'img/noprofile.jpg'}" alt="Profile Picture" style="width: 50px; height: 50px; border-radius: 50%;">
                    ${account.firstName} ${account.lastName}
                </td>
                <td>${account.email}</td> 
                <td>${new Date(account.birthdate).toLocaleDateString()}</td>
                <td>${new Date(account.createdAt).toLocaleDateString()}</td>
                <td>${roleMapping[account.role] || "Unknown"}</td>
                <td><button class="btn btn-danger" onclick="showRemoveConfirmationModal('${account._id}')">Remove</button></td>
            </tr>
        `).join('');

            // Inject content
            mainContent.innerHTML = `
                <div class="head-title">
                    <div class="left">
                        <h1>Team</h1>
                        <ul class="breadcrumb">
                            <li><a href="#">Team</a></li>
                            <li><i class='bx bx-chevron-right'></i></li>
                            <li><a class="active" href="#">Team</a></li>
                        </ul>
                    </div>
                </div>
                <div class="table-data">
                    <div class="order position-relative">
                        <div class="head">
                            <h3>Team Members</h3>
                            <a href="register.html" class="btn btn-success mb-4">
                                <i class='bx bx-plus'></i> Add New Member
                            </a>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>User <i id="sort-user" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                                    <th>Email <i id="sort-email" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                                    <th>Birthdate <i id="sort-birthdate" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                                    <th>Created At <i id="sort-createdAt" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                                    <th>Role <i id="sort-role" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
             const sortIcons = document.querySelectorAll('i[id^="sort-"]');

            sortIcons.forEach(icon => {
                icon.addEventListener('click', () => {
                    // Toggle icon
                    const isAscending = icon.classList.contains('bi-sort-up');
                    icon.classList.toggle('bi-sort-up');
                    icon.classList.toggle('bi-sort-down');

                    // Reset others
                    sortIcons.forEach(other => {
                        if (other !== icon) {
                            other.classList.remove('bi-sort-down');
                            other.classList.add('bi-sort-up');
                        }
                    });

                    // Sort table
                    const column = icon.id.replace('sort-', '');
                    sortTableByColumn(column, !isAscending); // toggle direction
                });
            });

        } catch (error) {
            console.error("Error fetching team data:", error);
            mainContent.innerHTML = `<p style="text-align:center; color:red;">Failed to load team members. Please try again later.</p>`;
        }
    });
});

// Sorting Function
function sortTableByColumn(columnKey, ascending = true) {
    const table = document.querySelector("table tbody");
    const rows = Array.from(table.querySelectorAll("tr"));

    // Column index mapping based on columnKey
    const columnMap = {
        user: 0,
        email: 1,
        birthdate: 2,
        createdAt: 3,
        role: 4
    };

    const columnIndex = columnMap[columnKey];
    if (columnIndex === undefined) return;

    const getCellValue = (row) => {
        const cell = row.children[columnIndex];

        // For "user" column, remove profile image alt text
        if (columnKey === "user") {
            return cell.textContent.trim().replace(/\s+/g, ' ');
        }

        return cell.textContent.trim();
    };

    const isDate = ["birthdate", "createdAt"].includes(columnKey);

    rows.sort((a, b) => {
        let valA = getCellValue(a);
        let valB = getCellValue(b);

        // Try to parse dates if applicable
        if (isDate) {
            valA = new Date(valA);
            valB = new Date(valB);
            return ascending ? valA - valB : valB - valA;
        }

        // Default string comparison (case-insensitive)
        return ascending
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
    });

    // Append sorted rows back to the table
    rows.forEach(row => table.appendChild(row));
}


// Function to show confirmation modal
function showRemoveConfirmationModal(userId) {
    // Create the modal HTML dynamically
    const modalHTML = `
        <div class="modal fade" id="confirmationModal" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true" style="color: black;">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="confirmationModalLabel">Confirm Removal</h5>
                    </div>
                    <div class="modal-body">
                        Are you sure you want to remove this member?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="confirmRemoveBtn">Remove</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Append the modal HTML to the body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Initialize the modal using Bootstrap's Modal API
    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    confirmationModal.show();

    // Handle removal confirmation
    document.getElementById('confirmRemoveBtn').addEventListener('click', async function () {
        try {
            const response = await fetch(`/accounts/${userId}`, { method: "DELETE" });
            if (response.ok) {
                
                location.reload();
            } else {
                alert("Failed to remove user.");
            }
            confirmationModal.hide();  // Hide the modal after action
            document.getElementById('confirmationModal').remove();  // Remove modal from DOM
        } catch (error) {
            console.error("Error removing user:", error);
            confirmationModal.hide();
            document.getElementById('confirmationModal').remove();  // Clean up modal
        }
    });

    // Clean up modal when dismissed
    document.querySelector('.btn-secondary').addEventListener('click', function () {
        confirmationModal.hide();
        document.getElementById('confirmationModal').remove();  // Clean up modal
    });
}
function showAlert(message, type) {
    let alertContainer = document.getElementById('alertContainer');

    // Create alert container if it doesn't exist
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alertContainer';
        document.body.prepend(alertContainer); // Add it at the top of the body
    }

    const alertHtml = `
        <div class="custom-alert alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
        </div>
    `;
    alertContainer.innerHTML = alertHtml;

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 3000);
}


