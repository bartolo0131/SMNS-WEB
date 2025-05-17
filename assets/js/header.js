

$(function(){

 

    $("#main-nav .nav-link").click(function(){
        var pag = $(this).data('tag');
        if(pag && pag !== null && pag !== undefined) {
            currentPage = pag;
        }
        else {  
            currentPage = defaultPage;
        }
        $("#main-nav .nav-link.page, #main-nav .dropdown-item.page").removeClass('active');
        getPage(currentPage);
    });
});

    $("#login-form").submit(function(event) {
        event.preventDefault();

        var isValidForm = true;
        var email = $("#email").val();
        var password = $("#password").val();

        if(email === "") {
            $("#email").addClass('is-invalid');
            isValidForm = false;
        }