document.addEventListener("DOMContentLoaded", function () {
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
                            <a href="register.html" class="btn btn-warning mb-4">
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
            `;
        } catch (error) {
            console.error('Error fetching maintenance data:', error);
        }
    });
});
