from flask import Flask, render_template, request
import pandas as pd
import os

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['language'] = 'ar'  # Default language

def load_and_clean_data():
    """تحميل وتنظيف بيانات ملف Excel بأداء عالٍ."""
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(current_dir, "Thanaweya2025.xlsx")

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"الملف غير موجود في: {file_path}")

        df = pd.read_excel(file_path)
        required_columns = ['seating_no', 'arabic_name', 'total_degree']
        if not all(col in df.columns for col in required_columns):
            missing_cols = [col for col in required_columns if col not in df.columns]
            raise ValueError(f"أعمدة مفقودة: {missing_cols}")

        df['seating_no'] = df['seating_no'].astype(str).str.strip()
        df['arabic_name'] = df['arabic_name'].astype(str).str.strip()
        df['total_degree'] = pd.to_numeric(df['total_degree'], errors='coerce')
        print(f"تم تحميل البيانات بنجاح من: {file_path}")
        return df
    except Exception as e:
        print(f"خطأ أثناء تحميل البيانات: {e}")
        exit(1)

df = load_and_clean_data()
MAX_TOTAL = 320

@app.route('/', defaults={'language': 'ar'})
@app.route('/<language>')
def index(language):
    """عرض الصفحة الرئيسية بتصميم فاخر."""
    app.config['language'] = language if language in ['ar', 'en'] else 'ar'
    return render_template('index.html', language=app.config['language'])

@app.route('/result/<language>', methods=['POST'])
def result(language):
    """معالجة طلب البحث بأداء متميز."""
    try:
        app.config['language'] = language if language in ['ar', 'en'] else 'ar'
        search_input = request.form.get('searchInput', '').strip()
        if not search_input:
            return render_template('result.html', 
                                 error="يرجى إدخال رقم الجلوس أو الاسم" if app.config['language'] == 'ar' else "Please enter seat number or name", 
                                 language=app.config['language'])

        if search_input.isdigit():
            match = df[df['seating_no'] == search_input.strip()]
        else:
            match = df[df['arabic_name'].str.contains(search_input, case=False, na=False)]
            
        if match.empty:
            return render_template('result.html', 
                                 error="لم يتم العثور على نتيجة" if app.config['language'] == 'ar' else "No result found", 
                                 language=app.config['language'])

        row = match.iloc[0]
        total = float(row['total_degree'])
        percentage = round((total / MAX_TOTAL) * 100, 2)
        return render_template('result.html', 
                             seating_no=row['seating_no'], 
                             name=row['arabic_name'], 
                             total=total, 
                             percentage=percentage, 
                             language=app.config['language'])
    except Exception as e:
        print(f"خطأ أثناء البحث: {e}")
        return render_template('result.html', 
                             error="حدث خطأ أثناء معالجة الطلب" if app.config['language'] == 'ar' else "An error occurred while processing the request", 
                             language=app.config['language'])

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=True)

