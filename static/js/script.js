// URL del servidor Flask
const serverUrl = 'https://ya-d4p3.onrender.com'; // Cambia esta URL por la URL de tu API desplegada


// Obtener la lista de documentos .ipynb
fetch(`${serverUrl}/documentos`)
    .then(response => response.json())
    .then(archivos => {
        if (Array.isArray(archivos)) {
            archivos.forEach(nombre => {
                const link = document.createElement('button');
                link.textContent = nombre;
                link.onclick = () => cargarContenido(nombre);
                document.body.appendChild(link);
            });
        } else {
            console.error(archivos.mensaje || "Error al obtener los documentos");
        }
    })
    .catch(err => console.error('Error al obtener los documentos:', err));

// Cargar el contenido de un archivo .ipynb
function cargarContenido(nombre) {
    fetch(`${serverUrl}/documentos/contenido/${nombre}`)
        .then(response => response.json())
        .then(contenido => {
            // Limpiar el área de visualización
            const displayArea = document.getElementById('notebookContent');
            displayArea.innerHTML = '';

            contenido.forEach(celda => {
                if (celda.tipo === 'texto') {
                    const markdown = document.createElement('div');
                    markdown.innerHTML = celda.contenido; // Renderizar el Markdown (puedes usar una librería como Showdown si quieres mejor formato)
                    displayArea.appendChild(markdown);
                } else if (celda.tipo === 'código') {
                    const codeBlock = document.createElement('pre');
                    codeBlock.textContent = celda.contenido;
                    displayArea.appendChild(codeBlock);

                    celda.salidas.forEach(salida => {
                        if (salida.tipo === 'texto') {
                            const outputText = document.createElement('pre');
                            outputText.textContent = salida.contenido;
                            displayArea.appendChild(outputText);
                        } else if (salida.tipo === 'imagen') {
                            const img = document.createElement('img');
                            img.src = `data:image/png;base64,${salida.contenido}`; // Decodificar base64 y mostrar imagen
                            img.style.maxWidth = '100%'; // Ajustar tamaño de la imagen
                            displayArea.appendChild(img);
                        }
                    });
                }
            });
        })
        .catch(err => console.error('Error al cargar el contenido:', err));
}
