from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sqlite3

app = Flask(__name__, static_folder="../frontend", template_folder="../frontend")
CORS(app)  # Enable CORS for all routes

# Home route - serving the index.html
@app.route("/")
def home():
    return send_from_directory("templates", "index.html")

# Search route - searching PDFs in the database
@app.route("/search", methods=["GET"])
def search():
    keyword = request.args.get("keyword")
    if not keyword:
        return jsonify({"error": "Keyword is required"}), 400

    try:
        # Resolve database path
        db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "database", "pdf_index.db"))
        print(f"Database path: {db_path}")

        # Check if the database file exists
        if not os.path.exists(db_path):
            return jsonify({"error": "Database file not found"}), 500

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Execute search query to find the keyword in the content column
        query = "SELECT filename, content FROM pdf_index WHERE content LIKE ?"
        cursor.execute(query, (f"%{keyword}%",))
        results = cursor.fetchall()

        # Check if results were found
        if not results:
            return jsonify({"error": "No results found for the given keyword"}), 404

        conn.close()

        # Format the results into a response
        response = [{"filename": row[0], "snippet": row[1][:200]} for row in results]
        return jsonify({"results": response})

    except sqlite3.Error as db_error:
        print(f"Database error: {db_error}")
        return jsonify({"error": "A database error occurred"}), 500
    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

# Serve PDFs - ensure PDF files are served from the 'pdfs' directory
@app.route("/pdfs/<path:filename>", methods=["GET"])
def serve_pdf(filename):
    pdfs_path = os.path.join(os.path.dirname(__file__), "../backend/pdfs")
    try:
        return send_from_directory(pdfs_path, filename, as_attachment=False, mimetype='application/pdf')
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
