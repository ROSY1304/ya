from flask import Flask, jsonify, request, send_from_directory, render_template, send_file, make_response
import os
import nbformat
import base64
from flask_cors import CORS
from io import BytesIO

app = Flask(__name__, static_folder='static')
CORS(app)

# Directorio donde están los documentos .ipynb
DOCUMENTS_FOLDER = 'documentos'
IMAGES_FOLDER = os.path.join('static', 'images')  # Carpeta para las imágenes
app.config['DOCUMENTS_FOLDER'] = DOCUMENTS_FOLDER
app.config['IMAGES_FOLDER'] = IMAGES_FOLDER

@app.route('/')
def home():
    return send_from_directory('static', 'index.html')

@app.route('/documentos', methods=['GET'])
def obtener_documentos():
    try:
        archivos = [f for f in os.listdir(DOCUMENTS_FOLDER) if f.endswith('.ipynb')]
        if not archivos:
            return jsonify({"mensaje": "No hay archivos .ipynb en el directorio."}), 404
        return jsonify(archivos), 200
    except FileNotFoundError:
        return jsonify({"mensaje": "No se encontró el directorio de documentos"}), 404

@app.route('/documentos/contenido/<nombre>', methods=['GET'])
def ver_contenido_documento(nombre):
    try:
        notebook_path = os.path.join(DOCUMENTS_FOLDER, nombre)
        if os.path.exists(notebook_path) and nombre.endswith('.ipynb'):
            with open(notebook_path, 'r', encoding='utf-8') as f:
                notebook_content = nbformat.read(f, as_version=4)

            contenido = []
            for i, cell in enumerate(notebook_content.cells):
                if cell.cell_type == 'code':
                    cell_data = {
                        'tipo': 'código',
                        'contenido': cell.source,
                        'salidas': []
                    }

                    for output in cell.outputs:
                        if 'text' in output:
                            cell_data['salidas'].append({
                                'tipo': 'texto',
                                'contenido': output['text']
                            })
                        elif 'data' in output:
                            if 'image/png' in output['data']:
                                image_data = output['data']['image/png']
                                image_id = f"image_{nombre}_{i}.png"
                                cell_data['salidas'].append({
                                    'tipo': 'imagen',
                                    'contenido': f'/documentos/imagen/{image_id}'
                                })
                            elif 'application/json' in output['data']:
                                cell_data['salidas'].append({
                                    'tipo': 'json',
                                    'contenido': output['data']['application/json']
                                })
                            elif 'text/html' in output['data']:
                                cell_data['salidas'].append({
                                    'tipo': 'html',
                                    'contenido': output['data']['text/html']
                                })
                    contenido.append(cell_data)
                elif cell.cell_type == 'markdown':
                    contenido.append({
                        'tipo': 'texto',
                        'contenido': cell.source
                    })

            return jsonify(contenido), 200
        else:
            return jsonify({'mensaje': 'Archivo no encontrado o formato incorrecto'}), 404
    except Exception as e:
        return jsonify({'mensaje': str(e)}), 500

@app.route('/documentos/imagen/<image_id>', methods=['GET'])
def obtener_imagen(image_id):
    try:
        _, nombre, indice = image_id.split('_')
        notebook_path = os.path.join(DOCUMENTS_FOLDER, f"{nombre}.ipynb")
        
        if os.path.exists(notebook_path):
            with open(notebook_path, 'r', encoding='utf-8') as f:
                notebook_content = nbformat.read(f, as_version=4)
                cell = notebook_content.cells[int(indice)]
                
                for output in cell.outputs:
                    if 'image/png' in output['data']:
                        image_data = output['data']['image/png']
                        image_bytes = base64.b64decode(image_data)
                        return make_response(send_file(BytesIO(image_bytes), mimetype='image/png'))
        
        return jsonify({'mensaje': 'Imagen no encontrada'}), 404
    except Exception as e:
        return jsonify({'mensaje': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
