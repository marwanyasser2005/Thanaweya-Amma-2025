from flask import Flask, render_template, request, redirect, url_for
import pandas as pd
import os
from typing import Optional, Dict, Any

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['language'] = 'ar'  # Default language
app.config['MAX_TOTAL'] = 320  # Move constant to config for easier modification

def load_and_clean_data() -> Optional[pd.DataFrame]:
    """تحميل وتنظيف بيانات ملف Excel بأداء عالٍ."""
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(current_dir, "Thanaweya2025.xlsx")

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"الملف غير موجود في: {file_path}")

        df = pd.read_excel(file_path, engine='openpyxl')  # Specify engine for better compatibility
        required_columns = ['seating_no', 'arabic_name', 'total_degree']
        if not all(col in df.columns for col in required_columns):
            missing_cols = [col for col in required_columns if col not in df.columns]
            raise ValueError(f"أعمدة مفقودة: {missing_cols}")

        # Clean and convert data types
        df['seating_no'] = df['seating_no'].astype(str).str.strip()
        df['arabic_name'] = df['arabic_name'].astype(str).str.strip()
        df['total_degree'] = pd.to_numeric(df['total_degree'], errors='coerce').fillna(0)  # Handle NaN with 0
        print(f"تم تحميل البيانات بنجاح من: {file_path}")
        return df
    except Exception as e:
        print(f"خطأ أثناء تحميل البيانات: {e}")
        return None

# Load data globally, retry if failed
df = load_and_clean_data()
if df is None:
    raise RuntimeError("فشل تحميل البيانات. تحقق من الملف وأعد تشغيل التطبيق.")

@app.route('/', defaults={'language': 'ar'})
@app.route('/<language>')
def index(language: str) -> str:
    """عرض الصفحة الرئيسية بتصميم فاخر."""
    app.config['language'] = language if language in ['ar', 'en'] else 'ar'
    return render_template('index.html', language=app.config['language'])

@app.route('/result/<language>', methods=['POST'])
def result(language: str) -> str:
    """معالجة طلب البحث بأداء متميز."""
    try:
        app.config['language'] = language if language in ['ar', 'en'] else 'ar'
        search_input = request.form.get('searchInput', '').strip()
        if not search_input:
            return render_template('result.html', 
                                 error="يرجى إدخال رقم الجلوس أو الاسم" if app.config['language'] == 'ar' else "Please enter seat number or name", 
                                 language=app.config['language'])

        if search_input.isdigit():
            # Search by seating number - return single result
            match = df[df['seating_no'] == search_input]
            if match.empty:
                return render_template('result.html', 
                                     error="لم يتم العثور على نتيجة" if app.config['language'] == 'ar' else "No result found", 
                                     language=app.config['language'])
            
            row = match.iloc[0]
            return redirect(url_for('student_details', language=language, seating_no=row['seating_no']))
        else:
            # Search by name - return list of results
            match = df[df['arabic_name'].str.contains(search_input, case=False, na=False)]
            if match.empty:
                return render_template('result.html', 
                                     error="لم يتم العثور على نتيجة" if app.config['language'] == 'ar' else "No result found", 
                                     language=app.config['language'])
            
            results = []
            for _, row in match.iterrows():
                total = float(row['total_degree'])
                percentage = round((total / app.config['MAX_TOTAL']) * 100, 2)
                results.append({
                    'seating_no': row['seating_no'],
                    'name': row['arabic_name'],
                    'total': total,
                    'percentage': percentage
                })
            
            return render_template('result.html', 
                                 results=results,
                                 search_term=search_input,
                                 language=app.config['language'])
            
    except Exception as e:
        print(f"خطأ أثناء البحث: {e}")
        return render_template('result.html', 
                             error="حدث خطأ أثناء معالجة الطلب" if app.config['language'] == 'ar' else "An error occurred while processing the request", 
                             language=app.config['language'])

@app.route('/student/<language>/<seating_no>')
def student_details(language: str, seating_no: str) -> str:
    """عرض تفاصيل طالب واحد."""
    try:
        app.config['language'] = language if language in ['ar', 'en'] else 'ar'
        
        # Search for student by seating number
        match = df[df['seating_no'] == seating_no.strip()]
        
        if match.empty:
            return render_template('student_details.html', 
                                 error="لم يتم العثور على نتيجة" if app.config['language'] == 'ar' else "No result found", 
                                 language=app.config['language'])
        
        row = match.iloc[0]
        total = float(row['total_degree'])
        percentage = round((total / app.config['MAX_TOTAL']) * 100, 2)
        
        # Determine grade and color
        if percentage >= 85:
            grade = "ممتاز" if app.config['language'] == 'ar' else "Excellent"
            grade_color = "success"
        elif percentage >= 75:
            grade = "جيد جداً" if app.config['language'] == 'ar' else "Very Good"
            grade_color = "info"
        elif percentage >= 65:
            grade = "جيد" if app.config['language'] == 'ar' else "Good"
            grade_color = "warning"
        elif percentage >= 50:
            grade = "مقبول" if app.config['language'] == 'ar' else "Pass"
            grade_color = "secondary"
        else:
            grade = "ضعيف" if app.config['language'] == 'ar' else "Fail"
            grade_color = "error"
        
        student_data = {
            'seating_no': row['seating_no'],
            'name': row['arabic_name'],
            'total': total,
            'percentage': percentage,
            'grade': grade,
            'grade_color': grade_color,
            'max_total': app.config['MAX_TOTAL']
        }
        
        return render_template('student_details.html', 
                             student=student_data,
                             language=app.config['language'])
                             
    except Exception as e:
        print(f"خطأ أثناء عرض تفاصيل الطالب: {e}")
        return render_template('student_details.html', 
                             error="حدث خطأ أثناء معالجة الطلب" if app.config['language'] == 'ar' else "An error occurred while processing the request", 
                             language=app.config['language'])

@app.route('/toggle-language/<current_language>')
def toggle_language(current_language: str) -> str:
    """تبديل اللغة والعودة للصفحة الرئيسية."""
    new_language = 'en' if current_language == 'ar' else 'ar'
    return redirect(url_for('index', language=new_language))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=True)