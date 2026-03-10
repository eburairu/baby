"""
Issue #818: FamilyUserのroleカラムに対するEnum型制約の適用

FamilyUser.role が SQLAlchemy Enum 型として定義されていることを確認するテスト。
"""
import pytest
import sqlalchemy as sa
from sqlalchemy import Enum as SAEnum


def test_family_user_role_column_is_enum_type():
    """role カラムが SQLAlchemy Enum 型であることを確認する"""
    from app.models.family import FamilyUser
    from app.models.enums import UserRole

    role_col = FamilyUser.__table__.c.role
    assert isinstance(role_col.type, SAEnum), (
        f"role カラムの型が Enum ではなく {type(role_col.type)} です。"
        "Column(Enum(UserRole), ...) に変更してください。"
    )


def test_family_user_role_enum_values_match_user_role():
    """Enum 型の値が UserRole の値と一致することを確認する"""
    from app.models.family import FamilyUser
    from app.models.enums import UserRole

    role_col = FamilyUser.__table__.c.role
    assert isinstance(role_col.type, SAEnum)

    expected_values = {r.value for r in UserRole}
    actual_values = set(role_col.type.enums)
    assert actual_values == expected_values, (
        f"Enum 値が一致しません。期待値: {expected_values}, 実際: {actual_values}"
    )


def test_family_user_role_enum_name():
    """Enum 型の名前が 'userrole' であることを確認する"""
    from app.models.family import FamilyUser

    role_col = FamilyUser.__table__.c.role
    assert isinstance(role_col.type, SAEnum)
    assert role_col.type.name == "userrole", (
        f"Enum 型名が 'userrole' ではなく '{role_col.type.name}' です。"
    )


def test_family_user_role_column_not_nullable():
    """role カラムが nullable=False であることを確認する"""
    from app.models.family import FamilyUser

    role_col = FamilyUser.__table__.c.role
    assert not role_col.nullable, "role カラムは nullable=False でなければなりません。"
