import urllib.request,json,pathlib,datetime
endpoint='https://leetcode.com/graphql/'
query='query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { questionId title isPaidOnly codeSnippets { lang langSlug code } } }'
payload={'query':query,'variables':{'titleSlug':'human-traffic-of-stadium'}}
request=urllib.request.Request(endpoint,data=json.dumps(payload).encode(),headers={'Content-Type':'application/json','Referer':'https://leetcode.com/problems/human-traffic-of-stadium/','User-Agent':'Mozilla/5.0'},method='POST')
out=pathlib.Path('/tmp/leetcode-601-official-interface-20261025.json')
with urllib.request.urlopen(request,timeout=30) as response:
 data=json.load(response);status=response.status
record={'accessedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'officialUrl':'https://leetcode.com/problems/human-traffic-of-stadium/','endpoint':endpoint,'method':'POST','request':payload,'httpStatus':status,'response':data}
out.write_text(json.dumps(record,indent=2)+'\n')
q=data['data']['question'];assert q['questionId']=='601' and q['isPaidOnly'] is False
pandas=[x for x in q['codeSnippets'] if x['lang']=='Pandas' and x['langSlug']=='pythondata'];assert len(pandas)==1
print(json.dumps({'httpStatus':status,'title':q['title'],'isPaidOnly':q['isPaidOnly'],'pandas':pandas[0],'saved':str(out)}))
