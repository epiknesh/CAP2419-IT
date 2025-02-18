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
      
    <!-- BOX 5: Fleet Driver -->
    <div class="table-data">
			<div class="order position-relative" id="fleetDriver">
				<div class="head">
          <h3>Fleet Personnel</h3>
          <a href="register.html"  class="btn btn-warning mb-4">
          <i class='bx bxs-edit' ></i>
          Edit Assignment</a>
        </div>
				<table>
					<thead>
						<tr>
							<th>Bus ID</th>
							<th>Controller</th>
              <th>Driver</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>2</td>
							<td>Yuan Patawaran</td>
              <td>Paolo Mendoza</td>
						</tr>
						<tr>
							<td>7</td>
							<td>Macky Dural</td>
              <td>Marius Manaloto</td>
						</tr>
						<tr>
							<td>8</td>
							<td>Jeff Cruz</td>
              <td>Frank Ababan</td>
						</tr>
					</tbody>
				</table>
			</div>
    </div>
      `;
  });
});
