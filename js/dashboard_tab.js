document.addEventListener("DOMContentLoaded", function () {
    //Import Css 
    const link  = document.createElement('link');
    link.rel='stylesheet';
    link.href='styles/modal.css';
    document.head.appendChild(link);
    
    // Ensure the DOM is fully loaded before attaching event listeners
    const dashboardTab = document.querySelector('#sidebar .side-menu.top li:first-child a');
    dashboardTab.addEventListener('click', async function (event) {
        event.preventDefault(); // Prevent default link behavior
        const mainContent = document.querySelector('#content main');
        
        // Fetch data from the database
        try {
            const maintenanceResponse = await fetch("/maintenance");
            const buses = await maintenanceResponse.json();

            const incomeResponse = await fetch("/income");
            const incomeData = await incomeResponse.json();

            const dispatchResponse = await fetch("/dispatch");
            const dispatchData = await dispatchResponse.json();

            let operatingBuses = new Set(); // Store operating bus IDs
            let operatingCount = 0;
            const totalBuses = buses.length;

            let fleetContentHTML = "";
            let maintenanceContentHTML = "";
            let dispatchContentHTML = "";
            let incomeContentHTML = "";
            let totalWeeklyIncome = 0;

            // Sort statuses: Operating → Under Maintenance → Pending
            buses.sort((a, b) => {
            const statusOrder = { 1: 0, 2: 1, 3: 2 };
            return statusOrder[a.status] - statusOrder[b.status];
            });

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
                            <h3>Fleet Readiness</h3>
                            <a class="position-absolute top-0 end-0 btn btn-primary mt-3 m-2" id="fleetBtn">Go To Fleet</a>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Bus ID <i id="sort-busID-fleetReadiness-dynamic" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                                    <th>Date <i id="sort-date-fleetReadiness-dynamic" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                                    <th>Status <i id="sort-status-fleetReadiness-dynamic" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${fleetContentHTML}
                            </tbody>
                        </table>
                    </div>
                    <div class="order position-relative" id="maintenanceContent">
                        <div class="head">
                            <h3>Fleet Maintenance Report</h3>
                            <a class="position-absolute top-0 end-0 btn btn-primary mt-3 m-2" id="maintenanceBtn">Go To Maintenance</a>
                        </div>
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Bus ID <i id="sort-busID-fleetMaintenance-dynamic" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                                    <th>Issue <i id="sort-issue-fleetMaintenance-dynamic" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
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
                            <a class="position-absolute top-0 end-0 btn btn-primary mt-3 m-2" id="dispatchBtn">Go To Dispatch</a>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Bus ID <i id="sort-busID-fleetDispatch-dynamic" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                                    <th>Status <i id="sort-status-fleetDispatch-dynamic" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                                    <th>Next Dispatch <i id="sort-nextDispatch-fleetDispatch-dynamic" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
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
                            <a class="position-absolute top-0 end-0 btn btn-primary mt-3 m-2" id="incomeBtn">Go To Income</a>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Bus ID <i id="sort-busID-fleetIncome-dynamic" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                                    <th>Income Today <i id="sort-incomeToday-fleetIncome-dynamic" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                                    <th>Income This Week <i id="sort-incomeWeek-fleetIncome-dynamic" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                                </tr>
                            </thead>
                            <tbody class="table" id="incomeTableBody">
                                ${incomeContentHTML}
                            </tbody>
                        </table>
                    </div>
                </div>

                 <div id="alertContainer"></div>
                
            `;
            setTimeout(() => {
                const fleetBtn = document.getElementById("fleetBtn");
                const maintenanceBtn = document.getElementById("maintenanceBtn");
                const dispatchBtn = document.getElementById("dispatchBtn");
                const incomeBtn = document.getElementById("incomeBtn");
                if (incomeBtn) {
                    incomeBtn.addEventListener("click", function (event) {
                        event.preventDefault(); // Prevent navigation
                        console.log("Income button clicked");
                        document.querySelector('#sidebar .side-menu.top li:nth-child(7) a').click();
                    });
                }
                if (dispatchBtn) {
                    dispatchBtn.addEventListener("click", function (event) {
                        event.preventDefault(); // Prevent navigation
                        console.log("Dispatch button clicked");
                        document.querySelector('#sidebar .side-menu.top li:nth-child(5) a').click();
                    });
                }
                if (maintenanceBtn) {
                    maintenanceBtn.addEventListener("click", function (event) {
                        event.preventDefault(); // Prevent navigation
                        console.log("Maintenance button clicked");
                        document.querySelector('#sidebar .side-menu.top li:nth-child(6) a').click();
                    });
                }
                if (fleetBtn) {
                    fleetBtn.addEventListener("click", function (event) {
                        event.preventDefault(); // Prevent navigation
                        console.log("Fleet button clicked");
                        document.querySelector('#sidebar .side-menu.top li:nth-child(4) a').click();
                    });
                }
            }, 100); // Slight delay to ensure the button exists before binding
            attachFleetReadinessSortListeners();
            attachFleetMaintenanceSortListeners();
            attachFleetDispatchSortListeners();
            attachFleetIncomeSortListeners();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    });
});
