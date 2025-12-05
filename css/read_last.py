
path = r"c:\Users\Erick D\Desktop\EVORIX\css\styles_restored.css"
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()
    print("".join(lines[-50:]))
