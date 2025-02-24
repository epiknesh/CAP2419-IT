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
                    if (bus.vehicle_condition !== 1) {
                        let conditionClass;
                        if (bus.vehicle_condition === 3) {
                            conditionClass = "maintenance-major";
                        } else if (bus.vehicle_condition === 2) {
                            conditionClass = "maintenance-moderate";
                        } else {
                            conditionClass = "maintenance-minor";
                        }

                        fleetMaintenanceRows += `
                            <tr>
                                <td>${bus.busID}</td>
                                <td>${bus.issue}</td>
                                <td>${scheduleDate}</td>
                                <td>${bus.schedule ? new Date(bus.schedule).toLocaleDateString('en-US') : 'N/A'}</td>
                                <td>${bus.assignedStaff || 'Unassigned'}</td>
                                <td><span class="status ${conditionClass}">${bus.status === 2 ? 'Major' : bus.status === 3 ? 'Moderate' : 'Minor'}</span></td>
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
// TO DO: Only Shows the "Under Maintenance" in Bus ID Dropdown
function showFleetMaintenanceReportForm(){
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
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                    </select>
                                </div>
                            </div>
                                <div class="mb-3">
                                    <label for="issue" class="form-label">Issue:</label>
                                    <textarea class="form-control" id="issue" name="issue" rows="4" placeholder="Describe the issue in detail"></textarea>
                                </div>
                                  <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="scheduleMaintenance" class="form-label">Schedule Maintenance:</label>
                                        <input type="date" class="form-control" id="scheduleMaintenance" name="scheduleMaintenance">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="assignedMaintainee" class="form-label">Assigned Maintenance:</label>
                                        <select class="form-select" id="assignedMaintainee" name="assignedMaintainee" required>
                                            <option value="">Select Maintenance</option>
                                            <option value="Technician A">Technician A</option>
                                            <option value="Technician B">Technician B</option>
                                            <option value="Technician C">Technician C</option>
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
    
    // Append the modal to the body
    document.body.insertAdjacentHTML('beforeend', formHtml);
    
    // Event listener for the Submit button
    document.getElementById('submitReport').addEventListener('click', function () {
    const busId = document.getElementById('busId').value;
    const issue = document.getElementById('issue').value;
    const scheduleMaintenance = document.getElementById('scheduleMaintenance').value;
    const assignedMaintainee = document.getElementById('assignedMaintainee').value;
    const vehicleCondition = document.getElementById('vehicleCondition').value;

        if (busId && issue && scheduleMaintenance && assignedMaintainee && vehicleCondition) {
            showAlert('Maintenance report has been successfully updated!', 'success');
            editMaintenanceModal.hide();
        } else {
            showAlert('Please fill in all fields.', 'warning');
        }
    });

    // Initialize Bootstrap's modal
    const modalElement = document.getElementById('editMaintenanceModal');
    const editMaintenanceModal = new bootstrap.Modal(modalElement);
    editMaintenanceModal.show();

    // Cleanup the modal once it's hidden
    modalElement.addEventListener('hidden.bs.modal', function () {
        modalElement.remove();
        document.querySelector('.modal-backdrop').remove();
        document.body.classList.remove('modal-open');
        document.body.style = '';
    });
}

function showFleetReadinessForm() {
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
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-5">
                                    <label for="busStatus" class="form-label">Status:</label>
                                    <select class="form-select" id="busStatus" name="busStatus" required>
                                        <option value="">Select Status</option>
                                        <option value="Operating">Operating</option>
                                        <option value="Under Maintenance">Under Maintenance</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                            </div>
                            <!-- Additional Inputs for Under Maintenance -->
                            <div id="additionalFields" style="display: none;">
                                <div class="mb-3">
                                    <label for="issue" class="form-label">Issue:</label>
                                    <textarea class="form-control" id="issue" name="issue" rows="4" placeholder="Describe the issue in detail"></textarea>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="scheduleMaintenance" class="form-label">Schedule Maintenance:</label>
                                        <input type="date" class="form-control" id="scheduleMaintenance" name="scheduleMaintenance">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="assignedMaintainee" class="form-label">Assigned Maintenance:</label>
                                        <select class="form-select" id="assignedMaintainee" name="assignedMaintainee" required>
                                            <option value="">Select Maintenance</option>
                                            <option value="Technician A">Technician A</option>
                                            <option value="Technician B">Technician B</option>
                                            <option value="Technician C">Technician C</option>
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

    // Append the modal to the body
    document.body.insertAdjacentHTML('beforeend', formHtml);

    // Show/Hide additional fields based on selected status
    const busStatus = document.getElementById('busStatus');
    const additionalFields = document.getElementById('additionalFields');
    busStatus.addEventListener('change', function () {
        if (busStatus.value === "Under Maintenance") {
            additionalFields.style.display = 'block';
        } else {
            additionalFields.style.display = 'none';
        }
    });

    // Event listener for the Submit button
    document.getElementById('submitStatus').addEventListener('click', function () {
        const busId = document.getElementById('busId').value;
        const bus_status = document.getElementById('busStatus').value;

        // Check if "Under Maintenance" is selected
        if (bus_status === "Under Maintenance") {
            const issue = document.getElementById('issue').value;
            const scheduleMaintenance = document.getElementById('scheduleMaintenance').value;
            const assignedMaintainee = document.getElementById('assignedMaintainee').value;
            const vehicleCondition = document.getElementById('vehicleCondition').value;

            // Ensure all required fields are filled
            if (busId && bus_status && issue && scheduleMaintenance && assignedMaintainee && vehicleCondition) {
                showAlert('Status has been successfully updated!', 'success');
                editStatusModal.hide();
            } else {
                showAlert('Please fill in all fields for maintenance.', 'warning');
            }
        } else {
            // If not "Under Maintenance", only Bus ID and Status are required
            if (busId && bus_status) {
                showAlert('Status has been successfully updated!', 'success');
                editStatusModal.hide();
            } else {
                showAlert('Please fill in all fields', 'warning');
            }
        }
    });

    // Initialize Bootstrap's modal
    const modalElement = document.getElementById('editStatusModal');
    const editStatusModal = new bootstrap.Modal(modalElement);
    editStatusModal.show();

    // Cleanup the modal once it's hidden
    modalElement.addEventListener('hidden.bs.modal', function () {
        modalElement.remove();
        document.querySelector('.modal-backdrop').remove();
        document.body.classList.remove('modal-open');
        document.body.style = '';
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
  


