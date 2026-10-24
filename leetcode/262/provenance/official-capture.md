# Official capture (2026-10-24 Asia/Singapore)

Source: https://leetcode.com/problems/trips-and-users/

Observed on the public page: `262. Trips and Users`, difficulty `Hard`; SQL Schema and Pandas Schema tabs; `Trips(id, client_id, driver_id, city_id, status, request_at)` with status enum `completed`, `cancelled_by_driver`, `cancelled_by_client`; `Users(users_id, banned, role)` with banned enum `Yes`, `No`. The rule says both client and driver must not be banned, date range is 2013-10-01 through 2013-10-03, return each day with at least one trip, and round `Cancellation Rate` to two decimals. Sample output is 0.33, 0.00, 0.50 for the three days.

Public submission interface observed at https://leetcode.com/problems/trips-and-users/submissions/?lang=pythondata: `import pandas as pd` followed by `def trips_and_users(trips: pd.DataFrame, users: pd.DataFrame) -> pd.DataFrame:`. This is the canonical Python interface used by this lesson.
