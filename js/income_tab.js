// Toast Notification Container
document.addEventListener("DOMContentLoaded", function () {
	//Import Css 
	const link  = document.createElement('link');
	link.rel='stylesheet';
	link.href='styles/modal.css';
	document.head.appendChild(link);

  const incomeBtn = document.getElementById('incomeBtn');
  const incomeTab = document.querySelector('#sidebar .side-menu.top li:nth-child(7) a');

  if (incomeBtn && incomeTab) {
    incomeBtn.addEventListener("click", function () {
      incomeTab.click(); // Simulates a click on the sidebar item
        console.log("Income button clicked");
    });
  } else {
      console.error("Income button or sidebar tab not found");
  }
  
  incomeTab.addEventListener('click', function (event) {
    const startCoords = [121.0253809, 14.5504493]; // [Longitude, Latitude]
const endCoords = [121.0434251, 14.41683]; // [Longitude, Latitude]
    calculateETA(startCoords, endCoords);
    event.preventDefault();
    const mainContent = document.querySelector('#content main');

    const user = JSON.parse(localStorage.getItem('user'));
        if (["2", "3", "4", "5"].includes(user.role)) {
            showAlert('You do not have permission to access this page.', 'danger');
            return;
        }

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
  <div class="order position-relative" id="incomeChartContainer">
    <div class="head d-flex justify-content-between align-items-center">
      <h3>Income Chart</h3>
      <select id="chartTypeSelect" class="form-select w-auto">
        <option value="incomeToday">Daily Income</option>
        <option value="incomeWeek">Weekly Income</option>
        <option value="incomeMonth">Monthly Income</option>
        <option value="totalIncome">Total Income</option>
      </select>
    </div>
    <canvas id="incomeChart" height="100"></canvas>
  </div>
</div>


      
      <div class="table-data">
        <div class="order position-relative" id="incomeContent">
          <div class="head">
            <h3>Income Report</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Bus ID <i id="sort-busID-incomeReport" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                <th>Income This Week <i id="sort-incomeThisWeek-incomeReport" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                <th>Income This Month <i id="sort-incomeThisMonth-incomeReport" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                <th>Total Income <i id="sort-totalIncome-incomeReport" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
              </tr>
            </thead>
            <tbody id="busIncomeTable">
              <tr><td colspan="5">Loading...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="table-data">
        <div class="order position-relative" id="dailyIncome">
          <div class="head">
            <h3>Daily Income</h3>
            <a href="#" id="addDailyIncomeBtn" class="btn btn-success mb-4" data-bs-toggle="modal" data-bs-target="#incomeModal">
              <i class='bx bx-plus'></i> Add Daily Income
            </a>
          </div>
         <table>
          <thead>
            <tr>
              <th>Bus ID  <i id="sort-busID-dailyIncome" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
              <th>Income Today <i id="sort-incomeToday-dailyIncome" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
              <th>Date <i id="sort-date-dailyIncome" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
              <th>Last Logged By <i id="sort-lastLoggedBy-dailyIncome" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
              <th>Action</th> <!-- New Action column -->
            </tr>
          </thead>
          <tbody id="dailyIncomeTable">
            <tr><td colspan="5">Loading...</td></tr>
          </tbody>
        </table>
      </div>

        <div class="table-data">
          <div class="order position-relative" id="auditIncome">
            <div class="head">
              <h3>Income Audit Trail</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Bus ID <i id="sort-busID-auditTrail" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                  <th>Income Logged <i id="sort-incomeLogged-auditTrail" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                  <th>Logged By <i id="sort-loggedBy-auditTrail" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                  <th>Date & Time Logged <i id="sort-dateTimeLogged-auditTrail" class="bi bi-sort-up fs-5 ms-2 text-secondary" style="cursor: pointer;"></i></th>
                </tr>
              </thead>
              <tbody id="auditTableBody">
                <tr><td colspan="4">Loading...</td></tr>
              </tbody>
            </table>
          </div>
        </div>

			 <div id="alertContainer"></div>
    `;

    // Add event listener for the "Add Daily Income" button
    const addDailyIncomeBtn = document.getElementById('addDailyIncomeBtn');
    addDailyIncomeBtn.addEventListener('click', function (event) {
      event.preventDefault();
      showIncomeForm();
    });


document.getElementById('chartTypeSelect').addEventListener('change', function () {
  const selected = this.value;
  fetch('http://localhost:3000/income')
    .then(res => res.json())
    .then(data => renderIncomeChart(data, selected));
});


let incomeChart; // Declare this early, before any function that uses it

    fetchIncomeData(); // Fetch and display data
    fetchIncomeAuditData();
    

  });
});

function getLocalDateString(date) {
  const local = new Date(date);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().split('T')[0];
}

function renderIncomeChart(data, type = 'incomeToday') {
  const canvas = document.getElementById('incomeChart');
  if (!canvas) {
    console.warn("incomeChart canvas not found in DOM");
    return;
  }

  const ctx = canvas.getContext('2d');

  // ✅ Filter only today's records if type is incomeToday
  let filteredData = data;
  if (type === 'incomeToday') {
    const todayStr = getLocalDateString(new Date());
    filteredData = data.filter(item => {
      const updatedDate = item.updatedAt ? getLocalDateString(item.updatedAt) : null;
      return updatedDate === todayStr;
    });
  }

  const labels = filteredData.map(item => `Bus ${item.busID}`);
  const values = filteredData.map(item => item[type]);

  // ✅ Clean label names
  const incomeLabels = {
    incomeToday: 'Daily Income',
    incomeWeek: 'Weekly Income',
    incomeMonth: 'Monthly Income',
    totalIncome: 'Total Income'
  };
  const label = incomeLabels[type] || 'Income';

  // ✅ Destroy previous chart safely
  if (incomeChart instanceof Chart) {
    incomeChart.destroy();
  }

  incomeChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: label,
        data: values,
        backgroundColor: 'rgba(61, 145, 230, 0.6)',
        borderColor: 'rgba(61, 145, 230, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => '₱' + value.toLocaleString()
          }
        }
      }
    }
  });
}



function fetchIncomeData() {
  Promise.all([
    fetch('http://localhost:3000/income').then(res => res.json()),
    fetch('http://localhost:3000/accounts').then(res => res.json())
  ])
  .then(([incomeData, accounts]) => {
    const busIncomeTable = document.getElementById("busIncomeTable");
    const dailyIncomeTable = document.getElementById("dailyIncomeTable");

    busIncomeTable.innerHTML = "";
    dailyIncomeTable.innerHTML = "";

    if (incomeData.length === 0) {
      busIncomeTable.innerHTML = "<tr><td colspan='5'>No income data available</td></tr>";
      dailyIncomeTable.innerHTML = "<tr><td colspan='5'>No daily income data available</td></tr>";
    }

    incomeData.sort((a, b) => a.busID - b.busID);

    // Populate Bus Income Table
    incomeData.forEach(item => {
      const row = `
        <tr>
          <td>${item.busID}</td>
          <td>₱${item.incomeWeek.toFixed(2)}</td>
          <td>₱${item.incomeMonth.toFixed(2)}</td>
          <td>₱${item.totalIncome.toFixed(2)}</td>
        </tr>
      `;
      busIncomeTable.innerHTML += row;
    });

    // Populate Daily Income Table
    incomeData.forEach(item => {
      if (item.incomeToday >= 0) {
        const updatedDate = item.updatedAt
          ? new Date(item.updatedAt).toISOString().split('T')[0]
          : "N/A";

        const today = new Date().toISOString().split('T')[0];

        const actionButton = (updatedDate === today)
          ? `<a href="#" class="btn btn-success mb-2 edit-income-btn" data-busid="${item.busID}" data-bs-toggle="modal" data-bs-target="#incomeModal">
                <i class='bx bx-edit'></i> Edit
             </a>`
          : "";

        // Match cashier using item.cashierID
        const cashier = accounts.find(acc => acc.accountID === item.cashierID);
        const cashierName = cashier ? `${cashier.firstName} ${cashier.lastName}` : "N/A";

        const dailyRow = `
          <tr>
            <td>${item.busID}</td>
            <td>₱${item.incomeToday.toFixed(2)}</td>
            <td>${updatedDate}</td>
            <td>${cashierName}</td>
            <td>${actionButton}</td>
          </tr>
        `;
        dailyIncomeTable.innerHTML += dailyRow;
      }
    });

        renderIncomeChart(incomeData, 'incomeToday'); // default chart

    // ✅ Attach event listener to all edit buttons after table is rendered
    document.querySelectorAll('.edit-income-btn').forEach(button => {
      button.addEventListener('click', function (e) {
        e.preventDefault();
        const busID = this.getAttribute('data-busid');
        const currentIncome = this.closest('tr').children[1].innerText.replace(/[₱,]/g, '');
        showEditIncomeForm(busID, parseFloat(currentIncome));
      });
    });
    attachIncomeSortListeners();
    attachDailyIncomeSortListeners();
  })
  
  .catch(error => {
    console.error("Error fetching income or accounts data:", error);
    document.getElementById("busIncomeTable").innerHTML = "<tr><td colspan='5'>Failed to load data</td></tr>";
    document.getElementById("dailyIncomeTable").innerHTML = "<tr><td colspan='5'>Failed to load data</td></tr>";
  });
}

function fetchIncomeAuditData() {
  Promise.all([
    fetch('http://localhost:3000/income-audit').then(res => res.json()),
    fetch('http://localhost:3000/accounts').then(res => res.json())
  ])
  .then(([audits, accounts]) => {
    const auditTableBody = document.getElementById('auditTableBody');
    auditTableBody.innerHTML = "";

    if (audits.length === 0) {
      auditTableBody.innerHTML = "<tr><td colspan='4'>No audit records found.</td></tr>";
      return;
    }

    audits.reverse().forEach(entry => {
      const cashier = accounts.find(acc => acc.accountID === entry.cashierID);
      const cashierName = cashier ? `${cashier.firstName} ${cashier.lastName}` : "N/A";

      const dateLogged = new Date(entry.createdAt).toLocaleString();

      const row = `
        <tr>
          <td>${entry.busID}</td>
          <td>₱${entry.incomeToday.toFixed(2)}</td>
          <td>${cashierName}</td>
          <td>${dateLogged}</td>
        </tr>
      `;
      auditTableBody.innerHTML += row;
    });
    attachAuditTrailSortListeners();
  })
  .catch(error => {
    console.error("Error fetching audit data:", error);
    document.getElementById("auditTableBody").innerHTML = "<tr><td colspan='4'>Failed to load audit logs.</td></tr>";
  });
}


function showIncomeForm() {
  fetch('http://localhost:3000/income')
      .then(response => response.json())
      .then(data => {
        const busOptions = data
            .sort((a, b) => a.busID - b.busID) // Ensure sorting in the frontend
            .map(income => `<option value="${income.busID}">${income.busID}</option>`)
            .join('');


          const formHtml = `
              <div class="modal fade" id="incomeModal" tabindex="-1" aria-labelledby="incomeModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-md modal-dialog-centered">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="incomeModalLabel">Add Daily Income</h5>
                      <button type="button" class="btn-close white-text" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      <form id="incomeForm">
                         <div class="mb-3">
                          <label for="busId" class="form-label">Bus ID:</label>
                          <select class="form-select" id="busId" name="busId" required>
                            <option value="" selected disabled>Select Bus</option>
                            ${busOptions}
                          </select>
                        </div>
                        <div class="mb-3">
                          <label for="income" class="form-label">Today's Income:</label>
                          <input type="number" class="form-control" id="income" name="income" required>
                        </div>
                      </form>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                      <button type="button" class="btn btn-success" id="submitIncome">Submit</button>
                    </div>
                  </div>
                </div>
              </div>
          `;

          document.body.insertAdjacentHTML('beforeend', formHtml);
          document.getElementById('submitIncome').addEventListener('click', function () {
              const busId = document.getElementById('busId').value;
              const income = document.getElementById('income').value;
              
              if (busId && income) {
    const user = JSON.parse(localStorage.getItem('user'));

    fetch('http://localhost:3000/update-income', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            busID: Number(busId),
            incomeToday: Number(income),
            cashierID: user.accountid 
        })
    })
    .then(response => response.json())
    .then(data => {
        showAlert(data.message, 'success');
        incomeModal.hide();
        document.querySelector('#sidebar .side-menu.top li:nth-child(7) a').click();
    })
    .catch(error => console.error('Error updating income:', error));
} else {
    showAlert('Please fill in all fields.', 'warning');
}

          });

          const modalElement = document.getElementById('incomeModal');
          const incomeModal = new bootstrap.Modal(modalElement);
          incomeModal.show();

          modalElement.addEventListener('hidden.bs.modal', function () {
              modalElement.remove();
              document.querySelector('.modal-backdrop').remove();
              document.body.classList.remove('modal-open');
              document.body.style = '';
          });
      })
      .catch(error => console.error('Error fetching bus IDs:', error));
}

function showEditIncomeForm(busID, currentIncome) {
  const formHtml = `
    <div class="modal fade" id="incomeModal" tabindex="-1" aria-labelledby="incomeModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-md modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="incomeModalLabel">Edit Daily Income</h5>
            <button type="button" class="btn-close white-text" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="incomeEditForm">
              <div class="mb-3">
                <label class="form-label">Bus ID:</label>
                <input type="text" class="form-control" value="${busID}" readonly>
              </div>
              <div class="mb-3">
                <label for="income" class="form-label">New Daily Income:</label>
                <input type="number" class="form-control" id="newIncome" name="income" value="${currentIncome}" required>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-success" id="submitEditIncome">Update</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', formHtml);

  const modalElement = document.getElementById('incomeModal');
  const incomeModal = new bootstrap.Modal(modalElement);
  incomeModal.show();

  document.getElementById('submitEditIncome').addEventListener('click', function () {
    const newIncome = parseFloat(document.getElementById('newIncome').value);

    if (!isNaN(newIncome)) {
      const incomeDiff = newIncome - currentIncome;

      fetch('http://localhost:3000/update-income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ busID: Number(busID), incomeToday: incomeDiff, cashierID: user.accountid})
      })
      .then(res => res.json())
      .then(data => {
        showAlert(data.message, 'success');
        incomeModal.hide();
        document.querySelector('#sidebar .side-menu.top li:nth-child(7) a').click(); // Refresh income page
      })
      .catch(err => {
        console.error('Error updating income:', err);
        showAlert('Update failed.', 'danger');
      });
    } else {
      showAlert('Please enter a valid number.', 'warning');
    }
  });

  modalElement.addEventListener('hidden.bs.modal', function () {
    modalElement.remove();
    document.querySelector('.modal-backdrop').remove();
    document.body.classList.remove('modal-open');
    document.body.style = '';
  });
}


function showAlert(message, type) {
  let alertContainer = document.getElementById('alertContainer');

  // Create alert container if it doesn't exist
  if (!alertContainer) {
      alertContainer = document.createElement('div');
      alertContainer.id = 'alertContainer';
      document.body.prepend(alertContainer); // Add it at the top of the body
  }

  const alertHtml = `
      <div class="custom-alert alert alert-${type} alert-dismissible fade show" role="alert">
          ${message}
      </div>
  `;
  alertContainer.innerHTML = alertHtml;

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
      alertContainer.innerHTML = '';
  }, 3000);
}

