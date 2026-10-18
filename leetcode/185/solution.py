import pandas as pd


def top_three_salaries(employee: pd.DataFrame, department: pd.DataFrame) -> pd.DataFrame:
    ranks = employee.groupby("departmentId")["salary"].rank(
        method="dense", ascending=False
    )
    high = employee.loc[ranks.le(3), ["name", "salary", "departmentId"]]
    joined = high.merge(department, left_on="departmentId", right_on="id",
                        suffixes=("_employee", "_department"))
    return joined.rename(columns={
        "name_department": "Department",
        "name_employee": "Employee",
        "salary": "Salary",
    })[["Department", "Employee", "Salary"]]
