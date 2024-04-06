document.addEventListener("DOMContentLoaded", function () {
    // Show dropdown when default option is clicked
    document.querySelector(".default_option").addEventListener("click", function (event) {
        event.stopPropagation(); // Prevent event bubbling
        document.querySelector(".dropdown ul").classList.add("active");
    });

    // Update default option text and hide dropdown when an option is selected
    document.querySelectorAll(".dropdown ul li").forEach(function (element) {
        element.addEventListener("click", function () {
            var text = element.textContent;
            document.querySelector(".default_option").textContent = text;
            document.querySelector(".dropdown ul").classList.remove("active");
        });
    });

    // Hide dropdown when clicking outside of it
    document.addEventListener("click", function (event) {
        var target = event.target;
        if (!target.closest('.dropdown')) {
            document.querySelector(".dropdown ul").classList.remove("active");
        }
    });


    // Get the search button element by its ID
    let searchButton = document.getElementById("searchButton");

    // Add a click event listener to the search button
    searchButton.addEventListener("click", function () {
        let serverName = document.getElementById("serverName").innerText
        let summonerName = document.getElementById("summonerNameInput").value;
        let url = `http://localhost:3000/profile/${serverName}/${summonerName}/`;

        console.log(url, "url")

        fetch(url, { headers: { 'X_REQUESTED_WITH': 'XMLHttpRequest' } })
            .then((response) => {
                console.log(response);
                return response.json();
            })
            .then((data) => {
                console.log(data, "data");
                document.getElementById("main-data").innerText = JSON.stringify(data);
            });
    });
});