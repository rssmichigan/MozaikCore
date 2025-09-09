import os, psycopg2
from contextlib import contextmanager
from pgvector.psycopg2 import register_vector

def get_conn():
    url = os.getenv("DATABASE_URL", "postgresql://mozaik:mozaik@localhost:5432/mozaik")
    conn = psycopg2.connect(url)
    register_vector(conn)
    return conn

@contextmanager
def conn_cursor():
    conn = get_conn()
    try:
        yield conn, conn.cursor()
        conn.commit()
    except:
        conn.rollback()
        raise
    finally:
        conn.close()
