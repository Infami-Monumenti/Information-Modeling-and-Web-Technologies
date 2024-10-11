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
// additional variables for ontology aligned json
var schema_items = [];
//var schema_item = {};
var schema_narratives = [];
var schema_curNarrative = "";
var schema_curVal = "";
var schema_curSort = "";
var schema_currentSelection = [];
// mapping with schema properties
var schemaMapping = {
    "time": "dateCreated",
    "conservation location": "containedInPlace",
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
    //alert("preparing narratives")
    currentSelection = items.filter(i => i.info.narratives[curNarrative] == curVal)
    console.log(JSON.stringify(currentSelection))
currentSelection.sort((i,j) => {
    if (i["iId"] < j["iId"]) return -1;
    if (i["iId"] > j["iId"]) return 1;
    return 0;
});
if (currentSelection.length==0)
    currentSelection = items
var index = currentSelection.findIndex(i => i["iId"] == curSort) // possible error here. The findIndex function evalutes to -1, so the first item in the array is always displayed
if (index == -1) index = 0
showInfo(index)
};

function showInfo(index) {
    var item = currentSelection[index];
    console.log(JSON.stringify(item));
    curSort = item["iId"];

    document.getElementById("infoTitle").innerHTML = item.name;
    document.getElementById("text1").innerHTML = item.info["text 1"] + '<br>' + '<a type="button" class="btn btn-outline-dark btn-sm" onclick="showText2()">Read more</a>';
    document.getElementById("img").src = item.info.image;
    document.getElementById("img").alt = item.name;
    document.getElementById("item-figcaption").innerHTML = item.name;
    document.getElementById("text2").innerHTML = item.info["text 2"] + '<br>' + '<a type="button" class="btn btn-outline-dark btn-sm" onclick="showText1()">Back</a> <a type="button" class="btn btn-outline-dark btn-sm" onclick="showText3()">Read more</a>';
    document.getElementById("text3").innerHTML = item.info["text 3"] + '<br>' + '<a type="button" class="btn btn-outline-dark btn-sm" onclick="showText2()">Back</a>';

    // ensuring text1 is the first to be displayed when the item or the narrative changes
    if ($("#text1").hasClass("d-none")) {
        showText1();
    }
    createInfoTable(item)

    prepareNavigationButtons(index);
}

function showText1() {
    $("#text1").removeClass("d-none");
    $("#text3").addClass("d-none");
    $("#text2").addClass("d-none");
    $("#info-wrapper").animate({scrollTop: 0}, "fast")
}

function showText2() {
    $("#text1").addClass("d-none");
    $("#text3").addClass("d-none");
    $("#text2").removeClass("d-none");
    $("#info-wrapper").animate({scrollTop: 0}, "fast")
}

function showText3() {
    $("#text1").addClass("d-none");
    $("#text2").addClass("d-none");
    $("#text3").removeClass("d-none");
    $("#info-wrapper").animate({scrollTop: 0}, "fast")
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
                    table.append("<tr><th>" + i + "</th><td>" + authorityLink + "</td></tr>"); 
                } else {
                    if ((i !== "authority" || i !== "sameAs") && narratives.includes(item.itemMeta[i])) {
                    val = ('<a class="button" role="button" href="#" onclick="changeNarrative(\'' + i + '\',\'' + val + '\')">' + val + '</a>');
                    }
                    table.append("<tr><th>" + i + "</th><td>" + val + "</td></tr>");
                }
            } else {
                table.append("<tr><th>" + i + "</th><td>" + item.itemMeta[i] + "</td></tr>");
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
            let span = $(document.createElement("span")).text(mappedText);
            span.addClass("popuptext");
            header.addClass("popup");
            header.append(span);


            header.on("click", function() {
                span.toggleClass("show");
            });
            // close popup when another th is clicked
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
            $("#offcanvas-text").text("Click on a time period to browse the items associated to it.")   
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
            $("#offcanvas-text").text("Click on a place to browse the items associated to it.")  
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
            $("#offcanvas-narrative-title").text("Genre")
            $("#offcanvas-text").text("Click on a genre to browse the items associated to it.")   
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
const figImage = $("#img");
const infoIcon = $(".see-info-icon");
const imgCol = $("#imgCol");
const tableCol = $("#tableCol");
const mediaQuery = window.matchMedia("(max-width: 900px)");

function handleScreenResize(e) {
    if (e.matches) {
        tableCol.removeClass("visible")
        infoIcon.on("click", function() {
            tableCol.toggleClass("visible");
            if (tableCol.hasClass("visible")) {
                figImage.css("box-shadow", "none");
            } else {
                figImage.css("box-shadow", "0.1rem 0.1rem 0.1rem rgba(151 112 96 / 0.5)");
            }
        });
    } else {
        infoIcon.off("click");
        tableCol.removeClass("visible");
    }
}

handleScreenResize(mediaQuery);

mediaQuery.addEventListener("change", handleScreenResize);


// function for handling modal-background interaction
let infoModal = $("#info-modal");
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
            }
        })
    }
}

function highlightBackground(element) {
    $.each(paragraphMapping, function(key, value) {
        $(value).removeClass("highlight");
    });
    element.addClass("highlight");

    if (!infoModal) {
        element.removeClass("highlight");
    }
    
}

infoModal.on("shown.bs.modal", function () {
    highlightOnScroll();
});

/*$(".switch-data").on("click", function() {
    createInfoTable(item)
});*/




// navbar
// Seleziona tutti i link nella navbar e nel dropdown
const navLinks = document.querySelectorAll('.nav-link');
const dropdownLinks = document.querySelectorAll('.dropdown-item');

// Ottieni il percorso dell'URL corrente
const currentPath = window.location.pathname.split("/").pop().split("?")[0];  // Estrae l'ultima parte dell'URL senza parametri

// Funzione per rimuovere la classe 'active' da tutti i link
function removeActiveClass() {
    navLinks.forEach(link => link.classList.remove('active'));
    dropdownLinks.forEach(link => link.classList.remove('active'));
}

// Aggiunge la classe 'active' al link che corrisponde alla pagina corrente
function setActiveLink() {
    removeActiveClass();  // Rimuove qualsiasi classe 'active' esistente
    console.log("Current Path: ", currentPath); 
    // Controlla i link della navbar
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        // Caso per la home: se currentPath è vuoto o "/" (root), attiva il link per "index.html"
        if ((currentPath === "" || currentPath === "/") && (linkHref === 'index.html' || linkHref === '/')) {
            link.classList.add('active');
        } else if (linkHref === currentPath) {
            link.classList.add('active');  // Aggiunge la classe 'active' al link corrispondente
        }
    });

    // Controlla i link del dropdown
    dropdownLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');  // Aggiunge la classe 'active' al link del dropdown corrispondente
        }
    });
}

// Esegui la funzione al caricamento della pagina
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


