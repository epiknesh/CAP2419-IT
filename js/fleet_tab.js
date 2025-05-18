document.addEventListener("DOMContentLoaded", function () {

    //Import Css 
    const link  = document.createElement('link');
    link.rel='stylesheet';
    link.href='styles/modal.css';
    document.head.appendChild(link);

    const fleetBtn = document.getElementById('fleetBtn');

    const fleetTab = document.querySelector('#sidebar .side-menu.top li:nth-child(4) a');

// Ensure fleetBtn triggers fleetTab when clicked
if (fleetBtn && fleetTab) {
    fleetBtn.addEventListener("click", function () {
        fleetTab.click(); // Simulates a click on the sidebar item
        console.log("Fleet button clicked");
    });
} else {
    console.error("Fleet button or sidebar tab not found");
}

// Fleet Tab Click Event Listener
fleetTab.addEventListener("click", async function (event) {
    event.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));

    // Restrict access for specific roles
    if (["2", "3", "5", "6"].includes(user.role)) {
        showAlert("You do not have permission to access this page.", "danger");
        return;
    }

    console.log("Fleet tab clicked. Access granted.");
    // Proceed with loading fleet data if needed


    updateBusLocations();
        const mainContent = document.querySelector('#content main');

        if (!document.querySelector("#fleetContainer")) {
            mainContent.innerHTML = `
                <div id="fleetContainer">
                    <div class="head-title">
                        <div class="left">
                            <h1>Fleet</h1>
                            <ul class="breadcrumb">
                                <li><a href="#">Fleet</a></li>
                                <li><i class='bx bx-chevron-right'></i></li>
                                <li><a class="active" href="#">Fleet</a></li>
                            </ul>
                        </div>
                    </div>

                    <div class="table-data">
                        <div class="order" id="fleetMap">
                            <div class="head">
                                <h3>Fleet Map</h3>
                            </div>
                            <div id="map" style="height: 400px;"></div>
                        </div>
                    </div>

                    <div class="table-data">
                        <div class="order position-relative" id="fleetCapacity">
                            <div class="head">
                                <h3>Current Fleet Capacity</h3>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Bus ID</th>
                                        <th>Date</th>
                                        <th>Percentage</th>
                                        <th>Capacity</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>

                    <div class="table-data">
                        <div class="order position-relative" id="fleetStatus">
                            <div class="head">
                                <h3>Fleet Readiness</h3>
                                    <a href="#" id="editFleetBtn" class="btn btn-warning mb-4" data-bs-toggle="modal" data-bs-target="#editFleetStatusModal">
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
                                <tbody></tbody>
                            </table>
                        </div>

                        <div class="order position-relative" id="fleetMaintenance">
                            <div class="head">
                                <h3>Fleet Maintenance Report</h3>
                            </div>
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Bus ID</th>
                                        <th>Issue</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>

                    <div class="table-data">
                        <div class="order position-relative" id="fleetDriver">
                            <div class="head">
                                <h3>Fleet Personnel</h3>
                                    <a href="#" id="editPersonnelBtn" class="btn btn-warning mb-4" data-bs-toggle="modal" data-bs-target="#editFleetPersonnelModal">
                                    <i class='bx bxs-edit'></i> Edit Assignment
                                </a>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Bus ID</th>
                                        <th>Controller</th>
                                        <th>Driver</th>
                                    </tr>
                                </thead>
                                <tbody id="fleetPersonnelTable"></tbody>
                            </table>
                        </div>
                    </div>

                    <div class="table-data">
                        <div class="order position-relative" id="fleetFuel">
                            <div class="head">
                                <h3>Fuel Report</h3>
                                    <a href="#" id="editFuelBtn" class="btn btn-warning mb-4" data-bs-toggle="modal" data-bs-target="#editFleetFuelModal">
                                    <i class='bx bxs-edit'></i> Edit Fuel Report
                                </a>
                            </div>
                            <table>
                                <thead>
    <tr>
        <th>Bus ID</th>
        <th>Fuel Refilled (Liters)</th>
        <th>Last Fuel Refill</th>
        <th>
            <div>
                Remaining Fuel Level
            </div>
            <div class="text-secondary"> 
                <small>Estimated Remaining Fuel Level after the last trip</small>
            </div>
        </th>
    </tr>
</thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>2021-09-01</td>
                                        <td>
                                           <div class="progress">
                                                <div class="progress-bar bg-success" role="progressbar" id="fuelProgress" style="width: 50%" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
                                            </div>
                                            <span id="fuelPercentage1">50%</span>
                                        </td>
                                    </tr>
                                </tbody>
                                <tbody id="fleetPersonnelTable"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div id="alertContainer"></div>

            `;
            
            initializeMap(); // Call function to initialize the map
        }

                // Fetch and update fleet capacity every 10 seconds
        setInterval(async () => {
            await fetchFleetCapacity();
        }, 2000);

        // Initial call to populate the table immediately
        fetchFleetCapacity();
        await fetchFleetStatus();
        await fetchFleetPersonnel();
// Fetch initial bus locations and refresh every 5 seconds
updateBusLocations();
setInterval(updateBusLocations, 5000);

// Fetch fleet fuel data
await fetchFleetFuel();

// Add event listener for the "Edit Status" button
const editStatusBtn = document.getElementById("editFleetBtn");
if (editStatusBtn) {
    editStatusBtn.addEventListener("click", function (event) {
        event.preventDefault();
        showFleetReadinessStatusForm();
    });
}

const editFleetBtn = document.getElementById("editPersonnelBtn");
editFleetBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("EDIT BTN CLICKED");
    showFleetPersonnelForm();
}, { once: true });


