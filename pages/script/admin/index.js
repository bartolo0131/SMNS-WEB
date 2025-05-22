var currentPage = null;
var defaultPage = "smnsweb";
require('dotenv').config(); // Asegúrate que esté en la primera línea


const conenn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});


$(function(){
    redirectByLoginUser(false);
    loadHeader();
    loadFooter();
    getPage(defaultPage);
});

function getPage (){
    currentPage = currentPage === null ? 'contacto' : currentPage;
    loadPage(currentPage);
    $("#btn-"+currentPage).addClass('active')
}
document.addEventListener("DOMContentLoaded", function() {
    window.location.href = window.location.href + "?nocache=" + Date.now();
});

