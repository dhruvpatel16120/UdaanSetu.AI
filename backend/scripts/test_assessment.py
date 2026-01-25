import requests
import json

BASE_URL = "http://localhost:8000"

def test_submit_assessment():
    url = f"{BASE_URL}/api/assessment/submit"
    
    # Constructing a payload based on the question bank structure
    payload = [
        {"question_id": "static_name", "text_answer": "Rohan Patel"},
        {"question_id": "static_gender", "selected_option_id": "male"},
        {"question_id": "static_dob", "text_answer": "2002-05-15"},
        {"question_id": "static_district", "selected_option_id": "ahmedabad"},
        
        # Education path
        {"question_id": "q1_edu_level", "selected_option_id": "graduate"},
        {"question_id": "q2_grades", "selected_option_id": "mid_tier"},
        
        # Family Background
        {"question_id": "q3_family_type", "selected_option_id": "business"},
        {"question_id": "q4_income", "selected_option_id": "mid"},
        
        # Interests
        {"question_id": "q5_interest", "selected_option_id": "tech"},
        {"question_id": "q7_mindset_games", "selected_option_id": "building"}, # Follow up for tech
        
        # Open Text
        {"question_id": "q9_vision", "text_answer": "I want to build apps that help farmers."},
        {"question_id": "q10_package", "selected_option_id": "mid"},
        {"question_id": "q11_positive", "text_answer": "Logical thinking, persistent"},
        {"question_id": "q12_negative", "text_answer": "Impatience"},
        {"question_id": "q13_shifting", "selected_option_id": "yes"}
    ]
    
    headers = {
        "x-firebase-id": "test_user_rohan_123", # Mock header
        "Content-Type": "application/json"
    }
    
    print(f"Submitting assessment to {url}...")
    try:
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            print("✅ Submission Successful!")
            data = response.json()
            
            # Check for AI Report correctness
            if "generated_bio" in data and "ai_report" in data["generated_bio"]:
                report = data["generated_bio"]["ai_report"]
                print("\n--- AI Report Generated ---")
                
                # Verify JSON structure keys exist as per schema
                keys_to_check = ["careerReadiness", "topStrengths", "recommendations", "learningPaths"]
                missing_keys = [k for k in keys_to_check if k not in report]
                
                if not missing_keys:
                    print(f"Top Recommendation: {report['recommendations'][0]['title']}")
                    print(f"Match Score: {report['recommendations'][0]['match']}%")
                    print(f"Readiness: {report['careerReadiness']}")
                else:
                    print(f"⚠️ Warning: Missing keys in report: {missing_keys}")
                    print(json.dumps(report, indent=2))
            else:
                print("❌ 'ai_report' missing from response.")
                print(data)
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_submit_assessment()
