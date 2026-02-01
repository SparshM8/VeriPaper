#!/usr/bin/env python
"""Test the VeriPaper API with a sample paper."""

import requests
import sys
from pathlib import Path


def test_api(file_path: str, api_url: str = "http://localhost:8000"):
    """Upload a paper and print results."""
    analyze_url = f"{api_url}/api/analyze"
    
    try:
        with open(file_path, "rb") as f:
            files = {"file": (Path(file_path).name, f)}
            print(f"Uploading {Path(file_path).name}...")
            response = requests.post(analyze_url, files=files, timeout=60)
        
        if response.status_code != 200:
            print(f"Error: {response.status_code}")
            print(response.text)
            return False
        
        result = response.json()
        print("\n=== ANALYSIS RESULTS ===\n")
        print(f"Plagiarism Score: {result['plagiarism_score']}%")
        print(f"AI Probability: {result['ai_probability']}% ({result['ai_confidence']})")
        print(f"Citation Validity: {result['citation_validity_score']}%")
        print(f"Statistical Risk: {result['statistical_risk_score']}%")
        print(f"Overall Credibility: {result['overall_research_credibility']}%")
        
        if result['plagiarism_matches']:
            print("\nTop Plagiarism Matches:")
            for match in result['plagiarism_matches'][:3]:
                print(f"  - {match['title']} ({match['similarity']}%)")
        
        if result['citation_invalid_dois']:
            print(f"\nInvalid DOIs: {result['citation_invalid_dois']}")
        if result['citation_missing_dois']:
            print(f"Missing DOIs: {result['citation_missing_dois']}")
        
        print(f"\nReport saved to: {result['report_path']}")
        return True
    
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to API. Is the server running on http://localhost:8000?")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_api.py <file_path>")
        print("Example: python test_api.py backend/data/sample_paper.txt")
        sys.exit(1)
    
    success = test_api(sys.argv[1])
    sys.exit(0 if success else 1)
