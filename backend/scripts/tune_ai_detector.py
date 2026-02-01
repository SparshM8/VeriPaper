"""
AI Detector Threshold Optimization & Model Tuning
Automatic calibration for production deployment
"""

import numpy as np
import joblib
from pathlib import Path
from sklearn.metrics import (
    roc_curve, auc, precision_recall_curve, f1_score,
    classification_report
)
import json

class AIDetectorTuner:
    """Optimize AI detector threshold and performance"""
    
    def __init__(self, model_path: str = None):
        self.model_path = model_path or "models/ai_detector.joblib"
        self.optimal_threshold = 0.5
        self.roc_auc = 0.0
        self.calibration_data = {}
        
    def load_model(self):
        """Load the AI detector model"""
        try:
            if Path(self.model_path).exists():
                self.model = joblib.load(self.model_path)
                print(f"✅ Model loaded: {self.model_path}")
                return True
        except Exception as e:
            print(f"⚠️  Model load failed: {e}")
            print("   Using mock detector for demonstration")
            return False
    
    def find_optimal_threshold(self, y_true, y_pred_proba):
        """Find optimal threshold using multiple criteria"""
        
        # Calculate ROC curve
        fpr, tpr, thresholds_roc = roc_curve(y_true, y_pred_proba)
        roc_auc_score = auc(fpr, tpr)
        
        # Calculate Precision-Recall curve
        precision_vals, recall_vals, _ = precision_recall_curve(y_true, y_pred_proba)
        
        # Method 1: Youden's J statistic (max TPR - FPR)
        j_scores = tpr - fpr
        optimal_idx = np.argmax(j_scores)
        youden_threshold = thresholds_roc[optimal_idx]
        
        # Method 2: F1 score maximization
        best_f1 = 0
        best_f1_threshold = 0.5
        for threshold in np.arange(0.1, 0.9, 0.01):
            y_pred = (np.array(y_pred_proba) > threshold).astype(int)
            f1 = f1_score(y_true, y_pred, zero_division=0)
            if f1 > best_f1:
                best_f1 = f1
                best_f1_threshold = threshold
        
        # Store results
        self.roc_auc = roc_auc_score
        self.optimal_threshold = best_f1_threshold
        
        self.calibration_data = {
            'roc_auc': float(roc_auc_score),
            'youden_threshold': float(youden_threshold),
            'f1_optimal_threshold': float(best_f1_threshold),
            'best_f1_score': float(best_f1),
            'method': 'F1 optimization',
            'timestamp': str(np.datetime64('today'))
        }
        
        return self.optimal_threshold
    
    def evaluate_threshold(self, y_true, y_pred_proba, threshold=None):
        """Evaluate performance at specific threshold"""
        if threshold is None:
            threshold = self.optimal_threshold
        
        y_pred = (np.array(y_pred_proba) > threshold).astype(int)
        
        from sklearn.metrics import (
            accuracy_score, precision_score, recall_score, 
            f1_score, confusion_matrix
        )
        
        accuracy = accuracy_score(y_true, y_pred)
        precision = precision_score(y_true, y_pred, zero_division=0)
        recall = recall_score(y_true, y_pred, zero_division=0)
        f1 = f1_score(y_true, y_pred, zero_division=0)
        cm = confusion_matrix(y_true, y_pred)
        
        return {
            'threshold': threshold,
            'accuracy': float(accuracy),
            'precision': float(precision),
            'recall': float(recall),
            'f1_score': float(f1),
            'confusion_matrix': cm.tolist(),
            'classification_report': classification_report(
                y_true, y_pred, 
                target_names=['Human', 'AI Generated'],
                output_dict=True
            )
        }
    
    def save_optimal_threshold(self, output_path: str = "models/optimal_threshold.json"):
        """Save optimal threshold for deployment"""
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        
        deployment_config = {
            'version': '1.0',
            'optimal_threshold': self.optimal_threshold,
            'roc_auc': self.roc_auc,
            'calibration_data': self.calibration_data,
            'instructions': {
                'usage': f'Set threshold to {self.optimal_threshold:.4f} in production',
                'high_confidence_ai': f'Score > {self.optimal_threshold + 0.15:.4f}',
                'high_confidence_human': f'Score < {self.optimal_threshold - 0.15:.4f}',
                'uncertain_range': f'{self.optimal_threshold - 0.15:.4f} - {self.optimal_threshold + 0.15:.4f}'
            }
        }
        
        with open(output_path, 'w') as f:
            json.dump(deployment_config, f, indent=2)
        
        print(f"✅ Optimal threshold saved: {output_path}")
        return deployment_config