// Add event listener for the "Edit Fuel Report" button
const editFuelBtn = document.getElementById("editFuelBtn");
if (editFuelBtn) {
    editFuelBtn.addEventListener("click", function (event) {
        event.preventDefault();
        showFuelReportForm();
    });
}

    });
});


let map;
let busMarkers = {};  // Store bus markers for live updates

// Initialize OpenStreetMap
function initializeMap() {
    map = L.map("map").setView([14.5995, 120.9842], 13); // Centered on Manila

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);
}
const busIcon = L.icon({
    iconUrl: './img/bus-icon.png', // Path to your custom icon
    iconSize: [45.875, 55.375], // Width and height of the icon
    iconAnchor: [22.9, 55.375], // Point of the icon that corresponds to marker’s location
    popupAnchor: [0, -35] // Offset for the popup
});

async function updateBusLocations() {
    try {
        console.log("📡 Fetching bus locations...");
        const response = await fetch("http://localhost:8000/api/get_locations");
        const data = await response.json();

        // 🔹 Clear all existing markers before recreating
        Object.values(busMarkers).forEach(marker => map.removeLayer(marker));
        busMarkers = {}; // Reset markers object

        Object.keys(data).forEach(bus_id => {
            const { latitude, longitude } = data[bus_id];

            // 🚌 Create marker with custom bus icon
            busMarkers[bus_id] = L.marker([latitude, longitude], { icon: busIcon })
                .addTo(map)
                .bindPopup(`🚌 <b>Bus ID:</b> ${bus_id}`);

            console.log(`✅ Created marker for Bus ${bus_id} at [${latitude}, ${longitude}]`);
        });

    } catch (error) {
        console.error("❌ Error fetching bus data:", error);
    }
}
// Function to fetch fleet capacity
// Store buses that have already triggered the email notification to prevent duplicate sends
const notifiedBuses = new Set();

