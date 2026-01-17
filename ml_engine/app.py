"""
RADHAKRISHNALOVEPERMANENT
AMMALOVEBLESSINGSONRECURSION

Flask API for Student Performance Prediction and Guidance
Serves DKT and RL models to Node.js backend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import numpy as np
import os
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
from collections import defaultdict

from dkt_model import DKTModel, encode_student_sequence, get_topic_recommendations
from rl_agent import RLAgent

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
NUM_TOPICS = int(os.getenv('NUM_TOPICS', 10))  # Adjust based on your curriculum
MODEL_PATH = 'models/dkt_model.pth'
RL_MODELS_DIR = 'models/personal_agents'  # Personal RL agents per user

# Initialize models
dkt_model = None
personal_rl_agents = {}  # Cache for user-specific RL agents

# MongoDB connection for fetching user data
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/acemyinterview')
mongo_client = None
db = None

print(f"🔧 ML Engine Configuration:")
print(f"   - Number of Topics: {NUM_TOPICS}")
print(f"   - MongoDB URI: {MONGODB_URI[:30]}...")
print(f"   - Model Path: {MODEL_PATH}")

# Topic names mapping (customize for your application)
TOPIC_NAMES = [
    "Data Structures",
    "Algorithms",
    "Object-Oriented Programming",
    "Database Management",
    "Web Development",
    "Software Engineering",
    "Operating Systems",
    "Computer Networks",
    "Machine Learning",
    "Cloud Computing"
]


def initialize_models():
    """Initialize or load ML models"""
    global dkt_model, mongo_client, db
    
    print("Initializing models...")
    
    # Initialize DKT model
    dkt_model = DKTModel(num_topics=NUM_TOPICS, hidden_size=128, num_layers=2)
    
    # Load pre-trained weights if available
    if os.path.exists(MODEL_PATH):
        dkt_model.load_state_dict(torch.load(MODEL_PATH))
        print(f"✓ Loaded DKT model from {MODEL_PATH}")
    else:
        print("⚠ No pre-trained DKT model found. Using initialized model.")
    
    dkt_model.eval()
    
    # Create directory for personal RL agents
    os.makedirs(RL_MODELS_DIR, exist_ok=True)
    print(f"✓ Personal RL agents directory: {RL_MODELS_DIR}")
    
    # Connect to MongoDB
    try:
        mongo_client = MongoClient(MONGODB_URI)
        db = mongo_client.get_database()
        print(f"✓ Connected to MongoDB: {db.name}")
    except Exception as e:
        print(f"⚠ MongoDB connection failed: {e}")
        print("  System will work but cannot fetch user data directly")
    
    print("Models initialized successfully!")


def get_personal_rl_agent(student_id):
    """Get or create personal RL agent for a specific student"""
    if student_id in personal_rl_agents:
        return personal_rl_agents[student_id]
    
    # Create new agent
    agent = RLAgent(num_topics=NUM_TOPICS)
    
    # Try to load saved agent
    agent_path = os.path.join(RL_MODELS_DIR, f'{student_id}.json')
    if os.path.exists(agent_path):
        agent.load_model(agent_path)
        print(f"✓ Loaded personal RL agent for {student_id}")
    else:
        print(f"✓ Created new personal RL agent for {student_id}")
    
    # Cache the agent
    personal_rl_agents[student_id] = agent
    return agent


def save_personal_rl_agent(student_id, agent):
    """Save personal RL agent for a specific student"""
    agent_path = os.path.join(RL_MODELS_DIR, f'{student_id}.json')
    agent.save_model(agent_path)
    print(f"✓ Saved personal RL agent for {student_id}")


def fetch_user_interactions_from_db(student_id):
    """Fetch user's actual interactions from MongoDB"""
    if not db:
        return None
    
    try:
        performance = db.studentperformances.find_one({'userId': student_id})
        if performance and 'interactions' in performance:
            interactions = [
                {
                    'topic_id': int(i['topicId']),
                    'correct': int(i['correct'])
                }
                for i in performance['interactions']
            ]
            return interactions
        return None
    except Exception as e:
        print(f"Error fetching user data: {e}")
        return None


