
document.getElementById("prueba").addEventListener("submit", async function(event) {
    event.preventDefault();

    const login = document.getElementById("login").value;
    const Contraseña = document.getElementById("Contraseña").value;
    const id_cliente = document.getElementById("id_cliente").value || null;
    const id_rol = document.getElementById("id_rol").value || null;

    try {
        const response = await fetch("http://localhost:3000/prueba", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login, Contraseña, id_cliente, id_rol })
        });

        if (!response.ok) {
            const text = await response.text(); // evita error si no es JSON
            throw new Error(`Error ${response.status}: ${text}`);
        }

        const result = await response.json();
        alert(result.message);
    } catch (err) {
        console.error("Error al registrar:", err);
        alert("Ocurrió un error al registrar el usuario. Revisa la consola.");
    }
});
