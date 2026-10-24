import pandas as pd


def trips_and_users(trips: pd.DataFrame, users: pd.DataFrame) -> pd.DataFrame:
    """Return daily cancellation rates for trips with two unbanned endpoints."""
    active = users.loc[users["banned"] == "No", ["users_id"]]
    eligible = trips.merge(active.rename(columns={"users_id": "client_id"}), on="client_id")
    eligible = eligible.merge(active.rename(columns={"users_id": "driver_id"}), on="driver_id")
    window = eligible.loc[
        eligible["request_at"].between("2013-10-01", "2013-10-03")
    ].copy()
    window["cancelled"] = window["status"].ne("completed").astype(int)
    result = (
        window.groupby("request_at", as_index=False)["cancelled"]
        .agg(["sum", "count"])
        .rename(columns={"sum": "cancelled", "count": "requests"})
    )
    result["Cancellation Rate"] = (result["cancelled"] / result["requests"]).round(2)
    return result.rename(columns={"request_at": "Day"})[["Day", "Cancellation Rate"]]