// // TO DO
// 1. Only display Operating buses in the Daily Income table and form
// 2. Reset the "income today" field when date changes

const apiKey = "5b3ce3597851110001cf6248ef6021b6165e4d53935261fad6ed7e96"; // Your ORS API key
const startCoords = [121.0253809, 14.5504493]; // [Longitude, Latitude]
const endCoords = [121.0434251, 14.41683]; // [Longitude, Latitude]
const profile = "driving-car"; // Options: 'driving-car', 'cycling-regular', 'foot-walking'

async function calculateETA(startCoords, endCoords) {
  const url = `https://api.openrouteservice.org/v2/directions/${profile}`;

  console.log(`Fetching ETA from ORS: ${url}`);

  try {
      const response = await fetch(url, {
          method: "POST", // ORS requires a POST request
          headers: {
              "Content-Type": "application/json",
              "Authorization": apiKey // ORS requires API key in headers
          },
          body: JSON.stringify({
              coordinates: [startCoords, endCoords], // Proper format
              format: "json"
          })
      });

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
          const etaSeconds = data.routes[0].summary.duration; // Get duration in seconds
          const etaMinutes = Math.round(etaSeconds / 60); // Convert to minutes
          console.log(`Estimated Travel Time: ${etaMinutes} minutes`);
          return etaMinutes;
      } else {
          console.error("No route found. Response:", data);
          return null;
      }
  } catch (error) {
      console.error("Error fetching ETA:", error);
      return null;
  }
}

