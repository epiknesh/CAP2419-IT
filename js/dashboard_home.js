async function fetchBusData() {
    try {
        const response = await fetch('/maintenance'); // Fetch maintenance data
        const busData = await response.json();
        updateFleetStatus(busData);
        updateMaintenanceTable(busData);

        // Fetch Dispatch Data
        const dispatchResponse = await fetch('/dispatch');
        let dispatchData = await dispatchResponse.json();

        // Filter out inoperative buses based on maintenance status
        const inoperativeBusIDs = new Set(busData.filter(bus => bus.status !== 1).map(bus => bus.busID));
        dispatchData = dispatchData.filter(bus => !inoperativeBusIDs.has(bus.busID));

        updateDispatchTable(dispatchData);

    } catch (error) {
        console.error('Error fetching bus data:', error);
    }
}

async function fetchIncomeData() {
    try {
        const response = await fetch('/income'); // Fetch income data
        const incomeData = await response.json();

        // Update income table with all buses
        updateIncomeTable(incomeData);
    } catch (error) {
        console.error('Error fetching income data:', error);
    }
}

function updateIncomeTable(incomeData) {
    const incomeTableBody = document.querySelector("#incomeContent tbody");
    incomeTableBody.innerHTML = ""; // Clear existing content

    incomeData.forEach(bus => {
        const row = document.createElement("tr");

        // Bus ID
        const busCell = document.createElement("td");
        busCell.textContent = `Bus ${bus.busID}`;
        row.appendChild(busCell);

        // Income Today
        const incomeTodayCell = document.createElement("td");
        incomeTodayCell.textContent = `₱${bus.incomeToday.toLocaleString()}`;
        row.appendChild(incomeTodayCell);

        // Income This Week
        const incomeWeekCell = document.createElement("td");
        incomeWeekCell.textContent = `₱${bus.incomeWeek.toLocaleString()}`;
        row.appendChild(incomeWeekCell);

        incomeTableBody.appendChild(row);
    });
}


function updateFleetStatus(busData) {
    const operativeBuses = document.getElementById("operativeBuses");
    const inoperativeBuses = document.getElementById("inoperativeBuses");
    const fleetPercentage = document.getElementById("fleetPercentage");

    // Clear existing list items
    operativeBuses.innerHTML = "";
    inoperativeBuses.innerHTML = "";

    let operativeCount = 0;

    // Populate lists dynamically
    busData.forEach(bus => {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item");
        listItem.textContent = `Bus ${bus.busID}`;

        if (bus.status === 1) {
            operativeBuses.appendChild(listItem);
            operativeCount++;
        } else {
            inoperativeBuses.appendChild(listItem);
        }
    });

    // Calculate and update fleet percentage
    const totalBuses = busData.length;
    const percentage = totalBuses > 0 ? Math.round((operativeCount / totalBuses) * 100) : 0;
    fleetPercentage.innerHTML = `<b>${percentage}%</b>`;
}

function updateMaintenanceTable(busData) {
    const maintenanceTableBody = document.getElementById("maintenanceTableBody");
    maintenanceTableBody.innerHTML = ""; // Clear existing content

    busData.forEach(bus => {
        if (bus.status === 2 || bus.status === 3) { // Inoperative buses
            const row = document.createElement("tr");

            const busCell = document.createElement("td");
            busCell.textContent = `Bus ${bus.busID}`;

            const issueCell = document.createElement("td");
            issueCell.textContent = bus.issue || "Unknown Issue"; // Default text if issue is missing

            row.appendChild(busCell);
            row.appendChild(issueCell);
            maintenanceTableBody.appendChild(row);
        }
    });
}

function updateDispatchTable(dispatchData) {
    const dispatchTableBody = document.querySelector("#dispatchContent tbody");
    dispatchTableBody.innerHTML = ""; // Clear existing content

    dispatchData.forEach(bus => {
        const row = document.createElement("tr");

        // Bus ID
        const busCell = document.createElement("td");
        busCell.textContent = `Bus ${bus.busID}`;
        row.appendChild(busCell);

        // Status
        const statusCell = document.createElement("td");
        statusCell.textContent = getStatusText(bus.status);
        row.appendChild(statusCell);

        // Next Dispatch Time
        const nextDispatchCell = document.createElement("td");
        nextDispatchCell.textContent = formatDate(bus.nextDispatch);
        row.appendChild(nextDispatchCell);

        dispatchTableBody.appendChild(row);
    });
}

function getStatusText(status) {
    switch (status) {
        case 1: return "In Terminal";
        case 2: return "In Transit";
        case 3: return "Inoperative";
        default: return "Unknown";
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return "N/A";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}


// Fetch data when the page loads
document.addEventListener("DOMContentLoaded", fetchBusData);
document.addEventListener("DOMContentLoaded", fetchIncomeData);
