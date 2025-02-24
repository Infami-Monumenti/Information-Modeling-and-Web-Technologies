var items = [];
var narratives = [];
var selection = [];
var curNarrative = "";
var curVal = "";
var curSort = "";
var currentSelection = []; // Definindo currentSelection no escopo global
// additional variables for offcanvas narratives
var timeList = [];
var placeList = [];
var genreList = [];
// mapping with schema properties
var schemaMapping = {
    "time": "dateCreated",
    "temporal": "temporalCoverage",
    "conservation location": "spatial",
    "author": "author",
    "authority": "sameAs",
    "place": "locationCreated",
    "artistic expression": "genre",
}

document.addEventListener("DOMContentLoaded", async function() {
    console.log("Ready to fetch");
    $.ajax({
        url: "data/revised_structure.json",
        method: "get",
        success: function(data) {
            items = data.items;
            console.log("items stored");

            var startItem = data.meta.startItem;
            var item = items[startItem];
            console.log(JSON.stringify(item));

            narratives = data.meta.narratives;
            curNarrative = data.meta.startNarrative;
            curVal = data.meta.startVal;

            // check if the there is a itemId in the URL and load the correponding item
            const urlParams = new URLSearchParams(window.location.search);
            const itemId = urlParams.get('itemId');

            if (itemId) {
                const index = items.findIndex(item => item.iId == itemId);
                if (index !== -1) {
                    currentSelection = items; // Define currentSelection as all items
                    showInfo(index);
                }
            } else {
                prepareNarratives(); // Load the initial item if there is no itemId in the URL
            }
        },
        error: function(data) {
            alert("Loading error");
        }
    });
});

function prepareNarratives() {
    currentSelection = items.filter(i => i.info.narratives[curNarrative] == curVal)
    console.log(JSON.stringify(currentSelection))
    currentSelection.sort((i,j) => {
        if (i["iId"] < j["iId"]) return -1;
        if (i["iId"] > j["iId"]) return 1;
        return 0;
    });
    if (currentSelection.length==0)
        currentSelection = items
    var index = currentSelection.findIndex(i => i["iId"] == curSort) 
    if (index == -1) index = 0
    showInfo(index)
};

const infoTitle = document.getElementById("infoTitle");
const shortInfo = $("#text1");
const figImage = $("#img");
const figCaption = $("#item-figcaption");
const longerInfo = $("#text2");
const fullInfo = $("#text3");
const infoContainer = $("#info-wrapper")
const metaTable = $("#table")

function showInfo(index) {
    var item = currentSelection[index];
    curSort = item["iId"];

    infoTitle.innerHTML = item.name;
    shortInfo.html(item.info["text 1"] + '<br>' + '<a type="button" class="btn btn-outline-dark btn-sm display-text-btn" onclick="showText2()">Read more</a>');
    figImage.attr('src', item.info.image);
    figImage.attr('alt', item.name);
    figImage.css("aspect-ratio", item.display["aspect ratio"])
    figCaption.html(item.name);
    longerInfo.html(item.info["text 2"] + '<br>' + '<a type="button" class="btn btn-outline-dark btn-sm display-text-btn" onclick="showText1()">Back</a> <a type="button" class="btn btn-outline-dark btn-sm display-text-btn" onclick="showText3()">Read more</a>');
    
    // for full html
    document.getElementById("fullText").dataset.uri = item.info["text 3"];

    // ensuring text1 is the first to be displayed when the item or the narrative changes
    if ($("#text1").hasClass("d-none")) {
        showText1();
    }
    createInfoTable(item)

    prepareNavigationButtons(index);
}

function showText1() {
    shortInfo.removeClass("d-none");
    fullInfo.addClass("d-none");
    longerInfo.addClass("d-none");
    infoContainer.animate({scrollTop: 0}, "fast")
}

function showText2() {
    $("#text1").addClass("d-none");
    $("#text3").addClass("d-none");
    $("#text2").removeClass("d-none");
    $("#fullText").addClass("d-none");
    $("#info-wrapper").animate({scrollTop: 0}, "fast")
}

