    document.addEventListener("DOMContentLoaded", function () {

        //Import Css 
        const link  = document.createElement('link');
        link.rel='stylesheet';
        link.href='styles/modal.css';
        document.head.appendChild(link);

        const maintenanceBtn = document.getElementById('maintenanceBtn');
        const maintenanceTab = document.querySelector('#sidebar .side-menu.top li:nth-child(6) a');

        if (maintenanceBtn && maintenanceTab) {
            maintenanceBtn.addEventListener("click", function () {
                maintenanceTab.click(); // Simulates a click on the sidebar item
                console.log("Maintenance button clicked");
            });
        } else {
            console.error("Maintenance button or sidebar tab not found");
        }

        // Ensure the DOM is fully loaded before attaching event listeners
        maintenanceTab.addEventListener('click', async function (event) {
            event.preventDefault(); // Prevent default link behavior
            const mainContent = document.querySelector('#content main');

            const user = JSON.parse(localStorage.getItem('user'));
        if (["2", "3", "4", "6"].includes(user.role)) {
            showAlert('You do not have permission to access this page.', 'danger');
            return;
        }

             // Show a loading message immediately
            mainContent.innerHTML = `
                <div class="loading-message" style="text-align: center; padding: 20px;">
                    <h3>Loading Maintenance Report...</h3>
                </div>
            `;

            // Fetch maintenance data from the server
            try {
                const response = await fetch('/maintenance'); // API call to server
                const maintenanceData = await response.json();

                maintenanceData.sort((a, b) => a.busID - b.busID);

                // Generate table rows dynamically
                let fleetStatusRows = '';
                let fleetMaintenanceRows = '';

                maintenanceData.forEach(bus => {
                    // Convert schedule date to readable format
                    const scheduleDate = bus.schedule ? new Date(bus.schedule).toLocaleDateString('en-US') : 'N/A';

                    // Map status numbers to readable text and CSS classes
                    let statusText, statusClass;
                    switch (bus.status) {
                        case 1:
                            statusText = "Operating";
                            statusClass = "operating";
                            break;
                        case 2:
                            statusText = "Under Maintenance";
                            statusClass = "maintenance";
                            break;
                        case 3:
                            statusText = "Pending";
                            statusClass = "pending";
                            break;
                        default:
                            statusText = "Unknown";
                            statusClass = "unknown";
                    }

                    // Append to Fleet Readiness table
                    fleetStatusRows += `
                        <tr>
                            <td>${bus.busID}</td>
                            <td>${scheduleDate}</td>
                            <td><span class="status ${statusClass}">${statusText}</span></td>
                        </tr>
                    `;

                    // Append to Fleet Maintenance Report table (only for non-operating buses)
if (bus.status === 2) { // Only include buses that are Under Maintenance or Pending
    // Determine vehicle condition text
let conditionText;
switch (bus.vehicle_condition) {
    case 1:
        conditionText = "Minor";
        conditionClass = "maintenance-minor";
        break;
    case 2:
        conditionText = "Moderate";
        conditionClass = "maintenance-moderate";
        break;
    case 3:
        conditionText = "Major";
        conditionClass = "maintenance-major";
        break;
    default:
        conditionText = "Unknown";
        conditionClass = "maintenance-unknown";
}

fleetMaintenanceRows += `
    <tr>
        <td>${bus.busID}</td>
        <td>${bus.issue}</td>
        <td>${scheduleDate}</td>
        <td>${bus.schedule ? new Date(bus.schedule).toLocaleDateString('en-US') : 'N/A'}</td>
        <td>${bus.assignedStaff || 'Unassigned'}</td>
        <td><span class="status ${conditionClass}">${conditionText}</span></td>
        <td>
            <i class='bx bxs-note' style='color:#8ea096; font-size:24px; cursor:pointer;'
            data-bs-toggle="modal" 
            data-bs-target="#moreReportModal"
            data-bs-id="${bus.busID}">
            </i>
        </td>
    </tr>
`;

}
                });

                // Inject the HTML into the main content
                mainContent.innerHTML = `
                    <div class="head-title">
                        <div class="left">
                            <h1>Maintenance</h1>
                            <ul class="breadcrumb">
                                <li><a href="#">Maintenance</a></li>
                                <li><i class='bx bx-chevron-right'></i></li>
                                <li><a class="active" href="#">Maintenance</a></li>
                            </ul>
                        </div>
                    </div>

                    <!-- Data -->
                    <!-- ROW 1 -->
                    <!-- BOX 1: Fleet Readiness -->
                    <div class="table-data">
                        <div class="order position-relative" id="fleetStatus">
                            <div class="head">
                                <h3>Fleet Readiness</h3>
                                    <a href="#" id="editStatusBtn" class="btn btn-warning mb-4" data-bs-toggle="modal" data-bs-target="#editStatusModal">
                                    <i class='bx bxs-edit'></i> Edit Status
                                </a>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Bus ID</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${fleetStatusRows}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- ROW 2 -->
                    <!-- BOX 2: Fleet Maintenance Report -->
                    <div class="table-data">
                        <div class="order position-relative" id="fleetMaintenance">
                            <div class="head">
                                <h3>Fleet Maintenance Report</h3>
                                    <a href="#" id="editMaintenanceBtn" class="btn btn-warning mb-4" data-bs-toggle="modal" data-bs-target="#editMaintenanceModal">
                                    <i class='bx bxs-edit'></i> Edit Report
                                </a>
                            </div>
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Bus ID</th>
                                        <th>Issue</th>
                                        <th>Date Reported</th>
                                        <th>Scheduled Maintenance</th>
                                        <th>Assigned Staff</th>
                                        <th>Issue Severity</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${fleetMaintenanceRows}
                                </tbody>
                            </table>
                        </div>
                    </div>

                     <div id="alertContainer"></div>

                `;
            } catch (error) {
                console.error('Error fetching maintenance data:', error);
            }
            
            // Add event listener for the "Edit Report" button
            const editMaintenanceBtn = document.getElementById('editMaintenanceBtn');
            editMaintenanceBtn.addEventListener('click', function (event) {
                event.preventDefault();
                showFleetMaintenanceReportForm();
            });

            // Add event listener for the "Edit Status" button
            const editStatusBtn = document.getElementById('editStatusBtn');
            editStatusBtn.addEventListener('click', function (event) {
                event.preventDefault();
                showFleetReadinessForm();
            });

            // Add event listener for the "More Report" icon
            const moreReportIcons = document.querySelectorAll('.bxs-note');
            moreReportIcons.forEach(icon => {
                icon.addEventListener('click', function (event) {
                    event.preventDefault();
                    const busId = this.getAttribute('data-bs-id');
                    // Fetch and display more report details here
                    // For now, just log the bus ID
                    console.log(`More report for Bus ID: ${busId}`);
                    showMoreReportModal(busId);
                });
            });
        
        });
});

