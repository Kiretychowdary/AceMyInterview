"""
RADHAKRISHNALOVEPERMANENT
AMMALOVEBLESSINGSONRECURSION

Reinforcement Learning Agent for Adaptive Learning Path
Decides whether student should revise current topic or move to next topic
"""

import numpy as np
import random
from collections import defaultdict
import json
import os


class RLAgent:
    """
    Q-Learning based RL Agent for learning path recommendation
    
    State: Student's current knowledge state (mastery vector)
    Action: Recommend next topic to study
    Reward: Improvement in mastery score
    """
    
    def __init__(self, num_topics, learning_rate=0.1, discount_factor=0.9, epsilon=0.2):
        self.num_topics = num_topics
        self.learning_rate = learning_rate
        self.discount_factor = discount_factor
        self.epsilon = epsilon
        
        # Q-table: maps (state, action) -> expected reward
        self.q_table = defaultdict(float)
        
        # Action space: which topic to recommend
        # Actions: 0 to num_topics-1 (recommend each topic)
        self.actions = list(range(num_topics))
        
        # Mastery thresholds
        self.WEAK_THRESHOLD = 0.4
        self.AVERAGE_THRESHOLD = 0.7
    
    def discretize_state(self, mastery_vector):
        """
        Convert continuous mastery vector to discrete state
        
        Args:
            mastery_vector: Array of mastery probabilities [0-1]
        
        Returns:
            state: Tuple representing discretized state
        """
        # Discretize each mastery value into 3 levels: weak(0), average(1), strong(2)
        discrete_state = []
        for mastery in mastery_vector:
            if mastery < self.WEAK_THRESHOLD:
                discrete_state.append(0)  # weak
            elif mastery < self.AVERAGE_THRESHOLD:
                discrete_state.append(1)  # average
            else:
                discrete_state.append(2)  # strong
        
        return tuple(discrete_state)
    
    def choose_action(self, mastery_vector, explore=True):
        """
        Choose action using epsilon-greedy policy
        
        Args:
            mastery_vector: Current mastery probabilities
            explore: Whether to use exploration (epsilon-greedy)
        
        Returns:
            action: Recommended topic index
        """
        state = self.discretize_state(mastery_vector)
        
        # Epsilon-greedy exploration
        if explore and random.random() < self.epsilon:
            # Explore: random action
            return random.choice(self.actions)
        else:
            # Exploit: choose best action
            q_values = [self.q_table[(state, action)] for action in self.actions]
            max_q = max(q_values)
            
            # If multiple actions have same Q-value, choose randomly among them
            best_actions = [a for a in self.actions if self.q_table[(state, a)] == max_q]
            return random.choice(best_actions)
    
    def recommend(self, mastery_vector, topic_names=None):
        """
        Generate intelligent recommendation based on mastery levels
        
        Args:
            mastery_vector: Array of mastery probabilities
            topic_names: Optional list of topic names
        
        Returns:
            recommendation: Dict with action and reasoning
        """
        # Find weakest and strongest topics
        weakest_idx = int(np.argmin(mastery_vector))
        strongest_idx = int(np.argmax(mastery_vector))
        
        weakest_mastery = mastery_vector[weakest_idx]
        strongest_mastery = mastery_vector[strongest_idx]
        
        # Rule-based recommendation with RL enhancement
        if weakest_mastery < self.WEAK_THRESHOLD:
            # Critical: Student struggling, must revise weakest topic
            action = weakest_idx
            action_type = "REVISE"
            reason = f"Mastery is low ({weakest_mastery:.1%}). Focus on improvement."
        
        elif weakest_mastery < self.AVERAGE_THRESHOLD:
            # Use RL to decide between revision and exploration
            action = self.choose_action(mastery_vector, explore=False)
            
            if action == weakest_idx:
                action_type = "REVISE"
                reason = f"Continue practicing to strengthen understanding ({weakest_mastery:.1%})."
            else:
                action_type = "EXPLORE"
                reason = f"You're progressing well. Try new challenges."
        
        else:
            # Student is doing well, use RL for optimal exploration
            action = self.choose_action(mastery_vector, explore=False)
            
            if action == strongest_idx:
                action_type = "ADVANCE"
                reason = f"Excellent mastery ({strongest_mastery:.1%})! Deepen your knowledge."
            else:
                action_type = "EXPLORE"
                reason = f"Ready for new topics. Expand your learning."
        
        recommendation = {
            'recommended_topic_id': action,
            'action_type': action_type,
            'reason': reason,
            'mastery_distribution': {
                'weakest_topic': weakest_idx,
                'weakest_mastery': float(weakest_mastery),
                'strongest_topic': strongest_idx,
                'strongest_mastery': float(strongest_mastery)
            }
        }
        
        if topic_names and action < len(topic_names):
            recommendation['recommended_topic_name'] = topic_names[action]
        
        return recommendation
    
    def update_q_value(self, state, action, reward, next_state):
        """
        Update Q-value using Q-learning update rule
        
        Q(s,a) = Q(s,a) + α * [R + γ * max(Q(s',a')) - Q(s,a)]
        """
        current_q = self.q_table[(state, action)]
        
        # Find max Q-value for next state
        next_q_values = [self.q_table[(next_state, a)] for a in self.actions]
        max_next_q = max(next_q_values) if next_q_values else 0
        
        # Q-learning update
        new_q = current_q + self.learning_rate * (
            reward + self.discount_factor * max_next_q - current_q
        )
        
        self.q_table[(state, action)] = new_q
    
    def learn_from_interaction(self, old_mastery, action, new_mastery):
        """
        Learn from student interaction
        
        Args:
            old_mastery: Mastery vector before interaction
            action: Topic that was recommended
            new_mastery: Mastery vector after interaction
        
        Returns:
            reward: Calculated reward
        """
        # Calculate reward based on improvement
        old_state = self.discretize_state(old_mastery)
        new_state = self.discretize_state(new_mastery)
        
        # Reward = improvement in overall mastery
        improvement = np.mean(new_mastery) - np.mean(old_mastery)
        
        # Bonus reward if weakest topic improved
        weakest_idx = int(np.argmin(old_mastery))
        if new_mastery[weakest_idx] > old_mastery[weakest_idx]:
            improvement += 0.2
        
        # Penalty if mastery decreased
        if improvement < 0:
            reward = improvement * 2  # Double penalty for regression
        else:
            reward = improvement
        
        # Update Q-table
        self.update_q_value(old_state, action, reward, new_state)
        
        return reward
    
    def save_model(self, filepath):
        """Save Q-table to file"""
        with open(filepath, 'w') as f:
            # Convert defaultdict to regular dict for JSON serialization
            q_dict = {str(k): v for k, v in self.q_table.items()}
            json.dump({
                'q_table': q_dict,
                'num_topics': self.num_topics,
                'learning_rate': self.learning_rate,
                'discount_factor': self.discount_factor,
                'epsilon': self.epsilon
            }, f)
    
    def load_model(self, filepath):
        """Load Q-table from file"""
        if os.path.exists(filepath):
            with open(filepath, 'r') as f:
                data = json.load(f)
                # Reconstruct Q-table
                self.q_table = defaultdict(float)
                for k, v in data['q_table'].items():
                    self.q_table[eval(k)] = v
                self.num_topics = data['num_topics']
                self.learning_rate = data['learning_rate']
                self.discount_factor = data['discount_factor']
                self.epsilon = data['epsilon']
            return True
        return False


