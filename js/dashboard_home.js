async function fetchBusData() {
    try {
        const response = await fetch('http://localhost:3000/maintenance'); // Adjust based on your API URL
        const busData = await response.json();
        updateFleetStatus(busData);
        updateMaintenanceTable(busData);
    } catch (error) {
        console.error('Error fetching bus data:', error);
    }
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

// Fetch data when the page loads
document.addEventListener("DOMContentLoaded", fetchBusData);
