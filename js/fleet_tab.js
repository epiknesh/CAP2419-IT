document.addEventListener("DOMContentLoaded", function () {
    const fleetTab = document.querySelector('#sidebar .side-menu.top li:nth-child(4) a');
    
    fleetTab.addEventListener('click', async function (event) {
        event.preventDefault();
        
        const mainContent = document.querySelector('#content main');
        
        // Load content only if it hasn't been loaded yet
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
                            <h1>INSERT A MAP WITH LOCATION OF ALL JST KIDLAT BUSES</h1>
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
                                <a href="register.html" class="btn btn-warning mb-4">
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
                                <h3>Bus Maintenance Report</h3>
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
                                <a href="register.html" class="btn btn-warning mb-4">
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
                </div>
            `;
        }

        // Fetch the latest data each time the Fleet tab is visited
        await fetchFleetCapacity();
        await fetchFleetStatus();
        await fetchFleetPersonnel();
    });
});

// Function to fetch fleet capacity
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

        Object.values(latestCapacities).forEach(entry => {
            const percentage = (entry.capacity / maxCapacity) * 100;
            const formattedDate = new Date(entry.date).toLocaleDateString();
            tableBody.innerHTML += `
                <tr>
                    <td>${entry.busID}</td>
                    <td>${formattedDate}</td>
                    <td>${percentage.toFixed(2)}%</td>
                    <td>
                        <div class="progress">
                            <div class="progress-bar bg-success" role="progressbar" style="width: ${percentage}%"
                                aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error fetching fleet capacity data:", error);
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
            tableBody.innerHTML += `
                <tr>
                    <td>${personnel.busID}</td>
                    <td>${personnel.controller}</td>
                    <td>${personnel.driver}</td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error loading fleet personnel:", error);
    }
}
