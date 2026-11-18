//---------------------------------------SCROLL----------------------------------------------

// Função que vai fazer rolar para baixo
function rolarParaBaixo() {
    // Cria uma constantante destino que vai armazenar o id destino do HTML
    const destino = document.getElementById('destino');

    // Vai até o destino de forma suave
    if (destino){
        destino.scrollIntoView({
            behavior: 'smooth'
        });
    }
}
// Busca o tema que está salvo no navegador, se não conseguir usa o escuro
try {
    const temaSalvo = localStorage.getItem('tema');
    document.documentElement.dataset.tema = temaSalvo === 'claro' ? 'claro' : 'escuro';
}
catch (erro) {
    document.documentElement.dataset.tema = 'escuro';
}
//---------------------------------------SUPORTE----------------------------------------------
// Envia os dados ao servidos e mostra sucesso ou erro. Limpa o formulário depois do envio e reativa o botão
const formularioSuporte = document.querySelector('.suporte');

if (formularioSuporte instanceof HTMLFormElement) {

    const avisoSuporte = formularioSuporte.querySelector('.suporte-aviso');


    const botaoEnviarSuporte = formularioSuporte.querySelector('button[type="submit"]');

    formularioSuporte.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        avisoSuporte.textContent = '';
        botaoEnviarSuporte.disabled = true;

        try {
            let resposta;
            try {
                resposta = await fetch('api/support.php', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(Object.fromEntries(new FormData(formularioSuporte).entries()))
                });
            } catch (erro) {
                avisoSuporte.textContent = 'Não foi possível conectar ao servidor. Verifique se o Apache e o MySQL estão ativos.';
                return;
            }

            let resultado;
            try {
                resultado = await resposta.json();
            } catch (erro) {
                avisoSuporte.textContent = 'O servidor retornou uma resposta inválida. Verifique a configuração do PHP.';
                return;
            }

            if (!resultado || typeof resultado !== 'object' || Array.isArray(resultado)) {
                avisoSuporte.textContent = 'O servidor retornou uma resposta inválida.';
                return;
            }

            if (!resposta.ok) {
                avisoSuporte.textContent = typeof resultado.message === 'string'
                    ? resultado.message
                    : 'Não foi possível enviar sua solicitação.';
                return;
            }

            if (typeof resultado.message !== 'string') {
                avisoSuporte.textContent = 'O servidor retornou uma resposta inválida.';
                return;
            }

            avisoSuporte.textContent = resultado.message;
            formularioSuporte.reset();
        } finally {
            botaoEnviarSuporte.disabled = false;
        }
    });
}

//---------------------------------------ALERT BOAS VINDAS----------------------------------------------
// Abre a janela de boas vindas sempre que o usuário entrar no início, permitindo fechar pelo botão ou clicando fora
const modalBoasVindas = document.querySelector('.modal-boas-vindas');
if (modalBoasVindas instanceof HTMLDialogElement) {
    const botoesFecharBoasVindas = modalBoasVindas.querySelectorAll('.modal-boas-vindas-fechar, .btn-entendi-boas-vindas');

    botoesFecharBoasVindas.forEach((botao) => {
        botao.addEventListener('click', () => modalBoasVindas.close());
    });

    modalBoasVindas.addEventListener('click', (evento) => {
        if (evento.target === modalBoasVindas) {
            modalBoasVindas.close();
        }
    });

    modalBoasVindas.showModal();
}
//---------------------------------------TROCAR TEMA----------------------------------------------
// Atualiza o botão e alterna entre os temas salvando a escolha no navegador
function atualizarBotaoTema() {
    const botaoTema = document.querySelector('.btn-tema');

    if (!botaoTema) return;

    const temaClaroAtivo = document.documentElement.dataset.tema === 'claro';
    botaoTema.textContent = temaClaroAtivo ? '🌙 Modo escuro' : '☀️ Modo claro';
    botaoTema.setAttribute('aria-label', temaClaroAtivo ? 'Ativar modo escuro' : 'Ativar modo claro');
}
function alternarTema() {
    const temaAtual = document.documentElement.dataset.tema || 'escuro';
    const novoTema = temaAtual === 'escuro' ? 'claro' : 'escuro';

    document.documentElement.dataset.tema = novoTema;

    try {
        localStorage.setItem('tema', novoTema);
    } catch (erro) {
    }

    atualizarBotaoTema();
}
atualizarBotaoTema();
const botaoTema = document.querySelector('.btn-tema');
if (botaoTema) {
    botaoTema.addEventListener('click', alternarTema);
}
//---------------------------------------BUSCA: FACULDADES E CURSOS---------------------------------------------
// Filtra faculdades, cursos e informações, mostrando a quantidade de resultados e ignorando acentuação e case-sensitive
const filtrosListas = [
    {
        campo: '#filtro-faculdades',
        cards: '.div-cards-faculdades',
        resultado: '#resultado-faculdades'
    },
    {
        campo: '#filtro-cursos',
        cards: '.div-cards-cursos',
        resultado: '#resultado-cursos'
    },
    {
        campo: '#filtro-faculdades-info',
        cards: '.faculdade-info',
        resultado: '#resultado-faculdades-info'
    }
];

