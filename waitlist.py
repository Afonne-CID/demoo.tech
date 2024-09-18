from flask import Flask, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import json
import os
from threading import Lock
import re
from email_validator import validate_email, EmailNotValidError
import dns.resolver
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)

# Initialize rate limiter with per-user limits
limiter = Limiter(
    key_func=lambda: normalize_email(request.json.get('email') or request.json.get('email_address')),
    app=app,
    default_limits=["100 per day"],
    storage_uri="memory://"
)

WAITLIST_FILE = '/home/demoo/demootech/waitlist.json'
waitlist = set()
waitlist_lock = Lock()

EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Our Waitlist</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #4a4a4a;">Welcome to Our Waitlist, {first_name}!</h1>
        <p>We're thrilled to have you join our exclusive waitlist. You're now one step closer to experiencing our innovative product/service.</p>
        <p>Here's what you can expect:</p>
        <ul>
            <li>Regular updates on our progress</li>
            <li>Exclusive sneak peeks</li>
            <li>Early access when we launch</li>
        </ul>
        <p>Stay tuned for more information. We can't wait to share our exciting journey with you!</p>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Best regards,<br>The [Your Company Name] Team</p>
    </div>
</body>
</html>
"""

# Email configuration
SMTP_SERVER = "your_smtp_server.com"
SMTP_PORT = 587
SMTP_USERNAME = "your_username"
SMTP_PASSWORD = "your_password"
SENDER_EMAIL = "your_sender_email@example.com"

def load_waitlist():
    global waitlist
    if os.path.exists(WAITLIST_FILE):
        with open(WAITLIST_FILE, 'r') as f:
            waitlist = set(json.load(f))

def save_waitlist():
    with open(WAITLIST_FILE, 'w') as f:
        json.dump(list(waitlist), f)

load_waitlist()

def normalize_email(email):
    """Normalize the email address."""
    email = email.lower().strip()
    local_part, domain = email.split('@')
    local_part = local_part.split('+')[0]  # Remove everything after '+'
    local_part = re.sub(r'\.', '', local_part)  # Remove all dots
    return f"{local_part}@{domain}"

def is_valid_email(email):
    """Validate email structure and check if the domain has MX records."""
    try:
        # Validate email structure
        valid = validate_email(email)
        email = valid.email

        # Check if domain has MX records
        domain = email.split('@')[1]
        dns.resolver.resolve(domain, 'MX')
        return True
    except (EmailNotValidError, dns.resolver.NoAnswer, dns.resolver.NXDOMAIN):
        return False

def is_duplicate(email):
    with waitlist_lock:
        return email in waitlist

def add_email(email):
    with waitlist_lock:
        waitlist.add(email)
        save_waitlist()

def send_welcome_email(email):
    first_name = email.split('@')[0]
    
    message = MIMEMultipart()
    message["From"] = SENDER_EMAIL
    message["To"] = email
    message["Subject"] = "Welcome to Our Waitlist!"

    # Use the email template (defined in a separate artifact)
    body = EMAIL_TEMPLATE.format(first_name=first_name)
    message.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SENDER_EMAIL, email, message.as_string())
        return True
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Hi!"}), 200

@app.route('/', methods=['POST'])
@limiter.limit("3 per minute")
def add_to_waitlist():
    data = request.json
    email = data.get('email') or data.get('email_address')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400

    try:
        normalized_email = normalize_email(email)
        
        if not is_valid_email(normalized_email):
            return jsonify({"error": "Invalid email address"}), 400
        
        if is_duplicate(normalized_email):
            return jsonify({"error": "Email already exists in waitlist"}), 409

        add_email(normalized_email)
        return jsonify({"message": "Successfully added to waitlist!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    # try:
    #     if send_welcome_email(normalized_email):
    #         return jsonify({"message": "Successfully added to waitlist and welcome email sent"}), 200
    #     else:
    #         return jsonify({"message": "Successfully added to waitlist, but failed to send welcome email"}), 200
    # except Exception as e:
    #     return jsonify({"error": str(e)}), 500

@app.route('/waitlist', methods=['POST'])
@limiter.limit("3 per minute")
def add_to_waitlist_alternate():
    return add_to_waitlist()
