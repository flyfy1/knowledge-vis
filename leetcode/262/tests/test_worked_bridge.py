"""Execute the taught intermediate tables and a fresh case in actual Pandas."""
import runpy
import random
import pandas as pd
from pandas.testing import assert_frame_equal

solve = runpy.run_path('leetcode/262/solution.py')['trips_and_users']
oracle = runpy.run_path('leetcode/262/tests/test_solution.py')['oracle']
cols = ['id','client_id','driver_id','city_id','status','request_at']
users = pd.DataFrame([[i, 'Yes' if i == 2 else 'No', 'client' if i < 10 else 'driver']
                      for i in [1,2,3,4,10,11,12,13]], columns=['users_id','banned','role'])
trips = pd.DataFrame([[1,1,10,1,'completed','2013-10-01'],
                      [2,2,11,1,'cancelled_by_driver','2013-10-01'],
                      [3,3,12,6,'completed','2013-10-01'],
                      [4,4,13,6,'cancelled_by_client','2013-10-01']], columns=cols)
active = users.loc[users['banned'] == 'No', ['users_id']]
assert active.users_id.tolist() == [1,3,4,10,11,12,13]
client = trips.merge(active.rename(columns={'users_id':'client_id'}), on='client_id')
assert client.id.tolist() == [1,3,4]
driver = client.merge(active.rename(columns={'users_id':'driver_id'}), on='driver_id')
assert driver.id.tolist() == [1,3,4]
assert driver.status.ne('completed').astype(int).tolist() == [0,0,1]
assert solve(trips,users).to_dict('records') == [{'Day':'2013-10-01','Cancellation Rate':0.33}]
banned_driver = users.copy()
banned_driver.loc[banned_driver.users_id == 13, 'banned'] = 'Yes'
assert solve(trips,banned_driver).to_dict('records') == [{'Day':'2013-10-01','Cancellation Rate':0.0}]
# Independently counted fresh transfer: 2 eligible requests, 1 cancellation; other days absent.
u = pd.DataFrame([[7,'No','client'],[70,'No','driver'],[71,'Yes','driver']],columns=users.columns)
t = pd.DataFrame([[1,7,70,1,'completed','2013-10-01'],[2,7,70,1,'cancelled_by_client','2013-10-01'],
                  [3,7,71,1,'cancelled_by_driver','2013-10-02'],[4,7,70,1,'cancelled_by_client','2013-09-30']],columns=cols)
assert solve(t,u).to_dict('records') == [{'Day':'2013-10-01','Cancellation Rate':0.5}]
rng = random.Random(262)
for _ in range(150):
    t = pd.DataFrame([[i,rng.choice([1,2,3,4]),rng.choice([10,11,12,13]),1,
                       rng.choice(['completed','cancelled_by_client','cancelled_by_driver']),
                       rng.choice(['2013-09-30','2013-10-01','2013-10-02','2013-10-03','2013-10-04'])]
                      for i in range(rng.randrange(31))],columns=cols)
    u = users.copy()
    u['banned'] = [rng.choice(['Yes','No']) for _ in range(len(u))]
    old_t, old_u = t.copy(deep=True), u.copy(deep=True)
    got = solve(t,u).sort_values('Day').to_dict('records')
    assert got == oracle(t,u)
    assert_frame_equal(t,old_t)
    assert_frame_equal(u,old_u)
print('worked active/client/driver/cancelled tables, banned-driver counterexample, fresh transfer, 150 seeded oracle cases and input nonmutation passed; pandas=' + pd.__version__)
