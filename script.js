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
//---------------------------------------ALERT----------------------------------------------
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
//--------------------------------------------------------------------------------------------

//---------------------------------------TEMA----------------------------------------------
// Atualiza os textos
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
        // O tema continua funcionando na página mesmo se o armazenamento não estiver disponível
    }

    atualizarBotaoTema();
}

//---------------------------------------Busca de faculdades e cursos----------------------------------------------
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

// Atualiza o botão do tema e faz com que ele responda ao clique do usuário
atualizarBotaoTema();
const botaoTema = document.querySelector('.btn-tema');
if (botaoTema) {
    botaoTema.addEventListener('click', alternarTema);
}
//--------------------------------------------------------------------------------------------

//---------------------------------------MODAL----------------------------------------------

const modalCadastro = document.querySelector('.modal-cadastro');
if (modalCadastro instanceof HTMLDialogElement) {
    const botoesAbrirCadastro = document.querySelectorAll('.btn-para-login');
    const botaoFecharCadastro = modalCadastro.querySelector('.modal-cadastro-fechar');
    const primeiroCampoCadastro = modalCadastro.querySelector('#cadastro-nome');
    const formularioCadastro = modalCadastro.querySelector('.formulario-cadastro');
    const avisoCadastro = modalCadastro.querySelector('.cadastro-aviso');

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

    formularioCadastro.addEventListener('submit', (evento) => {
        evento.preventDefault();
        avisoCadastro.textContent = 'Seus dados ainda não foram enviados. O cadastro será ativado quando a integração com o banco de dados estiver pronta.';
    });
}

//---------------------------------------Lista de cursos----------------------------------------------


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

//---------------------------------------Curiosidades de exatas----------------------------------------------
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
