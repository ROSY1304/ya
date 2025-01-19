// Función que se ejecuta cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    fetchNotebooksList();
});

// Función para obtener la lista de notebooks desde la API
function fetchNotebooksList() {
    fetch('https://depopperrrr.onrender.com/documentos')
        .then(response => response.json())
        .then(data => {
            const notebooksList = document.getElementById('notebooks-list');
            notebooksList.innerHTML = ''; // Limpiar la lista antes de agregar los items

            if (data.length === 0) {
                notebooksList.innerHTML = '<li>No se encontraron archivos .ipynb</li>';
                return;
            }

            // Agregar cada archivo a la lista
            data.forEach(notebook => {
                const li = document.createElement('li');
                li.textContent = notebook;
                li.onclick = () => fetchNotebookContent(notebook);
                notebooksList.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error al obtener la lista de notebooks:', error);
        });
}

// Función para obtener el contenido de un notebook
function fetchNotebookContent(notebookName) {
    fetch(`https://depopperrrr.onrender.com/documentos/contenido/${notebookName}`)
        .then(response => response.json())
        .then(data => {
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML = ''; // Limpiar contenido previo

            // Mostrar el contenido de las celdas
            data.forEach(cell => {
                const cellDiv = document.createElement('div');
                if (cell.tipo === 'código') {
                    cellDiv.innerHTML = `
                        <strong>Celda de Código:</strong>
                        <pre>${cell.contenido}</pre>
                    `;

                    // Mostrar las salidas
                    cell.salidas.forEach(salida => {
                        if (salida.tipo === 'texto') {
                            cellDiv.innerHTML += `
                                <strong>Salida (Texto):</strong>
                                <pre>${salida.contenido}</pre>
                            `;
                        } else if (salida.tipo === 'imagen') {
                            cellDiv.innerHTML += `
                                <strong>Salida (Imagen):</strong>
                                <img src="data:image/png;base64,${salida.contenido}" alt="Imagen de salida"/>
                            `;
                        } else if (salida.tipo === 'json') {
                            cellDiv.innerHTML += `
                                <strong>Salida (JSON):</strong>
                                <pre>${JSON.stringify(salida.contenido, null, 2)}</pre>
                            `;
                        } else if (salida.tipo === 'html') {
                            cellDiv.innerHTML += `
                                <strong>Salida (HTML):</strong>
                                <div>${salida.contenido}</div>
                            `;
                        }
                    });
                } else if (cell.tipo === 'texto') {
                    cellDiv.innerHTML = `
                        <strong>Celda de Markdown:</strong>
                        <pre>${cell.contenido}</pre>
                    `;
                }
                contentDiv.appendChild(cellDiv);
            });
        })
        .catch(error => {
            console.error('Error al obtener el contenido del notebook:', error);
        });
}
