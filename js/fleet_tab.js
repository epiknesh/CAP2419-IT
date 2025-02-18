document.addEventListener("DOMContentLoaded", function () {
  // Ensure the DOM is fully loaded before attaching event listeners
  const teamTab = document.querySelector('#sidebar .side-menu.top li:nth-child(4) a');
  teamTab.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent default link behavior
      const mainContent = document.querySelector('#content main');
      mainContent.innerHTML = `
          <div class="head-title">
			<div class="left">
				<h1>Fleet</h1>
				<ul class="breadcrumb">
					<li>
						<a href="#">Fleet</a>
					</li>
					<li><i class='bx bx-chevron-right' ></i></li>
					<li>
						<a class="active" href="#">Fleet</a>
					</li>
				</ul>
			</div>
		</div>


		<!-- Data -->
     <!-- BOX 1 : FLEET MAP -->
		<div class="table-data">
			<div class="order" id="fleetMap">
				<div class="head">
					<h3>Fleet Map</h3>
				</div>
        <h1>INSERT A MAP WITH LOCATION OF ALL JST KIDLAT BUSES</h1>
			</div>
    </div>

    <!-- BOX 2 : Fleet Capacity -->
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
					<tbody>
						<tr>
							<td>1</td>
              <td>02/18/2025</td>
              <td>25%</td>
              <td>
                <div class="progress">
                  <div class="progress-bar bg-success" role="progressbar" style="width: 25%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </td>
						</tr>
						<tr>
							<td>2</td>
              <td>02/18/2025</td>
              <td>50%</td>
              <td>
                <div class="progress">
                  <div class="progress-bar bg-success" role="progressbar" style="width: 50%" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </td>
						</tr>
						<tr>
							<td>3</td>
              <td>02/18/2025</td>
              <td>75%</td>
              <td>
                <div class="progress">
                  <div class="progress-bar bg-success" role="progressbar" style="width: 75%" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </td>
						</tr>
					</tbody>
				</table>
			</div>
    </div>

          <!-- BOX 3: Fleet Status -->
          <!-- BOX 4: Fleet Driver -->
    <div class="table-data">
       <!-- BOX 3: Fleet Status -->
			<div class="order position-relative" id="fleetStatus">
				<div class="head">
          <h3>Fleet Readiness</h3>
          <a href="register.html"  class="btn btn-warning mb-4">
          <i class='bx bxs-edit' ></i>
          Edit Status</a>
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
						<tr>
							<td>1</td>
							<td>02-12-2025</td>
							<td><span class="status operating">Operating</span></td>
						</tr>
						<tr>
							<td>2</td>
							<td>02-12-2025</td>
							<td><span class="status maintenance">Under Maintenance</span></td>
						</tr>
						<tr>
							<td>3</td>
							<td>02-12-2025</td>
							<td><span class="status pending">Pending</span></td>
						</tr>
					</tbody>
				</table>
			</div>
          <!-- BOX 4: Fleet Maintenance Report -->
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
					<tbody>
						<tr>
							<td>2</td>
							<td>Engine Overheating</td>
						</tr>
						<tr>
							<td>7</td>
							<td>Brake System Malfunction</td>
						</tr>
						<tr>
							<td>8</td>
							<td>Air Conditioning Not Working</td>
						</tr>
					</tbody>
				</table>
			</div>
    </div>
      
    <!-- Fleet Driver -->
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
            <tbody id="fleetPersonnelTable">
                <!-- Dynamically populated rows -->
            </tbody>
        </table>
    </div>
</div>
      `;
  });
});

document.addEventListener("DOMContentLoaded", async function () {
    const waitForElement = (selector, timeout = 3000) => {
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                const element = document.querySelector(selector);
                if (element) {
                    clearInterval(interval);
                    resolve(element);
                }
            }, 100);
            setTimeout(() => {
                clearInterval(interval);
                reject(new Error(`Timeout waiting for ${selector}`));
            }, timeout);
        });
    };

    try {
        await waitForElement("#fleetCapacity tbody");

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
            const row = `
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
            tableBody.innerHTML += row;
        });

    } catch (error) {
        console.error("Error fetching fleet capacity data:", error);
        const tableBody = document.querySelector("#fleetCapacity tbody");
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red;">Failed to load capacity data.</td></tr>`;
        }
    }

    // Now call loadFleetPersonnel function directly, outside the event listener
    async function loadFleetPersonnel() {
        try {
            const response = await fetch('http://localhost:3000/fleetPersonnel');
            const fleetPersonnel = await response.json();
            const tableBody = document.getElementById('fleetPersonnelTable');
            tableBody.innerHTML = '';
            
            // Sort fleet personnel by Bus ID
            fleetPersonnel.sort((a, b) => a.busID - b.busID);

            fleetPersonnel.forEach(personnel => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${personnel.busID}</td>
                    <td>${personnel.controller}</td>
                    <td>${personnel.driver}</td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading fleet personnel:', error);
        }
    }

    loadFleetPersonnel(); // Directly call the function
});

