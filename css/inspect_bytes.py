
path = r"c:\Users\Erick D\Desktop\EVORIX\css\styles.css.bak"
offset = 21198

with open(path, 'rb') as f:
    f.seek(offset - 20)
    data = f.read(100)
    
print(data)
print(data.hex())