// Function to Show More Report Modal
function showMoreReportModal(busId) {
    // Fetch more report details from the server
    const modalHtml = `
        <div class="modal fade" id="moreReportModal" tabindex="-1" aria-labelledby="moreReportModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header" style="background-color:rgb(248, 225, 16); color: black;">
                        <h5 class="modal-title" id="moreReportModalLabel">Bus ${busId}</h5>
                        <button type="button" class="btn-close white-text" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Date Reported</th>
                                    <th>Issue</th>
                                    <th>Issue Severity</th>
                                    <th>Date Fixed</th>
                                </tr>
                            </thead>
                                <tbody>
                                  <!-- Report details will be injected here -->  
                                  <!-- Example row, replace with actual data -->
                                    <tr>
                                        <td>2023-10-01</td>
                                        <td>Engine Overheating</td>
                                        <td><span class="status maintenance-major">Major</span></td>
                                        <td>2023-10-05</td>
                                    </tr>
                                </tbody>
                            </table>            
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>                
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
     const modalElement = document.getElementById('moreReportModal');
        const moreReportModal = new bootstrap.Modal(modalElement);
        moreReportModal.show();

        modalElement.addEventListener('hidden.bs.modal', function () {
            modalElement.remove();
            document.querySelector('.modal-backdrop').remove();
            document.body.classList.remove('modal-open');
            document.body.style = '';
        });
}

function showMoreReportModal(busId) {
    // Build the base modal structure
    const modalHtml = `
        <div class="modal fade" id="moreReportModal" tabindex="-1" aria-labelledby="moreReportModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header" style="background-color:rgb(248, 225, 16); color: black;">
                        <h5 class="modal-title" id="moreReportModalLabel">Bus ${busId}</h5>
                        <button type="button" class="btn-close white-text" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Date Reported</th>
                                    <th>Issue</th>
                                    <th>Issue Severity</th>
                                    <th>Assigned Maintenance</th>
                                    <th>Date Fixed</th>
                                </tr>
                            </thead>
                            <tbody id="reportDetailsBody">
                                <tr><td colspan="5">Loading...</td></tr>
                            </tbody>
                        </table>            
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>                
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalElement = document.getElementById('moreReportModal');
    const moreReportModal = new bootstrap.Modal(modalElement);
    moreReportModal.show();

    // Fetch real data from server
  
    fetch(`/maintenance/history/${busId}`)
        .then(res => res.json())
        .then(data => {
            const tbody = modalElement.querySelector('#reportDetailsBody');
            tbody.innerHTML = ''; // Clear loading row

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">No maintenance history available.</td></tr>';
                return;
            }

            data.forEach(entry => {
                const severityClass = entry.vehicle_condition === 2
                    ? 'maintenance-major'
                    : entry.vehicle_condition === 1
                        ? 'maintenance-minor'
                        : 'maintenance-normal';

                const row = `
                    <tr>
                        <td>${new Date(entry.schedule).toLocaleDateString()}</td>
                        <td>${entry.issue}</td>
                        <td><span class="status ${severityClass}">${getSeverityText(entry.vehicle_condition)}</span></td>
                        <td>${entry.assignedStaff || 'Unassigned'}</td>
                        <td>${new Date(entry.dateFixed).toLocaleDateString()}</td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', row);
            });
        })
        .catch(err => {
            console.error(err);
            const tbody = modalElement.querySelector('#reportDetailsBody');
            tbody.innerHTML = '<tr><td colspan="5" class="text-danger">Failed to load data</td></tr>';
        });

    modalElement.addEventListener('hidden.bs.modal', function () {
        modalElement.remove();
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
        document.body.classList.remove('modal-open');
        document.body.style = '';
    });
}

// Helper function for severity label
function getSeverityText(value) {
    if (value === 3) return 'Major';
    if (value === 2) return 'Moderate';
    return 'Minor';
}


async function showFleetMaintenanceReportForm() {
    try {
        // Fetch maintenance bus data
        const busResponse = await fetch('/maintenance');
        const buses = await busResponse.json();

        // Filter and sort buses with status = 2 (under maintenance)
        const filteredBuses = buses
            .filter(bus => bus.status === 2)
            .sort((a, b) => a.busID - b.busID);

        // Fetch accounts and filter role = 5 (maintenance users)
        const accountsResponse = await fetch('/accounts');
        const accounts = await accountsResponse.json();
        const maintenanceUsers = accounts.filter(account => account.role === '5');

        // Generate bus options
        const busOptions = filteredBuses
            .map(bus => `<option value="${bus.busID}">${bus.busID}</option>`)
            .join('');

        // Generate maintainee options
        const maintaineeOptions = maintenanceUsers
            .map(user => {
                const fullName = `${user.firstName} ${user.lastName}`;
                return `<option value="${fullName}">${fullName}</option>`;
            })
            .join('');

        // Modal form HTML
        const formHtml = `
            <div class="modal fade" id="editMaintenanceModal" tabindex="-1" aria-labelledby="editMaintenanceModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="editMaintenanceModalLabel">Edit Fleet Maintenance Report</h5>
                            <button type="button" class="btn-close white-text" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="fleetMaintenanceForm">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="busId" class="form-label">Bus ID:</label>
                                        <select class="form-select" id="busId" name="busId" required>
                                            <option value="">Select Bus</option>
                                            ${busOptions}
                                        </select>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="issue" class="form-label">Issue:</label>
                                    <textarea class="form-control" id="issue" name="issue" rows="2" placeholder="Describe the vehicle's current issue" style="resize: none;"></textarea>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="scheduleMaintenance" class="form-label">Schedule Maintenance:</label>
                                        <input type="date" class="form-control" id="scheduleMaintenance" name="scheduleMaintenance">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="assignedMaintainee" class="form-label">Assigned Maintenance:</label>
                                        <select class="form-select" id="assignedMaintainee" name="assignedMaintainee">
                                            <option value="">Select Technician</option>
                                            ${maintaineeOptions}
                                        </select>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="vehicleCondition" class="form-label">Vehicle Condition:</label>
                                    <select class="form-select" id="vehicleCondition" name="vehicleCondition" required>
                                        <option value="">Select Condition</option>
                                        <option value="3">Major</option>
                                        <option value="2">Moderate</option>
                                        <option value="1">Minor</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-success" id="submitReport">Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', formHtml);

        // Map bus data by busID
        const busDataMap = {};
        filteredBuses.forEach(bus => {
            busDataMap[bus.busID] = bus;
        });

        // Auto-fill fields when Bus ID changes
        document.getElementById('busId').addEventListener('change', function () {
            const selectedBusId = this.value;
            const selectedBus = busDataMap[selectedBusId];

            if (selectedBus) {
                document.getElementById('issue').value = selectedBus.issue || '';
                document.getElementById('scheduleMaintenance').value = selectedBus.schedule
                    ? new Date(selectedBus.schedule).toISOString().split('T')[0]
                    : '';
                document.getElementById('assignedMaintainee').value = selectedBus.assignedStaff || '';
                document.getElementById('vehicleCondition').value = selectedBus.vehicle_condition?.toString() || '';
            } else {
                document.getElementById('issue').value = '';
                document.getElementById('scheduleMaintenance').value = '';
                document.getElementById('assignedMaintainee').value = '';
                document.getElementById('vehicleCondition').value = '';
            }
        });

        // Submit handler
        document.getElementById('submitReport').addEventListener('click', async function () {
            const busId = document.getElementById('busId').value;
            const issue = document.getElementById('issue').value;
            const scheduleMaintenance = document.getElementById('scheduleMaintenance').value;
            const assignedMaintainee = document.getElementById('assignedMaintainee').value;
            const vehicleCondition = document.getElementById('vehicleCondition').value;

            if (!busId || !issue || !vehicleCondition) {
                showAlert('Please fill in all required fields.', 'warning');
                return;
            }

            const updateData = {
                issue,
                schedule: scheduleMaintenance || null,
                assignedStaff: assignedMaintainee || null,
                vehicle_condition: parseInt(vehicleCondition)
            };

            try {
                const response = await fetch(`/maintenance/${busId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData)
                });

                if (response.ok) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editMaintenanceModal'));
                    modal.hide();
                    document.querySelector('#sidebar .side-menu.top li:nth-child(6) a').click(); // Reload content
                } else {
                    showAlert('Error updating maintenance record.', 'danger');
                }
            } catch (error) {
                console.error(error);
                showAlert('Server error.', 'danger');
            }
        });

        // Show modal
        const modalElement = document.getElementById('editMaintenanceModal');
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();

        // Clean up after modal is hidden
        modalElement.addEventListener('hidden.bs.modal', function () {
            modalElement.remove();
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
            document.body.classList.remove('modal-open');
            document.body.style = '';
        });

    } catch (error) {
        console.error('Error loading form:', error);
        showAlert('Failed to load form data.', 'danger');
    }
}




function showFleetReadinessForm() {
    fetch('/maintenance')
        .then(response => response.json())
        .then(buses => {
            buses.sort((a, b) => a.busID - b.busID); // Sort bus IDs numerically
            const busOptions = buses.map(bus => `<option value="${bus.busID}">${bus.busID}</option>`).join('');
            
            const formHtml = `
                <div class="modal fade" id="editStatusModal" tabindex="-1" aria-labelledby="editStatusModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="editStatusModalLabel">Edit Fleet Readiness</h5>
                                <button type="button" class="btn-close white-text" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form id="fleetReadinessForm">
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="busId" class="form-label">Bus ID:</label>
                                            <select class="form-select" id="busId" name="busId" required>
                                                <option value="">Select Bus</option>
                                                ${busOptions}
                                            </select>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="busStatus" class="form-label">Status:</label>
                                            <select class="form-select" id="busStatus" name="busStatus" required>
                                                <option value="">Select Status</option>
                                                <option value="1">Operating</option>
                                                <option value="2">Under Maintenance</option>
                                                <option value="3">Pending</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div id="additionalFields" style="display: none;">
                                        <div class="mb-3">
                                            <label for="issue" class="form-label">Issue:</label>
                                            <textarea class="form-control" id="issue" name="issue" rows="2" placeholder="Describe the vehicle's current issue" style="resize: none;"></textarea>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="scheduleMaintenance" class="form-label">Schedule Maintenance:</label>
                                                <input type="date" class="form-control" id="scheduleMaintenance" name="scheduleMaintenance">
                                            </div>
                                            <div class="col-md-6 mb-3" id="assignedMaintaineeContainer">
                                                <label for="assignedMaintainee" class="form-label">Assigned Maintenance:</label>
                                                <select class="form-select" id="assignedMaintainee" name="assignedMaintainee">
    <option value="">Select Technician</option>
</select>

                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label for="vehicleCondition" class="form-label">Vehicle Condition:</label>
                                            <select class="form-select" id="vehicleCondition" name="vehicleCondition" required>
                                                <option value="">Select Condition</option>
                                                <option value="3">Major</option>
                                                <option value="2">Moderate</option>
                                                <option value="1">Minor</option>
                                            </select>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-success" id="submitStatus">Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Fetch all accounts and filter for role 5 (maintenance users)
fetch('/accounts')
    .then(response => response.json())
    .then(accounts => {
        const maintenanceUsers = accounts.filter(user => user.role === "5");
        const maintaineeSelect = document.getElementById('assignedMaintainee');

        maintenanceUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.accountID;
            option.textContent = `${user.firstName} ${user.lastName}`;
            maintaineeSelect.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Failed to load maintenance accounts:', error);
        showAlert('Could not load maintenance user list.', 'warning');
    });


            
            document.body.insertAdjacentHTML('beforeend', formHtml);
            
            const busStatus = document.getElementById('busStatus');
            const additionalFields = document.getElementById('additionalFields');
            
            busStatus.addEventListener('change', function () {
                if (busStatus.value === "2") {
                    additionalFields.style.display = 'block';
                } else {
                    additionalFields.style.display = 'none';
                }
            });
            
            document.getElementById('submitStatus').addEventListener('click', async function () {
                const busId = document.getElementById('busId').value;
                const busStatus = document.getElementById('busStatus').value;
                const issue = document.getElementById('issue').value;
                const vehicleCondition = document.getElementById('vehicleCondition').value;
                const scheduleMaintenance = document.getElementById('scheduleMaintenance').value;
                const assignedMaintaineeSelect = document.getElementById('assignedMaintainee');
const assignedMaintainee = assignedMaintaineeSelect.options[assignedMaintaineeSelect.selectedIndex].text;


                if (!busId || !busStatus) {
                    showAlert('Please fill in all required fields.', 'warning');
                    return;
                }
                
                const updateData = {
                    status: parseInt(busStatus),
                    issue: issue || '',
                    vehicle_condition: parseInt(vehicleCondition) || null,
                    schedule: scheduleMaintenance || null,
                    assignedStaff: assignedMaintainee || null
                };

                try {
                    const response = await fetch(`/maintenance/${busId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateData)
                    });

                    if (response.ok) {

                        
                        const editStatusModal = bootstrap.Modal.getInstance(document.getElementById('editStatusModal'));
                        editStatusModal.hide(); // Hide the modal
                        document.querySelector('#sidebar .side-menu.top li:nth-child(6) a').click(); // Refresh the tab content
                        
                    } else {
                        showAlert('Error updating status.', 'danger');
                    }
                } catch (error) {
                    console.error(error);
                    showAlert('Server error.', 'danger');
                }
            });
            
            const modalElement = document.getElementById('editStatusModal');
            const editStatusModal = new bootstrap.Modal(modalElement);
            editStatusModal.show();
            
            modalElement.addEventListener('hidden.bs.modal', function () {
                modalElement.remove();
                document.querySelector('.modal-backdrop').remove();
                document.body.classList.remove('modal-open');
                document.body.style = '';
            });
        });
}


// Function to Show Alert
function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    const alertHtml = `
      <div class="custom-alert alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
      </div>
    `;
    alertContainer.innerHTML = alertHtml;
  
    // Auto-dismiss the alert after 3 seconds
    setTimeout(() => {
      const alertElement = alertContainer.querySelector('.alert');
      if (alertElement) {
        alertElement.classList.remove('show');
        alertElement.classList.add('hide');
        setTimeout(() => alertElement.remove(), 500);
      }
    }, 5000);
  }
  


