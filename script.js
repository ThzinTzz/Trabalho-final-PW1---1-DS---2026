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