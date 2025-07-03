# הוראות פרסום ל-GitHub Pages

## צעדים לפרסום:

### 1. צור ריפוזיטורי חדש ב-GitHub
1. לך ל-GitHub.com
2. לחץ על "New repository"
3. בחר שם: `radon-transform-simulator`
4. וודא שהריפו הוא Public
5. אל תסמן "Add a README file" (כי יש לנו כבר)

### 2. העלה את הקבצים
```bash
# נווט לתיקיית הפרויקט
cd "c:\Users\avivs\OneDrive - Technion\Projects\radon simulator"

# אתחל git repository
git init

# הוסף את כל הקבצים
git add .

# עשה commit ראשון
git commit -m "Initial commit: Radon Transform Simulator"

# הוסף את הקישור לריפו החדש שלך (החלף your-username בשם המשתמש שלך)
git remote add origin https://github.com/your-username/radon-transform-simulator.git

# העלה לענף main
git branch -M main
git push -u origin main
```

### 3. הפעל GitHub Pages
1. לך לריפוזיטורי שלך ב-GitHub
2. לחץ על "Settings"
3. גלול למטה ל-"Pages"
4. תחת "Source" בחר "GitHub Actions"
5. השאר את שאר ההגדרות כברירת מחדל

### 4. חכה לדפלוי
- ה-GitHub Actions ירוץ אוטומטית
- אחרי כמה דקות הסימולציה תהיה זמינה ב:
  `https://your-username.github.io/radon-transform-simulator/`

### 5. עדכן את הקישור ב-README
עדכן את השורה ב-README.md:
```
**[לחץ כאן לניסוי הסימולציה](https://your-username.github.io/radon-transform-simulator/)**
```

## הערות חשובות:
- החלף `your-username` בשם המשתמש שלך ב-GitHub
- וודא שהריפו הוא Public כדי שה-GitHub Pages יעבוד
- אם יש בעיות, בדוק את לשונית "Actions" בריפו לראות לוגים
