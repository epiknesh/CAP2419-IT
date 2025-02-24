document.addEventListener("DOMContentLoaded", function () {
	const teamTab = document.querySelector('#sidebar .side-menu.top li:nth-child(7) a');
  
	teamTab.addEventListener('click', function (event) {
		event.preventDefault();
		const mainContent = document.querySelector('#content main');
		mainContent.innerHTML = `
			<div class="head-title">
				<div class="left">
					<h1>Income</h1>
					<ul class="breadcrumb">
						<li><a href="#">Income</a></li>
						<li><i class='bx bx-chevron-right'></i></li>
						<li><a class="active" href="#">Income</a></li>
					</ul>
				</div>
			</div>
  
			<div class="table-data">
				<div class="order position-relative" id="incomeContent">
					<div class="head">
						<h3>Bus Income</h3>
						<a href="register.html" class="btn btn-success mb-4">
							<i class='bx bx-plus'></i> Add Daily Income
						</a>
					</div>
					<table>
						<thead>
							<tr>
								<th>Bus ID</th>
								<th>Income Today</th>
								<th>Income This Week</th>
								<th>Income This Month</th>
								<th>Total Income</th>
							</tr>
						</thead>
						<tbody id="busIncomeTable">
							<tr><td colspan="5">Loading...</td></tr>
						</tbody>
					</table>
				</div>
			</div>

			
		</div>
		`;

		fetchIncomeData(); // Fetch and display data
	});
});
  
function fetchIncomeData() {
	fetch('http://localhost:3000/income')
		.then(response => response.json())
		.then(data => {
			const tableBody = document.getElementById("busIncomeTable");
			tableBody.innerHTML = ""; // Clear existing data

			data.forEach(item => {
				const row = `
					<tr>
						<td>${item.busID}</td>
						<td>₱${item.incomeToday.toLocaleString()}</td>
						<td>₱${item.incomeWeek.toLocaleString()}</td>
						<td>₱${item.incomeMonth.toLocaleString()}</td>
						<td>₱${item.totalIncome.toLocaleString()}</td>
					</tr>
				`;
				tableBody.innerHTML += row;
			});
		})
		.catch(error => {
			console.error("Error fetching income data:", error);
			document.getElementById("busIncomeTable").innerHTML = "<tr><td colspan='5'>Failed to load data</td></tr>";
		});
}
