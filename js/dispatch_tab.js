document.addEventListener('DOMContentLoaded', async function () {
    // Dynamically import CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/styles.css';
    document.head.appendChild(link);

    // Dynamically import CSS (Modal)
    const link2 = document.createElement('link');
    link2.rel = 'stylesheet';
    link2.href = 'css/modal.css';
    document.head.appendChild(link2);

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

    const dispatchBtn = document.getElementById('dispatchBtn');
    const dispatchTab = document.querySelector('#sidebar .side-menu.top li:nth-child(5) a');

    if (dispatchBtn && dispatchTab) {
        dispatchBtn.addEventListener("click", function () {
            dispatchTab.click(); // Simulates a click on the sidebar item
            console.log("Dispatch button clicked");
        });
    } else {
        console.error("Dispatch button or sidebar tab not found");
    }

    dispatchTab.addEventListener('click', async function (event) {
        event.preventDefault(); // Prevent default link behavior
        const user = JSON.parse(localStorage.getItem('user'));
        if (["2", "3", "5", "6"].includes(user.role)) {
            showAlert('You do not have permission to access this page.', 'danger');
            return;
        }

        try {
            await loadDispatchData();
        } catch (error) {
            console.error("Error fetching data:", error);
            document.querySelector('#content main').innerHTML = `<p>Error loading dispatch data.</p>`;
        }
    });

     

}); // ✅ This was missing


    async function loadDispatchData() {
        try {
            // Fetch operative buses from the maintenance database
            const maintenanceResponse = await fetch('http://localhost:3000/maintenance');
            const maintenanceData = await maintenanceResponse.json();

            // Get only operative buses (status = 1)
            const operativeBuses = maintenanceData.filter(bus => bus.status === 1).map(bus => bus.busID);

            // Fetch dispatch data
            const dispatchResponse = await fetch('http://localhost:3000/dispatch');
            const dispatchData = await dispatchResponse.json();

            // Filter dispatch records for operative buses
            const operativeDispatches = dispatchData.filter(dispatch => operativeBuses.includes(dispatch.busID));

            // Function to format time
            const formatTime = (dateString) => {
                const options = { hour: 'numeric', minute: 'numeric', hour12: true };
                return new Date(dateString).toLocaleTimeString('en-US', options);
            };

            let dispatchContent = `
                <div class="head-title">
                    <div class="left">
                        <h1>Dispatch</h1>
                        <ul class="breadcrumb">
                            <li><a href="#">Dispatch</a></li>
                            <li><i class='bx bx-chevron-right'></i></li>
                            <li><a class="active" href="#">Dispatch</a></li>
                        </ul>
                    </div>
                </div>
            `;

            if (operativeDispatches.length === 0) {
                dispatchContent += `<p>No operative buses available for dispatch.</p>`;
            } else {
                operativeDispatches.forEach((dispatch, index) => {
                    if (index % 2 === 0) {
                        if (index !== 0) {
                            dispatchContent += `</div>`; // Close previous "table-data" div
                        }
                        dispatchContent += `<div class="table-data">`; // Open new "table-data" div
                    }

                    dispatchContent += `
                        <div class="order position-relative">
                            <div class="head">
                                <div class="bus-info">
                                    <h3>Bus ${dispatch.busID}</h3>
                                    <h6 class=plate_number>NBC 1234</h5>     
                                </div>
                                
                                <button class="btn btn-primary mt-3 m-2 dispatch-btn" data-busid="${dispatch.busID}">Dispatch</button>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Dispatch Time</th>
                                        <th>Last Dispatch Time</th>
                                        <th>Last Location</th>
                                    </tr>
                                </thead>
                                <tbody class="table">
                                    <tr>
                                        <td><span class="status ${dispatch.status === 1 ? 'in-transit' : 'in-terminal'}">${dispatch.status === 1 ? 'In Transit' : 'In Terminal'}</span></td>
                                        <td>${formatTime(dispatch.nextDispatch)}</td>
                                        <td>${formatTime(dispatch.lastDispatch)}</td>
                                        <td>[${dispatch.coordinates.coordinates[1]}, ${dispatch.coordinates.coordinates[0]}]</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    `;
                });
                dispatchContent += `</div> 
                
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
                                <tbody id="fleetPersonnelTable">
                                    <tr>
                                        <td>1</td>
                                        <td>John Doe</td>
                                        <td>Jane Doe</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                <div id="alertContainer"></div>
                `; 
            }

            document.querySelector('#content main').innerHTML = dispatchContent;

            // Attach event listeners to dispatch buttons
            document.querySelectorAll('.dispatch-btn').forEach(button => {
                button.addEventListener('click', async function () {
                    const busID = this.getAttribute('data-busid');
                    showConfirmationModal(busID);
                   
                });
            });

            // Attach event listener to Edit Assignment button
            document.getElementById('editPersonnelBtn')?.addEventListener('click', function (event) {
                event.preventDefault();
                showFleetPersonnelForm();
                console.log("Edit Assignment button clicked");
            });

        } catch (error) {
            console.error("Error fetching data:", error);
            document.querySelector('#content main').innerHTML = `<p>Error loading dispatch data.</p>`;
        }
    }

