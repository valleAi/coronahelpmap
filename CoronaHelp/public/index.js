/*!
* Markers On Map ('https://github.com/furcan/Markers-On-Map')
* Version: 1.3.0
* Author: Furkan MT ('https://github.com/furcan')
* Copyright 2019 Markers On Map, MIT Licence ('https://opensource.org/licenses/MIT')*
*/

// DEMO: Markers On Map - Init and Run on

var db = firebase.firestore();
var helpers = [];
var searcher = [];
const formSeeker = document.querySelector('#input_fields_seeker');
const formHelper = document.querySelector('#input_fields_helper');

const apiKey = '6Lee_eIUAAAAAKER_ubQ1xR10bsikHiH3Fi-beBq';

// The coordinates the map centers on by default.
let fallbackCoordinates = [50.627540588378906, 9.958450317382812];
// The precise coordinates. Is set by the updateMapPrecisely(), if the Geolocation API query was successful and precise coordinates are known.
let preciseCoordinates;

let mymap = L.map('mapid').setView(fallbackCoordinates, 5);
// Center the approximate location of the user without using the Geolocation API, which might not be allowed by the user
updateMapApproximately();
// Try to get more precise coordinates via the Geolocation API
updateMapPrecisely();

var markers = L.markerClusterGroup({
    iconCreateFunction: function (cluster) {
        var childCount = cluster.getChildCount();
        var c = ' markerGreen-cluster-';
        if (childCount < 10) {
            c += 'small';
        } else if (childCount < 100) {
            c += 'medium';
        } else {
            c += 'large';
        }
        return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
    },
    //Disable all of the defaults:
    spiderfyOnMaxZoom: true, 
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
});


var blueIcon = L.icon({
    iconUrl: 'MarkerBlue.png',

    iconSize:     [60, 60], // size of the icon
    iconAnchor:   [30, 60], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -60] // point from which the popup should open relative to the iconAnchor
});

var greenIcon = L.icon({
    iconUrl: 'MarkerGreen.png',

    iconSize:     [60, 60], // size of the icon
    iconAnchor:   [30, 60], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -60] // point from which the popup should open relative to the iconAnchor
});

async function searchAddressCoordinates(address) {
    address = address.replace(/ /g, '+');
    const result = await fetch(`https://nominatim.openstreetmap.org/search/search?q=${address}&format=json`);
    const json = await result.json();
    if (json && json.length > 0) {
        return {
            lat: parseFloat(json[0].lat),
            lon: parseFloat(json[0].lon),
        };
    } else {
        return null;
    }
}
// Search handler
document.querySelector('#searchCity').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        // code for enter
        var cityInputField = document.getElementById('searchCity').value
        mapUpdateForQuery(cityInputField)
    }
});
document.querySelector('#searchCity-button').addEventListener('click', function (e) {
    var cityInputField = document.getElementById('searchCity').value
    mapUpdateForQuery(cityInputField)
});

// Requests the coordinates for the query and centers the map on these coordinates.
async function mapUpdateForQuery(query, zoomLevel = 13) {
    const result = await searchAddressCoordinates(query);
    if (result && result !== null) {
        preciseCoordinates = [result.lat, result.lon];
        mymap.setView(preciseCoordinates, zoomLevel);
    }
}

// Tries to get an approximate geolocation via external APIs without using the Geolocation API of the browser.
// Updates the map accordingly.
async function updateMapApproximately(zoomLevel = 12) {
    try {
        const ipResponse = await fetch('https://api.ipify.org/?format=json');
        const ip = (await ipResponse.json()).ip;
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
        const geoJson = await geoResponse.json();
        // Update the fallback coordinates for the app
        fallbackCoordinates = [geoJson.lat, geoJson.lon];
        console.log()
    } catch (err) {
        console.log(err);
    }
    if (preciseCoordinates == null) { // Only update if we dont have more precise coordinates already
        mymap.setView(fallbackCoordinates, zoomLevel);
    } 
}

// Tries to get a precise geolocation via the Geolocation API of the browser.
// Updates the map accordingly.
async function updateMapPrecisely(zoomLevel = 12) {
    if (navigator.geolocation) {
        await navigator.geolocation.getCurrentPosition(position => {
            preciseCoordinates = [position.coords.latitude, position.coords.longitude];
            mymap.setView(preciseCoordinates, zoomLevel);
        },
        error => {
            console.log(error);
        });
    }
}

//var mymap = L.map('mapid').setView([52.520008, 13.404954], 11);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    detectRetina: true,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZ2FuZ2hhbmciLCJhIjoiY2pxdmp2bXhqMHc1ZzQzb2NpOWY5NmRuMCJ9.LTrUYDuCAPXnJ-0vzQ9gsQ'
}).addTo(mymap);


