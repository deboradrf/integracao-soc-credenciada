const API = "http://localhost:3001";

// 🔐 usuário logado
const usuarioLogado = JSON.parse(localStorage.getItem("usuario"));

if (!usuarioLogado) {
  alert("Usuário não logado");
  window.location.href = "../pages/login.html";
}

// 🔥 FUNÇÃO GLOBAL (botão consegue chamar)
async function buscarCPF() {
  const cpfInput = document.getElementById("cpfBusca");
  const resultado = document.getElementById("resultadoCPF");

  if (!cpfInput) {
    console.error("Campo CPF não encontrado");
    return;
  }

  const cpf = cpfInput.value.replace(/\D/g, "");
  const empresaUsuario = usuarioLogado.cod_empresa;

  console.log("CPF:", cpf);
  console.log("Empresa do usuário:", empresaUsuario);

  if (cpf.length !== 11) {
    resultado.innerHTML = `
      <div class="alert alert-warning">
        CPF inválido
      </div>
    `;
    return;
  }

  resultado.innerHTML = "🔎 Consultando funcionário no SOC...";

  try {
    const res = await fetch(
      `${API}/soc/funcionario-por-cpf/${cpf}/${empresaUsuario}`
    );

    const data = await res.json();

    if (!data.existe) {
      resultado.innerHTML = `
        <div class="alert alert-info">
          Funcionário NÃO encontrado nesta empresa.
        </div>

        <button class="btn btn-success mt-2" onclick="window.location.href='formulario.html'">Cadastrar Funcionário no SOC</button>
      `;
      return;
    }

    const f = data.funcionario;

    resultado.innerHTML = `
      <div class="alert alert-success">
        Funcionário encontrado
      </div>

      <ul class="list-group">
        <li class="list-group-item"><b>Nome:</b> ${f.nome}</li>
        <li class="list-group-item"><b>Empresa:</b> ${f.empresa}</li>
        <li class="list-group-item"><b>Situação:</b> ${f.situacao}</li>
        <li class="list-group-item"><b>Matrícula:</b> ${f.matricula}</li>
      </ul>

      <button class="btn btn-primary mt-3" onclick="window.location.href='formulario-solicitar-aso.html'">Solicitar ASO</button>
    `;
  } catch (err) {
    console.error(err);
    resultado.innerHTML = `
      <div class="alert alert-danger">
        Erro ao consultar CPF no SOC
      </div>
    `;
  }
}