filtrosListas.forEach(({ campo, cards: seletorCards, resultado }) => {
    const campoBusca = document.querySelector(campo);
    const cardsBusca = document.querySelectorAll(seletorCards);
    const mensagemResultado = document.querySelector(resultado);

    if (!(campoBusca instanceof HTMLInputElement) || cardsBusca.length === 0 || !(mensagemResultado instanceof HTMLElement)) {
        return;
    }

    campoBusca.addEventListener('input', () => {
        const termoBusca = campoBusca.value
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLocaleLowerCase('pt-BR');
        let quantidadeVisivel = 0;

        cardsBusca.forEach((card) => {
            const textoCard = (card.textContent || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLocaleLowerCase('pt-BR');
            const corresponde = textoCard.includes(termoBusca);

            card.hidden = !corresponde;
            if (corresponde) {
                quantidadeVisivel += 1;
            }
        });

        if (!termoBusca) {
            mensagemResultado.textContent = '';
        } else if (quantidadeVisivel === 0) {
            mensagemResultado.textContent = 'Nenhum resultado encontrado. Tente outra busca.';
        } else {
            const descricaoResultado = quantidadeVisivel === 1
                ? 'resultado encontrado.'
                : 'resultados encontrados.';
            mensagemResultado.textContent = `${quantidadeVisivel} ${descricaoResultado}`;
        }
    });
});

//---------------------------------------MODAL CADASTRO----------------------------------------------
/* Aqui é a parte de controle do cadastro, ele relaciona cada faculdade
a seu curso correspondente e envia os dados ao servidor*/
const cursosPorFaculdade = {
    Unicamp: [
        'Ciência da Computação', 'Engenharia Agrícola', 'Engenharia Ambiental', 'Engenharia Civil',
        'Engenharia de Alimentos', 'Engenharia de Computação', 'Engenharia de Controle e Automação',
        'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia Química', 'Estatística', 'Física',
        'Matemática', 'Química'
    ],
    UNESP: [
        'Ciência da Computação', 'Engenharia Ambiental', 'Engenharia Civil',
        'Engenharia de Controle e Automação', 'Engenharia de Produção', 'Engenharia Elétrica',
        'Engenharia Mecânica', 'Física', 'Matemática', 'Química'
    ],
    USP: [
        'Ciência da Computação', 'Engenharia Aeronáutica', 'Engenharia Civil',
        'Engenharia de Computação', 'Engenharia de Produção', 'Engenharia Elétrica',
        'Engenharia Mecânica', 'Engenharia Química', 'Estatística', 'Física', 'Matemática', 'Química'
    ],
    UFRJ: [
        'Ciência da Computação', 'Engenharia Civil', 'Engenharia de Computação e Informação',
        'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia Metalúrgica',
        'Engenharia Naval e Oceânica', 'Engenharia de Petróleo', 'Engenharia de Produção',
        'Engenharia Química', 'Física', 'Matemática', 'Química'
    ],
    UFMG: [
        'Ciência da Computação', 'Engenharia Civil', 'Engenharia de Controle e Automação',
        'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia Metalúrgica',
        'Engenharia de Minas', 'Engenharia de Produção', 'Engenharia Química', 'Estatística',
        'Física', 'Matemática', 'Química'
    ],
    ITA: [
        'Engenharia Aeronáutica', 'Engenharia Aeroespacial', 'Engenharia Civil-Aeronáutica',
        'Engenharia de Computação', 'Engenharia Eletrônica', 'Engenharia Mecânica-Aeronáutica'
    ],
    UFRGS: [
        'Ciência da Computação', 'Engenharia Ambiental', 'Engenharia Civil',
        'Engenharia de Computação', 'Engenharia de Materiais', 'Engenharia Elétrica',
        'Engenharia Mecânica', 'Engenharia Química', 'Estatística', 'Física', 'Matemática', 'Química'
    ],
    UFSC: [
        'Ciência da Computação', 'Engenharia Civil', 'Engenharia de Controle e Automação',
        'Engenharia de Materiais', 'Engenharia de Produção', 'Engenharia Elétrica',
        'Engenharia Mecânica', 'Engenharia Química', 'Física', 'Matemática', 'Química',
        'Sistemas de Informação'
    ],
    UFPR: [
        'Ciência da Computação', 'Engenharia Ambiental', 'Engenharia Cartográfica e de Agrimensura',
        'Engenharia Civil', 'Engenharia de Bioprocessos e Biotecnologia', 'Engenharia Elétrica',
        'Engenharia Mecânica', 'Engenharia Química', 'Engenharia de Produção', 'Física',
        'Matemática', 'Química'
    ],
    UnB: [
        'Ciência da Computação', 'Engenharia Ambiental', 'Engenharia Civil',
        'Engenharia de Computação', 'Engenharia de Redes de Comunicação', 'Engenharia de Produção',
        'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia Mecatrônica',
        'Engenharia Química', 'Estatística', 'Física', 'Matemática', 'Química'
    ],
    UFPE: [
        'Ciência da Computação', 'Engenharia Civil', 'Engenharia da Computação',
        'Engenharia de Controle e Automação', 'Engenharia de Materiais', 'Engenharia de Produção',
        'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia Química', 'Estatística',
        'Física', 'Matemática', 'Química'
    ],
    UFC: [
        'Ciência da Computação', 'Engenharia Ambiental', 'Engenharia Civil',
        'Engenharia de Computação', 'Engenharia de Energias Renováveis', 'Engenharia de Produção',
        'Engenharia Elétrica', 'Engenharia Mecânica', 'Engenharia Metalúrgica',
        'Engenharia Química', 'Estatística', 'Física', 'Matemática', 'Química'
    ]
};

const modalCadastro = document.querySelector('.modal-cadastro');
if (modalCadastro instanceof HTMLDialogElement) {
    const botoesAbrirCadastro = document.querySelectorAll('.btn-para-login');
    const botaoFecharCadastro = modalCadastro.querySelector('.modal-cadastro-fechar');
    const primeiroCampoCadastro = modalCadastro.querySelector('#cadastro-nome');
    const seletorFaculdade = modalCadastro.querySelector('#cadastro-faculdade');
    const seletorCurso = modalCadastro.querySelector('#cadastro-curso');
    const formularioCadastro = modalCadastro.querySelector('.formulario-cadastro');
    const avisoCadastro = modalCadastro.querySelector('.cadastro-aviso');

    function atualizarCursosDisponiveis() {
        const cursosDisponiveis = cursosPorFaculdade[seletorFaculdade.value] || [];
        const opcaoInicial = document.createElement('option');

        opcaoInicial.value = '';
        opcaoInicial.disabled = true;
        opcaoInicial.selected = true;
        opcaoInicial.textContent = cursosDisponiveis.length
            ? 'Selecione um curso'
            : 'Selecione uma faculdade primeiro';
        seletorCurso.replaceChildren(opcaoInicial);
        seletorCurso.disabled = cursosDisponiveis.length === 0;

        cursosDisponiveis.forEach((curso) => {
            const opcaoCurso = document.createElement('option');
            opcaoCurso.value = curso;
            opcaoCurso.textContent = curso;
            seletorCurso.append(opcaoCurso);
        });
    }

    seletorFaculdade.addEventListener('change', atualizarCursosDisponiveis);
    atualizarCursosDisponiveis();

    botoesAbrirCadastro.forEach((botao) => {
        botao.addEventListener('click', () => {
            modalCadastro.showModal();
            primeiroCampoCadastro.focus();
        });
    });

    botaoFecharCadastro.addEventListener('click', () => modalCadastro.close());
    modalCadastro.addEventListener('click', (evento) => {
        if (evento.target === modalCadastro) {
            modalCadastro.close();
        }
    });

    formularioCadastro.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        const botaoEnviarCadastro = formularioCadastro.querySelector('button[type="submit"]');
        botaoEnviarCadastro.disabled = true;
        avisoCadastro.textContent = '';

        try {
            let resposta;
            try {
                resposta = await fetch('api/register.php', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(Object.fromEntries(new FormData(formularioCadastro).entries()))
                });
            } catch (erro) {
                avisoCadastro.textContent = 'Não foi possível conectar ao servidor. Verifique se o Apache e o MySQL estão ativos.';
                return;
            }

            let resultado;
            try {
                resultado = await resposta.json();
            } catch (erro) {
                avisoCadastro.textContent = 'O servidor retornou uma resposta inválida. Verifique a configuração do PHP.';
                return;
            }

            if (!resultado || typeof resultado !== 'object' || Array.isArray(resultado)) {
                avisoCadastro.textContent = 'O servidor retornou uma resposta inválida.';
                return;
            }

            if (!resposta.ok) {
                avisoCadastro.textContent = typeof resultado.message === 'string'
                    ? resultado.message
                    : 'Não foi possível concluir o cadastro.';
                return;
            }

            if (typeof resultado.message !== 'string') {
                avisoCadastro.textContent = 'O servidor retornou uma resposta inválida.';
                return;
            }

            avisoCadastro.textContent = resultado.message;
            formularioCadastro.reset();
            atualizarCursosDisponiveis();
        } finally {
            botaoEnviarCadastro.disabled = false;
        }
    });
}
//---------------------------------------MODAL LOGIN----------------------------------------------
/*Aqui é a parte de controle do login, ele envia os dados à API e recebe a resposta da autenticação*/
const modalLogin = document.querySelector('.modal-login');
if (modalLogin instanceof HTMLDialogElement) {
    const botoesAbrirLogin = document.querySelectorAll('.btn-para-entrar');
    const botaoFecharLogin = modalLogin.querySelector('.modal-login-fechar');
    const formularioLogin = modalLogin.querySelector('.formulario-login');
    const campoEmailLogin = modalLogin.querySelector('#login-email');
    const avisoLogin = modalLogin.querySelector('.login-aviso');
    const botaoEnviarLogin = formularioLogin.querySelector('button[type="submit"]');

    botoesAbrirLogin.forEach((botao) => {
        botao.addEventListener('click', () => {
            modalLogin.showModal();
            campoEmailLogin.focus();
        });
    });

    botaoFecharLogin.addEventListener('click', () => modalLogin.close());
    modalLogin.addEventListener('click', (evento) => {
        if (evento.target === modalLogin) {
            modalLogin.close();
        }
    });

    formularioLogin.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        avisoLogin.textContent = '';
        botaoEnviarLogin.disabled = true;

        try {
            let resposta;
            try {
                resposta = await fetch('api/login.php', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify(Object.fromEntries(new FormData(formularioLogin).entries()))
                });
            } catch (erro) {
                avisoLogin.textContent = 'Não foi possível conectar ao servidor. Verifique se o Apache e o MySQL estão ativos.';
                return;
            }

            let resultado;
            try {
                resultado = await resposta.json();
            } catch (erro) {
                avisoLogin.textContent = 'O servidor retornou uma resposta inválida. Verifique a configuração do PHP.';
                return;
            }

            if (!resultado || typeof resultado !== 'object' || Array.isArray(resultado)) {
                avisoLogin.textContent = 'O servidor retornou uma resposta inválida.';
                return;
            }

            if (!resposta.ok) {
                avisoLogin.textContent = typeof resultado.message === 'string'
                    ? resultado.message
                    : 'Não foi possível fazer login.';
                return;
            }

            if (resultado.authenticated !== true) {
                avisoLogin.textContent = 'O servidor retornou uma resposta inválida.';
                return;
            }

            window.location.assign('perfil.html');
        } finally {
            botaoEnviarLogin.disabled = false;
        }
    });

    if (new URLSearchParams(window.location.search).get('login') === 'required') {
        const modalBoasVindas = document.querySelector('.modal-boas-vindas');
        if (modalBoasVindas instanceof HTMLDialogElement && modalBoasVindas.open) {
            modalBoasVindas.close();
        }
        modalLogin.showModal();
        campoEmailLogin.focus();
    }
}
//---------------------------------------PERFIL----------------------------------------------
// Mostra os dados do perfil do usuário de acordo com o cadastro e encerra a sessão quando o usuário solicita
const dadosPerfil = document.querySelector('.dados-perfil');
if (dadosPerfil instanceof HTMLElement) {
    const avisoPerfil = document.querySelector('.perfil-aviso');
    const botaoSair = document.querySelector('.btn-sair');
    const valoresPerfil = {
        nome: document.querySelector('#perfil-nome'),
        email: document.querySelector('#perfil-email'),
        faculdade: document.querySelector('#perfil-faculdade'),
        curso: document.querySelector('#perfil-curso')
    };

    async function carregarPerfil() {
        let resposta;
        try {
            resposta = await fetch('api/profile.php', {
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin'
            });
        } catch (erro) {
            avisoPerfil.textContent = 'Não foi possível conectar ao servidor para carregar seu perfil.';
            return;
        }

        let resultado;
        try {
            resultado = await resposta.json();
        } catch (erro) {
            avisoPerfil.textContent = 'O servidor retornou uma resposta inválida ao carregar o perfil.';
            return;
        }

        if (!resultado || typeof resultado !== 'object' || Array.isArray(resultado)) {
            avisoPerfil.textContent = 'O servidor retornou uma resposta inválida ao carregar o perfil.';
            return;
        }

        if (resposta.status === 401) {
            window.location.assign('index.html?login=required');
            return;
        }

        const usuarioPerfil = resultado.user;
        if (
            !resposta.ok ||
            !usuarioPerfil ||
            typeof usuarioPerfil !== 'object' ||
            Array.isArray(usuarioPerfil) ||
            ['nome', 'email', 'faculdade', 'curso'].some((campo) => typeof usuarioPerfil[campo] !== 'string')
        ) {
            avisoPerfil.textContent = typeof resultado.message === 'string'
                ? resultado.message
                : 'Não foi possível carregar seu perfil.';
            return;
        }

        valoresPerfil.nome.textContent = usuarioPerfil.nome;
        valoresPerfil.email.textContent = usuarioPerfil.email;
        valoresPerfil.faculdade.textContent = usuarioPerfil.faculdade;
        valoresPerfil.curso.textContent = usuarioPerfil.curso;
        avisoPerfil.textContent = '';
        botaoSair.hidden = false;
    }

    carregarPerfil();

    botaoSair.addEventListener('click', async () => {
        botaoSair.disabled = true;
        avisoPerfil.textContent = '';

        try {
            const resposta = await fetch('api/logout.php', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin'
            });

            if (!resposta.ok) {
                avisoPerfil.textContent = 'Não foi possível encerrar sua sessão.';
                return;
            }

            window.location.assign('index.html');
        } catch (erro) {
            avisoPerfil.textContent = 'Não foi possível conectar ao servidor para encerrar sua sessão.';
        } finally {
            botaoSair.disabled = false;
        }
    });
}

