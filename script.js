var items = [];
var narratives = [];
var selection = [];
var curNarrative = "";
var curVal = "";
var curSort = "";
var currentSelection = []; // Definindo currentSelection no escopo global

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

            // Verifica se existe um itemId na URL e carrega o item correspondente
            const urlParams = new URLSearchParams(window.location.search);
            const itemId = urlParams.get('itemId');

            if (itemId) {
                const index = items.findIndex(item => item.iId == itemId);
                if (index !== -1) {
                    currentSelection = items; // Define currentSelection como todos os itens
                    showInfo(index);
                }
            } else {
                prepareNarratives(); // Carrega o item inicial caso não haja itemId na URL
            }
        },
        error: function(data) {
            alert("Loading error");
        }
    });
});

function prepareNarratives() {
    currentSelection = items.filter(i => i.info.narratives[curNarrative] == curVal);
    console.log(JSON.stringify(currentSelection));

    currentSelection.sort((i,j) => {
        if (i["iId"] < j["iId"]) return -1;
        if (i["iId"] > j["iId"]) return 1;
        return 0;
    });

    if (currentSelection.length == 0) {
        currentSelection = items;
    }

    var index = currentSelection.findIndex(i => i["iId"] == curSort);
    if (index == -1) index = 0;
    showInfo(index);
}

function showInfo(index) {
    var item = currentSelection[index];
    console.log(JSON.stringify(item));
    curSort = item["iId"];

    document.getElementById("infoTitle").innerHTML = item.name;
    document.getElementById("text1").innerHTML = item.info["text 1"] + 
        '<a type="button" class="btn btn-outline-dark btn-sm" onclick="showText2()">Read more</a>';
    document.getElementById("img").src = item.info.image;
    document.getElementById("img").alt = item.name;
    document.getElementById("item-figcaption").innerHTML = item.name;
    document.getElementById("text2").innerHTML = item.info["text 2"] + 
        '<a type="button" class="btn btn-outline-dark btn-sm" onclick="showText1()">Back</a> <a type="button" class="btn btn-outline-dark btn-sm" onclick="showText3()">Read more</a>';
    document.getElementById("text3").innerHTML = item.info["text 3"] + 
        '<a type="button" class="btn btn-outline-dark btn-sm" onclick="showText1()">Back</a>';
    createInfoTable(item);

    prepareNavigationButtons(index);
}

function showText1() {
    $("#text1").removeClass("d-none");
    $("#text3").addClass("d-none");
    $("#text2").addClass("d-none");
    window.scrollTo(0, 0);
}

function showText2() {
    $("#text1").addClass("d-none");
    $("#text3").addClass("d-none");
    $("#text2").removeClass("d-none");
    window.scrollTo(0, 0);
}

function showText3() {
    $("#text1").addClass("d-none");
    $("#text2").addClass("d-none");
    $("#text3").removeClass("d-none");
    window.scrollTo(0, 0);
}

function createInfoTable(item) {
    var table = $("#info");
    table.html("");

    for (let i in item.itemMeta) {
        if (item.itemMeta[i]) {
            let val = item.itemMeta[i];
            if (narratives.includes(item.itemMeta[i])) {
                val = ('<a class="button" role="button" href="#" onclick="changeNarrative(\'' + i + '\',\'' + val + '\')">' + val + '</a>');
            }
            table.append("<tr><th>" + i + "</th><td>" + val + "</td></tr>");
        } else {
            table.append("<tr><th>" + i + "</th><td>" + item.itemMeta[i] + "</td></tr>");
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
        $("#prevBtn").click(function() { showInfo(index - 1) });
        $("#prevBtn").text(currentSelection[index - 1].name);
    } else {
        $("#prevBtn").addClass("disabled");
        $("#prevBtn").click = null;
        $("#prevBtn").text("--");
    }
    if (index < currentSelection.length - 1) {
        $("#nextBtn").removeClass("disabled");
        $("#nextBtn").click(function() { showInfo(index + 1) });
        $("#nextBtn").text(currentSelection[index + 1].name);
    } else {
        $("#nextBtn").addClass("disabled");
        $("#nextBtn").click = null;
        $("#nextBtn").text("--");
    }
    $("#narrative").text(curNarrative + ": " + curVal);
}