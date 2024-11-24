const API_BASE_URL_ESTUDIANTES =
  "http://localhost:8000/api/app/estudiante";

document
  .getElementById("addStudentForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const cod = document.getElementById("cod").value;
    const nombres = document.getElementById("nombres").value;
    const email = document.getElementById("email").value;


    fetch(API_BASE_URL_ESTUDIANTES, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cod, nombres, email }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.status === 201) {
          alert("Estudiante agregado correctamente");
          this.reset();
          loadStudents();
        } else {
          console.error(data);
          alert(data.message || "Error al agregar el estudiante");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error de conexión al servidor");
      });
  });

  function loadStudents() {
fetch(API_BASE_URL_ESTUDIANTES, {
method: "GET",
headers: {
"Content-Type": "application/json",
},
})
.then((response) => response.json())
.then((data) => {
const studentsTableBody = document.querySelector("#studentsTable tbody");
studentsTableBody.innerHTML = "";

if (Array.isArray(data) && data.length === 0) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = 6;
  cell.textContent = "No hay estudiantes registrados";
  row.appendChild(cell);
  studentsTableBody.appendChild(row);
  return;
}

let aprobados = 0;
let reprobados = 0;
let sinNotas = 0;
let allNotes = [];

const promises = data.map((student) =>
  fetch(`${API_BASE_URL_NOTAS}?codEstudiante=${student.cod}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((notes) => {
      if (!Array.isArray(notes)) {
        console.error(`Notas inválidas para estudiante ${student.cod}:`, notes);
        notes = [];
      }

      let totalNotes = 0;
      let validNotes = 0;

      notes.forEach((note) => {
        const currentNote = parseFloat(note.nota);
        if (!isNaN(currentNote)) {
          totalNotes += currentNote;
          validNotes++;
          allNotes.push(currentNote);
        }
      });

      let averageNote = 0;
      if (validNotes > 0) {
        averageNote = totalNotes / validNotes;
      }

      let state = "Reprobado";
      let definitiveNote = "Sin notas";
      if (validNotes === 0) {
        state = "Sin notas";
        sinNotas++;
      } else if (averageNote >= 3.0) {
        state = "Aprobado";
        definitiveNote = averageNote.toFixed(2);
        aprobados++;
      } else {
        definitiveNote = averageNote.toFixed(2);
        reprobados++;
      }

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${student.cod}</td>
        <td>${student.nombres}</td>
        <td>${student.email}</td>
        <td>${definitiveNote}</td>
        <td>${state}</td>
        <td>
          <button onclick="deleteStudent('${student.cod}')">Eliminar</button>
          <button onclick="updateStudent('${student.cod}')">Actualizar</button>
        </td>
      `;
      studentsTableBody.appendChild(row);
    })
);

Promise.all(promises)
  .then(() => {
    document.getElementById("aprobados").textContent = `Estudiantes Aprobados: ${aprobados}`;
    document.getElementById("reprobados").textContent = `Estudiantes Reprobados: ${reprobados}`;
    document.getElementById("sinNotas").textContent = `Estudiantes Sin Notas: ${sinNotas}`;
    if (allNotes.length > 0) {
      const average = (allNotes.reduce((acc, note) => acc + note, 0) / allNotes.length).toFixed(2);
      const highestNote = Math.max(...allNotes).toFixed(2);
      const lowestNote = Math.min(...allNotes).toFixed(2);

      document.getElementById("averageNote").textContent = `Promedio General: ${average}`;
      document.getElementById("highestNote").textContent = `Nota Más Alta: ${highestNote}`;
      document.getElementById("lowestNote").textContent = `Nota Más Baja: ${lowestNote}`;
    } else {
      document.getElementById("averageNote").textContent = `Promedio General: -`;
      document.getElementById("highestNote").textContent = `Nota Más Alta: -`;
      document.getElementById("lowestNote").textContent = `Nota Más Baja: -`;
    }
  })
  .catch((error) => {
    console.error("Error al cargar las notas:", error);
    alert("Error al procesar las notas de los estudiantes");
  });
})
.catch((error) => {
console.error("Error:", error);
alert("Error al cargar los estudiantes");
});
}


function updateStudent(cod) {
const nombres = prompt("Ingrese el nuevo nombre:");
const email = prompt("Ingrese el nuevo email:");

if (!nombres || !email) {
alert("Todos los campos son obligatorios.");
return;
}

fetch(`${API_BASE_URL_ESTUDIANTES}/${cod}`, {
method: "PUT",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({ nombres, email }),
})
.then((response) => response.json())
.then((data) => {
if (data.status === 200) {
  alert("Estudiante actualizado correctamente.");
  loadStudents();
} else {
  console.error(data);
  alert(data.message || "Error al actualizar el estudiante.");
}
})
.catch((error) => {
console.error("Error:", error);
alert("Error de conexión al servidor.");
});
}

function deleteStudent(cod) {
if (!confirm("¿Estás seguro de eliminar al estudiante?")) return;

fetch(`${API_BASE_URL_ESTUDIANTES}/${cod}`, {
method: "DELETE",
headers: {
"Content-Type": "application/json",
},
})
.then((response) => response.json())
.then((data) => {
if (data.status === 200) {
  alert(data.mensaje || "Estudiante eliminado correctamente");
  loadStudents();
} else if (data.status === 400) {
  alert(data.mensaje || "No se puede eliminar el estudiante");
} else {
  console.error(data);
  alert(data.mensaje || "Error al eliminar el estudiante");
}
})
.catch((error) => {
console.error("Error:", error);
alert("Error de conexión al servidor");
});
}

