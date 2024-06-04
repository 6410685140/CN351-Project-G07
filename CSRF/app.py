from flask import Flask, render_template, request, redirect, url_for, flash, session, abort
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///emails.db'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f'<User {self.email}>'

@app.route('/')
def index():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    users = User.query.all()
    return render_template('index.html', users=users)

@app.route('/update_email', methods=['GET'])
def update_email():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    user_id = session.get('user_id')
    new_email = request.args.get('email')

    if not new_email:
        flash('Email cannot be empty.', 'danger')
        return redirect(url_for('index'))

    user = User.query.get(user_id)

    if not user:
        flash('User not found.', 'danger')
        return redirect(url_for('index'))

    user.email = new_email
    try:
        db.session.commit()
        flash('Email updated successfully!', 'success')
    except:
        db.session.rollback()
        flash('An error occurred while updating the email.', 'danger')

    return redirect(url_for('index'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            flash('Login successful!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Invalid email or password.', 'danger')

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('You have been logged out.', 'success')
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(email=email, password=hashed_password)

        try:
            db.session.add(new_user)
            db.session.commit()
            flash('Registration successful!', 'success')
            return redirect(url_for('login'))
        except:
            db.session.rollback()
            flash('Email already exists.', 'danger')

    return render_template('register.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if User.query.count() == 0:
            sample_user = User(email='sample@example.com', password=generate_password_hash('password', method='pbkdf2:sha256'))
            db.session.add(sample_user)
            db.session.commit()
    app.run(debug=True)
