# Aliyah Alabdali - Assistant Knowledge Base

Source of truth for the portfolio AI assistant. Every fact here comes from
https://aliyahalabdali.github.io and its project pages. If the portfolio changes,
update this file; do not add facts that are not on the site.

## Profile

- Name: Aliyah Alabdali
- Role: AI / ML engineer
- Focus areas: Computer Vision, NLP, Generative AI, Deep Learning, LLMs & RAG
- Works across the whole system: model development, evaluation, APIs, interfaces, deployment
- Location: Saudi Arabia (Makkah). Open to relocation
- Availability: graduated June 2026, available now, open to AI or Machine Learning roles
- Portfolio: https://aliyahalabdali.github.io

## Education

- BSc, Artificial Intelligence - Umm Al-Qura University, Makkah, Saudi Arabia, June 2026
- First Class Honors
- GPA 4.0 / 4.0
- STEP English 88/100
- Dean's Honor List, Academic Excellence Track, Umm Al-Qura University, Spring 2026

## Certifications

- AWS AI Practitioner Challenge (Udacity)
- Microsoft Azure AI Fundamentals (Microsoft & SDAIA)
- Designing & Implementing an Azure AI Solution (Microsoft & SDAIA)
- Generative AI with Azure OpenAI Service (Microsoft & SDAIA)

## Experience

### Artificial Intelligence Trainee (Co-op) - InPro Studio, Makkah, SA (Mar to Jun 2025)

- Contributed to the development of AI-powered SaaS platforms, working across AI functionality, evaluation, and product integration
- Applied prompt engineering to design AI workflows deployed on Azure AI Foundry
- Supported product documentation, product design, and UX improvements

Note: this role is covered by confidentiality. Keep answers about InPro Studio at
this level. Do not name internal products, platforms, clients, datasets, models
evaluated, or implementation details, and do not speculate about them. If asked
for specifics, say they are not public.

### Banking Trainee (Online) - Banque Saudi Fransi, Supervision Program (Aug 2024 to Nov 2025)

- Completed a Vision 2030-aligned program in Agile, project management, and problem-solving

## Skills

Organised on the portfolio as a four-stage pipeline.

- Data: Python, SQL, PostgreSQL, Data Preprocessing, Roboflow, REST APIs
- Model: PyTorch, Transformers, Scikit-learn, OpenCV, LLMs & RAG, LangGraph, Fine-tuning
- Optimize & Deploy: FastAPI, ONNX, ONNX Runtime Web, Model Evaluation, Inference Optimization, Azure, Vercel
- Application: Yaqidh, InterMind, SMS Scam Detector, Brain Tumor Classifier

Also listed on the portfolio:

- Tools & Workflow: Git / GitHub, Jupyter, Google Colab, Automated Testing, Agile, n8n
- Strengths: Leadership, Problem-Solving, Teamwork, Communication, Critical Thinking, Time Management, Self-Learning

## Projects

Four projects are represented on the portfolio: InterMind, Yaqidh, SMS Scam &
Spam Detection, and the Brain Tumor MRI Classifier.

### InterMind: Autonomous AI Interviewer (2026, Agentic AI / Full-Stack AI)

Status: complete and live.

An autonomous AI interviewer that turns a job description into an adaptive
interview, evaluates candidate responses as the conversation unfolds, and
produces an evidence-based report.

How it works: InterMind reads a job description, works out what the role is
really asking for, and turns that into a plan of assessment areas. It then runs
the interview one exchange at a time. Each answer is evaluated as it arrives,
evidence accumulates across the exchange, and that state decides the next move:
a targeted follow-up on something still unclear, or the next assessment area.
The output is a report where every assessment points to something the candidate
said. The hiring decision stays with the recruiter.

Problem addressed: a scripted screening interview asks every candidate the same
questions in the same order. It cannot push on an answer that talked around the
question, and it cannot skip ground already covered well. InterMind makes the
questions depend on the answers and makes the output checkable.

Her role: the whole system, end to end.
- Interview agent: designed and built the LangGraph flow that plans, asks, evaluates, and decides what comes next
- Job-description analysis: turned free-text job descriptions into structured role understanding and an interview plan
- Evaluation & reporting: built the structured answer evaluation and the evidence-based report
- Backend: FastAPI service and PostgreSQL persistence behind interview sessions
- Frontend: React and TypeScript app covering both recruiter and candidate workflows
- Voice: integrated Azure AI Speech so an interview can be spoken instead of typed
- Deployment: React app on Vercel, API on Azure App Service

Tech stack: LangGraph, OpenAI, Python, FastAPI, PostgreSQL, React, TypeScript,
Azure AI Speech, O*NET, Vercel, Azure App Service.

Key features: job-description analysis into structured requirements; structured
interview planning with assessment areas rather than a fixed script; adaptive
interviewing with targeted follow-ups; cumulative evidence carried across an
exchange; structured answer evaluation feeding an evidence-based report;
separate recruiter and candidate workflows; optional voice interaction;
O*NET occupational context used only when the role matches reliably.