async function fetchFleetCapacity() {
    try {
        const response = await fetch('http://localhost:3000/capacity');
        const capacities = await response.json();

        const latestCapacities = capacities.reduce((acc, entry) => {
            const busID = entry.busID;
            if (!acc[busID] || new Date(entry.date) > new Date(acc[busID].date)) {
                acc[busID] = entry;
            }
            return acc;
        }, {});

        const maxCapacity = 60;
        const tableBody = document.querySelector("#fleetCapacity tbody");
        tableBody.innerHTML = "";

        for (const entry of Object.values(latestCapacities)) {
            const percentage = (entry.capacity / maxCapacity) * 100;
            const formattedDate = new Date(entry.date).toLocaleString("en-US", {
                timeZone: "UTC",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true
            });

            // Append capacity data to table
            tableBody.innerHTML += `
                <tr>
                    <td>${entry.busID}</td>
                    <td>${formattedDate}</td>
                    <td>${percentage.toFixed(2)}%</td>
                    <td>
                        <div class="progress">
                            <div class="progress-bar ${percentage >= 100 ? 'bg-danger' : 'bg-success'}" 
                                role="progressbar" 
                                style="width: ${percentage}%"
                                aria-valuenow="${percentage}" 
                                aria-valuemin="0" 
                                aria-valuemax="100">
                            </div>
                        </div>
                    </td>
                </tr>
            `;

            // Send email notification if capacity reaches 100%
            if (percentage >= 100 && !notifiedBuses.has(entry.busID)) {
                await sendCapacityEmail(entry.busID, formattedDate);
                notifiedBuses.add(entry.busID); // Mark as notified
            }
        }
    } catch (error) {
        console.error("Error fetching fleet capacity data:", error);
    }
}

    // Retrieve user info from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const loggedEmail = user.email;
    const accountID = user.accountid;
    const service_id = "service_sgqumch";
    const template_id = "template_2rljx4t";

    // Initialize EmailJS
    window.addEventListener('load', function () {
        if (!window.emailjs) {
            console.error("EmailJS SDK did not load. Check your network or script URL.");
            return;
        }
        emailjs.init("-d3fui43Avx0AbMV5"); // Replace with your EmailJS user ID
    });


async function sendCapacityEmail(busID, formattedDate) {
    try {
        // Fetch user's notification settings
        const settingsResponse = await fetch(`http://localhost:3000/settings/${accountID}`);
        const settings = await settingsResponse.json();

        // Only send email if capacity notifications are enabled
        if (settings.capacity_notif) {
            const templateParams = {
                to_email: loggedEmail,
                subject: `Bus ${busID} Reached Full Capacity`,
                message: `Bus ${busID} has reached full capacity at ${formattedDate}.`
            };

            await emailjs.send(service_id, template_id, templateParams);
            console.log(`Email notification sent for Bus ${busID} full capacity.`);
        }
    } catch (error) {
        console.error("Error sending capacity email:", error);
    }
}


// Function to fetch fleet status and maintenance
async function fetchFleetStatus() {
    try {
        const response = await fetch("http://localhost:3000/maintenance");
        const buses = await response.json();

        const fleetStatusTable = document.querySelector("#fleetStatus tbody");
        const fleetMaintenanceTable = document.querySelector("#fleetMaintenance tbody");
        
        fleetStatusTable.innerHTML = "";
        fleetMaintenanceTable.innerHTML = "";

        buses.forEach(bus => {
            let statusText = bus.status === 1 ? "Operating" : bus.status === 2 ? "Under Maintenance" : "Pending";
            let statusClass = bus.status === 1 ? "operating" : bus.status === 2 ? "maintenance" : "pending";

            fleetStatusTable.innerHTML += `
                <tr>
                    <td>${bus.busID}</td>
                    <td>${new Date().toLocaleDateString()}</td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                </tr>
            `;

            if (bus.status === 2 || bus.status === 3) {
                fleetMaintenanceTable.innerHTML += `
                    <tr>
                        <td>${bus.busID}</td>
                        <td>${bus.issue || "No details provided"}</td>
                    </tr>
                `;
            }
        });

    } catch (error) {
        console.error("Error fetching fleet status:", error);
    }
}