db.collection("helpers").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {

        var url = "send.html?id="
        var customId = doc.id
        var urlFinal = url+customId
        console.log(urlFinal)

        var typeOfPerson = doc.data().typeOfPerson

        var typeOfPersonConverted;
        if(typeOfPerson=="private"){
            typeOfPersonConverted="Privatperson";
        }
        else{
            typeOfPersonConverted="Organisation";
        }

        var dateCreated = doc.data().timestamp
        // console.log(`${doc.id} => ${doc.data()}`);
        //console.log(doc.data().firstName);
        //var marker = L.marker([doc.data().addressLat, doc.data().addressLong]).addTo(mymap);
        markers.addLayer(L.marker([doc.data().addressLat, doc.data().addressLong], {icon: greenIcon}).bindPopup(typeOfPersonConverted + '<br>' + '<span style="font-size:12pt;font-weight:bold">' + doc.data().typeOfProfession + '</span>' + '<br><br><i>"' + doc.data().typeOfHelp + '"</i><br><br><a href=' + urlFinal + ' target="_parent"><button type="submit" class="btn btn-primary btn-lg" style="height:35px;width:100px;font-size:12px;background-color:#75cb3d;border:none">Nachricht</button></a>').openPopup());


        /*var circle = L.circle([doc.data().addressLat, doc.data().addressLong], {

            color: 'green',
            fillColor: '#f03',
            fillOpacity: 0.12,
            radius: 500
        }).addTo(mymap);

*/

        // circle.bindPopup(doc.data().firstName);





        //var helper = new add(helperMarker(),25,doc.data().addressLat,doc.data().addressLong,doc.data().firstName,'<h3 style="text-align:center;margin:0 0 10px;">' + doc.data().firstName + ", " + doc.data().age.toString() + '</h3><p style="text-align:center; margin:0 0 10px;">' + doc.data().typeOfHelp + '</p><button style="display:table;margin:auto;padding:8px 12px;border-radius:20px;font-weight:700;background:#DE2A00;color:#fff;cursor:pointer;">' + doc.data().contactInfo + '</button>');
        //helpers.push(helper)


    });
    //console.log(helpers)

    db.collection("searcher").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {

        var url = "send.html?id="
        var customId = doc.id
        var urlFinal = url+customId
        console.log(urlFinal)

        var typeOfPerson = doc.data().typeOfPerson

        var typeOfPersonConverted;
        if(typeOfPerson=="private"){
        typeOfPersonConverted="Privatperson";
        }
        else{
        typeOfPersonConverted="Organisation";
        }

        var dateCreated = doc.data().timestamp
            // console.log(`${doc.id} => ${doc.data()}`);
            //console.log(doc.data().firstName);
           // var search = new add(searcherMarker(), 25, doc.data().addressLat, doc.data().addressLong, doc.data().firstName, '<h3 style="text-align:center;margin:0 0 10px;">' + doc.data().firstName + ", " + doc.data().age.toString() + '</h3><p style="text-align:center; margin:0 0 10px;">' + doc.data().typeOfHelp + '</p><button style="display:table;margin:auto;padding:8px 12px;border-radius:20px;font-weight:700;background:#DE2A00;color:#fff;cursor:pointer;">' + doc.data().contactInfo + '</button>');
            //searcher.push(search)
       // markers.addLayer(L.marker([doc.data().addressLat, doc.data().addressLong], {icon: redIcon}));
        markers.addLayer(
            L.marker(
                [doc.data().addressLat, doc.data().addressLong], 
                {icon: blueIcon})
            .bindPopup(
                typeOfPersonConverted + '<br>' + '<span style="font-size:12pt;font-weight:bold">' 
                + doc.data().typeOfProfession + '</span>' + '<br><br><i>"' + doc.data().typeOfHelp 
                + '"<br><br><a href=' + urlFinal 
                + ' target="_parent"><button type="submit" class="btn btn-primary btn-lg" style="height:35px;width:100px;font-size:12px;background-color:#0095e1;border:none">Nachricht</button></a>')
            .openPopup());
        });
        //console.log(helpers)
        mymap.addLayer(markers);


        MarkersOnMap.Init({
            googleApiKey: 'AIzaSyBDWpSKKqmaBHmKwBobTEjxToXSRk2GkPc', // this key restricted except this project
            googlePlacesApiEnabled: true,
            mapTypeId: 'terrain',
            mapHeight: '500px',
            markerOverlay: false,
            mapZoomControl: true,
            mapScrollWheel: false,
            markerObjects: helpers.concat(searcher),
        });
        //MarkersOnMap.Run('div#GoogleMaps');

        furcanTooltip('[data-toggle="tooltip"]');

    });

});

