const empresas = {};
const colores = ["#ff6384", "#36a2eb", "#4bc0c0", "#9966ff", "#ff9f40"];
let colorIndex = 0;
let inversionista = ""; // guardaremos el nombre aquí

const ctx = document.getElementById("grafico").getContext("2d");
const chart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: [],
    datasets: []
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Comparación de rendimientos (modelo saturación proporcional)",
        color: "#fff"
      },
      legend: {
        labels: { color: "#fff" }
      }
    },
    scales: {
      x: { ticks: { color: "#fff" } },
      y: { beginAtZero: true, ticks: { color: "#fff" } }
    }
  }
});

// Nueva fórmula: saturación proporcional al capital
// G(t) = I * rMax * (1 - e^(-k t))
function calcularRendimiento(t, capital, dinero, rMax = 0.4, k = 0.2) {
  const I = capital + dinero; // inversión total
  return I * rMax * (1 - Math.exp(-k * t));
}

document.getElementById("inversionForm").addEventListener("submit", (e) => {
  e.preventDefault();

  inversionista = document.getElementById("inversionista").value.trim();

  const empresa = document.getElementById("empresa").value.trim();
  const dinero = parseFloat(document.getElementById("dinero").value);
  const capital = parseFloat(document.getElementById("capital").value);
  const tiempo = parseInt(document.getElementById("tiempo").value);

  if (!empresa) return;

  const rendimiento = calcularRendimiento(tiempo, capital, dinero);

  // Si la empresa ya existe, preguntar confirmación
  if (empresas[empresa]) {
    const confirmar = confirm(`¿Seguro que lo deseas? Modificarás los datos de la empresa ${empresa}`);
    if (!confirmar) return;

    const fecha = new Date().toLocaleString();
    empresas[empresa].anterior = {
      rendimiento: empresas[empresa].rendimiento,
      fecha: fecha
    };

    empresas[empresa].dinero = dinero;
    empresas[empresa].capital = capital;
    empresas[empresa].tiempo = tiempo;
    empresas[empresa].rendimiento = rendimiento;

  } else {
    const color = colores[colorIndex % colores.length];
    colorIndex++;
    empresas[empresa] = {
      color,
      dinero,
      capital,
      tiempo,
      rendimiento,
      anterior: null
    };
  }

  actualizarGrafica();
  actualizarTabla();
  actualizarConclusiones();
});

function actualizarGrafica() {
  chart.data.labels = Object.keys(empresas);
  chart.data.datasets = [];

  Object.keys(empresas).forEach(nombre => {
    const e = empresas[nombre];

    chart.data.datasets.push({
      label: `${nombre} (actual)`,
      data: [e.rendimiento],
      backgroundColor: e.color
    });

    if (e.anterior) {
      chart.data.datasets.push({
        label: `${nombre} (anterior - ${e.anterior.fecha})`,
        data: [e.anterior.rendimiento],
        backgroundColor: hexToRgba(e.color, 0.4)
      });
    }
  });

  chart.update();
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function actualizarTabla() {
  const tbody = document.querySelector("#tablaResultados tbody");
  tbody.innerHTML = "";

  Object.keys(empresas).forEach(nombre => {
    const e = empresas[nombre];
    const fila = `
      <tr>
        <td>${nombre}</td>
        <td>$${e.dinero.toFixed(2)}</td>
        <td>$${e.capital.toFixed(2)}</td>
        <td>${e.tiempo}</td>
        <td>$${e.rendimiento.toFixed(2)}</td>
      </tr>
    `;
    tbody.innerHTML += fila;
  });
}

function actualizarConclusiones() {
  const div = document.getElementById("listaConclusiones");
  div.innerHTML = "";

  Object.keys(empresas).forEach(nombre => {
    const e = empresas[nombre];
    const inversionTotal = e.capital + e.dinero;
    let conclusion;

    if (e.rendimiento > inversionTotal) {
      conclusion = `${inversionista}, la empresa ${nombre} es rentable porque su rendimiento ($${e.rendimiento.toFixed(2)}) supera la inversión total ($${inversionTotal.toFixed(2)}).`;
    } else {
      conclusion = `${inversionista}, la empresa ${nombre} no conviene porque su rendimiento ($${e.rendimiento.toFixed(2)}) es menor que la inversión total ($${inversionTotal.toFixed(2)}).`;
    }

    const p = document.createElement("p");
    p.textContent = conclusion;
    div.appendChild(p);
  });
}
