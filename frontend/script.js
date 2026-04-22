const API_URL = 'http://localhost:5000/analyze';
let extractedText = '';

function updateCount() {
  const text = document.getElementById('courseText').value;
  document.getElementById('charCount').textContent = text.length + ' / 3000 caractères';
}

async function analyzeText() {
  const textareaText = document.getElementById('courseText').value.trim();
  const text = textareaText || extractedText;
  if (!text) { alert('Colle un texte ou charge un fichier d\'abord !'); return; }

  const btn = document.getElementById('analyzeBtn');
  btn.textContent = '⏳ Analyse en cours...';
  btn.disabled = true;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    displaySummary(data.summary);
    displayQuiz(data.quiz);
    document.getElementById('resultsGrid').style.display = 'grid';
  } catch (err) {
    alert('Erreur connexion backend : ' + err.message);
  } finally {
    btn.textContent = '✦ Analyser avec l\'IA';
    btn.disabled = false;
  }
}

function displaySummary(points) {
  const list = document.getElementById('summaryList');
  list.innerHTML = '';
  points.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p;
    list.appendChild(li);
  });
}

function displayQuiz(questions) {
  const container = document.getElementById('quizContainer');
  container.innerHTML = '';
  questions.forEach((q, i) => {
    const div = document.createElement('div');
    div.className = 'question';
    div.dataset.correct = q.correct;
    div.innerHTML = `<p>Q${i + 1}. ${q.question}</p>`;
    q.options.forEach((opt, j) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.dataset.index = j;
      btn.onclick = () => selectOption(btn, div);
      div.appendChild(btn);
    });
    container.appendChild(div);
  });
}

function selectOption(btn, questionDiv) {
  questionDiv.querySelectorAll('.option-btn').forEach(b => {
    b.classList.remove('selected');
    b.style.fontWeight = 'normal';
  });
  btn.classList.add('selected');
  btn.style.fontWeight = 'bold';
}

function checkAnswers() {
  document.querySelectorAll('.question').forEach(q => {
    const correct = parseInt(q.dataset.correct);
    const selected = q.querySelector('.selected');
    if (!selected) return;
    const chosen = parseInt(selected.dataset.index);
    selected.classList.add(chosen === correct ? 'correct' : 'wrong');
    if (chosen !== correct) {
      q.querySelectorAll('.option-btn')[correct].classList.add('correct');
    }
  });
}

async function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const btn = document.getElementById('analyzeBtn');

  if (file.name.endsWith('.txt')) {
    const reader = new FileReader();
    reader.onload = e => {
      extractedText = e.target.result;
      document.getElementById('courseText').value = extractedText;
      updateCount();
    };
    reader.readAsText(file);

  } else if (file.name.endsWith('.pdf')) {
    btn.textContent = '⏳ Extraction PDF...';
    btn.disabled = true;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.text) {
        extractedText = data.text;
        document.getElementById('courseText').value = extractedText;
        updateCount();
      } else {
        alert('Erreur extraction PDF : ' + data.error);
      }
    } catch (err) {
      alert('Erreur connexion backend : ' + err.message);
    } finally {
      btn.textContent = '✦ Analyser avec l\'IA';
      btn.disabled = false;
    }
  }
}