// Attach sort listeners to income report table
function attachIncomeSortListeners() {
    const sortConfig = {
        "sort-busID-incomeReport": { index: 0, type: "string" },
        "sort-incomeThisWeek-incomeReport": { index: 1, type: "number" },
        "sort-incomeThisMonth-incomeReport": { index: 2, type: "number" },
        "sort-totalIncome-incomeReport": { index: 3, type: "number" }
    };

    const table = document.getElementById("busIncomeTable");
    const sortState = {};

    Object.keys(sortConfig).forEach(id => {
        const config = sortConfig[id];
        const icon = document.getElementById(id);

        if (!icon || !table) return;

        icon.addEventListener("click", () => {
            const rows = Array.from(table.querySelectorAll("tr"));

            const index = config.index;
            const type = config.type;
            sortState[id] = !sortState[id];
            const direction = sortState[id] ? 1 : -1;

            rows.sort((a, b) => {
                let valA = a.children[index].textContent.trim();
                let valB = b.children[index].textContent.trim();

                if (type === "number") {
                    valA = parseFloat(valA.replace(/[^0-9.-]+/g, '')) || 0; // handles ₱, commas, etc.
                    valB = parseFloat(valB.replace(/[^0-9.-]+/g, '')) || 0;
                } else {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                }

                return valA < valB ? -1 * direction : valA > valB ? 1 * direction : 0;
            });

            // Replace table content
            table.innerHTML = "";
            rows.forEach(row => table.appendChild(row));

            // Toggle icon direction
            icon.classList.toggle("bi-sort-up", sortState[id]);
            icon.classList.toggle("bi-sort-down", !sortState[id]);
        });
    });
}

