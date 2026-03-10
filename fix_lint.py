import os

file_path = 'frontend/components/feeding/feeding-form.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# 依存配列に lastMilkAmount を追加
dep_array_old = '[activeTab, babyId, bottleContentType, feedingCompletion, form, onAdd, onUpdate, isEditing, initialData, resetAllTimers, onSuccess]'
dep_array_new = '[activeTab, babyId, bottleContentType, feedingCompletion, form, onAdd, onUpdate, isEditing, initialData, resetAllTimers, onSuccess, lastMilkAmount]'

if dep_array_old in content:
    content = content.replace(dep_array_old, dep_array_new)
else:
    print("WARNING: Dependency array not found exactly.")
    # 見つからない場合はもっと短い文字列で探すか、手動で確認が必要

# 不要な eslint-disable を削除
content = content.replace('    // eslint-disable-next-line react-hooks/refs\n', '')

with open(file_path, 'w') as f:
    f.write(content)

print("Fixed lint errors.")
