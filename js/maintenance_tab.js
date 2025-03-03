    document.addEventListener("DOMContentLoaded", function () {

        //Import Css 
        const link  = document.createElement('link');
        link.rel='stylesheet';
        link.href='styles/modal.css';
        document.head.appendChild(link);

        // Ensure the DOM is fully loaded before attaching event listeners
        const teamTab = document.querySelector('#sidebar .side-menu.top li:nth-child(6) a');
        teamTab.addEventListener('click', async function (event) {
            event.preventDefault(); // Prevent default link behavior
            const mainContent = document.querySelector('#content main');

            // Fetch maintenance data from the server
            try {
                const response = await fetch('http://localhost:3000/maintenance'); // API call to server
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
                                        <th>Vehicle Condition</th>
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
        
        });
});
async function showFleetMaintenanceReportForm() {
    try {
        // Fetch bus IDs from maintenance database
        const response = await fetch('http://localhost:3000/maintenance');
        const buses = await response.json();

        // Filter buses that are under maintenance (status = 2) and sort numerically
        const filteredBuses = buses
            .filter(bus => bus.status === 2)
            .sort((a, b) => a.busID - b.busID); // Sort numerically

        // Generate dropdown options dynamically
        const busOptions = filteredBuses.map(bus => `<option value="${bus.busID}">${bus.busID}</option>`).join('');

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
                                        <input type="text" class="form-control" id="assignedMaintainee" name="assignedMaintainee" placeholder="Enter assigned technician">
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
                const response = await fetch(`http://localhost:3000/maintenance/${busId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData)
                });

                if (response.ok) {
                    
                    const editMaintenanceModal = bootstrap.Modal.getInstance(document.getElementById('editMaintenanceModal'));
                    editMaintenanceModal.hide(); // Hide modal
                    document.querySelector('#sidebar .side-menu.top li:nth-child(6) a').click(); // Refresh tab content
                } else {
                    showAlert('Error updating maintenance record.', 'danger');
                }
            } catch (error) {
                console.error(error);
                showAlert('Server error.', 'danger');
            }
        });

        const modalElement = document.getElementById('editMaintenanceModal');
        const editMaintenanceModal = new bootstrap.Modal(modalElement);
        editMaintenanceModal.show();

        modalElement.addEventListener('hidden.bs.modal', function () {
            modalElement.remove();
            document.querySelector('.modal-backdrop').remove();
            document.body.classList.remove('modal-open');
            document.body.style = '';
        });

    } catch (error) {
        console.error('Error fetching maintenance data:', error);
        showAlert('Failed to load maintenance data.', 'danger');
    }
}



function showFleetReadinessForm() {
    fetch('http://localhost:3000/maintenance')
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
                                                <input type="text" class="form-control" id="assignedMaintainee" name="assignedMaintainee" placeholder="Enter assigned technician">
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
                const assignedMaintainee = document.getElementById('assignedMaintainee').value;

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
                    const response = await fetch(`http://localhost:3000/maintenance/${busId}`, {
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
  


