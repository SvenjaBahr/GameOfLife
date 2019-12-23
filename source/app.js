const CellStates =
{
    NeverLived: 0,
    Alive: 1,
    Dead: 2
};

let fieldWidth = 60;
let fieldHeight = 25;
let gameRun = false;
let generation = 0;
let cells; // an array of arrays --> game field
let oldCells; // old game field
let isPencilDown = false;
let hoverMousePosition = null;
let gameField; // the div with the id gameField

let cellStyle = document.createElement("style");  // the cell style change so it must be created here
cellStyle.type = "text/css";
cellStyle.innerHTML = ".cell { display: inline-block; cursor: pointer; }";
document.getElementsByTagName("head")[0].appendChild(cellStyle); // append cell style to the head;

// window events
window.onload = function () {
    setInitialGameField(fieldWidth, fieldHeight);
}
window.onmouseup = function () {
    isPencilDown = false;
}
window.onresize = function () {
    this.calculateAndUpdateCellStyle();
}

function setInitialGameField(width, height) {
    stopGame();

    // width and height cannot be smaller than 10
    if (width !== undefined) {
        width = Math.max(10, width);
        fieldWidth = width;
    }

    if (height !== undefined) {
        height = Math.max(10, height);
        fieldHeight = height;
    }

    // setting the value in the view
    document.getElementById("width").value = width.toString();
    document.getElementById("height").value = height.toString();

    generation = 0;
    document.getElementById("generation").innerHTML = "Generation: " + generation.toString();

    cells = new Array(width);

    for (let i = 0; i < width; i++) {
        cells[i] = new Array(height);

        for (let j = 0; j < height; j++) {
            if (oldCells && oldCells.length >= i && oldCells[i].length >= j) {
                cells[i][j] = oldCells[i][j]; // take the value of the oldCells if there is a value
            }
            else {
                cells[i][j] = CellStates.NeverLived;
            }
        }
    }

    gameField = document.getElementById("gameField");

    // delete all children of the gameField
    while (gameField.firstChild) {
        gameField.firstChild.remove();
    }

    calculateAndUpdateCellStyle(); // calculates the width and the height
    insertCellsAsDivsView(); // calculates the game field for the view
    refreshClassesOfCellsView(); // add the correct cell class (neverLivedCell, aliveCell, deadCell)
}

function calculateAndUpdateCellStyle() {
    let style = ".cell { display: inline-block; ";
    let body = document.getElementsByTagName("body")[0];
    let windowWidth = body.offsetWidth * 0.8 - 2;
    let windowHeight = body.offsetHeight * 0.8 - 4;
    let maxWidth = windowWidth / fieldWidth;
    let maxHeight = windowHeight / fieldHeight;
    let cellSize = Math.floor(Math.min(maxWidth, maxHeight)); // set cell size
    style += "width: " + cellSize.toString() + "px; ";
    style += "height: " + cellSize.toString() + "px; }";
    cellStyle.innerHTML = style;
}

function insertCellsAsDivsView() {
    // goes through the rows
    for (let i = 0; i < fieldHeight; i++) {
        let parent = document.createElement("div");
        parent.classList.add("cellRow");

        // goes through the columns
        for (let j = 0; j < fieldWidth; j++) {
            let cell = document.createElement("div");
            cell.id = "cell " + "Col: " + j.toString() + " Row: " + i.toString(); // add cell id
            cell.classList.add("cell"); // add class .cell
            // add mouse events
            cell.onmousedown = function () {
                changeCellStates(j, i);
                isPencilDown = true;
            };
            cell.onmouseenter = function () {
                if (isPencilDown) {
                    changeCellStates(j, i);
                }

                hoverMousePosition = [j, i];
            }
            cell.onmouseleave = function () {
                if (hoverMousePosition && hoverMousePosition[0] === j && hoverMousePosition[1] === i) {
                    hoverMousePosition = null;
                }
            };

            parent.appendChild(cell);
        }

        gameField.appendChild(parent);
    }
}

