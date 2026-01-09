// DROPDOWN DO PERFIL
document.addEventListener("DOMContentLoaded", () => {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuario"));

    if (!usuarioLogado) {
        window.location.href = "login.html";
    }

    const userNameDropdown = document.getElementById("userNameDropdown");
    const dropdownUserExtra = document.getElementById("dropdownUserExtra");

    const avatarIcon = document.getElementById("avatarIcon");
    const avatarIconDropdown = document.getElementById("avatarIconDropdown");

    const avatarBtn = document.querySelector(".profile-trigger .avatar-circle");
    const avatarDrop = document.querySelector(".profile-header .avatar-circle");

    function getPrimeiroNomeESobrenome(nomeCompleto) {
        if (!nomeCompleto) return "";
        const partes = nomeCompleto.trim().split(" ");
        return partes.length >= 2
            ? `${partes[0]} ${partes[1]}`
            : partes[0];
    }

    // NOME
    userNameDropdown.innerText = getPrimeiroNomeESobrenome(usuarioLogado.nome);

    // EMPRESA E UNIDADE
    dropdownUserExtra.innerHTML = `
    <div class="company-name">${usuarioLogado.nome_empresa}</div>
    <div class="unit-name">${usuarioLogado.nome_unidade}</div>
  `;

    // LÓGICA DOS PERFIS DE ACESSO
    if (usuarioLogado.perfil === "CREDENCIADA") {
        avatarIcon.classList.add("fa-hospital");
        avatarIconDropdown.classList.add("fa-hospital");

        avatarBtn.classList.add("credenciada");
        avatarDrop.classList.add("credenciada");
    }

    if (usuarioLogado.perfil === "EMPRESA") {
        avatarIcon.classList.add("fa-building");
        avatarIconDropdown.classList.add("fa-building");

        avatarBtn.classList.add("empresa");
        avatarDrop.classList.add("empresa");
    }

    // BLUR
    const profileBtn = document.querySelector(".profile-trigger");

    profileBtn.addEventListener("show.bs.dropdown", () => {
        document.body.classList.add("blur-main");
    });

    profileBtn.addEventListener("hide.bs.dropdown", () => {
        document.body.classList.remove("blur-main");
    });
});

carregarPerfil();

async function carregarPerfil() {
    const API = "http://localhost:3001";

    const usuarioLogado = JSON.parse(localStorage.getItem("usuario"));

    if (!usuarioLogado) {
        window.location.href = "login.html";
    }

    const res = await fetch(`${API}/usuarios/${usuarioLogado.id}`);
    const user = await res.json();

    if (!res.ok) {
        alert(user.erro);
        return;
    }

    preencherTela(user);
}

function preencherTela(user) {
    document.getElementById("perfilNome").innerText = user.nome;

    if (user.perfil === "EMPRESA") {
        document.getElementById("perfilTipo").innerText = user.nome_empresa;
    }
    if (user.perfil === "CREDENCIADA") {
        document.getElementById("perfilTipo").innerText = "Usuário";
    }

    document.getElementById("cpf").innerText = user.cpf;
    document.getElementById("email").innerText = user.email;
    document.getElementById("senha").innerText = user.senha;

    ajustarIcone(user.perfil);
}

function ajustarIcone(perfil) {
    const iconCard = document.getElementById("avatarIconCard");

    if (!iconCard) return;

    iconCard.className = "fa-solid";

    if (perfil === "EMPRESA") {
        iconCard.classList.add("fa-building");
    }
    if (perfil === "CREDENCIADA") {
        iconCard.classList.add("fa-hospital");
    }
}