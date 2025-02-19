document.addEventListener("DOMContentLoaded", function () {
  // Ensure the DOM is fully loaded before attaching event listeners
  const teamTab = document.querySelector('#sidebar .side-menu.top li:nth-child(6) a');
  teamTab.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent default link behavior
      const mainContent = document.querySelector('#content main');
      mainContent.innerHTML = `
          <div class="head-title">
			<div class="left">
				<h1>Maintenance</h1>
				<ul class="breadcrumb">
					<li>
						<a href="#">Maintenance</a>
					</li>
					<li><i class='bx bx-chevron-right' ></i></li>
					<li>
						<a class="active" href="#">Maintenance</a>
					</li>
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
							<!-- Delete this comment and h6 if oks na -->
							 <h6>Note: Dapat All buses are included in this box(operative, under mainteance, pending). Same as to other pages na may fleet readiness</h6>
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
							<tr>
								<td>1</td>
								<td>Engine Overheating</td>
								<td>02/18/2025</td>
								<td>02/20/2025</td>
								<td>Paolo</td>
								<td><span class="status maintenance-major">Major</span></td>
							</tr>
							<tr>
								<td>2</td>
								<td>Broken Window</td>
								<td>02/18/2025</td>
								<td>02/21/2025</td>
								<td>Paolo</td>
								<td><span class="status maintenance-moderate">Moderate</span></td>
							</tr>
							<tr>
								<td>3</td>
								<td>Flat Tire</td>
								<td>02/18/2025</td>
								<td>02/22/2025</td>
								<td>Paolo</td>
								<td><span class="status maintenance-minor">Minor</span></td>
							</tr>
						</tbody>
				</table>
		</div>
	</div>
      `;
  });
});