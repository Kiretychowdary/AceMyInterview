"""
RADHAKRISHNALOVEPERMANENT
AMMALOVEBLESSINGSONRECURSION

Training script for DKT model
Generates sample data and trains the model
"""

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
import os
from datetime import datetime

from dkt_model import DKTModel, encode_student_sequence


def generate_sample_data(num_students=100, num_topics=10, max_interactions=50):
    """
    Generate synthetic student interaction data
    
    Args:
        num_students: Number of students to simulate
        num_topics: Number of topics
        max_interactions: Maximum interactions per student
    
    Returns:
        DataFrame with student interactions
    """
    print(f"Generating sample data for {num_students} students...")
    
    data = []
    
    for student_id in range(num_students):
        # Each student has different learning patterns
        student_mastery = np.random.rand(num_topics)  # Initial mastery levels
        
        num_interactions = np.random.randint(10, max_interactions)
        
        for interaction_num in range(num_interactions):
            # Student tends to practice topics they're weak in
            topic_probs = 1 - student_mastery
            topic_probs = topic_probs / topic_probs.sum()
            topic_id = np.random.choice(num_topics, p=topic_probs)
            
            # Probability of getting answer correct depends on mastery
            correct_prob = student_mastery[topic_id]
            correct = 1 if np.random.rand() < correct_prob else 0
            
            data.append({
                'student_id': student_id,
                'interaction_num': interaction_num,
                'topic_id': topic_id,
                'correct': correct
            })
            
            # Update student mastery (learning effect)
            if correct == 1:
                student_mastery[topic_id] = min(1.0, student_mastery[topic_id] + 0.05)
            else:
                student_mastery[topic_id] = max(0.0, student_mastery[topic_id] - 0.02)
    
    df = pd.DataFrame(data)
    
    # Save to CSV
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/training_data.csv', index=False)
    print(f"✓ Saved training data to data/training_data.csv")
    
    return df


def prepare_training_data(df, num_topics, seq_length=20):
    """
    Prepare sequences for DKT training
    
    Args:
        df: DataFrame with student interactions
        num_topics: Number of topics
        seq_length: Length of interaction sequences
    
    Returns:
        X, y: Training data tensors
    """
    print(f"Preparing sequences of length {seq_length}...")
    
    X_sequences = []
    y_sequences = []
    
    # Group by student
    for student_id in df['student_id'].unique():
        student_data = df[df['student_id'] == student_id].to_dict('records')
        
        # Create sliding windows
        for start_idx in range(0, len(student_data) - seq_length + 1):
            sequence = student_data[start_idx:start_idx + seq_length]
            
            # Encode input sequence
            encoded = encode_student_sequence(sequence, num_topics)
            
            # Create target (next correctness for each topic)
            # For simplicity, use same sequence shifted by 1
            target = torch.zeros((seq_length, num_topics))
            for i, interaction in enumerate(sequence):
                topic_id = interaction['topic_id']
                correct = interaction['correct']
                target[i, topic_id] = correct
            
            X_sequences.append(encoded)
            y_sequences.append(target)
    
    X = torch.stack(X_sequences)
    y = torch.stack(y_sequences)
    
    print(f"✓ Created {len(X)} training sequences")
    
    return X, y


def train_model(model, X_train, y_train, X_val, y_val, epochs=50, batch_size=32, learning_rate=0.001):
    """
    Train the DKT model
    
    Args:
        model: DKT model instance
        X_train, y_train: Training data
        X_val, y_val: Validation data
        epochs: Number of training epochs
        batch_size: Batch size
        learning_rate: Learning rate
    """
    print(f"\nTraining model for {epochs} epochs...")
    
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    
    train_losses = []
    val_losses = []
    
    for epoch in range(epochs):
        model.train()
        epoch_loss = 0
        num_batches = 0
        
        # Mini-batch training
        for i in range(0, len(X_train), batch_size):
            batch_X = X_train[i:i+batch_size]
            batch_y = y_train[i:i+batch_size]
            
            optimizer.zero_grad()
            
            # Forward pass
            predictions, _ = model(batch_X)
            loss = criterion(predictions, batch_y)
            
            # Backward pass
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
            num_batches += 1
        
        avg_train_loss = epoch_loss / num_batches
        train_losses.append(avg_train_loss)
        
        # Validation
        model.eval()
        with torch.no_grad():
            val_predictions, _ = model(X_val)
            val_loss = criterion(val_predictions, y_val)
            val_losses.append(val_loss.item())
        
        # Print progress
        if (epoch + 1) % 10 == 0:
            print(f"Epoch {epoch+1}/{epochs} - Train Loss: {avg_train_loss:.4f}, Val Loss: {val_loss:.4f}")
    
    print("\n✓ Training completed!")
    
    return train_losses, val_losses