window.onload = loadStudents;
const API_BASE_URL_NOTAS = "http://localhost:8000/api/app/nota";

document.getElementById("addNoteForm").addEventListener("submit", function (e) {
e.preventDefault();

const codEstudiante = document.getElementById("codEstudiante").value;
const actividad = document.getElementById("actividad").value;
const nota = parseFloat(document.getElementById("nota").value);
if (isNaN(nota) || nota <= 0 || nota > 5) {
alert("La nota debe ser un número válido entre 0 y 5.");
return;
}


fetch(API_BASE_URL_NOTAS, {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({ codEstudiante, actividad, nota }),
})
.then((response) => response.json())
.then((data) => {
if (data.status === 201) {
  alert("Nota agregada correctamente");
  this.reset();
  loadNotes();
} else {
  console.error(data.errors);
  alert(data.message || "El estudiante no existe o ya tiene 2 notas");
}
})
.catch((error) => {
console.error("Error:", error);
alert("Error de conexión al servidor");
});
});


function loadNotes() {
fetch(API_BASE_URL_NOTAS, {
  method: "GET",
  headers: {
      "Content-Type": "application/json",
  },
})
  .then((response) => response.json())
  .then((data) => {
      const notesTableBody = document.querySelector("#notesTable tbody");
      notesTableBody.innerHTML = "";

      if (!Array.isArray(data) || data.length === 0) {
          const row = document.createElement("tr");
          const cell = document.createElement("td");
          cell.colSpan = 5;
          cell.textContent = "No hay notas registradas";
          row.appendChild(cell);
          notesTableBody.appendChild(row);
          return;
      }

      data.forEach((note) => {
          const currentNote = parseFloat(note.nota);
          let noteClass = "";

          if (currentNote >= 0 && currentNote <= 2) {
              noteClass = "note-red-strong";
          } else if (currentNote > 2 && currentNote < 3) {
              noteClass = "note-red";
          } else if (currentNote >= 3 && currentNote < 4) {
              noteClass = "note-yellow";
          } else if (currentNote >= 4 && currentNote < 5) {
              noteClass = "note-light-green";
          } else if (currentNote === 5) {
              noteClass = "note-green-strong";
          }

          const row = document.createElement("tr");
          row.classList.add(noteClass);
          row.innerHTML = `
              <td>${note.id}</td>
              <td>${note.codEstudiante}</td>
              <td>${note.actividad}</td>
              <td>${note.nota}</td>
              <td>
                  <button onclick="deleteNote(${note.id})">Eliminar</button>
                  <button onclick="updateNote(${note.id}, ${note.nota})">Modificar</button>
              </td>
          `;
          notesTableBody.appendChild(row);
      });
  })
  .catch((error) => {
      console.error("Error al cargar las notas:", error);
      alert("Error al cargar las notas");
  });
}

document.querySelector("#studentsTable tbody").addEventListener("mouseover", (event) => {
const targetRow = event.target.closest("tr");
if (targetRow) {
  const codEstudiante = targetRow.querySelector("td:first-child").textContent;
  const rows = document.querySelectorAll("#notesTable tbody tr");

  rows.forEach((row) => {
      const noteCod = row.querySelector("td:nth-child(2)").textContent;
      if (noteCod === codEstudiante) {
          row.style.backgroundColor = "yellow";
      }
  });
}
});

document.querySelector("#studentsTable tbody").addEventListener("mouseout", (event) => {
const rows = document.querySelectorAll("#notesTable tbody tr");
rows.forEach((row) => {
  row.style.backgroundColor = "";
});
});

function updateNote(id) {
  const actividad = prompt("Ingrese la nueva actividad:");
  const nota = prompt("Ingrese la nueva nota:");


  if (isNaN(nota) || nota <= 0 || nota > 5) {
    alert("La nota debe ser un número válido entre 0 y 5.");
    return;
  }

  if (!actividad || !nota) {
    alert("La actividad y la nota son obligatorias.");
    return;
  }

  fetch(`${API_BASE_URL_NOTAS}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({actividad, nota}),
  })
  .then((response) => response.json())
  .then((data) => {
    if (data.status === 200) {
      alert("Nota y actividad actualizadas correctamente.");
      loadNotes();
      loadStudents();
      window.location.reload();
    } else {
      console.error(data);
      alert(data.message || "Error al actualizar la nota.");
    }
  })
  .catch((error) => {
    console.error("Error:", error);
    alert("Error de conexión al servidor.");
  });
}


function deleteNote(id) {
  if (!confirm("¿Estás seguro de que deseas eliminar esta nota? Esta acción no se puede deshacer.")) return;


fetch(`${API_BASE_URL_NOTAS}/${id}`, {
method: "DELETE",
headers: {
"Content-Type": "application/json",
},
})
.then((response) => response.json())
.then((data) => {
if (data.status === 200) {
  alert("Nota eliminada correctamente");
  loadNotes();
} else {
  console.error(data);
  alert(data.message || "Error al eliminar la nota");
}
})
.catch((error) => {
console.error("Error:", error);
alert("Error de conexión al servidor");
});

}
window.onload = () => {
      loadStudents();
      loadNotes();
    }