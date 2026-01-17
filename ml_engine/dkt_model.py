"""
RADHAKRISHNALOVEPERMANENT
AMMALOVEBLESSINGSONRECURSION

Deep Knowledge Tracing (DKT) Model using LSTM
Predicts student mastery probability for each topic based on interaction history
"""

import torch
import torch.nn as nn
import numpy as np


class DKTModel(nn.Module):
    """
    LSTM-based Deep Knowledge Tracing Model
    
    Input: Sequence of (topic_id, correctness) pairs
    Output: Mastery probability for each topic (0.0 to 1.0)
    """
    
    def __init__(self, num_topics, hidden_size=128, num_layers=2, dropout=0.2):
        super(DKTModel, self).__init__()
        
        self.num_topics = num_topics
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        # Input: one-hot encoded topic + correctness
        # Input size = num_topics * 2 (topic answered correctly + topic answered incorrectly)
        input_size = num_topics * 2
        
        # LSTM layer for sequence learning
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        # Fully connected layer to predict mastery for each topic
        self.fc = nn.Linear(hidden_size, num_topics)
        
        # Sigmoid activation for probability output
        self.sigmoid = nn.Sigmoid()
        
        # Dropout for regularization
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x, hidden=None):
        """
        Forward pass
        
        Args:
            x: Input tensor of shape (batch_size, seq_len, num_topics * 2)
            hidden: Optional hidden state
        
        Returns:
            mastery_probs: Tensor of shape (batch_size, seq_len, num_topics)
        """
        # LSTM forward pass
        lstm_out, hidden = self.lstm(x, hidden)
        
        # Apply dropout
        lstm_out = self.dropout(lstm_out)
        
        # Predict mastery for each topic
        logits = self.fc(lstm_out)
        
        # Apply sigmoid to get probabilities
        mastery_probs = self.sigmoid(logits)
        
        return mastery_probs, hidden
    
    def predict(self, x):
        """
        Make predictions without returning hidden state
        
        Args:
            x: Input tensor
        
        Returns:
            mastery_probs: Mastery probabilities
        """
        self.eval()
        with torch.no_grad():
            mastery_probs, _ = self.forward(x)
        return mastery_probs


def encode_student_sequence(interactions, num_topics):
    """
    Encode student interaction sequence for DKT model
    
    Args:
        interactions: List of dicts with 'topic_id' and 'correct' keys
        num_topics: Total number of topics
    
    Returns:
        encoded_sequence: Tensor of shape (seq_len, num_topics * 2)
    """
    seq_len = len(interactions)
    encoded = np.zeros((seq_len, num_topics * 2))
    
    for i, interaction in enumerate(interactions):
        topic_id = interaction['topic_id']
        correct = interaction['correct']
        
        if correct == 1:
            # Topic answered correctly
            encoded[i, topic_id] = 1
        else:
            # Topic answered incorrectly
            encoded[i, num_topics + topic_id] = 1
    
    return torch.tensor(encoded, dtype=torch.float32)


def calculate_mastery_level(mastery_prob):
    """
    Categorize mastery probability into levels
    
    Args:
        mastery_prob: Float between 0 and 1
    
    Returns:
        level: String ('weak', 'average', 'strong')
    """
    if mastery_prob < 0.4:
        return 'weak'
    elif mastery_prob < 0.7:
        return 'average'
    else:
        return 'strong'


def get_topic_recommendations(mastery_vector, topic_names):
    """
    Generate topic recommendations based on mastery levels
    
    Args:
        mastery_vector: Array of mastery probabilities for each topic
        topic_names: List of topic names
    
    Returns:
        recommendations: Dict with topic-wise recommendations
    """
    recommendations = {}
    
    for topic_id, mastery in enumerate(mastery_vector):
        if topic_id < len(topic_names):
            topic_name = topic_names[topic_id]
            level = calculate_mastery_level(mastery)
            
            recommendations[topic_name] = {
                'mastery_score': float(mastery),
                'level': level,
                'needs_revision': mastery < 0.6
            }
    
    return recommendations


if __name__ == "__main__":
    # Test the model
    print("Testing DKT Model...")
    
    num_topics = 5
    model = DKTModel(num_topics=num_topics)
    
    # Create sample interaction sequence
    sample_interactions = [
        {'topic_id': 0, 'correct': 0},
        {'topic_id': 0, 'correct': 1},
        {'topic_id': 1, 'correct': 1},
        {'topic_id': 0, 'correct': 0},
    ]
    
    # Encode sequence
    encoded = encode_student_sequence(sample_interactions, num_topics)
    encoded = encoded.unsqueeze(0)  # Add batch dimension
    
    # Get predictions
    mastery_probs = model.predict(encoded)
    
    print("\nInput Sequence:", sample_interactions)
    print("\nMastery Predictions:")
    print(mastery_probs[0, -1, :])  # Last timestep predictions
    
    print("\nModel architecture:")
    print(model)
