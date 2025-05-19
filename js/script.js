const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20); // Cada bloco será 20x20px

const matrix = [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
];

function createMatrix(w, h) {
    const matrix = [];
        while (h--) {
            matrix.push(new Array(w).fill(0));
        }
        return matrix;
}

const colors = [
    null,
    '#0ff', // T
    '#ff0', // O
    '#f70', // L
    '#00f', // J
    '#0f0', // I
    '#f00', // S
    '#f0f'  // Z
];


function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}


function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                    (arena[y + o.y] &&
                        arena[y + o.y][x + o.x]) !== 0) {
                        return true;
                }
            }
        }
    return false;
}

function playerDrop() {
    player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
            merge(arena, player);
            arenaSweep(); // Remover linhas completas
            playerReset();
        }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
        if (collide(arena, player)) {
            player.pos.x -= dir;
        }
}

function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L') {
        return [
            [0, 0, 3],
            [3, 3, 3],
            [0, 0, 0],
        ];
    } else if (type === 'J') {
        return [
            [4, 0, 0],
            [4, 4, 4],
            [0, 0, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 0, 0, 0],
            [5, 5, 5, 5],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}


function playerReset() {
    const pieces = 'ILJOTSZ';
        player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
        player.pos.y = 0;
        player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

            if (collide(arena, player)) {
                arena.forEach(row => row.fill(0));
                alert("Game Over!");
                score = 0;
            }
}


function playerRotate() {
    const m = player.matrix;
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
            }
        }
            m.forEach(row => row.reverse());
            if (collide(arena, player)) {
                m.forEach(row => row.reverse());
                for (let y = 0; y < m.length; ++y) {
                    for (let x = 0; x < y; ++x) {
                        [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
                    }
                }
            }
}

// Função para remover linhas completas
let score = 0;
function arenaSweep() {
    let rowCount = 1;
        outer: for (let y = arena.length - 1; y >= 0; --y) {
                for (let x = 0; x < arena[y].length; ++x) {
                    if (arena[y][x] === 0) {
                        continue outer;
                    }
                }

                const row = arena.splice(y, 1)[0].fill(0);
                arena.unshift(row);
                ++y;

                score += rowCount * 10;
                rowCount *= 2;

                updateSpeed(); // Atualiza a velocidade com base na pontuação
            }
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);

    // Atualiza a pontuação na tela
    document.getElementById('score').innerText = 'Score: ' + score;
    document.getElementById('level').innerText = 'Level: ' + Math.floor(score / 50);
}

let dropCounter = 0;
let dropInterval = 1000; //começa com 1 segundo
let lastTime = 0;

function updateSpeed() {
    const level = Math.floor(score / 50);
        // Velocidade máxima: 100ms entre quedas
        dropInterval = Math.max(1000 - level * 100, 100);
}


function update(time = 0) {
    const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;
            if (dropCounter > dropInterval) {
                playerDrop();
            }
            draw();
            requestAnimationFrame(update);
}

const arena = createMatrix(12, 20);
const player = {
    pos: { x: 0, y: 0 },
        matrix: matrix
};

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        playerMove(-1);
    } else if (event.key === 'ArrowRight') {
        playerMove(1);
    } else if (event.key === 'ArrowDown') {
        playerDrop();
    } else if (event.key === 'ArrowUp') {
        playerRotate();
    }
});

playerReset();
update();