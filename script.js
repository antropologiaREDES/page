//#region CANVAS
class Context {
    constructor() {
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;
    
        this.canvas.width = this.canvas.clientWidth * dpr;
        this.canvas.height = this.canvas.clientHeight * dpr;
    
        this.ctx.scale(dpr, dpr);
    
        this.size = { width: this.canvas.clientWidth, height: this.canvas.clientHeight };
        this.mouseposition = { x: 0, y: 0 };
        
        document.addEventListener("mousemove", (ev) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseposition.x = ev.clientX - rect.left;
            this.mouseposition.y = ev.clientY - rect.top;
        });
        window.addEventListener('resize', () => {
            this.size = { 
                width: this.canvas.clientWidth, 
                height: this.canvas.clientHeight 
            };
       });
    }
    drawLine(pointA, pointB, width, color) {
        this.ctx.beginPath();
            this.ctx.moveTo(pointA.x, pointA.y);
            this.ctx.lineTo(pointB.x, pointB.y);
            this.ctx.lineWidth = width;
            this.ctx.strokeStyle = color;
        this.ctx.stroke();
    }
    drawCircle(center, radius, color) {
        this.ctx.beginPath();
            this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2, true);
            this.ctx.fillStyle = color;
        this.ctx.fill();
    }
    drawRectangle(pos, size, color) {
        this.ctx.beginPath();
            this.ctx.rect(pos.x, pos.y, size.width, size.height);
            this.ctx.fillStyle = color;
        this.ctx.fill();
    }
}

const ctx = new Context();

let PointsFlatArray = [0, 0, 0, 0, 0];
let PointsCount = 0;

function distanceSquared(pointA, pointB) {
    const dx = (pointB.x - pointA.x) ** 2;
    const dy = (pointB.y - pointA.y) ** 2;
    return dx + dy;
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function addPoint(x, y) {
    const size = randomRange(1, 3);
    const speed = randomRange(0.075, 1.5);
    const direction = randomRange(0, Math.PI * 2);
    PointsFlatArray.push(x, y, size, speed, direction);
    PointsCount++;
}

function GetNewPositions(flatArray) {
    for (let i = 0; i < PointsCount; i++) {
        if (
            flatArray[i*5] < -5 || flatArray[i*5] > ctx.size.width + 5 || 
            flatArray[(i*5)+1] < -5 || flatArray[(i*5)+1] > ctx.size.height + 5
        ) {
            switch (Math.floor(Math.random() * 4)) {
                case 0: 
                    flatArray[i*5] = 0;
                    flatArray[(i*5)+1] = randomRange(0, ctx.size.height);
                    break;
                case 1: 
                    flatArray[i*5] = ctx.size.width;
                    flatArray[(i*5)+1] = randomRange(0, ctx.size.height);
                    break;
                case 2: 
                    flatArray[i*5] = randomRange(0, ctx.size.width);
                    flatArray[(i*5)+1] = 0;
                    break;
                case 3: 
                    flatArray[i*5] = randomRange(0, ctx.size.width);
                    flatArray[(i*5)+1] = ctx.size.height;
                    break;
            }
            flatArray[(i*5)+2] = randomRange(1, 3);
            flatArray[(i*5)+3] = randomRange(0.075, 1.5);
            flatArray[(i*5)+4] = randomRange(0, Math.PI * 2);
        }

        flatArray[i*5] = flatArray[i*5] + Math.cos(flatArray[(i*5)+4]) * flatArray[(i*5)+3];
        flatArray[(i*5)+1] = flatArray[(i*5)+1] + Math.sin(flatArray[(i*5)+4]) * flatArray[(i*5)+3];

    }
    
    return flatArray;
}

//#endregion

//#region DRAW

function init() {
    const count = (window.innerHeight > window.innerWidth) ? 50 : 125;
    for (let i = 0; i < count; i++) {
        addPoint(randomRange(0, ctx.size.width), randomRange(0, ctx.size.height));
    }

    requestAnimationFrame(draw);
}

function draw() {
    PointsFlatArray = GetNewPositions(PointsFlatArray);

    ctx.drawRectangle({ x: 0, y: 0 }, ctx.size, "#fff");

    PointsFlatArray[0] = ctx.mouseposition.x;
    PointsFlatArray[1] = ctx.mouseposition.y;

    const pointA = {x: 0, y: 0}; 
    const pointB = {x: 0, y: 0};

    const maxDistance = 150**2;
    const maxLineWidth = 2.5;
    const minLineWidth = 0.1;
    let distance = 0;

    for (let i = 0; i < PointsCount; i++) {
        pointA.x = PointsFlatArray[i*5];
        pointA.y = PointsFlatArray[(i*5)+1];

        for (let j = 0; j < PointsCount; j++) {
            if (i == j) { continue; }
            
            pointB.x = PointsFlatArray[j*5];
            pointB.y = PointsFlatArray[(j*5)+1];

            distance = distanceSquared(pointA, pointB);

            if (distance < maxDistance) {
              ctx.drawLine(
                pointA, pointB, 
                Math.max(minLineWidth, maxLineWidth - (distance / maxDistance) * (maxLineWidth - minLineWidth)), 
                "#18489777"
            );
            }
        }
    }

    for (let i = 1; i < PointsCount; i++) {
        ctx.drawCircle(
            { 
                x: PointsFlatArray[i*5], 
                y: PointsFlatArray[(i*5)+1] 
            }, 
            PointsFlatArray[(i*5)+2], 
            "#2d58a4"
        );
    }

    requestAnimationFrame(draw);
}

init();

//#endregion

//#region CHART
google.charts.load('current', {'packages': ['gantt']});
google.charts.setOnLoadCallback(drawChart);

function daysToMilliseconds(days) {
    return days * 24 * 60 * 60 * 1000;
}

function checkNull(value, defaultValue = null) {
    return (value === undefined || value === null || value === "") ? defaultValue : value;
}

async function drawChart() {
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'ID Tarea');
    dataTable.addColumn('string', 'Nombre Tarea');
    dataTable.addColumn('string', 'Recurso');
    dataTable.addColumn('date', 'Fecha Inicio');
    dataTable.addColumn('date', 'Fecha Fin');
    dataTable.addColumn('number', 'Duración');
    dataTable.addColumn('number', 'Porcentaje Completado');
    dataTable.addColumn('string', 'Dependencias');

    await fetch("route.json")
        .then((resp) => resp.json())
        .then((data) => {
            const tasks = [];
            for (let i = 0; i < data.length; i++) {
            tasks.push([
                    data[i].id, data[i].title,
                    checkNull(data[i].category),
                    new Date(data[i].start[0], data[i].start[1], data[i].start[2]),
                    new Date(data[i].end[0], data[i].end[1], data[i].end[2]),
                    data[i].percentage,
                    daysToMilliseconds(data[i].duration),
                    checkNull(data[i].dependencies)
                ]);
            }
            dataTable.addRows(tasks);
        });

    var options = {
        height: 500,
    };

    var chart = new google.visualization.Gantt(document.getElementById("chart"));

    chart.draw(dataTable, options);

    document.getElementById("crono-area").style.display = "none";
}

//#endregion

//#region SECTIONS

const navbarbtnList = document.getElementsByClassName("navbar-btn");
let currentPage = "about-area";

Array.from(navbarbtnList)
    .forEach((item) => item.addEventListener("click", (ev) => handleClick(ev)));

function handleClick(ev) {
    const newPage = ev.target.value;
    document.getElementById(currentPage).style.display = "none";
    document.getElementById(newPage).style.display = "flex";
    currentPage = newPage;
}

//#endregion