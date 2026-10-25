import pandas as pd


def human_traffic(stadium: pd.DataFrame) -> pd.DataFrame:
    eligible = set(stadium.loc[stadium["people"] >= 100, "id"])
    marked = set()
    for s in eligible:
        if s + 1 in eligible and s + 2 in eligible:
            marked.update((s, s + 1, s + 2))

    mask = (stadium["people"] >= 100) & stadium["id"].isin(marked)
    return stadium.loc[mask, ["id", "visit_date", "people"]].sort_values("visit_date")