function changeCellStates(column, row) {
    if (cells[column][row] !== undefined) {
        if (cells[column][row] == CellStates.Dead || cells[column][row] == CellStates.NeverLived) {
            cells[column][row] = CellStates.Alive;
        }
        else if (cells[column][row] == CellStates.Alive) {
            cells[column][row] = CellStates.Dead;
        }
        else {
            cells[column][row] = CellStates.NeverLived;
        }

        let cell = document.getElementById("cell " + "Col: " + column.toString() + " Row: " + row.toString());

        if (cell) {
            changeCellStateClasses(cell, cells[column][row]); // change cellState in view
        }
    }
}

function changeCellStateClasses(element, cellState) {
    // remove old cellState class
    if (element.classList.contains("neverLivedCell")) {
        element.classList.remove("neverLivedCell");
    }

    if (element.classList.contains("aliveCell")) {
        element.classList.remove("aliveCell");
    }

    if (element.classList.contains("deadCell")) {
        element.classList.remove("deadCell");
    }

    // add new class to class list
    switch (cellState) {
        case CellStates.NeverLived:
            element.classList.add("neverLivedCell");
            break;
        case CellStates.Alive:
            element.classList.add("aliveCell");
            break;
        case CellStates.Dead:
            element.classList.add("deadCell");
            break;
    }
}

function refreshClassesOfCellsView() {
    // goes throug the columns
    for (let i = 0; i < cells.length; i++) {
        // goes through the rows
        for (let j = 0; j < cells[i].length; j++) {
            if (!oldCells || oldCells[i][j] !== cells[i][j]) {
                let cellDiv = document.getElementById("cell " + "Col: " + i.toString() + " Row: " + j.toString());

                if (cellDiv) {
                    changeCellStateClasses(cellDiv, cells[i][j]);
                }
            }
        }
    }
}

function startDrawing() {
    isPencilDown = true;
}

function step() {
    oldCells = cells;
    let thereIsALiveCell = checkIfThereIsNextGeneration();

    if (thereIsALiveCell) {
        generation++;
        cells = checkGameOfLifeConditions(cells);
        refreshClassesOfCellsView();
        document.getElementById("generation").innerHTML = "Generation: " + generation.toString();
    }
    else {
        stopGame();
    }
}

function checkIfThereIsNextGeneration() {
    // goes through the columns
    for (let i = 0; i < oldCells.length; i++) {
        // goes through the rows
        for (let j = 0; j < oldCells[i].length; j++) {
            if (oldCells[i][j] === CellStates.Alive) {
                return true;
            }
        }
    }

    return false;
}

function checkGameOfLifeConditions(oldCellArray) {
    let newCells = new Array(oldCellArray.length);

    // goes through the columns
    for (let i = 0; i < oldCellArray.length; i++) {
        newCells[i] = new Array(oldCellArray[i].length);

        // goes through the rows
        for (let j = 0; j < oldCellArray[i].length; j++) {
            let countNeighbour = countLivingNeighbourCells(i, j, oldCellArray);

            if (oldCellArray[i][j] === CellStates.Alive) {
                if (countNeighbour === 2 || countNeighbour === 3) {
                    newCells[i][j] = CellStates.Alive;
                }
                else {
                    newCells[i][j] = CellStates.Dead;
                }
            }
            else if (oldCellArray[i][j] === CellStates.Dead && countNeighbour === 3) {
                newCells[i][j] = CellStates.Alive;
            }
            else {
                newCells[i][j] = oldCellArray[i][j];
            }
        }
    }

    return newCells
}

function countLivingNeighbourCells(colunm, row, cellArray) {
    let countNeighbour = 0;

    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            if (i === 0 && j === 0) {
                continue; // the cell where the neighbours shall be calculated
            }

            let calculatedCol = (colunm + cellArray.length + i) % cellArray.length;
            let calculatedRow = (row + cellArray[calculatedCol].length + j) % cellArray[calculatedCol].length;

            if (cellArray[calculatedCol][calculatedRow] === CellStates.Alive) {
                countNeighbour++;
            }
        }
    }

    return countNeighbour;
}

function reactOnStartStopButton() {
    if (gameRun) {
        stopGame();
    }
    else {
        startGame();
    }

    loopStep();
}

function loopStep() {
    if (gameRun) {
        step();
        setTimeout(loopStep, 15);
    }
}

