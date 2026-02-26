from datetime import date, timedelta
from typing import List, Dict, Any
from app.models.vaccination import Vaccination, VaccinationStatus
from sqlalchemy.orm import Session

def calculate_scheduled_date(birthday: date, months: int, days: int = 0) -> date:
    # Basic calculation for demonstration. 
    # Real Japanese vaccination logic can be more complex (e.g., 27 days after previous dose)
    # For now, we use a simple month-based calculation.
    year = birthday.year + (birthday.month + months - 1) // 12
    month = (birthday.month + months - 1) % 12 + 1
    # Handle day overflow (e.g., Jan 31 + 1 month -> Feb 31 is invalid)
    try:
        base_date = date(year, month, birthday.day)
    except ValueError:
        # Fallback to last day of the month
        if month == 12:
            base_date = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            base_date = date(year, month + 1, 1) - timedelta(days=1)
    
    return base_date + timedelta(days=days)

class VaccinationService:
    @staticmethod
    def get_standard_schedule(birthday: date) -> List[Dict[str, Any]]:
        """日本の標準的な予防接種スケジュールを生成する"""
        schedule = []
        
        # ロタウイルス (生後6週〜)
        schedule.append({"vaccine_name": "ロタウイルス", "dose_number": 1, "scheduled_date": calculate_scheduled_date(birthday, 1, 14)})
        schedule.append({"vaccine_name": "ロタウイルス", "dose_number": 2, "scheduled_date": calculate_scheduled_date(birthday, 2, 14)})
        
        # ヒブ / 肺炎球菌 / B型肝炎 / 5種混合 (生後2ヶ月〜)
        for name in ["ヒブ", "小児用肺炎球菌", "B型肝炎", "5種混合"]:
            schedule.append({"vaccine_name": name, "dose_number": 1, "scheduled_date": calculate_scheduled_date(birthday, 2)})
            schedule.append({"vaccine_name": name, "dose_number": 2, "scheduled_date": calculate_scheduled_date(birthday, 3)})
            schedule.append({"vaccine_name": name, "dose_number": 3, "scheduled_date": calculate_scheduled_date(birthday, 4)})
        
        # BCG (生後5ヶ月〜)
        schedule.append({"vaccine_name": "BCG", "dose_number": 1, "scheduled_date": calculate_scheduled_date(birthday, 5)})
        
        # MR / 水痘 / おたふく (1歳〜)
        schedule.append({"vaccine_name": "MR (麻疹・風疹)", "dose_number": 1, "scheduled_date": calculate_scheduled_date(birthday, 12)})
        schedule.append({"vaccine_name": "水痘", "dose_number": 1, "scheduled_date": calculate_scheduled_date(birthday, 12)})
        schedule.append({"vaccine_name": "おたふくかぜ", "dose_number": 1, "scheduled_date": calculate_scheduled_date(birthday, 12)})
        
        return schedule

    @staticmethod
    def generate_for_baby(db: Session, baby_id: int, user_id: int, birthday: date):
        """指定した赤ちゃんのスケジュールを一括生成してDBに保存する"""
        standard_list = VaccinationService.get_standard_schedule(birthday)
        
        new_records = []
        for item in standard_list:
            record = Vaccination(
                baby_id=baby_id,
                user_id=user_id,
                vaccine_name=item["vaccine_name"],
                dose_number=item["dose_number"],
                scheduled_date=item["scheduled_date"],
                status=VaccinationStatus.SCHEDULED
            )
            db.add(record)
            new_records.append(record)
        
        db.commit()
        return new_records