// for full html
function showText3() {
    var uri = document.getElementById("fullText").dataset.uri
    fetch(uri)
    .then(response => response.text())
    .then(data => {
        document.getElementById("fullText").innerHTML = data;
        $("#fullText").removeClass("d-none").fadeIn("slow");
        $("#text1").addClass("d-none");
        $("#text2").addClass("d-none");
        $("#fullText").scrollTo(0,0)

        // hide table on small screen when full text is displayed
        if (window.matchMedia("(max-width: 900px)") && tableCol.hasClass("visible")) {
            tableCol.removeClass("visible")
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);  
        window.alert("Data not fetched");
    });
}

function createInfoTable(item) {
    var table = $("#info");
    table.html("");

    for (let i in item.itemMeta) {
        if (item.itemMeta[i]) {
            let val = item.itemMeta[i];
            // display only non empty values
            if (item.itemMeta[i] !== "") {
                if (i === "authority" || i == "sameAs") {
                    let authorityLink = ('<a class="button" role="button" target="_blank" href=" ' + item.itemMeta[i] + ' " style="color:black;">' + item.name + '</a>');
                    table.append("<tr><th><span>" + i + "</span></th><td>" + authorityLink + "</td></tr>"); 
                } else {
                    if ((i !== "authority" || i !== "sameAs") && narratives.includes(item.itemMeta[i])) {
                    val = ('<a class="button" role="button" href="#" onclick="changeNarrative(\'' + i + '\',\'' + val + '\')">' + val + '</a>');
                    }
                    table.append("<tr><th><span>" + i + "</span></th><td>" + val + "</td></tr>");
                }
            } else {
                table.append("<tr><th><span>" + i + "</span></th><td>" + item.itemMeta[i] + "</td></tr>");
            }
        }
    }
    // display schema property as popups
    let firstHeader = table.find("th").first();
    firstHeader.addClass("schema-popup");

    let tableHeaders = table.find("th")
    tableHeaders.each(function() {
        let header = $(this);
        let headerText = header.text().trim();
        let mappedText = schemaMapping[headerText];
        

        if (mappedText) {
            let popupSpan = $(document.createElement("span")).text(mappedText);
            popupSpan.addClass("popuptext");

            // position the popups
            // get height of th element
            var thHeight = header.innerHeight();
           
            var thSpanHeight = popupSpan.innerHeight();
            var topPosition = thHeight / 2 - thSpanHeight;
            

            popupSpan.css({top: `${topPosition}px`});
            header.addClass("popup");
            header.append(popupSpan);


            header.on("click", function() {
                // close popup when another th is clicked
                $(".popuptext.show").not(popupSpan).removeClass("show");
                popupSpan.toggleClass("show");
            });
        }
    });
}
function changeNarrative(narrative, value) {
    curNarrative = narrative;
    curVal = value;
    if (curNarrative == "place") {
        $("body").css("background-image", "url(images/prova_bg_place.png)");
    } if (curNarrative == "artistic expression") {
        $("body").css("background-image", "url(images/prova_bg_genre.png)");
    } if (curNarrative == "time") {
        $("body").css("background-image", "url(images/prova_bg_time.png)");
    }
    prepareNarratives();
}

function prepareNavigationButtons(index) {
    if (index > 0) {
        $("#prevBtn").removeClass("disabled");
        // check use of .off
        $("#prevBtn").off("click").click(function() {
            showInfo(index - 1);
        });
        $("#prevBtn").text(currentSelection[index - 1].name)
    } else {
        $("#prevBtn").addClass("disabled");
        $("#prevBtn").click = null;
        $("#prevBtn").text("no item available");
    }
    if (index < currentSelection.length - 1) {
        $("#nextBtn").removeClass("disabled");
        $("#nextBtn").click(function() { showInfo(index + 1) });
        $("#nextBtn").text(currentSelection[index + 1].name);
    } else {
        $("#nextBtn").addClass("disabled");
        $("#nextBtn").click = null;
        $("#nextBtn").text("no item available");
    }
    $("#narrative").text(curNarrative+": "+curVal)
}

