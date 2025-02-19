document.addEventListener("DOMContentLoaded", function () {
  // Ensure the DOM is fully loaded before attaching event listeners
  const teamTab = document.querySelector('#sidebar .side-menu.top li:nth-child(7) a');
  teamTab.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent default link behavior
      const mainContent = document.querySelector('#content main');
      mainContent.innerHTML = `
          <div class="head-title">
			<div class="left">
				<h1>Income</h1>
				<ul class="breadcrumb">
					<li>
						<a href="#">Income</a>
					</li>
					<li><i class='bx bx-chevron-right' ></i></li>
					<li>
						<a class="active" href="#">Income</a>
					</li>
				</ul>
			</div>
		</div>

		<!-- Data -->
		<!-- ROW 1 -->
		<!-- BOX 1: Bus Income -->
		<div class="table-data">
			<div class="order position-relative" id="incomeContent">
				<div class="head">
					<h3>Bus Income</h3>
					<a href="register.html" class="btn btn-success mb-4">
						<i class='bx bx-plus' ></i> Add Daily Income
					</a>
			</div>
				<table>
					<thead>
						<tr>
							<th>Bus ID</th>
							<th>Income Today</th>
							<th>Income This Week</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>1</td>
							<td>₱5000</td>
							<td>₱30000</td>
						</tr>
					</tbody>
				</table>
			</div>
	</div>
	<!-- ROW 2 -->
	<!-- BOX 2: Drivers Income List -->
	 <div class="table-data">
		<div class="order position-relative" id="incomeContent">
			<div class="head">
				<h3>Driver Pay Log</h3>
				<a href="register.html" class="btn btn-success mb-4">
					<i class='bx bx-plus' ></i> Add Pay Entry
				</a>
		</div>
			<table>
				<thead>
					<tr>
						<th>Bus ID</th>
						<th>Driver</th>
						<th>Income Today</th>
						<th>Date</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>1</td>
						<td>Paolo</td>
						<td>₱400</td>
						<td>02/19/2025</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div class="order position-relative" id="incomeContent">
			<div class="head">
				<h3>Controller Pay Log</h3>
				<a href="register.html" class="btn btn-success mb-4">
					<i class='bx bx-plus' ></i> Add Pay Entry
				</a>
		</div>
			<table>
				<thead>
					<tr>
						<th>Bus ID</th>
						<th>Conductor</th>
						<th>Income Today</th>
						<th>Date</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>1</td>
						<td>Paolo</td>
						<td>₱400</td>
						<td>02/19/2025</td>
					</tr>
				</tbody>
			</table>
		</div>
	 </div>
      `;
  });
});