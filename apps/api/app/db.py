import os, psycopg2
from contextlib import contextmanager

def get_conn():
    url = os.getenv("DATABASE_URL", "postgresql://mozaik:mozaik@localhost:5432/mozaik")
    return psycopg2.connect(url)

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