if __name__ == "__main__":
    # Test the RL Agent
    print("Testing RL Agent...")
    
    num_topics = 5
    agent = RLAgent(num_topics=num_topics)
    
    # Test scenario 1: Student struggling with topic 0
    mastery_weak = np.array([0.3, 0.5, 0.6, 0.7, 0.8])
    recommendation = agent.recommend(mastery_weak)
    print("\n--- Scenario 1: Weak in Topic 0 ---")
    print(f"Mastery: {mastery_weak}")
    print(f"Recommendation: {recommendation}")
    
    # Test scenario 2: Student doing well overall
    mastery_strong = np.array([0.8, 0.7, 0.75, 0.6, 0.85])
    recommendation = agent.recommend(mastery_strong)
    print("\n--- Scenario 2: Strong Overall ---")
    print(f"Mastery: {mastery_strong}")
    print(f"Recommendation: {recommendation}")
    
    # Test learning
    print("\n--- Testing Learning ---")
    old_mastery = np.array([0.3, 0.5, 0.6, 0.7, 0.8])
    new_mastery = np.array([0.5, 0.5, 0.6, 0.7, 0.8])  # Improved topic 0
    action = 0
    reward = agent.learn_from_interaction(old_mastery, action, new_mastery)
    print(f"Reward for improving topic 0: {reward:.3f}")
