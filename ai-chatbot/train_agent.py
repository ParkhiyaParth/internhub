import logging

from vanna_setup import vn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DDL_STATEMENTS = [
    """
        CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TIMESTAMP
    );
    """,
    """
        CREATE TABLE departments (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
            description TEXT,
            head_user_id INTEGER REFERENCES users(id),
            created_at TIMESTAMP
    );
    """,
    """
        CREATE TABLE interns (
      id SERIAL PRIMARY KEY,
            user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
            department_id INTEGER REFERENCES departments(id),
            mentor_id INTEGER REFERENCES users(id),
            status TEXT,
            start_date DATE,
            end_date DATE,
      college TEXT,
            position_title TEXT,
            created_at TIMESTAMP,
            cgpa NUMERIC,
            city TEXT,
            skills TEXT,
            languages TEXT,
            experience_level TEXT
        );
        """,
        """
        CREATE TABLE tasks (
            id SERIAL PRIMARY KEY,
            intern_id INTEGER REFERENCES interns(id),
            assigned_by INTEGER REFERENCES users(id),
            title TEXT,
            description TEXT,
            status TEXT,
            priority TEXT,
            due_date DATE,
            created_at TIMESTAMP
        );
        """,
        """
        CREATE TABLE evaluations (
            intern_id INTEGER REFERENCES interns(id),
            evaluator_id INTEGER REFERENCES users(id),
            period TEXT,
            technical_skill_score NUMERIC,
            problem_solving_score NUMERIC,
            communication_score NUMERIC,
            teamwork_score NUMERIC,
            initiative_score NUMERIC,
            time_management_score NUMERIC,
            learning_ability_score NUMERIC,
            ownership_score NUMERIC,
            overall_score NUMERIC,
            strengths TEXT,
            improvement_areas TEXT,
            mentor_feedback TEXT
        );
        """,
        """
        CREATE TABLE attendance (
            id SERIAL PRIMARY KEY,
            intern_id INTEGER REFERENCES interns(id),
            date DATE,
            check_in TIMESTAMP,
            check_out TIMESTAMP,
            status TEXT,
            notes TEXT
        );
        """,
        """
        CREATE TABLE announcements (
            id SERIAL PRIMARY KEY,
            created_by INTEGER REFERENCES users(id),
            title TEXT,
            body TEXT,
            audience TEXT,
            created_at TIMESTAMP
        );
        """,
        """
        CREATE TABLE intern_feedback (
            id SERIAL PRIMARY KEY,
            intern_id INTEGER REFERENCES interns(id),
            given_by INTEGER REFERENCES users(id),
            type TEXT,
            message TEXT,
            created_at TIMESTAMP
        );
        """,
        """
        CREATE TABLE documents (
            id SERIAL PRIMARY KEY,
            intern_id INTEGER REFERENCES interns(id),
            type TEXT,
            file_url TEXT,
            uploaded_at TIMESTAMP
    );
    """,
]

DOCUMENTATION = [
    """
        InternHub has users, interns, departments, attendance, tasks, evaluations, feedback, announcements, and documents.
        The interns table includes cgpa, skills, city, languages, and experience_level fields.
    """,
    """
        Prefer read-only SELECT SQL.
        For analytics questions, use joins between interns, users, departments, tasks, attendance, and evaluations.
    """,
]

GOLDEN_QUERIES = [
    {
        "question": "How many interns are in each department?",
        "sql": """
            SELECT d.name AS department_name, COUNT(*) AS intern_count
                        FROM interns i
                        JOIN departments d ON d.id = i.department_id
            GROUP BY d.name
            ORDER BY intern_count DESC;
        """,
    },
    {
                "question": "How many interns have CGPA above 7.5?",
        "sql": """
                        SELECT COUNT(*) AS intern_count
                        FROM interns
                        WHERE cgpa > 7.5;
        """,
    },
    {
                "question": "List interns with mentor and department",
        "sql": """
                        SELECT iu.name AS intern_name,
                                     mu.name AS mentor_name,
                                     d.name AS department_name,
                                     i.skills,
                                     i.cgpa
                        FROM interns i
                        JOIN users iu ON iu.id = i.user_id
                        LEFT JOIN users mu ON mu.id = i.mentor_id
                        LEFT JOIN departments d ON d.id = i.department_id
                        ORDER BY iu.name;
                """,
        },
        {
                "question": "What is the average overall score by department?",
                "sql": """
                        SELECT d.name AS department_name,
                                     ROUND(AVG(e.overall_score), 2) AS avg_overall_score
                        FROM evaluations e
                        JOIN interns i ON i.id = e.intern_id
                        JOIN departments d ON d.id = i.department_id
                        GROUP BY d.name
                        ORDER BY avg_overall_score DESC;
        """,
    },
]


def run_training():
    logger.info("Starting training for InternHub AI")

    for ddl in DDL_STATEMENTS:
        vn.train(ddl=ddl)

    for doc in DOCUMENTATION:
        vn.train(documentation=doc)

    for pair in GOLDEN_QUERIES:
        vn.train(question=pair["question"], sql=pair["sql"])

    logger.info("Training complete")


if __name__ == "__main__":
    run_training()
