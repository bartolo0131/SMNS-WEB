$(function() {

    $("#frm1").on("submit", function(e) {
        e.preventDefault();
        
        var request = {
            "nombre": $("#txtNombre").val(),
            "apellido": $("#txtApellido").val(),
            "correo": $("#txtCorreo").val(),
            "telefono": $("#txtTelefono").val(),
            "tipoIdentificacion": $("#slcTipoIdentificacion").val(),
            "identificacion": $("#txtIdentificacion").val(),
            "fechaNacimiento": $("#dateFechaNacimiento").val(),
            "nacionalidad": $("#slcDepartamento").val(),
            "estadoResidencia": $("#slcCiudad").val(),
            "genero": $("#slcGenero").val()  
        };

        guardarNuevaPersona(request);
    });

});

function guardarNuevaPersona(request) {

    var ifSuccessNuevaPersona = function(response) {
        $("#frm1")[0].reset();
        closeLoader();
        addAlert("Registro creado con éxito", "success", 3);
    }

    var url = "http://localhost:3000/registro"; 
    openLoader();
    callApi(url, "POST", request, ifSuccessNuevaPersona, ifErrorRequest);

}
