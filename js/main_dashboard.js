
 
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const hostname = window.location.hostname;
const port = window.location.port ? `:${window.location.port}` : '';
const socket = new WebSocket(`${protocol}://${hostname}${port}`);



 socket.addEventListener("open", () => {
    console.log("WebSocket connection established");
     socket.send(JSON.stringify({
    type: "initSession",
    accountId: JSON.parse(localStorage.getItem('user')).accountid
}));

});


socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
   

    console.log(data);

    // Log if the message is from someone else
    if (data.sender && data.sender !== user.username) {
        console.log(`New message from ${data.sender} in ${data.channel}`);
        checkUnseenMentions()
        // Optional: show a toast or badge if you want to notify
    }

    // Mention handling (optional)
    if (data.mentions && Array.isArray(data.mentions)) {
        const isMentioned = data.mentions.some(mention => mention.accountid === user.accountid);
        if (isMentioned) {
       showMessageAlert(`You were mentioned by ${data.sender} in ${data.channel}`, "primary", data.channel);

            console.log("MENTIONED");
        }
    }
});


document.addEventListener("DOMContentLoaded", async function () {
 
	const user = JSON.parse(localStorage.getItem('user'));

    checkUnseenMentions();
    
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

// Set profile picture
const profileImg = document.querySelector('#profileDropdown img');
if (profileImg) {
    profileImg.src = user.pic ? user.pic : 'img/people.png'; // Use stored profile pic or fallback image
    profileImg.alt = "User Profile Picture"; // Accessibility
} else {
    console.error("Profile image element not found.");
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
    const weeklyIncomeBox = document.querySelector("#weeklyIncome"); // Select element by ID
    // Weekly Income display
    const dispatchTableBody = document.querySelector("#dispatchContent tbody"); // Dispatch Table

    try {
       // Fetch Maintenance Data
	   const maintenanceResponse = await fetch("/maintenance");
	   const buses = await maintenanceResponse.json();

    // Sort by status: Operating → Maintenance → Pending
	  buses.sort((a, b) => a.status - b.status);

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
        const incomeResponse = await fetch("/income");
        const incomeData = await incomeResponse.json();

        incomeData.sort((a, b) => a.busID - b.busID);

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
        weeklyIncomeBox.textContent = `₱${totalWeeklyIncome.toLocaleString()}`;

        // Calculate total income for today
        let totalIncomeToday = incomeData.reduce((sum, income) => sum + (income.incomeToday || 0), 0);

        // Update the Total Income Today UI
        document.getElementById("totalIncomeToday").textContent = `₱${totalIncomeToday.toLocaleString()}`;

          // Fetch Dispatch Data
        const dispatchResponse = await fetch("/dispatch");
        const dispatchData = await dispatchResponse.json();
        dispatchData.sort((a, b) => a.busID - b.busID);

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
const brandText = document.querySelector('.brand .text');
const brandLogo = document.querySelector('.brand img');

// When clicked, toggle the sidebar
menuBar.addEventListener('click', function () {
    sidebar.classList.toggle('hide');

    if (sidebar.classList.contains('hide')) {
        brandText.style.display = 'none'; // Hide text
        brandLogo.style.height = '43px'; // Make the logo smaller
    } else {
        brandText.style.display = 'block'; // Show text
        brandLogo.style.height = '75px'; // Restore original size
    }
});










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


async function checkUnseenMentions() {
  const currentAccountId = JSON.parse(localStorage.getItem('user')).accountid;
  console.log(currentAccountId);

  try {
    const response = await fetch(`/api/unseen-mentions/${currentAccountId}`);
    if (!response.ok) throw new Error('Failed to fetch messages');

    const messages = await response.json();
    console.log("🔔 Unseen mention messages for account ID " + currentAccountId, messages);

    const badge = document.getElementById('mention-count');

    if (messages.length > 0) {
      badge.textContent = messages.length;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }

  } catch (error) {
    console.error("Error checking unseen mentions:", error);
  }
}


  document.addEventListener("DOMContentLoaded", checkUnseenMentions);

function showMessageAlert(message, type, channelName) {
  const alertContainer = document.getElementById('alertContainer');
  if (!alertContainer) {
    console.error("Alert container not found.");
    return;
  }

  // Play notification sound
  const notificationSound = new Audio('./audio/notification.mp3'); // Make sure this file exists in your project
  notificationSound.play().catch(e => {
    console.warn("Audio playback failed:", e);
  });

  const alertHtml = `
    <div class="custom-alert alert alert-${type} alert-dismissible fade show" role="alert" style="cursor: pointer;">
      ${message}
      <button type="button" class="btn-close" aria-label="Close"></button>
    </div>
  `;

  alertContainer.innerHTML = alertHtml;

  const alertElement = alertContainer.querySelector('.alert');
  const closeButton = alertElement.querySelector('.btn-close');

  closeButton.addEventListener('click', (event) => {
    event.stopPropagation();
    alertElement.classList.remove('show');
    alertElement.classList.add('hide');
    setTimeout(() => alertElement.remove(), 500);
  });

  alertElement.addEventListener('click', () => {
    if (channelName) {
      window.location.href = `message.html?channel=${encodeURIComponent(channelName)}`;
    } else {
      window.location.href = 'message.html';
    }
  });

  setTimeout(() => {
    if (alertElement) {
      alertElement.classList.remove('show');
      alertElement.classList.add('hide');
      setTimeout(() => alertElement.remove(), 500);
    }
  }, 30000);
}
