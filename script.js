var items = [];
var narratives = [];
var selection = [];
var curNarrative = "";
var curValue = "";
var curSort = "";

document.addEventListener("DOMContentLoaded", async function() {
    console.log("Ready to fetch")
    fetch("data/data.json")
    .then(response => response.json())
    .then(data => {
        items = data.name;
        var itemIdx = data.meta.itemIdx;
        var item = items[data.meta.itemIdx];
        console.log("Names stored")
        console.log(names)
    })
})