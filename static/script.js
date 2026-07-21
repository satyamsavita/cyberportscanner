let scanResults = [];
let currentFilter = "all";

async function scanPorts() {

    const ip = document.getElementById("ip").value.trim();
    const startPort = document.getElementById("start_port").value;
    const endPort = document.getElementById("end_port").value;

    if (ip === "") {
        alert("Please enter an IP Address or Hostname.");
        return;
    }

    const scanBtn = document.getElementById("scanBtn");
    const statusText = document.getElementById("statusText");
    const progressBar = document.getElementById("progressBar");

    scanBtn.disabled = true;
    scanBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Scanning...';

    statusText.innerHTML = "Scanning...";
    statusText.style.color = "#00ffff";

    progressBar.style.width = "15%";

    try {

        const response = await fetch("/scan", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                ip: ip,

                start_port: startPort,

                end_port: endPort

            })

        });

        progressBar.style.width = "60%";

        const result = await response.json();

        if (!result.success) {

            statusText.innerHTML = "Failed";
            statusText.style.color = "#ff4d4d";

            progressBar.style.width = "0%";

            alert(result.message);

            scanBtn.disabled = false;

            scanBtn.innerHTML =
                '<i class="fa-solid fa-magnifying-glass"></i> Scan Ports';

            return;

        }

        scanResults = result.data.results;

        document.getElementById("openCount").innerHTML =
            result.data.open_count;

        document.getElementById("closedCount").innerHTML =
            result.data.closed_count;

        document.getElementById("scanTime").innerHTML =
            result.data.scan_time + " sec";

        progressBar.style.width = "100%";

        statusText.innerHTML = "Scan Completed";

        statusText.style.color = "#00ff95";

        renderTable();

    }

    catch (error) {

        console.error(error);

        statusText.innerHTML = "Server Error";

        statusText.style.color = "#ff4d4d";

        progressBar.style.width = "0%";

        alert("Unable to connect to Flask server.");

    }

    scanBtn.disabled = false;

    scanBtn.innerHTML =
        '<i class="fa-solid fa-magnifying-glass"></i> Scan Ports';

}



function renderTable() {

    const table = document.getElementById("resultTable");

    table.innerHTML = "";

    let filtered = [...scanResults];

    // Show only ports that have a known service
    filtered = filtered.filter(item =>
        item.service !== "No Standard Service"
    );

    if (currentFilter === "open") {
        filtered = filtered.filter(item => item.status === "Open");
    }

    if (currentFilter === "closed") {
        filtered = filtered.filter(item => item.status === "Closed");
    }

    const keyword = document
        .getElementById("searchBox")
        .value
        .toLowerCase();

    if (keyword !== "") {

        filtered = filtered.filter(item =>

            item.port.toString().includes(keyword) ||

            item.service.toLowerCase().includes(keyword)

        );

    }

    if (filtered.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="3">No Results Found</td>
            </tr>
        `;

        return;

    }

    filtered.forEach(item => {

        const statusClass =
            item.status === "Open" ? "open" : "closed";

        const statusIcon =
            item.status === "Open" ? "🟢" : "🔴";

        table.innerHTML += `
            <tr>
                <td>${item.port}</td>
                <td>${item.service}</td>
                <td class="${statusClass}">
                    ${statusIcon} ${item.status}
                </td>
            </tr>
        `;

    });

}


function filterPorts(type, event) {

    currentFilter = type;

    document
        .querySelectorAll(".btn-filter")
        .forEach(button => {

            button.classList.remove("active");

        });

    event.target.classList.add("active");

    renderTable();

}



function searchResults() {

    renderTable();

}



function generatePDF() {

    if(scanResults.length===0){

        alert("Please scan ports first.");

        return;

    }

    fetch("/generate_pdf",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            results:scanResults,

            open:document.getElementById("openCount").innerText,

            closed:document.getElementById("closedCount").innerText,

            scan_time:document.getElementById("scanTime").innerText,

            ip:document.getElementById("ip").value

        })

    })

    .then(response=>response.blob())

    .then(blob=>{

        const url=window.URL.createObjectURL(blob);

        const a=document.createElement("a");

        a.href=url;

        a.download="Scan_Report.pdf";

        a.click();

        window.URL.revokeObjectURL(url);

    });

}