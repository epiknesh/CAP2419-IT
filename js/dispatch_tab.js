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
                                <h3>Bus ${dispatch.busID}</h3>
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

        } catch (error) {
            console.error("Error fetching data:", error);
            document.querySelector('#content main').innerHTML = `<p>Error loading dispatch data.</p>`;
        }
    }

    async function dispatchBus(busID) {
        try {
            // Fetch the current dispatch data
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
                lastDispatch: dispatchData.nextDispatch, // Move the previous dispatch time
                nextDispatch: nextDispatchTime.toISOString(),
                coordinates: {
                    type: "Point",
                    coordinates: [longitude, latitude] // MongoDB stores GeoJSON as [longitude, latitude]
                }
            };
    
            // ✅ Send update request only ONCE
            const updateResponse = await fetch(`http://localhost:3000/update-dispatch/${busID}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData)
            });
    
            if (!updateResponse.ok) {
                throw new Error(`Update failed with status ${updateResponse.status}`);
            }
    
            console.log(`Bus ${busID} dispatched successfully with updated location.`);
    
            // ✅ Check if dispatch notification is enabled
            const settingsResponse = await fetch(`http://localhost:3000/settings/${accountID}`);
            const settings = await settingsResponse.json();
    
            if (settings.dispatch_notif) {
                // Get the current local time
                const localDispatchTime = new Date();
                const formattedTime = localDispatchTime.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true
                });
    
                // ✅ Send email notification
                const templateParams = {
                    to_email: loggedEmail,
                    subject: `Bus ${busID} Dispatched`,
                    message: `Bus ${busID} has been dispatched at ${formattedTime}.`
                };
    
                emailjs.send(service_id, template_id, templateParams)
                    .then(() => console.log(`Email notification sent for Bus ${busID}.`))
                    .catch((error) => console.error("Email send failed", error));
            }
    
            // ✅ Refresh Dispatch Data
            await loadDispatchData();
            showAlert(`Bus ${busID} has been successfully dispatched!`, "success");
    
        } catch (error) {
            console.error(`Error dispatching bus ${busID}:`, error);
            showAlert(`Error dispatching bus ${busID}: ${error.message}`, "danger");
        }
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

    
// Function to show alerts dynamically
function showAlert(message, type) {
    let alertContainer = document.getElementById("alertContainer");

    // Create alert container if it doesn't exist
    if (!alertContainer) {
        alertContainer = document.createElement("div");
        alertContainer.id = "alertContainer";
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
        alertContainer.innerHTML = "";
    }, 3000);
}
});


// // TO DO
// 1. Only Operative buses should be displayed in dispatch page
// 2. Only in terminal buses should be dispatched
// 3. Use ShowAlert for dispatch success and failure (did the function already, just need to call it)