formHelper.addEventListener('submit', (e) => {
    e.preventDefault();
    db.collection('helpersPreZip').add({
        address: formHelper.address.value,
        contactInfo: formHelper.contactInfo.value,
        typeOfProfession: formHelper.work.value,
        typeOfHelp: formHelper.typeOfHelp.value,
        typeOfPerson: formHelper.typeOfPerson.value,
        categories: {
            household: formHelper.household.checked,
            laundry: formHelper.laundry.checked,
            medication: formHelper.medication.checked,
            shopping: formHelper.shopping.checked,
            pets: formHelper.pets.checked,
            escort: formHelper.escort.checked,
            conversations: formHelper.conversations.checked,
            handicap: formHelper.handicap.checked,
            agriculture: formHelper.agriculture.checked,
            car: formHelper.car.checked,
            other: formHelper.other.checked,
        },
        
        timestamp: Date.now()
    })
.then(docRef => {
    console.log("Document written with ID: ", docRef.id);
    console.log("You can now also access .this as expected: ", this.foo);
    console.log("Form Data: ", docRef);
    formHelper.querySelector('#success-message').style.display = 'block';
    let data = {
          id: docRef.id
          };

          
    db.collection("helpersPreZip").doc(docRef.id)
.set(data, {merge: true});
    formHelper.reset();

})
.catch(error => {
    formHelper.querySelector('#error-message').style.display = 'block';
    console.error("Error adding document: ", error)
})
    
    //window.location.assign("https://coronahelpmap.com/");


})

formSeeker.addEventListener('submit', (e) => {
    e.preventDefault();
    db.collection('searcherPreZip').add({
        address: formSeeker.address.value,
        contactInfo: formSeeker.contactInfo.value,
        typeOfProfession: formSeeker.work.value,
        typeOfHelp: formSeeker.typeOfHelp.value,
        typeOfPerson: formSeeker.typeOfPerson.value,
        categories: {
            household: formSeeker.household.checked,
            laundry: formSeeker.laundry.checked,
            medication: formSeeker.medication.checked,
            shopping: formSeeker.shopping.checked,
            pets: formSeeker.pets.checked,
            escort: formSeeker.escort.checked,
            conversations: formSeeker.conversations.checked,
            handicap: formSeeker.handicap.checked,
            agriculture: formSeeker.agriculture.checked,
            car: formSeeker.car.checked,
            other: formSeeker.other.checked,
        },
        
        timestamp: Date.now()
    })
.then(docRef => {
    console.log("Document written with ID: ", docRef.id);
    console.log("You can now also access .this as expected: ", this.foo);
    console.log("Form Data: ", docRef);
    formSeeker.querySelector('#success-message').style.display = 'block';
    let data = {
          id: docRef.id
          };

          
    db.collection("searcherPreZip").doc(docRef.id)
.set(data, {merge: true});
    formSeeker.reset();

})
.catch(error => {
    formSeeker.querySelector('#error-message').style.display = 'block';
    console.error("Error adding document: ", error)
})
    
    //window.location.assign("https://coronahelpmap.com/");


})

function renderCategories(categories) {
    var icons = '';
    if (categories.household) {
        icons += '<i class="material-icons">house</i>';
    }
    if (categories.laundry) {
        icons += '<i class="material-icons">local_laundry_service</i>';
    }
    if (categories.medication) {
        icons += '<i class="material-icons">local_pharmacy</i>';
    }
    if (categories.shopping) {
        icons += '<i class="material-icons">shopping_cart</i>';
    }
    if (categories.pets) {
        icons += '<i class="material-icons">pets</i>';
    }
    if (categories.escort) {
        icons += '<i class="material-icons">supervisor_account</i>';
    }
    if (categories.conversations) {
        icons += '<i class="material-icons">phone</i>';
    }
    if (categories.handicap) {
        icons += '<i class="material-icons">accessible</i>';
    }
    if (categories.agriculture) {
        icons += '<i class="material-icons">eco</i>';
    }
    if (categories.car) {
        icons += '<i class="material-icons">directions_car</i>';
    }
    if (categories.other) {
        icons += '<i class="material-icons">help</i>';
    }
    return icons;   
}
function renderPayment(paid) {
    var icon = ''
    if (paid == 'paid') {
        icon = '<i class="material-icons">attach_money</i>'
    }
    if (paid == 'unpaid') {
        icon = '<i class="material-icons">money_off</i>'
    }
    return icon;
}


// DEMO: Markers On Map - Init and Run off
function add(markerUrl, markerSize, markerLat, markerLong, markerTitle, markerContent) {
    this.markerUrl = markerUrl;
    this.markerSize = markerSize;
    this.markerLat = markerLat;
    this.markerLong = markerLong;
    this.markerTitle = markerTitle;
    this.markerContent = markerContent;
}

// DEMO: Tooltip on
function furcanTooltip(tooltip) {
    $('body > .tooltip').remove();
    $(tooltip).tooltip({
        trigger: 'hover',
        container: 'body',
    });
}

$(document).on('click', function () {
    if ($('body > .tooltip').length > 0) {
        $('body > .tooltip').remove();
    }
});
// DEMO: Tooltip off

// DEMO: Map Markers Title Tooltip on
$(window).on('load', function () {
    var tooltipTimeout = setTimeout(function () {
        $(document).on('mouseenter', 'div#GoogleMaps', function () {
            furcanTooltip($('div#GoogleMaps *[title]'));
            clearTimeout(tooltipTimeout);
        });
    }, 1000);
});
// DEMO: Map Markers Title Tooltip off