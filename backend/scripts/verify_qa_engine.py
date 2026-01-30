import asyncio
import os
import sys

# Add project root to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.models.schemas import Answer
from app.assessment_logic.qa_engine import IntelligentSession, generate_final_profile

async def test_conflict_detection_and_scoring():
    print("🧪 Starting Q&A Engine Verification...")

    # Case 1: Startup Dream but Zero Capital
    # Expect: Conflict warning + High Dream Path score
    answers_1 = [
        Answer(question_id="q1_edu_status", selected_option_id="college"),
        Answer(question_id="q2_stream_interest", selected_option_id="arts_commerce"),
        Answer(question_id="q_business_mindset", selected_option_id="invest"), # Entrepreneurial Signal
        Answer(question_id="q_risk_appetite", selected_option_id="high_growth"),
        Answer(question_id="q_financial_capacity", selected_option_id="zero_capital"), # CONFLICT
        Answer(question_id="q_learning_attitude", selected_option_id="deep_learning")
    ]

    print("\n--- Test Case 1: Startup vs Zero Capital ---")
    session1 = IntelligentSession("test_user_1", answers_1)
    profile1 = await session1.build_intelligence_profile()
    
    print(f"Top Recommendation: {profile1.top_recommendation}")
    print(f"Conflicts Detected: {len(profile1.conflicts)}")
    for c in profile1.conflicts:
        print(f"  - {c}")
    
    assert "Dream Path" in profile1.top_recommendation or "Growth" in profile1.top_recommendation
    assert any("zero capital" in c.lower() for c in profile1.conflicts)

    # Case 2: High Income but No Training (Greed vs Effort)
    # Expect: Conflict warning
    answers_2 = [
        Answer(question_id="q1_edu_status", selected_option_id="school"),
        Answer(question_id="q_risk_appetite", selected_option_id="high_growth"), # High Risk/Income
        Answer(question_id="q_financial_capacity", selected_option_id="moderate_capital"),
        Answer(question_id="q_learning_attitude", selected_option_id="quick_start") # No Training -> CONFLICT
    ]

    print("\n--- Test Case 2: High Income vs Quick Start ---")
    session2 = IntelligentSession("test_user_2", answers_2)
    profile2 = await session2.build_intelligence_profile()

    print(f"Conflicts Detected: {len(profile2.conflicts)}")
    for c in profile2.conflicts:
        print(f"  - {c}")

    assert any("skill building" in c.lower() for c in profile2.conflicts)

    print("\n✅ Verification Passed!")

if __name__ == "__main__":
    asyncio.run(test_conflict_detection_and_scoring())
