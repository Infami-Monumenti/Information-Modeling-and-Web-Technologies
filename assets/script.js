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
    "time": "temporalCoverage",
    "date of production": "dateCreated",
    "conservation location": "spatial",
    "author": "creator",
    "authority": "sameAs",
    "place": "locationCreated",
    "artistic expression": "genre",
}

function updateBackgroundByNarrative(narrative) {
    if (narrative === "place") {
        $("body").css("background-image", "url(images/prova_bg_place.png)");
    } else if (narrative === "artistic expression") {
        $("body").css("background-image", "url(images/prova_bg_genre.png)");
    } else if (narrative === "time") {
        $("body").css("background-image", "url(images/prova_bg_time.png)");
    } else {
        $("body").css("background-image", "none");
    }
}

$(document).ready(function() {
    console.log("jQuery è pronto!");

    $.ajax({
        url: "data/revised_structure.json",
        method: "get",
        success: function(data) {
            console.log("Dati ricevuti:", data);
            
            items = data.items;
            //console.log("items stored");

            var startItem = data.meta.startItem;
            var item = items[startItem];
            //console.log("The items:", JSON.stringify(item));

            narratives = data.meta.narratives;
            curNarrative = data.meta.startNarrative;
            curVal = data.meta.startVal;

            // Controlla se c'è un itemId nell'URL
            const urlParams = new URLSearchParams(window.location.search);
            const itemId = urlParams.get('itemId');
            const narrativeParam = urlParams.get('narrative');
            const valParam = urlParams.get('val');
            
            if (narrativeParam && valParam) {
                curNarrative = narrativeParam;
                curVal = valParam;
                updateBackgroundByNarrative(curNarrative);
            
                currentSelection = items.filter(item =>item.info.narratives[curNarrative] && item.info.narratives[curNarrative].trim() === curVal).sort((a, b) => a.iId - b.iId);
            
                if (currentSelection.length === 0) {
                    currentSelection = items; // fallback
                }
            
                let index = 0;
                if (itemId) {
                    const foundIndex = currentSelection.findIndex(item => String(item.iId) === itemId);
                    if (foundIndex !== -1) index = foundIndex;
                }
            
                showInfo(index);
            } else if (itemId) {
                const index = items.findIndex(item => String(item.iId) === itemId);
                if (index !== -1) {
                    currentSelection = items;
                    showInfo(index);
                } else {
                    prepareNarratives();
                }
            } else {
                prepareNarratives();
            }
        },
        error: function() {
            alert("Errore nel caricamento dei dati");
        }
    });
});



