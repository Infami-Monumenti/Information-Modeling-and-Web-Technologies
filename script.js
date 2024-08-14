var items = [];
var narratives = [];
var selection = [];
var curNarrative = "";
var curVal = "";
var curSort = "";

document.addEventListener("DOMContentLoaded", async function() {
    console.log("Ready to fetch")
    $.ajax({
        url: "data/revised_structure.json",
        method: "get",
        success: function(data) {
            //console.log("Data loaded");
            items = data.items;
            console.log("items stored")
            //console.log(JSON.stringify(items[0]))
            var startItem = data.meta.startItem;
            var item = items[startItem];
            console.log(JSON.stringify(item))
            narratives = data.meta.narratives;
            //console.log(JSON.stringify(narratives))
            curNarrative = data.meta.startNarrative;
            //console.log(JSON.stringify(curNarrative))
            curVal = data.meta.startVal;
            //console.log(JSON.stringify(curVal))
            prepareNarratives()
        },
        error: function(data) {
            alert("Loading error");
        }
    })
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
    var item = currentSelection[index]
    console.log(JSON.stringify(item))
    curSort = item["iId"] // there might be a problem here
    document.getElementById("infoTitle").innerHTML = item.name;
    document.getElementById("text1").innerHTML = item.info["text 1"] + '<a type="button" class="btn btn-outline-dark btn-sm" onclick="showText2()">Read more</a>';
    document.getElementById("img").src = item.info.image;
    document.getElementById("img").alt = item.name;
    document.getElementById("item-figcaption").innerHTML = item.name;
    document.getElementById("text2").innerHTML = item.info["text 2"] + '<a type="button" class="btn btn-outline-dark btn-sm" onclick="showText1()">Back</a> <a type="button" class="btn btn-outline-dark btn-sm" onclick="showText3()">Read more</a>';
    document.getElementById("text3").innerHTML = item.info["text 3"] + '<a type="button" class="btn btn-outline-dark btn-sm" onclick="showText2()">Back</a>';

    // ensuring text1 is the first to be displayed when the item or the narrative changes
    if ($("#text1").hasClass("d-none")) {
        showText1();
    }
    createInfoTable(item)

    prepareNavigationButtons(index)

    }

function showText1() {
    $("#text1").removeClass("d-none");
    $("#text3").addClass("d-none");
    $("#text2").addClass("d-none");
    $("#infoCol").animate({scrollTop: 0}, "fast")
}

function showText2() {
    $("#text1").addClass("d-none");
    $("#text3").addClass("d-none");
    $("#text2").removeClass("d-none");
    $("#infoCol").animate({scrollTop: 0}, "fast")
}

function showText3() {
    $("#text1").addClass("d-none");
    $("#text2").addClass("d-none");
    $("#text3").removeClass("d-none");
    $("#infoCol").animate({scrollTop: 0}, "fast")
}

function createInfoTable(item) {
    var table = $("#info");
    table.html("");

    for (let i in item.itemMeta) {
        //alert(JSON.stringify(i)) // i gets the property
        // in the following line item.info[i] gets the value
        if (item.itemMeta[i]) {
            let val = item.itemMeta[i];
            if (narratives.includes(item.itemMeta[i])) {
                val = ('<a class="button" role="button" href="#" onclick="changeNarrative(\''+i+'\',\''+val+'\')">'+val+'</a>')
            }
            table.append("<tr><th>"+i+"</th><td>"+val+"</td></tr>")
        } else {
            table.append("<tr><th>"+i+"</th><td>"+item.itemMeta[i]+"</td></tr>")
        }
    }
}
function changeNarrative(narrative, value) {
    curNarrative = narrative;
    curVal = value;
    if (curNarrative == "place") {
        $("body").css("background-image", "url(images/prova_bg_place.png)");
        //$(".narr-ctrl-nav").css("background-image", "url(images/bg_places_ctrl.png)");
    } if (curNarrative == "artistic expression") {
        $("body").css("background-image", "url(images/prova_bg_genre.png)");
    } if (curNarrative == "time") {
        $("body").css("background-image", "url(images/prova_bg_time.png)");
    }
    prepareNarratives()
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
        $("#nextBtn").click(function() {showInfo(index + 1)});
        $("#nextBtn").text(currentSelection[index + 1].name)
    } else {
        $("#nextBtn").addClass("disabled");
        $("#nextBtn").click = null;
        $("#nextBtn").text("no item available");
    }
    $("#narrative").text(curNarrative+": "+curVal)
}