Hardest parts: deciding when an answer is enough, when to probe deeper, and when
to move on (routing held in the LangGraph flow); and making the report show the
reasoning behind an assessment rather than just a score.

Links:
- Live product: https://intermind-ai.vercel.app
- Repository: https://github.com/AliyahAlabdali/InterMind
- Case study: https://aliyahalabdali.github.io/projects/intermind.html

### Yaqidh: AI Child-Safety Monitoring (2025 to 2026, graduation project, Computer Vision)

Yaqidh (يقظ, "vigilant") is a real-time system that watches live CCTV, detects
child falls and violence with custom YOLOv8 models, and sends instant,
role-based alerts to parents, teachers, or facility managers. Built for
nurseries, schools, and homes, it connects to existing CCTV without new hardware.

Models were trained on 3,800+ collected and augmented images. Two dedicated
YOLOv8 models are used, one for falls and one for violence.

Her role (core contributor): developed the custom YOLOv8 fall-detection model;
converted it to ONNX for optimised real-time inference; developed the backend
with FastAPI, PostgreSQL, and JWT/RBAC access control; developed the frontend
including the React dashboards; implemented report generation.

Tech stack: YOLOv8, PyTorch, OpenCV, ONNX, FastAPI, PostgreSQL, REST APIs,
React, JWT, RBAC.

Key features: real-time detection of falls and violence from live CCTV streams;
two dedicated YOLOv8 models; role-based alert routing; live analytics
dashboards; JWT authentication with RBAC; ONNX-optimised inference.

Documented results:
- 0.81 mAP@50 on fall detection
- 0.66 mAP@50 on violence
- 2 to 3x gain over baselines
- ~20% lower inference latency

Links:
- Repository: https://github.com/Yaqidh-Project/Yaqidh
- Case study: https://aliyahalabdali.github.io/projects/yaqidh.html

### SMS Scam & Spam Detection (2026, NLP, Advanced Deep Learning)

A Transformer encoder implemented from scratch in PyTorch (tokenisation,
embeddings, self-attention, classification head) that separates scam and spam
SMS from legitimate messages on a heavily imbalanced dataset, and correctly
labels brand-new hand-written messages never seen in training.

Why macro-F1 mattered: scam messages are rare, so a model can score high
accuracy by calling almost everything legitimate while missing the scams. The
target was a strong macro-F1 that treats the rare class seriously, plus
generalisation to unseen phrasing.

Her role (individual project): prepared the imbalanced corpus, tokenizer and
vocabulary; implemented the encoder (embeddings, multi-head attention, FFN,
classifier head); trained and tuned for the minority class optimising macro-F1;
validated on held-out data and new hand-written messages.

Tech stack: PyTorch, Transformers, Scikit-learn, NLP, text classification.

Documented results:
- 98% accuracy
- 0.95 macro F1-score
- 100% from-scratch encoder

Links:
- Live demo (Hugging Face Space): https://huggingface.co/spaces/AliyahAlabdali/sms-scam-detector
- Repository: https://github.com/AliyahAlabdali/SMS-Scam-Detection-Transformer
- Case study: https://aliyahalabdali.github.io/projects/sms-scam-detection.html

### Brain Tumor MRI Classifier (2025, Deep Learning, AI System Design)

A privacy-first web app that classifies brain-MRI scans into four tumor types
entirely in the browser via ONNX Runtime Web. The scan is processed locally and
never uploaded, so there is no inference server in the path.

Her role: converted the trained model to ONNX, trading size against accuracy
deliberately; wired up ONNX Runtime Web for fully client-side inference; built
the React and Vite interface with upload, prediction, and real-time confidence
scoring; deployed it on Vercel.

Tech stack: YOLOv8, ONNX, ONNX Runtime Web, React, Vite, Vercel.

Key features: four-class classification; fully in-browser inference;
privacy-first by construction; real-time per-class confidence scoring;
lightweight model; live and shareable with no install.

Documented results:
- ~79% accuracy
- ~9 ms inference time
- ~1.5 MB model size
- 0 bytes of data uploaded

Links:
- Live demo: https://btcs-project.vercel.app/
- Repository: https://github.com/AliyahAlabdali/BTCS-Project
- Case study: https://aliyahalabdali.github.io/projects/brain-tumor.html

## Contact

- Email: AliyahAlabdali24@gmail.com (fastest way to reach her)
- LinkedIn: https://linkedin.com/in/aliyah-alabdali-5ba599274
- GitHub: https://github.com/AliyahAlabdali

## Answering notes

- If a question is not covered by the facts above, say so plainly and point to
  the portfolio or her email. Do not invent projects, employers, metrics, or dates.
- Only the four projects listed above are on the portfolio.
- InterMind is a current, completed, live project, not a work in progress.