// offcanvas narratives
// Initialize offcanvas instance
let offCanvasElement = document.getElementById('offcanvasExample');
let offCanvas = new bootstrap.Offcanvas(offCanvasElement);
let offCanvasLink = $(".open-option")
let chooseTime = $(".fa-clock")
let choosePlace = $(".fa-earth-americas")
let chooseGenre = $(".fa-paintbrush")
offCanvasLink.on("click", function() {
    console.log("click event fired")
    if ($(this).find(chooseTime).length) {
        showTimeNarrative()
    }
    if ($(this).find(choosePlace).length) {
        showPlaceNarrative()
        
    }
    if ($(this).find(chooseGenre).length) {
        showGenreNarrative()
        
    }
})

// toggle time narrative
function showTimeNarrative() {
        // clearing the list before appending new items
        $("#narr-val-list").empty()
        timeList = items.map((item) => (item.info.narratives.time.trim()))
        timeList = [... new Set(timeList)]
        for (let period of timeList) {
            $("#narr-val-list").append('<li>' + period + '</li>')
            $("#offcanvas-narrative-title").text("Time")
            $("#offcanvas-text").text("Click on a time period to discover the items associated to it.")   
        }
        $("#narr-val-list").on("click", "li", function() {
            var selectedVal = $(this).text()
            console.log(selectedVal)
            var timeNarrative = "time"
            changeNarrative(timeNarrative, selectedVal)
            offCanvas.hide()
        })
}

// toggle place narrative
function showPlaceNarrative() {
        // clearing the list before appending new items
        $("#narr-val-list").empty()
        placeList = items.map((item) => (item.info.narratives.place.trim()))
        placeList = [... new Set(placeList)]
        for (let place of placeList) {
            $("#narr-val-list").append('<li>' + place + '</li>')
            $("#offcanvas-narrative-title").text("Place")
            $("#offcanvas-text").text("Click on a place to discover the items associated to it.")  
        }
        $("#narr-val-list").on("click", "li", function() {
            var selectedVal = $(this).text()
            console.log(selectedVal)
            var placeNarrative = "place"
            changeNarrative(placeNarrative, selectedVal)
            offCanvas.hide()
        })
}

// toggle genre narrative
function showGenreNarrative() {
        // clearing the list before appending new items
        $("#narr-val-list").empty()
        genreList = items.map((item) => (item.info.narratives["artistic expression"].trim()))
        genreList = [... new Set(genreList)]
        for (let genre of genreList) {
            $("#narr-val-list").append('<li>' + genre + '</li>')
            $("#offcanvas-narrative-title").text("Artistic Expression")
            $("#offcanvas-text").text("Click on a genre to discover the items associated to it.")   
        }
        $("#narr-val-list").on("click", "li", function() {
            var selectedVal = $(this).text()
            console.log(selectedVal)
            var genreNarrative = "artistic expression"
            changeNarrative(genreNarrative, selectedVal)
            offCanvas.hide()
        })
}


// display table on small screen layout
const figure = $(".exhibit-figure");
const infoIcon = $(".see-info-icon");
const imgCol = $("#imgCol");
const infoCol = $("#infoCol");
const tableCol = $("#tableCol");
const mediaQuery = window.matchMedia("(max-width: 900px)");

function handleScreenResize(e) {
    if (e.matches) {
        tableCol.removeClass("visible")
        tableCol.css("pointer-events", "none");
        //table.css("height", item.display.height)
        infoIcon.on("click", function() {
            tableCol.toggleClass("visible");
            if (tableCol.hasClass("visible")) {
                figImage.css("box-shadow", "none");
                tableCol.css("pointer-events", "auto");
            } else {
                figImage.css("box-shadow", "0.1rem 0.1rem 0.1rem rgba(151 112 96 / 0.5)");
                tableCol.css("pointer-events", "none");
            }
        });
    } else {
        infoIcon.off("click");
        tableCol.removeClass("visible");
        tableCol.css("pointer-events", "auto");
    }
}

handleScreenResize(mediaQuery);

mediaQuery.addEventListener("change", handleScreenResize);

// change title position in smaller screen sizes
function updateTitlePosition() {
    const grid = document.getElementById("main-im");

    if (window.innerWidth <= 900 && infoTitle.parentNode !== document.body) {
        infoTitle.style.display = "block"
        infoTitle.style.marginTop = "3em"
        document.body.insertBefore(infoTitle, grid); // Move title above the grid
    } else if (window.innerWidth > 900 && infoTitle.parentNode !== grid) {
        infoTitle.style.marginTop = "1rem"
        infoCol.prepend(infoTitle); // Move title back inside the grid
    }
}

