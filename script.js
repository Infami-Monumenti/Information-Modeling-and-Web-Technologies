var items = [];
var narratives = [];
var selection = [];
var curNarrative = "";
var curVal = "";
var curSort = "";
var currentSelection = []; // Definindo currentSelection no escopo global
var timeList = [];
var placeList = [];
var genreList = [];

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
                if (i === "authority") {
                    let authority = ('<a class="button" role="button" target="_blank" href=" ' + item.itemMeta[i] + ' " style="color:black;">' + item.name + '</a>');
                    table.append("<tr><th>" + i + "</th><td>" + authority + "</td></tr>"); 
                } else {
                    if (i !== "authority" && narratives.includes(item.itemMeta[i])) {
                    val = ('<a class="button" role="button" href="#" onclick="changeNarrative(\'' + i + '\',\'' + val + '\')">' + val + '</a>');
                    }
                    table.append("<tr><th>" + i + "</th><td>" + val + "</td></tr>");
                }
            } else {
                table.append("<tr><th>" + i + "</th><td>" + item.itemMeta[i] + "</td></tr>");
            }
        }
    }
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
        })
}
// function for styling the offcanvas


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


