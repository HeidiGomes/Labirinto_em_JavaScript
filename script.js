// Tamanho da janela
const WIDTH = 640;
const HEIGHT = 480;

// Tamanho do labirinto
const ROWS = 20;
const COLS = 20;

// Tamanho das células
const CELL_WIDTH = WIDTH / COLS;
const CELL_HEIGHT = HEIGHT / ROWS;

// Cores
const WHITE = "#FFFFFF";
const RED = "#FF0000";

// Inicializar o canvas
const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

// Classe para representar uma célula do labirinto
class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.visited = false;
        this.walls = { top: true, right: true, bottom: true, left: true };
    }
}

// Definindo variáveis para o cronômetro
let startTime;
let timerInterval;
let elapsedTime = 0;

// Função para iniciar o cronômetro
function startTimer() {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(function printTime() {
        elapsedTime = Date.now() - startTime;
        updateTimer();
    }, 1000);
}

// Função para pausar o cronômetro
function pauseTimer() {
    clearInterval(timerInterval);
}

// Função para atualizar o cronômetro exibido na tela
function updateTimer() {
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    document.getElementById("timer").textContent = `Tempo: ${padTime(minutes)}:${padTime(seconds)}`;
}

// Função auxiliar para adicionar um zero à esquerda, se necessário
function padTime(time) {
    return time < 10 ? `0${time}` : time;
}

// Função auxiliar para obter os vizinhos de uma célula
function getNeighbors(cell, cells) {
    const neighbors = [];
    if (cell.row > 0) // vizinho de cima
        neighbors.push(cells[cell.row - 1][cell.col]);
    if (cell.row < ROWS - 1) // vizinho de baixo
        neighbors.push(cells[cell.row + 1][cell.col]);
    if (cell.col > 0) // vizinho da esquerda
        neighbors.push(cells[cell.row][cell.col - 1]);
    if (cell.col < COLS - 1) // vizinho da direita
        neighbors.push(cells[cell.row][cell.col + 1]);
    return neighbors;
}

// Função auxiliar para remover a parede entre duas células
function removeWall(cell1, cell2) {
    if (cell1.row === cell2.row) {
        if (cell1.col > cell2.col) { // cell2 está à esquerda de cell1
            cell1.walls.left = false;
            cell2.walls.right = false;
        } else { // cell2 está à direita de cell1
            cell1.walls.right = false;
            cell2.walls.left = false;
        }
    } else {
        if (cell1.row > cell2.row) { // cell2 está acima de cell1
            cell1.walls.top = false;
            cell2.walls.bottom = false;
        } else { // cell2 está abaixo de cell1
            cell1.walls.bottom = false;
            cell2.walls.top = false;
        }
    }
}

// Função para gerar o labirinto usando o algoritmo de busca em profundidade
function generateMaze(cells) {
    // Escolher uma célula aleatória para começar
    const start = cells[Math.floor(Math.random() * ROWS)][Math.floor(Math.random() * COLS)];
    start.visited = true;

    // Iniciar a pilha com a célula inicial
    const stack = [start];

    while (stack.length > 0) {
        const current = stack[stack.length - 1];

        // Obter os vizinhos não visitados da célula atual
        const neighbors = getNeighbors(current, cells).filter(cell => !cell.visited);

        if (neighbors.length > 0) {
            // Escolher um vizinho aleatório
            const neighbor = neighbors[Math.floor(Math.random() * neighbors.length)];

            // Remover a parede entre a célula atual e o vizinho escolhido
            removeWall(current, neighbor);

            // Marcar o vizinho como visitado e adicioná-lo à pilha
            neighbor.visited = true;
            stack.push(neighbor);
        } else {
            // Se a célula atual não tem vizinhos não visitados, removê-la da pilha
            stack.pop();
        }
    }
}

// Função para desenhar o labirinto
function drawMaze(cells) {
    cells.forEach(row => {
        row.forEach(cell => {
            const x = cell.col * CELL_WIDTH;
            const y = cell.row * CELL_HEIGHT;
            if (cell.walls.top)
                ctx.fillRect(x, y, CELL_WIDTH, 1);
            if (cell.walls.right)
                ctx.fillRect(x + CELL_WIDTH - 1, y, 1, CELL_HEIGHT);
            if (cell.walls.bottom)
                ctx.fillRect(x, y + CELL_HEIGHT - 1, CELL_WIDTH, 1);
            if (cell.walls.left)
                ctx.fillRect(x, y, 1, CELL_HEIGHT);
        });
    });
}

// Função para desenhar a bolinha vermelha
function drawBall(x, y) {
    ctx.beginPath();
    ctx.arc(x * CELL_WIDTH + CELL_WIDTH / 2, y * CELL_HEIGHT + CELL_HEIGHT / 2, Math.min(CELL_WIDTH, CELL_HEIGHT) / 4, 0, Math.PI * 2);
    ctx.fillStyle = RED;
    ctx.fill();
    ctx.closePath();
}

// Função para desenhar a bolinha branca no final do labirinto
function drawFinish() {
    ctx.beginPath();
    ctx.arc((COLS - 1) * CELL_WIDTH + CELL_WIDTH / 2, (ROWS - 1) * CELL_HEIGHT + CELL_HEIGHT / 2, Math.min(CELL_WIDTH, CELL_HEIGHT) / 4, 0, Math.PI * 2);
    ctx.fillStyle = WHITE;
    ctx.fill();
    ctx.closePath();
}

// Função principal
function main() {
    const cells = Array.from({ length: ROWS }, (_, i) => Array.from({ length: COLS }, (_, j) => new Cell(i, j)));
    generateMaze(cells);

    // Posição inicial da bolinha
    let ballX = 0;
    let ballY = 0;

    // Iniciar o cronômetro quando o jogo começar
    startTimer();

    // Loop principal do jogo
    function gameLoop() {
        // Limpar o canvas
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        // Verificar se a bolinha vermelha chegou à bolinha branca
        if (ballX === COLS - 1 && ballY === ROWS - 1) {
            document.getElementById("congratulations").style.display = "block"; // Exibir mensagem de parabéns
            pauseTimer(); // Pausa o cronômetro quando o jogo termina
            return;
        }

        // Desenhar o labirinto
        drawMaze(cells);

        // Desenhar a bolinha vermelha na posição atual
        drawBall(ballX, ballY);

        // Desenhar a bolinha branca no final do labirinto
        drawFinish();
    }

    // Event listener para capturar as teclas pressionadas
    document.addEventListener("keydown", event => {
        switch (event.key) {
            case "ArrowUp":
                if (ballY > 0 && !cells[ballY][ballX].walls.top)
                    ballY--;
                break;
            case "ArrowDown":
                if (ballY < ROWS - 1 && !cells[ballY][ballX].walls.bottom)
                    ballY++;
                break;
            case "ArrowLeft":
                if (ballX > 0 && !cells[ballY][ballX].walls.left)
                    ballX--;
                break;
            case "ArrowRight":
                if (ballX < COLS - 1 && !cells[ballY][ballX].walls.right)
                    ballX++;
                break;
            default:
                break;
        }
    });

    // Iniciar o loop do jogo
    setInterval(gameLoop, 1000 / 60);
}

// Iniciar o jogo quando a página é carregada
window.onload = main;