def demonstrate_tuning():
    """Demonstrate threshold tuning with sample data"""
    
    print("\n" + "="*70)
    print("AI Detector Threshold Optimization")
    print("="*70)
    
    # Create sample data
    np.random.seed(42)
    
    # Human-written papers: lower AI scores
    human_scores = np.random.beta(2, 5, 20) * 0.4  # Mean ~0.2
    
    # AI-generated papers: higher AI scores
    ai_scores = 0.6 + np.random.beta(5, 2, 20) * 0.35  # Mean ~0.8
    
    # Combine
    y_true = [0] * 20 + [1] * 20
    y_pred_proba = np.concatenate([human_scores, ai_scores])
    
    print("\nSample Data Distribution:")
    print(f"  Human (label=0): mean={human_scores.mean():.3f}, std={human_scores.std():.3f}")
    print(f"  AI (label=1):    mean={ai_scores.mean():.3f}, std={ai_scores.std():.3f}")
    
    # Initialize tuner
    tuner = AIDetectorTuner()
    
    # Find optimal threshold
    optimal_threshold = tuner.find_optimal_threshold(y_true, y_pred_proba)
    
    print(f"\n✅ Optimal Threshold Found: {optimal_threshold:.4f}")
    print(f"   ROC-AUC Score: {tuner.roc_auc:.4f}")
    
    # Evaluate at optimal threshold
    eval_result = tuner.evaluate_threshold(y_true, y_pred_proba, optimal_threshold)
    
    print(f"\nPerformance at Optimal Threshold:")
    print(f"  Accuracy:  {eval_result['accuracy']:.4f}")
    print(f"  Precision: {eval_result['precision']:.4f}")
    print(f"  Recall:    {eval_result['recall']:.4f}")
    print(f"  F1 Score:  {eval_result['f1_score']:.4f}")
    
    cm = eval_result['confusion_matrix']
    print(f"\n  Confusion Matrix:")
    print(f"    TN: {cm[0][0]} | FP: {cm[0][1]}")
    print(f"    FN: {cm[1][0]} | TP: {cm[1][1]}")
    
    # Compare with default threshold
    default_eval = tuner.evaluate_threshold(y_true, y_pred_proba, 0.5)
    
    print(f"\nComparison with Default (0.5) Threshold:")
    print(f"  Default F1:  {default_eval['f1_score']:.4f}")
    print(f"  Optimal F1:  {eval_result['f1_score']:.4f}")
    print(f"  Improvement: {(eval_result['f1_score'] - default_eval['f1_score'])*100:.1f}%")
    
    # Save configuration
    config = tuner.save_optimal_threshold()
    
    print(f"\n📋 Deployment Configuration:")
    print(f"   Use threshold: {config['optimal_threshold']:.4f}")
    print(f"   High confidence AI: > {config['instructions']['high_confidence_ai']}")
    print(f"   High confidence Human: < {config['instructions']['high_confidence_human']}")
    print(f"   Uncertain range: {config['instructions']['uncertain_range']}")
    
    return tuner, eval_result


def main():
    tuner, result = demonstrate_tuning()
    print("\n" + "="*70)
    print("✅ Threshold optimization complete!")
    print("="*70)


if __name__ == "__main__":
    main()
