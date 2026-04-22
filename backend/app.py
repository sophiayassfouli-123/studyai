import os, json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI
import fitz

load_dotenv()

app = Flask(__name__)
CORS(app)

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.environ["HF_TOKEN"],
)

def build_prompt(text: str) -> str:
    return f"""Tu es un assistant pédagogique. Réponds UNIQUEMENT avec un objet JSON valide, rien d'autre. Pas de markdown, pas de backtick, pas de texte avant ou après.

Retourne EXACTEMENT cette structure JSON complète :
{{"summary":["phrase clé 1","phrase clé 2","phrase clé 3"],"quiz":[{{"question":"Question 1 ?","options":["A. ...","B. ...","C. ...","D. ..."],"correct":0}},{{"question":"Question 2 ?","options":["A. ...","B. ...","C. ...","D. ..."],"correct":1}},{{"question":"Question 3 ?","options":["A. ...","B. ...","C. ...","D. ..."],"correct":2}}]}}

Règles STRICTES :
- summary : EXACTEMENT 3 phrases courtes en français
- quiz : EXACTEMENT 3 questions QCM avec 4 options chacune
- correct : index entier (0, 1, 2 ou 3) de la bonne réponse
- Le JSON doit être COMPLET et fermé correctement

TEXTE : {text[:2000]}"""

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    text = data.get('text', '')
    if not text.strip():
        return jsonify({'error': 'Texte vide'}), 400
    try:
        completion = client.chat.completions.create(
            model="mistralai/Mistral-7B-Instruct-v0.2:featherless-ai",
            messages=[{"role": "user", "content": build_prompt(text)}],
            max_tokens=1500,
            temperature=0.3,
        )
        raw = completion.choices[0].message.content
        start = raw.index('{')
        depth = 0
        end = start
        for i, ch in enumerate(raw[start:], start):
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
            if depth == 0:
                end = i + 1
                break
        result = json.loads(raw[start:end])
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'Aucun fichier'}), 400
    file = request.files['file']
    filename = file.filename
    text = ''
    if filename.endswith('.txt'):
        text = file.read().decode('utf-8', errors='ignore')
    elif filename.endswith('.pdf'):
        pdf_bytes = file.read()
        doc = fitz.open(stream=pdf_bytes, filetype='pdf')
        for page in doc:
            text += page.get_text()
        doc.close()
    else:
        return jsonify({'error': 'Format non supporté'}), 400
    if not text.strip():
        return jsonify({'error': "Impossible d'extraire le texte"}), 400
    return jsonify({'text': text[:5000]})

if __name__ == '__main__':
    app.run(debug=True, port=5000)