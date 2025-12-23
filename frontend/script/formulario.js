const params = new URLSearchParams(window.location.search);
const empresaCodigo = params.get("empresa");

if (!empresaCodigo) {
  alert("Empresa não informada na URL");
}

async function carregarUnidades() {
  if (!empresaCodigo) return;

  const res = await fetch(`http://localhost:3001/unidades/${empresaCodigo}`);
  const unidades = await res.json();

  const select = document.getElementById("unidadeSelect");
  select.innerHTML = '<option value="">Selecione...</option>';

  unidades.forEach(u => {
    const opt = document.createElement("option");
    opt.value = u.codigo;
    opt.textContent = u.ativo ? u.nome : `${u.nome} (inativa)`;
    opt.dataset.nome = u.nome; // ✅
    select.appendChild(opt);
  });

  // mostrar so as unidades ativo: 1
  //unidades .filter(u => u.ativo) .forEach(u => { const opt = document.createElement("option"); opt.value = u.codigo; opt.textContent = u.nome; select.appendChild(opt); });
}

carregarUnidades();

// Evento ao selecionar unidade
document.getElementById("unidadeSelect").addEventListener("change", function () {
  const unidadeCodigo = this.value;

  if (!unidadeCodigo) {
    document.getElementById("setorSelect").innerHTML =
      '<option value="">Selecione...</option>';
    return;
  }

  carregarSetores(unidadeCodigo);
});

// FUNÇÃO PARA BUSCAR SETORES DA UNIDADE SELECIONADA
async function carregarSetores(unidadeCodigo) {
  const res = await fetch(
    `http://localhost:3001/setores/${empresaCodigo}/${unidadeCodigo}`
  );

  const setores = await res.json();

  const select = document.getElementById("setorSelect");
  select.innerHTML = '<option value="">Selecione...</option>';

  setores.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.codigo;

    // mesma lógica das unidades
   opt.textContent =
    s.ativo && s.relacionamentoAtivo
      ? s.nome
      : `${s.nome} (inativo ou sem vínculo)`

    opt.dataset.nome = s.nome;
    select.appendChild(opt);
  });
}

async function carregarCargos() {
  const res = await fetch(`http://localhost:3001/cargos/${empresaCodigo}`);
  const cargos = await res.json();

  const select = document.getElementById("cargoSelect");
  select.innerHTML = '<option value="">Selecione...</option>';

  cargos.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.codigo;
    opt.textContent = c.ativo ? c.nome : `${c.nome} (inativo)`;
    opt.dataset.nome = c.nome; // ✅

    select.appendChild(opt);
  });
}

// chama ao carregar a página
carregarCargos();

// Evento formulário
document.getElementById("formCadastro").addEventListener("submit", async function (e) {
  e.preventDefault();

  const unidadeSelect = document.getElementById("unidadeSelect");
  const setorSelect = document.getElementById("setorSelect");
  const cargoSelect = document.getElementById("cargoSelect");

  const dados = {
    nome: document.getElementById("nome").value,
    data_nascimento: document.getElementById("data-nascimento").value,
    cpf: document.getElementById("cpf").value,
    matricula: document.getElementById("matricula").value,

    empresa_codigo: empresaCodigo,
    empresa_nome: "EMPRESA PADRÃO", // se quiser, pode buscar depois

    unidade_codigo: unidadeSelect.value,
    unidade_nome: unidadeSelect.selectedOptions[0].dataset.nome,

    setor_codigo: setorSelect.value,
    setor_nome: setorSelect.selectedOptions[0].dataset.nome,

    cargo_codigo: cargoSelect.value,
    cargo_nome: cargoSelect.selectedOptions[0].dataset.nome
  };

  // validação mínima
  if (!dados.unidade_codigo || !dados.setor_codigo || !dados.cargo_codigo) {
    alert("Selecione unidade, setor e cargo");
    return;
  }

  try {
    const resposta = await fetch("http://localhost:3001/funcionarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    });

    const json = await resposta.json();

    document.getElementById("mensagem").innerHTML =
      "<div class='alert alert-success'>Cadastro enviado com sucesso!</div>";

    document.getElementById("formCadastro").reset();

  } catch (erro) {
    document.getElementById("mensagem").innerHTML =
      "<div class='alert alert-danger'>Erro ao enviar cadastro</div>";
  }
});