let usuario = null;

const API = "http://localhost:3001";

// USUÁRIO LOGADO
const usuarioLogado = JSON.parse(localStorage.getItem("usuario"));

if (!usuarioLogado) {
  alert("Usuário não logado");
  window.location.href = "../pages/login.html";
}

// DROPDOWN DO PERFIL
document.addEventListener("DOMContentLoaded", () => {
  usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario) {
    window.location.href = "login.html";
    return;
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
  userNameDropdown.innerText = getPrimeiroNomeESobrenome(usuario.nome);

  // EMPRESA E UNIDADE
  dropdownUserExtra.innerHTML = `
    <div class="company-name">${usuario.nome_empresa}</div>
    <div class="unit-name">${usuario.nome_unidade}</div>
  `;

  // LÓGICA DOS PERFIS DE ACESSO
  if (usuario.perfil === "CREDENCIADA") {
    avatarIcon.classList.add("fa-hospital");
    avatarIconDropdown.classList.add("fa-hospital");

    avatarBtn.classList.add("credenciada");
    avatarDrop.classList.add("credenciada");
  }

  if (usuario.perfil === "EMPRESA") {
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

// FUNÇÃO PARA BUSCAR CPF NO SOC DENTRO DA MESMA EMPRESA DO USUÁRIO LOGADO
async function buscarCPF() {
  const cpfInput = document.getElementById("cpfBusca");
  const resultado = document.getElementById("resultadoCPF");

  const cpf = cpfInput.value.replace(/\D/g, "");
  const empresaUsuario = usuarioLogado.cod_empresa;

  if (cpf.length !== 11) {
    resultado.innerHTML = `<div class="alert alert-warning">CPF inválido</div>`;
    return;
  }

  resultado.innerHTML = "🔎 Consultando funcionário no SOC...";

  try {
    const res = await fetch(
      `${API}/soc/funcionario-por-cpf/${cpf}/${empresaUsuario}`
    );

    const data = await res.json();

    // ❌ CPF NÃO EXISTE
    if (!data.existe) {
      resultado.innerHTML = `
        <div class="alert alert-info">
          Funcionário NÃO encontrado nesta empresa.
        </div>

        <button class="btn btn-success mt-2"
          onclick="window.location.href='formulario.html'">
          Cadastrar Funcionário
        </button>
      `;
      return;
    }

    const f = data.funcionario;

    // ⚠️ CPF EXISTE MAS ESTÁ INATIVO
    if (f.situacao?.toLowerCase() === "inativo") {
      resultado.innerHTML = `
        <div class="card shadow">
          <div class="card-body">

            <div class="alert alert-warning">
              Funcionário encontrado, porém está <b>INATIVO</b> no SOC.
            </div>

            <ul class="list-group">
              <li class="list-group-item"><b>Nome:</b> ${f.nome}</li>
              <li class="list-group-item"><b>CPF:</b> ${f.cpf}</li>
              <li class="list-group-item"><b>Matrícula:</b> ${f.matricula}</li>
              <li class="list-group-item"><b>Situação:</b> ${f.situacao}</li>
            </ul>

            <div class="alert alert-secondary mt-3">
              Não é possível solicitar ASO para funcionários inativos. Solicite um novo cadastro
            </div>

            <button class="btn btn-success mt-2"
              onclick="window.location.href='formulario.html'">
              Cadastrar Funcionário
            </button>

          </div>
        </div>
      `;
      return;
    }

    // ✅ CPF EXISTE E ESTÁ ATIVO
    const funcionarioASO = {
      nome: f.nome,
      cpf: f.cpf,
      matricula: f.matricula,
      data_nascimento: f.data_nascimento,
      data_admissao: f.data_admissao,
      cod_unidade: f.unidade?.codigo,
      cod_setor: f.setor?.codigo,
      cod_cargo: f.cargo?.codigo
    };

    localStorage.setItem("funcionarioASO", JSON.stringify(funcionarioASO));

    resultado.innerHTML = `
      <div class="card shadow">
        <div class="card-body">

          <div class="alert alert-success">
            Funcionário ATIVO encontrado
          </div>

          <ul class="list-group mb-3">
            <li class="list-group-item"><b>Empresa:</b> ${f.nome_empresa}</li>
            <li class="list-group-item"><b>Código:</b> ${f.cod_funcionario}</li>
            <li class="list-group-item"><b>Nome:</b> ${f.nome}</li>
            <li class="list-group-item"><b>Matrícula eSocial:</b> ${f.matricula}</li>
          </ul>

          <button class="btn btn-primary w-100"
            onclick="window.location.href='formulario-solicitar-aso.html'">
            Solicitar ASO para este funcionário
          </button>

        </div>
      </div>
    `;

  } catch (err) {
    console.error(err);
    resultado.innerHTML = `<div class="alert alert-danger">Erro ao consultar CPF</div>`;
  }
}

// MÁSCARA DE CPF
const cpfInput = document.getElementById("cpfBusca");

cpfInput.addEventListener("input", function () {
  let value = this.value.replace(/\D/g, "");

  if (value.length > 11) value = value.slice(0, 11);

  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

  this.value = value;
});

// FUNÇÃO DE LOGOUT
function logout() {
  localStorage.removeItem("usuario");
  localStorage.removeItem("empresaCodigo");
  window.location.href = "login.html";
}