// Attach sort listeners to daily income table
function attachDailyIncomeSortListeners() {
  const tableBody = document.getElementById("dailyIncomeTable");
  let currentSort = { column: null, ascending: true };

  const sortIcons = {
    0: document.getElementById("sort-busID-dailyIncome"),
    1: document.getElementById("sort-incomeToday-dailyIncome"),
    2: document.getElementById("sort-date-dailyIncome"),
    3: document.getElementById("sort-lastLoggedBy-dailyIncome")
  };

  const getCellValue = (row, columnIndex) => {
    const cell = row.children[columnIndex];
    if (!cell) return "";
    const text = cell.textContent.trim();

    if (text === "N/A" || text === "") return null;

    if (columnIndex === 1) return parseFloat(text.replace(/[₱,]/g, "")) || 0; // Income Today
    if (columnIndex === 2) return new Date(text); // Date
    return text.toLowerCase(); // Bus ID, Last Logged By
  };

  const sortTable = (columnIndex) => {
    const rows = Array.from(tableBody.querySelectorAll("tr"));
    const ascending = currentSort.column === columnIndex ? !currentSort.ascending : true;
    currentSort = { column: columnIndex, ascending };

    
     // Toggle icons
    Object.entries(sortIcons).forEach(([col, icon]) => {
      icon.classList.remove("bi-sort-up", "bi-sort-down");
      icon.classList.add(
        parseInt(col) === columnIndex
          ? (ascending ? "bi-sort-up" : "bi-sort-down")
          : "bi-sort-up"
      );
    });

    rows.sort((a, b) => {
      const valA = getCellValue(a, columnIndex);
      const valB = getCellValue(b, columnIndex);

      if (valA === null && valB === null) return 0;
      if (valA === null) return 1; // push N/A to bottom
      if (valB === null) return -1;

      if (valA < valB) return ascending ? -1 : 1;
      if (valA > valB) return ascending ? 1 : -1;
      return 0;
    });

    tableBody.innerHTML = "";
    rows.forEach(row => tableBody.appendChild(row));
  };

  document.getElementById("sort-busID-dailyIncome").addEventListener("click", () => sortTable(0));
  document.getElementById("sort-incomeToday-dailyIncome").addEventListener("click", () => sortTable(1));
  document.getElementById("sort-date-dailyIncome").addEventListener("click", () => sortTable(2));
  document.getElementById("sort-lastLoggedBy-dailyIncome").addEventListener("click", () => sortTable(3));
}

