# AceMyInterview ML Engine

## Student Performance Prediction & Guidance System

This ML engine uses Deep Knowledge Tracing (DKT) with LSTM and Reinforcement Learning to:
1. Predict student performance on specific subjects
2. Actively guide students to improve or move to next topics

### Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Train the initial model:
```bash
python train.py
```

4. Run the Flask API:
```bash
python app.py
```

The ML API will run on `http://localhost:5000`

### Architecture

- **DKT Model (LSTM)**: Calculates student mastery probability for each topic
- **RL Agent**: Decides optimal learning path (revise vs. move forward)
- **Flask API**: Serves predictions to Node.js backend
- **MongoDB**: Stores student interaction history

### API Endpoints

- `POST /predict` - Get student performance and recommendations
- `POST /train` - Retrain model with new data
- `GET /health` - Health check
