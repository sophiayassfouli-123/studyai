# 🧠 StudyAI — Transformateur de Cours Intelligent

Projet réalisé lors de l'atelier EIC — ENSAK Informatic Club · 22/04/2026

## Description
StudyAI est une plateforme web intelligente qui transforme n'importe quel texte de cours en un résumé de 3 idées clés + un quiz QCM interactif en moins de 5 secondes.

## Fonctionnalités
- Résumé automatique en 3 points clés
- Quiz QCM interactif avec validation couleur (vert/rouge)
- Upload de fichiers .txt et .pdf
- Interface moderne violet/bleu professionnelle
- Powered by Mistral-7B via Hugging Face

## Technologies
- Frontend : HTML5 / CSS3 / JavaScript
- Backend : Python + Flask
- IA : Hugging Face API + Mistral-7B-Instruct
- Versionning : Git + GitHub

## Installation

### Backend
cd backend
pip install -r requirements.txt
Créer le fichier .env avec : HF_TOKEN=hf_...
python app.py

### Frontend
cd frontend
python -m http.server 8080
Ouvrir Chrome sur http://localhost:8080

## Équipe
- Membre 1 (Frontend)
- Membre 2 (Backend)
- Membre 3 (Intégration)

## EIC — ENSAK Informatic Club