function attachAuditTrailSortListeners() {
  const tableBody = document.getElementById("auditTableBody");
  let currentSort = { column: null, ascending: true };

  const sortIcons = {
    0: document.getElementById("sort-busID-auditTrail"),
    1: document.getElementById("sort-incomeLogged-auditTrail"),
    2: document.getElementById("sort-loggedBy-auditTrail"),
    3: document.getElementById("sort-dateTimeLogged-auditTrail")
  };

  const getCellValue = (row, columnIndex) => {
    const cell = row.children[columnIndex];
    if (!cell) return "";
    const text = cell.textContent.trim();

    if (text === "N/A" || text === "") return null;

    if (columnIndex === 1) return parseFloat(text.replace(/[₱,]/g, "")) || 0; // Income Logged
    if (columnIndex === 3) return new Date(text); // Date & Time Logged
    return text.toLowerCase(); // Bus ID, Logged By
  };

  const sortTable = (columnIndex) => {
    const rows = Array.from(tableBody.querySelectorAll("tr"));
    const ascending = currentSort.column === columnIndex ? !currentSort.ascending : true;
    currentSort = { column: columnIndex, ascending };

     // Toggle icon classes
    Object.entries(sortIcons).forEach(([col, icon]) => {
      if (parseInt(col) === columnIndex) {
        icon.classList.remove("bi-sort-up", "bi-sort-down");
        icon.classList.add(ascending ? "bi-sort-up" : "bi-sort-down");
      } else {
        icon.classList.remove("bi-sort-down");
        icon.classList.add("bi-sort-up");
      }
    });


    rows.sort((a, b) => {
      const valA = getCellValue(a, columnIndex);
      const valB = getCellValue(b, columnIndex);

      if (valA === null && valB === null) return 0;
      if (valA === null) return 1;
      if (valB === null) return -1;

      if (valA < valB) return ascending ? -1 : 1;
      if (valA > valB) return ascending ? 1 : -1;
      return 0;
    });

    tableBody.innerHTML = "";
    rows.forEach(row => tableBody.appendChild(row));
  };

  // Attach click events
  document.getElementById("sort-busID-auditTrail").addEventListener("click", () => sortTable(0));
  document.getElementById("sort-incomeLogged-auditTrail").addEventListener("click", () => sortTable(1));
  document.getElementById("sort-loggedBy-auditTrail").addEventListener("click", () => sortTable(2));
  document.getElementById("sort-dateTimeLogged-auditTrail").addEventListener("click", () => sortTable(3));
}
