(function () {
    const URL_AUDITORIA = "PEGA_AQUI_LA_URL_DEL_FLOW";
    let usuarioActual = null;
    function getQlikToken() {
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (
                key &&
                key.includes("qlik") &&
                key.includes("access-token")
            ) {
                return sessionStorage.getItem(key);
            }
        }
        return null;
    }
    async function obtenerUsuarioActual(token) {
        const resp = await fetch(
            "https://avoristravel.eu.qlikcloud.com/api/v1/users/me",
            {
                headers: {
                    "Authorization": "Bearer " + token,
                    "Accept": "application/json"
                }
            }
        );
        if (!resp.ok) {
            throw new Error("No se pudo obtener el usuario");
        }
        return await resp.json();
    }
    function registrarAcceso(pestana) {
        if (!usuarioActual) {
            return;
        }
        fetch(URL_AUDITORIA, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email:
                    usuarioActual.email ||
                    usuarioActual.subject ||
                    "",
                fechaHora:
                    new Date().toISOString(),
                pestana:
                    pestana
            })
        }).catch(function (err) {
            console.error("Error auditoría:", err);
        });
    }
    async function iniciarAuditoria() {
        try {
            let token = null;
            while (!token) {
                token = getQlikToken();
                if (!token) {
                    await new Promise(r => setTimeout(r, 500));
                }
            }
            usuarioActual =
                await obtenerUsuarioActual(token);
            console.log(
                "Usuario auditoría:",
                usuarioActual.email ||
                usuarioActual.subject
            );
            registrarAcceso("Inicio");
            const originalGoto = window.goto;
            if (typeof originalGoto === "function") {
                window.goto = function (tab) {
                    originalGoto(tab);
                    registrarAcceso(tab);
                };
            }
        }
        catch (err) {
            console.error(
                "Error iniciando auditoría",
                err
            );
        }
    }
    window.addEventListener(
        "load",
        iniciarAuditoria
    );
})();
