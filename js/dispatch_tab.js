document.addEventListener("DOMContentLoaded", function () {
  // Ensure the DOM is fully loaded before attaching event listeners
  const teamTab = document.querySelector('#sidebar .side-menu.top li:nth-child(5) a');
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
		<!-- ROW 1 -->
		<!-- BOX 1: Bus [ID] that is Operating -->
		<div class="table-data" id="dispatchContent">
			<div class="order position-relative">
				<div class="head">
					<h3>Bus [Insert Bus Id]</h3>
					<a href="dispatch.html" class="btn btn-primary mt-3 m-2">Dispatch</a>
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
							<td><span class="status in-transit">In Transit</span></td>
							<td>2:00 PM</td>
							<td>12:00 PM</td>
							<td>Last Coordinates Recorded</td>
						</tr>
					</tbody>
				</table>
      </div>
		<!-- BOX 2: Bus [ID] that is Operating -->
			<div class="order position-relative">
						<div class="head">
							<h3>Bus [Insert Bus Id]</h3>
							<a href="dispatch.html" class="btn btn-primary mt-3 m-2">Dispatch</a>
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
									<td><span class="status in-terminal">In Terminal</span></td>
									<td>2:00 PM</td>
									<td>12:00 PM</td>
									<td>Last Coordinates Recorded</td>
								</tr>
							</tbody>
						</table>
				</div>
    </div>

		<!-- ROW 2 -->
		<!-- BOX 3: Bus [ID] that is Operating -->
		<div class="table-data" id="dispatchContent">
			<div class="order position-relative">
				<div class="head">
					<h3>Bus [Insert Bus Id]</h3>
					<a href="dispatch.html" class="btn btn-primary mt-3 m-2">Dispatch</a>
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
							<td><span class="status in-transit">In Transit</span></td>
							<td>2:00 PM</td>
							<td>12:00 PM</td>
							<td>Last Coordinates Recorded</td>
						</tr>
					</tbody>
				</table>
      </div>
		<!-- BOX 4: Bus [ID] that is Operating -->
			<div class="order position-relative">
						<div class="head">
							<h3>Bus [Insert Bus Id]</h3>
							<a href="dispatch.html" class="btn btn-primary mt-3 m-2">Dispatch</a>
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
									<td><span class="status in-terminal">In Terminal</span></td>
									<td>2:00 PM</td>
									<td>12:00 PM</td>
									<td>Last Coordinates Recorded</td>
								</tr>
							</tbody>
						</table>
				</div>
    </div>
      `;
  });
});