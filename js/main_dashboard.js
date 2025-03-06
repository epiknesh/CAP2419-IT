document.addEventListener("DOMContentLoaded", async function () {
	const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        window.location.href = 'login.html'; // Redirect if not logged in
        return;
    }

	const logoutButton = document.querySelector('.logout');

if (logoutButton) {
    logoutButton.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default link behavior

        console.log("Logout button clicked"); // Log when button is clicked

        // Clear stored user data and token
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        console.log("User data removed from localStorage"); // Log after clearing storage

        // Redirect to login page
        window.location.href = 'login.html';
    });
} else {
    console.error("Logout button not found in the DOM.");
}

const logoutLink = document.querySelector('.dropdown-item.text-danger');

    if (logoutLink) {
        logoutLink.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent default navigation

            // Clear stored user data and token
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            console.log("User data removed from localStorage"); // Log after clearing storage

            // Redirect to login page
            window.location.href = 'login.html';
        });
    } 


console.log(user);
	
    const fleetContent = document.querySelector("#fleetContent tbody");
    const maintenanceContent = document.querySelector("#maintenanceContent tbody");
    const busPercentageBox = document.querySelector(".text-success");
    const incomeTableBody = document.querySelector("#incomeContent tbody"); 
    const weeklyIncomeBox = document.querySelector(".box-info li:first-child h3"); // Weekly Income display
    const dispatchTableBody = document.querySelector("#dispatchContent tbody"); // Dispatch Table

    try {
       // Fetch Maintenance Data
	   const maintenanceResponse = await fetch("http://localhost:3000/maintenance");
	   const buses = await maintenanceResponse.json();

	   let operatingBuses = new Set(); // Store operating bus IDs
	   let operatingCount = 0;
	   const totalBuses = buses.length;
	   

	   fleetContent.innerHTML = "";
	   maintenanceContent.innerHTML = "";

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

		   fleetContent.innerHTML += `
			   <tr>
				   <td>${bus.busID}</td>
				   <td>${new Date().toLocaleDateString()}</td>
				   <td><span class="status ${statusClass}">${statusText}</span></td>
			   </tr>
		   `;

		   if (bus.status === 2 || bus.status === 3) {
			   maintenanceContent.innerHTML += `
				   <tr>
					   <td>${bus.busID}</td>
					   <td>${bus.issue}</td>
				   </tr>
			   `;
		   }
	   });

	   const operatingPercentage = totalBuses > 0 ? (operatingCount / totalBuses) * 100 : 0;
	   busPercentageBox.innerHTML = `${operatingPercentage.toFixed(2)}%`;


        // Fetch Income Data
        const incomeResponse = await fetch("http://localhost:3000/income");
        const incomeData = await incomeResponse.json();

        incomeTableBody.innerHTML = ""; // Clear existing data
        let totalWeeklyIncome = 0;

        incomeData.forEach(income => {
            totalWeeklyIncome += income.incomeWeek || 0; // Sum up weekly income

            const row = `
                <tr>
                    <td>${income.busID}</td>
                    <td>${income.incomeToday !== null ? `₱${income.incomeToday}` : 'N/A'}</td>
                    <td>${income.incomeWeek !== null ? `₱${income.incomeWeek}` : 'N/A'}</td>
                </tr>
            `;
            incomeTableBody.innerHTML += row;
        });

        // Update Weekly Income display
        weeklyIncomeBox.innerHTML = `₱${totalWeeklyIncome.toLocaleString()}`;

          // Fetch Dispatch Data
        const dispatchResponse = await fetch("http://localhost:3000/dispatch");
        const dispatchData = await dispatchResponse.json();

        dispatchTableBody.innerHTML = ""; // Clear previous data

        dispatchData.forEach(dispatch => {
            // Only add to dispatch table if the bus is operating
            if (operatingBuses.has(dispatch.busID)) {
                // Determine Status Label
                let statusLabel = dispatch.status === 1 ? "In Terminal" : "In Transit";

                const formattedTime = dispatch.nextDispatch
                    ? new Date(dispatch.nextDispatch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'N/A';

                const row = `
                    <tr>
                        <td>${dispatch.busID}</td>
                        <td>${statusLabel}</td>
                        <td>${formattedTime}</td>
                    </tr>
                `;
                dispatchTableBody.innerHTML += row;
            }
        });

    } catch (error) {
        console.error("Error fetching data:", error);
    }

    // Refresh Button
    const refreshButton = document.querySelector('#content nav .bx.bx-refresh');
    refreshButton.addEventListener('click', function () {
        location.reload();
    });
});

const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach(item=> {
	const li = item.parentElement;

	item.addEventListener('click', function () {
		allSideMenu.forEach(i=> {
			i.parentElement.classList.remove('active');
		})
		li.classList.add('active');
	})
});




// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

// When clicked, toggle the sidebar
menuBar.addEventListener('click', function () {
	sidebar.classList.toggle('hide');
})







const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');

searchButton.addEventListener('click', function (e) {
	if(window.innerWidth < 576) {
		e.preventDefault();
		searchForm.classList.toggle('show');
		if(searchForm.classList.contains('show')) {
			searchButtonIcon.classList.replace('bx-search', 'bx-x');
		} else {
			searchButtonIcon.classList.replace('bx-x', 'bx-search');
		}
	}
})





if(window.innerWidth < 768) {
	sidebar.classList.add('hide');
} else if(window.innerWidth > 576) {
	searchButtonIcon.classList.replace('bx-x', 'bx-search');
	searchForm.classList.remove('show');
}


window.addEventListener('resize', function () {
	if(this.innerWidth > 576) {
		searchButtonIcon.classList.replace('bx-x', 'bx-search');
		searchForm.classList.remove('show');
	}
})



const switchMode = document.getElementById('switch-mode');

switchMode.addEventListener('change', function () {
	if(this.checked) {
		document.body.classList.add('dark');
	} else {
		document.body.classList.remove('dark');
	}
})