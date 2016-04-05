'use strict';

//Dynamically add copyright year to web site
var today = new Date();
var todayYear = today.getFullYear();
document.getElementById("year").innerHTML = todayYear;
