import sys
import json
sys.path.append(r"c:\Users\karti\OneDrive\Documents\AlignNova")

from backend.main import check_student_eligibility, extract_gpas_and_percentages

def test_extract_education():
    education_data = [
        {"institution": "School A", "degree": "Class 10th", "board": "CBSE", "timeline": "2018", "detail": "92.50%"},
        {"institution": "School B", "degree": "Class 12th", "board": "CBSE", "timeline": "2020", "detail": "88.40"},
        {"institution": "College C", "degree": "B.Tech. - CSE", "timeline": "2020-2024", "detail": "8.50 CGPA"}
    ]
    edu_str = json.dumps(education_data)
    info = extract_gpas_and_percentages(edu_str)
    print("Extracted Education Info:", info)
    assert info["percent_10"] == 92.50
    assert info["percent_12"] == 88.40
    assert info["cgpa"] == 8.50
    print("test_extract_education PASSED")

def test_eligibility():
    student = {
        "role": "student",
        "course": "B.Tech. - CSE - Software Product Engineering",
        "education": json.dumps([
            {"institution": "School A", "degree": "Class 10th", "detail": "92.5"},
            {"institution": "School B", "degree": "Class 12th", "detail": "88.4"},
            {"institution": "College C", "degree": "B.Tech.", "detail": "8.5"}
        ]),
        "uni_performance": json.dumps({
            "aggregate_cgpa": "8.41",
            "semesters": [
                {"year": "1", "sem": "I", "live_backlogs": "0"},
                {"year": "1", "sem": "II", "live_backlogs": "0"}
            ]
        })
    }

    drive = {
        "eligibility": "8.0",
        "min_10th_percent": "80",
        "min_12th_percent": "80",
        "no_active_backlogs": 1,
        "eligible_courses": "B.Tech. - CSE - Software Product Engineering\nB.Tech. - Information Technology"
    }

    is_eligible, reason = check_student_eligibility(student, drive)
    print(f"Eligibility result: {is_eligible}, Reason: {reason}")
    assert is_eligible is True, f"Failed: {reason}"

    # Test CGPA restriction
    drive["eligibility"] = "8.8"
    is_eligible, reason = check_student_eligibility(student, drive)
    print(f"CGPA restricted result: {is_eligible}, Reason: {reason}")
    assert is_eligible is False

    # Test 10th percentage restriction
    drive["eligibility"] = "8.0"
    drive["min_10th_percent"] = "95"
    is_eligible, reason = check_student_eligibility(student, drive)
    print(f"10th restricted result: {is_eligible}, Reason: {reason}")
    assert is_eligible is False

    # Test active backlog restriction
    drive["min_10th_percent"] = "80"
    student["uni_performance"] = json.dumps({
        "aggregate_cgpa": "8.41",
        "semesters": [
            {"year": "1", "sem": "I", "live_backlogs": "1"},
            {"year": "1", "sem": "II", "live_backlogs": "0"}
        ]
    })
    is_eligible, reason = check_student_eligibility(student, drive)
    print(f"Backlog restricted result: {is_eligible}, Reason: {reason}")
    assert is_eligible is False

    print("test_eligibility PASSED")

if __name__ == "__main__":
    test_extract_education()
    test_eligibility()
