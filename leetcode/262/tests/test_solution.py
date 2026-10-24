import importlib.util
import pandas as pd

spec=importlib.util.spec_from_file_location('solution','leetcode/262/solution.py')
solution=importlib.util.module_from_spec(spec); spec.loader.exec_module(solution)

def oracle(trips, users):
    good={u.users_id for u in users.itertuples() if u.banned=='No'}
    out={}
    for r in trips.itertuples():
        if '2013-10-01'<=r.request_at<='2013-10-03' and r.client_id in good and r.driver_id in good:
            n,d=out.get(r.request_at,(0,0)); out[r.request_at]=(n+(r.status!='completed'),d+1)
    return [{'Day':d,'Cancellation Rate':round(n/den,2)} for d,(n,den) in sorted(out.items())]

def test_sample():
    trips=pd.DataFrame([[1,1,10,1,'completed','2013-10-01'],[2,2,11,1,'cancelled_by_driver','2013-10-01'],[3,3,12,6,'completed','2013-10-01'],[4,4,13,6,'cancelled_by_client','2013-10-01'],[5,1,10,1,'completed','2013-10-02'],[6,2,11,6,'completed','2013-10-02'],[7,3,12,6,'completed','2013-10-02'],[8,2,12,12,'completed','2013-10-03'],[9,3,10,12,'completed','2013-10-03'],[10,4,13,12,'cancelled_by_driver','2013-10-03']],columns=['id','client_id','driver_id','city_id','status','request_at'])
    users=pd.DataFrame([[1,'No','client'],[2,'Yes','client'],[3,'No','client'],[4,'No','client'],[10,'No','driver'],[11,'No','driver'],[12,'No','driver'],[13,'No','driver']],columns=['users_id','banned','role'])
    got=solution.trips_and_users(trips,users).to_dict('records'); assert got==oracle(trips,users); assert got[0]['Cancellation Rate']==.33

def test_driver_ban_and_boundary():
    trips=pd.DataFrame([[1,1,10,1,'cancelled_by_driver','2013-10-01'],[2,1,11,1,'completed','2013-10-03'],[3,1,10,1,'cancelled_by_client','2013-10-04']],columns=['id','client_id','driver_id','city_id','status','request_at'])
    users=pd.DataFrame([[1,'No','client'],[10,'Yes','driver'],[11,'No','driver']],columns=['users_id','banned','role'])
    assert solution.trips_and_users(trips,users).to_dict('records')==[{'Day':'2013-10-03','Cancellation Rate':0.0}]

if __name__=='__main__': test_sample(); test_driver_ban_and_boundary(); print('oracle checks passed')
