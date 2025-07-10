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
            const maintenanceResponse = await fetch('/maintenance');
            const maintenanceData = await maintenanceResponse.json();

            // Get only operative buses (status = 1)
            const operativeBuses = maintenanceData.filter(bus => bus.status === 1).map(bus => bus.busID);




            // Fetch dispatch data
            const dispatchResponse = await fetch('/dispatch');
            const dispatchData = await dispatchResponse.json();

            // Fetch bus data to get plate numbers
        const busesResponse = await fetch('/buses');
        const busesData = await busesResponse.json();

        // Create a mapping: { busID: plateNumber }
        const busMap = {};
        busesData.forEach(bus => {
            busMap[bus.busID] = bus.plateNumber;
        });

        // Fetch fleet personnel data
        const personnelResponse = await fetch('/fleetPersonnel');
        const fleetPersonnelData = await personnelResponse.json();

        // Create a mapping: { busID: {controller, driver} }
        const personnelMap = {};
        fleetPersonnelData.forEach(personnel => {
            personnelMap[personnel.busID] = {
                controller: personnel.controller || 'N/A',
                driver: personnel.driver || 'N/A'
            };
        });



            // Filter dispatch records for operative buses
            const operativeDispatches = dispatchData.filter(dispatch => operativeBuses.includes(dispatch.busID));

            
// Sort by bus number (ascending)
operativeDispatches.sort((a, b) => a.busID - b.busID);

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

                    const plateNumber = busMap[dispatch.busID] || 'Unknown';

                    dispatchContent += `
                        <div class="order position-relative">
                            <div class="head">
                                 <div class="bus-info">
                                <h3>Bus ${dispatch.busID}</h3>
                                <h6 class="plate_number">${plateNumber}</h6>     
                            </div>
                                
                               <button class="btn btn-primary mt-3 m-2 dispatch-btn"
        data-busid="${dispatch.busID}"
        data-status="${dispatch.status}">
    ${dispatch.status === 1 ? 'Declare Arrived' : 'Dispatch'}
</button>

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
                                        <td>
    <span class="status ${dispatch.status === 1 ? 'in-transit' : 'in-terminal'}">
        ${dispatch.status === 1 
            ? `In Transit - ${dispatch.direction === 1 ? 'Southbound' : 'Northbound'}`
            : 'In Terminal'}
    </span>
</td>

                                        <td>${formatTime(dispatch.nextDispatch)}</td>
                                        <td>${formatTime(dispatch.lastDispatch)}</td>
                                        <td class="location-cell">
  <span id="location-${dispatch.busID}" class="location-text" title="Loading...">Loading...</span>
</td>

                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    `;
                });
                dispatchContent += `</div>`;
            }
    

operativeDispatches.forEach((dispatch) => {
    const lat = dispatch.coordinates.coordinates[1];
    const lon = dispatch.coordinates.coordinates[0];
    const elementId = `location-${dispatch.busID}`;
    reverseGeocodeAndInsert(lat, lon, elementId);
});

            // Fleet Personnel Table
            dispatchContent += `
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
                            ${Object.keys(personnelMap).map(busID => `
                                <tr>
                                    <td>${busID}</td>
                                    <td>${personnelMap[busID].controller}</td>
                                    <td>${personnelMap[busID].driver}</td>
                                </tr>
                            `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div id="alertContainer"></div>
            `;
            

            document.querySelector('#content main').innerHTML = dispatchContent;

            document.querySelectorAll('.dispatch-btn').forEach(button => {
    button.addEventListener('click', async function () {
        const busID = this.getAttribute('data-busid');
        const currentStatus = parseInt(this.getAttribute('data-status'));

        handleDispatchClick(busID, currentStatus);
    });
});


           
            const editFleetBtn = document.getElementById("editPersonnelBtn");
editFleetBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("EDIT BTN CLICKED");
    showDispatchFleetPersonnelForm();
}, { once: true });


        } catch (error) {
            console.error("Error fetching data:", error);
            document.querySelector('#content main').innerHTML = `<p>Error loading dispatch data.</p>`;
        }
    }

    function reverseGeocodeAndInsert(latitude, longitude, locElementId) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        .then(response => response.json())
        .then(locationData => {
            let locationName = "Unknown Location";
            if (locationData.address) {
                const { road, suburb, city, state, country } = locationData.address;
                locationName = [road, suburb, city, state, country].filter(Boolean).join(", ");
            }

            const locElement = document.getElementById(locElementId);
            if (locElement) {
                const shortened = locationName.length > 20 ? locationName.slice(0, 20) + '…' : locationName;
                locElement.textContent = shortened;
                locElement.title = locationName; // full name on hover
            } else {
                console.warn(`⚠️ Location element not found for ${locElementId}`);
            }
        })
        .catch(error => {
            console.error(`🌐 Error fetching location for ${locElementId}:`, error);
        });
}



   // Function to show the Fleet Personnel form || Edit Assignment Button
