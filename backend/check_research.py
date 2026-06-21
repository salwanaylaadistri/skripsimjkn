import sqlite3
conn = sqlite3.connect('data/jkn.db')

cols = conn.execute('PRAGMA table_info(research_logs)').fetchall()
print('Kolom research_logs:')
for c in cols:
    print(' ', c[1], '(' + c[2] + ')')

total  = conn.execute('SELECT COUNT(*) FROM research_logs').fetchone()[0]
pemula = conn.execute("SELECT COUNT(*) FROM research_logs WHERE label='pemula'").fetchone()[0]
mahir  = conn.execute("SELECT COUNT(*) FROM research_logs WHERE label='mahir'").fetchone()[0]
print('Total:', total, '| pemula:', pemula, '| mahir:', mahir)
conn.close()