@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'running',
        'service': 'AceMyInterview ML Engine',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })


@app.route('/health', methods=['GET'])
def health():
    """Detailed health check"""
    return jsonify({
        'status': 'healthy',
        'models': {
            'dkt': dkt_model is not None,
            'rl_agent': rl_agent is not None
        },
        'num_topics': NUM_TOPICS,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/predict', methods=['POST'])
def predict_performance():
    """
    Predict student performance and provide PERSONALIZED recommendations
    Fetches user's actual data from MongoDB
    
    Expected input:
    {
        "student_id": "12345"
    }
    
    Returns: Personalized prediction and recommendations
    """
    try:
        data = request.json
        student_id = data.get('student_id')
        
        if not student_id:
            return jsonify({'error': 'student_id is required'}), 400
        
        # Fetch user's actual interactions from MongoDB
        interactions = fetch_user_interactions_from_db(student_id)
        
        # If no data in DB, check if interactions provided in request
        if not interactions:
            interactions = data.get('interactions', [])
        
        if not interactions or len(interactions) == 0:
            # New user - no data yet
            return jsonify({
                'student_id': student_id,
                'message': 'Welcome! Start solving problems to unlock your personal AI trainer.',
                'is_new_user': True,
                'recommendation': {
                    'action_type': 'START',
                    'reason': 'Begin with any topic. Your personal AI will learn your style and guide you.',
                    'recommended_topic_id': 0,
                    'recommended_topic_name': TOPIC_NAMES[0]
                }
            })
        
        # Encode interaction sequence
        encoded_sequence = encode_student_sequence(interactions, NUM_TOPICS)
        encoded_sequence = encoded_sequence.unsqueeze(0)  # Add batch dimension
        
        # Get mastery predictions from DKT model
        mastery_probs = dkt_model.predict(encoded_sequence)
        
        # Extract last timestep predictions (current mastery state)
        current_mastery = mastery_probs[0, -1, :].numpy()
        
        # Get topic-wise recommendations
        topic_recommendations = get_topic_recommendations(current_mastery, TOPIC_NAMES)
        
        # Get PERSONAL RL agent for this specific student
        personal_agent = get_personal_rl_agent(student_id)
        
        # Get personalized recommendation from student's personal RL agent
        rl_recommendation = personal_agent.recommend(current_mastery, TOPIC_NAMES)
        
        # Check for topic completion
        completed_topics = []
        for topic_name, data in topic_recommendations.items():
            if data['mastery_score'] >= 0.85:  # 85% mastery = completed
                completed_topics.append({
                    'topic': topic_name,
                    'mastery': data['mastery_score']
                })
        
        # Prepare response
        response = {
            'student_id': student_id,
            'timestamp': datetime.now().isoformat(),
            'is_new_user': False,
            'mastery': topic_recommendations,
            'recommendation': rl_recommendation,
            'overall_mastery': float(np.mean(current_mastery)),
            'interaction_count': len(interactions),
            'completed_topics': completed_topics,
            'personal_progress': {
                'topics_mastered': len(completed_topics),
                'topics_in_progress': sum(1 for data in topic_recommendations.values() if 0.4 <= data['mastery_score'] < 0.85),
                'topics_to_start': sum(1 for data in topic_recommendations.values() if data['mastery_score'] < 0.4)
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500


@app.route('/learn', methods=['POST'])
def learn_from_interaction():
    """
    Update PERSONAL RL agent based on new student interaction
    Each student has their own learning agent
    
    Expected input:
    {
        "student_id": "12345",
        "old_mastery": [0.3, 0.5, ...],
        "action": 2,
        "new_mastery": [0.4, 0.5, ...]
    }
    """
    try:
        data = request.json
        student_id = data.get('student_id')
        
        if not student_id:
            return jsonify({'error': 'student_id is required'}), 400
        
        old_mastery = np.array(data['old_mastery'])
        action = data['action']
        new_mastery = np.array(data['new_mastery'])
        
        # Get personal RL agent for this student
        personal_agent = get_personal_rl_agent(student_id)
        
        # Update personal agent based on their learning
        reward = personal_agent.learn_from_interaction(old_mastery, action, new_mastery)
        
        # Save updated personal agent
        save_personal_rl_agent(student_id, personal_agent)
        
        return jsonify({
            'status': 'success',
            'reward': float(reward),
            'message': f'Personal AI trainer updated for student {student_id}'
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500


@app.route('/topics', methods=['GET'])
def get_topics():
    """Get list of available topics"""
    topics = []
    for i, name in enumerate(TOPIC_NAMES):
        topics.append({
            'topic_id': i,
            'topic_name': name
        })
    
    return jsonify({
        'topics': topics,
        'total': len(topics)
    })


@app.route('/student/analytics', methods=['POST'])
def student_analytics():
    """
    Get detailed analytics for a SPECIFIC student using their actual data
    
    Expected input:
    {
        "student_id": "12345"
    }
    """
    try:
        data = request.json
        student_id = data.get('student_id')
        
        if not student_id:
            return jsonify({'error': 'student_id is required'}), 400
        
        # Fetch user's actual interactions from MongoDB
        interactions = fetch_user_interactions_from_db(student_id)
        
        if not interactions:
            interactions = data.get('interactions', [])
        
        if len(interactions) == 0:
            return jsonify({
                'error': 'No interaction data available for this student'
            }), 400
        
        # Encode sequence
        encoded_sequence = encode_student_sequence(interactions, NUM_TOPICS)
        encoded_sequence = encoded_sequence.unsqueeze(0)
        
        # Get mastery over time
        mastery_probs = dkt_model.predict(encoded_sequence)
        mastery_history = mastery_probs[0, :, :].numpy()
        
        # Calculate statistics
        current_mastery = mastery_history[-1, :]
        
        # Find strongest and weakest areas
        strongest_topic = int(np.argmax(current_mastery))
        weakest_topic = int(np.argmin(current_mastery))
        
        # Calculate improvement trend
        if len(mastery_history) > 1:
            improvement = np.mean(mastery_history[-1, :]) - np.mean(mastery_history[0, :])
        else:
            improvement = 0
        
        # Count correct/incorrect per topic
        topic_stats = {}
        for topic_id, topic_name in enumerate(TOPIC_NAMES):
            topic_interactions = [i for i in interactions if i['topic_id'] == topic_id]
            if topic_interactions:
                correct_count = sum(1 for i in topic_interactions if i['correct'] == 1)
                total_count = len(topic_interactions)
                topic_stats[topic_name] = {
                    'attempts': total_count,
                    'correct': correct_count,
                    'accuracy': correct_count / total_count,
                    'current_mastery': float(current_mastery[topic_id])
                }
        
        # Personal milestones
        milestones = []
        for topic_id, mastery in enumerate(current_mastery):
            if mastery >= 0.85:
                milestones.append({
                    'type': 'MASTERED',
                    'topic': TOPIC_NAMES[topic_id],
                    'mastery': float(mastery)
                })
            elif mastery >= 0.7:
                milestones.append({
                    'type': 'STRONG',
                    'topic': TOPIC_NAMES[topic_id],
                    'mastery': float(mastery)
                })
        
        return jsonify({
            'student_id': student_id,
            'overall_mastery': float(np.mean(current_mastery)),
            'improvement_trend': float(improvement),
            'strongest_topic': {
                'topic_id': strongest_topic,
                'topic_name': TOPIC_NAMES[strongest_topic],
                'mastery': float(current_mastery[strongest_topic])
            },
            'weakest_topic': {
                'topic_id': weakest_topic,
                'topic_name': TOPIC_NAMES[weakest_topic],
                'mastery': float(current_mastery[weakest_topic])
            },
            'topic_statistics': topic_stats,
            'total_interactions': len(interactions),
            'personal_milestones': milestones
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500


if __name__ == '__main__':
    # Initialize models on startup
    initialize_models()
    
    # Run Flask app
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    print(f"\n{'='*60}")
    print(f"🚀 AceMyInterview ML Engine Starting...")
    print(f"{'='*60}")
    print(f"📡 API URL: http://localhost:{port}")
    print(f"🔧 Debug Mode: {debug}")
    print(f"📚 Number of Topics: {NUM_TOPICS}")
    print(f"{'='*60}\n")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