function prepareNarratives() {
    currentSelection = items.filter(i => i.info.narratives[curNarrative] == curVal)
    //console.log("This is the current selection in the prepareNarratives function:", JSON.stringify(currentSelection))
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

const infoTitle = $("#infoTitle");
const shortInfo = $("#text1");
const figImage = $("#img");
const figCaption = $("#item-figcaption");
const longerInfo = $("#text2");
const fullText = $("#fullText");
const infoContainer = $("#info-wrapper")
const metaTable = $("#table")

function showInfo(index) {
    try {
        var item = currentSelection[index];
        //console.log("This is the item in the showInfo function:", item)
        curSort = item["iId"];
        //console.log("This is the item id:", curSort)
    
        infoTitle.html(item.name);
        shortInfo.html(item.info["text 1"] + '<br>' + '<a type="button" class="btn btn-outline-dark btn-sm display-text-btn" onclick="showText2()">Read more</a>');
        figImage.attr('src', item.info.image);
        figImage.attr('alt', item.name);
        figCaption.html(item.name);
        longerInfo.html(item.info["text 2"] + '<br>' + '<a type="button" class="btn btn-outline-dark btn-sm display-text-btn" onclick="showText1()">Back</a> <a type="button" class="btn btn-outline-dark btn-sm display-text-btn" onclick="showText3()">Read more</a>');
        
        // for full html
        document.getElementById("fullText").dataset.path = item.info["text 3"];
    
        // ensuring text1 is the first to be displayed when the item or the narrative changes
        if (shortInfo.hasClass("d-none")) {
            showText1();
        }
        
        createInfoTable(item)
    
        prepareNavigationButtons(index);
    } catch(error) {
        return "item is not defined"
    }
}

function showText1() {
    shortInfo.removeClass("d-none");
    longerInfo.addClass("d-none");
    infoContainer.animate({scrollTop: 0}, "fast")
}

function showText2() {
    shortInfo.addClass("d-none");
    longerInfo.removeClass("d-none");
    fullText.addClass("d-none");
    infoContainer.animate({scrollTop: 0}, "fast")
    window.scrollTo(0, 0)
    $("body").removeClass("full-text-visible")
}

// for full html
function showText3() {
    var path = document.getElementById("fullText").dataset.path
    fetch(path)
    .then(response => response.text())
    .then(data => {
        document.getElementById("fullText").innerHTML = data;
        fullText.removeClass("d-none");
        shortInfo.addClass("d-none");
        longerInfo.addClass("d-none");
        $("body").addClass("full-text-visible")

        // hide table on small screen when full text is displayed
        if (window.matchMedia("(max-width: 1024px)") && tableCol.hasClass("visible")) {
            tableCol.removeClass("visible")
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);  
    });
}

// table body variable assignment
var table = $("#info");

function createInfoTable(item) {
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
    // display schema property 
    let tableHeaders = table.find("th") // retrieves table headers
    tableHeaders.each(function() {
        let header = $(this);
        let headerText = header.text().trim();
        let mappedText = schemaMapping[headerText];
        

        if (mappedText) {

            header.on("click", function() {
                if (header.text() == headerText) {
                    header.html(mappedText).css("color", "#736f4c")
                } else {
                    header.html(headerText).css("color", "black")
                }
            });
        }
    });
}
function changeNarrative(narrative, value) {
    curNarrative = narrative;
    curVal = value;
    updateBackgroundByNarrative(curNarrative);
    prepareNarratives();
}

function prepareNavigationButtons(index) {
    if (index > 0) { 
        $("#prevBtn").removeClass("disabled"); 
        $("#prevBtn").off("click").on("click", function() { 
            showInfo(index - 1);
        });
        $("#prevBtn").text(currentSelection[index - 1].name)
    } else { 
        $("#prevBtn").addClass("disabled");
        $("#prevBtn").on("click", null);
        $("#prevBtn").text("no item available");
    }
    if (index < currentSelection.length - 1) {
        $("#nextBtn").removeClass("disabled");
        $("#nextBtn").on("click", function() { 
            showInfo(index + 1) 
        });
        $("#nextBtn").text(currentSelection[index + 1].name);
    } else {
        $("#nextBtn").addClass("disabled");
        $("#nextBtn").on("click", null);
        $("#nextBtn").text("no item available");
    }
    $("#narrative").text(curNarrative+": "+curVal)
}

// offcanvas narratives
// Initialize offcanvas instance
let offCanvasElement = document.getElementById('offcanvasExample');
let offCanvas = new bootstrap.Offcanvas(offCanvasElement);
let offCanvasLink = $(".open-option")
// icons
let chooseTime = $(".fa-clock")
let choosePlace = $(".fa-earth-americas")
let chooseGenre = $(".fa-paintbrush")
// ul 
let offcanvasUl = $("#narr-val-list")
// title
let offcanvasTitle = $("#offcanvas-narrative-title")
// introductive paragraph
let offcanvasText = $("#offcanvas-text")
offCanvasLink.on("click", function() {
    //console.log("click on offcanvas event fired")
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

// time order mapping
centuries_order = {
    "XX century BC": 0,
    "XIX century BC": 1,
    "IX-VIII century BC": 2,
    "VI century BC": 3,
    "V century BC": 4,
    "II century BC": 5,
    "I century BC-I century AD": 6,
    "I century AD": 7,
    "II century AD": 8,
    "XIV-XV century": 9,
    "XIX century": 10,
    "XXI century": 11
}

// toggle time narrative
function showTimeNarrative() {
        // clearing the list before appending new items
        offcanvasUl.empty()
        timeList = items.map((item) => (item.info.narratives.time.trim()))
        timeList = [... new Set(timeList)]
        // sort the unique array chronologically
        timeList.sort((a, b) => {
            return centuries_order[a] - centuries_order[b]
        })
        for (let period of timeList) {
            offcanvasUl.append('<li>' + period + '</li>')
            offcanvasTitle.text("Time")
            offcanvasText.text("Click on a time period to discover the items associated to it.")   
        }
        offcanvasUl.on("click", "li", function() {
            var selectedVal = $(this).text()
            //console.log("Selected value from time offcanvas", selectedVal)
            var timeNarrative = "time"
            changeNarrative(timeNarrative, selectedVal)
            offCanvas.hide()
        })
}

// toggle place narrative
function showPlaceNarrative() {
        // clearing the list before appending new items
        offcanvasUl.empty()
        placeList = items.map((item) => (item.info.narratives.place.trim()))
        placeList = [... new Set(placeList)].sort()
        for (let place of placeList) {
            offcanvasUl.append('<li>' + place + '</li>')
            offcanvasTitle.text("Place")
            offcanvasText.text("Click on a place to discover the items associated to it.")  
        }
        offcanvasUl.on("click", "li", function() {
            var selectedVal = $(this).text()
            //console.log("Selected value from place offcanvas", selectedVal)
            var placeNarrative = "place"
            changeNarrative(placeNarrative, selectedVal)
            offCanvas.hide()
        })
}

// toggle genre narrative
function showGenreNarrative() {
        // clearing the list before appending new items
        offcanvasUl.empty()
        genreList = items.map((item) => (item.info.narratives["artistic expression"].trim()))
        genreList = [... new Set(genreList)].sort()
        for (let genre of genreList) {
            offcanvasUl.append('<li>' + genre + '</li>')
            offcanvasTitle.text("Artistic Expression")
            offcanvasText.text("Click on a genre to discover the items associated to it.")   
        }
        offcanvasUl.on("click", "li", function() {
            var selectedVal = $(this).text()
            //console.log("Selected value from genre offcanvas", selectedVal)
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
// MediaQueryList object that holds the specified mdq string
const mediaQuery = window.matchMedia("(max-width: 1024px)");
//console.log("the mdq string:", mediaQuery)

// function definition
function handleScreenResize(mql) {
    if (mql.matches) {
        tableCol.removeClass("visible")
        tableCol.css("pointer-events", "none");
        infoIcon.on("click", function() {
            //console.log("click event fired")
            tableCol.toggleClass("visible");
            if (tableCol.hasClass("visible")) {
                tableCol.css("pointer-events", "auto");
            } else {
                tableCol.css("pointer-events", "none");
            }
        });
    } else {
        infoIcon.off("click");
        tableCol.removeClass("visible");
        tableCol.css("pointer-events", "auto");
    }
}

// function call for smaller screens
handleScreenResize(mediaQuery);
// listen to change events on MediaQueryList object to adapt layout on screen resize
mediaQuery.addEventListener("change", handleScreenResize);

// change title position in smaller screen sizes
function updateTitlePosition() {
    const title = document.getElementById("infoTitle");
    const grid = document.getElementById("main-im");
    if (window.innerWidth <= 976 && title.parentNode !== document.body) {
        title.style.display = "block"
        title.style.marginTop = "1rem"
        document.body.insertBefore(title, grid); // Move title above the grid
    } else if (window.innerWidth > 976 && title.parentNode !== grid) {
        title.style.marginTop = "1rem"
        infoCol.prepend(title); // Move title back inside the grid
    }
}

// function calls
document.addEventListener("DOMContentLoaded", updateTitlePosition);
window.addEventListener("resize", updateTitlePosition);

// function for handling modal-background interaction
let infoModal = $("#info-modal");
let infoModalBody = $(".modal-body");
let modalClose = $(".modal-btn-closed"); // modal close button
let chooseNarrative = $("#choose-from-offcanvas"); // div of offcanvas icons
let title = $(".modal-body > h6"); // titles in modal body
let paragraphMapping = { // maps the id of the title with the html element to highlight 
    "use-table": "#info",
    "see-schema": ".schema-popup",
    "use-offcanvas": "#choose-from-offcanvas"
}

function highlightOnScroll() {
    var headers = $("th:first-child"); // retrieve table headers for modal instructions
    headers.addClass("schema-popup"); // add class for mapping between modal paragraphs and elements
    if (infoModal) {
        infoModalBody.on("scroll", function() {
            let scrollTop = infoModalBody.scrollTop();
            let titleId = "";
            let paragraphOnScreen = "";

            for (let t of title) {
                titleId = t.getAttribute("id");
                //console.log(titleId)
                let titleOffset = t.offsetTop;
                //console.log(titleOffset)

                if (scrollTop >= titleOffset) {
                    paragraphOnScreen = titleId;
                    //console.log(paragraphOnScreen);
                }
            }

            if (paragraphOnScreen) {
                let bgElement = $(paragraphMapping[paragraphOnScreen]); 
                //console.log(bgElement);
                highlightBackground(bgElement);

                // handle table display in smaller screens
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

// call highlightOnScroll function when the modal is visible
infoModal.on("shown.bs.modal", function () {
    highlightOnScroll();
});


// Remove highlight when modal is hidden
infoModal.on("hide.bs.modal", function () {
    modalClose.blur(); // remove focus
    $.each(paragraphMapping, function(key, value) {
        $(value).removeClass("highlight");  
    });
    // Hide the table when the modal is closed (on smaller screens)
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



