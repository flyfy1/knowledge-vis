# Converts the NY Fed ACM workbook (ACMTermPremium.xls) to two CSVs for tools/make-data.cjs.
# Usage: python3 -I tools/acm-xls-to-csv.py <raw-dir>   (needs xlrd; reads <raw-dir>/ACM.xls)
import csv, sys, os, xlrd
raw = sys.argv[1]
b = xlrd.open_workbook(os.path.join(raw, 'ACM.xls'))
for sheet, name in (('ACM Monthly', 'acm_monthly.csv'), ('ACM Daily', 'acm_daily.csv')):
    s = b.sheet_by_name(sheet)
    with open(os.path.join(raw, name), 'w', newline='') as f:
        w = csv.writer(f)
        for r in range(s.nrows): w.writerow(s.row_values(r))