//---------------------------------------LISTA DE CURSOS----------------------------------------------
/* Permite ao usuário adicionar e remover cursos a uma lista,
qual é atualizada no mesmo instante e armazena o que está lista no navegador para que
ao atualizar não desapareça o que tem na lista*/
const cardsCursos = document.querySelectorAll('.div-cards-cursos[data-curso]');
const listaCursosItens = document.querySelector('.lista-cursos-itens');
if (cardsCursos.length > 0 && listaCursosItens instanceof HTMLUListElement) {
    const chaveListaCursos = 'exatasNaHora.cursosSalvos';
    const cursosDisponiveis = new Set(
        Array.from(cardsCursos, (card) => card.dataset.curso)
    );
    const listaCursosVazia = document.querySelector('.lista-cursos-vazia');
    const avisoListaCursos = document.querySelector('.lista-cursos-aviso');
    let cursosSalvos = [];

    function salvarCursos(listaAtualizada) {
        try {
            localStorage.setItem(chaveListaCursos, JSON.stringify(listaAtualizada));
            avisoListaCursos.textContent = '';
            return true;
        } catch (erro) {
            avisoListaCursos.textContent = 'Não foi possível salvar sua lista neste navegador.';
            return false;
        }
    }

    function renderizarListaCursos() {
        listaCursosItens.replaceChildren();
        listaCursosVazia.hidden = cursosSalvos.length > 0;

        cursosSalvos.forEach((curso) => {
            const item = document.createElement('li');
            const nome = document.createElement('span');
            const botaoRemover = document.createElement('button');

            nome.textContent = curso;
            botaoRemover.type = 'button';
            botaoRemover.className = 'btn-remover-curso';
            botaoRemover.textContent = 'Remover';
            botaoRemover.setAttribute('aria-label', `Remover ${curso} da lista`);
            botaoRemover.addEventListener('click', () => {
                const listaAtualizada = cursosSalvos.filter((cursoSalvo) => cursoSalvo !== curso);
                if (salvarCursos(listaAtualizada)) {
                    cursosSalvos = listaAtualizada;
                    renderizarListaCursos();
                    const card = Array.from(cardsCursos).find((elemento) => elemento.dataset.curso === curso);
                    if (card) {
                        const botaoAbrir = card.querySelector('.curso-card-abrir');
                        const confirmacao = card.querySelector('.confirmacao-curso');
                        const pergunta = confirmacao?.querySelector('p');
                        const botaoAdicionar = confirmacao?.querySelector('.btn-adicionar-curso');
                        const botaoCancelar = confirmacao?.querySelector('.btn-cancelar-curso');

                        if (confirmacao && pergunta && botaoAdicionar && botaoCancelar) {
                            pergunta.textContent = `Quer adicionar ${curso} à sua lista?`;
                            botaoAdicionar.hidden = false;
                            botaoCancelar.textContent = 'Cancelar';
                            confirmacao.hidden = true;
                        }

                        if (botaoAbrir) {
                            botaoAbrir.hidden = false;
                            botaoAbrir.focus();
                        }
                    }
                }
            });

            item.append(nome, botaoRemover);
            listaCursosItens.append(item);
        });
    }

    try {
        const cursosArmazenados = JSON.parse(localStorage.getItem(chaveListaCursos) || '[]');
        if (Array.isArray(cursosArmazenados)) {
            cursosSalvos = [...new Set(cursosArmazenados.filter(
                (curso) => typeof curso === 'string' && cursosDisponiveis.has(curso)
            ))];
        } else {
            avisoListaCursos.textContent = 'Não foi possível carregar sua lista salva.';
        }
    } catch (erro) {
        avisoListaCursos.textContent = 'Não foi possível carregar sua lista salva neste navegador.';
    }

    cardsCursos.forEach((card) => {
        const curso = card.dataset.curso;
        const botaoAbrir = document.createElement('button');
        const confirmacao = document.createElement('div');
        const pergunta = document.createElement('p');
        const botaoAdicionar = document.createElement('button');
        const botaoCancelar = document.createElement('button');

        botaoAbrir.type = 'button';
        botaoAbrir.className = 'curso-card-abrir';
        botaoAbrir.setAttribute('aria-label', `${curso}. Clique para adicionar à sua lista`);
        while (card.firstChild) {
            botaoAbrir.append(card.firstChild);
        }

        confirmacao.className = 'confirmacao-curso';
        confirmacao.hidden = true;
        pergunta.textContent = `Quer adicionar ${curso} à sua lista?`;
        botaoAdicionar.type = 'button';
        botaoAdicionar.className = 'btn-adicionar-curso';
        botaoAdicionar.textContent = 'Adicionar';
        botaoCancelar.type = 'button';
        botaoCancelar.className = 'btn-cancelar-curso';
        botaoCancelar.textContent = 'Cancelar';
        confirmacao.append(pergunta, botaoAdicionar, botaoCancelar);
        card.append(botaoAbrir, confirmacao);

        botaoAbrir.addEventListener('click', () => {
            confirmacao.hidden = false;
            botaoAbrir.hidden = true;
            botaoAdicionar.focus();
        });

        botaoCancelar.addEventListener('click', () => {
            confirmacao.hidden = true;
            botaoAbrir.hidden = false;
            botaoAbrir.focus();
        });

        botaoAdicionar.addEventListener('click', () => {
            if (!cursosSalvos.includes(curso)) {
                const listaAtualizada = [...cursosSalvos, curso];
                if (!salvarCursos(listaAtualizada)) {
                    return;
                }
                cursosSalvos = listaAtualizada;
                renderizarListaCursos();
            }

            pergunta.textContent = `${curso} está na sua lista!`;
            botaoAdicionar.hidden = true;
            botaoCancelar.textContent = 'Fechar';
        });
    });

    renderizarListaCursos();
}