function showFleetPersonnelForm() {
    const formHTML =`
    <div class="modal fade" id="editFleetPersonnelModal" tabindex="-1" aria-labelledby="editFleetPersonnelModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="editFleetPersonnelModalLabel">Edit Fleet Personnel</h5>
                    <button type="button" class="btn-close white-text" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="fleetPersonnelForm">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="busId" class="form-label">Bus ID:</label>
                                <select class="form-select" id="busId" name="busId" required>
                                    <option value="" selected disabled>Select Bus</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="busDriver" class="form-label">Driver:</label>
                                <select class="form-select" id="busDriver" name="busDriver" required>
                                    <option value="" selected>Select Driver</option>
                                    <option value="John Doe">John Doe</option>
                                    <option value="Jane Doe">Jane Doe</option>
                                    <option value="Alice Smith">Alice Smith</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="busController" class="form-label">Controller:</label>
                                <select class="form-select" id="busController" name="busController" required>
                                    <option value="" selected>Select Controller</option>
                                    <option value="John Doe">John Doe</option>
                                    <option value="Jane Doe">Jane Doe</option>
                                    <option value="Alice Smith">Alice Smith</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-success" id="submitFleetPersonnel">Submit</button>
                </div>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', formHTML);
    
    // Initialize Bootstrap Modal
    const modalElement = document.getElementById('editFleetPersonnelModal');
    const FleetModal = new bootstrap.Modal(modalElement);
    FleetModal.show();

    modalElement.addEventListener('hidden.bs.modal', function () {
        modalElement.remove();
        document.querySelector('.modal-backdrop').remove();
        document.body.classList.remove('modal-open');
        document.body.style = '';
    });

}



function showConfirmationModal(busID) {
    // Remove any existing modal to prevent duplicates
    const existingModal = document.getElementById("confirmationModal");
    if (existingModal) {
        existingModal.remove();
    }

    const modalHTML = `
        <div class="modal fade" id="confirmationModal" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true" style="color: black;">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="confirmationModalLabel">Confirm Dispatch</h5>
                    </div>
                    <div class="modal-body">
                        Are you sure you want to dispatch Bus ${busID}?
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="confirmDispatchBtn">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

// Initialize Bootstrap Modal
const modalElement = document.getElementById("confirmationModal");
const modal = new bootstrap.Modal(modalElement);
modal.show();

// Confirm Dispatch Button Click
document.getElementById("confirmDispatchBtn").addEventListener("click", async () => {
    modal.hide(); // Hide the modal
    await dispatchBus(busID); // Dispatch the Bus
});

// Remove modal from the DOM after it is hidden
modalElement.addEventListener("hidden.bs.modal", () => {
    modalElement.remove();
});

}

async function dispatchBus(busID) {
    try {
        // Fetch current dispatch data
        const dispatchResponse = await fetch(`http://localhost:3000/dispatch/${busID}`);
        if (!dispatchResponse.ok) {
            throw new Error(`Server responded with ${dispatchResponse.status}`);
        }

        const dispatchData = await dispatchResponse.json();

        // Fetch the latest location of the bus
        const locationResponse = await fetch(`http://localhost:8000/api/get_locations`);
        if (!locationResponse.ok) {
            throw new Error(`Location API responded with ${locationResponse.status}`);
        }

        const locations = await locationResponse.json();

        if (!locations[busID]) {
            throw new Error(`Location data for bus ${busID} not found.`);
        }

        const { latitude, longitude } = locations[busID];

        // Schedule the next dispatch (e.g., 1 hour later)
        const nextDispatchTime = new Date();
        nextDispatchTime.setHours(nextDispatchTime.getHours() + 1);

        // Prepare updated data
        const updatedData = {
            status: 1,
            lastDispatch: dispatchData.nextDispatch,  // Move the previous dispatch time
            nextDispatch: nextDispatchTime.toISOString(),
            coordinates: {
                type: "Point",
                coordinates: [longitude, latitude]  // MongoDB stores GeoJSON as [longitude, latitude]
            }
        };

        // Send update request to the server
        const updateDispatchResponse = await fetch(`http://localhost:3000/update-dispatch/${busID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData)
        });

        if (!updateDispatchResponse.ok) {
            throw new Error(`Update failed with status ${updateDispatchResponse.status}`);
        }

        console.log(`Bus ${busID} successfully dispatched and updated.`);
    } catch (error) {
        console.error(`Error updating dispatch for bus ${busID}:`, error);
    }
}




 // Function to Show Alert
function showAlert(message, type) {
    let alertContainer = document.getElementById('alertContainer'); // Use 'let' only once

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
        const alertElement = alertContainer.querySelector('.alert');
        if (alertElement) {
            alertElement.classList.remove('show');
            alertElement.classList.add('hide');
            setTimeout(() => alertElement.remove(), 500);
        }
    }, 3000);
}  // ❌ Removed extra `});`