// Function to fetch fleet personnel
async function fetchFleetPersonnel() {
    try {
        const response = await fetch('http://localhost:3000/fleetPersonnel');
        const fleetPersonnel = await response.json();
        const tableBody = document.getElementById('fleetPersonnelTable');
        tableBody.innerHTML = '';

        fleetPersonnel.sort((a, b) => a.busID - b.busID);

        fleetPersonnel.forEach(personnel => {
            // Check if controller or driver is null and replace with "Unassigned"
            const controller = personnel.controller === null ? "Unassigned" : personnel.controller;
            const driver = personnel.driver === null ? "Unassigned" : personnel.driver;

            tableBody.innerHTML += `
                <tr>
                    <td>${personnel.busID}</td>
                    <td>${controller}</td>
                    <td>${driver}</td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error loading fleet personnel:", error);
    }
}


// Function to show the Fleet Readiness form || Edit Status Button
function showFleetReadinessStatusForm() {
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
                    document.querySelector('#sidebar .side-menu.top li:nth-child(4) a').click(); // Refresh the tab content
                    
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

// Function to show the Fleet Personnel form || Edit Assignment Button
function showFleetPersonnelForm() {
        // 🚨 Remove any existing modal before inserting a new one
    const existingModal = document.getElementById('editFleetPersonnelModal');
    if (existingModal) {
        const existingInstance = bootstrap.Modal.getInstance(existingModal);
        if (existingInstance) {
            existingInstance.hide();
        }
        existingModal.remove();
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
        document.body.classList.remove('modal-open');
        document.body.style = '';
    }

    Promise.all([
        fetch('http://localhost:3000/buses').then(res => res.json()),
        fetch('http://localhost:3000/accounts').then(res => res.json())
    ])
    .then(([buses, accounts]) => {
        const busOptions = buses
            .sort((a, b) => a.busID - b.busID)
            .map(bus => `<option value="${bus.busID}">${bus.busID}</option>`)
            .join('');

        const driverOptions = `<option value="">Unassigned</option>` + 
            accounts.filter(acc => acc.role == '2')
                   .map(driver => `<option value="${driver.accountID}">${driver.firstName} ${driver.lastName}</option>`)
                   .join('');

        const controllerOptions = `<option value="">Unassigned</option>` + 
            accounts.filter(acc => acc.role == '3')
                   .map(controller => `<option value="${controller.accountID}">${controller.firstName} ${controller.lastName}</option>`)
                   .join('');

        const formHtml = `
        <div class="modal fade" id="editFleetPersonnelModal" tabindex="-1" aria-labelledby="editFleetPersonnelModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editFleetPersonnelModalLabel">Edit Fleet Personnel</h5>
                        <button type="button" class="btn-close white-text" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="fleetPersonnelForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="busId" class="form-label">Bus ID:</label>
                                    <select class="form-select" id="busId" name="busId" required>
                                        <option value="" selected disabled>Select Bus</option>
                                        ${busOptions}
                                    </select>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="busDriver" class="form-label">Driver:</label>
                                    <select class="form-select" id="busDriver" name="busDriver">
                                        ${driverOptions}
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="busController" class="form-label">Controller:</label>
                                    <select class="form-select" id="busController" name="busController">
                                        ${controllerOptions}
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary">Cancel</button>
                        <button type="button" class="btn btn-success" id="submitFleetPersonnel">Submit</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', formHtml);

        document.getElementById('submitFleetPersonnel').addEventListener('click', async function () {
            console.log("🟢 SUBMIT button clicked");

            const busId = document.getElementById('busId').value;
            const busDriver = document.getElementById('busDriver').value;
            const busController = document.getElementById('busController').value;

            if (!busId) {
                showAlert('⚠️ Please select a bus.', 'warning');
                return;
            }

           

            const selectedDriverID = busDriver === "" ? null : busDriver;
            const selectedControllerID = busController === "" ? null : busController;

            const payload = {
                busID: busId,
                driverID: selectedDriverID,
                controllerID: selectedControllerID
            };

            try {
        // Send the request to the server
        const response = await fetch('http://localhost:3000/update-fleet-personnel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
    showAlert(`✅ ${data.message}`, 'success');

    const modalElement = document.getElementById('editFleetPersonnelModal');
    const modal = bootstrap.Modal.getInstance(modalElement);

    // Listen for the hide completion before removing the modal
    modalElement.addEventListener('hidden.bs.modal', function handler() {
        modalElement.remove(); // Remove modal from DOM
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();

        document.body.classList.remove('modal-open');
        document.body.style = '';

        // Remove the event listener after it runs once
        modalElement.removeEventListener('hidden.bs.modal', handler);
    });

    modal.hide(); // Triggers 'hidden.bs.modal' event

    // Optional: trigger sidebar navigation
    document.querySelector('#sidebar .side-menu.top li:nth-child(4) a').click();
} else {
    showAlert(`❌ ${data.message}`, 'danger');
}

            } catch (err) {
                console.error('Error:', err);
                showAlert('❌ Failed to update personnel. Please try again later.', 'danger');
            }
        });

        // Remove data-bs-dismiss from Cancel and Close buttons
const cancelButton = document.querySelector('#editFleetPersonnelModal .btn-secondary');
const closeButton = document.querySelector('#editFleetPersonnelModal .btn-close');

cancelButton.removeAttribute('data-bs-dismiss');
closeButton.removeAttribute('data-bs-dismiss');

// Define cleanup function to hide modal and remove DOM/backdrop, then trigger sidebar click
function cleanupModal() {
    const modalElement = document.getElementById('editFleetPersonnelModal');
    const modal = bootstrap.Modal.getInstance(modalElement);

    modalElement.addEventListener('hidden.bs.modal', function handler() {
        modalElement.remove();
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
        document.body.classList.remove('modal-open');
        document.body.style = '';
        // Trigger sidebar click (4th item)
        document.querySelector('#sidebar .side-menu.top li:nth-child(4) a').click();

        modalElement.removeEventListener('hidden.bs.modal', handler);
    });

    modal.hide();
}

// Attach the cleanup handler to Cancel and Close buttons
cancelButton.addEventListener('click', cleanupModal);
closeButton.addEventListener('click', cleanupModal);



        const modalElement = document.getElementById('editFleetPersonnelModal');
        const editModal = new bootstrap.Modal(modalElement);
        editModal.show();

        modalElement.addEventListener('hidden.bs.modal', function () {
            modalElement.remove();
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
            document.body.classList.remove('modal-open');
            document.body.style = '';
        });
    })
    .catch(error => console.error('Error fetching data:', error));
}



async function fetchFleetFuel() {
    try {
        const response = await fetch('http://localhost:3000/fuel'); // Adjust API endpoint if needed
        const fuelData = await response.json();

        const tableBody = document.querySelector("#fleetFuel tbody");
        tableBody.innerHTML = ""; // Clear existing data

        // Sort fuel data by busId in ascending order
        fuelData.sort((a, b) => a.busId - b.busId);

        for (const fuel of fuelData) {
            const fuelPercentage = Math.min((fuel.currentFuel / 100) * 100, 100); // Assuming 100L tank
            const formattedDate = fuel.lastRefuelDate
                ? new Date(fuel.lastRefuelDate).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true
                })
                : "N/A";
        
            const fuelRefilled = fuel.fuelRefilled !== undefined && fuel.fuelRefilled !== null
                ? `${fuel.fuelRefilled.toFixed(2)} L`
                : "N/A";
        
            tableBody.innerHTML += `
                <tr>
                    <td>${fuel.busId}</td>
                    <td>${fuelRefilled}</td>
                    <td>${formattedDate}</td>
                    <td>
                        <div class="progress">
                            <div class="progress-bar ${fuelPercentage <= 20 ? 'bg-danger' : 'bg-success'}" 
                                role="progressbar" 
                                style="width: ${fuelPercentage}%"
                                aria-valuenow="${fuelPercentage}" 
                                aria-valuemin="0" 
                                aria-valuemax="100">
                            </div>
                        </div>
                        <span>${fuelPercentage.toFixed(0)}%</span>
                    </td>
                </tr>
            `;
        }

    } catch (error) {
        console.error("Error fetching fleet fuel data:", error);
    }
}