function showDispatchFleetPersonnelForm() {
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
        fetch('/buses').then(res => res.json()),
        fetch('/accounts').then(res => res.json())
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
        const response = await fetch('/update-fleet-personnel', {
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
    document.querySelector('#sidebar .side-menu.top li:nth-child(5) a').click();
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
        document.querySelector('#sidebar .side-menu.top li:nth-child(5) a').click();

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

async function getDispatchDirection(busID) {
    const dispatchResponse = await fetch(`/dispatch/${busID}`);
    if (!dispatchResponse.ok) {
        throw new Error(`Server responded with ${dispatchResponse.status}`);
    }

    const dispatchData = await dispatchResponse.json();
    const [longitude, latitude] = dispatchData.coordinates.coordinates;

    const southRef = { lat: 14.55021898231055, lng: 121.02789195667842 };
    const northRef = { lat: 14.416473794324464, lng: 121.04621052990954 };

    function getDistance(lat1, lon1, lat2, lon2) {
        const toRad = deg => (deg * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    const distToSouth = getDistance(latitude, longitude, southRef.lat, southRef.lng);
    const distToNorth = getDistance(latitude, longitude, northRef.lat, northRef.lng);

    const direction = distToSouth < distToNorth ? 1 : 2;

    return {
        direction,
        dispatchData,
        locationName: distToSouth < distToNorth ? "One Ayala" : "Starmall Alabang"
    };
}


async function handleDispatchClick(busID, currentStatus) {
    if (currentStatus === 1) {
        showConfirmationModal(busID, currentStatus); // Arrival doesn't need direction
    } else {
        try {
            const { direction, locationName } = await getDispatchDirection(busID);
            showConfirmationModal(busID, currentStatus, direction, locationName);
        } catch (err) {
            console.error("Error getting direction:", err);
            showAlert("Failed to fetch dispatch direction", "danger");
        }
    }
}




function showConfirmationModal(busID, currentStatus, direction = null, locationName = null)
{
    const actionText = currentStatus === 1 ? 'declare this bus as arrived' : 'dispatch this bus';
    const confirmLabel = currentStatus === 1 ? 'Confirm Arrival' : 'Confirm Dispatch';

    const existingModal = document.getElementById("confirmationModal");
    if (existingModal) existingModal.remove();

    const modalHTML = `
        <div class="modal fade" id="confirmationModal" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true" style="color: black;">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="confirmationModalLabel">${confirmLabel}</h5>
                    </div>
                    <div class="modal-body">
    ${
        currentStatus === 1
            ? `Are you sure you want to declare Bus ${busID} as arrived?`
            : `The bus’s current location is close to ${locationName}. Are you sure you want to dispatch Bus ${busID} <strong>${direction === 1 ? 'Southbound' : 'Northbound'}</strong>?`
    }
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

    const modalElement = document.getElementById("confirmationModal");
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    document.getElementById("confirmDispatchBtn").addEventListener("click", async () => {
    modal.hide();
    if (currentStatus === 1) {
        await declareBusArrived(busID);
    } else {
        await dispatchBus(busID);
    }
});

    modalElement.addEventListener("hidden.bs.modal", () => {
        modalElement.remove();
    });
}


async function declareBusArrived(busID) {
    try {
        const dispatchResponse = await fetch(`/dispatch/${busID}`);
        if (!dispatchResponse.ok) {
            throw new Error(`Server responded with ${dispatchResponse.status}`);
        }

        const dispatchData = await dispatchResponse.json();

        const locationResponse = await fetch(`/api/get_locations`);
        if (!locationResponse.ok) {
            throw new Error(`Location API error: ${locationResponse.status}`);
        }

        const locations = await locationResponse.json();
        const busKey = `bus${busID}`;

        if (!locations[busKey]) {
            throw new Error(`Location for bus${busID} not found`);
        }

        const { latitude, longitude } = locations[busKey];
        const roundedLatitude = parseFloat(latitude.toFixed(4));
        const roundedLongitude = parseFloat(longitude.toFixed(4));

        const updatedData = {
            status: 2, // Mark as arrived
            coordinates: {
                type: "Point",
                coordinates: [roundedLongitude, roundedLatitude]
            }
        };

        const updateResponse = await fetch(`/dispatch/${busID}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData)
        });

        if (!updateResponse.ok) {
            throw new Error(`Update failed: ${updateResponse.status}`);
        }

        // Refresh Dispatch Data instead of full reload
        await loadDispatchData();
        showAlert(`Bus ${busID} has been marked as arrived.`, "success");

    } catch (error) {
        console.error("Error declaring arrival:", error);
        showAlert(`Error declaring arrival: ${error.message}`, "danger");
    }
}



async function dispatchBus(busID) {
  try {
    // 1️⃣ Get current dispatch data
    const dispatchResponse = await fetch(`/dispatch/${busID}`);
    if (!dispatchResponse.ok) {
      throw new Error(`Server responded with ${dispatchResponse.status}`);
    }
    const dispatchData = await dispatchResponse.json();

    // 2️⃣ Use stored coordinates
    const [longitude, latitude] = dispatchData.coordinates.coordinates;

    // Reference coordinates
    const southRef = { lat: 14.55021898231055, lng: 121.02789195667842 };
    const northRef = { lat: 14.416473794324464, lng: 121.04621052990954 };

    // Haversine
    function getDistance(lat1, lon1, lat2, lon2) {
      const toRad = deg => (deg * Math.PI) / 180;
      const R = 6371; 
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // Calculate distances
    const distToSouth = getDistance(latitude, longitude, southRef.lat, southRef.lng);
    const distToNorth = getDistance(latitude, longitude, northRef.lat, northRef.lng);

    const direction = distToSouth < distToNorth ? 1 : 2;

    const nextDispatchTime = new Date();
    nextDispatchTime.setHours(nextDispatchTime.getHours());

    const updatedData = {
      status: 1,
      lastDispatch: dispatchData.nextDispatch,
      nextDispatch: nextDispatchTime.toISOString(),
      direction: direction,
      coordinates: {
        type: "Point",
        coordinates: [parseFloat(longitude.toFixed(4)), parseFloat(latitude.toFixed(4))]
      }
    };

    const updateResponse = await fetch(`/dispatch/${busID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    });

    if (!updateResponse.ok) {
      throw new Error(`Update failed with status ${updateResponse.status}`);
    }

    console.log(`Bus ${busID} dispatched successfully.`);

    // 3️⃣ OPTIONAL: send notification email
    const settingsResponse = await fetch(`/settings/${accountID}`);
    const settings = await settingsResponse.json();

    if (settings.dispatch_notif) {
      const localDispatchTime = new Date();
      const formattedTime = localDispatchTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true
      });

      const templateParams = {
        to_email: loggedEmail,
        subject: `Bus ${busID} Dispatched`,
        message: `Bus ${busID} has been dispatched at ${formattedTime}.`
      };

      emailjs.send(service_id, template_id, templateParams)
        .then(() => console.log(`Email sent for Bus ${busID}.`))
        .catch((error) => console.error("Email send failed", error));
    }

// ✅ 4️⃣ Fetch ALL capacity data
const capacityResponse = await fetch(`/capacity`);
const capacityData = await capacityResponse.json();

const numericBusID = Number(busID);
const busCapacity = capacityData.find(cap => cap.busID === numericBusID);

if (busCapacity) {
  const estimatedIncome = busCapacity.capacity * 60;
  const estimatedIncomeDate = new Date().toISOString();

  console.log(`Updating estimated income for Bus ${busID} to ₱${estimatedIncome}`);

  // ✅ Update the Income record for this bus
  await fetch(`/income/${busID}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      estimatedIncome: estimatedIncome,
      estimatedIncomeDate: estimatedIncomeDate
    })
  });

} else {
  console.warn(`No capacity record found for Bus ${busID}.`);
}


    await loadDispatchData();
    showAlert(`Bus ${busID} has been successfully dispatched!`, "success");

  } catch (error) {
    console.error(`Error dispatching bus ${busID}:`, error);
    showAlert(`Error dispatching bus ${busID}: ${error.message}`, "danger");
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