def evaluate_model(model, X_test, y_test):
    """
    Evaluate model performance
    
    Args:
        model: Trained DKT model
        X_test, y_test: Test data
    
    Returns:
        metrics: Dict with evaluation metrics
    """
    print("\nEvaluating model...")
    
    model.eval()
    with torch.no_grad():
        predictions, _ = model(X_test)
        
        # Calculate accuracy (using 0.5 threshold)
        pred_binary = (predictions > 0.5).float()
        accuracy = (pred_binary == y_test).float().mean().item()
        
        # Calculate loss
        criterion = nn.BCELoss()
        loss = criterion(predictions, y_test).item()
    
    metrics = {
        'accuracy': accuracy,
        'loss': loss
    }
    
    print(f"✓ Test Accuracy: {accuracy:.4f}")
    print(f"✓ Test Loss: {loss:.4f}")
    
    return metrics


def main():
    """Main training pipeline"""
    print("\n" + "="*60)
    print("🚀 DKT Model Training Pipeline")
    print("="*60 + "\n")
    
    # Configuration
    NUM_TOPICS = 10
    NUM_STUDENTS = 200
    SEQ_LENGTH = 20
    EPOCHS = 50
    BATCH_SIZE = 32
    LEARNING_RATE = 0.001
    
    # Step 1: Generate or load data
    if os.path.exists('data/training_data.csv'):
        print("Loading existing training data...")
        df = pd.read_csv('data/training_data.csv')
    else:
        df = generate_sample_data(
            num_students=NUM_STUDENTS,
            num_topics=NUM_TOPICS,
            max_interactions=50
        )
    
    print(f"Total interactions: {len(df)}")
    print(f"Unique students: {df['student_id'].nunique()}")
    
    # Step 2: Prepare sequences
    X, y = prepare_training_data(df, NUM_TOPICS, seq_length=SEQ_LENGTH)
    
    # Step 3: Split data
    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.3, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)
    
    print(f"\nData split:")
    print(f"  Training: {len(X_train)} sequences")
    print(f"  Validation: {len(X_val)} sequences")
    print(f"  Test: {len(X_test)} sequences")
    
    # Step 4: Initialize model
    model = DKTModel(num_topics=NUM_TOPICS, hidden_size=128, num_layers=2, dropout=0.2)
    print(f"\nModel architecture:")
    print(model)
    
    # Step 5: Train model
    train_losses, val_losses = train_model(
        model, X_train, y_train, X_val, y_val,
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        learning_rate=LEARNING_RATE
    )
    
    # Step 6: Evaluate model
    metrics = evaluate_model(model, X_test, y_test)
    
    # Step 7: Save model
    os.makedirs('models', exist_ok=True)
    model_path = 'models/dkt_model.pth'
    torch.save(model.state_dict(), model_path)
    print(f"\n✓ Model saved to {model_path}")
    
    # Save training info
    training_info = {
        'timestamp': datetime.now().isoformat(),
        'num_topics': NUM_TOPICS,
        'num_students': NUM_STUDENTS,
        'seq_length': SEQ_LENGTH,
        'epochs': EPOCHS,
        'batch_size': BATCH_SIZE,
        'learning_rate': LEARNING_RATE,
        'final_metrics': metrics
    }
    
    import json
    with open('models/training_info.json', 'w') as f:
        json.dump(training_info, f, indent=2)
    
    print("\n" + "="*60)
    print("✅ Training pipeline completed successfully!")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
