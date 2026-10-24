ONES=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen']
TENS=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']
def chunk(v):
    out=[]
    if v//100: out += [ONES[v//100],'Hundred']; v%=100
    if v>=20: out.append(TENS[v//10]); v%=10
    if v: out.append(ONES[v])
    return ' '.join(out)
def oracle(n):
    if n==0:return 'Zero'
    names=['','Thousand','Million','Billion']; out=[]; i=0
    while n:
      n,r=divmod(n,1000)
      if r: out.append((chunk(r)+' '+names[i]).strip())
      i+=1
    return ' '.join(reversed(out))
