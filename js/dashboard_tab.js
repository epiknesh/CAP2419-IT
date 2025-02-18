document.addEventListener("DOMContentLoaded", function () {
    // Ensure the DOM is fully loaded before attaching event listeners
    const dashboardTab = document.querySelector('#sidebar .side-menu.top li:first-child a');
    dashboardTab.addEventListener('click', async function (event) {
        event.preventDefault(); // Prevent default link behavior
        const mainContent = document.querySelector('#content main');
        
        // Fetch data from the database
        try {
            const maintenanceResponse = await fetch("http://localhost:3000/maintenance");
            const buses = await maintenanceResponse.json();

            const incomeResponse = await fetch("http://localhost:3000/income");
            const incomeData = await incomeResponse.json();

            const dispatchResponse = await fetch("http://localhost:3000/dispatch");
            const dispatchData = await dispatchResponse.json();

            let operatingBuses = new Set(); // Store operating bus IDs
            let operatingCount = 0;
            const totalBuses = buses.length;

            let fleetContentHTML = "";
            let maintenanceContentHTML = "";
            let dispatchContentHTML = "";
            let incomeContentHTML = "";
            let totalWeeklyIncome = 0;

            buses.forEach(bus => {
                let statusText = "";
                let statusClass = "";

                if (bus.status === 1) {
                    statusText = "Operating";
                    statusClass = "operating";
                    operatingBuses.add(bus.busID); // Store busID if operating
                    operatingCount++;
                } else if (bus.status === 2) {
                    statusText = "Under Maintenance";
                    statusClass = "maintenance";
                } else if (bus.status === 3) {
                    statusText = "Pending";
                    statusClass = "pending";
                }

                fleetContentHTML += `
                    <tr>
                        <td>${bus.busID}</td>
                        <td>${new Date().toLocaleDateString()}</td>
                        <td><span class="status ${statusClass}">${statusText}</span></td>
                    </tr>
                `;

                if (bus.status === 2 || bus.status === 3) {
                    maintenanceContentHTML += `
                        <tr>
                            <td>${bus.busID}</td>
                            <td>${bus.issue}</td>
                        </tr>
                    `;
                }
            });

            const operatingPercentage = totalBuses > 0 ? (operatingCount / totalBuses) * 100 : 0;

            incomeData.forEach(income => {
                totalWeeklyIncome += income.incomeWeek || 0; // Sum up weekly income

                incomeContentHTML += `
                    <tr>
                        <td>${income.busID}</td>
                        <td>${income.incomeToday !== null ? `₱${income.incomeToday}` : 'N/A'}</td>
                        <td>${income.incomeWeek !== null ? `₱${income.incomeWeek}` : 'N/A'}</td>
                    </tr>
                `;
            });

            dispatchData.forEach(dispatch => {
                // Only add to dispatch table if the bus is operating
                if (operatingBuses.has(dispatch.busID)) {
                    // Determine Status Label
                    let statusLabel = dispatch.status === 1 ? "In Terminal" : "In Transit";

                    const formattedTime = dispatch.nextDispatch
                        ? new Date(dispatch.nextDispatch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'N/A';

                    dispatchContentHTML += `
                        <tr>
                            <td>${dispatch.busID}</td>
                            <td>${statusLabel}</td>
                            <td>${formattedTime}</td>
                        </tr>
                    `;
                }
            });

            // Update the main content with fetched data
            mainContent.innerHTML = `
                <div class="head-title">
                    <div class="left">
                        <h1>Dashboard</h1>
                        <ul class="breadcrumb">
                            <li>
                                <a href="#">Dashboard</a>
                            </li>
                            <li><i class='bx bx-chevron-right' ></i></li>
                            <li>
                                <a class="active" href="#">Home</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <ul class="box-info">
                    <li>
                        <i class='bx bxs-dollar-circle' ></i>
                        <span class="text mt-3">
                            <h3>₱${totalWeeklyIncome.toLocaleString()}</h3>
                            <p>Weekly Income</p>
                        </span>
                    </li>
                    <li>
                        <i class='bx bxs-bus'></i>
                        <span class="text mt-3">
                            <h3 class="text-success">${operatingPercentage.toFixed(2)}%</h3>
                            <p>Buses Operating Today</p>
                        </span>
                    </li>
                    <li>
                        <i class='bx bx-money'></i>
                        <span class="text mt-3">
                            <h3>₱500,000</h3>
                            <p>Bus Income</p>
                        </span>
                    </li>
                </ul>
                <div class="table-data">
                    <div class="order position-relative" id="fleetContent">
                        <div class="head">
                            <h3>Fleet</h3>
                            <a href="fleet.html" class="position-absolute top-0 end-0 btn btn-primary mt-3 m-2">Go To Fleet</a>
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
                                ${fleetContentHTML}
                            </tbody>
                        </table>
                    </div>
                    <div class="order position-relative" id="maintenanceContent">
                        <div class="head">
                            <h3>Bus Maintenance Report</h3>
                            <a href="maintenance.html" class="position-absolute top-0 end-0 btn btn-primary mt-3 m-2">Go To Maintenance</a>
                        </div>
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Bus ID</th>
                                    <th>Issue</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${maintenanceContentHTML}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="table-data">
                    <div class="order position-relative" id="dispatchContent">
                        <div class="head">
                            <h3>Bus Dispatch</h3>
                            <a href="dispatch.html" class="position-absolute top-0 end-0 btn btn-primary mt-3 m-2">Go To Dispatch</a>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Bus ID</th>
                                    <th>Status</th>
                                    <th>Next Dispatch</th>
                                </tr>
                            </thead>
                            <tbody class="table">
                                ${dispatchContentHTML}
                            </tbody>
                        </table>
                    </div>
                    <div class="order position-relative" id="incomeContent">
                        <div class="head">
                            <h3>Bus Income</h3>
                            <a href="income.html" class="position-absolute top-0 end-0 btn btn-primary mt-3 m-2">Go To Income</a>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Bus ID</th>
                                    <th>Income Today</th>
                                    <th>Income This Week</th>
                                </tr>
                            </thead>
                            <tbody class="table" id="incomeTableBody">
                                ${incomeContentHTML}
                            </tbody>
                        </table>
                    </div>
                </div>
                
            `;
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    });
});