function stopGame() {
    if (gameRun) {
        gameRun = false;
        document.getElementById("startButton").innerHTML = "Start";
    }
}

function startGame() {
    if (!gameRun) {
        gameRun = true;
        document.getElementById("startButton").innerHTML = "Stop";
    }
}

function clearGameField() {
    setInitialGameField(fieldWidth, fieldHeight);
}

function resizeWindow() {
    let width = document.getElementById("width").value;
    let height = document.getElementById("height").value;

    if (width < 10 || height < 10) {
        alert("The width and the height must be at least 10.");
    }

    // width and height cannot be smaller than 10
    if (width !== undefined) {
        width = Math.max(10, width);
        fieldWidth = width;
    }

    if (height !== undefined) {
        height = Math.max(10, height);
        fieldHeight = height;
    }

    // update the value in the view
    document.getElementById("width").value = width.toString();
    document.getElementById("height").value = height.toString();

    setInitialGameField(width, height);
}

function loadLevel() {
    let input = calculateLargestRowColumnInLevel();

    if (input[2] === 0) {
        // if it is a valid input
        let level = document.getElementById("level").value;
        let width = input[0]; // columns
        width = Math.max(10, width);
        let height = input[1]; // rows
        height = Math.max(10, height);
        oldCells = cells;

        cells = new Array(width);

        // fill whole array with never lived cells
        for (let i = 0; i < width; i++) {
            cells[i] = new Array(height);

            for (let j = 0; j < height; j++) {
                cells[i][j] = CellStates.NeverLived;
            }
        }

        let rowIndex = 0;
        let colIndex = 0;

        // set alive cells where a 1
        for (let j = 0; j < level.length; j++) {
            if (level[j] === '0') {
                colIndex++;
            }
            else if (level[j] === '1') {
                cells[colIndex][rowIndex] = CellStates.Alive;
                colIndex++;
            }
            else if (level[j] === '\n') {
                colIndex = 0;
                rowIndex++;
            }
        }

        oldCells = cells;
        document.getElementById("width").value = width.toString();
        document.getElementById("height").value = height.toString();
        fieldHeight = height;
        fieldWidth = width;
        generation = 0;
        document.getElementById("generation").innerHTML = "Generation: " + generation.toString();

        // delete all children of the gameField
        while (gameField.firstChild) {
            gameField.firstChild.remove();
        }

        calculateAndUpdateCellStyle(); // calculates the width and the height
        insertCellsAsDivsView(); // calculates the game field for the view
        addCellClassToClassList();

        document.getElementById("level").value = "";
    }
    else {
        alert("This is not a valid level. Please enter the level like \n101\n110011\n111")
    }
}

function calculateLargestRowColumnInLevel() {
    let level = document.getElementById("level").value;
    let largestColumntLength = 0;
    let rowLength = 1;
    let columnLength = 0;
    let error = 0; // 1 if there is an invalid character - 0 if the input is valid
    let solution = new Array(3);

    for (let i = 0; i < level.length; i++) {
        if (level[i] === '0') {
            columnLength++;
        }
        else if (level[i] === '1') {
            columnLength++;
        }
        else if (level[i] === '\n') {
            largestColumntLength = Math.max(largestColumntLength, columnLength);
            columnLength = 0;
            rowLength++;
        }
        else {
            error = 1;
            solution[0] = largestColumntLength;
            solution[1] = rowLength;
            solution[2] = error;
            return solution;
        }
    }

    solution[0] = largestColumntLength;
    solution[1] = rowLength;
    solution[2] = error;

    return solution;
}

function addCellClassToClassList() {
    // goes throug the columns
    for (let i = 0; i < cells.length; i++) {
        // goes through the rows
        for (let j = 0; j < cells[i].length; j++) {
            let cellDiv = document.getElementById("cell " + "Col: " + i.toString() + " Row: " + j.toString());
            let cellState = cells[i][j];

            // add new class to class list
            switch (cellState) {
                case CellStates.NeverLived:
                    cellDiv.classList.add("neverLivedCell");
                    break;
                case CellStates.Alive:
                    cellDiv.classList.add("aliveCell");
                    break;
                case CellStates.Dead:
                    cellDiv.classList.add("deadCell");
                    break;
            }
        }
    }
}