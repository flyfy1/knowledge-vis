"""Read only the already-dispatched handoff; never load or execute the operator."""
from pathlib import Path
import json,hashlib,base64,datetime
state=Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
owner='995-copy-repair-20261026-9d027af3'
directory=state/(owner+'-dispatch')
dispatch_raw=(directory/'dispatch.json').read_bytes();dispatch=json.loads(dispatch_raw)
args=dispatch['args'];pins_path=Path(args[args.index('--pins')+1]);pins_raw=pins_path.read_bytes()
operator_path=Path(args[2]);operator_sha=hashlib.sha256(operator_path.read_bytes()).hexdigest();pins_sha=hashlib.sha256(pins_raw).hexdigest()
assert operator_sha==dispatch['sha256']['operate.py']=='2cc99b2622895aaf3dc87c83131dfb4ab2b70e123a424845409dd428788fe280'
assert pins_sha==dispatch['sha256']['pins.json']=='b8daf2ba46ff675f5cc14f6ddca7e1816d14348b3438b228f13c4e6fa60ff93c'
assert dispatch['pid']==1857482
receipt_raw=(state/(owner+'.json')).read_bytes();receipt=json.loads(receipt_raw)
print(json.dumps({'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'operatorAlive':Path('/proc/1857482').exists(),'receipt':receipt,'receiptSha256':hashlib.sha256(receipt_raw).hexdigest(),'receiptRawBase64':base64.b64encode(receipt_raw).decode(),'dispatch':dispatch,'dispatchRawBase64':base64.b64encode(dispatch_raw).decode(),'externalPinsPath':str(pins_path),'externalPinsSha256':pins_sha,'externalOperatorSha256':operator_sha,'readOnly':True},indent=2))
