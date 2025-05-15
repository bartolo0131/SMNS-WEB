var currentPage = null;
var defaultPage = "smnsweb";

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