//---------------------------------------INSIGHTS----------------------------------------------
// Mostra uma curiosidade diferente sobre o assunto exatas a cada clique
const botaoProximoInsight = document.querySelector('#btn-proximo-insight');
const mensagemInsight = document.querySelector('#mensagem-insight');

if (botaoProximoInsight && mensagemInsight) {
    const insightsExatas = [
        'O número π é irracional: sua expansão decimal não termina nem entra em um padrão que se repete.',
        'Por definição, 0! é igual a 1. Isso também faz a fórmula de combinações funcionar nos casos mais simples.',
        'Computadores representam dados em binário, usando combinações dos dígitos 0 e 1.',
        'Um plano pode ser coberto por hexágonos iguais sem deixar espaços ou sobreposições — como um mosaico.',
        'O algoritmo de Euclides encontra o máximo divisor comum repetindo divisões com resto.',
        'Há infinitos números primos: sempre é possível demonstrar que uma lista finita não contém todos eles.',
        'Relógios nos satélites de GPS são afetados pela relatividade; o sistema corrige essa diferença para calcular posições com precisão.',
        'Na topologia, uma caneca com alça e uma rosquinha são equivalentes: ambas têm um único furo.',
        'Um googol é 1 seguido de 100 zeros — muito maior que a quantidade estimada de átomos no universo observável.',
        'A identidade de Euler, e^(iπ) + 1 = 0, conecta cinco números fundamentais da matemática em uma única expressão.'
    ];
    let indiceInsight = -1;

    botaoProximoInsight.addEventListener('click', () => {
        indiceInsight = (indiceInsight + 1) % insightsExatas.length;
        mensagemInsight.textContent = insightsExatas[indiceInsight];
        botaoProximoInsight.textContent = 'Outra curiosidade';
    });
}