async function showFuelReportForm() {
    try {
        const response = await fetch('http://localhost:3000/fuel');
        const fuelData = await response.json(); // Store fuel data to use later

        // Sort busData numerically by busId (assuming busId is a number or numeric string)
fuelData.sort((a, b) => Number(a.busId) - Number(b.busId));

// Generate bus options
let busOptions = '<option value="">Select Bus</option>';
fuelData.forEach(bus => {
    busOptions += `<option value="${bus.busId}">${bus.busId}</option>`;
});

        const formHtml = `
            <div class="modal fade" id="editFleetFuelModal" tabindex="-1" aria-labelledby="editFleetFuelModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="editFleetFuelModalLabel">Edit Fleet Fuel Report</h5>
                            <button type="button" class="btn-close white-text" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="fleetFuelForm">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="busId" class="form-label">Bus ID:</label>
                                        <select class="form-select" id="busId" name="busId" required>
                                            ${busOptions}
                                        </select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="busDate" class="form-label">Last Fuel Refill:</label>
                                        <input type="date" class="form-control" id="busDate" name="busDate" required>
                                    </div>
                                     <div class="col-md-6 mb-3">
                                        <label for="fuelRefilled" class="form-label">Fuel Refilled (Liters):</label>
                                        <input type="number" class="form-control" id="fuelRefilled" name="fuelRefilled" step="0.01" min="0" placeholder="Enter liters refueled">
                                    </div>
                                    <div class="col-md-6 mb-3 text-center">
                                        <label for="busFuelLevel" class="form-label">Remaining Fuel Estimate:</label>
                                        <input type="range" class="form-range" id="busFuelLevel" name="busFuelLevel" min="0" max="100" step="1" value="50" oninput="updateFuelLevel(this.value)">
                                        <progress id="fuelProgress" value="50" max="100" class="w-100"></progress>
                                        <span id="fuelPercentage">50%</span>
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

        const modalElement = document.getElementById('editFleetFuelModal');
        const editFleetFuelModal = new bootstrap.Modal(modalElement);
        editFleetFuelModal.show();

        // Create map for fast lookup
        const busDataMap = {};
        fuelData.forEach(bus => {
            busDataMap[bus.busId] = bus;
        });

        // Delay to ensure DOM is fully ready before attaching event listener
        setTimeout(() => {
            const busIdSelect = document.getElementById('busId');
            const busDateInput = document.getElementById('busDate');
            const fuelRefilledInput = document.getElementById('fuelRefilled');
            const busFuelLevelInput = document.getElementById('busFuelLevel');
            const fuelProgress = document.getElementById('fuelProgress');
            const fuelPercentage = document.getElementById('fuelPercentage');

            busIdSelect.addEventListener('change', () => {
                const selectedId = busIdSelect.value;
                const busData = busDataMap[selectedId];
                if (busData) {
                    const formattedDate = new Date(busData.lastRefuelDate).toISOString().split('T')[0];
                    busDateInput.value = formattedDate;
                    fuelRefilledInput.value = busData.fuelRefilled || '';
                    busFuelLevelInput.value = busData.currentFuel || 0;
                    fuelProgress.value = busData.currentFuel || 0;
                    fuelPercentage.textContent = `${busData.currentFuel || 0}%`;
                }
            });
        }, 100); // Short delay to ensure content is ready

        // Event listener for submitting the form
        document.getElementById('submitStatus').addEventListener('click', async function () {
            const busId = document.getElementById('busId').value;
            const busDate = document.getElementById('busDate').value;
            const busFuelLevel = document.getElementById('busFuelLevel').value;
            const fuelRefilled = parseFloat(document.getElementById('fuelRefilled').value);

            if (!busId || !busDate || !busFuelLevel || isNaN(fuelRefilled)) {
                showAlert('Please fill in all required fields.', 'warning');
                return;
            }

            try {
                const updateResponse = await fetch(`http://localhost:3000/fuel/${busId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lastRefuelDate: busDate,
                        currentFuel: busFuelLevel,
                        fuelRefilled: fuelRefilled
                    })
                });

                if (updateResponse.ok) {
                    showAlert('Fuel Report Updated', 'success');
                    const editFleetFuelModal = bootstrap.Modal.getInstance(modalElement);
                    editFleetFuelModal.hide();
                    document.querySelector('#sidebar .side-menu.top li:nth-child(4) a').click();
                } else {
                    showAlert('Failed to update fuel report.', 'danger');
                }
            } catch (error) {
                console.error('Error updating fuel data:', error);
                showAlert('Server error. Try again later.', 'danger');
            }
        });

        // Cleanup modal on close
        modalElement.addEventListener('hidden.bs.modal', function () {
            modalElement.remove();
            document.querySelector('.modal-backdrop')?.remove();
            document.body.classList.remove('modal-open');
            document.body.style = '';
        });

    } catch (error) {
        console.error('Error fetching bus IDs:', error);
    }
}



// Function to update fuel progress bar in real time
function updateFuelLevel(value) {
    const fuelProgress = document.getElementById("fuelProgress");
    const fuelPercentage = document.getElementById("fuelPercentage");

    fuelProgress.value = value; // Update progress bar value
    fuelPercentage.textContent = `${value}%`; // Update displayed percentage
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
  