window.addEventListener("DOMContentLoaded", updateTitlePosition);
window.addEventListener("resize", updateTitlePosition);

// function for handling modal-background interaction
let infoModal = $("#info-modal");
let modalSpan = $("#select-narr-pos");
let infoModalBody = $(".modal-body");
let chooseNarrative = $("#choose-from-offcanvas");
let title = $(".modal-body > h6");
let paragraphMapping = {
    "use-table": "#info",
    "see-schema": ".schema-popup",
    "use-offcanvas": "#choose-from-offcanvas"
}
function highlightOnScroll() {
    if (infoModal) {
        infoModalBody.on("scroll", function() {
            let scrollTop = infoModalBody.scrollTop();
            let titleId = "";
            let paragraphOnScreen = "";

            for (let t of title) {
                titleId = t.getAttribute("id");
                console.log(titleId)
                let titleOffset = t.offsetTop; 
                console.log(titleOffset)

                if (scrollTop >= titleOffset) {
                    paragraphOnScreen = titleId;
                    console.log(paragraphOnScreen);
                }
            }

            if (paragraphOnScreen) {
                let bgElement = $(paragraphMapping[paragraphOnScreen]); 
                console.log(bgElement);
                highlightBackground(bgElement);

                if (paragraphOnScreen === "see-schema") {
                    firstHeader.setAttribute("style", "background-color: rgba(61, 19, 2, 0.5);");
                }

                // Check if the paragraph on screen corresponds to the table
                if (paragraphOnScreen === "use-table" || paragraphOnScreen === "see-schema" && mediaQuery.matches) {
                    tableCol.addClass("visible");
                    tableCol.css("pointer-events", "auto");
                } else if (mediaQuery.matches) {
                    // Hide the table when "use-table" is no longer on screen
                    tableCol.removeClass("visible");
                    tableCol.css("pointer-events", "none");
                }
            }
        })
    } 
}

function highlightBackground(element) {
    $.each(paragraphMapping, function(key, value) {
        $(value).removeClass("highlight");
    });
    element.addClass("highlight");
}


infoModal.on("shown.bs.modal", function () {
    highlightOnScroll();
});

// Remove highlight when modal is hidden
infoModal.on("hidden.bs.modal", function () {
    $.each(paragraphMapping, function(key, value) {
        $(value).removeClass("highlight");  
    });
    // Hide the table when the modal is closed (on small screens)
    if (mediaQuery.matches) {
        tableCol.removeClass("visible");
        tableCol.css("pointer-events", "none");
    }
});



// navbar
// select all navbar and dropdown links 
const navLinks = document.querySelectorAll('.nav-link');
const dropdownLinks = document.querySelectorAll('.dropdown-item');

// obtain current URL path
const currentPath = window.location.pathname.split("/").pop().split("?")[0];  // extract last part of the URL parameters

// remove'active' class from all links
function removeActiveClass() {
    navLinks.forEach(link => link.classList.remove('active'));
    dropdownLinks.forEach(link => link.classList.remove('active'));
}

// add 'active' class to the link that corresponds to the current page
function setActiveLink() {
    removeActiveClass();  // remove existing 'active' class 
    console.log("Current Path: ", currentPath); 
    // check navbar links
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        // home: if currentPath is empty or "/" (root), activate link for "index.html"
        if ((currentPath === "" || currentPath === "/") && (linkHref === 'index.html' || linkHref === '/')) {
            link.classList.add('active');
        } else if (linkHref === currentPath) {
            link.classList.add('active');  // add 'active' class to the corresponding link
        }
    });

    // check dropdown links
    dropdownLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');  // add'active' class to the corresponding dropdown link
        }
    });
}

// load the page
window.addEventListener('load', setActiveLink);

// FOOTER
function setActiveLink() {
    var currentPage = window.location.pathname;
    var footerLinks = document.querySelectorAll('footer a');

    footerLinks.forEach(function(link) {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('footeractive-link');
      }
    });
  }

  window.onload = setActiveLink;


